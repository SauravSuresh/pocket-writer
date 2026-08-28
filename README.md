# Gagan Achari

Local-first screenplay feedback tool. Log what the room said, extract the issues underneath, work them root-first, export the action plan. No accounts, no server, no AI.

- `pnpm dev` — run locally
- `pnpm test` — domain tests
- `pnpm build` — static site in `dist/`

Deploy: `npx wrangler pages deploy dist --project-name gagan-achari` (Cloudflare Pages), or push `dist/` to a `gh-pages` branch. Your data lives in your browser; download a backup from Settings.

Design decisions: `.scratch/feedback-tool/` (map, tickets, spec). Glossary: `CONTEXT.md`.
