import { sql } from "drizzle-orm";
import { check,mysqlTable, varchar, int, text, foreignKey, date, timestamp, mysqlEnum, time, decimal, datetime } from "drizzle-orm/mysql-core";
import { application } from "express";

// Students Table
export const students = mysqlTable("students", {
  id: int("id").primaryKey().autoincrement(),
  usn: varchar("usn", { length: 50 }).notNull().unique(),
  studentId: varchar("studentId", { length: 50 }).unique().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  program: varchar("program", { length: 100 }).notNull(),
  college: varchar("college", { length: 255 }).notNull(),
  examCenter: varchar("examCenter", { length: 255 }).notNull(),
  photo: text("photo"), // Store image URL or base64 string
});

// Courses Table (linked to students)
export const courses = mysqlTable("courses", {
  id: int("id").primaryKey().autoincrement(),
  studentId: varchar("studentId", { length: 50 })
    .notNull()
    .references(() => students.studentId, { onDelete: "cascade" }),
  slNo: int("slNo").notNull(),
  sem: int("sem").notNull(),
  courseCode: varchar("courseCode", { length: 50 }).notNull(),
  courseTitle: varchar("courseTitle", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  dateTime: varchar("dateTime", { length: 255 }), // Store date as string
});

export const users = mysqlTable("users",{
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  phone:varchar("phone", { length: 10 }).notNull(),
  dob:date("dob").notNull(),
  gender:mysqlEnum("gender",["male","female","other"]).notNull(),
  address:varchar("address", { length: 255 }).notNull(),
  city:varchar("city", { length: 255 }).notNull(),
  state:varchar("state", { length: 255 }).notNull(),
  zipCode:varchar("zipCode", { length: 10 }).notNull(),
  createdAt:timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
},
  (table) => [
    check("phone_no_check",sql`LENGTH(${table.phone})=10`),
  ]
)

export const exams = mysqlTable("exams",{
  id:varchar("id",{length:50}).primaryKey(),
  name:varchar("name",{length:250}).notNull().unique(),
  exam_date:date("exam_date").notNull(),
  exam_time:time("exam_time").notNull(),
  exam_duration:varchar("exam_duration",{length:250}).notNull(),
  exam_fee: decimal("fee", { precision: 10, scale: 2 }).notNull(), // Course Fee ($50)
  exam_registrationEndDate: date("registration_end_date").notNull(), // Last Date for Registration
  exam_category: varchar("category", { length: 100 }).notNull(), // Course Category (e.g., "Mathematics")
  exam_description: text("description").notNull(), // Detailed Course Description
  exam_prerequisites: text("prerequisites"), // Course Prerequisites
  exam_createdAt:timestamp('exam_createdAt').notNull().defaultNow()
})

export const examLocations = mysqlTable("exam_locations", {
  id: int("id").primaryKey().autoincrement(),
  exam_id: varchar("exam_id", { length: 50 }).notNull().references(() => exams.id, { onDelete: "cascade" }), 
  location: varchar("location", { length: 255 }).notNull(),
  total_seats: int("total_seats").notNull(), 
  filled_seats: int("filled_seats").notNull().default(0), // Tracks booked seats
});

export const preferredLocations = mysqlTable("preferred_locations", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exam_id: varchar("exam_id", { length: 50 }).notNull().references(() => exams.id, { onDelete: "cascade" }),
  preference_1: varchar("preference_1", { length: 255 }).notNull(),
  preference_2: varchar("preference_2", { length: 255 }).notNull(),
  preference_3: varchar("preference_3", { length: 255 }).notNull(),
});

export const registeredExams = mysqlTable("registered_exams", {
  id: varchar("id", { length: 50 }).primaryKey(),
  application_id: varchar("application_id", { length: 50 }).notNull().unique(),
  user_id: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exam_id: varchar("exam_id", { length: 50 }).notNull().references(() => exams.id, { onDelete: "cascade" }),
  assigned_location: varchar("assigned_location", { length: 255 }).notNull(),
  seat_number: varchar("seat_number", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["approved", "pending", "rejected"]).notNull().default("pending"),
  applied_at: timestamp("applied_at").notNull().defaultNow(),
  hall_ticket_url: text("hall_ticket_url"),
});
