import { useState } from "preact/hooks";
import { FeedbackItem, Project, TAGS, SUBTAGS } from "../domain/types";
import { store } from "./store";
import { COPY } from "./copy";
import { createDeeperIssue, createIssue, linkItem, setCausedBy, setRoot, touch } from "../domain/account";
import { skip, deeperCausePicker } from "../domain/nudges";
import { severity } from "../domain/issue";
import { similarTitles, reviveIssues, previousDraft } from "../domain/revive";

export function ExtractDrawer({ p, draftId, item, onClose }: { p: Project; draftId: string; item?: FeedbackItem; onClose: () => void }) {
  const giver = item ? p.givers.find(g => g.id === item.giverId)?.name ?? "them" : null;
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [tags, setTags] = useState<string[]>([]);
  const [n2, setN2] = useState<"" | "cause" | "root" | "later">(""); const [cause, setCause] = useState(""); const [newCause, setNewCause] = useState("");
  const [ancestor, setAncestor] = useState<string | null>(null);
  const similar = title.length > 3 ? similarTitles(p, draftId, title) : [];
  const picker = deeperCausePicker(p, draftId, "__new__");
  const toggle = (t: string) => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
  const save = () => {
    if (!title.trim()) return alert("Title first.");
    if (n2 === "root" && tags.length && severity({ tags } as any, p.tagWeights) <= 3 && !confirm(COPY.n3(tags.join("/")) + "\n\nOK = keep as root · Cancel = go back")) return;
    store.update(() => {
      let iss;
      if (ancestor) { iss = reviveIssues(p, previousDraft(p, draftId)!.id, draftId, [ancestor])[0]; iss.title = title.trim(); if (item) linkItem(p, item.id, iss.id); }
      else iss = createIssue(p, draftId, title, item?.id);
      iss.description = desc; iss.tags = tags;
      if (n2 === "cause" && cause === "new") { if (newCause.trim()) createDeeperIssue(p, draftId, newCause, [iss.id]); }
      else if (n2 === "cause" && cause) setCausedBy(p, iss.id, [cause]);
      else if (n2 === "root") setRoot(p, iss.id);
      else if (n2 === "later") skip(iss, "N2");
      touch(p, iss);
    });
    onClose();
  };
  return <div class="drawer">
    {item ? <div class="quote">{giver}: “{item.text}”</div> : <div class="mut" style="margin-bottom:8px">Issue with no feedback item — your own observation.</div>}
    <input placeholder="Issue title — the thing in the screenplay (e.g. “Anto has no agency”)" value={title} onInput={e => { setTitle((e.target as HTMLInputElement).value); setAncestor(null); }} />
    {similar.length > 0 && !ancestor && <div class="n2" style="margin-top:6px">Draft {previousDraft(p, draftId)!.number} had: {similar.map(s => <button class="sm" onClick={() => { setAncestor(s.id); setTitle(s.title); setDesc(s.description); setTags(s.tags); }}>{s.title}</button>)} — same thing?</div>}
    {ancestor && <div class="pinned">Reviving from the previous draft.</div>}
    <textarea style="margin-top:8px" placeholder={giver ? COPY.placeholder.descriptionFor(giver) : COPY.placeholder.descriptionFree} value={desc}
      onInput={e => { const v = (e.target as HTMLTextAreaElement).value; setDesc(v); if (v.length > 20 && !n2) setN2("cause" as any); }} />
    <div class="row" style="margin-top:8px;flex-wrap:wrap">{[...TAGS, ...SUBTAGS].map(t => <label class="tag"><input type="checkbox" style="width:auto" checked={tags.includes(t)} onChange={() => toggle(t)} /> {t}</label>)}</div>
    {(n2 || desc.length > 20) && <div class="n2"><h4>{COPY.n2.title}</h4>
      <label><input type="radio" name="n2" checked={n2 === "cause"} onChange={() => setN2("cause")} /> {COPY.n2.cause}
        <select style="width:auto;display:inline-block;margin-left:6px" value={cause} onChange={e => { setCause((e.target as HTMLSelectElement).value); setN2("cause"); }}>
          <option value="">pick…</option>{picker.map(i => <option value={i.id}>{i.isRoot ? "★ " : ""}{i.title} ({severity(i, p.tagWeights)})</option>)}<option value="new">{COPY.n2.newDeeper}</option>
        </select></label>
      {cause === "new" && <input placeholder="Title of the deeper issue (created Raw, linked)" value={newCause} onInput={e => setNewCause((e.target as HTMLInputElement).value)} style="margin:4px 0 4px 22px;width:calc(100% - 22px)" />}
      <label><input type="radio" name="n2" checked={n2 === "root"} onChange={() => setN2("root")} /> {COPY.n2.root}</label>
      <label><input type="radio" name="n2" checked={n2 === "later"} onChange={() => setN2("later")} /> {COPY.n2.later} <span class="mut">{COPY.n2.laterNote}</span></label>
    </div>}
    <div class="row" style="margin-top:10px;justify-content:flex-end"><button onClick={onClose}>Cancel</button><button class="pri" onClick={save}>Save issue</button></div>
  </div>;
}
