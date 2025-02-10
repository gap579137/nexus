"use client";

import React from "react";

import Appshell from "@/layout/appShell";

import {
	ColorSchemeScript,
	MantineProvider,
	mantineHtmlProps,
} from "@mantine/core";

function Wrapper({ children }) {
	return (
		<>
			<ColorSchemeScript defaultColorScheme="dark" />
			<MantineProvider defaultColorScheme="dark">
				<Appshell>{children}</Appshell>
			</MantineProvider>
		</>
	);
}

export default Wrapper;
