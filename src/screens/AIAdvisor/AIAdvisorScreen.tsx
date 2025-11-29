import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const AIAdvisorScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your personal AI Financial Advisor. I can analyze your spending, suggest budgets, or give investment tips. How can I help you today?",
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const suggestedPrompts = [
        "Analyze my spending this month",
        "How can I save ₹5000 more?",
        "Am I overspending on Food?",
        "Investment tips for beginners"
    ];

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        // Simulate AI response (Replace this with actual Gemini API call later)
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateMockResponse(text),
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };

    const generateMockResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('spend') || lowerQuery.includes('analysis')) {
            return "Based on your recent transactions, you've spent ₹26,350 this month. Your highest category is Food & Dining (25%). You might want to cook at home more often to save!";
        } else if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
            return "To save ₹5000 more, try cutting down on 'Entertainment' subscriptions (currently ₹799/mo) and limit your 'Shopping' expenses. I noticed you spent ₹3200 on headphones recently.";
        } else if (lowerQuery.includes('invest')) {
            return "Since you have a surplus of ₹8000 in your Kuri balance, consider starting a SIP in a Nifty 50 Index Fund for stable long-term growth.";
        } else {
            return "That's an interesting financial question! Could you provide more details so I can give you a personalized recommendation based on your transaction history?";
        }
    };

    useEffect(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.aiBubble,
                {
                    backgroundColor: isUser ? theme.colors.primary : (theme.mode === 'dark' ? '#333' : '#E0E7FF'),
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                }
            ]}>
                {!isUser && (
                    <View style={styles.botIcon}>
                        <MaterialCommunityIcons name="robot-happy-outline" size={16} color={theme.colors.primary} />
                    </View>
                )}
                <Text style={[
                    styles.messageText,
                    { color: isUser ? '#fff' : theme.colors.text }
                ]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>AI Financial Advisor</Text>
                    <View style={styles.onlineBadge}>
                        <View style={styles.greenDot} />
                        <Text style={styles.onlineText}>Online</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Chat Area */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Suggested Prompts (Only show if few messages) */}
            {messages.length < 3 && (
                <View style={styles.promptsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
                        {suggestedPrompts.map((prompt, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.promptChip, { borderColor: theme.colors.border, backgroundColor: theme.mode === 'dark' ? '#222' : '#fff' }]}
                                onPress={() => sendMessage(prompt)}
                            >
                                <Text style={[styles.promptText, { color: theme.colors.text }]}>{prompt}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.mode === 'dark' ? '#222' : '#F3F4F6',
                            color: theme.colors.text
                        }]}
                        placeholder="Ask about your finances..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: inputText.trim() ? theme.colors.primary : '#ccc' }]}
                        onPress={() => sendMessage(inputText)}
                        disabled={!inputText.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    greenDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 4,
    },
    onlineText: {
        fontSize: 10,
        color: '#10B981',
        fontWeight: '500',
    },
    chatContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    botIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    promptsContainer: {
        paddingVertical: 12,
    },
    promptsScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    promptChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    promptText: {
        fontSize: 13,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        marginRight: 12,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AIAdvisorScreen;
