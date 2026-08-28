export type NeedsAction = "undecided" | "yes" | "no";
export type CascadeAnswer = "full" | "partial" | "no";
export type NudgeId = "N2" | "N3" | "N6";
export type Status = "Raw" | "Captured" | "Assessed" | "Planned";
export type Kind = "reaction" | "suggestion";

export interface Reference { url: string; label?: string }
export interface Skip { nudge: NudgeId; at: string }

export interface Issue {
  id: string; draftId: string; createdAt: string;
  title: string; description: string; thoughts: string; references: Reference[];
  tags: string[];
  causedBy: string[]; isRoot: boolean;
  needsAction: NeedsAction; canBeAddressed: string; whyDiverges: string;
  solution: string; reasonNotActing: string;
  coveredBy?: string; partialOf?: string;
  cascadeAnswers: Record<string, CascadeAnswer>;
  skips: Skip[];
  ancestorId?: string; pinnedNote?: string;
  ideaIds: string[];
  adoptedSuggestions: { itemId: string; giverId: string }[];
}
export interface FeedbackItem { id: string; sessionId: string; draftId: string; giverId: string; kind: Kind; text: string; issueIds: string[] }
export interface Session { id: string; draftId: string; date: string; giverIds: string[] }
export interface Giver { id: string; name: string }
export interface Idea { id: string; text: string; issueIds: string[]; usedInDraft?: number }
export interface EndTurnSummary { grade: Grade; planned: number; total: number; bossesCleared: number; roots: number; skipped: string[]; unplanned: string[]; walkedOut: string[]; rankChanges: { giverId: string; from: number; to: number }[]; at: string }
export type Grade = "S" | "A" | "B" | "C";
export interface Draft { id: string; number: number; frozen: boolean; createdAt: string; summary?: EndTurnSummary; exportStale?: boolean; dismissedN4: string[] }
export interface Project {
  id: string; name: string; isSample: boolean; createdAt: string;
  tagWeights: Record<string, number>;
  givers: Giver[]; drafts: Draft[]; sessions: Session[]; items: FeedbackItem[]; issues: Issue[]; ideas: Idea[];
  lastRank: Record<string, number>;
}
export interface Settings { sound: boolean; lastBackupAt?: string; seenHowItWorks: boolean; tourDone: boolean }
export interface Account { schemaVersion: 1; projects: Project[]; settings: Settings }

export const TAGS = ["Theme","Tone","Character","Arc","Structure","Exposition","Logic","Scene","Dialogue"] as const;
export const SUBTAGS = ["Character/Dynamics","Logic/Emotional","Logic/Physical","Arc/Relationship"] as const;
export const DEFAULT_TAG_WEIGHTS: Record<string, number> = { Theme: 9, Tone: 8, Character: 7, Arc: 6, Structure: 5, Exposition: 4, Logic: 3, Scene: 2, Dialogue: 1 };
export const RANKS = ["Walked out","Unconvinced","Watching","Nodding","Loves it"] as const;

export const weightOf = (tag: string, weights: Record<string, number>): number => weights[tag.split("/")[0]] ?? 0;
export const newId = (): string => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const now = (): string => new Date().toISOString();

export function emptyIssue(draftId: string, title = ""): Issue {
  return { id: newId(), draftId, createdAt: now(), title, description: "", thoughts: "", references: [], tags: [], causedBy: [], isRoot: false,
    needsAction: "undecided", canBeAddressed: "", whyDiverges: "", solution: "", reasonNotActing: "", cascadeAnswers: {}, skips: [], ideaIds: [], adoptedSuggestions: [] };
}
export function emptyAccount(): Account { return { schemaVersion: 1, projects: [], settings: { sound: true, seenHowItWorks: false, tourDone: false } }; }
