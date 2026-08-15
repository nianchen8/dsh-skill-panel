# dsh-skill-panel

A skill management panel for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web app: browse, search, filter, enable/disable, and uninstall your agent skills from the settings page or the sidebar.

Built entirely on the harness's public plugin surface — a Typert Remote service on the host half, slot-registered React UI on the browser half. No forks, no internal APIs, no build step (pure JS, zero dependencies).

## Features

- Skill list with name, description, source label, and per-source counts
- Search and source filtering (user `.agents`, user `.dsh`, project roots, custom, bundled)
- **Model** / **User** invocation switches (rewrites the SKILL.md frontmatter; unspecified switches are preserved)
- **Disable / Enable** button — fully disables a skill while remembering its previous state, and restores exactly that state on enable
- **Uninstall** with two-step confirm (deletes the skill directory, bundled skills are protected)
- Detail view with `whenToUse`, on-disk path, and the SKILL.md body
- All reads are session-scoped — the panel shows exactly the catalog your current session serves
- Writes invalidate discovery synchronously, and the slash-menu cache is refreshed through the official forwarded events

## Requirements

- DeepSeek Harness `0.1.0-rc.6+` (web profile)
- pnpm available (`corepack enable` provides it)

## Install

```sh
corepack enable                                   # once per machine
dsh plugin --profile web add dsh-skill-panel     # from npm
# or: dsh plugin --profile web add github:nianchen8/dsh-skill-panel
dsh web                                           # restart to load the package
```

The panel then appears under **Settings → Skills** and the sidebar's **Skills** button.

## How it works

```
SKILL.md files (project / user / bundled roots)
        │  discovery (skill-filesystem providers, layered per scope)
        ▼
host skill registry  ── snapshot({cwd, scope: agent}) ──► SkillPanelService (Typert Remote)
        ▲                                                       │  /api/skillPanel/*
        │  fs/observed invalidation                             ▼
        └── frontmatter writes / deletions               browser client (fetch RPC)
                                                                 │  slots.register
                                                                 ▼
                                              Settings page · sidebar button · overlay
```

- **Host half** (`index.js`): a `TypertRemoteService` with six Remote endpoints — `getConfig`, `listDetailed`, `getDetail`, `setInvocation`, `setDisabled`, `uninstall`. Reads resolve the session-scoped skill view (same catalog the model sees); writes rewrite SKILL.md frontmatter or delete the skill directory, then emit `fs/observed` for synchronous discovery invalidation and replay `agent-preset/selected` so the official slash menu drops its cached catalog.
- **Browser half** (`client.js`): plain React via the platform module table, registered into `sidebar.footer.action`, `shell.overlay`, and `settings.section`. All data crosses the standard API gateway over `/api/skillPanel/<method>`.

## Placement configuration

The three UI entries (sidebar button, overlay, settings page) default to the **tail** of their slot: at registration the browser half reads the slot's live entries and places itself after the largest existing `order`, so a fresh deployment always lands at the bottom of the list regardless of how many entries already occupy the slot.

**Arrival semantics (why same-strategy plugins don't fight):** the tail order is computed **once at registration** — the browser half never re-registers after it arrives. Each registration is an atomic read→compute→register, so the next arrival always sees the previous one and appends strictly after it (`max + 1`, no ties). Once an entry lands, its position is fixed; if it later unloads and comes back (fiber restart), it re-appends at the tail again. Two plugins using this identical strategy therefore coexist as A(0), B(1), C(2), … with the latest arrival always last — no chasing, no livelock.

Each entry can be individually overridden through the loader entry's `config` in the profile composition (`profiles/<name>/cordis.patch.yml`):

```yaml
- id: skill-panel
  config:
    entries:
      sidebar:
        enabled: true        # show the sidebar button (default true)
        order: 5             # explicit position; omit = dynamic tail
        # slot: conversation.session.header.actions   # optional relocation
      overlay:
        enabled: true
        order: 10
      settings:
        enabled: false       # hide the settings page
```

- `enabled` — whether the entry registers at all.
- `order` — exact ascending position in the slot; **absent means dynamic tail** (`max existing order + 1` at registration time).
- `slot` — target slot key; omit for the built-in seats above. When relocating, the component degrades gracefully to the props the new slot provides (`useSessions`/`wide` are optional in the panel code).

The resolved placement is exposed to the browser through `skillPanel/getConfig`; if the endpoint is unavailable (e.g. before a restart), the browser half falls back to the defaults above.

## Development

The package is pure JavaScript; edit `index.js` / `client.js`, then restart `dsh web` (the client bundle is rescanned at boot).

```sh
node --check index.js client.js
npx oxlint --deny-warnings index.js client.js
```

## License

MIT
