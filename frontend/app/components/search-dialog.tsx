import * as React from "react";
import { MagnifyingGlass as MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { X as XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { Tip } from "./tip";
import {
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router";

export interface SearchDialogProps {
	onClose: () => void;
	open?: boolean;
}

export function SearchDialog({ onClose, open = false }: SearchDialogProps): React.JSX.Element {
  const navigate = useNavigate();
	const [value, setValue] = React.useState<string>("");
	const handleSubmit = React.useCallback(async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();
		await navigate(`/events/search?q=${value}`);
    setValue('');
    onClose();
	}, [value, navigate]);

	return (
		<Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
			<Stack direction="row" spacing={3} sx={{ alignItems: "center", justifyContent: "space-between", px: 3, py: 2 }}>
				<Typography variant="h6">Search</Typography>
				<IconButton onClick={onClose}>
					<XIcon />
				</IconButton>
			</Stack>
			<DialogContent>
				<Stack spacing={3}>
					<Tip message="Search by entering a keyword and pressing Enter" />
					<form onSubmit={handleSubmit}>
            <OutlinedInput
              fullWidth
              onChange={(event) => {
                setValue(event.target.value);
              }}
              placeholder="Search..."
              startAdornment={
                <InputAdornment position="start">
                  <MagnifyingGlassIcon />
                </InputAdornment>
              }
              value={value}
            />
					</form>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
