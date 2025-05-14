export interface Exam {
    id: string;
    name: string;
    exam_mode: string;
    exam_time_selection: string;
    exam_date: string;
    exam_time: string;
    exam_duration: string;
    exam_fee: string;
    exam_registrationEndDate: string;
    exam_category: string;
    exam_description: string;
    exam_prerequisites: string;
    exam_createdAt: string;
  }
  export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'student';
  }
  
  export interface Exam1 {
    id: string;
    name: string;
    exam_mode: string;
    exam_time_selection: string;
    exam_date: string;
    exam_time: string;
    exam_duration: number; // Changed from string to number
    exam_fee: number; // Changed from string to number
    exam_registrationEndDate: string;
    exam_category: string;
    exam_description: string;
    exam_prerequisites: string;
    exam_createdAt: string;
  }

  export interface ExamLocation {
    id: string;
    name: string;
    total_seats: number;
    available_seats: number;
  }
  
  export interface Student {
    usn: string;
    studentId: number;
    name: string;
    program: string;
    college: string;
    examCenter: string;
    photo: string;
  }
  
  export interface Registration {
    application_id: string;
    user_id: string;
    exam_id: string;
    registration_date: string;
    status: 'pending' | 'approved' | 'rejected';
    payment_status: 'pending' | 'completed';
    location_id?: string;
    hall_ticket_url?: string;
    user: {
      name: string;
      email: string;
    };
    exam: {
      name: string;
      exam_date: string;
      exam_time?: string;
    };
    location?: {
      name: string;
    };
  }

  // src/lib/types.ts (Example)

export interface StudentData {
  id: string; // Unique ID for React keys and selection
  name: string;
  roll_no?: string; // Optional Roll Number
  application_no?: string; // Optional Application Number
  dob: string; // Date of Birth
  exam_name: string;
  exam_date: string; // New field for Exam Date
  reporting_time?: string; // Optional Reporting Time
  exam_time?: string; // Optional Exam Time
  gender?: string; // Optional Gender
  category?: string; // Optional Category
  father_name?: string; // Optional Father's Name
  mother_name?: string; // Optional Mother's Name
  exam_center_name: string;
  exam_center_address: string;
  exam_center_city?: string; // Optional City
  exam_center_state?: string; // Optional State
  // Add other fields from your template as needed
}

// Use this interface in both components

  // Assuming your existing types file path is ../types.ts

export interface User1 {
  id: string; // Assuming user has an ID
  authId?: number | null; // Assuming user has an authId linked to auth table
  name: string;
  email: string;
  // ... add any other user fields used in your application (e.g., phone, address)
}

export interface Exam2 {
  id: string; // Assuming exam has an ID
  name: string;
  exam_date: string; // Or Date if your backend formats it that way before sending
  exam_time?: string | null; // Raw time string HH:MM:SS or null
  exam_duration?: string | null; // Added duration, assuming string format
  exam_fee?: string | number | null; // Added fee, assuming string or number format
  // ... add any other exam fields used (e.g., description, mode, capacity)
}

export interface Location {
  id?: string | null; // Assuming location has an optional ID
  name: string; // Center name or location identifier string
  address?: string | null; // Optional address
  city?: string | null; // Optional city
  state?: string | null; // Optional state
  // ... add any other location fields (e.g., total_seats, filled_seats, exam_id if applicable)
}

export interface Registration1 {
  id: string; // Added primary ID for the registration record
  application_id: string; // Unique identifier for the application
  user_id: string; // ID linking to a User record
  exam_id: string; // ID linking to an Exam record
  exam_mode: 'online' | 'offline'; // Added exam_mode
  assigned_location?: string | null; // Added assigned_location string (might be just the name)
  seat_number?: string | null; // Added seat_number string
  selected_exam_time?: string | null; // Added selected_exam_time string (for online flexible times)
  registration_date: string; // Formatted date string (e.g., MM/DD/YYYY) from backend applied_at
  status: 'pending' | 'approved' | 'rejected'; // Registration status
  payment_status: 'pending' | 'completed'; // Corrected payment status types (removed 'failed')
  hall_ticket_url?: string; // Added hall_ticket_url
   // Optional ID linking to examLocations (if used)

  // Nested objects received from backend joins (assuming your backend formats them this way)
  user: User1; // User details
  exam?: Exam2; // Exam details
  location?: Location | null; // Location details (optional)

  // Optional reject reason field (if stored in backend)
  reject_reason?: string | null; // Added reject_reason
}