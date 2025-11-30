import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import AppText from '../../components/common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { ReceiptScannerService, ReceiptData } from '../../services/receiptScanner.service';
import { ExpenseService } from '../../services/expense.service';
import { formatCurrency } from '../../utils/helpers';

import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ReceiptScannerScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

    const handlePickImage = async () => {
        const hasPermission = await ReceiptScannerService.requestPermissions();
        if (!hasPermission) {
            Alert.alert("Permission Required", "Please allow access to camera and gallery.");
            return;
        }
        const uri = await ReceiptScannerService.pickImage();
        if (uri) {
            setImageUri(uri);
            setReceiptData(null); // Reset previous data
        }
    };

    const handleTakePhoto = async () => {
        const hasPermission = await ReceiptScannerService.requestPermissions();
        if (!hasPermission) {
            Alert.alert("Permission Required", "Please allow access to camera and gallery.");
            return;
        }
        const uri = await ReceiptScannerService.takePhoto();
        if (uri) {
            setImageUri(uri);
            setReceiptData(null);
        }
    };

    const handleScan = async () => {
        if (!imageUri) return;

        setIsScanning(true);
        try {
            const data = await ReceiptScannerService.analyzeReceipt(imageUri);
            setReceiptData(data);
        } catch (error) {
            Alert.alert("Error", "Failed to analyze receipt. Please try again.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleSave = async () => {
        if (!receiptData) return;

        try {
            await ExpenseService.addTransaction({
                title: receiptData.merchantName,
                amount: receiptData.totalAmount,
                date: new Date().toISOString(), // Use current time for simplicity or parse receiptData.date
                type: 'expense',
                category: 'Shopping',
                icon: 'receipt',
                color: '#EC4899'
            });

            Alert.alert("Success", "Receipt saved successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to save expense.");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>Scan Receipt</AppText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Image Preview Area */}
                <View style={[styles.imageContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Ionicons name="receipt-outline" size={64} color={theme.colors.textMuted} />
                            <AppText style={[styles.placeholderText, { color: theme.colors.textMuted }]}>
                                Upload a receipt to scan
                            </AppText>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                {!receiptData && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.card }]} onPress={handlePickImage}>
                            <Ionicons name="images-outline" size={24} color={theme.colors.primary} />
                            <AppText style={[styles.buttonText, { color: theme.colors.text }]}>Gallery</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.card }]} onPress={handleTakePhoto}>
                            <Ionicons name="camera-outline" size={24} color={theme.colors.primary} />
                            <AppText style={[styles.buttonText, { color: theme.colors.text }]}>Camera</AppText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Scan Button */}
                {imageUri && !receiptData && (
                    <TouchableOpacity
                        style={[styles.scanButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleScan}
                        disabled={isScanning}
                    >
                        {isScanning ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="scan-outline" size={24} color="#fff" />
                                <AppText style={styles.scanButtonText}>Analyze Receipt</AppText>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {/* Results Section */}
                {receiptData && (
                    <Animated.View entering={FadeInUp.duration(600).springify()} style={[styles.resultContainer, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.resultHeader}>
                            <AppText style={[styles.merchantName, { color: theme.colors.text }]}>{receiptData.merchantName}</AppText>
                            <AppText style={[styles.date, { color: theme.colors.textMuted }]}>{receiptData.date}</AppText>
                        </View>

                        <View style={styles.divider} />

                        {receiptData.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <AppText style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</AppText>
                                <AppText style={[styles.itemPrice, { color: theme.colors.text }]}>{formatCurrency(item.price)}</AppText>
                            </View>
                        ))}

                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <AppText style={[styles.totalLabel, { color: theme.colors.text }]}>Total</AppText>
                            <AppText style={[styles.totalAmount, { color: theme.colors.primary }]}>{formatCurrency(receiptData.totalAmount)}</AppText>
                        </View>

                        <View style={styles.resultActions}>
                            <TouchableOpacity
                                style={[styles.secondaryButton, { borderColor: theme.colors.danger }]}
                                onPress={() => setReceiptData(null)}
                            >
                                <AppText style={{ color: theme.colors.danger, fontWeight: '600' }}>Discard</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.primaryButton, { backgroundColor: theme.colors.success }]}
                                onPress={handleSave}
                            >
                                <AppText style={{ color: '#fff', fontWeight: 'bold' }}>Save Expense</AppText>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: spacing.lg,
    },
    imageContainer: {
        height: 300,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        alignItems: 'center',
        gap: 12,
    },
    placeholderText: {
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    buttonText: {
        fontWeight: '600',
    },
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 8,
        marginBottom: spacing.lg,
    },
    scanButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        borderRadius: 20,
        padding: 20,
    },
    resultHeader: {
        marginBottom: 12,
    },
    merchantName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 14,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    resultActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    secondaryButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    primaryButton: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
    },
});
