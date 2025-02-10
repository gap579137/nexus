// app/api/links/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/links
 */
export async function GET() {
	try {
		const links = await prisma.link.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				category: true, // to include category info if needed
			},
		});
		return NextResponse.json(links);
	} catch (error) {
		console.error("Error fetching links:", error);
		return NextResponse.json(
			{ error: "Failed to fetch links" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/links
 * Body: { url, label, categoryId, description, isActive, pingUrl }
 */
export async function POST(request) {
	try {
		const { url, label, categoryId, description, isActive, pingUrl } =
			await request.json();

		if (!url) {
			return NextResponse.json({ error: "URL is required" }, { status: 400 });
		}

		// Basic validation for URL
		if (!/^https?:\/\//i.test(url)) {
			return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
		}

		const newLink = await prisma.link.create({
			data: {
				url,
				label,
				categoryId: categoryId ? Number(categoryId) : null,
				description,
				isActive: isActive ?? true,
				pingUrl: pingUrl ?? null,
			},
		});

		return NextResponse.json(newLink, { status: 201 });
	} catch (error) {
		console.error("Error creating link:", error);
		return NextResponse.json(
			{ error: "Something went wrong" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/links?id=123
 * or handle in [id]/route.js
 */
export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");
		if (!id) {
			return NextResponse.json(
				{ error: "Link ID is required" },
				{ status: 400 },
			);
		}

		await prisma.link.delete({
			where: { id: Number(id) },
		});

		return NextResponse.json({ message: "Link deleted" });
	} catch (error) {
		console.error("Error deleting link:", error);
		return NextResponse.json(
			{ error: "Failed to delete link" },
			{ status: 500 },
		);
	}
}
