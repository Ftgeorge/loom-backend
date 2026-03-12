import "dotenv/config";
import bcrypt from "bcrypt";
import { createUserWithProfileFields, updateUserById } from "../repositories/user.repo";
import { createArtisanProfile } from "../repositories/artisan.repo";
import { findSkillByName } from "../repositories/skill.repo";
import { addSkillToArtisan } from "../repositories/artisan-skill.repo";

async function main() {
    const passwordHash = await bcrypt.hash("password123", 10);
    
    const artisans = [
        {
            email: "emeka.abia@example.com",
            firstName: "Emeka",
            lastName: "Okonkwo",
            phone: "08012345678",
            skills: ["Plumber"],
        },
        {
            email: "aisha.abia@example.com",
            firstName: "Aisha",
            lastName: "Bello",
            phone: "08087654321",
            skills: ["Tailor", "Hair / Beauty"],
        },
        {
            email: "chinedu.abia@example.com",
            firstName: "Chinedu",
            lastName: "Eze",
            phone: "08011122233",
            skills: ["Electrician", "AC Repair"],
        },
        {
            email: "musa.abia@example.com",
            firstName: "Musa",
            lastName: "Garba",
            phone: "08044455566",
            skills: ["Mechanic"],
        },
        {
            email: "blessing.abia@example.com",
            firstName: "Blessing",
            lastName: "Ade",
            phone: "08077788899",
            skills: ["Cleaning"],
        }
    ];

    for (const data of artisans) {
        console.log(`Creating artisan: ${data.firstName} ${data.lastName}...`);
        
        // 1. Create User
        const user = await createUserWithProfileFields({
            email: data.email,
            passwordHash,
            role: "artisan",
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
        });

        // 2. Set Location
        await updateUserById(user.id, {
            state: "Abia",
            city: "Oruoha",
            area: "Opebi"
        });

        // 3. Create Artisan Profile
        const profile = await createArtisanProfile({
            userId: user.id,
            bio: `Experienced professional in ${data.skills.join(", ")} based in ${user.area || 'Opebi'}, ${user.city || 'Oruoha'}.`,
            yearsOfExperience: Math.floor(Math.random() * 10) + 2
        });

        // 4. Add Skills
        for (const skillName of data.skills) {
            const skill = await findSkillByName(skillName);
            if (skill) {
                await addSkillToArtisan({
                    artisanProfileId: profile.id,
                    skillId: skill.id
                });
            } else {
                console.warn(`Skill not found: ${skillName}`);
            }
        }

        console.log(`Successfully created ${data.firstName} (ID: ${user.id})`);
    }

    console.log("Seeding complete!");
}

main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});
