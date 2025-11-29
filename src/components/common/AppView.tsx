import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "../../theme/ThemeProvider"

export default function AppView({ style, ...props }: ViewProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        { backgroundColor: theme.colors.background },
        style
      ]}
      {...props}
    />
  );
}
