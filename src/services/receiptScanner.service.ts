import * as ImagePicker from 'expo-image-picker';

export interface ReceiptData {
    merchantName: string;
    date: string;
    totalAmount: number;
    items: { name: string; price: number }[];
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
            aspect: [4, 3],
            quality: 1,
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
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null;
    },

    /**
     * Analyze the receipt image to extract data (Mocked Vision API)
     */
    analyzeReceipt: async (imageUri: string): Promise<ReceiptData> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock response
        // In a real app, you would upload 'imageUri' to a server (e.g., Google Cloud Vision, AWS Textract)
        // and parse the response.
        return {
            merchantName: "Starbucks Coffee",
            date: new Date().toISOString().split('T')[0],
            totalAmount: 450.00,
            items: [
                { name: "Cappuccino", price: 250.00 },
                { name: "Croissant", price: 200.00 }
            ]
        };
    }
};
