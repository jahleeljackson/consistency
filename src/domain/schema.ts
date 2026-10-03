import { z } from 'zod'
import { emptyState, EXPORT_FORMAT } from './state.ts'
import type { AppState, MissionDraft } from './types.ts'

export const missionDraftSchema = z.object({
  name: z.string().trim().min(1, 'Give this mission a name.').max(80, 'Keep the name under 80 characters.'),
  description: z.string().max(500, 'Keep the description under 500 characters.'),
  cadence: z.enum(['daily', 'weekly']),
  preferredTime: z
    .string()
    .refine((value) => value === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(value), 'Use a valid time.')
    .optional(),
  color: z.enum(['clay', 'sand', 'moss', 'slate', 'terracotta']),
})

const missionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  description: z.string().max(500),
  cadence: z.enum(['daily', 'weekly']),
  preferredTime: z.string().optional(),
  color: z.enum(['clay', 'sand', 'moss', 'slate', 'terracotta']),
  status: z.enum(['active', 'paused', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const completionSchema = z.object({
  id: z.string().min(1),
  missionId: z.string().min(1),
  completedAt: z.string(),
})

const tombstoneSchema = z.object({
  id: z.string().min(1),
  deletedAt: z.string(),
})

const settingsSchema = z.object({
  theme: z.enum(['light', 'evening']),
  reducedMotion: z.boolean(),
  updatedAt: z.string(),
})

export const appStateSchema = z.object({
  missions: z.array(missionSchema),
  completions: z.array(completionSchema),
  tombstones: z.array(tombstoneSchema).default([]),
  settings: settingsSchema,
  revision: z.number().int().nonnegative(),
})

export const exportPayloadSchema = z.object({
  format: z.literal(EXPORT_FORMAT),
  exportedAt: z.string(),
  state: appStateSchema,
})

export function parseMissionDraft(input: unknown): MissionDraft {
  const parsed = missionDraftSchema.parse(input)
  return {
    name: parsed.name,
    description: parsed.description,
    cadence: parsed.cadence,
    preferredTime: parsed.preferredTime || undefined,
    color: parsed.color,
  }
}

export function parseAppState(input: unknown): AppState {
  return appStateSchema.parse(input)
}

export function parseExportPayload(input: unknown): AppState {
  if (input && typeof input === 'object' && 'format' in input) {
    return exportPayloadSchema.parse(input).state
  }
  return appStateSchema.parse(input)
}

export function toExportPayload(state: AppState, now = new Date()) {
  return {
    format: EXPORT_FORMAT,
    exportedAt: now.toISOString(),
    state,
  }
}

export function safeParseAppState(input: unknown): AppState {
  const result = appStateSchema.safeParse(input)
  if (!result.success) {
    return emptyState()
  }
  return result.data
}
