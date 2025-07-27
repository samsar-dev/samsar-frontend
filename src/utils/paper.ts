import { styled } from "@mui/system";
import Box from "@mui/material/Box";

interface PaperProps {
  elevation?: number;
  variant?: 'outlined' | 'elevation';
  sx?: any;
  children?: React.ReactNode;
}

export const Paper = styled(Box)<PaperProps>(({ elevation = 1, variant = 'elevation', sx }) => ({
  backgroundColor: "background.paper",
  borderRadius: 1,
  ...(variant === 'outlined' && {
    border: '1px solid rgba(0,0,0,0.12)',
    boxShadow: 'none',
  }),
  ...(variant === 'elevation' && {
    boxShadow: `0 2px 4px rgba(0,0,0,0.1)`,
  }),
  ...(elevation === 2 && {
    boxShadow: `0 3px 5px rgba(0,0,0,0.12)`,
  }),
  ...(elevation === 3 && {
    boxShadow: `0 3px 6px rgba(0,0,0,0.16)`,
  }),
  ...(elevation === 4 && {
    boxShadow: `0 5px 8px rgba(0,0,0,0.2)`,
  }),
  ...(elevation === 5 && {
    boxShadow: `0 8px 10px rgba(0,0,0,0.22)`,
  }),
  ...sx,
}));
