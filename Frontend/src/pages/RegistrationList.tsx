import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Download, Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../UI/Card'; // Assuming these are custom components using Tailwind
import Button from '../UI/Button1'; // Assuming this is a custom Button component with variants/sizes
import Input from '../UI/Input1'; // Assuming this is a custom Input component
import Select from '../UI/Select'; // Assuming this is a custom Select component
import Modal from '../components/modal'; // Assuming this is a custom Modal component
import Badge from '../UI/Badge'; // Assuming this is a custom Badge component with variants
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../UI/Table'; // Assuming these are custom Table components using Tailwind
// Make sure your ../types file is updated with the correct interfaces
import type { Registration1 } from '../types';

// --- Mock Exams Data (Replace with API call to fetch exams) ---
// You should replace this with an actual API call to get the list of exams
// from your backend to populate this dropdown dynamically.
const mockExams = [
    { value: 'all', label: 'All Exams' },
    { value: 'EXM001', label: 'Mathematics Final Exam' },
    { value: 'EXM002', label: 'Physics Practical Test' },
    { value: 'EXM003', label: 'Computer Science Programming Test' },
    // Add more exams as needed, fetched from your backend
];
// ---------------------------------------------------------

const RegistrationList: React.FC = () => {
    const [registrations, setRegistrations] = useState<Registration1[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedExamId, setSelectedExamId] = useState('all'); // State for exam filter
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration1 | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // State for approve/reject processing
    const [rejectReason, setRejectReason] = useState('');

    // --- API Base URL ---
    const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your backend URL
    // --------------------

    // --- Fetch Registrations from Backend ---
    // useCallback is used to memoize the function and prevent unnecessary re-renders
    const fetchRegistrations = useCallback(async () => {
        setIsLoading(true);
        try {
            // Construct the API URL with query parameters for exam filter
            const url = new URL(`${API_BASE_URL}/examRegistration/registrations`);
            if (selectedExamId !== 'all') {
                url.searchParams.append('exam_id', selectedExamId);
            }
            // Optional: If your backend /api/registrations supports status filtering
            // if (statusFilter !== 'all') {
            //     url.searchParams.append('status', statusFilter);
            // }


            const response = await fetch(url.toString());

            if (!response.ok) {
                 // Attempt to read error message from response body
                 const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                 throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Assuming backend returns an array of Registration objects
            const data: Registration1[] = await response.json();
            setRegistrations(data);

        } catch (error: any) {
            console.error('Error fetching registrations:', error);
            // Display an error message to the user (e.g., using a toaster or state)
            alert(`Failed to fetch registrations: ${error.message}`); // Basic alert for demo
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL, selectedExamId]); // Depend on selectedExamId to re-fetch when it changes

    // Fetch registrations when the component mounts or the exam filter changes
    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]); // Dependency array includes the memoized fetch function

    // --- Fetch Exams from Backend (Optional but Recommended) ---
    // Add a useEffect here to fetch the list of exams from your backend
    // and set the options for the Select dropdown dynamically instead of using mockExams.
    /*
    useEffect(() => {
        const fetchExams = async () => {
            try {
                 const response = await fetch(`${API_BASE_URL}/exams`); // Assuming an /api/exams endpoint
                 if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                 }
                 const examsData = await response.json();
                 // Map examsData to { value: exam.id, label: exam.name } format
                 const examOptions = [{ value: 'all', label: 'All Exams' }, ...examsData.map(exam => ({ value: exam.id, label: exam.name }))];
                 setExamOptions(examOptions); // You'd need a state for examOptions
            } catch (error) {
                 console.error('Error fetching exams:', error);
                 // Handle error
            }
        };
        fetchExams();
    }, [API_BASE_URL]); // Fetch only once on mount
    */


    const handleViewDetails = (registration: Registration1) => {
        setSelectedRegistration(registration);
        setIsDetailsModalOpen(true);
    };

    const handleApproveClick = (registration: Registration1) => {
        // Check if payment is completed before showing approve modal
         if (registration.payment_status !== 'completed') {
             alert('Payment is not completed for this registration.');
             return;
         }
        setSelectedRegistration(registration);
        setIsApproveModalOpen(true);
    };

    const handleRejectClick = (registration: Registration1) => {
        setSelectedRegistration(registration);
        setRejectReason(''); // Clear previous reason
        setIsRejectModalOpen(true);
    };

    // --- Call Backend API to Approve Registration ---
    const confirmApprove = async () => {
        if (!selectedRegistration) return;

        setIsProcessing(true);

        try {
            const response = await fetch(`${API_BASE_URL}/registrations/${selectedRegistration.application_id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any authentication headers here if needed (e.g., Authorization: `Bearer ${token}`)
                },
                // If the backend approve endpoint expects a body, add it here
                // body: JSON.stringify({ /* data */ }),
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ error: 'Unknown error during approval' }));
                 throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Assuming backend returns the updated registration object in a { registration: {...} } wrapper
            const responseData = await response.json();
            const updatedRegistration: Registration1 = responseData.registration;


            // Update local state with the updated registration
            setRegistrations(prevRegistrations =>
                prevRegistrations.map(reg =>
                    reg.application_id === updatedRegistration.application_id
                        ? updatedRegistration // Replace the old object with the fully updated one from backend
                        : reg
                )
            );

            setIsApproveModalOpen(false);
             // Optional: Show a success message (e.g., using a toaster component)
             alert(`Registration ${updatedRegistration.application_id} approved successfully!`); // Basic alert for demo


        } catch (error: any) {
            console.error('Error approving registration:', error);
            // Show error message to user
            alert(`Failed to approve registration: ${error.message}`); // Basic alert for demo
        } finally {
            setIsProcessing(false);
        }
    };

     // --- Call Backend API to Reject Registration ---
    const confirmReject = async () => {
        if (!selectedRegistration) return;

        setIsProcessing(true);

        try {
            const response = await fetch(`${API_BASE_URL}/registrations/${selectedRegistration.application_id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any authentication headers here if needed
                },
                // Send reject reason in the request body
                body: JSON.stringify({ rejectReason: rejectReason }),
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ error: 'Unknown error during rejection' }));
                 throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Assuming backend returns the updated registration object in a { registration: {...} } wrapper
             const responseData = await response.json();
             const updatedRegistration: Registration1 = responseData.registration;


            // Update local state with the updated registration
            setRegistrations(prevRegistrations =>
                prevRegistrations.map(reg =>
                    reg.application_id === updatedRegistration.application_id
                        ? updatedRegistration // Replace the old object with the fully updated one from backend
                        : reg
                )
            );

            setIsRejectModalOpen(false);
             // Optional: Show a success message (e.g., using a toaster)
             alert(`Registration ${updatedRegistration.application_id} rejected.`); // Basic alert for demo


        } catch (error: any) {
            console.error('Error rejecting registration:', error);
            // Show error message to user
            alert(`Failed to reject registration: ${error.message}`); // Basic alert for demo
        } finally {
            setIsProcessing(false);
        }
    };


    // --- Client-Side Filtering (Search term and Status) ---
    // Note: Exam filtering is handled server-side by fetchRegistrations now
    const filteredRegistrationsClientSide = useMemo(() => {
        return registrations.filter(registration => {
            const matchesSearch =
                registration.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || // Use optional chaining for safety
                registration.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                registration.exam?.name.toLowerCase().includes(searchTerm.toLowerCase()); // Use optional chaining for safety

            const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [registrations, searchTerm, statusFilter]); // Depend on registrations, searchTerm, statusFilter


    // --- Badge Helpers (Assuming these are styled components) ---
    const getStatusBadge = (status: Registration1['status']) => { // Use type from Registration
        switch (status) {
            case 'pending':
                return <Badge variant="warning">Pending</Badge>; // Assuming 'warning' variant exists
            case 'approved':
                return <Badge variant="success">Approved</Badge>; // Assuming 'success' variant exists
            case 'rejected':
                return <Badge variant="danger">Rejected</Badge>; // Assuming 'danger' variant exists
            default:
                return <Badge>{status}</Badge>; // Default badge
        }
    };

    // --- Corrected getPaymentStatusBadge function ---
    const getPaymentStatusBadge = (status: Registration1['payment_status']) => { // Use type from Registration
        switch (status) {
            case 'pending':
                return <Badge variant="warning">Pending</Badge>;
            case 'completed':
                return <Badge variant="success">Completed</Badge>;
            // Removed 'failed' case as requested
            default:
                // Handle any other unexpected payment status
                return <Badge>{status}</Badge>;
        }
    };
    // --------------------------------------------------------

    return (
        <div className="container mx-auto py-8 px-4 space-y-6"> {/* Using Tailwind container for layout */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Exam Registrations</h1>
            </div>

            <Card> {/* Assuming Card component */}
                <CardHeader> {/* Assuming CardHeader component */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                        <h2 className="text-lg font-medium text-gray-700">All Registrations</h2>
                        {/* Filters and Search */}
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                             {/* Exam Filter Dropdown */}
                            <Select
                                options={mockExams} // Use mockExams or state populated from API
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                className="w-full md:w-40" // Apply Tailwind width
                                disabled={isLoading || isProcessing}
                            />
                             {/* Status Filter Dropdown */}
                            <Select
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'rejected', label: 'Rejected' },
                                ]}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full md:w-40" // Apply Tailwind width
                                disabled={isLoading || isProcessing}
                            />
                            {/* Search Input */}
                            <div className="relative w-full md:w-64"> {/* Apply Tailwind width */}
                                <Input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full" // Apply Tailwind padding and full width
                                    disabled={isLoading || isProcessing}
                                />
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent> {/* Assuming CardContent component */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 size={32} className="animate-spin text-gray-900" /> {/* Tailwind spin */}
                        </div>
                    ) : filteredRegistrationsClientSide.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm || statusFilter !== 'all' || selectedExamId !== 'all' ? 'No registrations found matching your criteria.' : 'No registrations available.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto"> {/* Allow horizontal scrolling for table */}
                            <Table> {/* Assuming Table component */}
                                <TableHead> {/* Assuming TableHead component */}
                                    <TableRow> {/* Assuming TableRow component */}
                                        <TableHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</TableHeader> {/* Assuming TableHeader component with styling */}
                                        <TableHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</TableHeader>
                                        <TableHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</TableHeader>
                                        <TableHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg Date</TableHeader>
                                        <TableHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHeader>
                                        <TableHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</TableHeader>
                                        {/* Corrected Tailwind class: removed text-right, kept text-center */}
                                        <TableHeader className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody> {/* Assuming TableBody component */}
                                    {filteredRegistrationsClientSide.map((registration) => (
                                        <TableRow key={registration.application_id} className="hover:bg-gray-50"> {/* Apply hover */}
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{registration.application_id}</TableCell> {/* Apply cell styling */}
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registration.user?.name || 'N/A'}</TableCell> {/* Use optional chaining */}
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registration.exam?.name || 'N/A'}</TableCell> {/* Use optional chaining */}
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                               {/* registration_date is expected to be formatted by backend */}
                                               {registration.registration_date}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getStatusBadge(registration.status)}
                                            </TableCell>
                                             <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getPaymentStatusBadge(registration.payment_status)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-center">
                                                <div className="flex space-x-2 justify-center">
                                                    {/* View Details Button */}
                                                    <Button
                                                        variant="outline" // Assuming 'outline' variant
                                                        size="sm" // Assuming 'sm' size
                                                        onClick={() => handleViewDetails(registration)}
                                                        disabled={isProcessing} // Disable during processing
                                                    >
                                                        <Eye size={16} />
                                                    </Button>

                                                    {/* Approve/Reject Buttons (Show only for pending) */}
                                                    {registration.status === 'pending' && (
                                                        <>
                                                            {/* Approve Button */}
                                                            <Button
                                                                variant="success" // Assuming 'success' variant
                                                                size="sm" // Assuming 'sm' size
                                                                onClick={() => handleApproveClick(registration)}
                                                                disabled={registration.payment_status !== 'completed' || isProcessing} // Disable if payment not completed or processing
                                                            >
                                                                <CheckCircle size={16} />
                                                            </Button>
                                                            {/* Reject Button */}
                                                            <Button
                                                                variant="danger" // Assuming 'danger' variant
                                                                size="sm" // Assuming 'sm' size
                                                                onClick={() => handleRejectClick(registration)}
                                                                disabled={isProcessing} // Disable during processing
                                                            >
                                                                <XCircle size={16} />
                                                            </Button>
                                                        </>
                                                    )}

                                                    {/* Download Hall Ticket Button (Show only for approved with URL) */}
                                                    {registration.status === 'approved' && registration.hall_ticket_url && (
                                                        <Button
                                                            variant="primary" // Assuming 'primary' variant
                                                            size="sm" // Assuming 'sm' size
                                                            onClick={() => window.open(registration.hall_ticket_url!, '_blank')} // Use non-null assertion since we check hall_ticket_url exists
                                                             disabled={isProcessing} // Disable during processing
                                                        >
                                                            <Download size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Registration Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Registration Details"
                 size="lg" // Set modal size - Requires ModalProps to include 'size'
            >
                {selectedRegistration && (
                    <div className="space-y-4 text-gray-700"> {/* Apply text color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Application ID</h3>
                                <p className="font-mono text-gray-900">{selectedRegistration.application_id}</p> {/* Monospace and darker color for ID */}
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Registration Date</h3>
                                {/* registration_date is expected to be formatted by backend */}
                                <p className="text-gray-900">{selectedRegistration.registration_date}</p>
                            </div>

                             {/* Exam Mode */}
                             <div>
                                 <h3 className="text-sm font-medium text-gray-500">Exam Mode</h3>
                                 {/* Access exam_mode safely with optional chaining */}
                                 <p className="text-gray-900">{selectedRegistration.exam_mode?.toUpperCase() || 'N/A'}</p>
                             </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <p>{getStatusBadge(selectedRegistration.status)}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                                <p>{getPaymentStatusBadge(selectedRegistration.payment_status)}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4"> {/* Apply border and padding */}
                            <h3 className="text-md font-semibold mb-3 text-gray-800">Student Information</h3> {/* Apply font-semibold, mb, text color */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                                    <p className="text-gray-900">{selectedRegistration.user?.name || 'N/A'}</p> {/* Use optional chaining */}
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="text-gray-900">{selectedRegistration.user?.email || 'N/A'}</p> {/* Use optional chaining */}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4"> {/* Apply border and padding */}
                            <h3 className="text-md font-semibold mb-3 text-gray-800">Exam Information</h3> {/* Apply font-semibold, mb, text color */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Exam Name</h3>
                                    <p className="text-gray-900">{selectedRegistration.exam?.name || 'N/A'}</p> {/* Use optional chaining */}
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Exam Date</h3>
                                    {/* Exam date is already formatted from backend */}
                                    <p className="text-gray-900">{selectedRegistration.exam?.exam_date || 'N/A'}</p> {/* Use optional chaining */}
                                </div>

                                 {/* Exam Time (Use exam.exam_time or selected_exam_time) */}
                                 {/* Access properties safely with optional chaining */}
                                 {(selectedRegistration.exam?.exam_time || selectedRegistration.selected_exam_time) && (
                                     <div>
                                         <h3 className="text-sm font-medium text-gray-500">Exam Time</h3>
                                         <p className="text-gray-900">{selectedRegistration.exam?.exam_time || selectedRegistration.selected_exam_time}</p>
                                     </div>
                                 )}
                                 {/* Exam Duration and Fee */}
                                 {/* Access properties safely with optional chaining */}
                                 {selectedRegistration.exam?.exam_duration && (
                                     <div>
                                        <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                                        <p className="text-gray-900">{selectedRegistration.exam.exam_duration}</p>
                                     </div>
                                 )}
                                  {selectedRegistration.exam?.exam_fee && (
                                      <div>
                                         <h3 className="text-sm font-medium text-gray-500">Exam Fee</h3>
                                         <p className="text-gray-900">{selectedRegistration.exam.exam_fee}</p> {/* Assuming fee is formatted */}
                                      </div>
                                  )}


                                {/* Assigned Location (Show only if offline and assigned) */}
                                {/* Access location details safely with optional chaining */}
                                {selectedRegistration.exam_mode === 'offline' && selectedRegistration.location && (
                                     <div>
                                         <h3 className="text-sm font-medium text-gray-500">Exam Location</h3>
                                         {/* Use location.name, location.address etc. as available in your frontend type */}
                                         {/* Assuming location has a 'name' property based on previous formatRegistrationForFrontend */}
                                         <p className="text-gray-900">{selectedRegistration.location.name || 'N/A'}</p>
                                     </div>
                                )}
                                {/* Seat Number (Show only if offline and assigned) */}
                                {selectedRegistration.exam_mode === 'offline' && selectedRegistration.seat_number && (
                                     <div>
                                         <h3 className="text-sm font-medium text-gray-500">Seat Number</h3>
                                         <p className="text-gray-900">{selectedRegistration.seat_number}</p>
                                     </div>
                                )}
                            </div>
                        </div>

                        {/* Hall Ticket Section (Show only if approved with URL) */}
                        {selectedRegistration.status === 'approved' && selectedRegistration.hall_ticket_url && (
                            <div className="border-t border-gray-200 pt-4 mt-4"> {/* Apply border and padding */}
                                <h3 className="text-md font-semibold mb-3 text-gray-800">Hall Ticket</h3> {/* Apply font-semibold, mb, text color */}
                                <Button
                                    onClick={() => window.open(selectedRegistration.hall_ticket_url!, '_blank')}
                                    variant="primary" // Use primary variant
                                >
                                    <Download size={16} className="mr-2" />
                                    Download Hall Ticket
                                </Button>
                            </div>
                        )}

                        {/* Reject Reason (Show only if rejected) */}
                         {/* Access reject_reason safely with optional chaining */}
                         {selectedRegistration.status === 'rejected' && selectedRegistration.reject_reason && (
                             <div className="border-t border-gray-200 pt-4 mt-4">
                                 <h3 className="text-sm font-medium text-gray-500">Rejection Reason</h3>
                                 <p className="text-gray-900">{selectedRegistration.reject_reason}</p>
                             </div>
                         )}


                        <div className="flex justify-end mt-6">
                            <Button
                                variant="outline" // Use outline variant
                                onClick={() => setIsDetailsModalOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Approve Registration Modal */}
            <Modal
                isOpen={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="Approve Registration"
                 size="sm" // Smaller modal for confirmation - Requires ModalProps to include 'size'
            >
                {selectedRegistration && (
                    <div className="space-y-4 text-gray-700"> {/* Apply text color */}
                        <p>
                            Are you sure you want to approve the registration for{' '}
                            <span className="font-medium text-gray-900">{selectedRegistration.user?.name || 'N/A'}</span> for the exam{' '} {/* Use optional chaining */}
                            <span className="font-medium text-gray-900">{selectedRegistration.exam?.name || 'N/A'}</span>? {/* Use optional chaining */}
                        </p>

                        <p className="text-sm text-gray-600">
                            This will generate a hall ticket for the student and update their registration status.
                        </p>

                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                variant="outline" // Use outline variant
                                onClick={() => setIsApproveModalOpen(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="success" // Use success variant
                                onClick={confirmApprove}
                                isLoading={isProcessing} // Pass isLoading prop if Button supports it
                                disabled={isProcessing} // Disable button while processing
                            >
                                {isProcessing ? (
                                    <>
                                         <Loader2 size={16} className="animate-spin mr-2" /> {/* Tailwind spin */}
                                         Processing...
                                    </>
                                ) : 'Approve'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Registration Modal */}
            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="Reject Registration"
                 size="md" // Medium modal for rejection reason - Requires ModalProps to include 'size'
            >
                {selectedRegistration && (
                    <div className="space-y-4 text-gray-700"> {/* Apply text color */}
                        <p>
                            Are you sure you want to reject the registration for{' '}
                            <span className="font-medium text-gray-900">{selectedRegistration.user?.name || 'N/A'}</span> for the exam{' '} {/* Use optional chaining */}
                            <span className="font-medium text-gray-900">{selectedRegistration.exam?.name || 'N/A'}</span>? {/* Use optional chaining */}
                        </p>

                        <div>
                            <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Rejection (Optional)
                            </label>
                            <textarea
                                id="reject-reason"
                                rows={3}
                                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" // Apply Tailwind border, padding, focus
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter reason for rejection..."
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                variant="outline" // Use outline variant
                                onClick={() => setIsRejectModalOpen(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger" // Use danger variant
                                onClick={confirmReject}
                                isLoading={isProcessing} // Pass isLoading prop
                                disabled={isProcessing} // Disable button while processing
                            >
                                 {isProcessing ? (
                                    <>
                                         <Loader2 size={16} className="animate-spin mr-2" /> {/* Tailwind spin */}
                                         Processing...
                                    </>
                                ) : 'Reject'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RegistrationList;