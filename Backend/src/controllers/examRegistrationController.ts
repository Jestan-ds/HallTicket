// import { Request, Response } from 'express';
// import { db } from '../db';
// import { exams, examLocations, registeredExams, usersDetails, usersAuth } from '../db/schema';
// import { eq, and } from 'drizzle-orm';
// import { v4 as uuidv4 } from 'uuid';
// import { generateHallTicket } from '../utils/hallTicketGenerator'; // Assuming you have a utility function to generate hall tickets

// // Your existing examRegistration function (kept for context, no changes needed here)
// interface RegisteredExam {
//   user: User;
//   exam: Exam;
//   status: string;
//   application_id: string;
//   user_id: number;
//   seat_number: string;
//   assigned_location: string;
//   // Add other properties that you expect to be present in the registration object
// }

// interface User {
//   name: string;
//   dob: string;
//   // Add other properties that you expect to be present in the user object
// }

// interface Exam {
//   name: string;
//   exam_date: string;
//   exam_time: string;
//   // Add other properties that you expect to be present in the exam object
// }
// export const examRegistration = async (req: Request, res: Response) => {
//   try {
//     const { email,  exam_id, locationPreferences, exam_mode, selected_exam_time } = req.body;

//     if ( !email || !exam_id || !exam_mode) {
//       return res.status(400).json({ error: "All fields are required!" });
//     }

//     const user = await db.select().from(usersDetails).where(eq(usersDetails.email, email));
//     if (!user.length) {
//       return res.status(400).json({ error: "User not found!" });
//     }
//     const userId = user[0].id;

//     // Check if exam exists
//     const exam = await db.select().from(exams).where(eq(exams.id, exam_id));
//     if (!exam.length) {
//       return res.status(400).json({ error: "Exam not found!" });
//     }
//     const examId = exam[0].id;

//     // Check if user is already registered
//     const existingRegistration = await db.select().from(registeredExams).where(and(eq(registeredExams.user_id, userId), eq(registeredExams.exam_id, exam_id)));

//     if (existingRegistration.length) {
//       return res.status(400).json({ error: "User already registered for this exam!" });
//     }

//     const applicationId = uuidv4();

//     if (exam_mode === "offline") {
//       // 🏢 Offline Exam: Assign a location and seat number
//       let assignedLocation = null;
//       let seatNumber: number | null = null;

//       for (const locationName of locationPreferences) {
//         const location = await db.query.examLocations.findFirst({
//           where: and(eq(examLocations.exam_id, exam_id), eq(examLocations.location, locationName))
//         });

//         if (location && location.filled_seats < location.total_seats) {
//           assignedLocation = location;
//           seatNumber = location.filled_seats + 1;
//           break; // Stop searching once a location is found
//         }
//       }

//       if (!assignedLocation || seatNumber === null) {
//         return res.status(400).json({ error: "No seats available in preferred locations." });
//       }


//       // Insert offline exam registration
//       const newRegistration = {
//         id: uuidv4(),
//         application_id: applicationId,
//         user_id: userId,
//         exam_id: examId,
//         exam_mode: "offline" as "offline", // Ensure the exam_mode is correctly typed
//         assigned_location: assignedLocation.location,
//         seat_number: seatNumber.toString(),
//         selected_exam_time: null, // Not needed for offline mode
//         status: "pending" as "pending",
//         applied_at: new Date(),
//         hall_ticket_url: null
//       };

//       await db.insert(registeredExams).values(newRegistration);

//       // Update the filled seats count
//       await db.update(examLocations)
//         .set({ filled_seats: seatNumber })
//         .where(eq(examLocations.id, assignedLocation.id));

//       return res.status(201).json({
//         success: true,
//         message: "Offline exam registered successfully",
//         seatNumber,
//         location: assignedLocation.location
//       });

//     } else if (exam_mode === "online") {
//       // 💻 Online Exam: Assign a selected exam time
//       if (!selected_exam_time) {
//         return res.status(400).json({ error: "Selected exam time is required for online exams!" });
//       }

//       // Validate that the time is between 08:00 and 17:00
//        let hours = 0;
//        let minutes = 0;

//   try {
//     [hours, minutes] = selected_exam_time.split(":").map(Number);
//   } catch (error) {
//     return res.status(400).json({ error: "Invalid time format. Please provide time in HH:MM format." });
//   }

//   if (hours < 8 || hours >= 17) {
//     return res.status(400).json({ error: "Exam time must be between 08:00 AM and 05:00 PM!" });
//   }


//       // Insert online exam registration
//       const newRegistration = {
//         id: uuidv4(),
//         application_id: applicationId,
//         user_id: userId,
//         exam_id: examId,
//         exam_mode: "online" as "online", // Ensure the exam_mode is correctly typed
//         assigned_location: null, // Not applicable for online
//         seat_number: null, // Not applicable for online
//         selected_exam_time: selected_exam_time,
//         status: "pending" as "pending",
//         applied_at: new Date(),
//         hall_ticket_url: null
//       };

//       await db.insert(registeredExams).values(newRegistration);

//       return res.status(201).json({
//         success: true,
//         message: "Online exam registered successfully",
//         selected_exam_time
//       });

//     } else {
//       return res.status(400).json({ error: "Invalid exam mode!" });
//     }

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Error registering for exam" });
//   }
// };

// // Updated getRegisteredExams function (Date Formatted, Time Raw)
// export const getRegisteredExam = async (req: Request, res: Response) => {
//   try {
//     const authId = req.params.id;

//     // Find the user by authId to get their userId
//     const user = await db.select({ id: usersDetails.id }).from(usersDetails).where(eq(usersDetails.authId, Number(authId)));

//     // If user not found, return 404
//     if (!user.length) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     const userId = user[0].id; // Get the user ID

//     // Fetch registered exams for the user, joining with the exams table
//     // Select all necessary raw data fields
//     const UserRegisteredExams = await db
//       .select({
//         id: registeredExams.id,
//         application_id: registeredExams.application_id,
//         exam_id: registeredExams.exam_id,
//         exam_mode: registeredExams.exam_mode,
//         assigned_location: registeredExams.assigned_location,
//         seat_number: registeredExams.seat_number,
//         selected_exam_time: registeredExams.selected_exam_time, // Raw time selected by user for online flexible (HH:MM:SS or null)
//         status: registeredExams.status,
//         applied_at: registeredExams.applied_at, // Raw timestamp
//         hall_ticket_url: registeredExams.hall_ticket_url,
//         exam_time: exams.exam_time, // Raw exam_time from exams table (HH:MM:SS or null)
//         exam_date: exams.exam_date, // Raw date from exams table (ISO string or similar)
//         exam_name: exams.name, // Exam name
//         exam_duration: exams.exam_duration, // Include duration
//         exam_fee: exams.exam_fee // Include fee
//       })
//       .from(registeredExams)
//       .innerJoin(exams, eq(registeredExams.exam_id, exams.id)) // Join with exams table
//       .where(eq(registeredExams.user_id, userId)); // Use the userId from usersDetails

//     // If no registered exams found, return 404
//     

//     // Format the date on the backend, keep time raw
//     const formattedExams = UserRegisteredExams.map((exam) => {
//       // Format the exam date
//       // Ensure exam.exam_date is treated as a Date object before formatting
//       const formattedDate = exam.exam_date
//           ? new Intl.DateTimeFormat("en-US").format(new Date(exam.exam_date))
//           : "N/A"; // Handle case where date might be null/undefined


//       return {
//         ...exam,
//         // Override the original exam_date with the formatted one
//         exam_date: formattedDate, // Format date to MM/DD/YYYY
//         // Keep exam_time and selected_exam_time as raw strings
//       };
//     });

//     // Send the formatted list of registered exams
//     res.json(formattedExams);
//   } catch (error) {
//     console.error("Error fetching registered exams:", error);
//     res.status(500).json({ error: "Error fetching registered exams" });
//   }
// };

// // Import necessary types and Drizzle functions

// // Define the controller function to get a single registered exam by application ID
// export const getRegisteredExamDetailsByApplicationId = async (req: Request, res: Response) => {
//   try {
//     // Get the application ID from the URL parameters
//     const { applicationId } = req.params;

//     if (!applicationId) {
//         return res.status(400).json({ error: "Application ID is required" });
//     }

//     // Fetch the specific registered exam by application_id, joining with the exams table
//     // Select all necessary fields from both tables
//     const result = await db
//       .select({
//         // Registered Exam Fields
//         id: registeredExams.id,
//         applicationId: registeredExams.application_id, // Map to camelCase for frontend
//         userId: registeredExams.user_id, // Might be useful for security checks
//         examId: registeredExams.exam_id,
//         examMode: registeredExams.exam_mode,
//         assignedLocation: registeredExams.assigned_location, // Map to camelCase
//         seatNumber: registeredExams.seat_number, // Map to camelCase
//         selectedExamTime: registeredExams.selected_exam_time, // Map to camelCase
//         status: registeredExams.status,
//         appliedAt: registeredExams.applied_at, // Keep as raw timestamp
//         hallTicketUrl: registeredExams.hall_ticket_url, // Map to camelCase

//         // Exam Fields (joined from exams table)
//         examName: exams.name, // Map to camelCase
//         examTime: exams.exam_time, // Keep as raw HH:MM:SS string
//         examDate: exams.exam_date, // Formatted MM/DD/YYYY string from list endpoint implies it might be here too
//         examDuration: exams.exam_duration, // Map to camelCase
//         examFee: exams.exam_fee, // Map to camelCase
//       })
//       .from(registeredExams)
//       .innerJoin(exams, eq(registeredExams.exam_id, exams.id)) // Join with exams table
//       .where(eq(registeredExams.application_id, applicationId)); // Filter by the application ID

//     // Check if an exam was found
//     if (!result.length) {
//       return res.status(404).json({ error: `Registered exam with application ID "${applicationId}" not found` });
//     }

//     // Since application_id should be unique, we expect only one result
//     const examDetails = result[0];

//     // You might want to format dates/times here if needed,
//     // although your list endpoint already formats exam_date.
//     // Let's format appliedAt timestamp for consistency if displaying it.
//      const formattedExamDetails = {
//          ...examDetails,
//          // Format appliedAt timestamp (if it's a Date object or parseable string)
//          appliedAtFormatted: examDetails.appliedAt
//              ? new Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(examDetails.appliedAt))
//              : "N/A",
//          // examDate is assumed formatted from the list endpoint logic
//          // examTime and selectedExamTime remain raw strings (e.g., "09:00:00")
//      };


//     // Send the exam details
//     res.json(formattedExamDetails); // Or res.json(examDetails) if no extra formatting needed

//   } catch (error) {
//     console.error(`Error fetching registered exam details for application ID ${req.params.applicationId}:`, error);
//     res.status(500).json({ error: "Error fetching registered exam details" });
//   }
// };
// const formatRegistrationForFrontend = (
//   reg: typeof registeredExams.$inferSelect & {
//       user: typeof usersDetails.$inferSelect | null; // Use | null for outer joins
//       exam: typeof exams.$inferSelect | null;
//       location: typeof examLocations.$inferSelect | null; // Optional location join
//   }
// ) => {
//   // Format dates if necessary, based on what frontend expects (MM/DD/YYYY or similar)
//   const formattedExamDate = reg.exam?.exam_date
//       ? new Intl.DateTimeFormat("en-US").format(new Date(reg.exam.exam_date))
//       : "N/A";

//   const formattedAppliedAt = reg.applied_at
//        ? new Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(reg.applied_at))
//        : "N/A";

//   return {
//       application_id: reg.application_id,
//       user_id: reg.user_id,
//       exam_id: reg.exam_id,
//       registration_date: formattedAppliedAt, // Using applied_at as registration_date
//       status: reg.status,
//       payment_status: 'completed', // Assuming payment is completed based on the mock data in your frontend. You'll need to fetch actual payment status.
    
//       hall_ticket_url: reg.hall_ticket_url,
//       exam_mode: reg.exam_mode, // Include exam_mode
//       assigned_location: reg.assigned_location, // Include assigned_location string
//       seat_number: reg.seat_number, // Include seat_number string
//       selected_exam_time: reg.selected_exam_time, // Include selected_exam_time string

//       user: reg.user ? {
//           // Map user fields to match frontend User type
//           name: reg.user.name,
//           email: reg.user.email,
//           // ... other user fields from frontend User type
//       } : { name: 'N/A', email: 'N/A' }, // Handle case where user might be null (shouldn't happen with innerJoin)

//       exam: reg.exam ? {
//           // Map exam fields to match frontend Exam type
//           name: reg.exam.name,
//           exam_date: formattedExamDate, // Use formatted date
//           exam_time: reg.exam.exam_time || reg.selected_exam_time, // Use exam_time or selected_exam_time
//            // ... other exam fields from frontend Exam type (duration, fee if needed)
//            exam_duration: reg.exam.exam_duration,
//            exam_fee: reg.exam.exam_fee,
//       } : { name: 'N/A', exam_date: 'N/A' }, // Handle case where exam might be null (shouldn't happen with innerJoin)

//       location: reg.location ? {
//           // Map location fields to match frontend Location type
//           name:  reg.location.location, // Use location name or string location
//           // ... other location fields from frontend Location type (address, city, state if you add them to examLocations schema)
//            address: (reg.location as any).address, // Assuming address exists in examLocations
//            city: (reg.location as any).city, // Assuming city exists
//            state: (reg.location as any).state, // Assuming state exists
//       } : undefined, // location can be undefined for online/pending registrations
//   };
// };


// // --- GET /api/registrations - Fetch all registrations (Modified to fetch joined data) ---
// export const getRegisteredExams = async (req: Request, res: Response) => {
//   try {
//       // Fetch all registered exams, joining with usersDetails, exams, and examLocations
//       // Use .findMany with with to structure the output with nested objects
//       const UserRegisteredExams = await db.query.registeredExams.findMany({
//           with: {
//               user: true, // Automatically joins usersDetails where user_id matches
//               exam: true, // Automatically joins exams where exam_id matches
//               location: true, // Automatically joins examLocations where location_id matches (assuming location_id exists in registeredExams and links to examLocations)
//                              // If assigned_location in registeredExams is just a string, you might need a different approach,
//                              // maybe a leftJoin and then manually find the location details.
//                              // Let's assume for now location_id exists in registeredExams linking to examLocations.
//           },
//           // Add orderBy if needed (e.g., orderBy: registeredExams.applied_at)
//       });

//       // If no registered exams found, return empty array (200 OK with empty data)
//       // Returning 404 for no results can be misleading, 200 with empty array is standard for lists
//        if (!UserRegisteredExams || UserRegisteredExams.length === 0) {
//            return res.json([]);
//        }


//       // Format the fetched data to match the frontend's Registration type structure
//       // This involves flattening the joined results into the nested objects
//       const formattedRegistrations = UserRegisteredExams.map(formatRegistrationForFrontend);


//       // Send the formatted list of registered exams
//       res.json(formattedRegistrations);

//   } catch (error) {
//       console.error("Error fetching registered exams:", error);
//       // More specific error handling based on error type might be needed
//       res.status(500).json({ error: "Error fetching registered exams" });
//   }
// };


// // --- GET /api/registrations/:applicationId - Get single registration details (Modified) ---



// // --- POST /api/registrations/:applicationId/approve - Approve a registration ---
// // In src/controllers/examRegistrationController.ts

// // ... (imports and other parts of the function) ...

// export const approveRegistration = async (req: Request, res: Response) => {
//   const { applicationId } = req.params;

//   try {
//     const registration = await db.query.registeredExams.findFirst({
//       where: eq(registeredExams.application_id, applicationId),
//       with: {
//         user: true, // This should join with usersDetails based on user_id
//         exam: true, // This should join with exams based on exam_id
//       },
//     }) as RegisteredExam &{
//         user: User ; // Type guard for user
//         exam: Exam ;// Type guard for exam
//     }

//     if (!registration) {
//       return res.status(404).json({ error: 'Registration not found.' });
//     }

//     if (registration.status !== 'pending') {
//       return res.status(400).json({ error: `Registration status is already "${registration.status}". Cannot approve.` });
//     }

//     // --- CRUCIAL TYPE GUARD ---
//     // After this block, TypeScript will know that registration.user and registration.exam are defined.
//     if (!registration.user || !registration.exam) {
//         // This condition implies that even though the registration record exists,
//         // the related user or exam record was not found or not loaded correctly.
//         // This should ideally not happen if your foreign key constraints are set up
//         // and the relations in the schema are correct.
//         console.error(`User or Exam details missing for registration ${applicationId}. User: ${JSON.stringify(registration.user)}, Exam: ${JSON.stringify(registration.exam)}`);
//         return res.status(500).json({ error: 'User or Exam details are missing for this registration. Cannot generate hall ticket.' });
//     }

//     // --- At this point, TypeScript knows registration.user and registration.exam are NOT null ---
//     // Drizzle's type for registration.user will be inferred from your 'usersDetails' schema
//     // and registration.exam from your 'exams' schema.

//     const hallTicketDetails = {
//       studentName: registration.user.name,         // Now accessing registration.user.name is safe
//       dob: registration.user.dob,                 // Safe
//       examName: registration.exam.name,           // Safe
//       applicationId: registration.application_id,
//       userId: registration.user_id,               // This is directly on registeredExams table
//       seatNumber: registration.seat_number,       // Directly on registeredExams table
//       examDate: registration.exam.exam_date,     // Safe
//       examTime: registration.exam.exam_time,     // Safe
//       // For examVenue, ensure 'name' exists on 'registration.exam' if using it as fallback
//       examVenue: registration.assigned_location || (registration.exam ? registration.exam.name : 'Venue Not Assigned'),
//     };

//     // Generate Hall Ticket
//     const hallTicketUrl = await generateHallTicket(hallTicketDetails);

//     // Update registration status and hall_ticket_url in the database
//     await db.update(registeredExams)
//       .set({
//         status: 'approved',
//         hall_ticket_url: hallTicketUrl,
//       })
//       .where(eq(registeredExams.application_id, applicationId));

//     const updatedRegistration = await db.query.registeredExams.findFirst({
//       where: eq(registeredExams.application_id, applicationId),
//       with: {
//         user: true,
//         exam: true,
//       },
//     });

//     if (!updatedRegistration || !updatedRegistration.user || !updatedRegistration.exam) { // Add checks here too for safety
//       console.error(`Failed to refetch fully populated approved registration ${applicationId}`);
//       return res.status(500).json({ error: 'Registration approved, but failed to retrieve complete updated details.' });
//     }

//     res.status(200).json({
//       message: `Registration ${applicationId} approved successfully. Hall ticket generated.`,
//       // Ensure formatRegistrationForFrontend also handles potentially null user/exam if types are loose
//       registration: formatRegistrationForFrontend(updatedRegistration as any), // Using 'as any' if types are complex; ideally, type correctly
//     });

//   } catch (error: any) {
//     console.error(`Error approving registration ${applicationId}:`, error);
//     if (error.message && error.message.toLowerCase().includes('font')) {
//       return res.status(500).json({ error: 'Failed to approve registration. PDF generation error (font issue).', details: error.message });
//     }
//     res.status(500).json({ error: 'Failed to approve registration.', details: error.message });
//   }
// };


// // --- POST /api/registrations/:applicationId/reject - Reject a registration ---
// export const rejectRegistration = async (req: Request, res: Response) => {
//   const { applicationId } = req.params;
//    const { rejectReason } = req.body; // Get reason from request body
//   // You could potentially get admin user ID from req.user if using authentication
//   // const adminId = req.user.id;

//   try {
//       // 1. Find the registration and check its current status
//       const registration = await db.query.registeredExams.findFirst({
//           where: eq(registeredExams.application_id, applicationId),
//            with: { // Join to get related user/exam data for potential email notification
//                user: true,
//                exam: true,
//            }
//       });

//       if (!registration) {
//           return res.status(404).json({ error: 'Registration not found.' });
//       }

//       if (registration.status !== 'pending') {
//           return res.status(400).json({ error: `Registration status is already "${registration.status}". Cannot reject.` });
//       }

//       // 2. Update registration status in the database
//       await db.update(registeredExams)
//           .set({
//               status: 'rejected',
//                // Add a 'reject_reason' column to your schema if you want to store this
//                // reject_reason: rejectReason || null,
//                hall_ticket_url: null, // Remove hall ticket URL if previously generated/assigned
//                assigned_location: null, // Remove assigned location
//                seat_number: null, // Remove seat number
//               // rejected_at: new Date(),
//           })
//           .where(eq(registeredExams.application_id, applicationId));

//       // 3. Fetch the updated registration record to return to the frontend
//       const updatedRegistration = await db.query.registeredExams.findFirst({
//           where: eq(registeredExams.application_id, applicationId),
//            with: { // Ensure related data is included for the frontend table/details update
//                user: true,
//                exam: true,
//                location: true, // Include location even if null after rejection
//            }
//       });

//        if (!updatedRegistration) {
//             console.error(`Failed to refetch rejected registration ${applicationId}`);
//             return res.status(500).json({ error: 'Registration rejected, but failed to retrieve updated details.' });
//        }


//       // 4. Send success response with the updated registration data
//        res.status(200).json({
//            message: `Registration ${applicationId} rejected successfully.`,
//            registration: formatRegistrationForFrontend(updatedRegistration), // Format the updated registration for frontend
//        });

//        // Optional: Trigger email notification service here to inform the user of rejection
//        // sendRejectionEmail(registration.user.email, rejectReason);

//   } catch (error) {
//       console.error(`Error rejecting registration ${applicationId}:`, error);
//       res.status(500).json({ error: 'Failed to reject registration.' });
//   }
// };

import { Request, Response } from 'express';
import { db } from '../db';
import {
    exams,
    examLocations,
    registeredExams,
    usersDetails,
    // usersAuth // Not directly used in this controller's functions, can be removed if not needed elsewhere
} from '../db/schema';
import { eq, and, InferSelectModel } from 'drizzle-orm'; // Import InferSelectModel
import { v4 as uuidv4 } from 'uuid';
import { generateHallTicket } from '../utils/hallTicketGenerator';

// Define types based on Drizzle schema for better type safety
// These will be inferred by Drizzle when using `with`
type UserDetailSelect = InferSelectModel<typeof usersDetails>;
type ExamSelect = InferSelectModel<typeof exams>;
type ExamLocationSelect = InferSelectModel<typeof examLocations>; // If you were to fetch location details separately

// This is the type Drizzle will infer for `registeredExams` with its relations
type RegisteredExamWithRelations = InferSelectModel<typeof registeredExams> & {
    user: UserDetailSelect | null; // User can be null if the join somehow fails or if user_id is nullable (though it's not)
    exam: ExamSelect | null;   // Exam can be null for similar reasons
    // We are removing 'location' from 'with' as it's not a direct relation on registeredExams table
};


export const examRegistration = async (req: Request, res: Response) => {
    try {
        const { email, exam_id, locationPreferences, exam_mode, selected_exam_time } = req.body;

        if (!email || !exam_id || !exam_mode) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const userResult = await db.select().from(usersDetails).where(eq(usersDetails.email, email));
        if (!userResult.length) {
            return res.status(400).json({ error: "User not found!" });
        }
        const userId = userResult[0].id;

        const examResult = await db.select().from(exams).where(eq(exams.id, exam_id));
        if (!examResult.length) {
            return res.status(400).json({ error: "Exam not found!" });
        }
        const examId = examResult[0].id;

        const existingRegistration = await db.select().from(registeredExams).where(and(eq(registeredExams.user_id, userId), eq(registeredExams.exam_id, exam_id)));

        if (existingRegistration.length > 0) {
            return res.status(400).json({ error: "User already registered for this exam!" });
        }

        const applicationId = uuidv4();

        if (exam_mode === "offline") {
            if (!locationPreferences || !Array.isArray(locationPreferences) || locationPreferences.length === 0) {
                return res.status(400).json({ error: "Location preferences are required for offline exams." });
            }
            let assignedLocationData: ExamLocationSelect | null = null; // Use the Drizzle type
            let seatNumber: number | null = null;

            for (const locationName of locationPreferences) {
                const location = await db.query.examLocations.findFirst({
                    where: and(eq(examLocations.exam_id, exam_id), eq(examLocations.location, locationName as string)) // Cast locationName if necessary
                });

                if (location && location.filled_seats < location.total_seats) {
                    assignedLocationData = location;
                    seatNumber = location.filled_seats + 1;
                    break;
                }
            }

            if (!assignedLocationData || seatNumber === null) {
                return res.status(400).json({ error: "No seats available in preferred locations." });
            }

            const newRegistration = {
                id: uuidv4(),
                application_id: applicationId,
                user_id: userId,
                exam_id: examId,
                exam_mode: "offline" as "offline",
                assigned_location: assignedLocationData.location,
                seat_number: seatNumber.toString(),
                selected_exam_time: null,
                status: "pending" as "pending",
                applied_at: new Date(),
                hall_ticket_url: null
            };
            await db.insert(registeredExams).values(newRegistration);
            await db.update(examLocations)
                .set({ filled_seats: seatNumber })
                .where(eq(examLocations.id, assignedLocationData.id));

            return res.status(201).json({
                success: true,
                message: "Offline exam registered successfully",
                seatNumber,
                location: assignedLocationData.location
            });

        } else if (exam_mode === "online") {
            if (!selected_exam_time) {
                return res.status(400).json({ error: "Selected exam time is required for online exams!" });
            }
            let hours = 0;
            let minutes = 0;
            try {
                [hours, minutes] = (selected_exam_time as string).split(":").map(Number);
            } catch (error) {
                return res.status(400).json({ error: "Invalid time format. Please provide time in HH:MM format." });
            }
            if (hours < 8 || hours >= 17 || isNaN(hours) || isNaN(minutes)) {
                return res.status(400).json({ error: "Exam time must be a valid time between 08:00 AM and 05:00 PM!" });
            }

            const newRegistration = {
                id: uuidv4(),
                application_id: applicationId,
                user_id: userId,
                exam_id: examId,
                exam_mode: "online" as "online",
                assigned_location: null,
                seat_number: null,
                selected_exam_time: selected_exam_time as string, // Ensure it's a string
                status: "pending" as "pending",
                applied_at: new Date(),
                hall_ticket_url: null
            };
            await db.insert(registeredExams).values(newRegistration);
            return res.status(201).json({
                success: true,
                message: "Online exam registered successfully",
                selected_exam_time
            });
        } else {
            return res.status(400).json({ error: "Invalid exam mode!" });
        }
    } catch (error) {
        console.error("Error registering for exam:", error);
        return res.status(500).json({ error: "Error registering for exam" });
    }
};

export const getRegisteredExam = async (req: Request, res: Response) => {
    try {
        const authId = req.params.id;
        if (!authId || isNaN(Number(authId))) {
            return res.status(400).json({ error: "Valid Auth ID is required." });
        }

        const user = await db.select({ id: usersDetails.id }).from(usersDetails).where(eq(usersDetails.authId, Number(authId)));
        if (!user.length) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = user[0].id;

        const userRegisteredExamsData = await db
            .select({
                id: registeredExams.id,
                application_id: registeredExams.application_id,
                exam_id: registeredExams.exam_id,
                exam_mode: registeredExams.exam_mode,
                assigned_location: registeredExams.assigned_location,
                seat_number: registeredExams.seat_number,
                selected_exam_time: registeredExams.selected_exam_time,
                status: registeredExams.status,
                applied_at: registeredExams.applied_at,
                hall_ticket_url: registeredExams.hall_ticket_url,
                // Fields from the joined 'exams' table
                exam_name: exams.name,
                exam_date: exams.exam_date,
                exam_time: exams.exam_time,
                exam_duration: exams.exam_duration,
                exam_fee: exams.exam_fee
            })
            .from(registeredExams)
            .innerJoin(exams, eq(registeredExams.exam_id, exams.id))
            .where(eq(registeredExams.user_id, userId));

        if (!userRegisteredExamsData.length) {
            return res.json([]); // Return empty array if no exams found
        }

        const formattedExams = userRegisteredExamsData.map((exam) => {
            const examDateObj = exam.exam_date ? new Date(exam.exam_date) : null;
            const formattedDate = examDateObj && !isNaN(examDateObj.getTime())
                ? new Intl.DateTimeFormat("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }).format(examDateObj)
                : "N/A";
            return {
                ...exam,
                exam_date: formattedDate,
            };
        });
        res.json(formattedExams);
    } catch (error) {
        console.error("Error fetching registered exams for user:", error);
        res.status(500).json({ error: "Error fetching registered exams" });
    }
};

// src/controllers/examRegistrationController.ts
// ... (other imports)

export const getRegisteredExamDetailsByApplicationId = async (req: Request, res: Response) => {
    try {
        const { applicationId } = req.params;
        if (!applicationId) {
            return res.status(400).json({ error: "Application ID is required" });
        }

        // Fetch the specific registered exam, joining with exams and userDetails
        const registrationData = await db.query.registeredExams.findFirst({
            where: eq(registeredExams.application_id, applicationId),
            with: {
                exam: true,   // Join with exams table
                user: true,   // Join with usersDetails table
            }
        });

        if (!registrationData) {
            return res.status(404).json({ error: `Registration with application ID "${applicationId}" not found` });
        }

        if (!registrationData.user || !registrationData.exam) {
            return res.status(500).json({ error: "Associated user or exam data is missing for this registration." });
        }

        // Construct roll number as it would appear on the hall ticket
        let dobForRollNumber = 'N/A';
        if (registrationData.user.dob) {
            const dateObj = new Date(registrationData.user.dob);
            if (!isNaN(dateObj.getTime())) {
                const year = dateObj.getFullYear();
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const day = dateObj.getDate().toString().padStart(2, '0');
                dobForRollNumber = `${year}${month}${day}`;
            }
        }
        const officialRollNumber = `${dobForRollNumber}${registrationData.seat_number || "NA"}`;

        // Format data similarly to how it might be in the QR code for easier comparison display
        const examDateObj = registrationData.exam.exam_date ? new Date(registrationData.exam.exam_date) : null;
        const userDobObj = registrationData.user.dob ? new Date(registrationData.user.dob) : null;

        const responsePayload = {
            applicationId: registrationData.application_id,
            userId: registrationData.user_id, // from registeredExams table
            studentName: registrationData.user.name,
            dob: userDobObj && !isNaN(userDobObj.getTime())
                 ? userDobObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) // Format as DD/MM/YYYY
                 : 'N/A',
            rollNumber: officialRollNumber, // Official Roll Number from DB
            examName: registrationData.exam.name,
            examDate: examDateObj && !isNaN(examDateObj.getTime())
                      ? examDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) // Format as DD/MM/YYYY
                      : 'N/A',
            examTime: registrationData.exam.exam_time || registrationData.selected_exam_time || 'N/A', // From exams or registeredExams
            examVenue: registrationData.assigned_location || 'N/A',
            status: registrationData.status, // Important: check if 'approved'
            hallTicketUrl: registrationData.hall_ticket_url,
            // Add any other fields you want to verify or display
        };

        res.json(responsePayload);

    } catch (error: any) {
        console.error(`Error fetching registered exam details for application ID ${req.params.applicationId}:`, error);
        res.status(500).json({ error: "Error fetching registered exam details", details: error.message });
    }
};

const formatRegistrationForFrontend = (
    reg: RegisteredExamWithRelations // Use the Drizzle inferred type
) => {
    // Handle cases where user or exam might be null due to join issues or data inconsistency
    // (though with inner joins and foreign keys, they should ideally not be null)
    const userDetails = reg.user ? {
        name: reg.user.name,
        email: reg.user.email,
        dob: reg.user.dob ? new Date(reg.user.dob).toISOString().split('T')[0] : 'N/A', // Format DOB to YYYY-MM-DD string
    } : { name: 'N/A', email: 'N/A', dob: 'N/A' };

    const examDateObj = reg.exam?.exam_date ? new Date(reg.exam.exam_date) : null;
    const formattedExamDate = examDateObj && !isNaN(examDateObj.getTime())
        ? new Intl.DateTimeFormat("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }).format(examDateObj)
        : "N/A";

    const examDetails = reg.exam ? {
        name: reg.exam.name,
        exam_date: formattedExamDate,
        exam_time: reg.exam.exam_time || reg.selected_exam_time, // Use exam_time or selected_exam_time
        exam_duration: reg.exam.exam_duration,
        exam_fee: reg.exam.exam_fee,
    } : { name: 'N/A', exam_date: 'N/A', exam_time: 'N/A', exam_duration: 'N/A', exam_fee: 'N/A' };

    const appliedAtDateObj = reg.applied_at ? new Date(reg.applied_at) : null;
    const formattedAppliedAt = appliedAtDateObj && !isNaN(appliedAtDateObj.getTime())
        ? new Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'short' }).format(appliedAtDateObj)
        : "N/A";

    return {
        application_id: reg.application_id,
        user_id: reg.user_id,
        exam_id: reg.exam_id,
        registration_date: formattedAppliedAt,
        status: reg.status,
        payment_status: 'completed', // Placeholder: fetch actual payment status if available
        hall_ticket_url: reg.hall_ticket_url,
        exam_mode: reg.exam_mode,
        assigned_location: reg.assigned_location,
        seat_number: reg.seat_number,
        selected_exam_time: reg.selected_exam_time,
        user: userDetails,
        exam: examDetails,
        // 'location' field is removed as it was problematic.
        // If you need detailed location info from 'examLocations', query it separately
        // or ensure 'registeredExams' has a direct FK to 'examLocations' for the 'with' clause.
    };
};

export const getRegisteredExams = async (req: Request, res: Response) => {
    try {
        const userRegisteredExams = await db.query.registeredExams.findMany({
            with: {
                user: true,
                exam: true,
                // Do NOT include 'location: true' here unless 'registeredExams' table
                // has a direct relation named 'location' to 'examLocations' table
                // (e.g., via a location_id foreign key in registeredExams schema).
                // If `assigned_location` is just a string, that's fine, it's directly on the table.
            },
            // You can add orderBy here, e.g.
            // orderBy: (registeredExams, { desc }) => [desc(registeredExams.applied_at)],
        });

        if (!userRegisteredExams || userRegisteredExams.length === 0) {
            return res.json([]);
        }

        const formattedRegistrations = userRegisteredExams.map(formatRegistrationForFrontend);
        res.json(formattedRegistrations);
    } catch (error) {
        console.error("Error fetching all registered exams:", error);
        res.status(500).json({ error: "Error fetching registered exams" });
    }
};

export const approveRegistration = async (req: Request, res: Response) => {
    const { applicationId } = req.params;

    try {
        const registration: RegisteredExamWithRelations | undefined = await db.query.registeredExams.findFirst({
            where: eq(registeredExams.application_id, applicationId),
            with: {
                user: true,
                exam: true,
            },
        });

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found.' });
        }

        if (registration.status !== 'pending') {
            return res.status(400).json({ error: `Registration status is already "${registration.status}". Cannot approve.` });
        }

        if (!registration.user || !registration.exam) {
            console.error(`User or Exam details missing for registration ${applicationId}. User: ${JSON.stringify(registration.user)}, Exam: ${JSON.stringify(registration.exam)}`);
            return res.status(500).json({ error: 'User or Exam details are missing. Cannot generate hall ticket.' });
        }
        
        // Ensure dob is a string or Date for hallTicketGenerator, Drizzle returns Date for date types
        const examDateForTicket = registration.exam.exam_date; // Should be a Date object from Drizzle
const examTimeForTicket = registration.exam.exam_time; // Should be a time string like "HH:MM:SS" from Drizzle

let dobForRollNumber = 'N/A';
        if (registration.user.dob) {
            const dateObj = new Date(registration.user.dob);
            if (!isNaN(dateObj.getTime())) {
                const year = dateObj.getFullYear();
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
                const day = dateObj.getDate().toString().padStart(2, '0');
                dobForRollNumber = `${year}${month}${day}`;
            } else {
                console.warn(`Invalid DOB format for roll number generation: ${registration.user.dob}`);
            }
        }
        const constructedRollNumber = `${dobForRollNumber}${registration.seat_number || "NA"}`;
const hallTicketDetails = { // Match the HallTicketDetails interface
    studentName: registration.user.name,
    dob: registration.user.dob, // Pass Date object
    examName: registration.exam.name,
    applicationId: registration.application_id,
    userId: registration.user_id,
    rollNumber: constructedRollNumber,
    seatNumber: registration.seat_number,
    examDate: examDateForTicket,    // Pass Date object or valid parseable string
    examTime: examTimeForTicket,    // Pass time string "HH:MM" or "HH:MM:SS"
    examVenue: registration.assigned_location || registration.exam.name,
    paperMedium: registration.exam.exam_category === "Technical" ? "English" : "English/Hindi", // Example
    gender: registration.user.gender,
    category: "GENERAL", // Fetch from user.category if available
    pwdStatus: "No", // Fetch from user.pwdStatus if available
};

const hallTicketUrl = await generateHallTicket(hallTicketDetails);
        await db.update(registeredExams)
            .set({
                status: 'approved',
                hall_ticket_url: hallTicketUrl,
            })
            .where(eq(registeredExams.application_id, applicationId));

        const updatedRegistrationResult: RegisteredExamWithRelations | undefined = await db.query.registeredExams.findFirst({
            where: eq(registeredExams.application_id, applicationId),
            with: {
                user: true,
                exam: true,
            },
        });

        if (!updatedRegistrationResult) {
            console.error(`Failed to refetch approved registration ${applicationId}`);
            return res.status(500).json({ error: 'Registration approved, but failed to retrieve updated details.' });
        }
        // No need to check user/exam again if the record itself is found, as FKs should ensure they exist
        // if (!updatedRegistrationResult.user || !updatedRegistrationResult.exam) { ... }

        res.status(200).json({
            message: `Registration ${applicationId} approved successfully. Hall ticket generated.`,
            registration: formatRegistrationForFrontend(updatedRegistrationResult),
        });

    } catch (error: any) {
        console.error(`Error approving registration ${applicationId}:`, error);
        if (error.message && error.message.toLowerCase().includes('font')) {
            return res.status(500).json({ error: 'Failed to approve registration. PDF generation error (font issue).', details: error.message });
        }
        res.status(500).json({ error: 'Failed to approve registration.', details: error.message });
    }
};

export const rejectRegistration = async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const { rejectReason } = req.body;

    try {
        const registration = await db.query.registeredExams.findFirst({
            where: eq(registeredExams.application_id, applicationId),
            // No need to fetch user/exam for rejection itself unless used in notification
        });

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found.' });
        }

        if (registration.status !== 'pending') {
            return res.status(400).json({ error: `Registration status is already "${registration.status}". Cannot reject.` });
        }

        await db.update(registeredExams)
            .set({
                status: 'rejected',
                hall_ticket_url: null,
                // assigned_location: null, // Optionally clear these on rejection
                // seat_number: null,
                // You might want a 'reject_reason' column in your registeredExams table
                // reject_reason: rejectReason || null,
            })
            .where(eq(registeredExams.application_id, applicationId));

        const updatedRegistrationResult: RegisteredExamWithRelations | undefined = await db.query.registeredExams.findFirst({
            where: eq(registeredExams.application_id, applicationId),
            with: { // Fetch user and exam for the response
                user: true,
                exam: true,
            },
        });

        if (!updatedRegistrationResult) {
            console.error(`Failed to refetch rejected registration ${applicationId}`);
            return res.status(500).json({ error: 'Registration rejected, but failed to retrieve updated details.' });
        }

        res.status(200).json({
            message: `Registration ${applicationId} rejected successfully.`,
            registration: formatRegistrationForFrontend(updatedRegistrationResult),
        });

    } catch (error: any) {
        console.error(`Error rejecting registration ${applicationId}:`, error);
        res.status(500).json({ error: 'Failed to reject registration.', details: error.message });
    }
};