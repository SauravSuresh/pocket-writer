import type { ComponentChildren } from "preact";
import { COPY } from "./copy";
import { go } from "./router";
import { store } from "./store";
export function Header({ title, right }: { title?: string; right?: ComponentChildren }) {
  return <header>
    <h1 style="cursor:pointer" onClick={() => go("/")}>{COPY.app}</h1>
    {title && <span class="mut">· {title}</span>}
    <span style="margin-left:auto;display:flex;gap:10px">
      {right}
      <button class="sm" onClick={() => { store.update(a => { a.settings.tourDone = false; }); go("/"); }}>Tour</button>
      <button class="sm" onClick={() => go("/how")}>How this works</button>
      <button class="sm" onClick={() => go("/settings")}>Settings</button>
    </span>
  </header>;
}
