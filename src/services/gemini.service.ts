import { ReceiptData } from './receiptScanner.service';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const GeminiService = {
    analyzeReceipt: async (base64Image: string): Promise<ReceiptData> => {
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API Key is missing. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
        }

        const prompt = `
            Analyze this receipt image and extract the following information in strict JSON format:
            - merchantName: string
            - date: string (YYYY-MM-DD format)
            - totalAmount: number
            - items: array of objects with { name: string, price: number }
            
            If any field is missing, make a best guess or return null/empty.
            Do not include markdown formatting (like \`\`\`json). Just return the raw JSON object.
        `;

        const body = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image
                        }
                    }
                ]
            }]
        };

        try {
            const response = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Gemini API Error:', data);
                throw new Error(data.error?.message || 'Failed to analyze receipt with Gemini');
            }

            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) throw new Error('No response from Gemini');

            // Clean up potential markdown formatting
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            const parsedData = JSON.parse(cleanJson);

            return {
                merchantName: parsedData.merchantName || "Unknown Merchant",
                date: parsedData.date || new Date().toISOString().split('T')[0],
                totalAmount: parsedData.totalAmount || 0,
                items: parsedData.items || [],
                image_url: undefined // Will be handled by the caller if needed
            };

        } catch (error) {
            console.error('Gemini Analysis Error:', error);
            throw error;
        }
    }
};
