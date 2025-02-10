// app/api/categories/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/categories
 * Returns all categories in descending create order
 */
export async function GET() {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				_count: { select: { links: true } }, // for counting links
			},
		});
		return NextResponse.json(categories);
	} catch (error) {
		console.error("Error fetching categories:", error);
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/categories
 * Body: { name: string }
 */
export async function POST(request) {
	try {
		const { name } = await request.json();
		if (!name) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		const category = await prisma.category.create({
			data: { name },
		});

		return NextResponse.json(category, { status: 201 });
	} catch (error) {
		console.error("Error creating category:", error);
		return NextResponse.json(
			{ error: "Failed to create category" },
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/categories?id=123
 * Query param: id
 */
export async function DELETE(request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");
		if (!id) {
			return NextResponse.json(
				{ error: "Category ID is required" },
				{ status: 400 },
			);
		}

		// Optionally, handle logic if category has links, etc.
		await prisma.category.delete({
			where: { id: Number(id) },
		});

		return NextResponse.json({ message: "Category deleted" });
	} catch (error) {
		console.error("Error deleting category:", error);
		return NextResponse.json(
			{ error: "Failed to delete category" },
			{ status: 500 },
		);
	}
}
