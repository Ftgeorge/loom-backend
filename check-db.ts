import { query } from "./src/db/query";
import "dotenv/config";

async function check() {
    try {
        const skills = await query("SELECT * FROM skills");
        console.log("SKILLS IN DB:", skills.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
