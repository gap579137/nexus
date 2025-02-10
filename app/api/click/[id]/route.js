// app/api/click/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, context) {
	// Retrieve `params` from `context`
	const { params } = context;

	// Convert `params.id` to a number (no await needed)
	const linkId = Number.parseInt(params.id, 10);
	if (!linkId) {
		return NextResponse.json({ error: "Invalid link ID" }, { status: 400 });
	}

	// Look up the link
	const link = await prisma.link.findUnique({
		where: { id: linkId },
	});

	if (!link) {
		return NextResponse.json({ error: "Link not found" }, { status: 404 });
	}

	// Increment click count
	await prisma.link.update({
		where: { id: linkId },
		data: { clickCount: { increment: 1 } },
	});

	// Redirect user to actual URL
	return NextResponse.redirect(link.url, 302);
}
