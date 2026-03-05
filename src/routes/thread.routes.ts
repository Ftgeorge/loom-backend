import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import {
    findThreadsByUserId,
    findMessagesByThread,
    upsertThread,
    insertMessage,
} from "../repositories/thread.repo";
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
        const thread = await upsertThread({
            customerId: req.user!.id,
            artisanProfileId: parsed.data.artisanProfileId,
            jobRequestId: parsed.data.jobRequestId,
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
