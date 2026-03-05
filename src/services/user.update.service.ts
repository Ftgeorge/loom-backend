import { updateUserById } from "../repositories/user.repo";

export async function updateUser(input: {
    userId: string;
    updates: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        email?: string;
    };
}) {
    try {
    const updated = await updateUserById(input.userId, input.updates);

    if (!updated) {
        return { ok: false as const, status: 400, error: "Nothing to update" };
    }

    return { ok: true as const, status: 200, data: updated };
}  catch (err: any) {
    if (err?.code === "23505") {
        return {ok: false as const, status: 409, error: "Email already exists"};
    }
    throw err;
    }
}