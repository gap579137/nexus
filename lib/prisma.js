// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		// log: ['query'], // uncomment for debugging
	});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
