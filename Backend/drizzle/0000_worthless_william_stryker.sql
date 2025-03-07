CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` varchar(50) NOT NULL,
	`slNo` int NOT NULL,
	`sem` int NOT NULL,
	`courseCode` varchar(50) NOT NULL,
	`courseTitle` varchar(255) NOT NULL,
	`type` varchar(50) NOT NULL,
	`dateTime` varchar(255),
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usn` varchar(50) NOT NULL,
	`studentId` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`program` varchar(100) NOT NULL,
	`college` varchar(255) NOT NULL,
	`examCenter` varchar(255) NOT NULL,
	`photo` text,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_usn_unique` UNIQUE(`usn`),
	CONSTRAINT `students_studentId_unique` UNIQUE(`studentId`)
);
--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_studentId_students_studentId_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`studentId`) ON DELETE cascade ON UPDATE no action;