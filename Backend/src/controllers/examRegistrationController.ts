import { Request, Response } from 'express';
import { db } from '../db';
import { exams, examLocations, registeredExams, users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const examRegistration = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, dob, exam_id, locationPreferences, exam_mode, selected_exam_time } = req.body;

    if (!name || !email || !phone || !dob || !exam_id || !exam_mode) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const user = await db.select().from(users).where(eq(users.email, email));
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
      const [hours, minutes] = selected_exam_time.split(":").map(Number);
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