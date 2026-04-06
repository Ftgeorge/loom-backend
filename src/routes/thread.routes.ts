import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import {
    findThreadsByUserId,
    findMessagesByThread,
    upsertThread,
    insertMessage,
    findThreadById,
    markMessagesAsRead,
} from "../repositories/thread.repo";
import { findJobById } from "../repositories/job.read.repo";
import { findArtisanByUserId } from "../repositories/artisan.list.repo";
import { findUserById } from "../repositories/user.repo";
import { z } from "zod";
import { NotificationService } from "../services/notification.service";
import { markNotificationsAsReadByMetadata } from "../repositories/notification.repo";

function qInt(val: unknown, def: number, max: number): number {
    return Math.min(Math.max(Number(typeof val === "string" ? val : def) || def, 0), max);
}

export const threadRouter = Router();

// ─── GET /threads ─────────────────────────────────────────
threadRouter.get(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
        const role = req.user!.role === "artisan" ? "artisan" : "customer";
        const threads = await findThreadsByUserId(req.user!.id, role);
        return res.json({ count: threads.length, results: threads });
    })
);

// ─── GET /threads/:threadId/messages ─────────────────────
threadRouter.get(
    "/:threadId/messages",
    requireAuth,
    asyncHandler(async (req, res) => {
        const limit = qInt(req.query.limit, 50, 100);
        const offset = qInt(req.query.offset, 0, 10000);
        const messages = await findMessagesByThread(String(req.params.threadId), limit, offset);
        return res.json({ count: messages.length, results: messages });
    })
);

// ─── POST /threads ─────────────────────────────────────────
const createThreadSchema = z.object({
    artisanProfileId: z.string().uuid().optional(),
    jobRequestId: z.string().uuid().optional(),
}).refine(data => data.artisanProfileId || data.jobRequestId, {
    message: "Either artisanProfileId or jobRequestId must be provided"
});

threadRouter.post(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
        const parsed = createThreadSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
        }

        const { artisanProfileId, jobRequestId } = parsed.data;
        let customerId = req.user!.id;
        let finalArtisanProfileId = artisanProfileId;

        // If the logged-in user is an artisan, they are likely messaging a customer
        if (req.user!.role === "artisan") {
            if (!jobRequestId) {
                return res.status(400).json({ error: "Job request ID is required for artisans to initiate chat" });
            }
            
            const job = await findJobById(jobRequestId);
            if (!job) return res.status(404).json({ error: "Job not found" });
            
            customerId = job.customer_id;
            
            const artisan = await findArtisanByUserId(req.user!.id);
            if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });
            finalArtisanProfileId = artisan.artisan_profile_id;
        }

        if (!finalArtisanProfileId) {
            return res.status(400).json({ error: "artisanProfileId is required" });
        }

        const thread = await upsertThread({
            customerId,
            artisanProfileId: finalArtisanProfileId,
            jobRequestId,
        });
        
        return res.status(201).json(thread);
    })
);

// ─── POST /threads/:threadId/messages ─────────────────────
const sendMessageSchema = z.object({ text: z.string().min(1).max(2000) });

threadRouter.post(
    "/:threadId/messages",
    requireAuth,
    asyncHandler(async (req, res) => {
        const parsed = sendMessageSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
        }
        
        const threadId = String(req.params.threadId);
        const msg = await insertMessage({
            threadId,
            senderId: req.user!.id,
            text: parsed.data.text,
        });

        // Background notification
        Promise.all([
            findThreadById(threadId),
            findUserById(req.user!.id)
        ]).then(([thread, sender]) => {
            if (thread && sender) {
                const recipientId = thread.customer_id === req.user!.id 
                    ? thread.artisan_user_id 
                    : thread.customer_id;
                
                const senderName = `${sender.first_name || ""} ${sender.last_name || ""}`.trim() || sender.email;
                NotificationService.notifyNewMessage(recipientId, senderName, parsed.data.text, threadId)
                    .catch(e => console.error("[Notification] Chat failed:", e));
            }
        });

        return res.status(201).json(msg);
    })
);

// ─── PATCH /threads/:threadId/read ───────────────────────
threadRouter.patch(
    "/:threadId/read",
    requireAuth,
    asyncHandler(async (req, res) => {
        const threadId = String(req.params.threadId);
        await markMessagesAsRead(threadId, req.user!.id);
        await markNotificationsAsReadByMetadata(req.user!.id, "threadId", threadId);
        return res.json({ success: true });
    })
);
