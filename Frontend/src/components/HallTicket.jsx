
import { QRCodeCanvas } from "qrcode.react";


export const HallTicket = ({ student }) => {
  const studentURL = `http://localhost:5173/hallticket/${student.studentId}`;
  
  return (
    <div className="w-[21cm] min-h-[29.7cm] bg-white p-8 mx-auto shadow-lg border">
      {/* Header Section */}
      <div className="border-2 border-gray-800 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <img 
                src="R.png" 
                alt="Institute Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ADMISSION TICKET</h1>
              <p className="text-lg">JANUARY 2024 EXAMINATION</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            {/* Student Photo */}
            {student.photo ? (
              <img 
                src={`data:image/png;base64,${student.photo}`} 
                alt={`${student.name}'s profile`} 
                className="w-32 h-40 object-cover border-2 border-gray-400"
              />
            ) : (
              <div className="w-32 h-40 border-2 border-gray-400 flex items-center justify-center">
                <span className="text-gray-400">Paste Photo Here</span>
              </div>
            )}

            {/* QR Code Below the Student Photo */}
            <QRCodeCanvas value={studentURL} size={100} className="mt-4" />
            <p className="text-xs mt-2">Scan to view online</p>
          </div>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p><strong>Programme:</strong> {student.program}</p>
            <p><strong>College:</strong> {student.college}</p>
            <p><strong>Student's Name:</strong> {student.name}</p>
            <p><strong>USN:</strong> {student.usn}</p>
            <p><strong>Student ID:</strong> {student.studentId}</p>
            <p><strong>Exam Center:</strong> {student.examCenter}</p>
          </div>
        </div>

        {/* Exam Schedule Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">Sl. No.</th>
              <th className="border p-2">Course Code</th>
              <th className="border p-2">Course Title</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Date and Time</th>
              <th className="border p-2">Signature</th>
            </tr>
          </thead>
          <tbody>
            {student.courses?.map((course, index) => (
              <tr key={course.courseCode}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{course.courseCode}</td>
                <td className="border p-2">{course.courseTitle}</td>
                <td className="border p-2">{course.type}</td>
                <td className="border p-2">{course.dateTime}</td>
                <td className="border p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Section */}
        <div className="flex justify-between mt-6">
          <div className="text-center">
            <p className="border-t border-black inline-block px-4">Signature of the Student</p>
          </div>
          <div className="text-center">
            <p className="border-t border-black inline-block px-4">Controller of Examinations</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          <p className="border-t border-black inline-block px-4 mt-2">Signature of the Principal with Seal</p>
        </div>
      </div>
    </div>
  );
};
