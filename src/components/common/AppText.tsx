import React from "react";
import { Text, TextProps } from "react-native";
import { useTheme } from "../../theme/ThemeProvider"

export default function AppText({ style, ...props }: TextProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        {
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamilyRegular,
          fontSize: theme.typography.body,
        },
        style
      ]}
      {...props}
    />
  );
}
