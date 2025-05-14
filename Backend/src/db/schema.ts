import { sql } from "drizzle-orm";
import {check,mysqlTable, varchar, int, text,  date, timestamp, mysqlEnum, time, decimal, datetime, boolean,primaryKey } from "drizzle-orm/mysql-core";


// Students Table
// export const students = mysqlTable("students", {
//   id: int("id").primaryKey().autoincrement(),
//   usn: varchar("usn", { length: 50 }).notNull().unique(),
//   studentId: varchar("studentId", { length: 50 }).unique().notNull(),
//   name: varchar("name", { length: 100 }).notNull(),
//   program: varchar("program", { length: 100 }).notNull(),
//   college: varchar("college", { length: 255 }).notNull(),
//   examCenter: varchar("examCenter", { length: 255 }).notNull(),
//   photo: text("photo"), // Store image URL or base64 string
// });

export const students = mysqlTable('students', {
  id: int('id').autoincrement().primaryKey(),
  rollNumber: varchar('roll_number', { length: 255 }).unique().notNull(),
  examName: varchar('exam_name', { length: 255 }), // Added Exam_Name
  applicationNumber: varchar('application_number', { length: 255 }).unique(),
  studentName: varchar('student_name', { length: 255 }).notNull(),
  fatherName: varchar('father_name', { length: 255 }),
  motherName: varchar('mother_name', { length: 255 }),
  dob: varchar('dob', { length: 255 }),
  category: varchar('category', { length: 255 }),
  gender: varchar('gender', { length: 255 }),
  pwd: varchar('pwd', { length: 255 }),
  examDate: varchar('exam_date', { length: 255 }),
  examShift: varchar('exam_shift', { length: 255 }),
  reportingTime: varchar('reporting_time', { length: 255 }),
  gateClosingTime: varchar('gate_closing_time', { length: 255 }),
  examTiming: varchar('exam_timing', { length: 255 }),
  centreName: text('centre_name'),
  centreAddress: text('centre_address'),
  photoPath: varchar('photo_path', { length: 255 }), // Stores Cloudinary URL
  signaturePath: varchar('signature_path', { length: 255 }), // Stores Cloudinary URL
});

// Courses Table (linked to students)
export const courses = mysqlTable("courses", {
  id: int("id").primaryKey().autoincrement(),
  studentId: varchar("studentId", { length: 50 })
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  slNo: int("slNo").notNull(),
  sem: int("sem").notNull(),
  courseCode: varchar("courseCode", { length: 50 }).notNull(),
  courseTitle: varchar("courseTitle", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  dateTime: varchar("dateTime", { length: 255 }), // Store date as string
});

export const usersDetails = mysqlTable("usersDetails",{
  id: int("id").primaryKey().autoincrement(),
  authId: int("authId").notNull().unique().references(() => usersAuth.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 10 }).notNull(),
  dob: date("dob").notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 255 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
},
  (table) => [
    check("phone_no_check",sql`LENGTH(${table.phone})=10`),
  ]
)


export const exams = mysqlTable("exams", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 250 }).notNull().unique(),
  exam_mode: mysqlEnum("exam_mode", ["online", "offline"]).notNull().default("offline"),
  exam_time_selection: mysqlEnum("exam_time_selection", ["fixed", "flexible"]).notNull().default("fixed"), // New column
  exam_date: date("exam_date").notNull(),
  exam_time: time("exam_time"), // If "fixed", this will be used
  exam_duration: varchar("exam_duration", { length: 250 }).notNull(),
  exam_fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
  exam_registrationEndDate: date("registration_end_date").notNull(),
  exam_category: varchar("category", { length: 100 }).notNull(),
  exam_description: text("description").notNull(),
  exam_prerequisites: text("prerequisites"),
  exam_createdAt: timestamp("exam_createdAt").notNull().defaultNow(),
});


export const examLocations = mysqlTable("exam_locations", {
  id: int("id").primaryKey().autoincrement(),
  exam_id: varchar("exam_id", { length: 50 }).notNull().references(() => exams.id, { onDelete: "cascade" }), 
  location: varchar("location", { length: 255 }).notNull(),
  total_seats: int("total_seats").notNull(), 
  filled_seats: int("filled_seats").notNull().default(0), // Tracks booked seats
});

export const preferredLocations = mysqlTable("preferred_locations", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull().references(() => usersDetails.id, { onDelete: "cascade" }),
  exam_id: varchar("exam_id", { length: 50 }).notNull().references(() => exams.id, { onDelete: "cascade" }),
  preference_1: varchar("preference_1", { length: 255 }).notNull(),
  preference_2: varchar("preference_2", { length: 255 }).notNull(),
  preference_3: varchar("preference_3", { length: 255 }).notNull(),
});
export const registeredExams = mysqlTable("registered_exams", {
  id: varchar("id", { length: 50 }).primaryKey(),
  application_id: varchar("application_id", { length: 50 }).notNull().unique(),
  user_id: int("user_id").notNull().references(() => usersDetails.id, { onDelete: "cascade" }),
  exam_id: varchar("exam_id", { length: 50 }).notNull().references(() => exams.id, { onDelete: "cascade" }),
  exam_mode: mysqlEnum("exam_mode", ["online", "offline"]).notNull(), // Stores mode of exam
  assigned_location: varchar("assigned_location", { length: 255 }), // NULL if online
  seat_number: varchar("seat_number", { length: 10 }), // NULL if online
  selected_exam_time: time("selected_exam_time"), // NULL if offline
  status: mysqlEnum("status", ["approved", "pending", "rejected"]).notNull().default("pending"),
  applied_at: timestamp("applied_at").notNull().defaultNow(),
  hall_ticket_url: text("hall_ticket_url"),
  
});

export const usersAuth = mysqlTable("usersAuth", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "student", "superadmin"]).notNull().default("student"),
  isVerified: boolean("isVerified").default(false),
  name: varchar("name", { length: 255 }).notNull(),
});

export const notifications = mysqlTable('notifications', {
  // Use varchar for UUIDs in MySQL, assuming application-side generation
  id: varchar('id', { length: 36 }).primaryKey(), // UUIDs are typically 36 chars
  message: text('message').notNull(),
  // Target can be 'all' or a specific exam_id (string)
  target: varchar('target', { length: 255 }).notNull(), // 'all' or exam_id (assuming exam_id is varchar(50))
  created_at: timestamp('created_at').defaultNow().notNull(),
  
});

// New: Linking table for user-specific notifications
export const userNotifications = mysqlTable('user_notifications', {
  notification_id: varchar('notification_id', { length: 36 }) // Reference notifications.id (varchar)
    .references(() => notifications.id, { onDelete: 'cascade' }) // Cascade delete if notification is removed
    .notNull(),
  user_id: int('user_id') // Reference usersDetails.id (int)
    .references(() => usersDetails.id, { onDelete: 'cascade' }) // Cascade delete if user is removed
    .notNull(),
  read_at: timestamp('read_at'), // Timestamp when the user read the notification
}, (t) => ({
  // Define a composite primary key for MySQL
  pk: primaryKey(t.notification_id, t.user_id),
}));

