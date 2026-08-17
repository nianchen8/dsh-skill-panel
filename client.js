window.__ModuleLoader__.load({
  id: "dsh-skill-panel",
  factory: (require) => {
    const React = require("react")

    const CSS = `
/* Sidebar foot: the owner renders sidebar.footer.action entries in a row; the
   panel's full-width buttons need them stacked. This reaches the owner's
   container through its hashed class (contains "footerActions" across current
   dsh releases) and therefore also affects sibling footer-action entries
   (e.g. cordis-panel) — re-verify after a dsh upgrade. */
[class*="footerActions"] { flex-direction: column; }
.skp-btn {
  display: flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 10px; width: 100%;
  margin: 4px -4px;
  background: transparent; border: none; cursor: pointer;
  color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 13px;
  border-radius: 8px;
}
.skp-btn-rail {
  width: 36px; height: 36px;
  justify-content: center; gap: 0; padding: 0;
  border-radius: 50%;
  margin: 8px 0 10px;
}
.skp-btn-rail:hover { color: var(--dsw-alias-label-primary); }
.skp-btn-rail.skp-btn-active { color: var(--dsw-alias-brand-primary); }
.skp-btn:hover { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }
.skp-btn-active { color: var(--dsw-alias-brand-primary); }
.skp-btn svg { flex: none; }
.skp-btn-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.skp-panel {
  position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
  z-index: 1000;
  width: min(880px, calc(100vw - 48px));
  height: min(78vh, 680px);
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
.skp-row-top { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 8px; }
.skp-name { flex: 1 1 100%; min-width: 0; font-weight: 600; font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
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
@media (max-width: 700px) {
  .skp-panel {
    left: 50% !important; top: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: min(880px, calc(100vw - 24px)) !important;
    max-width: calc(100vw - 24px) !important;
    height: min(88vh, 680px) !important;
    max-height: min(88vh, 680px) !important;
    border-radius: 20px !important;
    box-sizing: border-box !important;
  }
  .skp-page { box-sizing: border-box; min-width: 0; }
  .skp-body { box-sizing: border-box; min-width: 0; padding: 0 12px 12px !important; }
  .skp-chips {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .skp-chip {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
  }
  .skp-input, .skp-search {
    border-radius: 10px !important;
    box-sizing: border-box !important;
  }
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
        const result = await panelRpc("skillPanel/getConfig", { request: {} }, 5000)
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

        const act = (name, op, fn) => {
          setBusy((b) => ({ ...b, [name]: op }))
          setNotice(null)
          fn().then((result) => {
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
            setNotice({ kind: "error", text: String((err && err.message) || err) })
          }).finally(() => {
            setBusy((b) => { const n = { ...b }; delete n[name]; return n })
          })
        }

        const groupAct = (key, fn, onOk) => {
          setGroupBusy((b) => ({ ...b, [key]: true }))
          setNotice(null)
          fn().then((result) => {
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
            setNotice({ kind: "error", text: String((err && err.message) || err) })
          }).finally(() => {
            setGroupBusy((b) => { const n = { ...b }; delete n[key]; return n })
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

        const rows = visible.map((s) => {
          const isBusy = busy[s.name] !== undefined
          const removable = s.path != null && s.path !== "" && s.source !== "bundled"
          const isDisabled = !s.modelInvocable && !s.userInvocable
          const detail = expanded[s.name]
          return React.createElement("div", { className: "skp-row", key: s.name },
            React.createElement("div", { className: "skp-row-top" },
              React.createElement("span", {
                className: "skp-name",
                title: s.name,
                onClick: () => toggleDetail(s),
              }, s.name),
              React.createElement(Switch, { label: "模型", on: s.modelInvocable, disabled: !removable || isBusy, onChange: () => toggleInvocation(s, "model") }),
              React.createElement(Switch, { label: "用户", on: s.userInvocable, disabled: !removable || isBusy, onChange: () => toggleInvocation(s, "user") }),
              React.createElement("span", { className: "skp-source" }, sourceLabel(s.source)),
              React.createElement("span", { className: "skp-spacer" }),
              isBusy
                ? React.createElement("span", { className: "skp-busy" }, "处理中…")
                : (removable
                  ? React.createElement(React.Fragment, null,
                      React.createElement("button", {
                        className: "skp-btn-sm" + (isDisabled ? " skp-btn-enable" : ""),
                        title: isDisabled ? "启用该 skill(恢复禁用前的状态)" : "禁用该 skill(模型与用户都不可用)",
                        onClick: () => disableSkill(s),
                      }, isDisabled ? "启用" : "禁用"),
                      armed[s.name]
                        ? React.createElement("button", {
                          className: "skp-btn-sm skp-btn-danger",
                          onClick: () => { setArmed((a) => { const n = { ...a }; delete n[s.name]; return n }); uninstall(s) },
                        }, "确认卸载?")
                        : React.createElement("button", { className: "skp-btn-sm", title: "卸载该 skill", onClick: () => setArmed((a) => ({ ...a, [s.name]: true })) }, icon(TRASH)),
                    )
                  : null),
            ),
            React.createElement("div", { className: "skp-desc" }, s.description || "(无描述)"),
            (Array.isArray(s.groups) && s.groups.length > 0)
              ? React.createElement("div", { className: "skp-groups" },
                  s.groups.map((g) => React.createElement("span", { className: "skp-tag", key: g }, g)))
              : null,
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

        const groupToolbar = creating
          ? React.createElement("div", { className: "skp-toolbar" },
              React.createElement("input", { className: "skp-input", placeholder: "组名", value: createName, onChange: (e) => setCreateName(e.target.value) }),
              React.createElement("input", { className: "skp-input", placeholder: "描述(可选)", value: createDesc, onChange: (e) => setCreateDesc(e.target.value) }),
              React.createElement("button", { className: "skp-btn-sm skp-btn-enable", onClick: createGroup }, groupBusy["create"] ? "创建中…" : "创建"),
              React.createElement("button", { className: "skp-btn-sm", onClick: () => { setCreating(false); setCreateName(""); setCreateDesc("") } }, "取消"),
            )
          : React.createElement("div", { className: "skp-toolbar" },
              React.createElement("button", { className: "skp-btn-sm skp-btn-enable", onClick: () => setCreating(true) }, "＋ 新建组"),
            )

        const groupRows = groups.groups.map((g) => {
          const members = Array.isArray(g.members) ? g.members : []
          const isOpen = groupOpen[g.name] === true
          const adding = groupAdd[g.name]
          const isEditing = editing !== null && editing.name === g.name
          const otherSkills = state.skills.filter((s) => members.indexOf(s.name) < 0)
          return React.createElement("div", { className: "skp-row", key: g.name },
            React.createElement("div", { className: "skp-row-top" },
              isEditing
                ? React.createElement(React.Fragment, null,
                    React.createElement("input", { className: "skp-input", value: editName, onChange: (e) => setEditName(e.target.value), placeholder: "组名" }),
                    React.createElement("input", { className: "skp-input", value: editDesc, onChange: (e) => setEditDesc(e.target.value), placeholder: "描述(可选)" }),
                    React.createElement("button", { className: "skp-btn-sm skp-btn-enable", onClick: () => saveGroupEdit(g) }, "保存"),
                    React.createElement("button", { className: "skp-btn-sm", onClick: () => setEditing(null) }, "取消"),
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement("span", { className: "skp-name", title: g.name, onClick: () => setGroupOpen((o) => ({ ...o, [g.name]: !isOpen })) }, g.name),
                    React.createElement("span", { className: "skp-count" }, String(members.length)),
                    React.createElement("span", { className: "skp-spacer" }),
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
