// src/components/NotificationHistory.tsx

import React, { useState, useEffect, useCallback } from 'react';
// Added Loader2 and AlertTriangle to imports
import { BellRing, Send, Users, FileText, Filter, RotateCcw, ListChecks, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../UI/Card'; // Assuming these are layout wrappers
import Button from '../UI/Button1';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../UI/Table';
// import Badge from '../UI/Badge'; // Assuming you might use the SimpleBadge below or your own

const API_BASE_URL = 'http://localhost:5000/api';

// Interface for the data received from the '/sent' endpoint
interface SentNotification {
    id: string;
    message: string;
    target: string; // 'all' or exam_id
    createdAt: string | Date; // Raw timestamp from backend
    examName?: string | null; // Joined from exams table
    createdAtFormatted: string; // Formatted by backend
    targetDisplay: string; // Formatted by backend (e.g., "All Students" or "Students for [Exam Name]")
}

// A simple Badge component if not using a UI library one
const SimpleBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${className || ''}`}>
        {children}
    </span>
);


const NotificationHistory: React.FC = () => {
    const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNotification, setSelectedNotification] = useState<SentNotification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const token = localStorage.getItem('authToken');

    const fetchSentNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!token) {
            setError("Administrator not authenticated. Please log in.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/notifications/sent`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({ error: "Failed to fetch sent notifications" }));
                throw new Error(errData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setSentNotifications(data.data);
            } else {
                throw new Error(data.error || "Invalid data format received from server.");
            }
        } catch (err: any) {
            console.error("Error fetching sent notifications:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSentNotifications();
    }, [fetchSentNotifications]);

    const viewNotificationDetails = (notification: SentNotification) => {
        setSelectedNotification(notification);
        setIsModalOpen(true);
    };

    const getTargetAudienceIcon = (target: string, examName?: string | null) => {
        if (target === 'all') {
            // Removed title prop, using aria-label for accessibility
            return <Users className="h-4 w-4 text-blue-500 mr-1.5" aria-label="All Students" />;
        }
        if (examName) {
            // Removed title prop, using aria-label for accessibility
            return <FileText className="h-4 w-4 text-green-500 mr-1.5" aria-label={`Exam: ${examName}`} />;
        }
        // Removed title prop, using aria-label for accessibility
        return <Send className="h-4 w-4 text-gray-500 mr-1.5" aria-label={`Target ID: ${target}`} />;
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" /> {/* Loader2 is now imported */}
                <p className="ml-3 text-lg text-gray-700">Loading Sent Notifications...</p>
            </div>
        );
    }


    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white shadow-xl rounded-lg"> {/* Card div */}
                <div className="p-6 border-b border-gray-200"> {/* CardHeader div */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <ListChecks className="mr-3 text-indigo-600" /> Sent Notification History
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Overview of all notifications dispatched by administrators.
                            </p>
                        </div>
                        {/* The 'title' prop for Button should be valid for your custom Button component */}
                        <Button variant="outline" size="sm" onClick={fetchSentNotifications} disabled={isLoading} title="Refresh Notifications" className="mt-3 sm:mt-0">
                            <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} mr-1.5`} /> Refresh
                        </Button>
                    </div>
                </div>

                <div className="p-0 md:p-6"> {/* CardContent div */}
                    {error && (
                        <div className="m-6 p-4 bg-red-50 text-red-700 border border-red-300 rounded-md flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 shrink-0" /> {/* AlertTriangle is now imported */}
                            <span>{error}</span>
                        </div>
                    )}
                    {!error && sentNotifications.length === 0 && !isLoading && (
                        <div className="text-center py-16">
                            <BellRing className="h-20 w-20 text-gray-300 mx-auto mb-5" />
                            <p className="text-xl font-medium text-gray-700">No Notifications Sent Yet</p>
                            <p className="text-gray-500 mt-1">The history will populate once notifications are dispatched.</p>
                        </div>
                    )}
                    {!error && sentNotifications.length > 0 && (
                        <div className="overflow-x-auto">
                            <Table className="min-w-full">
                                <TableHead>
                                    <TableRow>
                                        <TableHeader className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Sent Date</TableHeader>
                                        <TableHeader className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Preview</TableHeader>
                                        <TableHeader className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Target Audience</TableHeader>
                                        <TableHeader className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHeader>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sentNotifications.map((notification) => (
                                        <TableRow key={notification.id} className="hover:bg-gray-50">
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{notification.createdAtFormatted}</TableCell>
                                            {/* Removed title prop from TableCell for message preview */}
                                            <TableCell className="px-4 py-3 text-sm text-gray-700 max-w-md truncate">
                                                {notification.message.substring(0, 100)}{notification.message.length > 100 ? '...' : ''}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    {getTargetAudienceIcon(notification.target, notification.examName)}
                                                    {notification.targetDisplay}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 whitespace-nowrap text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => viewNotificationDetails(notification)}
                                                    className="text-xs"
                                                >
                                                    <Eye size={14} className="mr-1.5" /> View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div> {/* Closing CardContent div */}
            </div> {/* Closing Card div */}

            {/* Modal for Viewing Full Notification */}
            {selectedNotification && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-opacity duration-300`}>
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative transform transition-all duration-300 ${isModalOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}" >
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">Notification Details</h3>
                        <p className="text-xs text-gray-400 mb-4">ID: {selectedNotification.id}</p>

                        <div className="space-y-3 text-sm">
                            <div>
                                <strong className="text-gray-600 block mb-0.5">Sent:</strong>
                                <p className="text-gray-800">{selectedNotification.createdAtFormatted}</p>
                            </div>
                            <div> {/* Parent div for Target info */}
                                <strong className="text-gray-600 block mb-0.5">Target:</strong>
                                <div className="flex items-center text-gray-800"> {/* This div contains icon and text */}
                                     {getTargetAudienceIcon(selectedNotification.target, selectedNotification.examName)}
                                     {selectedNotification.targetDisplay}
                                </div> {/* Closing div for flex items */}
                            </div> {/* Closing div for Target info section */}
                            <div>
                                <strong className="text-gray-600 block mb-0.5">Message:</strong>
                                <div className="prose prose-sm max-w-none p-3 border rounded-md bg-gray-50 text-gray-800 whitespace-pre-wrap break-words">
                                    {selectedNotification.message}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 text-right">
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationHistory;