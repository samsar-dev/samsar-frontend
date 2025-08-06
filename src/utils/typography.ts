import React from "react";

interface SxProps {
  [key: string]: any;
  mb?: string | number;
  mt?: string | number;
  ml?: string | number;
  mr?: string | number;
  mx?: string | number;
  my?: string | number;
  p?: string | number;
  px?: string | number;
  py?: string | number;
  pt?: string | number;
  pb?: string | number;
  pl?: string | number;
  pr?: string | number;
  fontSize?: string | number | { [key: string]: string | number };
}

interface TypographyProps {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "caption";
  color?:
    | "primary"
    | "secondary"
    | "text.primary"
    | "text.secondary"
    | "error"
    | "success"
    | "warning"
    | "info"
    | "warning.contrastText";
  align?: "left" | "center" | "right" | "justify";
  className?: string;
  sx?: SxProps;
  children?: React.ReactNode;
  component?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  gutterBottom?: boolean;
  paragraph?: boolean;
  [key: string]: any;
}

const colorMap: Record<string, string> = {
  primary: "#1976d2",
  secondary: "#dc004e",
  "text.primary": "rgba(0, 0, 0, 0.87)",
  "text.secondary": "rgba(0, 0, 0, 0.6)",
  error: "#f44336",
  success: "#4caf50",
  warning: "#ff9800",
  info: "#2196f3",
  "warning.contrastText": "#fff",
};

const typographyStyles: Record<string, React.CSSProperties> = {
  h1: { fontSize: "2.5rem", fontWeight: 500, margin: "0.67em 0" },
  h2: { fontSize: "2rem", fontWeight: 500, margin: "0.83em 0" },
  h3: { fontSize: "1.75rem", fontWeight: 500, margin: "1em 0" },
  h4: { fontSize: "1.5rem", fontWeight: 500, margin: "1.33em 0" },
  h5: { fontSize: "1.25rem", fontWeight: 500, margin: "1.67em 0" },
  h6: { fontSize: "1rem", fontWeight: 500, margin: "2.33em 0" },
  subtitle1: { fontSize: "1rem", fontWeight: 400, opacity: 0.87 },
  subtitle2: { fontSize: "0.875rem", fontWeight: 500, opacity: 0.87 },
  body1: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.43 },
  caption: { fontSize: "0.75rem", fontWeight: 400, opacity: 0.87 },
};

const processSx = (sx: SxProps = {}): React.CSSProperties => {
  const processed: React.CSSProperties = {};

  // Handle spacing shortcuts
  if (sx.mb !== undefined) processed.marginBottom = sx.mb;
  if (sx.mt !== undefined) processed.marginTop = sx.mt;
  if (sx.ml !== undefined) processed.marginLeft = sx.ml;
  if (sx.mr !== undefined) processed.marginRight = sx.mr;
  if (sx.mx !== undefined) {
    processed.marginLeft = sx.mx;
    processed.marginRight = sx.mx;
  }
  if (sx.my !== undefined) {
    processed.marginTop = sx.my;
    processed.marginBottom = sx.my;
  }

  // Handle padding shortcuts
  if (sx.p !== undefined) processed.padding = sx.p;
  if (sx.px !== undefined) {
    processed.paddingLeft = sx.px;
    processed.paddingRight = sx.px;
  }
  if (sx.py !== undefined) {
    processed.paddingTop = sx.py;
    processed.paddingBottom = sx.py;
  }
  if (sx.pt !== undefined) processed.paddingTop = sx.pt;
  if (sx.pb !== undefined) processed.paddingBottom = sx.pb;
  if (sx.pl !== undefined) processed.paddingLeft = sx.pl;
  if (sx.pr !== undefined) processed.paddingRight = sx.pr;

  // Handle responsive fontSize (simplified - uses base value)
  if (sx.fontSize) {
    if (typeof sx.fontSize === "object") {
      // Use the base value or first available
      processed.fontSize = sx.fontSize.md || sx.fontSize.xs || "1rem";
    } else {
      processed.fontSize = sx.fontSize;
    }
  }

  // Copy all other sx properties
  Object.keys(sx).forEach((key) => {
    if (
      ![
        "mb",
        "mt",
        "ml",
        "mr",
        "mx",
        "my",
        "p",
        "px",
        "py",
        "pt",
        "pb",
        "pl",
        "pr",
      ].includes(key)
    ) {
      (processed as any)[key] = sx[key];
    }
  });

  return processed;
};

export const Typography: React.FC<TypographyProps> = ({
  variant = "body1",
  color,
  align,
  className,
  sx,
  children,
  component: Component = "div",
  gutterBottom,
  paragraph,
  ...props
}) => {
  const processedSx = processSx(sx);

  const style: React.CSSProperties = {
    ...typographyStyles[variant],
    color: color ? colorMap[color] || color : "inherit",
    textAlign: align,
    marginBottom: gutterBottom ? "1rem" : undefined,
    lineHeight: paragraph
      ? 1.5
      : (typographyStyles[variant]?.lineHeight as number) || 1.2,
    ...processedSx,
  };

  const Tag = Component;

  return React.createElement(
    Tag,
    {
      className,
      style,
      ...props,
    },
    children,
  );
};

// Usage example:
// import { Typography } from '@/utils/typography';
// <Typography variant="h1">Heading</Typography>
// <Typography variant="body1" color="primary">Text</Typography>
