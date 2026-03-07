import "dotenv/config";
import bcrypt from "bcrypt";
import { query } from "../db/query";
import { createUserWithProfileFields, updateUserById } from "../repositories/user.repo";
import { createArtisanProfile } from "../repositories/artisan.repo";
import { createSkill } from "../repositories/skill.repo";
import { addSkillToArtisan } from "../repositories/artisan-skill.repo";

async function main() {
    console.log("Cleaning database...");

    // Explicitly TRUNCATE tables with correct names from migrations
    const tables = [
        "artisan_skills",
        "ratings",
        "messages",
        "message_threads",
        "notifications",
        "artisan_earnings",
        "job_requests",
        "artisan_profiles",
        "skills",
        "users"
    ];

    for (const table of tables) {
        try {
            await query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
            console.log(`- Truncated ${table}`);
        } catch (err: any) {
            console.warn(`- Could not truncate ${table}: ${err.message}`);
        }
    }

    const password = "12345678";
    const passwordHash = await bcrypt.hash(password, 12);

    console.log("Seeding skills...");
    const skills = [
        "Plumber",
        "Electrician",
        "Carpenter",
        "Tailor",
        "Mechanic",
        "Cleaning",
        "Hair / Beauty",
        "AC Repair"
    ];
    const skillMap: Record<string, string> = {};
    for (const name of skills) {
        const s = await createSkill(name);
        skillMap[name] = s.id;
    }

    const artisans = [
        {
            firstName: "John",
            lastName: "Doe",
            email: "john@loom.com",
            phone: "08012345671",
            skill: "Plumber",
            city: "Lagos",
            area: "Ikeja",
            state: "Lagos",
            bio: "Expert plumber with over 10 years experience in residential plumbing."
        },
        {
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@loom.com",
            phone: "08012345672",
            skill: "Electrician",
            city: "Abuja",
            area: "Wuse 2",
            state: "FCT",
            bio: "Certified electrician specializing in smart home installations and wiring."
        },
        {
            firstName: "Ahmed",
            lastName: "Musa",
            email: "ahmed@loom.com",
            phone: "08012345673",
            skill: "Carpenter",
            city: "Kano",
            area: "Tarauni",
            state: "Kano",
            bio: "Custom furniture maker and wood repair specialist."
        },
        {
            firstName: "Blessing",
            lastName: "Okoro",
            email: "blessing@loom.com",
            phone: "08012345674",
            skill: "Tailor",
            city: "Port Harcourt",
            area: "GRA",
            state: "Rivers",
            bio: "Exquisite tailoring and fashion design for all occasions."
        },
        {
            firstName: "Chidi",
            lastName: "Obi",
            email: "chidi@loom.com",
            phone: "08012345675",
            skill: "Mechanic",
            city: "Enugu",
            area: "Independence Layout",
            state: "Enugu",
            bio: "Mechanical genius for Japanese and European car brands."
        }
    ];

    console.log("Seeding 5 artisans...");
    for (const a of artisans) {
        const user = await createUserWithProfileFields({
            email: a.email,
            passwordHash,
            role: "artisan",
            firstName: a.firstName,
            lastName: a.lastName,
            phone: a.phone
        });

        // Add location details
        await updateUserById(user.id, {
            city: a.city,
            area: a.area,
            state: a.state
        });

        const profile = await createArtisanProfile({
            userId: user.id,
            bio: a.bio,
            yearsOfExperience: 5
        });

        const skillId = skillMap[a.skill];
        if (skillId) {
            await addSkillToArtisan({ artisanProfileId: profile.id, skillId });
        }

        console.log(`+ Created artisan: ${a.firstName} ${a.lastName} (${a.skill})`);
    }

    console.log("Seeding test customer...");
    await createUserWithProfileFields({
        email: "test.customer@loom.com",
        passwordHash,
        role: "customer",
        firstName: "Test",
        lastName: "Customer",
        phone: "08000000000"
    });

    // Mark all seeded users as verified so they can bypass OTP screen in dev
    await query(`UPDATE users SET email_verified = true`);

    console.log("\nSeeding complete! 🚀");
    console.log("-----------------------------------------");
    console.log("Artisans: john@loom.com, jane@loom.com, ahmed@loom.com, blessing@loom.com, chidi@loom.com");
    console.log("Customer: test.customer@loom.com");
    console.log("Password for all: 12345678");
    console.log("-----------------------------------------");
}

main().then(() => {
    process.exit(0);
}).catch(err => {
    console.error("\nSeeding failed! ❌");
    console.error(err);
    process.exit(1);
});
