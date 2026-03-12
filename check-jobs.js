const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgres://george@localhost:5432/loom'
    });
    try {
        await client.connect();
        const res = await client.query("SELECT * FROM job_requests ORDER BY created_at DESC LIMIT 5");
        console.log("RECENT JOBS:", res.rows);
        await client.end();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
