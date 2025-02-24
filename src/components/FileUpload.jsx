
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

 const FileUpload = ({ onDataUpload }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws);

      const transformedData = rawData.map((row) => ({
        usn: row.usn,
        studentId: row.studentId?.toString(), // Ensure studentId is a string for consistency
        name: row.name,
        program: row.program,
        college: row.college,
        examCenter: row.examCenter,
        photo: row.photo,
        courses: Array.from({ length: 8 }, (_, i) => ({
          slNo: i + 1,
          sem: 1,
          courseCode: row[`courseCode${i + 1}`],
          courseTitle: row[`courseTitle${i + 1}`],
          type: row[`type${i + 1}`],
          dateTime: row[`dateTime${i + 1}`],
        })),
      }));

      // Store data in localStorage
      localStorage.setItem('students', JSON.stringify(transformedData));

      onDataUpload(transformedData);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-colors">
        <Upload className="w-8 h-8" />
        <span className="mt-2 text-sm">Upload Student Data (XLS/XLSX)</span>
        <input type="file" className="hidden" accept=".xls,.xlsx" onChange={handleFileUpload} />
      </label>
    </div>
  );
};

export default FileUpload;