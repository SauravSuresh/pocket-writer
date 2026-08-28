import { RANKS } from "../domain/types";
export const FACES = ["🚪","😤","👀","🙂","😍"] as const;
export const MOODS: Record<number, string[]> = {
  0: ["left. seat's still warm.", "gone. popcorn abandoned."],
  1: ["arms crossed.", "'this is the same film.'", "checking phone."],
  2: ["hm.", "leaning forward slightly.", "'okay… go on.'"],
  3: ["nodding. slowly.", "'oh that's nice.'", "stopped checking phone."],
  4: ["'I TOLD you it would work.'", "already casting it.", "crying (good)."],
};
export const mood = (rank: number, seed: number) => MOODS[rank][seed % MOODS[rank].length];
export const rankName = (r: number) => RANKS[r];
export const COPY = {
  app: "Pocket Writer",
  missing: { description: "What in the screenplay causes this? Write it.", tags: "Tag it.", cause: "Root or symptom? Decide.", needsAction: "Fixing it or not? Decide.", canBeAddressed: "Can it even be fixed? One line.", solution: "Unarmed. Write a plan.", reasonNotActing: "You're not fixing it. Say why.", whyDiverges: "Imagine you did fix it. What does the film lose?" } as Record<string, string>,
  placeholder: { descriptionFor: (g: string) => `What in the screenplay makes ${g} say this?`, descriptionFree: "What in the screenplay is the problem?", solution: "What will you change in the next draft?", wouldSolution: "What would you do if you did fix it?", whyDiverges: "Imagine you did fix it. What does the film lose?" },
  n2: { title: "Could this be a symptom of something deeper?", cause: "Yes — caused by", newDeeper: "+ new deeper issue…", root: "No — this is a root", later: "Decide later", laterNote: "(counts as a skipped nudge)" },
  n3: (tag: string) => `A ${tag} issue as a root cause? Sure nothing's underneath?`,
  n4: (name: string, n: number) => `${name} has ${n} separate root issues. Are they one problem?`,
  n6: (n: number) => `You're leaving a root cause alone; its ${n} symptom${n === 1 ? "" : "s"} will stay.`,
  encounter: { boss: "⚔️ BOSS FIGHT", minion: "👾 ENCOUNTER", minionsBehind: (n: number) => `${n} minion${n === 1 ? "" : "s"} behind it`, swing: "⚔️ Swing at the boss", handle: "Handle it", next: "Who's next? →", upNext: (t: string) => `Up next: ${t}`, nothingLeft: "Nothing left standing. End the turn.", endTurn: "🏁 End turn" },
  cascade: { title: "Does that swing also knock out this one?", no: "Nope, still standing", partial: "Winged it", full: "💥 Down — mark covered", progress: (a: number, n: number) => `Cascade · ${a} of ${n} answered` },
  bossDown: { tag: "💥 BOSS DOWN", fell: (names: string[]) => `Took these down with it: ${names.join(" · ")}`, none: "Minions survived. Rude. They stay in the order.", cont: "click to continue" },
  rankUp: { tag: "INTEREST RISING", line: (name: string, rank: string) => `${name} is now ${rank}` },
  inbox: { newIssue: "＋ New issue", newIssueFrom: (g: string) => `＋ New issue from what ${g} said`, newFree: "＋ Issue without feedback", link: "…or link an existing issue", unaccounted: "unaccounted", selectHint: "Or select an item on the left to extract an issue from it / link it to an existing one." },
  badges: { cameBack: "Came back", stillBothers: "Still bothers them" },
  summary: { title: (n: number) => `Draft ${n} — turn over`, backup: "Download backup", nextDraft: "Start next draft", reopen: "Reopen draft" },
  draftHome: { room: "The room", noSessions: "No sessions yet. Add one when the room has spoken." },
  nag: "It's been a week since your last backup. Browser storage is not a vault.",
};
