import { Request, Response } from 'express';
import { db } from '../db';
import { exams, examLocations, registeredExams, usersDetails, usersAuth } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Your existing examRegistration function (kept for context, no changes needed here)
export const examRegistration = async (req: Request, res: Response) => {
  try {
    const { email,  exam_id, locationPreferences, exam_mode, selected_exam_time } = req.body;

    if ( !email || !exam_id || !exam_mode) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const user = await db.select().from(usersDetails).where(eq(usersDetails.email, email));
    if (!user.length) {
      return res.status(400).json({ error: "User not found!" });
    }
    const userId = user[0].id;

    // Check if exam exists
    const exam = await db.select().from(exams).where(eq(exams.id, exam_id));
    if (!exam.length) {
      return res.status(400).json({ error: "Exam not found!" });
    }
    const examId = exam[0].id;

    // Check if user is already registered
    const existingRegistration = await db.select().from(registeredExams).where(and(eq(registeredExams.user_id, userId), eq(registeredExams.exam_id, exam_id)));

    if (existingRegistration.length) {
      return res.status(400).json({ error: "User already registered for this exam!" });
    }

    const applicationId = uuidv4();

    if (exam_mode === "offline") {
      // 🏢 Offline Exam: Assign a location and seat number
      let assignedLocation = null;
      let seatNumber: number | null = null;

      for (const locationName of locationPreferences) {
        const location = await db.query.examLocations.findFirst({
          where: and(eq(examLocations.exam_id, exam_id), eq(examLocations.location, locationName))
        });

        if (location && location.filled_seats < location.total_seats) {
          assignedLocation = location;
          seatNumber = location.filled_seats + 1;
          break; // Stop searching once a location is found
        }
      }

      if (!assignedLocation || seatNumber === null) {
        return res.status(400).json({ error: "No seats available in preferred locations." });
      }


      // Insert offline exam registration
      const newRegistration = {
        id: uuidv4(),
        application_id: applicationId,
        user_id: userId,
        exam_id: examId,
        exam_mode: "offline" as "offline", // Ensure the exam_mode is correctly typed
        assigned_location: assignedLocation.location,
        seat_number: seatNumber.toString(),
        selected_exam_time: null, // Not needed for offline mode
        status: "pending" as "pending",
        applied_at: new Date(),
        hall_ticket_url: null
      };

      await db.insert(registeredExams).values(newRegistration);

      // Update the filled seats count
      await db.update(examLocations)
        .set({ filled_seats: seatNumber })
        .where(eq(examLocations.id, assignedLocation.id));

      return res.status(201).json({
        success: true,
        message: "Offline exam registered successfully",
        seatNumber,
        location: assignedLocation.location
      });

    } else if (exam_mode === "online") {
      // 💻 Online Exam: Assign a selected exam time
      if (!selected_exam_time) {
        return res.status(400).json({ error: "Selected exam time is required for online exams!" });
      }

      // Validate that the time is between 08:00 and 17:00
       let hours = 0;
       let minutes = 0;

  try {
    [hours, minutes] = selected_exam_time.split(":").map(Number);
  } catch (error) {
    return res.status(400).json({ error: "Invalid time format. Please provide time in HH:MM format." });
  }

  if (hours < 8 || hours >= 17) {
    return res.status(400).json({ error: "Exam time must be between 08:00 AM and 05:00 PM!" });
  }


      // Insert online exam registration
      const newRegistration = {
        id: uuidv4(),
        application_id: applicationId,
        user_id: userId,
        exam_id: examId,
        exam_mode: "online" as "online", // Ensure the exam_mode is correctly typed
        assigned_location: null, // Not applicable for online
        seat_number: null, // Not applicable for online
        selected_exam_time: selected_exam_time,
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
    console.error(error);
    return res.status(500).json({ error: "Error registering for exam" });
  }
};

// Updated getRegisteredExams function (Date Formatted, Time Raw)
export const getRegisteredExam = async (req: Request, res: Response) => {
  try {
    const authId = req.params.id;

    // Find the user by authId to get their userId
    const user = await db.select({ id: usersDetails.id }).from(usersDetails).where(eq(usersDetails.authId, Number(authId)));

    // If user not found, return 404
    if (!user.length) {
      return res.status(404).json({ error: "User not found" });
    }
    const userId = user[0].id; // Get the user ID

    // Fetch registered exams for the user, joining with the exams table
    // Select all necessary raw data fields
    const UserRegisteredExams = await db
      .select({
        id: registeredExams.id,
        application_id: registeredExams.application_id,
        exam_id: registeredExams.exam_id,
        exam_mode: registeredExams.exam_mode,
        assigned_location: registeredExams.assigned_location,
        seat_number: registeredExams.seat_number,
        selected_exam_time: registeredExams.selected_exam_time, // Raw time selected by user for online flexible (HH:MM:SS or null)
        status: registeredExams.status,
        applied_at: registeredExams.applied_at, // Raw timestamp
        hall_ticket_url: registeredExams.hall_ticket_url,
        exam_time: exams.exam_time, // Raw exam_time from exams table (HH:MM:SS or null)
        exam_date: exams.exam_date, // Raw date from exams table (ISO string or similar)
        exam_name: exams.name, // Exam name
        exam_duration: exams.exam_duration, // Include duration
        exam_fee: exams.exam_fee // Include fee
      })
      .from(registeredExams)
      .innerJoin(exams, eq(registeredExams.exam_id, exams.id)) // Join with exams table
      .where(eq(registeredExams.user_id, userId)); // Use the userId from usersDetails

    // If no registered exams found, return 404
    

    // Format the date on the backend, keep time raw
    const formattedExams = UserRegisteredExams.map((exam) => {
      // Format the exam date
      // Ensure exam.exam_date is treated as a Date object before formatting
      const formattedDate = exam.exam_date
          ? new Intl.DateTimeFormat("en-US").format(new Date(exam.exam_date))
          : "N/A"; // Handle case where date might be null/undefined


      return {
        ...exam,
        // Override the original exam_date with the formatted one
        exam_date: formattedDate, // Format date to MM/DD/YYYY
        // Keep exam_time and selected_exam_time as raw strings
      };
    });

    // Send the formatted list of registered exams
    res.json(formattedExams);
  } catch (error) {
    console.error("Error fetching registered exams:", error);
    res.status(500).json({ error: "Error fetching registered exams" });
  }
};

// Import necessary types and Drizzle functions

// Define the controller function to get a single registered exam by application ID
export const getRegisteredExamDetailsByApplicationId = async (req: Request, res: Response) => {
  try {
    // Get the application ID from the URL parameters
    const { applicationId } = req.params;

    if (!applicationId) {
        return res.status(400).json({ error: "Application ID is required" });
    }

    // Fetch the specific registered exam by application_id, joining with the exams table
    // Select all necessary fields from both tables
    const result = await db
      .select({
        // Registered Exam Fields
        id: registeredExams.id,
        applicationId: registeredExams.application_id, // Map to camelCase for frontend
        userId: registeredExams.user_id, // Might be useful for security checks
        examId: registeredExams.exam_id,
        examMode: registeredExams.exam_mode,
        assignedLocation: registeredExams.assigned_location, // Map to camelCase
        seatNumber: registeredExams.seat_number, // Map to camelCase
        selectedExamTime: registeredExams.selected_exam_time, // Map to camelCase
        status: registeredExams.status,
        appliedAt: registeredExams.applied_at, // Keep as raw timestamp
        hallTicketUrl: registeredExams.hall_ticket_url, // Map to camelCase

        // Exam Fields (joined from exams table)
        examName: exams.name, // Map to camelCase
        examTime: exams.exam_time, // Keep as raw HH:MM:SS string
        examDate: exams.exam_date, // Formatted MM/DD/YYYY string from list endpoint implies it might be here too
        examDuration: exams.exam_duration, // Map to camelCase
        examFee: exams.exam_fee, // Map to camelCase
      })
      .from(registeredExams)
      .innerJoin(exams, eq(registeredExams.exam_id, exams.id)) // Join with exams table
      .where(eq(registeredExams.application_id, applicationId)); // Filter by the application ID

    // Check if an exam was found
    if (!result.length) {
      return res.status(404).json({ error: `Registered exam with application ID "${applicationId}" not found` });
    }

    // Since application_id should be unique, we expect only one result
    const examDetails = result[0];

    // You might want to format dates/times here if needed,
    // although your list endpoint already formats exam_date.
    // Let's format appliedAt timestamp for consistency if displaying it.
     const formattedExamDetails = {
         ...examDetails,
         // Format appliedAt timestamp (if it's a Date object or parseable string)
         appliedAtFormatted: examDetails.appliedAt
             ? new Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(examDetails.appliedAt))
             : "N/A",
         // examDate is assumed formatted from the list endpoint logic
         // examTime and selectedExamTime remain raw strings (e.g., "09:00:00")
     };


    // Send the exam details
    res.json(formattedExamDetails); // Or res.json(examDetails) if no extra formatting needed

  } catch (error) {
    console.error(`Error fetching registered exam details for application ID ${req.params.applicationId}:`, error);
    res.status(500).json({ error: "Error fetching registered exam details" });
  }
};
const formatRegistrationForFrontend = (
  reg: typeof registeredExams.$inferSelect & {
      user: typeof usersDetails.$inferSelect | null; // Use | null for outer joins
      exam: typeof exams.$inferSelect | null;
      location: typeof examLocations.$inferSelect | null; // Optional location join
  }
) => {
  // Format dates if necessary, based on what frontend expects (MM/DD/YYYY or similar)
  const formattedExamDate = reg.exam?.exam_date
      ? new Intl.DateTimeFormat("en-US").format(new Date(reg.exam.exam_date))
      : "N/A";

  const formattedAppliedAt = reg.applied_at
       ? new Intl.DateTimeFormat("en-US", { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(reg.applied_at))
       : "N/A";

  return {
      application_id: reg.application_id,
      user_id: reg.user_id,
      exam_id: reg.exam_id,
      registration_date: formattedAppliedAt, // Using applied_at as registration_date
      status: reg.status,
      payment_status: 'completed', // Assuming payment is completed based on the mock data in your frontend. You'll need to fetch actual payment status.
    
      hall_ticket_url: reg.hall_ticket_url,
      exam_mode: reg.exam_mode, // Include exam_mode
      assigned_location: reg.assigned_location, // Include assigned_location string
      seat_number: reg.seat_number, // Include seat_number string
      selected_exam_time: reg.selected_exam_time, // Include selected_exam_time string

      user: reg.user ? {
          // Map user fields to match frontend User type
          name: reg.user.name,
          email: reg.user.email,
          // ... other user fields from frontend User type
      } : { name: 'N/A', email: 'N/A' }, // Handle case where user might be null (shouldn't happen with innerJoin)

      exam: reg.exam ? {
          // Map exam fields to match frontend Exam type
          name: reg.exam.name,
          exam_date: formattedExamDate, // Use formatted date
          exam_time: reg.exam.exam_time || reg.selected_exam_time, // Use exam_time or selected_exam_time
           // ... other exam fields from frontend Exam type (duration, fee if needed)
           exam_duration: reg.exam.exam_duration,
           exam_fee: reg.exam.exam_fee,
      } : { name: 'N/A', exam_date: 'N/A' }, // Handle case where exam might be null (shouldn't happen with innerJoin)

      location: reg.location ? {
          // Map location fields to match frontend Location type
          name:  reg.location.location, // Use location name or string location
          // ... other location fields from frontend Location type (address, city, state if you add them to examLocations schema)
           address: (reg.location as any).address, // Assuming address exists in examLocations
           city: (reg.location as any).city, // Assuming city exists
           state: (reg.location as any).state, // Assuming state exists
      } : undefined, // location can be undefined for online/pending registrations
  };
};


// --- GET /api/registrations - Fetch all registrations (Modified to fetch joined data) ---
export const getRegisteredExams = async (req: Request, res: Response) => {
  try {
      // Fetch all registered exams, joining with usersDetails, exams, and examLocations
      // Use .findMany with with to structure the output with nested objects
      const UserRegisteredExams = await db.query.registeredExams.findMany({
          with: {
              user: true, // Automatically joins usersDetails where user_id matches
              exam: true, // Automatically joins exams where exam_id matches
              location: true, // Automatically joins examLocations where location_id matches (assuming location_id exists in registeredExams and links to examLocations)
                             // If assigned_location in registeredExams is just a string, you might need a different approach,
                             // maybe a leftJoin and then manually find the location details.
                             // Let's assume for now location_id exists in registeredExams linking to examLocations.
          },
          // Add orderBy if needed (e.g., orderBy: registeredExams.applied_at)
      });

      // If no registered exams found, return empty array (200 OK with empty data)
      // Returning 404 for no results can be misleading, 200 with empty array is standard for lists
       if (!UserRegisteredExams || UserRegisteredExams.length === 0) {
           return res.json([]);
       }


      // Format the fetched data to match the frontend's Registration type structure
      // This involves flattening the joined results into the nested objects
      const formattedRegistrations = UserRegisteredExams.map(formatRegistrationForFrontend);


      // Send the formatted list of registered exams
      res.json(formattedRegistrations);

  } catch (error) {
      console.error("Error fetching registered exams:", error);
      // More specific error handling based on error type might be needed
      res.status(500).json({ error: "Error fetching registered exams" });
  }
};


// --- GET /api/registrations/:applicationId - Get single registration details (Modified) ---



// --- POST /api/registrations/:applicationId/approve - Approve a registration ---
export const approveRegistration = async (req: Request, res: Response) => {
  const { applicationId } = req.params;
  // You could potentially get admin user ID from req.user if using authentication
  // const adminId = req.user.id;

  try {
      // 1. Find the registration and check its current status/payment
      const registration = await db.query.registeredExams.findFirst({
          where: eq(registeredExams.application_id, applicationId),
           with: { // Join to get related data for potential hall ticket generation details
               user: true,
               exam: true,
               location: true, // Include location if assigned during registration
           }
      });

      if (!registration) {
          return res.status(404).json({ error: 'Registration not found.' });
      }

       // Optional: Check if payment is completed
       // if (registration.payment_status !== 'completed') {
       //     return res.status(400).json({ error: 'Payment is not completed for this registration.' });
       // }

      if (registration.status !== 'pending') {
          return res.status(400).json({ error: `Registration status is already "${registration.status}". Cannot approve.` });
      }

      // 2. Generate Hall Ticket (Simulated)
      // --- In a real application, implement PDF generation logic here ---
      // This involves fetching necessary details (student name, exam name, date, time, location, seat no, etc.)
      // using the data from the 'registration' object fetched above.
      // You would use a library like 'pdfmake', 'html-pdf', 'puppeteer' (for headless browser rendering)
      // or interact with a dedicated PDF generation service.
      // After generating the PDF, you'd upload it to cloud storage (AWS S3, Google Cloud Storage, etc.)
      // and get a public URL.

      // --- Simulation: Generate a mock Hall Ticket URL ---
       const mockHallTicketUrl = `http://your-storage-service.com/hall-tickets/${applicationId}-${Date.now()}.pdf`; // Replace with your actual storage URL pattern

      // 3. Update registration status and hall_ticket_url in the database
      await db.update(registeredExams)
          .set({
              status: 'approved',
              hall_ticket_url: mockHallTicketUrl,
              // You might want to add an 'approved_by' field linked to the admin user
              // approved_at: new Date(),
          })
          .where(eq(registeredExams.application_id, applicationId));

      // 4. Fetch the updated registration record to return to the frontend
      const updatedRegistration = await db.query.registeredExams.findFirst({
          where: eq(registeredExams.application_id, applicationId),
           with: { // Ensure related data is included for the frontend table/details update
               user: true,
               exam: true,
               location: true, // Include location if assigned during registration
           }
      });

       if (!updatedRegistration) {
            // This case should ideally not happen if the update was successful
            console.error(`Failed to refetch approved registration ${applicationId}`);
            return res.status(500).json({ error: 'Registration approved, but failed to retrieve updated details.' });
       }


      // 5. Send success response with the updated registration data
       res.status(200).json({
           message: `Registration ${applicationId} approved successfully. Hall ticket generated.`,
           registration: formatRegistrationForFrontend(updatedRegistration), // Format the updated registration for frontend
       });

       // Optional: Trigger email notification service here to send the hall ticket URL to the user
       // sendHallTicketEmail(registration.user.email, mockHallTicketUrl);

  } catch (error) {
      console.error(`Error approving registration ${applicationId}:`, error);
      res.status(500).json({ error: 'Failed to approve registration.' });
  }
};

// --- POST /api/registrations/:applicationId/reject - Reject a registration ---
export const rejectRegistration = async (req: Request, res: Response) => {
  const { applicationId } = req.params;
   const { rejectReason } = req.body; // Get reason from request body
  // You could potentially get admin user ID from req.user if using authentication
  // const adminId = req.user.id;

  try {
      // 1. Find the registration and check its current status
      const registration = await db.query.registeredExams.findFirst({
          where: eq(registeredExams.application_id, applicationId),
           with: { // Join to get related user/exam data for potential email notification
               user: true,
               exam: true,
           }
      });

      if (!registration) {
          return res.status(404).json({ error: 'Registration not found.' });
      }

      if (registration.status !== 'pending') {
          return res.status(400).json({ error: `Registration status is already "${registration.status}". Cannot reject.` });
      }

      // 2. Update registration status in the database
      await db.update(registeredExams)
          .set({
              status: 'rejected',
               // Add a 'reject_reason' column to your schema if you want to store this
               // reject_reason: rejectReason || null,
               hall_ticket_url: null, // Remove hall ticket URL if previously generated/assigned
               assigned_location: null, // Remove assigned location
               seat_number: null, // Remove seat number
              // rejected_at: new Date(),
          })
          .where(eq(registeredExams.application_id, applicationId));

      // 3. Fetch the updated registration record to return to the frontend
      const updatedRegistration = await db.query.registeredExams.findFirst({
          where: eq(registeredExams.application_id, applicationId),
           with: { // Ensure related data is included for the frontend table/details update
               user: true,
               exam: true,
               location: true, // Include location even if null after rejection
           }
      });

       if (!updatedRegistration) {
            console.error(`Failed to refetch rejected registration ${applicationId}`);
            return res.status(500).json({ error: 'Registration rejected, but failed to retrieve updated details.' });
       }


      // 4. Send success response with the updated registration data
       res.status(200).json({
           message: `Registration ${applicationId} rejected successfully.`,
           registration: formatRegistrationForFrontend(updatedRegistration), // Format the updated registration for frontend
       });

       // Optional: Trigger email notification service here to inform the user of rejection
       // sendRejectionEmail(registration.user.email, rejectReason);

  } catch (error) {
      console.error(`Error rejecting registration ${applicationId}:`, error);
      res.status(500).json({ error: 'Failed to reject registration.' });
  }
};

