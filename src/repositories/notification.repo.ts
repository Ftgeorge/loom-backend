import { query } from "../db/query";

export type NotificationRow = {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    metadata: any;
    created_at: string;
};

export async function findNotificationsByUserId(userId: string, limit = 30, offset = 0) {
    const res = await query<NotificationRow>(
        `SELECT id, user_id, type, title, body, read, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return res.rows;
}

export async function markNotificationRead(notificationId: string, userId: string) {
    const res = await query<NotificationRow>(
        `UPDATE notifications
         SET read = true
         WHERE id = $1 AND user_id = $2
         RETURNING id, read`,
        [notificationId, userId]
    );
    return res.rows[0] ?? null;
}

export async function markAllNotificationsRead(userId: string) {
    await query(
        `UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`,
        [userId]
    );
}

export async function createNotification(input: {
    userId: string;
    type?: string;
    title: string;
    body: string;
    metadata?: any;
}) {
    const res = await query<NotificationRow>(
        `INSERT INTO notifications (user_id, type, title, body, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, type, title, body, read, metadata, created_at`,
        [input.userId, input.type ?? "system", input.title, input.body, input.metadata || null]
    );
    return res.rows[0];
}

export async function markNotificationsAsReadByMetadata(userId: string, key: string, value: any) {
    await query(
        `UPDATE notifications
         SET read = true
         WHERE user_id = $1
           AND metadata->>$2 = $3
           AND read = false`,
        [userId, key, String(value)]
    );
}

export async function countUnreadNotifications(userId: string) {
    const res = await query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = false`,
        [userId]
    );
    return res.rows[0]?.count ?? 0;
}
