import * as React from "react";
import { MenuItem } from "@mui/material";
import { toast } from "sonner";
import { logger } from "~/lib/default-logger";
import { useNavigate } from "react-router";


export function CustomSignOut(): React.JSX.Element {
  const navigate = useNavigate();
  const handleSignOut = () => {
    navigate("/logout");
    toast("Signing out...");
    logger.debug("Signing out...");
  };
	
	return (
		<MenuItem component="div" onClick={handleSignOut} sx={{ justifyContent: "center" }}>
			Sign out
		</MenuItem>
	);
}
