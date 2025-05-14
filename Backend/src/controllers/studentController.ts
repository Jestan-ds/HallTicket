import { Request, Response } from "express";
import { db } from "../db/index";
import { students } from "../db/schema"; // Your Drizzle schema for students
import xlsx from "xlsx";

// Interface matching the expected Excel columns
interface ExcelStudentData {
    "Application Number": string;
    "Roll Number"?: string;
    "Candidate's Name": string;
    "Gender"?: string;
    "Category"?: string;
    "Date of Birth (YYYY-MM-DD)": string | number | Date;
    "Person with Disability"?: string; // This is the field in question
    "Scribe Required"?: string;
    "Exam Name": string;
    "Paper Medium"?: string;
    "Date of Examination (YYYY-MM-DD)": string | number | Date;
    "Reporting Time (HH:MM AM/PM)"?: string | number | Date;
    "Gate Closing Time (HH:MM AM/PM)"?: string | number | Date;
    "Timing of Test (HH:MM AM/PM - HH:MM AM/PM)"?: string;
    "Test Centre Number"?: string;
    "Venue of Test": string;
}

export async function getStudents(req: Request, res: Response) {
  try {
    const studentList = await db.select().from(students).orderBy(students.uploadedAt);
    res.json({ success: true, data: studentList });
  } catch (error) {
    console.error("Failed to fetch students:", error);
    res.status(500).json({ success: false, error: "Failed to fetch students" });
  }
}

export async function uploadStudents(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: "buffer", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json<ExcelStudentData>(sheet);

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid or empty Excel file. No data found." });
        }

        const newStudentsToInsert = jsonData.map((row, index) => {
            if (!row["Application Number"] || !row["Candidate's Name"] || !row["Exam Name"] || !row["Date of Examination (YYYY-MM-DD)"] || !row["Venue of Test"]) {
                console.warn(`Skipping row ${index + 2} due to missing required fields: Application Number, Candidate's Name, Exam Name, Date of Examination, or Venue of Test.`);
                return null;
            }

            const parseExcelDateOrTime = (excelValue: string | number | Date | undefined): Date | null => {
                if (excelValue === undefined || excelValue === null) return null;
                if (excelValue instanceof Date) {
                    return !isNaN(excelValue.getTime()) ? excelValue : null;
                }
                if (typeof excelValue === 'number') {
                    const jsDate = xlsx.SSF.parse_date_code(excelValue);
                    if (jsDate) {
                        return new Date(jsDate.y, jsDate.m - 1, jsDate.d, jsDate.H || 0, jsDate.M || 0, jsDate.S || 0);
                    }
                }
                if (typeof excelValue === 'string') {
                    const parsed = new Date(excelValue);
                    if (!isNaN(parsed.getTime())) return parsed;
                     // Try to parse time string like "HH:MM AM/PM" if date parsing fails
                    const today = new Date();
                    const timeParts = excelValue.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
                    if (timeParts) {
                        let hours = parseInt(timeParts[1], 10);
                        const minutes = parseInt(timeParts[2], 10);
                        const ampm = timeParts[3];
                        if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
                        if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
                        return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
                    }
                }
                return null;
            };

            const dobDate = parseExcelDateOrTime(row["Date of Birth (YYYY-MM-DD)"]);
            const examDate = parseExcelDateOrTime(row["Date of Examination (YYYY-MM-DD)"]);
            const reportingTimeDate = parseExcelDateOrTime(row["Reporting Time (HH:MM AM/PM)"]);
            const gateClosingTimeDate = parseExcelDateOrTime(row["Gate Closing Time (HH:MM AM/PM)"]);

            const formatTimeToString = (dateObj: Date | null): string | null => {
                if (!dateObj || isNaN(dateObj.getTime())) return null;
                let hours = dateObj.getHours();
                const minutes = dateObj.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
                return `${hours}:${minutesStr} ${ampm}`;
            };

            // --- Logic for Option 2: Standardize/Truncate 'Person with Disability' ---
            let processedPwdValue: string | undefined = undefined;
            const pwdFromExcel = row["Person with Disability"];
            if (pwdFromExcel && typeof pwdFromExcel === 'string') {
                const pwdLower = pwdFromExcel.toLowerCase();
                if (pwdLower.startsWith('yes')) {
                    // Extract type of disability if present, e.g., "Yes (Locomotor)" -> "Yes (Loco)"
                    const match = pwdFromExcel.match(/yes\s*\(([^)]+)\)/i);
                    if (match && match[1]) {
                        // Take "Yes (" + first 4 chars of type + ")" = 5 + 4 + 1 = 10 chars
                        processedPwdValue = `Yes (${match[1].substring(0, 4)})`;
                    } else {
                        processedPwdValue = "Yes"; // Fits VARCHAR(10)
                    }
                } else if (pwdLower.startsWith('no')) {
                    processedPwdValue = "No"; // Fits VARCHAR(10)
                } else {
                    // If it's something else, truncate it to fit
                    processedPwdValue = pwdFromExcel.substring(0, 10);
                }
            } else if (pwdFromExcel) { // If it's a number or unexpected type, convert to string and truncate
                 processedPwdValue = String(pwdFromExcel).substring(0,10);
            }
            // Ensure it does not exceed 10 characters
            if (processedPwdValue && processedPwdValue.length > 10) {
                processedPwdValue = processedPwdValue.substring(0, 10);
            }
            // --- End of PwD processing logic ---

            return {
                applicationNumber: String(row["Application Number"]),
                rollNumber: String(row["Roll Number"] || row["Application Number"]),
                candidateName: String(row["Candidate's Name"]),
                gender: row["Gender"],
                category: row["Category"],
                dob: dobDate,
                personWithDisability: processedPwdValue, // Use the processed value
                scribeRequired: row["Scribe Required"],
                examName: String(row["Exam Name"]),
                paperMedium: row["Paper Medium"],
                dateOfExamination: examDate,
                reportingTime: formatTimeToString(reportingTimeDate),
                gateClosingTime: formatTimeToString(gateClosingTimeDate),
                timingOfTest: row["Timing of Test (HH:MM AM/PM - HH:MM AM/PM)"],
                testCentreNumber: row["Test Centre Number"],
                venueOfTest: String(row["Venue of Test"]),
            };
        }).filter(student => student !== null) as typeof students.$inferInsert[];

        if (newStudentsToInsert.length === 0) {
            return res.status(400).json({ success: false, error: "No valid student data found in the uploaded file after validation." });
        }

        // CAUTION: This deletes ALL students. Modify if you need to append or update.
        await db.delete(students);
        await db.insert(students).values(newStudentsToInsert);

        res.status(201).json({
            success: true,
            message: `${newStudentsToInsert.length} students uploaded and processed successfully!`,
            data: newStudentsToInsert
        });

    } catch (error: any) {
        console.error("Error uploading students:", error);
        if (error.code === 'ER_DATA_TOO_LONG') {
            return res.status(400).json({ success: false, error: `Data too long for a column. Please check Excel data and column definitions. Details: ${error.sqlMessage}` });
        }
        res.status(500).json({ success: false, error: "Error processing uploaded file: " + error.message });
    }
}