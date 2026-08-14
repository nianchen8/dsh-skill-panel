// dsh-skill-panel host half: a Typert Remote service answering session-scoped
// full-field skill catalogs plus the panel's write operations (invocation
// toggles that rewrite SKILL.md frontmatter, and uninstall). The browser half
// ships via exports["./client"]; this half exists so the package is in the
// host Loader and exposes its Remote endpoints through the Typert gateway.
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import { dirname } from 'node:path'

export const name = 'skill-panel'
// Core read path is a hard dependency; the write operations degrade gracefully
// when fs/subprocess are absent (checked per call with ctx.get).
export const inject = ['skills', 'agents']

/** Copy one catalog entry into owned, wire-safe JSON (never live objects). */
function leafOf(s) {
  return {
    name: s.name,
    description: s.description,
    whenToUse: s.whenToUse === undefined ? null : s.whenToUse,
    source: s.source,
    provider: s.provider,
    path: s.path === undefined ? null : s.path,
    modelInvocable: s.invocation.modelInvocable,
    userInvocable: s.invocation.userInvocable,
  }
}

/** Locate the frontmatter block; null when the file has none. */
function splitFrontmatter(raw) {
  const lines = raw.split('\n')
  if (lines.length < 3) return null
  if (lines[0].replace(/\r$/, '') !== '---') return null
  let close = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].replace(/\r$/, '') === '---') { close = i; break }
  }
  if (close < 0) return null
  return { lines, close }
}

/** Read the pre-disable state recorded in frontmatter, or null. */
function readOrigin(raw) {
  const parsed = splitFrontmatter(raw)
  if (parsed === null) return null
  let model
  let user
  for (let i = 1; i < parsed.close; i++) {
    const line = parsed.lines[i]
    const mm = line.match(/^\s*skill-panel-origin-model\s*:\s*(true|false)\s*$/)
    if (mm !== null) model = mm[1] === 'true'
    const mu = line.match(/^\s*skill-panel-origin-user\s*:\s*(true|false)\s*$/)
    if (mu !== null) user = mu[1] === 'true'
  }
  if (model === undefined && user === undefined) return null
  return {
    model: model === undefined ? true : model,
    user: user === undefined ? true : user,
  }
}

/**
 * Rewrite a SKILL.md frontmatter block to the wanted invocation switches.
 * The invocation markers and any recorded pre-disable origin are dropped
 * first, then the "off" markers and the optional origin fields are appended;
 * every other line is preserved verbatim. Returns the edited text, or null
 * when the file has no parseable frontmatter.
 */
function rewriteFrontmatter(raw, wantModel, wantUser, origin) {
  const parsed = splitFrontmatter(raw)
  if (parsed === null) return null
  const kept = []
  for (let i = 1; i < parsed.close; i++) {
    const line = parsed.lines[i]
    if (/^\s*disable-model-invocation\s*:/.test(line)) continue
    if (/^\s*user-invocable\s*:/.test(line)) continue
    if (/^\s*skill-panel-origin-model\s*:/.test(line)) continue
    if (/^\s*skill-panel-origin-user\s*:/.test(line)) continue
    kept.push(line)
  }
  if (wantModel === false) kept.push('disable-model-invocation: true')
  if (wantUser === false) kept.push('user-invocable: false')
  if (origin !== undefined && origin !== null) {
    kept.push('skill-panel-origin-model: ' + (origin.model ? 'true' : 'false'))
    kept.push('skill-panel-origin-user: ' + (origin.user ? 'true' : 'false'))
  }
  return [parsed.lines[0], ...kept, ...parsed.lines.slice(parsed.close)].join('\n')
}

class SkillPanelService extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'skillPanel')
  }

  /** The scoped view for one session id, or null when unresolvable. */
  resolveView(sessionId) {
    const agents = this.ctx.get('agents')
    if (sessionId !== undefined && sessionId !== null && String(sessionId) !== '' && agents !== undefined) {
      const agent = agents.get(String(sessionId))
      if (agent !== undefined && agent.session !== undefined && agent.session.header !== undefined) {
        return { cwd: agent.session.header.cwd, scope: agent }
      }
    }
    return null
  }

  /** Load one skill by name through a scoped view (global fallback). */
  async resolveDefinition(name, sessionId) {
    const skills = this.ctx.get('skills')
    if (skills === undefined) return null
    const view = this.resolveView(sessionId)
    return skills.get(String(name), view === null ? {} : view)
  }

  /**
   * Nudge the browser slash menu after a panel write. The official skill menu
   * caches its catalog per session and invalidates only on preset-selection or
   * connection-reset events, so replay the preset-selected event with each
   * live session's real ids. Its listeners treat it idempotently (a session
   * note plus a directory refresh).
   */
  notifySkillCatalogChange() {
    const agents = this.ctx.get('agents')
    if (agents === undefined) return
    for (const agent of agents.list()) {
      try {
        if (agent === undefined || agent.session === undefined || agent.session.header === undefined) continue
        const preset = agent.session.header.agentPreset
        if (typeof preset !== 'string' || preset === '') continue
        let sid
        try { sid = String(agent.id) } catch { continue }
        this.ctx.emit('agent-preset/selected', sid, preset)
      } catch { /* best-effort */ }
    }
  }

  /**
   * Full-field skill catalog for the current panel view.
   * @param request - { sessionId?: string }
   */
  async listDetailed(request) {
    const skills = this.ctx.get('skills')
    const agents = this.ctx.get('agents')
    if (skills === undefined) return { skills: [], error: 'skill 注册表不可用' }

    const sessionId = request === undefined || request === null ? null : request.sessionId
    const viewOf = (agent) => ({ cwd: agent.session.header.cwd, scope: agent })

    /** Resolve each entry's on-disk path through a scoped get (summaries omit it). */
    const withPaths = async (entries, view) => Promise.all(entries.map(async (entry) => {
      const leaf = leafOf(entry)
      try {
        const def = await skills.get(entry.name, view)
        if (def !== undefined && typeof def.path === 'string' && def.path !== '') {
          leaf.path = def.path
        }
      } catch { /* keep the summary path (usually null) */ }
      return leaf
    }))

    // 1. Exact session scope (the same view the model catalog uses).
    if (sessionId !== null && sessionId !== undefined && String(sessionId) !== '' && agents !== undefined) {
      const agent = agents.get(String(sessionId))
      if (agent !== undefined && agent.session !== undefined && agent.session.header !== undefined) {
        const view = viewOf(agent)
        const snap = await skills.snapshot(view)
        return { skills: await withPaths(snap.skills, view) }
      }
    }

    // 2. Merge across every live agent, deduped by name (keeping each view).
    if (agents !== undefined) {
      const seen = new Map()
      let any = false
      for (const a of agents.list()) {
        try {
          if (a === undefined || a.session === undefined || a.session.header === undefined) continue
          const view = viewOf(a)
          const snap = await skills.snapshot(view)
          any = true
          for (const s of snap.skills) {
            if (!seen.has(s.name)) seen.set(s.name, { entry: s, view })
          }
        } catch { /* one bad view must not kill the merge */ }
      }
      if (any) {
        return {
          skills: await Promise.all(Array.from(seen.values()).map(({ entry, view }) =>
            withPaths([entry], view).then((rows) => rows[0]),
          )),
        }
      }
    }

    // 3. Global layer.
    const snap = await skills.snapshot({})
    return { skills: await withPaths(snap.skills, {}) }
  }

  /**
   * Full body of one skill, for the expanded detail view.
   * @param request - { sessionId?: string, name: string }
   */
  async getDetail(request) {
    const def = await this.resolveDefinition(request.name, request.sessionId)
    if (def === undefined || def === null) return { skill: null, error: 'skill 不存在' }
    return {
      skill: {
        ...leafOf(def),
        content: String(def.content === undefined ? '' : def.content).slice(0, 50000),
      },
    }
  }

  /**
   * Toggle one invocation switch by rewriting SKILL.md frontmatter.
   * @param request - { sessionId?: string, name: string, modelInvocable?: boolean, userInvocable?: boolean }
   */
  async setInvocation(request) {
    const fs = this.ctx.get('fs')
    if (fs === undefined) return { ok: false, error: 'fs 服务不可用' }
    const wantModel = request.modelInvocable
    const wantUser = request.userInvocable
    if (typeof wantModel !== 'boolean' && typeof wantUser !== 'boolean') {
      return { ok: false, error: '缺少要切换的开关' }
    }
    const def = await this.resolveDefinition(request.name, request.sessionId)
    if (def === undefined || def === null) return { ok: false, error: 'skill 不存在' }
    if (def.path === undefined || def.path === null || def.path === '') {
      return { ok: false, error: '该 skill 没有本地文件,无法切换' }
    }
    if (def.source === 'bundled') return { ok: false, error: '内置 skill 不可修改' }
    const current = def.invocation
    const nextModel = typeof wantModel === 'boolean' ? wantModel : current.modelInvocable
    const nextUser = typeof wantUser === 'boolean' ? wantUser : current.userInvocable
    if (!nextModel && !nextUser) {
      return { ok: false, error: '模型可用与用户可用至少保留一个启用' }
    }
    try {
      const target = await fs.resolve(def.path)
      const raw = await fs.readText(target)
      // Merge with the current state so an unspecified switch is preserved,
      // and clear any stale pre-disable origin (the skill is now hand-tuned).
      const edited = rewriteFrontmatter(raw, nextModel, nextUser, undefined)
      if (edited === null) return { ok: false, error: 'frontmatter 解析失败,未修改任何内容' }
      if (edited === raw) return { ok: true, unchanged: true }
      await fs.writeText(target, edited)
      // First-party write: invalidate skill discovery synchronously so the
      // next listDetailed already sees the new frontmatter (the file watcher
      // has latency, which used to make the first click look like a no-op).
      try {
        const info = await fs.stat(target)
        this.ctx.emit('fs/observed', target, {
          kind: 'present',
          version: info !== undefined && typeof info.version === 'string' && info.version !== '' ? info.version : 'v1',
        }, { name: 'write' })
      } catch { /* invalidation is best-effort */ }
      this.notifySkillCatalogChange()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: '写入失败: ' + String((error && error.message) || error) }
    }
  }

  /**
   * Fully disable one skill (both switches off, previous state recorded) or
   * re-enable it by restoring the recorded pre-disable state.
   * @param request - { sessionId?: string, name: string, disabled: boolean }
   */
  async setDisabled(request) {
    const fs = this.ctx.get('fs')
    if (fs === undefined) return { ok: false, error: 'fs 服务不可用' }
    const disabled = request.disabled
    if (typeof disabled !== 'boolean') return { ok: false, error: '缺少 disabled 参数' }
    const def = await this.resolveDefinition(request.name, request.sessionId)
    if (def === undefined || def === null) return { ok: false, error: 'skill 不存在' }
    if (def.path === undefined || def.path === null || def.path === '') {
      return { ok: false, error: '该 skill 没有本地文件,无法切换' }
    }
    if (def.source === 'bundled') return { ok: false, error: '内置 skill 不可修改' }
    try {
      const target = await fs.resolve(def.path)
      const raw = await fs.readText(target)
      let edited
      if (disabled) {
        const current = def.invocation
        if (!current.modelInvocable && !current.userInvocable) return { ok: true, unchanged: true }
        edited = rewriteFrontmatter(raw, false, false, {
          model: current.modelInvocable,
          user: current.userInvocable,
        })
      } else {
        const origin = readOrigin(raw)
        const wantModel = origin === null ? true : origin.model
        const wantUser = origin === null ? true : origin.user
        edited = rewriteFrontmatter(raw, wantModel, wantUser, undefined)
      }
      if (edited === null) return { ok: false, error: 'frontmatter 解析失败,未修改任何内容' }
      if (edited === raw) return { ok: true, unchanged: true }
      await fs.writeText(target, edited)
      try {
        const info = await fs.stat(target)
        this.ctx.emit('fs/observed', target, {
          kind: 'present',
          version: info !== undefined && typeof info.version === 'string' && info.version !== '' ? info.version : 'v1',
        }, { name: 'write' })
      } catch { /* invalidation is best-effort */ }
      this.notifySkillCatalogChange()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: '写入失败: ' + String((error && error.message) || error) }
    }
  }

  /**
   * Delete one skill's on-disk files (SKILL.md bundle = whole directory,
   * flat file = the file only).
   * @param request - { sessionId?: string, name: string }
   */
  async uninstall(request) {
    const subprocess = this.ctx.get('subprocess')
    if (subprocess === undefined) return { ok: false, error: 'subprocess 服务不可用' }
    const def = await this.resolveDefinition(request.name, request.sessionId)
    if (def === undefined || def === null) return { ok: false, error: 'skill 不存在' }
    if (def.path === undefined || def.path === null || def.path === '') {
      return { ok: false, error: '该 skill 没有本地文件,无法卸载' }
    }
    if (def.source === 'bundled') return { ok: false, error: '内置 skill 不可卸载' }
    const deleteTarget = /SKILL\.md$/i.test(def.path) ? dirname(def.path) : def.path
    const fs = this.ctx.get('fs')
    let observeTarget
    if (fs !== undefined) {
      try { observeTarget = await fs.resolve(def.path) } catch { observeTarget = undefined }
    }
    try {
      const powershell = await subprocess.resolveExecutable('powershell')
      const handle = subprocess.spawn({
        argv: [powershell, '-NoProfile', '-Command',
          "Remove-Item -LiteralPath '" + deleteTarget.replace(/'/g, "''") + "' -Recurse -Force"],
        stdio: {
          stdin: 'ignore',
          stdout: { maxBytes: 8000, spill: { maxBytes: 64000 } },
          stderr: { maxBytes: 8000, spill: { maxBytes: 64000 } },
        },
        graceMs: 5000,
      })
      const outcome = await handle.done
      if (outcome.exitCode !== 0) {
        return { ok: false, error: '删除失败 (exit ' + outcome.exitCode + ')' }
      }
      // First-party deletion: invalidate skill discovery synchronously.
      if (observeTarget !== undefined) {
        try { this.ctx.emit('fs/observed', observeTarget, { kind: 'absent' }, { name: 'write' }) } catch { /* best-effort */ }
      }
      this.notifySkillCatalogChange()
      return { ok: true }
    } catch (error) {
      return { ok: false, error: '卸载失败: ' + String((error && error.message) || error) }
    }
  }
}

// Hand-rolled equivalent of TS `@Remote('...')` decorators: the decorator's
// runtime form records a marker through its context initializer.
//
// IMPORTANT: the gateway derives the wire parameter from the METHOD SIGNATURE
// (source-mode reflection) — every Remote method above must keep its single
// parameter named `request`, or the endpoint breaks.
const markerInitializers = []
for (const method of ['listDetailed', 'getDetail', 'setInvocation', 'setDisabled', 'uninstall']) {
  Remote(method)(SkillPanelService.prototype, {
    name: method,
    private: false,
    static: false,
    addInitializer: (fn) => { markerInitializers.push(fn) },
  })
}

export function apply(ctx) {
  const service = new SkillPanelService(ctx)
  for (const init of markerInitializers) init.call(service)
}
