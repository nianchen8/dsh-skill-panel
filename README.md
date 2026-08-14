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
# or: dsh plugin --profile web add github:<you>/dsh-skill-panel
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

- **Host half** (`index.js`): a `TypertRemoteService` with five Remote endpoints — `listDetailed`, `getDetail`, `setInvocation`, `setDisabled`, `uninstall`. Reads resolve the session-scoped skill view (same catalog the model sees); writes rewrite SKILL.md frontmatter or delete the skill directory, then emit `fs/observed` for synchronous discovery invalidation and replay `agent-preset/selected` so the official slash menu drops its cached catalog.
- **Browser half** (`client.js`): plain React via the platform module table, registered into `sidebar.footer.action`, `shell.overlay`, and `settings.section`. All data crosses the standard API gateway over `/api/skillPanel/<method>`.

## Development

The package is pure JavaScript; edit `index.js` / `client.js`, then restart `dsh web` (the client bundle is rescanned at boot).

```sh
node --check index.js client.js
npx oxlint --deny-warnings index.js client.js
```

## License

MIT
