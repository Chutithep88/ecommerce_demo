"use server";

// import { AuthError } from "next-auth/errors";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters.")
        .max(100),

    email: z
        .string()
        .trim()
        .email("Please enter a valid email."),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(100),
});

export async function loginAction(
    _previousState: {
        error?: string;
    } | null,
    formData: FormData
) {
    const email = String(formData.get("email") ?? "")
        .trim()
        .toLowerCase();

    const password = String(
        formData.get("password") ?? ""
    );

    if (!email || !password) {
        return {
            error: "Email and password are required.",
        };
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/account",
        });

        return {};
    } catch (error) {
        // if (error instanceof AuthError) {
        //   return {
        //     error: "Invalid email or password.",
        //   };
        // }
        if (error && typeof error === "object" && "type" in error) {
            return {
                error: "Invalid email or password.",
            };
        }

        throw error;
    }
}

export async function registerAction(
    _previousState: {
        error?: string;
    } | null,
    formData: FormData
) {
    const result = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!result.success) {
        return {
            error: result.error.issues[0]?.message ?? "Invalid input.",
        };
    }

    const {
        name,
        email,
        password,
    } = result.data;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    if (existingUser) {
        return {
            error: "An account with this email already exists.",
        };
    }

    const passwordHash = await bcrypt.hash(
        password,
        12
    );

    await prisma.user.create({
        data: {
            name,
            email: normalizedEmail,
            passwordHash,
            role: "CUSTOMER",
        },
    });

    try {
        await signIn("credentials", {
            email: normalizedEmail,
            password,
            redirectTo: "/account",
        });

        return {};
    } catch (error) {
        // if (error instanceof AuthError) {
        //     return {
        //         error: "Account created, but automatic login failed.",
        //     };
        // }

        if (error && typeof error === "object" && "type" in error) {
            return {
                error: "Invalid email or password.",
            };
        }

        throw error;
    }
}

export async function logoutAction() {
    await signOut({
        redirectTo: "/",
    });
}