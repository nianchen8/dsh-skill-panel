window.__ModuleLoader__.load({
  id: "dsh-skill-panel",
  factory: (require) => {
    const React = require("react")

    const CSS = `
/* Sidebar foot: the owner renders sidebar.footer.action entries in a ROW, but
   every official entry in this slot is a full-width bar (dsh-client-ui-cordis's
   CordisPanel badge: width:100%; height:49px; border-radius:12px). Stacking the
   container is the design intent — a row squeezes several full-width entries
   side by side into an ugly "parallel" strip. The owner's class name
   (hHd-Xa_footerActions) contains "footerActions" across current dsh releases,
   so this also restores the correct stacked layout for sibling entries
   (cordis-panel, mcp-panel); re-verify after a dsh upgrade. */
[class*="footerActions"] { flex-direction: column; }
.skp-btn {
  display: flex; align-items: center; gap: 8px;
  height: 40px; padding: 0 10px; width: 100%;
  background: transparent; border: none; cursor: pointer;
  color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 13px;
  border-radius: 12px;
}
.skp-btn-rail {
  width: 36px; height: 36px;
  justify-content: center; gap: 0; padding: 0;
  border-radius: 50%;
  margin: 8px 0 10px;
}
.skp-btn-rail:hover { color: var(--dsw-alias-label-primary); }
.skp-btn-rail.skp-btn-active { color: var(--dsw-alias-brand-primary); }
.skp-btn:hover { background: var(--dsw-alias-interactive-bg-hover-solid); color: var(--dsw-alias-label-primary); }
.skp-btn-active { color: var(--dsw-alias-brand-primary); }
.skp-btn svg { flex: none; }
.skp-btn-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.skp-panel {
  position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: min(880px, calc(100vw - 48px));
  height: min(78vh, 680px);
  height: min(78dvh, 680px);
  display: flex; flex-direction: column;
  background: var(--dsw-alias-bg-overlay);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  pointer-events: auto;
  font: inherit;
  box-sizing: border-box;
  min-width: 0;
}
.skp-page {
  display: flex; flex-direction: column;
  height: 100%; min-height: 0;
  color: var(--dsw-alias-label-primary);
  font: inherit;
}
.skp-panel-head, .skp-page-head {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  font-size: 14px; font-weight: 600;
  flex: none;
}
.skp-panel-head .skp-spacer, .skp-page-head .skp-spacer { flex: 1; }
.skp-count { font-size: 11px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-1); border-radius: 999px; padding: 2px 8px; font-weight: 400; }
.skp-icon-btn {
  background: transparent; border: none; cursor: pointer;
  color: var(--dsw-alias-label-secondary);
  padding: 4px 6px; border-radius: 6px; font: inherit; font-size: 12px;
  display: inline-flex;
}
.skp-icon-btn:hover { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }
.skp-body { overflow-y: auto; padding: 0 16px 16px; flex: 1; min-height: 0; }
.skp-input {
  flex: 1; min-width: 0;
  background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary);
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px;
  padding: 7px 10px; font: inherit; font-size: 13px;
}
.skp-input:focus { outline: none; border-color: var(--dsw-alias-brand-primary); }
.skp-input:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 1px; }
.skp-btn:focus-visible, .skp-btn-sm:focus-visible, .skp-chip:focus-visible, .skp-icon-btn:focus-visible, .skp-sw:focus-visible, .skp-name:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px;
}
.skp-search { display: block; width: 100%; max-width: 640px; margin: 8px 0 2px; }
.skp-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 0 0; }
.skp-chip {
  background: transparent; border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary); border-radius: 999px;
  padding: 3px 10px; font-size: 12px; cursor: pointer;
}
.skp-chip-on { color: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); }
.skp-row { padding: 10px 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; max-width: 860px; }
.skp-row + .skp-row { border-top: 1px solid var(--dsw-alias-border-l1); border-radius: 0; }
.skp-row:hover { background: var(--dsw-alias-bg-layer-1); }
.skp-name {
  flex: 1 1 100%; min-width: 0;
  font-weight: 600; font-size: 13.5px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer;
  background: none; border: none; padding: 0; text-align: left; font-family: inherit; color: inherit;
}
.skp-name:hover { color: var(--dsw-alias-brand-primary); }
.skp-sw {
  flex: none; font-size: 11px; line-height: 1; padding: 3px 8px; border-radius: 999px;
  border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-secondary);
  background: transparent; cursor: pointer;
}
.skp-sw-on { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.skp-sw-dis { opacity: 0.45; cursor: default; }
.skp-source { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.skp-desc {
  font-size: 12.5px; color: var(--dsw-alias-label-secondary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.skp-btn-sm {
  display: inline-flex; align-items: center; background: transparent;
  border: 1px solid var(--dsw-alias-border-l1); color: var(--dsw-alias-label-secondary);
  border-radius: 6px; padding: 3px 7px; cursor: pointer; font-size: 12px;
}
.skp-btn-sm:hover { color: var(--dsw-alias-label-primary); }
.skp-btn-danger { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
.skp-btn-enable { color: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.skp-busy { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.skp-detail {
  margin-top: 4px; border-top: 1px dashed var(--dsw-alias-border-l1); padding-top: 6px;
  display: flex; flex-direction: column; gap: 3px;
}
.skp-detail-line { font-size: 11.5px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.skp-detail-path { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.skp-detail-pre {
  margin: 0; max-height: 260px; overflow: auto;
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px; padding: 10px; font-size: 12px; line-height: 1.5;
  white-space: pre-wrap; overflow-wrap: anywhere; color: var(--dsw-alias-label-primary);
}
.skp-notice { margin: 10px 0 0; padding: 7px 12px; border-radius: 8px; font-size: 12.5px; overflow-wrap: anywhere; max-width: 860px; }
.skp-notice-err { color: var(--dsw-alias-state-error-primary); background: color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent); }
.skp-groups { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; }
.skp-tag {
  font-size: 11px; color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-1); border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px; padding: 1px 8px;
}
.skp-toolbar { display: flex; gap: 6px; align-items: center; padding: 10px 0 2px; flex-wrap: wrap; }
.skp-select { min-width: 0; max-width: 320px; }
.skp-member { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
.skp-empty, .skp-err { padding: 28px 12px; text-align: center; font-size: 13px; color: var(--dsw-alias-label-secondary); }
.skp-err { color: var(--dsw-alias-state-error-primary); }
/* ── visual polish ─────────────────────────────────────────────── */
@keyframes skp-pop {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
.skp-panel { animation: skp-pop 160ms ease-out; }
.skp-page { animation: skp-fade 160ms ease-out; }
@keyframes skp-fade { from { opacity: 0; } to { opacity: 1; } }
.skp-panel-head { background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent); }
.skp-panel-head, .skp-page-head { backdrop-filter: blur(8px); }
.skp-chip { transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease, transform 120ms ease; }
.skp-chip:hover { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }
.skp-chip:active { transform: scale(0.96); }
.skp-chip-on { background: color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent); }
.skp-row { transition: background-color 120ms ease; border-radius: 10px; }
.skp-row:hover { background: var(--dsw-alias-bg-layer-1); }
.skp-name { display: inline-flex; align-items: center; gap: 7px; overflow: visible; white-space: normal; }
.skp-name-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.skp-name svg { flex: none; color: var(--dsw-alias-label-secondary); }
.skp-name:hover svg { color: var(--dsw-alias-brand-primary); }
.skp-tag { transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease; }
.skp-tag:hover { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-label-primary); }
.skp-sw { transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease, opacity 120ms ease, transform 80ms ease; }
.skp-sw:not(.skp-sw-dis):hover { background: var(--dsw-alias-bg-layer-1); }
.skp-sw:not(.skp-sw-dis):active { transform: scale(0.96); }
.skp-icon-btn { transition: background-color 120ms ease, color 120ms ease; }
.skp-icon-btn:hover { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }
.skp-btn-sm { transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease, transform 80ms ease; }
.skp-btn-sm:active { transform: scale(0.96); }
.skp-input, .skp-search { transition: border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease; }
.skp-input:focus, .skp-search:focus {
  border-color: var(--dsw-alias-brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, transparent);
}
.skp-detail { animation: skp-detail-in 140ms ease-out; }
@keyframes skp-detail-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.skp-notice { border-radius: 10px; }
.skp-empty, .skp-err { animation: skp-fade 160ms ease-out; }
/* ── geometry system: grid alignment, pill shapes, rhythm ───────── */
.skp-body { display: flex; flex-direction: column; }
.skp-row { max-width: 820px; width: 100%; margin: 0 auto; }
.skp-row + .skp-row { border-top: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 55%, transparent); }
.skp-row:hover { box-shadow: inset 2px 0 0 var(--dsw-alias-brand-primary); }
.skp-name svg { width: 18px; height: 18px; }
.skp-sw {
  display: inline-flex; align-items: center; height: 22px; padding: 0 10px;
  border-radius: 999px;
}
.skp-btn-sm {
  height: 26px; min-width: 26px; padding: 0 10px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
}
.skp-icon-btn { width: 28px; height: 28px; border-radius: 8px; align-items: center; justify-content: center; }
.skp-chip { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; }
.skp-input, .skp-search { height: 34px; }
.skp-panel-head, .skp-page-head { min-height: 48px; align-items: center; }
.skp-count { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; }
.skp-tag { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; }
.skp-desc { line-height: 1.5; }
@media (max-width: 700px) {
  .skp-panel {
    left: 50% !important; top: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: min(880px, calc(100vw - 24px)) !important;
    max-width: calc(100vw - 24px) !important;
    height: min(88vh, 680px) !important;
    height: min(88dvh, 680px) !important;
    max-height: min(88vh, 680px) !important;
    max-height: min(88dvh, 680px) !important;
    border-radius: 20px !important;
    box-sizing: border-box !important;
    padding-left: env(safe-area-inset-left) !important;
    padding-right: env(safe-area-inset-right) !important;
  }
  .skp-page { box-sizing: border-box; min-width: 0; }
  .skp-body { box-sizing: border-box; min-width: 0; padding: 0 12px 12px !important; }
  .skp-chips {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overscroll-behavior-inline: contain !important;
  }
  .skp-chip {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
  }
  .skp-input, .skp-search {
    border-radius: 10px !important;
    box-sizing: border-box !important;
  }
  .skp-btn-sm { min-height: 36px; }
  .skp-sw { min-height: 28px; padding: 6px 10px; }
  .skp-btn-rail { width: 40px; height: 40px; }
}
@media (orientation: landscape) and (max-height: 520px) {
  .skp-panel {
    height: min(94dvh, 460px) !important;
    max-height: min(94dvh, 460px) !important;
  }
}
/* ── vertical geometry v2: deterministic bands, one centered column ──
   r1 = grid [name(minmax(0,1fr)) | actions(auto, right-pinned)]
   meta = left-aligned pill/tag band; every row shares the same X anchors,
   so columns line up vertically across rows instead of drifting. */
.skp-chips, .skp-search, .skp-row, .skp-toolbar, .skp-notice, .skp-empty, .skp-err {
  width: 100%; max-width: 820px;
  margin-left: auto; margin-right: auto;
  box-sizing: border-box;
}
.skp-search { margin-top: 8px; margin-bottom: 2px; }
.skp-row { padding: 12px 14px; gap: 8px; }
.skp-r1 {
  display: grid; grid-template-columns: minmax(0, 1fr) auto;
  align-items: center; gap: 10px; min-height: 28px;
}
.skp-name {
  flex: none; display: flex; align-items: center; gap: 7px;
  min-width: 0; overflow: hidden; white-space: nowrap;
  flex-basis: auto;
}
.skp-id { display: flex; align-items: center; gap: 8px; min-width: 0; }
.skp-id .skp-name { flex: 0 1 auto; }
.skp-acts { display: flex; align-items: center; gap: 6px; justify-self: end; flex: none; }
.skp-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.skp-source { font-size: 11px; }
.skp-desc { padding-left: 25px; }
.skp-detail { margin-left: 25px; }
@keyframes skp-rise {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
.skp-row { animation: skp-rise 240ms cubic-bezier(0.25, 0.6, 0.3, 1) both; animation-delay: calc(var(--skp-i, 0) * 24ms); }
@media (prefers-reduced-motion: reduce) {
  .skp-row, .skp-panel, .skp-page, .skp-detail, .skp-empty, .skp-err { animation: none; }
}
/* ── material & order: card rows, one inset column, quiet motion ──
   Every surface shares the panel's 16px inset, so header / chips / rows /
   footer left-right edges coincide exactly. Rows are quiet cards: identical
   band anatomy, one text axis (25px, under the name), desc reserves exactly
   two lines so every collapsed row is the same height. */
.skp-chips, .skp-search, .skp-toolbar, .skp-row, .skp-notice, .skp-empty, .skp-err {
  max-width: none; margin-left: 0; margin-right: 0;
}
.skp-row {
  max-width: none; margin: 8px 0 0;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 62%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 38%, transparent);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
  animation: skp-rise 240ms cubic-bezier(0.25, 0.6, 0.3, 1) backwards; animation-delay: calc(var(--skp-i, 0) * 24ms);
}
.skp-row + .skp-row {
  border-radius: 12px;
  border-top: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 62%, transparent);
}
.skp-row:hover {
  background: var(--dsw-alias-bg-layer-1);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 32%, var(--dsw-alias-border-l1));
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
.skp-meta { padding-left: 25px; flex-wrap: nowrap; overflow: hidden; max-width: 100%; }
.skp-source {
  display: inline-flex; align-items: center; flex: none;
  height: 20px; padding: 0 8px; border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1) 62%, transparent);
}
.skp-desc { min-height: 3em; }
.skp-sw-on { background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent); }
.skp-body { scrollbar-width: thin; scrollbar-color: var(--dsw-alias-border-l2) transparent; }
.skp-body::-webkit-scrollbar { width: 8px; }
.skp-body::-webkit-scrollbar-thumb { background: var(--dsw-alias-border-l2); border-radius: 999px; }
.skp-body::-webkit-scrollbar-track { background: transparent; }
@media (prefers-reduced-motion: reduce) {
  .skp-row { transition: none; }
}
`

    // Only the slot system is a hard client dependency; the panel speaks to the
    // host through plain fetch RPC, not the connection service.
    const inject = ["slots"]

    const SOURCE_LABEL = {
      "project-dsh": "项目 .dsh",
      "project-agents": "项目 .agents",
      "user-dsh": "用户 .dsh",
      "user-agents": "用户 .agents",
      custom: "自定义",
      bundled: "内置",
      runtime: "运行时",
    }
    const sourceLabel = (s) => SOURCE_LABEL[s] !== undefined ? SOURCE_LABEL[s] : String(s)

    // 来源 chip 的稳定展示顺序；只显示实际存在（有 skill）的来源。
    const SOURCE_ORDER = ["user-agents", "user-dsh", "project-agents", "project-dsh", "custom", "bundled", "runtime"]

    const newRpcId = () => {
      try {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
      } catch { /* fall through */ }
      return "skp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10)
    }

    /** Unary RPC against a Typert Remote endpoint (skillPanel/*). */
    const panelRpc = (method, args, timeoutMs = 30000) => {
      const message = {
        type: "client-request",
        rpcId: newRpcId(),
        method,
        payload: { args },
      }
      const signal = typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(timeoutMs)
        : undefined
      return fetch("/api/" + method, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(message),
        ...(signal === undefined ? {} : { signal }),
      }).then((res) => {
        if (!res.ok) throw new Error(method + " 传输失败: HTTP " + res.status)
        return res.json()
      }).then((full) => {
        const result = full === undefined || full === null ? null : full.result
        if (result === undefined || result === null) throw new Error(method + " 返回了空响应")
        return result
      })
    }

    const rpcErrorText = (result) => {
      if (result === undefined || result === null) return "未知错误"
      if (result.error !== undefined && result.error !== null) {
        return String(result.error.message || result.error.code || result.error)
      }
      return "未知错误"
    }

    // Entry placement: `order` present = register at that exact position;
    // absent = register at the slot's dynamic TAIL (max existing order + 1),
    // so a fresh deployment lands after whatever entries already occupy the
    // slot, no matter how many there are or what orders they use.
    const DEFAULT_ENTRIES = {
      sidebar: { enabled: true, slot: "sidebar.footer.action" },
      overlay: { enabled: true, slot: "shell.overlay" },
      settings: { enabled: true, slot: "settings.section" },
    }
    const normalizeEntries = (config) => {
      const raw = config !== null && typeof config === "object" ? config.entries : undefined
      const out = {}
      for (const key of Object.keys(DEFAULT_ENTRIES)) {
        const base = DEFAULT_ENTRIES[key]
        const row = raw !== undefined && raw !== null && typeof raw === "object"
          && raw[key] !== undefined && raw[key] !== null && typeof raw[key] === "object"
          ? raw[key]
          : {}
        const entry = {
          enabled: typeof row.enabled === "boolean" ? row.enabled : base.enabled,
          slot: typeof row.slot === "string" && row.slot !== "" ? row.slot : base.slot,
        }
        if (typeof row.order === "number" && Number.isFinite(row.order)) entry.order = row.order
        out[key] = entry
      }
      return out
    }

    /** Resolve the deployment's entry placement; defaults on any failure. */
    const loadEntries = async () => {
      try {
        const result = await panelRpc("skillPanel/getConfig", { request: {} }, 2000)
        if (result !== null && typeof result === "object" && result.entries !== undefined) {
          return normalizeEntries(result)
        }
      } catch { /* host half may predate getConfig — fall through to defaults */ }
      return normalizeEntries(null)
    }

    /** Register one entry; order absent = dynamic tail of the slot's live entries. */
    const mountEntry = (slots, entry) => {
      if (!entry.enabled) return
      slots.inject(entry.slot, () => {
        const order = entry.order !== undefined ? entry.order : (() => {
          const orders = slots.entries(entry.slot).map((e) => e.options.order ?? 0)
          return orders.length === 0 ? 0 : Math.max(...orders) + 1
        })()
        const options = { name: entry.slot, id: entry.id, order }
        if (entry.label !== undefined) options.label = entry.label
        return slots.register(options, entry.component)
      })
    }

    async function apply(ctx) {
      const slots = ctx.get("slots")
      if (slots === undefined) return

      ctx.effect(() => {
        const tag = document.createElement("style")
        tag.dataset.plugin = "dsh-skill-panel"
        tag.textContent = CSS
        document.head.appendChild(tag)
        return () => { tag.remove() }
      })

      const listeners = new Set()
      let open = false
      const setOpen = (v) => { open = v; listeners.forEach((l) => l()) }
      const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
      const useOpen = () => {
        const [, force] = React.useState(0)
        React.useEffect(() => subscribe(() => force((x) => x + 1)), [])
        return open
      }

      const icon = (d) => React.createElement("svg", {
        width: 16, height: 16, viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
      }, React.createElement("path", { d }))

      const BOOK = "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM9 7h6M9 11h6"
      const X = "M18 6L6 18M6 6l12 12"
      const REFRESH = "M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"
      const TRASH = "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"

      function Switch({ on, onChange, disabled, label }) {
        return React.createElement("button", {
          className: "skp-sw" + (on ? " skp-sw-on" : "") + (disabled ? " skp-sw-dis" : ""),
          title: disabled ? "「" + label + "可用」不可修改" : (on ? "关闭" : "开启") + "「" + label + "可用」",
          "aria-pressed": on ? "true" : "false",
          "aria-disabled": disabled ? "true" : undefined,
          onClick: () => { if (!disabled && onChange) onChange(!on) },
        }, label)
      }

      function SkillsPanel(props) {
        const variant = props.variant === "page" ? "page" : "modal"
        const isOpen = useOpen()
        const active = variant === "page" || isOpen
        const sessionId = typeof props.useSessions === "function" ? props.useSessions((s) => s.current) : null
        const [state, setState] = React.useState({ status: "idle", skills: [] })
        const [query, setQuery] = React.useState("")
        const [sourceFilter, setSourceFilter] = React.useState("all")
        const [expanded, setExpanded] = React.useState({})
        const [busy, setBusy] = React.useState({})
        const [armed, setArmed] = React.useState({})
        const [notice, setNotice] = React.useState(null)
        const [groups, setGroups] = React.useState({ status: "idle", groups: [] })
        const [groupBusy, setGroupBusy] = React.useState({})
        const [groupOpen, setGroupOpen] = React.useState({})
        const [groupAdd, setGroupAdd] = React.useState({})
        const [armedGroup, setArmedGroup] = React.useState(null)
        const [creating, setCreating] = React.useState(false)
        const [createName, setCreateName] = React.useState("")
        const [createDesc, setCreateDesc] = React.useState("")
        const [editing, setEditing] = React.useState(null)
        const [editName, setEditName] = React.useState("")
        const [editDesc, setEditDesc] = React.useState("")
        const panelRef = React.useRef(null)
        const mountedRef = React.useRef(true)
        const busyRef = React.useRef({})
        React.useEffect(() => () => { mountedRef.current = false }, [])

        const load = React.useCallback(() => {
          setState((s) => ({ ...s, status: "loading" }))
          setNotice(null)
          panelRpc("skillPanel/listDetailed", { request: { sessionId: sessionId === null ? undefined : sessionId } })
            .then((result) => {
              if (!result.ok) {
                setState({ status: "error", skills: [], error: "listDetailed 失败: " + rpcErrorText(result) })
                return
              }
              const value = result.value === undefined || result.value === null ? {} : result.value
              if (value.error !== undefined && value.error !== null && value.error !== "") {
                setState({ status: "error", skills: value.skills || [], error: String(value.error) })
                return
              }
              setState({ status: "ok", skills: value.skills || [] })
            })
            .catch((err) => {
              setState({ status: "error", skills: [], error: String((err && err.message) || err) })
            })
        }, [sessionId])

        React.useEffect(() => { if (active) load() }, [active, sessionId, load])

        const loadGroups = React.useCallback(() => {
          setGroups((g) => ({ ...g, status: "loading" }))
          panelRpc("skillPanel/groupList", { request: {} })
            .then((result) => {
              if (!result.ok) {
                setGroups({ status: "error", groups: [], error: rpcErrorText(result) })
                return
              }
              const value = result.value === undefined || result.value === null ? {} : result.value
              if (value.error !== undefined && value.error !== null && value.error !== "") {
                setGroups({ status: "error", groups: value.groups || [], error: String(value.error) })
                return
              }
              setGroups({ status: "ok", groups: value.groups || [] })
            })
            .catch((err) => {
              setGroups({ status: "error", groups: [], error: String((err && err.message) || err) })
            })
        }, [])

        React.useEffect(() => { if (active) loadGroups() }, [active, loadGroups])

        // 当前选中的来源若在最新 catalog 里已不存在（如该目录被删），回退到「全部」。
        React.useEffect(() => {
          if (state.status !== "ok" || sourceFilter === "group" || sourceFilter === "all") return
          const present = state.skills.some((s) => String(s.source) === sourceFilter)
          if (!present) setSourceFilter("all")
        }, [state, sourceFilter])

        // Modal accessibility: move focus into the panel on open, trap Tab
        // inside it, close on Escape, and return focus to the trigger on close.
        React.useEffect(() => {
          if (variant !== "modal" || !isOpen) return
          const previous = document.activeElement
          const panel = panelRef.current
          if (panel !== null) {
            const target = panel.querySelector("input, select") || panel.querySelector("button")
            if (target !== null) target.focus()
          }
          const onKeyDown = (e) => {
            if (e.key === "Escape" && props.onClose) props.onClose()
          }
          document.addEventListener("keydown", onKeyDown)
          return () => {
            document.removeEventListener("keydown", onKeyDown)
            if (previous !== null && typeof previous.focus === "function" && document.contains(previous)) previous.focus()
          }
        }, [variant, isOpen])

        const trapTab = (e) => {
          if (e.key !== "Tab" || panelRef.current === null) return
          const nodes = panelRef.current.querySelectorAll("button, input, select, [tabindex]:not([tabindex='-1'])")
          const focusable = Array.from(nodes).filter((el) => !el.disabled)
          if (focusable.length === 0) { e.preventDefault(); return }
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          const active = document.activeElement
          if (e.shiftKey && (active === first || active === panelRef.current || !panelRef.current.contains(active))) {
            e.preventDefault(); last.focus()
          } else if (!e.shiftKey && active === last) {
            e.preventDefault(); first.focus()
          }
        }

        const act = (name, op, fn) => {
          // Synchronous re-entry guard: a second click before the busy state
          // renders must not fire a duplicate request.
          if (busyRef.current[name] !== undefined) return
          const next = { ...busyRef.current, [name]: op }
          busyRef.current = next
          setBusy(next)
          setNotice(null)
          fn().then((result) => {
            if (!mountedRef.current) return
            if (!result.ok) {
              setNotice({ kind: "error", text: rpcErrorText(result) })
              return
            }
            const value = result.value === undefined || result.value === null ? {} : result.value
            if (value.ok === false || (value.error !== undefined && value.error !== null && value.error !== "")) {
              setNotice({ kind: "error", text: value.error === undefined || value.error === null ? "操作失败" : String(value.error) })
              return
            }
            load()
          }).catch((err) => {
            if (mountedRef.current) setNotice({ kind: "error", text: String((err && err.message) || err) })
          }).finally(() => {
            if (!mountedRef.current) return
            const n = { ...busyRef.current }; delete n[name]; busyRef.current = n; setBusy(n)
          })
        }

        const groupAct = (key, fn, onOk) => {
          // Namespace the re-entry guard so group ops can never collide with
          // a skill named like a group op key.
          const refKey = "g:" + key
          if (busyRef.current[refKey] !== undefined) return
          const next = { ...busyRef.current, [refKey]: true }
          busyRef.current = next
          setGroupBusy((b) => ({ ...b, [key]: true }))
          setNotice(null)
          fn().then((result) => {
            if (!mountedRef.current) return
            if (!result.ok) {
              setNotice({ kind: "error", text: rpcErrorText(result) })
              return
            }
            const value = result.value === undefined || result.value === null ? {} : result.value
            if (value.ok === false || (value.error !== undefined && value.error !== null && value.error !== "")) {
              setNotice({ kind: "error", text: value.error === undefined || value.error === null ? "操作失败" : String(value.error) })
              return
            }
            loadGroups()
            load()
            if (onOk) onOk()
          }).catch((err) => {
            if (mountedRef.current) setNotice({ kind: "error", text: String((err && err.message) || err) })
          }).finally(() => {
            if (!mountedRef.current) return
            const n = { ...busyRef.current }; delete n[refKey]; busyRef.current = n
            setGroupBusy((b) => { const m = { ...b }; delete m[key]; return m })
          })
        }

        const createGroup = () => {
          const name = createName.trim()
          if (name === "") { setNotice({ kind: "error", text: "组名不能为空" }); return }
          groupAct("create", () => panelRpc("skillPanel/groupCreate", {
            request: { name, description: createDesc.trim() },
          }), () => { setCreating(false); setCreateName(""); setCreateDesc("") })
        }

        const startGroupEdit = (g) => {
          setEditing({ name: g.name })
          setEditName(g.name)
          setEditDesc(g.description || "")
        }

        const saveGroupEdit = (g) => {
          const newName = editName.trim()
          if (newName === "") { setNotice({ kind: "error", text: "组名不能为空" }); return }
          groupAct(g.name, () => panelRpc("skillPanel/groupUpdate", {
            request: { name: g.name, newName, description: editDesc.trim() },
          }), () => setEditing(null))
        }

        const deleteGroup = (g) => {
          if (armedGroup !== g.name) { setArmedGroup(g.name); return }
          groupAct(g.name, () => panelRpc("skillPanel/groupDelete", {
            request: { name: g.name },
          }), () => setArmedGroup(null))
        }

        const addMember = (g) => {
          const skillName = groupAdd[g.name]
          if (skillName === undefined || skillName === "") return
          groupAct("add:" + g.name, () => panelRpc("skillPanel/groupAddSkill", {
            request: { name: g.name, skillName, sessionId },
          }), () => setGroupAdd((a) => { const n = { ...a }; delete n[g.name]; return n }))
        }

        const removeMember = (g, skillName) => {
          groupAct("rm:" + g.name, () => panelRpc("skillPanel/groupRemoveSkill", {
            request: { name: g.name, skillName, sessionId },
          }))
        }

        const toggleInvocation = (skill, side) => {
          const request = { name: skill.name, sessionId }
          if (side === "model") {
            request.modelInvocable = !skill.modelInvocable
            if (!request.modelInvocable && !skill.userInvocable) {
              setNotice({ kind: "error", text: "模型可用与用户可用至少保留一个启用" })
              return
            }
          } else {
            request.userInvocable = !skill.userInvocable
            if (!request.userInvocable && !skill.modelInvocable) {
              setNotice({ kind: "error", text: "模型可用与用户可用至少保留一个启用" })
              return
            }
          }
          act(skill.name, "toggle", () => panelRpc("skillPanel/setInvocation", { request }))
        }

        const uninstall = (skill) => act(skill.name, "uninstall", () =>
          panelRpc("skillPanel/uninstall", { request: { name: skill.name, sessionId } }))

        const disableSkill = (skill) => {
          const isDisabled = !skill.modelInvocable && !skill.userInvocable
          act(skill.name, "disable", () => panelRpc("skillPanel/setDisabled", {
            request: { name: skill.name, sessionId, disabled: !isDisabled },
          }))
        }

        const toggleDetail = (skill) => {
          if (expanded[skill.name] !== undefined) {
            setExpanded((e) => { const n = { ...e }; delete n[skill.name]; return n })
            return
          }
          setBusy((b) => ({ ...b, [skill.name]: "detail" }))
          setNotice(null)
          panelRpc("skillPanel/getDetail", { request: { name: skill.name, sessionId } }).then((result) => {
            if (!result.ok) {
              setNotice({ kind: "error", text: rpcErrorText(result) })
              return
            }
            const value = result.value === undefined || result.value === null ? {} : result.value
            if (value.error !== undefined && value.error !== null && value.error !== "") {
              setNotice({ kind: "error", text: String(value.error) })
              return
            }
            setExpanded((e) => ({ ...e, [skill.name]: value.skill || {} }))
          }).catch((err) => {
            setNotice({ kind: "error", text: String((err && err.message) || err) })
          }).finally(() => {
            setBusy((b) => { const n = { ...b }; delete n[skill.name]; return n })
          })
        }

        if (!active) return null

        const q = query.trim().toLowerCase()
        const visible = state.skills.filter((s) => {
          if (sourceFilter !== "all" && s.source !== sourceFilter) return false
          if (q !== "" && String(s.name || "").toLowerCase().indexOf(q) < 0 && String(s.description || "").toLowerCase().indexOf(q) < 0) return false
          return true
        })

        const rows = visible.map((s, i) => {
          const isBusy = busy[s.name] !== undefined
          const removable = s.path != null && s.path !== "" && s.source !== "bundled"
          const isDisabled = !s.modelInvocable && !s.userInvocable
          const detail = expanded[s.name]
          return React.createElement("div", {
            className: "skp-row",
            key: s.name,
            style: { "--skp-i": String(Math.min(i, 6)) },
          },
            React.createElement("div", { className: "skp-r1" },
              React.createElement("button", {
                type: "button",
                className: "skp-name",
                title: s.name,
                "aria-expanded": detail !== undefined ? "true" : "false",
                onClick: () => toggleDetail(s),
              }, icon(BOOK), React.createElement("span", { className: "skp-name-text" }, s.name)),
              React.createElement("div", { className: "skp-acts" },
                isBusy
                  ? React.createElement("span", { className: "skp-busy" }, "处理中…")
                  : React.createElement(React.Fragment, null,
                      React.createElement(Switch, { label: "模型", on: s.modelInvocable, disabled: !removable || isBusy, onChange: () => toggleInvocation(s, "model") }),
                      React.createElement(Switch, { label: "用户", on: s.userInvocable, disabled: !removable || isBusy, onChange: () => toggleInvocation(s, "user") }),
                      removable
                        ? React.createElement("button", {
                          className: "skp-btn-sm" + (isDisabled ? " skp-btn-enable" : ""),
                          title: isDisabled ? "启用该 skill(恢复禁用前的状态)" : "禁用该 skill(模型与用户都不可用)",
                          onClick: () => disableSkill(s),
                        }, isDisabled ? "启用" : "禁用")
                        : null,
                      removable
                        ? (armed[s.name]
                          ? React.createElement("button", {
                            className: "skp-btn-sm skp-btn-danger",
                            onClick: () => { setArmed((a) => { const n = { ...a }; delete n[s.name]; return n }); uninstall(s) },
                          }, "确认卸载?")
                          : React.createElement("button", { className: "skp-btn-sm", title: "卸载该 skill", onClick: () => setArmed((a) => ({ ...a, [s.name]: true })) }, icon(TRASH)))
                        : null,
                    ),
              ),
            ),
            React.createElement("div", { className: "skp-meta" },
              React.createElement("span", { className: "skp-source" }, sourceLabel(s.source)),
              (Array.isArray(s.groups) && s.groups.length > 0)
                ? s.groups.map((g) => React.createElement("span", { className: "skp-tag", key: g }, g))
                : null,
            ),
            React.createElement("div", { className: "skp-desc" }, s.description || "(无描述)"),
            detail !== undefined
              ? React.createElement("div", { className: "skp-detail" },
                  detail.whenToUse ? React.createElement("div", { className: "skp-detail-line" }, "whenToUse: " + detail.whenToUse) : null,
                  detail.path ? React.createElement("div", { className: "skp-detail-line skp-detail-path", title: detail.path }, "文件: " + detail.path) : null,
                  React.createElement("div", { className: "skp-detail-line" }, "来源: " + sourceLabel(detail.source || s.source) + " · provider: " + detail.provider),
                  React.createElement("pre", { className: "skp-detail-pre" }, detail.content || "(无正文)"),
                )
              : null,
          )
        })

        const groupToolbar = groups.status === "error"
          ? React.createElement("div", { className: "skp-toolbar" },
              React.createElement("span", { className: "skp-detail-line" }, "存储不可用,分组功能为只读"),
            )
          : groups.status !== "ok"
            ? null
            : creating
              ? React.createElement("form", { className: "skp-toolbar", onSubmit: (e) => { e.preventDefault(); createGroup() } },
                  React.createElement("input", { className: "skp-input", placeholder: "组名", value: createName, onChange: (e) => setCreateName(e.target.value) }),
                  React.createElement("input", { className: "skp-input", placeholder: "描述(可选)", value: createDesc, onChange: (e) => setCreateDesc(e.target.value) }),
                  React.createElement("button", { type: "submit", className: "skp-btn-sm skp-btn-enable", disabled: groupBusy["create"] === true }, groupBusy["create"] ? "创建中…" : "创建"),
                  React.createElement("button", { type: "button", className: "skp-btn-sm", onClick: () => { setCreating(false); setCreateName(""); setCreateDesc("") } }, "取消"),
                )
              : React.createElement("div", { className: "skp-toolbar" },
                  React.createElement("button", { type: "button", className: "skp-btn-sm skp-btn-enable", onClick: () => setCreating(true) }, "＋ 新建组"),
                )

        const groupRows = groups.groups.map((g) => {
          const members = Array.isArray(g.members) ? g.members : []
          const isOpen = groupOpen[g.name] === true
          const adding = groupAdd[g.name]
          const isEditing = editing !== null && editing.name === g.name
          const otherSkills = state.skills.filter((s) => members.indexOf(s.name) < 0)
          return React.createElement("div", { className: "skp-row", key: g.name },
            React.createElement("div", { className: "skp-r1" },
              isEditing
                ? React.createElement("form", { className: "skp-toolbar", onSubmit: (e) => { e.preventDefault(); saveGroupEdit(g) } },
                    React.createElement("input", { className: "skp-input", value: editName, onChange: (e) => setEditName(e.target.value), placeholder: "组名" }),
                    React.createElement("input", { className: "skp-input", value: editDesc, onChange: (e) => setEditDesc(e.target.value), placeholder: "描述(可选)" }),
                    React.createElement("button", { type: "submit", className: "skp-btn-sm skp-btn-enable" }, "保存"),
                    React.createElement("button", { type: "button", className: "skp-btn-sm", onClick: () => setEditing(null) }, "取消"),
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "skp-id" },
                      React.createElement("button", {
                        type: "button",
                        className: "skp-name",
                        title: g.name,
                        "aria-expanded": isOpen ? "true" : "false",
                        onClick: () => setGroupOpen((o) => ({ ...o, [g.name]: !isOpen })),
                      }, g.name),
                      React.createElement("span", { className: "skp-count" }, String(members.length)),
                    ),
                    React.createElement("div", { className: "skp-acts" },
                      groupBusy[g.name]
                        ? React.createElement("span", { className: "skp-busy" }, "处理中…")
                        : React.createElement(React.Fragment, null,
                            React.createElement("button", { className: "skp-btn-sm", title: "重命名 / 编辑描述", onClick: () => startGroupEdit(g) }, "重命名"),
                            armedGroup === g.name
                              ? React.createElement("button", { className: "skp-btn-sm skp-btn-danger", onClick: () => deleteGroup(g) }, "确认删除?")
                              : React.createElement("button", { className: "skp-btn-sm skp-btn-danger", title: "删除该组", onClick: () => deleteGroup(g) }, "删除"),
                          ),
                    ),
                  ),
            ),
            g.description ? React.createElement("div", { className: "skp-desc" }, g.description) : null,
            isOpen
              ? React.createElement("div", { className: "skp-detail" },
                  members.length === 0
                    ? React.createElement("div", { className: "skp-detail-line" }, "（暂无成员）")
                    : members.map((m) => React.createElement("div", { className: "skp-member", key: m },
                        React.createElement("span", { className: "skp-detail-line", style: { flex: 1 } }, m),
                        React.createElement("button", { className: "skp-btn-sm skp-btn-danger", title: "移出该组", onClick: () => removeMember(g, m) }, "移除"),
                      )),
                  otherSkills.length === 0
                    ? React.createElement("div", { className: "skp-detail-line" }, "所有 skill 都已加入该组")
                    : React.createElement("div", { className: "skp-toolbar" },
                        React.createElement("select", {
                          className: "skp-input skp-select",
                          value: adding === undefined ? "" : adding,
                          onChange: (e) => setGroupAdd((a) => ({ ...a, [g.name]: e.target.value })),
                        },
                          React.createElement("option", { value: "", disabled: true }, "选择要加入的 skill…"),
                          otherSkills.map((s) => React.createElement("option", { key: s.name, value: s.name }, s.name)),
                        ),
                        React.createElement("button", {
                          className: "skp-btn-sm skp-btn-enable",
                          disabled: adding === undefined || adding === "",
                          onClick: () => addMember(g),
                        }, "加入"),
                      ),
                )
              : null,
          )
        })

        let body
        if (sourceFilter === "group") {
          if (groups.status === "loading" || groups.status === "idle") body = React.createElement("div", { className: "skp-empty" }, "加载中…")
          else if (groups.status === "error") body = React.createElement("div", { className: "skp-err" }, "加载失败: " + groups.error)
          else if (groups.groups.length === 0) body = React.createElement("div", { className: "skp-empty" }, "还没有小组，点击上方「新建组」创建")
          else body = groupRows
        }
        else if (state.status === "loading") body = React.createElement("div", { className: "skp-empty" }, "加载中…")
        else if (state.status === "error") body = React.createElement("div", { className: "skp-err" }, "加载失败: " + state.error)
        else if (visible.length === 0) body = React.createElement("div", { className: "skp-empty" }, state.skills.length === 0 ? "未发现 skill" : "没有匹配的 skill")
        else body = rows

        const sourceCounts = {}
        for (const s of state.skills) {
          const key = String(s.source)
          sourceCounts[key] = sourceCounts[key] === undefined ? 1 : sourceCounts[key] + 1
        }
        const countOf = (source) => source === "all" ? state.skills.length : (sourceCounts[source] === undefined ? 0 : sourceCounts[source])
        // 跟着 dsh 的发现结果走：catalog 里实际出现（count > 0）的来源才显示 tab，
        // 没被发现的来源不显示。「组」「全部」固定保留。
        const sourceChips = SOURCE_ORDER
          .filter((source) => (sourceCounts[source] ?? 0) > 0)
          .map((source) => [source, sourceLabel(source), sourceCounts[source]])
        const chips = [
          ["group", "组", groups.status === "ok" ? groups.groups.length : null],
          ["all", "全部", countOf("all")],
          ...sourceChips,
        ]

        const head = React.createElement("div", { className: variant === "modal" ? "skp-panel-head" : "skp-page-head" },
          React.createElement("span", null, "Skill 管理"),
          React.createElement("span", { className: "skp-count" }, String(state.skills.length)),
          React.createElement("span", { className: "skp-spacer" }),
          React.createElement("button", { className: "skp-icon-btn", title: "刷新", onClick: () => load() }, icon(REFRESH)),
          variant === "modal"
            ? React.createElement("button", { className: "skp-icon-btn", title: "关闭", onClick: () => { if (props.onClose) props.onClose() } }, icon(X))
            : null,
        )

        return React.createElement("div", {
          className: variant === "modal" ? "skp-panel" : "skp-page",
          role: variant === "modal" ? "dialog" : undefined,
          "aria-label": "Skill 管理",
          "aria-modal": variant === "modal" ? "true" : undefined,
          ref: panelRef,
          onKeyDown: trapTab,
        },
          head,
          React.createElement("div", { className: "skp-body" },
            notice ? React.createElement("div", { className: "skp-notice skp-notice-err" }, notice.text) : null,
            React.createElement("div", { className: "skp-chips" },
              chips.map(([value, label, count]) => React.createElement("button", {
                key: value, className: "skp-chip" + (sourceFilter === value ? " skp-chip-on" : ""),
                onClick: () => setSourceFilter(value),
              }, label + (count === null ? "" : " (" + count + ")")))
            ),
            sourceFilter === "group"
              ? groupToolbar
              : React.createElement("input", {
                  className: "skp-input skp-search", placeholder: "搜索名称或描述…",
                  value: query, onChange: (e) => setQuery(e.target.value),
                }),
            body,
          ),
        )
      }

      const entries = await loadEntries()
      mountEntry(slots, {
        ...entries.sidebar,
        id: "skills-panel",
        label: "Skills",
        component: (props) => React.createElement("button", {
          className: "skp-btn" + (props.wide ? "" : " skp-btn-rail") + (useOpen() ? " skp-btn-active" : ""),
          title: "Skill 管理面板",
          "aria-label": "Skill 管理面板",
          onClick: () => setOpen(!open),
        }, icon(BOOK), props.wide ? React.createElement("span", { className: "skp-btn-label" }, "Skills") : null),
      })

      mountEntry(slots, {
        ...entries.overlay,
        id: "skills-panel-overlay",
        component: (props) => React.createElement(SkillsPanel, {
          variant: "modal",
          onClose: () => setOpen(false),
          useSessions: props.useSessions,
        }),
      })

      mountEntry(slots, {
        ...entries.settings,
        id: "skills",
        label: "Skills",
        component: (props) => React.createElement(SkillsPanel, {
          variant: "page",
          useSessions: props.useSessions,
        }),
      })
    }

    return { inject, apply }
  },
})
