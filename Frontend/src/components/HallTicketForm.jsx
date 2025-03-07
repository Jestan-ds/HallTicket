import React, { useState } from "react";
import * as XLSX from "xlsx";

function HallTicketForm({ setStudentFound }) {
  const [studentData, setStudentData] = useState([]);
  const [usn, setUsn] = useState("");

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setStudentData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle search by USN
  const handleSearch = () => {
    const foundStudent = studentData.find((student) => student.usn === usn);
    if (foundStudent) {
      setStudentFound(foundStudent);  // Pass found student data back to the parent
    } else {
      setStudentFound(null); // If not found, clear the student data
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <br />
      <input
        type="text"
        placeholder="Enter USN"
        value={usn}
        onChange={(e) => setUsn(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default HallTicketForm;
