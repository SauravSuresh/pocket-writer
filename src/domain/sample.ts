import { Account, Project } from "./types";
import * as A from "./account";
import { answerCascade } from "./cascade";

export function installSample(acc: Account): Project {
  const existing = acc.projects.find(p => p.isSample); if (existing) return existing;
  const p = A.createProject(acc, "Smoke Love Repeat", true);
  const d = A.startDraft(p);
  const [dev, appu, meera] = ["Dev", "Appu", "Meera"].map(n => A.addGiver(p, n));
  const s = A.createSession(p, d.id, "2026-08-01", [dev.id, appu.id, meera.id]);

  // Bosses
  const bossTone = A.createIssue(p, d.id, "Nobody knows if the film is a comedy");
  Object.assign(bossTone, { description: "Akhil's lighter jokes sit next to Rithu's funeral. The script never picks a lane.", tags: ["Tone", "Theme"], isRoot: true, needsAction: "yes", canBeAddressed: "Yes — decide what we laugh at.", solution: "We laugh at how seriously Akhil takes smoking. Everything else is played straight." });
  const bossWant = A.createIssue(p, d.id, "Rithu doesn't want anything");
  Object.assign(bossWant, { description: "Rithu reacts to Akhil for 90 pages. She never chooses.", tags: ["Character", "Arc"], isRoot: true, needsAction: "yes", canBeAddressed: "Yes — give her one impossible want." });

  // Minions
  const m1 = A.createIssue(p, d.id, "The cigarette-as-metaphor scene lands as a gag");
  Object.assign(m1, { description: "Audience laughs when Akhil cries over the last cigarette; it's meant to be the turn.", tags: ["Scene"], causedBy: [bossTone.id], needsAction: "yes", canBeAddressed: "Yes." });
  const m2 = A.createIssue(p, d.id, "The funeral is too long");
  Object.assign(m2, { description: "Four pages of eulogy with no jokes and no reversal.", tags: ["Structure", "Scene"], causedBy: [bossTone.id], needsAction: "yes", canBeAddressed: "Cut two pages." });
  const m3 = A.createIssue(p, d.id, "Why does Rithu keep coming back to the balcony");
  Object.assign(m3, { description: "The balcony is where Akhil smokes; she has no stated reason to be there.", tags: ["Logic"], causedBy: [bossWant.id], needsAction: "yes", canBeAddressed: "Yes once she wants something there." });
  const m4 = A.createIssue(p, d.id, "The breakup feels unearned");
  Object.assign(m4, { description: "They split over a lighter. We haven't seen what the lighter means to her.", tags: ["Arc", "Logic/Emotional"], causedBy: [bossWant.id], needsAction: "yes", canBeAddressed: "Yes." });
  const m5 = A.createIssue(p, d.id, "The ending (they die) reads as a shrug");
  Object.assign(m5, { description: "Both die in the fire; nobody chose anything, so it's weather, not fate.", tags: ["Structure", "Theme"], causedBy: [bossWant.id, bossTone.id], needsAction: "yes", canBeAddressed: "Yes — make one of them light the match." });
  const m6 = A.createIssue(p, d.id, "Dialogue in the tea shop is generic");
  Object.assign(m6, { description: "Lines could be any two people in any tea shop.", tags: ["Dialogue"], causedBy: [bossTone.id], needsAction: "no", canBeAddressed: "Yes.", solution: "Give Akhil a smoking-specific idiom in every line.", reasonNotActing: "Comes free once tone is fixed.", whyDiverges: "Over-flavoured dialogue makes the film cute." });

  // Feedback items (reaction vs suggestion by example)
  const add = (g: { id: string }, kind: "reaction" | "suggestion", text: string, ...iss: { id: string }[]) => { const it = A.addItem(p, s.id, g.id, kind, text); for (const i of iss) A.linkItem(p, it.id, i.id); return it; };
  add(dev, "reaction", "I laughed at the wrong bits.", bossTone, m1);
  add(dev, "reaction", "The funeral is where I checked my phone.", m2);
  add(dev, "suggestion", "Make Akhil narrate his own funeral.", bossTone);
  add(appu, "reaction", "Rithu is just… there?", bossWant);
  add(appu, "reaction", "Why is she on the balcony again", m3);
  add(appu, "reaction", "They break up over a lighter??", m4);
  // Controller ruling: the two m5 items go to Appu (not Meera) so ranks land on three distinct values.
  add(appu, "reaction", "The fire at the end felt like the writer gave up.", m5);
  add(appu, "suggestion", "One of them should start the fire.", m5);
  add(meera, "reaction", "Tea shop scene — any two people could say those lines.", m6);
  add(meera, "reaction", "I don't know what this film is.");   // deliberately unaccounted

  // Boss 1 planned + cascade partly answered → Dev is well along; Appu untouched; Meera capped by the unaccounted item.
  answerCascade(p.issues, bossTone.id, m1.id, "full");
  answerCascade(p.issues, bossTone.id, m2.id, "no");
  A.addIdea(p, "The lighter is Rithu's father's. Nobody has said so yet.", m4.id);
  acc.settings.tourDone = false;
  return p;
}
