import { z } from 'zod';

// --- Transaction Schema ---
export const TransactionSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    amount: z.number().positive("Amount must be positive"),
    date: z.string().datetime({ message: "Invalid date format" }),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1, "Category is required"),
    icon: z.string().optional(),
    color: z.string().optional(),
});

// --- Budget Schema ---
export const BudgetCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    allocated: z.number().nonnegative("Budget cannot be negative"),
    icon: z.string().optional(),
    iconType: z.enum(['Ionicons', 'MaterialCommunityIcons']).optional(),
    color: z.string().optional(),
});

// --- Goal Schema ---
export const GoalSchema = z.object({
    title: z.string().min(1, "Title is required"),
    target_amount: z.number().positive("Target amount must be positive"),
    deadline: z.string().datetime({ message: "Invalid date format" }),
});

// --- EMI Schema ---
export const EMISchema = z.object({
    name: z.string().min(1, "Name is required"),
    total_amount: z.number().positive("Total amount must be positive"),
    monthly_amount: z.number().positive("Monthly amount must be positive"),
    due_date: z.number().min(1).max(31, "Due date must be between 1 and 31"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
});

// --- Reminder Schema ---
export const ReminderSchema = z.object({
    title: z.string().min(1, "Title is required"),
    amount: z.number().positive("Amount must be positive"),
    date: z.string().datetime({ message: "Invalid date format" }),
    status: z.enum(['Upcoming', 'Overdue', 'Paid']).optional(),
});

// --- Kuri Schema ---
export const KuriSchema = z.object({
    title: z.string().min(1, "Title is required"),
    totalMonths: z.number().int().positive(),
    installmentAmount: z.number().positive(),
    startDate: z.string().datetime().optional(),
});
