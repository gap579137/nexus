// app/api/ping/route.js
import { NextResponse } from "next/server";
import { promise as ping } from "ping"; // the ping library
import { prisma } from "@/lib/prisma"; // import your Prisma client

// (Optional) Force Node.js runtime if your environment defaults to Edge
export const runtime = "nodejs";

/**
 * GET /api/ping?id=NUMBER
 * Pings the specified Link if isActive = true. Stores the result in Link.ping and creates a PingLog record.
 */
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const linkIdParam = searchParams.get("id");
		if (!linkIdParam) {
			return NextResponse.json(
				{ error: "No link id provided" },
				{ status: 400 },
			);
		}

		const linkId = parseInt(linkIdParam, 10);
		if (isNaN(linkId)) {
			return NextResponse.json({ error: "Invalid link id" }, { status: 400 });
		}

		// 1) Look up the link in the DB
		const link = await prisma.link.findUnique({
			where: { id: linkId },
		});

		if (!link) {
			return NextResponse.json({ error: "Link not found" }, { status: 404 });
		}

		// 2) Check if link is active
		if (!link.isActive) {
			return NextResponse.json(
				{ message: "Link is not active, skipping ping" },
				{ status: 200 },
			);
		}

		// 3) Determine which URL to ping
		const targetUrl = link.pingUrl?.trim() ? link.pingUrl : link.url;

		// 4) Usually, the ping library only needs the hostname, but you can attempt the entire URL
		let hostname = targetUrl;
		try {
			hostname = new URL(targetUrl).hostname;
		} catch (error) {
			// If new URL() fails, fallback to whatever was in targetUrl
		}

		const start = Date.now();
		const response = await ping.probe(hostname); // returns { alive, time, ... }
		const pingMs = Date.now() - start;

		// 5) Update DB based on ping success/failure
		if (!response.alive) {
			// host not responding
			await prisma.link.update({
				where: { id: linkId },
				data: { ping: null },
			});
			await prisma.pingLog.create({
				data: {
					linkId,
					ping: 0, // or store -1 to indicate failure
				},
			});

			return NextResponse.json(
				{
					message: "Ping failed",
					alive: false,
					host: response.host,
				},
				{ status: 200 },
			);
		} else {
			// Ping is successful
			await prisma.link.update({
				where: { id: linkId },
				data: { ping: pingMs },
			});
			await prisma.pingLog.create({
				data: {
					linkId,
					ping: pingMs,
				},
			});

			return NextResponse.json(
				{
					message: "Ping success",
					alive: true,
					host: response.host,
					pingMs,
				},
				{ status: 200 },
			);
		}
	} catch (error) {
		console.error("Ping error:", error);
		return NextResponse.json(
			{ error: "Error attempting ping" },
			{ status: 500 },
		);
	}
}
