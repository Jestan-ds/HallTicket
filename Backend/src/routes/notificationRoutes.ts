// In your Express router file for admin routes (e.g., src/routes/admin.ts)

import express from 'express';
import { sendNotification, getStudentNotifications, markNotificationAsRead, getSentNotifications } from '../controllers/notificationController'; // Adjust the import path as necessary
import { authMiddleware } from '../middleware/authMiddleware';
const Notificationrouter = express.Router();

// Apply authentication middleware that checks for admin role if you have one
// router.use(authMiddleware); // Example: Ensure only admins can access these routes

// Admin Notification Route
Notificationrouter.post('/send',authMiddleware, async (req, res) => {
    sendNotification(req, res);
}
);
Notificationrouter.get('/sent', async (req, res) => {
    getSentNotifications(req, res);
}
);

Notificationrouter.get('/',authMiddleware, async (req, res) => {
    getStudentNotifications(req, res);
}
);
Notificationrouter.patch('/:notificationId/read', async (req, res) => {
    markNotificationAsRead(req, res);
}
);

// ... other admin routes

export default Notificationrouter;
