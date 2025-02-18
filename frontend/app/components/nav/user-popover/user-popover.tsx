import type * as React from "react";

import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { CustomSignOut } from "./custom-sign-out";
import { RouterLink } from "~/components/link";
import { paths } from "~/lib/paths";
import { Box, Divider, List, ListItemIcon, MenuItem, Popover, Typography } from "@mui/material";


const user = {
	id: "USR-000",
	name: "Sofia Rivers",
	avatar: "/assets/avatar.png",
	email: "sofia@devias.io",
} as const;

function SignOutButton(): React.JSX.Element {
  return <CustomSignOut />;
}

export interface UserPopoverProps {
	anchorEl: null | Element;
	onClose?: () => void;
	open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
	return (
		<Popover
			anchorEl={anchorEl}
			anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			onClose={onClose}
			open={Boolean(open)}
			slotProps={{ paper: { sx: { width: "280px" } } }}
			transformOrigin={{ horizontal: "right", vertical: "top" }}
		>
			<Box sx={{ p: 2 }}>
				<Typography>Admin</Typography>
				<Typography color="text.secondary" variant="body2">
					admin@200apps.com
				</Typography>
			</Box>
			<Divider />
			{/* <List sx={{ p: 1 }}>
				<MenuItem component={RouterLink} href={paths.settings.account} onClick={onClose}>
					<ListItemIcon>
						<UserIcon />
					</ListItemIcon>
					Account
				</MenuItem>
			</List>
			<Divider /> */}
			<Box sx={{ p: 1 }}>
				<SignOutButton />
			</Box>
		</Popover>
	);
}
