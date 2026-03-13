import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import {
    findThreadsByUserId,
    findMessagesByThread,
    upsertThread,
    insertMessage,
} from "../repositories/thread.repo";
import { findJobById } from "../repositories/job.read.repo";
import { findArtisanByUserId } from "../repositories/artisan.list.repo";
import { z } from "zod";

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
    artisanProfileId: z.string().uuid(),
    jobRequestId: z.string().uuid().optional(),
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
            
            // Security: ensure this artisan is either assigned or matched? 
            // For now, let's just use the customer_id from the job
            customerId = job.customer_id;
            
            // We also need the artisan's profile ID
            const artisan = await findArtisanByUserId(req.user!.id);
            if (!artisan) return res.status(404).json({ error: "Artisan profile not found" });
            finalArtisanProfileId = artisan.artisan_profile_id;
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
        const msg = await insertMessage({
            threadId: String(req.params.threadId),
            senderId: req.user!.id,
            text: parsed.data.text,
        });
        return res.status(201).json(msg);
    })
);
