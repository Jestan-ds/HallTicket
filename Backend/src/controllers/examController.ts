// import { Request, Response } from "express";
// import { db } from "../db/index";
// import { examLocations, exams } from "../db/schema";
// import { eq } from "drizzle-orm";

// export const getExams = async (req: Request, res: Response) => {
//     try {
//         const examList = await db.select().from(exams);
//         res.json(examList);
//     }
//     catch (error) {
//         res.status(500).json({ error: "Failed to fetch exams" });
//     }
// };

// export const createExams = async (req: Request, res: Response) => {
//     try{
//         const {id,name,exam_date,exam_time,exam_duration,exam_fee,exam_registrationEndDate,exam_category,exam_description,exam_prerequisites,locations} = req.body;
        
//         if(!id||!name||!exam_date||!exam_time||!exam_duration||!exam_fee||!exam_registrationEndDate||!exam_category||!exam_description||!exam_prerequisites||!locations){
//             return res.status(400).json({ error: "All fields are required!" });
//         }
//         await db.insert(exams).values({id,name,exam_date,exam_time,exam_duration,exam_fee,exam_registrationEndDate,exam_category,exam_description,exam_prerequisites});
//         for (const loc of locations) {
//             await db.insert(examLocations).values({
//                 exam_id:id,
//                 location: loc.name,
//                 total_seats: loc.total_seats,
//                 filled_seats: loc.total_seats, // Initially, all seats are available
//             });
//         }
//         res.json({ success: true, message: "Exams created successfully!" });
//     }catch(error){
//         res.status(500).json({ error: "Failed to create exams" });
//     }
// }

// export const editExams = async (req: Request, res: Response) => {
//   try {
//     const Examid = req.params.id;
//     const {
//       id,
//       name,
//       exam_date,
//       exam_time,
//       exam_duration,
//       exam_fee,
//       exam_registrationEndDate,
//       exam_category,
//       exam_description,
//       exam_prerequisites,
//       locations,
//     } = req.body;

//     const existingExam = await db
//       .select()
//       .from(exams)
//       .where(eq(exams.id, Examid))
//       .then((res) => res[0]);

//     if (!existingExam) {
//       return res.status(404).json({ error: "Exam not found" });
//     }

//     // Filter out only changed fields
//     const updatedFields = {
//       id,
//       name,
//       exam_date,
//       exam_time,
//       exam_duration,
//       exam_fee,
//       exam_registrationEndDate,
//       exam_category,
//       exam_description,
//       exam_prerequisites,
//     };

//     const modifiedFields: Partial<typeof exams.$inferInsert> = {};
//     Object.keys(updatedFields).forEach((key) => {
//       if (
//         updatedFields[key as keyof typeof updatedFields] !==
//         existingExam[key as keyof typeof existingExam]
//       ) {
//         modifiedFields[key as keyof typeof exams.$inferInsert] =
//           updatedFields[key as keyof typeof updatedFields];
//       }
//     });

//     // If no fields were modified, return early
//     if (Object.keys(modifiedFields).length === 0) {
//       return res.status(400).json({ message: "No changes detected" });
//     }

//     // Update only modified fields
//     await db
//       .update(exams)
//       .set(modifiedFields)
//       .where(eq(exams.id, Examid));

//     // Optionally update locations if provided
//     if (locations) {
//       for (const loc of locations) {
//         await db.update(examLocations)
//           .set({
//             location: loc.name,
//             total_seats: loc.total_seats,
//             filled_seats: loc.filled_seats,
//           })
//           .where(eq(examLocations.exam_id, Examid));
//       }
//     }

//     res.status(200).json({ message: "Exam updated successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to edit exam" });
//   }
// };

// export const deleteExams = async (req: Request, res: Response) => {
//     try {
//         const Examid = req.params.id;
//         await db.delete(exams).where(eq(exams.id, Examid));
//         await db.delete(examLocations).where(eq(examLocations.exam_id, Examid));
//         res.status(200).json({ message: "Exam deleted successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to delete exam" });
//     }
// }

// export const getExam = async (req: Request, res: Response) => {
//     try{
//         const Examid =  req.params.id
//         const examData = await db.select().from(exams).where(eq(exams.id,Examid));
//         if(examData.length===0){
//             return res.status(404).json({error:"Exam not found"});
//         }
//         const examLocation = await db. select().from(examLocations).where(eq(examLocations.exam_id,Examid));
//         res.json({examData,examLocation});
        

//     }
//     catch(error){
//        return res.status(500).json({ error: "Failed to fetch exam" });
//     }
// }


import { Request, Response } from "express";
import { db } from "../db/index";
import { examLocations, exams, usersAuth,registeredExams} from "../db/schema";
import { eq, and,count } from "drizzle-orm";

export const getExams = async (req: Request, res: Response) => {
    try {
        // Fetch all exams from the database
        // This query will return the exam_time as it is stored in the database (expected HH:MM:SS)
        const examList = await db.select().from(exams);

        // Map over the exam list to format dates and fetch locations for offline exams
        const formattedExamList = await Promise.all(examList.map(async (exam) => {
            // **Keep date formatting as needed for frontend display**
            // Intl.DateTimeFormat('en-US') typically gives MM/DD/YYYY.
            // Ensure your frontend date pickers/inputs handle this or adjust formatting here/there.
            const formattedDate = exam.exam_date
                ? new Intl.DateTimeFormat('en-US').format(new Date(exam.exam_date))
                : 'N/A'; // Added null/undefined check
            const formattedRegistrationEndDate = exam.exam_registrationEndDate
                ? new Intl.DateTimeFormat('en-US').format(new Date(exam.exam_registrationEndDate))
                : 'N/A'; // Added null/undefined check


            // **REMOVE or comment out the formatting logic for exam_time**
            // This part was converting HH:MM:SS to H:MM AM/PM, causing the issue.
            // let formattedTime = "N/A";
            // if (exam.exam_time) {
            //     const [hours, minutes] = exam.exam_time.split(':').map(Number);
            //     const timeDate = new Date(0, 0, 0, hours, minutes);
            //     formattedTime = new Intl.DateTimeFormat('en-US', {
            //         hour: 'numeric',
            //         minute: 'numeric',
            //         hour12: true, // THIS WAS THE CULPRIT
            //     }).format(timeDate);
            // }


            let examLocationData: Array<{ location: string; total_seats: number; filled_seats: number }> = [];

            if (exam.exam_mode === "offline") {
                examLocationData = await db.select({
                    location: examLocations.location,
                    total_seats: examLocations.total_seats,
                    filled_seats: examLocations.filled_seats,
                }).from(examLocations).where(eq(examLocations.exam_id, exam.id));
            }

            // Return the exam data
            return {
                ...exam, // Includes the original exam.exam_time directly from the DB (expected HH:MM:SS)
                // Overwrite formatted dates
                exam_date: formattedDate,
                exam_registrationEndDate: formattedRegistrationEndDate,
                // **DO NOT overwrite exam_time here with a formatted value.**
                // The `...exam` spread operator already includes the original `exam_time`.
                // exam_time: formattedTime, // <-- REMOVE or comment out this line

                locations: exam.exam_mode === 'offline' && examLocationData.length > 0 ? examLocationData : undefined, // Only include for offline with locations
                // Optionally calculate and include total/filled seats at the exam level for list display
                total_seats: exam.exam_mode === 'offline' && examLocationData.length > 0
                             ? examLocationData.reduce((sum, loc) => sum + (loc.total_seats || 0), 0)
                             : undefined,
                filled_seats: exam.exam_mode === 'offline' && examLocationData.length > 0
                              ? examLocationData.reduce((sum, loc) => sum + (loc.filled_seats || 0), 0)
                              : undefined,
            };
        }));

        // Send the formatted list of exams with embedded location data
        // The `exam_time` field in the response objects will now contain the raw time from the DB (e.g., "14:00:00")
        res.json({ success: true, data: formattedExamList });

    } catch (error) {
        console.error("Error fetching exams with locations:", error);
        res.status(500).json({ error: "Failed to fetch exams" });
    }
};



export const createExams = async (req: Request, res: Response) => {
  try {
      const { id, name, exam_mode, exam_time_selection, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites, locations } = req.body;
      console.log(req.body);

      if ( !name || !exam_mode || !exam_time_selection || !exam_date || !exam_duration  || !exam_registrationEndDate || !exam_category || !exam_description) {
          return res.status(400).json({ error: "All fields are required!" });
      }

      if (exam_mode === "offline" && (!locations || locations.length === 0)) {
          return res.status(400).json({ error: "Locations are required for offline exams!" });
      }

      if (exam_mode === "online" && exam_time_selection === "fixed" && !exam_time) {
          return res.status(400).json({ error: "Exam time is required for fixed-time online exams!" });
      }

      await db.insert(exams).values({
          id, name, exam_mode, exam_time_selection, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites
      });

      if (exam_mode === "offline") {
          for (const loc of locations) {
              await db.insert(examLocations).values({
                  exam_id: id,
                  location: loc.name,
                  total_seats: loc.total_seats,
                  filled_seats: 0,
              });
          }
      }

      res.json({ success: true, message: "Exam created successfully!" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create exam" });
  }
};



export const editExams = async (req: Request, res: Response) => {
    try {
        const Examid = req.params.id;
        const { name, exam_mode, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites, locations } = req.body;

        // Fetch existing exam
        const existingExam = await db.select().from(exams).where(eq(exams.id, Examid)).then((res) => res[0]);

        if (!existingExam) {
            return res.status(404).json({ error: "Exam not found" });
        }

        // Only update fields that are different and not undefined
        const fieldsToUpdate = {
            name, exam_mode, exam_date, exam_time, exam_duration,
            exam_fee, exam_registrationEndDate, exam_category,
            exam_description, exam_prerequisites
        };

        const filteredFieldsToUpdate = Object.fromEntries(
            Object.entries(fieldsToUpdate)
                .filter(([key, value]) => value !== undefined && value !== existingExam[key as keyof typeof existingExam])
        );

        // Perform update only if there are changes
        if (Object.keys(filteredFieldsToUpdate).length > 0) {
            await db.update(exams).set(filteredFieldsToUpdate).where(eq(exams.id, Examid));
        }

        // Handle exam mode changes
        if (exam_mode) {
            if (exam_mode === "online") {
                // Remove locations if mode is switched to online
                await db.delete(examLocations).where(eq(examLocations.exam_id, Examid));
            } else if (exam_mode === "offline" && locations) {
                // Update/add locations for offline exams
                for (const loc of locations) {
                    const existingLocation = await db.select()
                        .from(examLocations)
                        .where(and(eq(examLocations.exam_id, Examid), eq(examLocations.location, loc.name)))
                        .then((res) => res[0]);

                    if (existingLocation) {
                        await db.update(examLocations)
                            .set({
                                total_seats: loc.total_seats,
                                filled_seats: loc.filled_seats ?? existingLocation.filled_seats
                            })
                            .where(and(eq(examLocations.exam_id, Examid), eq(examLocations.location, loc.name)));
                    } else {
                        await db.insert(examLocations).values({
                            exam_id: Examid,
                            location: loc.name,
                            total_seats: loc.total_seats,
                            filled_seats: 0,
                        });
                    }
                }
            }
        }

        res.status(200).json({ message: "Exam updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to edit exam" });
    }
};


export const deleteExams = async (req: Request, res: Response) => {
    try {
        const Examid = req.params.id;
        
        // First, delete related exam locations
        await db.delete(examLocations).where(eq(examLocations.exam_id, Examid));

        // Then, delete the exam itself
        await db.delete(exams).where(eq(exams.id, Examid));

        res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete exam" });
    }
};

// export const getExam = async (req: Request, res: Response) => {
//     try {
//         const Examid = req.params.id;
        
//         // Fetch exam details
//         const examData = await db.select().from(exams).where(eq(exams.id, Examid));

//         if (examData.length === 0) {
//             return res.status(404).json({ error: "Exam not found" });
//         }

//         // Fetch related exam locations
//         const examLocation = await db.select().from(examLocations).where(eq(examLocations.exam_id, Examid));

//         res.json({ examData, examLocation });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to fetch exam" });
//     }
// };


export const getExam = async (req: Request, res: Response) => {
  try {
      const Examid = req.params.id;
      
      const examData = await db.select().from(exams).where(eq(exams.id, Examid));

      if (examData.length === 0) {
          return res.status(404).json({ error: "Exam not found" });
      }

      let examLocation: Array<{}> = [];

      if (examData[0].exam_mode === "offline") {
          examLocation = await db.select().from(examLocations).where(eq(examLocations.exam_id, Examid));
      }

      res.json({ examData, examLocation });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch exam" });
  }
};
export const getTotalStudents = async (req: Request, res: Response) => {
    try {
        // Query the usersDetails table and count all rows where role is 'student'
        // Assuming your usersDetails table has a 'role' column
        const result = await db.select({
            totalStudents: count()
        }).from(usersAuth).where(eq(usersAuth.role, 'student')); // Adjust 'student' role value if different

        // The count result is an array with one object { totalStudents: number }
        const totalStudents = result[0]?.totalStudents || 0;

        res.json({ success: true, data: { totalStudents } });

    } catch (error) {
        console.error("Error fetching total students:", error);
        res.status(500).json({ error: "Failed to fetch total students" });
    }
};

/**
 * @route GET /api/admin/stats/registrations/counts
 * @description Gets the counts of registrations by status (e.g., pending, approved).
 */
export const getRegistrationCounts = async (req: Request, res: Response) => {
    try {
        // Query the registeredExams table, group by status, and count registrations in each status
        const result = await db.select({
            status: registeredExams.status,
            count: count()
        }).from(registeredExams).groupBy(registeredExams.status);

        // Format the result into a more easily consumable object
        // Example: { pending: 45, approved: 189, rejected: 10, ... }
        const registrationCounts: { [key: string]: number } = {};
        result.forEach(row => {
            if (row.status) { // Ensure status is not null
                registrationCounts[row.status] = row.count;
            }
        });

        // You can also explicitly include counts for specific statuses, defaulting to 0 if not found
        const formattedCounts = {
             pending: registrationCounts['pending'] || 0,
             approved: registrationCounts['approved'] || 0,
             // Add other statuses if needed, e.g.,
             // rejected: registrationCounts['rejected'] || 0,
             // completed: registrationCounts['completed'] || 0,
             // ...
        };


        res.json({ success: true, data: formattedCounts });

    } catch (error) {
        console.error("Error fetching registration counts:", error);
        res.status(500).json({ error: "Failed to fetch registration counts" });
    }
};
