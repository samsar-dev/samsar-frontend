import { styled } from "@mui/system";
import Box from "@mui/material/Box";

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption';
  color?: 'primary' | 'secondary' | 'text.primary' | 'text.secondary' | 'error' | 'success' | 'warning' | 'info' | 'warning.contrastText';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  sx?: any;
  children?: React.ReactNode;
  component?: React.ElementType;
  gutterBottom?: boolean;
  paragraph?: boolean;
}

const typographyStyles: Record<TypographyProps['variant'], React.CSSProperties> = {
  h1: { fontSize: '2.5rem', fontWeight: 500, margin: '0.67em 0' },
  h2: { fontSize: '2rem', fontWeight: 500, margin: '0.83em 0' },
  h3: { fontSize: '1.75rem', fontWeight: 500, margin: '1em 0' },
  h4: { fontSize: '1.5rem', fontWeight: 500, margin: '1.33em 0' },
  h5: { fontSize: '1.25rem', fontWeight: 500, margin: '1.67em 0' },
  h6: { fontSize: '1rem', fontWeight: 500, margin: '2.33em 0' },
  subtitle1: { fontSize: '1rem', fontWeight: 400, opacity: 0.87 },
  subtitle2: { fontSize: '0.875rem', fontWeight: 500, opacity: 0.87 },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 },
  caption: { fontSize: '0.75rem', fontWeight: 400, opacity: 0.87 },
};

export const Typography = styled(Box)<TypographyProps>(({ 
  variant = 'body1', 
  color, 
  align, 
  sx, 
  component, 
  gutterBottom,
  paragraph 
}) => ({
  ...typographyStyles[variant],
  color: color || 'inherit',
  textAlign: align,
  marginBottom: gutterBottom ? '1rem' : undefined,
  lineHeight: paragraph ? 1.5 : 1,
  ...sx,
}));

// Usage example:
// import { Typography } from '@/utils/typography';
// <Typography variant="h1">Heading</Typography>
// <Typography variant="body1" color="primary">Text</Typography>
