import React from "react";
import Typography, { TypographyProps } from "@mui/material/Typography";

const fatFaceVariant = ["h1", "h2", "h3"];
const Header: React.FC<TypographyProps> = ({ children, ...props }) => {
  const typographyProps = React.useMemo(
    () => ({
      color: "textPrimary",
      fontFamily: fatFaceVariant.includes(props.variant)
        ? "Abril Fatface"
        : "Playfair Display",
      sx: {
        pb: 1,
        letterSpacing: fatFaceVariant.includes(props.variant) ? 0 : 0.5,
        fontWeight: fatFaceVariant.includes(props.variant) ? 400 : 600,
      },
    }),
    [props.variant]
  );

  return (
    <Typography {...typographyProps} {...props}>
      {children}
    </Typography>
  );
};
export default Header;
