// app/api/screenshot/route.js
export const runtime = "nodejs"; // Force Node runtime, Puppeteer won't work in Edge runtime

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
// or 'puppeteer-core' + 'chrome-aws-lambda' if deploying to Vercel

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const url = searchParams.get("url");
	if (!url) {
		return NextResponse.json({ error: "Missing URL" }, { status: 400 });
	}

	let browser;
	try {
		browser = await puppeteer.launch({
			// For Vercel deployments with puppeteer-core + chrome-aws-lambda,
			// pass the required executablePath and other settings.
		});

		const page = await browser.newPage();
		await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

		// Take screenshot as base64 to return directly
		const screenshot = await page.screenshot({
			encoding: "base64",
			fullPage: false,
		});

		return NextResponse.json({ screenshot });
		// or you can return just the base64 string directly
	} catch (error) {
		console.error("Screenshot error:", error);
		return NextResponse.json(
			{ error: "Failed to take screenshot" },
			{ status: 500 },
		);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}
