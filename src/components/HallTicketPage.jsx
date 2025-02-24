import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { HallTicket } from './HallTicket';

function HallTicketPage() {
  const { studentId } = useParams();  // Get studentId from URL params
  const [student, setStudent] = useState(null);

  useEffect(() => {
    // Retrieve students from localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];

    // Log the studentId and students to check the values
    console.log("Student ID from URL:", studentId);
    console.log("All students:", students);

    const foundStudent = students.find((s) => s.studentId.toString() === studentId);
    setStudent(foundStudent);
  }, []);  // Depend on studentId so the component re-renders on route change

  return student ? (
    <HallTicket student={student} />
  ) : (
    <p style={{ textAlign: "center", color: "green", fontWeight: "bold" }}>
      Student not found
    </p>
  );
}

export default HallTicketPage;
