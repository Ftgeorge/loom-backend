import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import {
    findNotificationsByUserId,
    markNotificationRead,
    markAllNotificationsRead,
    countUnreadNotifications,
} from "../repositories/notification.repo";

function qInt(val: unknown, def: number, max: number): number {
    return Math.min(Math.max(Number(typeof val === "string" ? val : def) || def, 0), max);
}

export const notificationRouter = Router();

// ─── GET /notifications ────────────────────────────────────
notificationRouter.get(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
        const limit = qInt(req.query.limit, 30, 100);
        const offset = qInt(req.query.offset, 0, 10000);

        const [notifications, unread] = await Promise.all([
            findNotificationsByUserId(req.user!.id, limit, offset),
            countUnreadNotifications(req.user!.id),
        ]);

        return res.json({ count: notifications.length, unread, limit, offset, results: notifications });
    })
);

// ─── PATCH /notifications/read-all ────────────────────────
// Must come before /:id to avoid being swallowed by it
notificationRouter.patch(
    "/read-all",
    requireAuth,
    asyncHandler(async (req, res) => {
        await markAllNotificationsRead(req.user!.id);
        return res.json({ message: "All notifications marked as read" });
    })
);

// ─── PATCH /notifications/:id/read ────────────────────────
notificationRouter.patch(
    "/:id/read",
    requireAuth,
    asyncHandler(async (req, res) => {
        const updated = await markNotificationRead(String(req.params.id), req.user!.id);
        if (!updated) return res.status(404).json({ error: "Notification not found" });
        return res.json(updated);
    })
);
