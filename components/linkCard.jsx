"use client";

import { useEffect, useState } from "react";
import { Card, Image, Text, Group, Badge, Indicator } from "@mantine/core";
import Link from "next/link";
import classes from "./linkCard.module.css";

export default function LinkCard({ link }) {
	const [color, setColor] = useState("gray");
	const [base64Image, setBase64Image] = useState(null);

	// Set the color based on the ping time

	useEffect(() => {
		if (link.ping <= 100) {
			setColor("green");
		} else if (link.ping <= 200) {
			setColor("yellow");
		} else {
			setColor("red");
		}
	}, [link.ping]);
	// Perform a ping if this link is active
	useEffect(() => {
		console.log("LinkCard loaded:", link.label);

		// Only ping if isActive = true
		if (!link.isActive) return;

		async function pingHost() {
			try {
				// Example usage: call /api/ping?id=LINK_ID
				const res = await fetch(`/api/ping?id=${link.id}`);
				if (!res.ok) {
					throw new Error("Failed to ping host");
				}
				const data = await res.json();
				console.log("Ping response:", data);
			} catch (err) {
				console.error("Ping error:", err);
			}
		}

		pingHost();
	}, [link.id, link.isActive, link.label]);

	useEffect(() => {
		// Only fetch a screenshot if the link is active (optional)
		if (!link.isActive) return;

		async function fetchScreenshot() {
			try {
				const res = await fetch(
					`/api/screenshot?url=${encodeURIComponent(link.url)}`,
				);
				if (!res.ok) {
					throw new Error("Failed to fetch screenshot");
				}
				const data = await res.json();
				// data.screenshot is a base64-encoded string
				setBase64Image(`data:image/png;base64,${data.screenshot}`);
			} catch (err) {
				console.error(err);
			}
		}
		fetchScreenshot();
	}, [link.url, link.isActive]);

	// Log the link data for debugging
	console.log("Link object:", link);

	return (
		<Indicator inline label={`${link.ping} ms`} size={16} color={color}>
			<Card withBorder radius="md" p={0} className={classes.card}>
				<Group wrap="nowrap" gap={0}>
					{/* Route user through /api/click/:id to increment clickCount */}
					<Link href={`/api/click/${link.id}`} passHref legacyBehavior>
						<a
							href={`/api/click/${link.id}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Image
								src={base64Image || "https://via.placeholder.com/150"} // Fallback placeholder
								height={100}
								alt={link.label}
							/>
						</a>
					</Link>

					<div className={classes.body}>
						<Text tt="uppercase" c="dimmed" fw={700} size="md">
							{link.label}
						</Text>

						<Text className={classes.title} mt="xs" mb="md">
							{link.description}
						</Text>

						<Group wrap="nowrap" gap="xs">
							<Group gap="xs" wrap="nowrap">
								<Text size="xs">Clicks: {link.clickCount}</Text>
							</Group>
							<Text size="xs" c="dimmed">
								•
							</Text>
							<Text size="xs" c="dimmed">
								{/* createdAt is a DateTime in DB, you might want to format it */}
								{link.createdAt}
							</Text>
						</Group>
					</div>
				</Group>
			</Card>
		</Indicator>
	);
}
