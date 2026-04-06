import { createNotification } from "../repositories/notification.repo";
import { findArtisanProfileById } from "../repositories/artisan.read.repo";

export const NotificationService = {
    /**
     * Notify an artisan that they have been assigned to a job
     */
    async notifyJobAssigned(userId: string, jobTitle: string) {
        return createNotification({
            userId,
            type: "job_update",
            title: "New Job Assigned",
            body: `You have been assigned to: ${jobTitle}. Check your job list for details.`,
        });
    },

    /**
     * Notify a user of a new message
     */
    async notifyNewMessage(recipientId: string, senderName: string, text: string, threadId: string) {
        return createNotification({
            userId: recipientId,
            type: "message",
            title: `New Message from ${senderName}`,
            body: text.length > 50 ? text.substring(0, 47) + "..." : text,
            metadata: { threadId }
        });
    },

    /**
     * Notify an artisan about their verification status
     */
    async notifyVerificationStatus(userId: string, status: 'approved' | 'rejected', reason?: string) {
        const title = status === 'approved' ? "Verification Approved!" : "Verification Update";
        const body = status === 'approved' 
            ? "Your account has been verified. You can now start accepting jobs."
            : `Your verification could not be completed. ${reason || "Please check your documents and try again."}`;
        
        return createNotification({
            userId,
            type: "system",
            title,
            body,
        });
    },

    /**
     * Notify an artisan that a customer has left a review
     */
    async notifyNewReview(userId: string, rating: number) {
        return createNotification({
            userId,
            type: "review",
            title: "New Review Received",
            body: `A customer has left you a ${rating}-star review!`,
        });
    }
};
