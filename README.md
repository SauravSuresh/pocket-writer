# Pocket Writer

A tool for writers turning feedback into a plan for the next draft. Log what
people said about your screenplay, figure out what in the script actually
caused each reaction, and get an action plan for your next rewrite.

No account, no sign-up, no installing anything, no data sent anywhere. It
runs entirely in your browser and remembers your work there.

## Just use it

**[Open Pocket Writer](https://sauravsuresh.github.io/pocket-writer/)**

That link *is* the app — nothing to download or install. Click it, and
you're in. It works on a laptop or desktop browser (Chrome, Safari, Firefox,
Edge); it's not built for phones.

A few things worth knowing before you start:

- **Bookmark the link.** Your work is saved automatically as you type, but
  it's saved *in that browser, on that computer* — not in the cloud. If you
  open the link on a different computer or a different browser, you'll see
  a blank slate, not your project.
- **Back up your work.** Because everything lives in the browser, clearing
  your browser data (or a browser update gone wrong) can wipe it. Go to
  **Settings → Download backup** every so often — it saves one small file
  you can restore from later if anything goes wrong. There's a **Restore…**
  button right next to it for exactly that.
- **It comes with a sample project** ("Smoke Love Repeat") already loaded,
  and a short guided tour starts automatically the first time. You can
  replay it anytime with the **Tour** button at the top of any page.
- **"How this works"** (top of the page) explains the workflow in plain
  language if the tour goes by too fast.

## For developers

Local-first, no backend: Preact + TypeScript, Vitest for the domain logic,
static build with Vite. Every push to `main` rebuilds and redeploys the
GitHub Pages link above (see `.github/workflows/deploy.yml`).

```
pnpm install
pnpm dev      # run locally
pnpm test     # domain tests
pnpm build    # static site in dist/
```

Design decisions: `.scratch/feedback-tool/` (map, tickets, spec). Glossary:
`CONTEXT.md`.
