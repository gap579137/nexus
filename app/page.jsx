"use client";

import { useEffect, useState } from "react";
import { Text } from "@mantine/core";
import LinkCard from "@/components/linkCard"; // We'll create this component below

export default function Home() {
	const [links, setLinks] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchLinks() {
			try {
				// Replace this URL with your actual endpoint
				const res = await fetch("https://landing.fbcad.org/api/links", {
					cache: "no-store",
				});

				if (!res.ok) {
					throw new Error("Failed to fetch links from API");
				}

				const data = await res.json();
				setLinks(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		fetchLinks();
	}, []);

	// Loading state
	if (loading) {
		return <p style={{ padding: "1rem" }}>Loading links...</p>;
	}

	// Error state
	if (error) {
		return (
			<main style={{ padding: "1rem" }}>
				<Text size="xl" weight="bold" mb="md">
					My Landing Page
				</Text>
				<Text color="red">{error}</Text>
			</main>
		);
	}

	return (
		<main style={{ padding: "1rem" }}>
			<Text size="xl" weight="bold" mb="md">
				My Landing Page
			</Text>

			<div
				style={{
					display: "flex",
					flexWrap: "wrap",
					gap: "1rem",
				}}
			>
				{/* Render each link as a vertical card */}
				{links.map((link) => (
					<LinkCard key={link.id} link={link} />
				))}
			</div>
		</main>
	);
}
