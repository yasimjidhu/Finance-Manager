import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface ActionSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

const { height } = Dimensions.get('window');

const ActionSheet = ({
    visible,
    onClose,
    title,
    children,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
}: ActionSheetProps) => {
    const { theme } = useTheme();

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={[
                                styles.sheetContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderTopColor: theme.colors.border,
                                }
                            ]}
                        >
                            {/* Handle Bar */}
                            <View style={styles.handleBarContainer}>
                                <View style={[styles.handleBar, { backgroundColor: theme.colors.border }]} />
                            </View>

                            {/* Header */}
                            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                                <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <View style={styles.content}>
                                {children}
                            </View>

                            {/* Footer Actions */}
                            {(actionLabel || secondaryActionLabel) && (
                                <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
                                    {secondaryActionLabel && (
                                        <TouchableOpacity
                                            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
                                            onPress={onSecondaryAction}
                                        >
                                            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                                                {secondaryActionLabel}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {actionLabel && (
                                        <TouchableOpacity
                                            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                                            onPress={onAction}
                                        >
                                            <Text style={styles.primaryButtonText}>{actionLabel}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        maxHeight: height * 0.9,
        paddingBottom: 20,
    },
    handleBarContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ActionSheet;
