import type * as React from "react";
import { useColorScheme, Box } from "@mui/material";

const HEIGHT = 60;
const WIDTH = 60;

type Color = "dark" | "light";

export interface LogoProps {
	color?: Color;
	emblem?: boolean;
	height?: number;
	width?: number;
}

export function Logo({ color = "dark", emblem, height = HEIGHT, width = WIDTH }: LogoProps): React.JSX.Element {
	let url: string;

	if (emblem) {
		url = color === "light" ? "/assets/logo-emblem.svg" : "/assets/logo-emblem--dark.svg";
	} else {
		url = color === "light" ? "/assets/logo.svg" : "/assets/logo--dark.svg";
	}

	return <Box alt="logo" component="img" height={height} src={url} width={width} />;
}

export interface DynamicLogoProps {
	colorDark?: Color;
	colorLight?: Color;
	emblem?: boolean;
	height?: number;
	width?: number;
}

export function DynamicLogo({
	colorDark = "dark",
	colorLight = "light",
	height = HEIGHT,
	width = WIDTH,
	...props
}: DynamicLogoProps): React.JSX.Element {
	const { mode } = useColorScheme();
	const color = mode === "dark" ? colorDark : colorLight;

	return (
    <Logo color={color} height={height} width={width} {...props} />
	);
}
