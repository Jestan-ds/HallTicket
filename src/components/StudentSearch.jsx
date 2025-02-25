import { useState } from 'react';
import { Search } from 'lucide-react';


export const StudentSearch = ({ students, onStudentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const student = students.find(s => s.usn === searchTerm || s.studentId === searchTerm);
    if (student) {
      onStudentSelect(student);
    } else {
      alert('Student not found!');
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md mx-auto p-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter USN or Student ID"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};
