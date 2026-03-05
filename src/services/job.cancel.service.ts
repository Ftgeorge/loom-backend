import { pool } from "../db/pool";
import { cancelJobTx } from "../repositories/job.repo.tx";

export async function cancelJob(input: { jobId: string; customerId: string }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const job = await cancelJobTx(client, input);

        if (!job) {
            await client.query("ROLLBACK");
            return {
                ok: false as const,
                status: 404,
                error: "Job not found, already completed/cancelled, or you are not the owner",
            };
        }

        await client.query("COMMIT");
        return { ok: true as const, status: 200, data: job };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}
