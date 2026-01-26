const express = require('express')
const notificationRouter = express.Router();
const { getNotifications, markAllAsRead, markAsRead } = require('../controllers/NotificationsControllers/notificationController')
const checkAuth = require('../middlewares/auth.middleware')

notificationRouter.get('/get/notifications', checkAuth, getNotifications);
notificationRouter.patch('/mark/all/read', checkAuth, markAllAsRead);
notificationRouter.patch('/mark/:id/read', checkAuth, markAsRead);

module.exports = notificationRouter;

