import "dotenv/config";
import {createUser, findUserByEmail} from "../repositories/user.repo";

async function main () {
    const email = "test.customer@loom.com";

    const existing = await findUserByEmail(email);
    if (existing) {
        console.log("Found existing:", existing.email, existing.role);
        return;
    }

    const user = await createUser({
        email,
        passwordHash: "fake_hash_for_now",
        role: "customer",
    });

    console.log("Created:", user.email, user.id);
}

main().then(() => process.exit(0))
.catch((err) => {
    console.error(err);
    process.exit(1);
});