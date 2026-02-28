import "dotenv/config";
import { createApp } from "./app";
import { pool } from "./db/pool";

const app = createApp();

const PORT = Number(process.env.PORT ?? 4000);

const server = app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
})

async function shutdown(signal: string){
    console.log(`\n${signal} received, Shutting down ...`);
    server.close(async () => {
        await pool.end(); // closes all idle connections
        console.log("Shutdown complete.");
        process.exit(0);
    });
}

process.on("SIGINT", () =>  shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});