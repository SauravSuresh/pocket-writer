# Browser storage durability, export/import, static hosting
Type: research
Status: resolved
Blocked by: —

## Question

Facts needed before the build: how durable is IndexedDB / OPFS in current desktop Chrome, Safari, Firefox (eviction rules, "persistent storage" permission); simplest dependable IndexedDB wrapper; File System Access API viability for save-to-folder as an alternative to browser storage; zero-ops static hosting options for a single-page app the writer can hand a link to (GitHub Pages / Netlify / Cloudflare Pages) and whether any interfere with storage persistence.

## Answer

IndexedDB via `idb` + `navigator.storage.persist()` as the working copy; JSON export/import is the real durability guarantee (all browsers can evict best-effort data, Safari tabs purge script storage after 7 days of Safari use without a visit; Add-to-Dock exempts it). File System Access API is Chrome-only, so no save-to-folder. Host on Cloudflare Pages (`<app>.pages.dev`, wrangler/drag-and-drop) or GitHub Pages; all three hosts are on the Public Suffix List so no cross-user storage sharing, only your own `you.github.io/*` projects share an origin.

Findings: [research/07-storage-and-hosting.md](../research/07-storage-and-hosting.md)
