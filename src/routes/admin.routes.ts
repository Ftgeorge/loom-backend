import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { listAllUsers, deleteUserById } from "../repositories/user.repo";
import { listAllVerifications, updateVerificationStatus } from "../repositories/verification.repo";

export const adminRouter = Router();

// User Management
adminRouter.get("/users", asyncHandler(async (req, res) => {
    const users = await listAllUsers();
    res.json(users);
}));

adminRouter.delete("/users/:id", asyncHandler(async (req, res) => {
    await deleteUserById(String(req.params.id));
    res.status(204).send();
}));

// Verification Management
adminRouter.get("/verifications", asyncHandler(async (req, res) => {
    const status = (req.query.status as string) || undefined;
    const verifications = await listAllVerifications(status);
    res.json(verifications);
}));

adminRouter.patch("/verifications/:id/status", asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }
    const updated = await updateVerificationStatus(String(req.params.id), status, reason);
    res.json(updated);
}));
