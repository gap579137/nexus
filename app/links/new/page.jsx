"use client";

import { useState, useEffect } from "react";
import {
	Title,
	Text,
	TextInput,
	Textarea,
	Button,
	Select,
	Card,
	Flex,
	Stack,
	Switch,
} from "@mantine/core";

export default function LinksPage() {
	// Category states
	const [categories, setCategories] = useState([]);
	const [categoryName, setCategoryName] = useState("");

	// Link states
	const [links, setLinks] = useState([]);

	// Form fields for creating a new link
	const [url, setUrl] = useState("");
	const [label, setLabel] = useState("");
	const [selectedCategoryId, setSelectedCategoryId] = useState("");
	const [description, setDescription] = useState("");
	const [pingUrl, setPingUrl] = useState("");
	const [isActive, setIsActive] = useState(true); // default true

	// Error states
	const [linkError, setLinkError] = useState(null);
	const [catError, setCatError] = useState(null);

	useEffect(() => {
		fetchCategories();
		fetchLinks();
	}, []);

	async function fetchCategories() {
		setCatError(null);
		try {
			const res = await fetch("https://landing.fbcad.org/api/categories");
			if (!res.ok) {
				throw new Error("Failed to fetch categories");
			}
			const data = await res.json();
			setCategories(data);
		} catch (err) {
			setCatError(err.message);
		}
	}

	async function fetchLinks() {
		setLinkError(null);
		try {
			const res = await fetch("https://landing.fbcad.org/api/links");
			if (!res.ok) {
				throw new Error("Failed to fetch links");
			}
			const data = await res.json();
			setLinks(data);
		} catch (err) {
			setLinkError(err.message);
		}
	}

	// CATEGORY CRUD

	async function handleAddCategory(e) {
		e.preventDefault();
		setCatError(null);

		try {
			const res = await fetch("https://landing.fbcad.org/api/categories", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: categoryName }),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to create category");
			}
			await fetchCategories();
			setCategoryName("");
		} catch (err) {
			setCatError(err.message);
		}
	}

	async function handleRemoveCategory(catId) {
		setCatError(null);
		try {
			const res = await fetch(
				`https://landing.fbcad.org/api/categories?id=${catId}`,
				{
					method: "DELETE",
				},
			);
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to delete category");
			}
			await fetchCategories();
			await fetchLinks(); // in case links were in this category
		} catch (err) {
			setCatError(err.message);
		}
	}

	// LINK CRUD

	async function handleAddLink(e) {
		e.preventDefault();
		setLinkError(null);

		try {
			const res = await fetch("https://landing.fbcad.org/api/links", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					url,
					label,
					categoryId: selectedCategoryId || null,
					description,
					pingUrl,
					isActive,
				}),
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to create link");
			}

			// refresh link list
			await fetchLinks();

			// reset form
			setUrl("");
			setLabel("");
			setSelectedCategoryId("");
			setDescription("");
			setPingUrl("");
			setIsActive(true);
		} catch (err) {
			setLinkError(err.message);
		}
	}

	async function handleRemoveLink(linkId) {
		setLinkError(null);
		try {
			const res = await fetch(
				`https://landing.fbcad.org/api/links?id=${linkId}`,
				{
					method: "DELETE",
				},
			);
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to delete link");
			}
			await fetchLinks();
		} catch (err) {
			setLinkError(err.message);
		}
	}

	return (
		<Flex p="xl" gap="xl" align="flex-start">
			{/* COLUMN 1: Category Management */}
			<Stack spacing="md" style={{ flex: 1 }}>
				<Title order={2}>Categories</Title>
				{catError && <Text color="red">{catError}</Text>}

				<form onSubmit={handleAddCategory}>
					<Stack spacing="xs">
						<TextInput
							label="New Category"
							value={categoryName}
							onChange={(e) => setCategoryName(e.currentTarget.value)}
							required
						/>
						<Button type="submit">Add Category</Button>
					</Stack>
				</form>

				<Stack spacing="xs">
					{categories.map((cat) => (
						<Card
							key={cat.id}
							withBorder
							radius="md"
							p="md"
							style={{ display: "flex", justifyContent: "space-between" }}
						>
							<div>
								<Text weight={500}>{cat.name}</Text>
								{cat._count && cat._count.links !== undefined && (
									<Text size="xs" color="dimmed">
										{cat._count.links} links
									</Text>
								)}
							</div>
							<Button
								color="red"
								variant="light"
								onClick={() => handleRemoveCategory(cat.id)}
							>
								Remove
							</Button>
						</Card>
					))}
				</Stack>
			</Stack>

			{/* COLUMN 2: Link Management */}
			<Stack spacing="md" style={{ flex: 2 }}>
				<Title order={2}>Links</Title>
				{linkError && <Text color="red">{linkError}</Text>}

				{/* Add link form */}
				<form onSubmit={handleAddLink}>
					<Stack spacing="xs" maw={400}>
						<TextInput
							label="URL"
							placeholder="https://example.com"
							value={url}
							onChange={(e) => setUrl(e.currentTarget.value)}
							required
						/>
						<TextInput
							label="Label (optional)"
							placeholder="My Example Site"
							value={label}
							onChange={(e) => setLabel(e.currentTarget.value)}
						/>
						<TextInput
							label="Ping URL (optional)"
							placeholder="If different from URL"
							value={pingUrl}
							onChange={(e) => setPingUrl(e.currentTarget.value)}
						/>
						<Textarea
							label="Description (optional)"
							placeholder="Short description"
							minRows={2}
							value={description}
							onChange={(e) => setDescription(e.currentTarget.value)}
						/>
						<Switch
							label="Is Active?"
							checked={isActive}
							onChange={(event) => setIsActive(event.currentTarget.checked)}
						/>

						<Select
							label="Category"
							placeholder="-- No Category --"
							value={selectedCategoryId}
							onChange={(val) => setSelectedCategoryId(val)}
							data={[
								{ label: "-- No Category --", value: "" },
								...categories.map((c) => ({
									label: c.name,
									value: String(c.id),
								})),
							]}
						/>

						<Button type="submit">Add Link</Button>
					</Stack>
				</form>

				{/* Existing links list */}
				<Stack spacing="xs">
					{links.map((link) => (
						<Card
							key={link.id}
							withBorder
							radius="md"
							p="md"
							style={{ display: "flex", justifyContent: "space-between" }}
						>
							<div>
								<Text weight={500}>
									<a href={link.url} target="_blank" rel="noopener noreferrer">
										{link.label || link.url}
									</a>
								</Text>
								{/* Show category if present */}
								{link.category?.name && (
									<Text size="xs" color="dimmed">
										Category: {link.category.name}
									</Text>
								)}
								{/* Show description if present */}
								{link.description && <Text size="sm">{link.description}</Text>}
								{/* Show pingUrl if present */}
								{link.pingUrl && (
									<Text size="xs" color="dimmed">
										Ping URL: {link.pingUrl}
									</Text>
								)}
								{/* Show isActive */}
								<Text size="xs" color={link.isActive ? "green" : "red"}>
									Active: {link.isActive ? "Yes" : "No"}
								</Text>
								{/* Show clickCount, ping, etc. as read-only */}
								<Text size="xs" color="dimmed">
									Clicks: {link.clickCount} | Ping:{" "}
									{link.ping != null ? link.ping + " ms" : "N/A"}
								</Text>
							</div>
							<Button
								color="red"
								variant="light"
								onClick={() => handleRemoveLink(link.id)}
							>
								Remove
							</Button>
						</Card>
					))}
				</Stack>
			</Stack>
		</Flex>
	);
}
