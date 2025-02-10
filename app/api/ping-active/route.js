// app/api/ping/route.js
import { NextResponse } from "next/server";
import { promise as ping } from "ping"; // the ping library
import { getServiceItem } from "utils/config/service-helpers";
import createLogger from "utils/logger";

// (Optional) Force Node.js runtime if your environment defaults to Edge
export const runtime = "nodejs";

const logger = createLogger("ping");

// GET /api/ping?groupName=xxx&serviceName=xxx
export async function GET(request) {
	try {
		// 1) Parse query parameters from the request URL
		const { searchParams } = new URL(request.url);
		const groupName = searchParams.get("groupName");
		const serviceName = searchParams.get("serviceName");

		// 2) Look up the service item
		const serviceItem = await getServiceItem(groupName, serviceName);
		if (!serviceItem) {
			logger.debug(
				`No service item found for group ${groupName} named ${serviceName}`,
			);
			return NextResponse.json(
				{ error: "Unable to find service. See logs for details." },
				{ status: 400 },
			);
		}

		// 3) Extract the host or URL to ping
		const { ping: pingHostOrURL } = serviceItem;
		if (!pingHostOrURL) {
			logger.debug("No ping host specified");
			return NextResponse.json(
				{ error: "No ping host given" },
				{ status: 400 },
			);
		}

		// 4) Convert "http://..." or "https://..." to just the hostname, if needed
		let hostname = pingHostOrURL;
		try {
			hostname = new URL(pingHostOrURL).hostname;
		} catch (error) {
			// If constructing a new URL fails, we assume pingHostOrURL is just "somehost.com"
			// so do nothing special here
		}

		// 5) Perform the ping
		const response = await ping.probe(hostname);
		// 'response' typically looks like: { host: '...', alive: true, time: 53.2, ... }

		// 6) Return the ping result as JSON
		return NextResponse.json(response, { status: 200 });
	} catch (error) {
		logger.debug("Error attempting ping:", error);
		return NextResponse.json(
			{ error: "Error attempting ping, see logs." },
			{ status: 400 },
		);
	}
}
