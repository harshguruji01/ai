import { z } from 'zod';

export const chatMessageRoleSchema = z.enum(['user', 'assistant', 'system']);

export const chatHistoryItemSchema = z.object({
  role: chatMessageRoleSchema,
  content: z.string().max(8000),
});

export const chatRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(4000, 'Prompt exceeds maximum character length of 4000')
    .trim(),
  conversationId: z.string().uuid().nullable().optional(),
  messages: z.array(chatHistoryItemSchema).max(30).optional().default([]),
  fingerprint: z.string().max(100).nullable().optional(),
  isImageMode: z.boolean().optional().default(false),
  language: z.enum(['english', 'hinglish', 'hindi']).optional().default('english'),
  model: z.string().max(50).optional().default('guru-flash-1.1'),
});

export const imageGenerateSchema = z.object({
  prompt: z
    .string()
    .min(3, 'Image prompt must be at least 3 characters')
    .max(1000, 'Image prompt exceeds maximum character limit of 1000')
    .trim(),
  conversationId: z.string().uuid().nullable().optional(),
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'cyberpunk']),
  font_size: z.enum(['small', 'medium', 'large']),
  font_family: z.enum(['sans', 'serif', 'mono']),
  ai_language: z.enum(['english', 'hinglish', 'hindi']),
});

export const conversationCreateSchema = z.object({
  title: z.string().min(1).max(100).optional().default('New Conversation'),
});

export const conversationUpdateSchema = z.object({
  title: z.string().min(1).max(100).trim(),
});
