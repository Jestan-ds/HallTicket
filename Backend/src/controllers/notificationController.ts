import { Request, Response } from "express";
import { db } from "../db/index";
// Import necessary schemas (ensure they are imported from your schema file)
// Import usersAuth and exams as well to join for role check and exam verification
import { notifications, usersDetails, registeredExams, userNotifications, usersAuth, exams } from "../db/schema";
// Import Drizzle functions, including desc for ordering
import { eq, and, desc } from "drizzle-orm"; // Added desc
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs

// Note: This controller assumes you have authentication middleware
// that populates `req.user` with the authenticated user's details,
// including their `id` (from usersDetails, as an int) and `role` (from usersAuth).

/**
 * @route POST /api/admin/notifications/send
 * @description Creates and stores a notification, targeting all students or students of a specific exam.
 * Requires admin role authentication.
 */
export const sendNotification = async (req: Request, res: Response) => {
    try {
        // Check if the authenticated user has an admin role (assuming middleware provides req.user)
        // This role check relies on your auth middleware correctly populating req.user.role
        if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
            return res.status(403).json({ error: "Forbidden: Only administrators can send notifications" });
        }

        // Extract message and target from the request body
        const { message, target } = req.body; // target is 'all' or an exam ID (varchar)

        // Validate required fields
        if (!message || !target) {
            return res.status(400).json({ error: "Message and target are required" });
        }

        // Generate a UUID on the application side for the notification ID (MySQL varchar primary key)
        const notificationId = uuidv4();

        // --- Store the main notification record in the 'notifications' table ---
        await db.insert(notifications).values({
            id: notificationId, // Use the generated UUID (varchar)
            message: message,
            target: target, // Store 'all' or the exam ID (varchar)
            created_at: new Date(), // Set the creation timestamp
            // sent_by_user_id: req.user.id, // Include if tracking admin user (assuming auth middleware provides int user ID)
        });

        console.log(`Main notification record created with ID: ${notificationId}`);


        // --- Determine target user IDs based on the target and insert into 'user_notifications' linking table ---
        let targetUserIds: number[] = []; // User IDs are int as per your schema

        if (target === 'all') {
            // If target is 'all', fetch IDs of all users with the 'student' role from usersAuth
            // Join usersDetails with usersAuth to filter by role
            const allStudents = await db.select({ id: usersDetails.id })
                                        .from(usersDetails)
                                        .innerJoin(usersAuth, eq(usersDetails.authId, usersAuth.id)) // Join with usersAuth
                                        .where(eq(usersAuth.role, 'student')); // Filter by role in usersAuth
            targetUserIds = allStudents.map(user => user.id);

        } else {
             // If target is an exam ID (varchar), first verify the exam exists
             // Accessing exams.id here requires 'exams' to be imported
             const examExists = await db.select({ id: exams.id }).from(exams).where(eq(exams.id, target)).limit(1);
             if (examExists.length === 0) {
                 return res.status(404).json({ error: "Target exam not found" });
             }

            // Fetch IDs of users registered for this specific exam
            const registeredStudents = await db.select({ userId: registeredExams.user_id })
                                             .from(registeredExams)
                                             .where(eq(registeredExams.exam_id, target)); // Filter by exam_id (varchar)
            targetUserIds = registeredStudents.map(reg => reg.userId); // registeredExams.user_id is int
        }

        console.log(`Notification "${message}" targeted at "${target}". Found ${targetUserIds.length} users.`);

        // Insert records into the 'user_notifications' linking table to associate notifications with users
        if (targetUserIds.length > 0) {
            // Prepare entries for the linking table
            const userNotificationEntries = targetUserIds.map(userId => ({
                notification_id: notificationId, // Link to the newly created notification ID (varchar)
                user_id: userId, // User ID (int)
                read_at: null, // Initially not read
            }));

            // Insert in batches to avoid hitting database limits, especially for 'all' target
            const batchSize = 100; // Adjust batch size as needed
            for (let i = 0; i < userNotificationEntries.length; i += batchSize) {
                const batch = userNotificationEntries.slice(i, i + batchSize);
                // Use insert for MySQL batch insert
                await db.insert(userNotifications).values(batch);
            }

            console.log(`Created ${userNotificationEntries.length} user notification entries.`);
        }

        // Send a success response
        res.status(201).json({ success: true, message: "Notification sent successfully", targetedUsersCount: targetUserIds.length });

    } catch (error) {
        // Log and send an error response if something goes wrong
        console.error("Error sending notification:", error);
        res.status(500).json({ error: "Failed to send notification" });
    }
};

// --- Controller to get notifications for a student (MySQL) ---

/**
 * @route GET /api/student/notifications
 * @description Gets notifications for the authenticated student.
 * Requires student role authentication.
 * The authentication middleware should populate `req.user` with the authenticated user's details.
 */
export const getStudentNotifications = async (req: Request, res: Response) => {
    try {
        // Check if the authenticated user has a student role
        // This role check relies on your auth middleware correctly populating req.user.role
        console.log("User role:", req.user?.role); // Debugging line to check user role
         if (req.user?.role !== 'student') {
            return res.status(403).json({ error: "Forbidden: Only students can view their notifications" });
        }

        // Assuming your authentication middleware attaches the user object to the request
        // and the user object includes the user's ID (from usersDetails, as int) and role.
        // This line now uses the extended Request type with the 'user' property.
        const studentUserId = req.user?.id; // Accessing user ID from req.user (int)

        // Check if the user ID is available (implies authentication)
        if (studentUserId === undefined || studentUserId === null) {
            // This should ideally be caught by auth middleware, but as a fallback
            return res.status(401).json({ error: "User not authenticated or user ID not available" });
        }

        // Fetch notifications associated with this user, joining with the notifications table
        // Select necessary fields from both tables
        const notificationsList = await db
            .select({
                id: notifications.id, // Notification ID (varchar)
                message: notifications.message,
                target: notifications.target,
                createdAt: notifications.created_at, // Timestamp
                readAt: userNotifications.read_at, // Read timestamp or null from linking table
            })
            .from(userNotifications) // Start from the linking table
            .innerJoin(notifications, eq(userNotifications.notification_id, notifications.id)) // Join with notifications table
            .where(eq(userNotifications.user_id, studentUserId)) // Filter by the student's user ID (int)
            // Order by creation date (newest first is common)
            .orderBy(desc(notifications.created_at)); // Drizzle should handle ordering timestamps correctly


        // Format dates for display on the frontend
        const formattedNotifications = notificationsList.map(notif => ({
            ...notif,
            // Ensure dates are valid Date objects before formatting
            createdAtFormatted: notif.createdAt instanceof Date && !isNaN(notif.createdAt.getTime())
                ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(notif.createdAt)
                : 'N/A',
            read: !!notif.readAt, // Boolean flag: true if readAt is not null
             readAtFormatted: notif.readAt instanceof Date && !isNaN(notif.readAt.getTime())
                ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(notif.readAt)
                : 'N/A',
        }));


        // Send the list of formatted notifications
        res.json({ success: true, data: formattedNotifications });

    } catch (error) {
        // Log and send an error response
        console.error("Error fetching student notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

// --- Controller to mark a notification as read (MySQL) ---

/**
 * @route PATCH /api/student/notifications/:notificationId/read
 * @description Marks a specific notification as read for the authenticated student.
 * Requires student role authentication.
 * The authentication middleware should populate `req.user` with the authenticated user's details.
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
    try {
        // Check if the authenticated user has a student role
        // This role check relies on your auth middleware correctly populating req.user.role
         if (req.user?.role !== 'student') {
            return res.status(403).json({ error: "Forbidden: Only students can mark notifications as read" });
        }

        // Get user ID from auth middleware (int) - Uses the extended Request type
        const studentUserId = req.user?.id;
        // Get the notification ID from URL parameters (varchar)
        const { notificationId } = req.params;

        // Check if user ID and notification ID are available
         if (studentUserId === undefined || studentUserId === null) {
             return res.status(401).json({ error: "User not authenticated or user ID not available" });
        }

        if (!notificationId) {
            return res.status(400).json({ error: "Notification ID is required" });
        }

        // Update the 'read_at' timestamp in the 'user_notifications' linking table
        // Filter by both user ID and notification ID to ensure the user is authorized to mark this notification
        // For MySQL, update returns a result object with affected rows, not the updated row directly
        const result = await db.update(userNotifications)
            .set({ read_at: new Date() }) // Set read_at to the current time
            .where(and(
                eq(userNotifications.user_id, studentUserId), // Filter by user ID (int)
                eq(userNotifications.notification_id, notificationId) // Filter by notification ID (varchar)
            ));
            // .returning({ id: userNotifications.notification_id }); // returning() is PostgreSQL specific

        // Check if any rows were affected by the update. If 0 rows were affected,
        // it means either the notification_id/user_id combination didn't exist,
        // or it was already marked as read.
        // The exact result structure might vary slightly based on Drizzle version/MySQL driver.
        // A common way to check is looking at the 'affectedRows' property if available,
        // or simply assuming success if no error was thrown and no specific error condition was met.

        // Example check (may need adjustment based on your Drizzle/MySQL setup)
        // if (result.affectedRows === 0) {
        //     // Optionally handle cases where the notification wasn't found for the user
        //     // or was already read, though the current logic simply returns success if no error is thrown.
        // }


        // Send a success response
        res.json({ success: true, message: "Notification marked as read" });

    } catch (error) {
        // Log and send an error response
        console.error(`Error marking notification ${req.params.notificationId} as read:`, error);
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

// --- New: Controller to get all sent notifications for admin (MySQL) ---

/**
 * @route GET /api/admin/notifications/sent
 * @description Gets all notifications sent from the admin panel.
 * Requires admin role authentication.
 */
export const getSentNotifications = async (req: Request, res: Response) => {
    try {
        // Check if the authenticated user has an admin role
        if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin') {
            return res.status(403).json({ error: "Forbidden: Only administrators can view sent notifications" });
        }

        // Fetch all notifications from the notifications table, ordered by creation date (newest first)
        const sentNotificationsList = await db
            .select({
                id: notifications.id,
                message: notifications.message,
                target: notifications.target,
                createdAt: notifications.created_at,
                // You might join with exams table here if you want exam names for targeted notifications
                // You might join with usersDetails if you track sent_by_user_id
            })
            .from(notifications)
            .orderBy(desc(notifications.created_at)); // Order by creation date descending

         // Optional: Join with exams to get exam names for targeted notifications
         // This makes the frontend display more informative
         const sentNotificationsWithExamNames = await db
             .select({
                 id: notifications.id,
                 message: notifications.message,
                 target: notifications.target, // 'all' or exam ID
                 createdAt: notifications.created_at,
                 examName: exams.name, // Get exam name if targeted at an exam
             })
             .from(notifications)
             .leftJoin(exams, eq(notifications.target, exams.id)) // Left join with exams on target = exam.id
             .orderBy(desc(notifications.created_at));


        // Format dates for display on the frontend
        const formattedSentNotifications = sentNotificationsWithExamNames.map(notif => ({
            ...notif,
             // Ensure dates are valid Date objects before formatting
            createdAtFormatted: notif.createdAt instanceof Date && !isNaN(notif.createdAt.getTime())
                ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(notif.createdAt)
                : 'N/A',
             // Format the target for display
             targetDisplay: notif.target === 'all' ? 'All Students' : `Students for ${notif.examName || notif.target}`,
        }));


        res.json({ success: true, data: formattedSentNotifications });

    } catch (error) {
        console.error("Error fetching sent notifications:", error);
        res.status(500).json({ error: "Failed to fetch sent notifications" });
    }
};


// Remember to export all your controller functions
// export { sendNotification, getStudentNotifications, markNotificationAsRead, getSentNotifications /* ... other controllers */ };
