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
import { examLocations, exams } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const getExams = async (req: Request, res: Response) => {
    try {
        const examList = await db.select().from(exams);
        res.json(examList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch exams" });
    }
};

//export const createExams = async (req: Request, res: Response) => {
    // try {
    //     const { id, name, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites, locations } = req.body;
        
    //     if (!id || !name || !exam_date || !exam_time || !exam_duration || !exam_fee || !exam_registrationEndDate || !exam_category || !exam_description || !exam_prerequisites || !locations) {
    //         return res.status(400).json({ error: "All fields are required!" });
    //     }

    //     // Insert exam details
    //     await db.insert(exams).values({
    //         id, name, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites
    //     });

    //     // Insert exam locations
    //     for (const loc of locations) {
    //         await db.insert(examLocations).values({
    //             exam_id: id,
    //             location: loc.name,
    //             total_seats: loc.total_seats,
    //             filled_seats: 0, // Initially, no seats are filled
    //         });
    //     }

    //     res.json({ success: true, message: "Exam created successfully!" });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: "Failed to create exam" });
    // }
// };

export const createExams = async (req: Request, res: Response) => {
  try {
      const { id, name, exam_mode, exam_time_selection, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites, locations } = req.body;

      if (!id || !name || !exam_mode || !exam_time_selection || !exam_date || !exam_duration || !exam_fee || !exam_registrationEndDate || !exam_category || !exam_description) {
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



// export const editExams = async (req: Request, res: Response) => {
//     try {
//         const Examid = req.params.id;
//         const {
//             name, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites, locations
//         } = req.body;

//         // Fetch existing exam record
//         const existingExam = await db.select().from(exams).where(eq(exams.id, Examid)).then((res) => res[0]);

//         if (!existingExam) {
//             return res.status(404).json({ error: "Exam not found" });
//         }

//         // Construct update object with only modified fields
//         const updatedFields: Partial<typeof exams.$inferInsert> = {};
//         const fieldsToUpdate = { name, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites };
        
//         Object.keys(fieldsToUpdate).forEach((key) => {
//             if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] !== existingExam[key as keyof typeof existingExam]) {
//                 updatedFields[key as keyof typeof exams.$inferInsert] = fieldsToUpdate[key as keyof typeof fieldsToUpdate];
//             }
//         });

//         // If no changes, return early
//         if (Object.keys(updatedFields).length > 0) {
//             await db.update(exams).set(updatedFields).where(eq(exams.id, Examid));
//         }

//         // ✅ Update locations
//         if (locations && Array.isArray(locations)) {
//             for (const loc of locations) {
//                 const existingLocation = await db.select()
//                     .from(examLocations)
//                     .where(and(eq(examLocations.exam_id, Examid), eq(examLocations.location, loc.name)))
//                     .then((res) => res[0]);

//                 if (existingLocation) {
//                     // Update existing location
//                     await db.update(examLocations)
//                         .set({
//                             total_seats: loc.total_seats,
//                             filled_seats: loc.filled_seats ?? existingLocation.filled_seats,
//                         })
//                         .where(and(eq(examLocations.exam_id, Examid), eq(examLocations.location, loc.name)));
//                 } else {
//                     // Insert new location
//                     await db.insert(examLocations).values({
//                         exam_id: Examid,
//                         location: loc.name,
//                         total_seats: loc.total_seats,
//                         filled_seats: 0,
//                     });
//                 }
//             }
//         }

//         res.status(200).json({ message: "Exam updated successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Failed to edit exam" });
//     }
// };


export const editExams = async (req: Request, res: Response) => {
  try {
      const Examid = req.params.id;
      const { name, exam_mode, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites, locations } = req.body;

      const existingExam = await db.select().from(exams).where(eq(exams.id, Examid)).then((res) => res[0]);

      if (!existingExam) {
          return res.status(404).json({ error: "Exam not found" });
      }

      const updatedFields: Partial<typeof exams.$inferInsert> = {};
      const fieldsToUpdate = { name, exam_mode, exam_date, exam_time, exam_duration, exam_fee, exam_registrationEndDate, exam_category, exam_description, exam_prerequisites };

      Object.keys(fieldsToUpdate).forEach((key) => {
          if (fieldsToUpdate[key as keyof typeof fieldsToUpdate] !== existingExam[key as keyof typeof existingExam]) {
              updatedFields[key as keyof typeof exams.$inferInsert] = fieldsToUpdate[key as keyof typeof fieldsToUpdate];
          }
      });

      if (Object.keys(updatedFields).length > 0) {
          await db.update(exams).set(updatedFields).where(eq(exams.id, Examid));
      }

      // If exam is changed to online, remove locations
      if (exam_mode === "online") {
          await db.delete(examLocations).where(eq(examLocations.exam_id, Examid));
      }

      // If exam is offline, update/add locations
      if (exam_mode === "offline" && locations) {
          for (const loc of locations) {
              const existingLocation = await db.select()
                  .from(examLocations)
                  .where(and(eq(examLocations.exam_id, Examid), eq(examLocations.location, loc.name)))
                  .then((res) => res[0]);

              if (existingLocation) {
                  await db.update(examLocations)
                      .set({ total_seats: loc.total_seats, filled_seats: loc.filled_seats ?? existingLocation.filled_seats })
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
