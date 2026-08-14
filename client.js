window.__ModuleLoader__.load({
  id: "dsh-skill-panel",
  factory: (require) => {
    const React = require("react")

    const CSS = `
.skp-btn {
  display: flex; align-items: center; gap: 8px;
  height: 36px; padding: 0 10px; width: 100%;
  background: transparent; border: none; cursor: pointer;
  color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 13px;
  border-radius: 8px;
}
.skp-btn:hover { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); }
.skp-btn-active { color: var(--dsw-alias-brand-primary); }
.skp-btn svg { flex: none; }
.skp-btn-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.skp-panel {
  position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
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
.skp-row-top { display: flex; align-items: center; gap: 8px; }
.skp-name { font-weight: 600; font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
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
.skp-empty, .skp-err { padding: 28px 12px; text-align: center; font-size: 13px; color: var(--dsw-alias-label-secondary); }
.skp-err { color: var(--dsw-alias-state-error-primary); }
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

    const newRpcId = () => {
      try {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
      } catch { /* fall through */ }
      return "skp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10)
    }

    /** Unary RPC against a Typert Remote endpoint (skillPanel/*). */
    const panelRpc = (method, args) => {
      const message = {
        type: "client-request",
        rpcId: newRpcId(),
        method,
        payload: { args },
      }
      const signal = typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(30000)
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

    function apply(ctx) {
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

        let body
        if (state.status === "loading") body = React.createElement("div", { className: "skp-empty" }, "加载中…")
        else if (state.status === "error") body = React.createElement("div", { className: "skp-err" }, "加载失败: " + state.error)
        else if (visible.length === 0) body = React.createElement("div", { className: "skp-empty" }, state.skills.length === 0 ? "未发现 skill" : "没有匹配的 skill")
        else body = rows

        const sourceCounts = {}
        for (const s of state.skills) {
          const key = String(s.source)
          sourceCounts[key] = sourceCounts[key] === undefined ? 1 : sourceCounts[key] + 1
        }
        const countOf = (source) => source === "all" ? state.skills.length : (sourceCounts[source] === undefined ? 0 : sourceCounts[source])
        const chips = [
          ["all", "全部"], ["user-agents", "用户 .agents"], ["user-dsh", "用户 .dsh"],
          ["project-agents", "项目 .agents"], ["project-dsh", "项目 .dsh"], ["custom", "自定义"], ["bundled", "内置"],
        ].map(([value, label]) => [value, label, countOf(value)])

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
              }, label + " (" + count + ")")),
            ),
            React.createElement("input", {
              className: "skp-input skp-search", placeholder: "搜索名称或描述…",
              value: query, onChange: (e) => setQuery(e.target.value),
            }),
            body,
          ),
        )
      }

      slots.inject("sidebar.footer.action", () => slots.register(
        { name: "sidebar.footer.action", id: "skills-panel", order: 20, label: "Skills" },
        (props) => React.createElement("button", {
          className: "skp-btn" + (useOpen() ? " skp-btn-active" : ""),
          title: "Skill 管理面板",
          "aria-label": "Skill 管理面板",
          onClick: () => setOpen(!open),
        }, icon(BOOK), props.wide ? React.createElement("span", { className: "skp-btn-label" }, "Skills") : null),
      ))

      slots.inject("shell.overlay", () => slots.register(
        { name: "shell.overlay", id: "skills-panel-overlay", order: 20 },
        (props) => React.createElement(SkillsPanel, {
          variant: "modal",
          onClose: () => setOpen(false),
          useSessions: props.useSessions,
        }),
      ))

      slots.inject("settings.section", () => slots.register(
        { name: "settings.section", id: "skills", order: 25, label: "Skills" },
        (props) => React.createElement(SkillsPanel, {
          variant: "page",
          useSessions: props.useSessions,
        }),
      ))
    }

    return { inject, apply }
  },
})
