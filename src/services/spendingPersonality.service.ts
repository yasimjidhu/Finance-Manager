export type PersonalityType = 'Saver' | 'Planner' | 'Impulse' | 'Lifestyle' | 'Balanced';

export interface PersonalityProfile {
    type: PersonalityType;
    icon: string;
    title: string;
    description: string;
    color: string;
    traits: string[];
}

export const PERSONALITY_TYPES: Record<PersonalityType, PersonalityProfile> = {
    Saver: {
        type: 'Saver',
        icon: '🐢',
        title: 'The Saver',
        description: 'You rarely spend and prioritize accumulating wealth. You feel safe when your savings grow.',
        color: '#22C55E', // Green
        traits: ['High Savings Rate', 'Low Discretionary Spending', 'Risk Averse']
    },
    Planner: {
        type: 'Planner',
        icon: '🎯',
        title: 'The Planner',
        description: 'You spend intentionally based on goals. Every rupee has a purpose in your budget.',
        color: '#3B82F6', // Blue
        traits: ['Goal Oriented', 'Budget Adherence', 'Strategic Spending']
    },
    Impulse: {
        type: 'Impulse',
        icon: '🌪️',
        title: 'Impulse Spender',
        description: 'You tend to buy emotionally. Sales and discounts are your weakness.',
        color: '#EF4444', // Red
        traits: ['Emotional Spending', 'Frequent Small Purchases', 'Difficulty Saving']
    },
    Lifestyle: {
        type: 'Lifestyle',
        icon: '💎',
        title: 'Lifestyle Spender',
        description: 'You prioritize experiences and quality. Your wants often compete with your needs.',
        color: '#A855F7', // Purple
        traits: ['High Quality Focus', 'Experience Driven', 'Trend Conscious']
    },
    Balanced: {
        type: 'Balanced',
        icon: '⚖️',
        title: 'The Balanced',
        description: 'You maintain a healthy equilibrium between saving for tomorrow and enjoying today.',
        color: '#F59E0B', // Amber
        traits: ['Controlled Spending', 'Steady Savings', 'Flexible Budgeting']
    }
};

export const SpendingPersonalityService = {
    /**
     * Calculates the user's spending personality based on transaction history.
     * (Mock implementation for now)
     */
    getPersonality: async (): Promise<PersonalityProfile> => {
        // In a real app, we would analyze:
        // 1. Savings Rate (Income - Expenses) / Income
        // 2. Discretionary vs Mandatory spending ratio
        // 3. Frequency of unbudgeted transactions

        return new Promise((resolve) => {
            setTimeout(() => {
                // Mocking a "Planner" personality for this demo
                resolve(PERSONALITY_TYPES.Planner);
            }, 800);
        });
    }
};
