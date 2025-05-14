import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../UI/Card'; // Assuming Card components path
import { Bell } from 'lucide-react'; // Import Bell icon

// Define a type for the sent notification data received from the backend
interface SentNotification {
    id: string;
    message: string;
    target: string; // 'all' or exam ID
    createdAt: string; // Raw timestamp
    createdAtFormatted: string; // Formatted date/time string from backend
    targetDisplay: string; // Formatted target string ('All Students' or 'Students for Exam Name')
}

const AdminSentNotification: React.FC = () => {
    const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSentNotifications = async () => {
            setLoading(true);
            setError(null);
            try {
                // Replace with your actual backend API endpoint for getting sent notifications
                const response = await fetch('http://localhost:5000/api/admin/notifications/sent', {
                    method: 'GET',
                    credentials: 'include', // Include cookies for authentication
                    headers: {
                        'Content-Type': 'application/json',
                        // Include authentication headers if needed (e.g., Authorization: `Bearer ${token}`)
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Could not parse error body' }));
                    throw new Error(errorData.error || `Failed to fetch sent notifications. Status: ${response.status}`);
                }

                const result = await response.json();
                // Assuming the backend returns an object like { success: true, data: [...] }
                const fetchedNotifications: SentNotification[] = Array.isArray(result.data) ? result.data : [];

                setSentNotifications(fetchedNotifications);

            } catch (err: any) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching sent notifications');
                console.error("Error fetching sent notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSentNotifications();
    }, []); // Empty dependency array means this effect runs only once on mount


    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading Sent Notifications...</div>;
    }

    if (error) {
        return <div className="text-red-600 text-center">Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Sent Notification History</h1>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-medium">Sent Notifications</h2>
                </CardHeader>
                <CardContent>
                    {sentNotifications.length > 0 ? (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto"> {/* Added overflow and max height */}
                            {sentNotifications.map(notif => (
                                <div key={notif.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-gray-600">{notif.createdAtFormatted}</span>
                                        <span className="text-xs font-medium text-indigo-600">{notif.targetDisplay}</span>
                                    </div>
                                    <p className="text-sm text-gray-800">
                                        {notif.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No notifications have been sent yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSentNotification;
