"use client";

import { AppShell, Group, rem, Text } from "@mantine/core";
import { useHeadroom } from "@mantine/hooks";

const lorem =
	"Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos ullam, ex cum repellat alias ea nemo. Ducimus ex nesciunt hic ad saepe molestiae nobis necessitatibus laboriosam officia, reprehenderit, earum fugiat?";

export default function Headroom({ children }) {
	const pinned = useHeadroom({ fixedAt: 120 });

	return (
		<AppShell
			header={{ height: 60, collapsed: !pinned, offset: false }}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md">
					Nexus
				</Group>
			</AppShell.Header>

			<AppShell.Main pt={`calc(${rem(60)} + var(--mantine-spacing-md))`}>
				{children}
			</AppShell.Main>
		</AppShell>
	);
}
