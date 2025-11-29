// components/common/Screen.jsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from './AppHeader';
import { useTheme } from '../../theme/ThemeProvider';
import { StyleProp } from 'react-native';
import { ViewStyle } from 'react-native';
import { spacing } from '../../theme/spacing';

export default function Screen({ 
  children, 
  headerTitle, 
  showHeader = true,
  showBackButton = true,
  onBackPress,
  rightComponent,
  scrollable = true,
  style 
}: {
  children: React.ReactNode;
  headerTitle?: string;
  showHeader?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.content, style]}>
      {showHeader && headerTitle && (
        <AppHeader
          title={headerTitle}
          showBackButton={showBackButton}
          onBackPress={onBackPress}
          rightComponent={rightComponent}
        />
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {scrollable ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  content: {
    flex: 1,
  },
});