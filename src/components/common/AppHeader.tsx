// components/common/AppHeader.jsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppText from './AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';

export default function AppHeader({ 
  title , 
  showBackButton = true,
  onBackPress,
  rightComponent,
  backButtonTestID = 'header-back-button'
}: { 
  title: string; 
  showBackButton?: boolean; 
  onBackPress?: () => void; 
  rightComponent?: React.ReactNode; 
  backButtonTestID?: string; 
}) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback to specific screen or minimal handling
      console.warn('No navigation history available');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            testID={backButtonTestID}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      <AppText style={[styles.title, { color: theme.colors.text }]}>
        {title}
      </AppText>
      
      <View style={styles.rightSection}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  leftSection: {
    width: 40, // Fixed width for alignment
  },
  rightSection: {
    width: 40, // Fixed width for alignment
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24, // Same as icon size for balance
  },
});