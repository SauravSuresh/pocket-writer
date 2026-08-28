# Research: browser storage durability, export/import, static hosting

Ticket: `../issues/07-storage-and-hosting.md`. Researched 2026-08-28 against MDN, WebKit blog, Chrome developer docs, PSL, GitHub/Cloudflare/Netlify docs.

## Recommendation (read this, skip the rest if in a hurry)

1. **Store in IndexedDB via `idb`** (Jake Archibald's ~1.2 kB promise wrapper). Call `navigator.storage.persist()` once, after the user's first meaningful action (not on load). Treat browser storage as the *working copy*, never the only copy.
2. **Export/import JSON is the durability story.** Every browser can silently evict best-effort data; the user can clear site data; Safari deletes script storage after 7 days of Safari use without visiting the site. A "Download backup" button (`<a download>` of a JSON blob) plus a nag when the last export is stale is the only cross-browser guarantee. Do not build save-to-folder on the File System Access API: Chrome-only, and Safari/Firefox will never see it.
3. **Host on Cloudflare Pages** (`<project>.pages.dev`, `npx wrangler pages deploy dist/` or drag-and-drop a folder). GitHub Pages is equally fine if the code is already on GitHub. All three hosts are on the Public Suffix List, so `you.github.io/app`, `app.pages.dev`, `app.netlify.app` are each a private origin: no storage sharing with strangers' sites. Only caveat: two of *your own* projects on `you.github.io/a` and `you.github.io/b` share one origin (quota, eviction, and DB namespace), so namespace the IndexedDB name per app.
4. Tell the friend: open it in Chrome or Firefox, bookmark it, and export regularly. If they must use Safari, "Add to Dock" gives it isolated storage and exempts it from the 7-day ITP purge.

## 1. IndexedDB / OPFS durability

### Quotas (all three engines are generous; irrelevant for a text-only app)

- Chrome/Edge: an origin may use up to 60% of disk, best-effort and persistent alike. [MDN quotas]
- Firefox: best-effort is min(10% of disk, 10 GiB group limit per site); persistent origins get up to 50% of disk, cap 8 TiB, no group limit. [MDN quotas]
- Safari (macOS 14+ / iOS 17+): ~60% of disk per origin in browser apps, 80% overall cap across origins. [MDN quotas], [WebKit storage policy]

### Eviction

- All engines: under storage pressure, LRU by origin; the whole origin's data (IndexedDB, Cache, OPFS, localStorage) goes at once. Origins granted persistence are skipped. [MDN quotas]
- OPFS is "subject to browser storage quota restrictions, just like any other origin-partitioned storage mechanism (for example IndexedDB)". Clearing site data deletes OPFS. So OPFS is **not** more durable than IndexedDB; it is just a different API. [MDN OPFS]
- Safari extra rule: with "Prevent cross-site tracking" on (default), **script-written storage (IndexedDB, localStorage, sessionStorage, media keys, service worker registrations and cache) is deleted for any site that has had no user interaction in the last 7 days of Safari use.** Interaction = click/tap on the site. The counter is days *Safari was used*, not calendar days; a two-week holiday without opening Safari does not trip it. Server-set cookies are exempt. [WebKit ITP 2020], [MDN quotas]
  - Installed web apps: "Web applications added to the home screen are not part of Safari and thus have their own counter of days of use." Apple says deleting first-party data in a web app would be "a serious bug". [WebKit ITP 2020]. macOS Sonoma "Add to Dock" web apps likewise run outside Safari with separate storage ("Safari does not copy over any other kind of local storage. After a user adds a web app to the Dock, no other website data is shared") [WebKit Safari 17.0]. So: Safari-in-tab = 7-day rule applies to a site you stop visiting; Add-to-Dock = exempt.
  - "Frequently visited" is not a separate exemption; it is simply that each visit with a click resets the 7-day counter. A writer opening the app weekly is safe; one who leaves it for a month of Safari use is not.

### `navigator.storage.persist()`

- Semantics: resolves `true` if the bucket is now persistent; persistent data "will not be cleared except by explicit user action". Secure context (HTTPS) only. Baseline since Dec 2021 (Chrome 55, Firefox 55, Safari 15.2). [MDN persist]
- Chrome: never prompts. Auto-grants based on site engagement score, bookmarked, installed as PWA, or notification permission granted; otherwise denies silently, and you may re-request later. Persistence protects against *browser* eviction only, not the user clearing data. [web.dev persistent-storage]
- Firefox: shows a permission popup to the user. [MDN quotas]
- Safari: "grants a request based on heuristics like whether the website is opened as a Home Screen Web App"; no prompt. [WebKit storage policy]. In practice a plain Safari tab will usually get `false`. Note persistence exempts an origin from quota/LRU eviction; the docs do not say it exempts from the 7-day ITP deletion, so do not rely on it for that.

### Bottom line

Storage on any of the three is "durable until it isn't". Chrome with a bookmark plus `persist()` is the strongest; Firefox after the user accepts the prompt is equivalent; Safari tab is the weakest. Export is mandatory.

## 2. IndexedDB wrapper

- **`idb`** (v8, ~1.19 kB brotli): mirrors the IndexedDB API but with promises, `openDB(name, version, { upgrade })`, typed via TypeScript generics. No query layer, no magic. Actively maintained. [idb README]
- **Dexie**: schema-string declarations, `where().below()` query builder, `liveQuery` reactivity, versioned migrations. Much larger surface; useful when you have many tables and complex queries. [Dexie README]
- Raw IndexedDB: callback/event API with transaction auto-commit gotchas; not worth the boilerplate.

**Pick `idb`**: one line of reasoning: the data set is one writer's projects (hundreds of items, not millions), so the app will load a project into memory and write whole records back; a promise wrapper is all that's needed, and idb has nothing to learn or get wrong. Even simpler alternative worth considering: a single IndexedDB key holding the whole project JSON (idb's `get`/`set` helpers make this three lines), which makes export/import trivially the same serialization.

## 3. File System Access API (save-to-folder)

- `showDirectoryPicker()` / `showSaveFilePicker()`: **Chrome/Edge 86+ only**. Firefox (111+) and Safari (15.2+) implement only the origin-private file system half; neither exposes user-visible pickers. Brave behind a flag. [Chrome FSA guide], [MDN showDirectoryPicker]
- Handles are serializable into IndexedDB; on reload you must `queryPermission()`/`requestPermission()` again. Chrome 122+ offers "Allow on every visit" in tabs and auto-persists for installed PWAs. [Chrome persistent permissions]
- Verdict: **not viable as the primary store** for a URL handed to a friend whose browser you do not control. If wanted later as a Chrome-only nicety ("also mirror to this folder"), it is an additive feature, not a foundation. The `browser-fs-access` ponyfill falls back to `<input type=file>` / `<a download>`, which is exactly the plain export/import path anyway. [Chrome FSA guide]

## 4. Static hosting

| Host | URL | Deploy path | Notes |
|---|---|---|---|
| GitHub Pages | `https://<owner>.github.io/<repo>/` | push to a branch or Actions; free for public repos; 1 GB site, 100 GB/mo soft cap [GH Pages limits] | Needs the app to work under a subpath (`<base>`/relative asset paths). |
| Cloudflare Pages | `https://<project>.pages.dev` | `npx wrangler pages deploy dist/` or drag-and-drop folder/zip in dashboard (1,000 files, 25 MiB/file) [CF direct upload] | Root-path origin; direct-upload projects cannot later switch to git integration. |
| Netlify | `https://<site>.netlify.app` | drag folder onto app.netlify.com/drop, or `netlify deploy --prod` [Netlify deploys] | Root-path origin. |

### Do any interfere with storage?

- Browser storage is keyed by **origin** (scheme+host+port), never by path. Quotas and eviction "apply to an entire origin, even if this origin is used to run several websites, such as `https://example.com/site1/` and `https://example.com/site2/`". [MDN quotas]
- `github.io`, `pages.dev`, `netlify.app` are all entries in the Public Suffix List (lines 13790, 12730, 14820 as of today), so browsers treat `alice.github.io` and `bob.github.io` as unrelated sites; cookies and ITP "site" classification do not cross accounts. [PSL]
- Consequence: no host interferes with persistence. The one real footgun is GitHub Pages' *project* sites: everything under `you.github.io/*` is one origin, so a second app of yours on the same account shares quota, eviction fate, and the IndexedDB name space. Mitigation: unique DB name per app, or use a Cloudflare/Netlify subdomain per app.
- All three serve HTTPS by default, which satisfies the secure-context requirement for `persist()`, OPFS, and FSA.

## Sources

- [MDN quotas] https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- [MDN persist] https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- [MDN OPFS] https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system
- [MDN showDirectoryPicker] https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker
- [WebKit ITP 2020] https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- [WebKit storage policy] https://webkit.org/blog/14403/updates-to-storage-policy/
- [WebKit Safari 17.0] https://webkit.org/blog/15021/webkit-features-in-safari-17-0/
- [web.dev persistent-storage] https://web.dev/articles/persistent-storage
- [Chrome FSA guide] https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
- [Chrome persistent permissions] https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api
- [idb README] https://github.com/jakearchibald/idb
- [Dexie README] https://github.com/dexie/Dexie.js
- [GH Pages limits] https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- [CF direct upload] https://developers.cloudflare.com/pages/get-started/direct-upload/
- [Netlify deploys] https://docs.netlify.com/site-deploys/create-deploys/
- [PSL] https://publicsuffix.org/list/public_suffix_list.dat
