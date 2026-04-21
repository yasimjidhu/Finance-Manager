import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { GeminiService } from './gemini.service';

export interface ReceiptData {
    merchantName: string;
    date: string;
    totalAmount: number;
    items: { name: string; price: number }[];
    image_url?: string;
}

export const ReceiptScannerService = {
    /**
     * Request permissions for camera and media library
     */
    requestPermissions: async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return cameraStatus === 'granted' && libraryStatus === 'granted';
    },

    /**
     * Pick an image from the gallery
     */
    pickImage: async (): Promise<string | null> => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null;
    },

    /**
     * Take a photo using the camera
     */
    takePhoto: async (): Promise<string | null> => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null;
    },

    /**
     * Upload receipt image to Supabase Storage
     */
    uploadReceipt: async (imageUri: string): Promise<string | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Read file as base64 if not already available (though ImagePicker can provide it)
            // For robustness, let's read it again to be sure
            const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });

            const fileName = `${user.id}/${Date.now()}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, decode(base64), {
                    contentType: 'image/jpeg'
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('receipts')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading receipt:', error);
            return null;
        }
    },

    /**
     * Analyze the receipt image to extract data using Gemini API
     */
    analyzeReceipt: async (imageUri: string): Promise<ReceiptData> => {
        try {
            // 1. Read image as Base64
            const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });

            // 2. Analyze with Gemini
            const receiptData = await GeminiService.analyzeReceipt(base64);

            // 3. Upload image to Supabase (background process, don't await blocking)
            ReceiptScannerService.uploadReceipt(imageUri).then(url => {
                if (url) {
                    console.log('Receipt uploaded to:', url);
                }
            });

            return {
                ...receiptData,
                image_url: imageUri // Temporarily use local URI, or wait for upload if needed
            };
        } catch (error: any) {
            console.error('Receipt Analysis Failed:', error);

            // Fallback for demo/testing if API key is missing or fails
            if (error.message?.includes('API Key is missing')) {
                throw new Error('Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file to use real OCR.');
            }

            throw new Error('Failed to analyze receipt. Please try again.');
        }
    }
};
