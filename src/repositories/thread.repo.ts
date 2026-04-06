import { query } from "../db/query";

export type ThreadRow = {
    id: string;
    job_request_id: string | null;
    customer_id: string;
    artisan_profile_id: string;
    last_message: string | null;
    last_message_at: string | null;
    created_at: string;
    // Joined fields
    other_user_first_name: string | null;
    other_user_last_name: string | null;
    other_user_email: string;
    unread_count: number;
};

/** List threads for a user (customer or artisan) */
export async function findThreadsByUserId(userId: string, role: "customer" | "artisan") {
    const isCustomer = role === "customer";

    const res = await query<ThreadRow>(
        `SELECT
            mt.id,
            mt.job_request_id,
            mt.customer_id,
            mt.artisan_profile_id,
            mt.last_message,
            mt.last_message_at,
            mt.created_at,
            other_u.first_name AS other_user_first_name,
            other_u.last_name  AS other_user_last_name,
            other_u.email      AS other_user_email,
            COUNT(m.id) FILTER (WHERE m.read_at IS NULL AND m.sender_id != $1)::int AS unread_count
         FROM message_threads mt
         JOIN artisan_profiles ap ON ap.id = mt.artisan_profile_id
         JOIN users artisan_u ON artisan_u.id = ap.user_id
         JOIN users customer_u ON customer_u.id = mt.customer_id
         -- "other" user from the perspective of the requester
         JOIN users other_u ON other_u.id = ${isCustomer ? "artisan_u.id" : "mt.customer_id"}
         LEFT JOIN messages m ON m.thread_id = mt.id
         WHERE ${isCustomer ? "mt.customer_id = $1" : "ap.user_id = $1"}
         GROUP BY mt.id, mt.job_request_id, mt.customer_id, mt.artisan_profile_id, mt.last_message, mt.last_message_at, mt.created_at, other_u.first_name, other_u.last_name, other_u.email
         ORDER BY mt.last_message_at DESC NULLS LAST`,
        [userId]
    );
    return res.rows;
}

/** Get messages in a thread */
export async function findMessagesByThread(threadId: string, limit = 50, offset = 0) {
    const res = await query<{
        id: string;
        thread_id: string;
        sender_id: string;
        text: string;
        sent_at: string;
        read_at: string | null;
        sender_first_name: string | null;
        sender_email: string;
    }>(
        `SELECT
            m.id,
            m.thread_id,
            m.sender_id,
            m.text,
            m.sent_at,
            m.read_at,
            u.first_name AS sender_first_name,
            u.email      AS sender_email
         FROM messages m
         JOIN users u ON u.id = m.sender_id
         WHERE m.thread_id = $1
         ORDER BY m.sent_at DESC
         LIMIT $2 OFFSET $3`,
        [threadId, limit, offset]
    );
    // Reverse to return in chronological (ASC) order
    return res.rows.reverse();
}

/** Create or fetch existing thread for a customer+artisan pair */
export async function upsertThread(input: {
    customerId: string;
    artisanProfileId: string;
    jobRequestId?: string;
}) {
    const res = await query<{ id: string }>(
        `INSERT INTO message_threads (customer_id, artisan_profile_id, job_request_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (customer_id, artisan_profile_id) DO UPDATE
           SET job_request_id = COALESCE(EXCLUDED.job_request_id, message_threads.job_request_id)
         RETURNING id`,
        [input.customerId, input.artisanProfileId, input.jobRequestId ?? null]
    );
    return res.rows[0];
}

/** Insert a message and update thread's last_message */
export async function insertMessage(input: {
    threadId: string;
    senderId: string;
    text: string;
}) {
    const msgRes = await query<{ id: string; sent_at: string }>(
        `INSERT INTO messages (thread_id, sender_id, text)
         VALUES ($1, $2, $3)
         RETURNING id, sent_at`,
        [input.threadId, input.senderId, input.text]
    );
    const msg = msgRes.rows[0];
    // Update last_message on thread
    await query(
        `UPDATE message_threads
         SET last_message = $1, last_message_at = $2
         WHERE id = $3`,
        [input.text, msg.sent_at, input.threadId]
    );
    return msg;
}

/** Get a single thread by ID with basic participant user IDs */
export async function findThreadById(id: string) {
    const res = await query<{
        id: string;
        customer_id: string;
        artisan_user_id: string;
        artisan_profile_id: string;
    }>(
        `SELECT mt.id, mt.customer_id, ap.user_id as artisan_user_id, mt.artisan_profile_id
         FROM message_threads mt
         JOIN artisan_profiles ap ON ap.id = mt.artisan_profile_id
         WHERE mt.id = $1`,
        [id]
    );
    return res.rows[0];
}

/** Mark messages as read in a thread for a specific user (the recipient) */
export async function markMessagesAsRead(threadId: string, userId: string) {
    await query(
        `UPDATE messages
         SET read_at = now()
         WHERE thread_id = $1
           AND sender_id != $2
           AND read_at IS NULL`,
        [threadId, userId]
    );
}
