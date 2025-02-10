// app/api/ping-links/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// If you're on Node 18+, you can use the built-in fetch without importing from 'node-fetch'
export async function GET() {
	const links = await prisma.link.findMany();

	for (const link of links) {
		const start = Date.now();
		try {
			// HEAD request or GET to measure response time
			await fetch(link.url, { method: "HEAD", cache: "no-store" });
			const ping = Date.now() - start;

			// Update the link's ping in the DB
			await prisma.link.update({
				where: { id: link.id },
				data: { ping },
			});

			// Optionally store in PingLog:
			// await prisma.pingLog.create({ data: { linkId: link.id, ping } });
		} catch (error) {
			// If unreachable, set ping to null or handle as needed
			await prisma.link.update({
				where: { id: link.id },
				data: { ping: null },
			});
		}
	}

	return NextResponse.json({ message: "Ping update complete" });
}
