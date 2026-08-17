// dsh-skill-panel host half: a Typert Remote service answering session-scoped
// full-field skill catalogs plus the panel's write operations (invocation
// toggles that rewrite SKILL.md frontmatter, and uninstall). The browser half
// ships via exports["./client"]; this half exists so the package is in the
// host Loader and exposes its Remote endpoints through the Typert gateway.
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
import { dirname } from 'node:path'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import z from 'zod'

export const name = 'skill-panel'
// Core read path is a hard dependency; the write operations degrade gracefully
// when fs/subprocess are absent (checked per call with ctx.get).
export const inject = ['skills', 'agents']

// Entry placement defaults. There is no "append" primitive in the slot
// mechanism: list slots sort by priority then order (ascending, stable, order
// defaults to 0), so "tail" has to be computed against the slot's LIVE entries
// at registration time (max existing order + 1) — that happens in the browser
// half. This host half only carries deployment OVERRIDES: `order` present means
// "register at this exact position", absent means "tail". Deployments override
// through the loader entry `config` (shape: { entries: { sidebar|overlay|
// settings: { enabled?, order?, slot? } } }); getConfig exposes the resolved
// values to the browser half.
const DEFAULT_ENTRIES = {
  sidebar: { enabled: true, slot: 'sidebar.footer.action' },
  overlay: { enabled: true, slot: 'shell.overlay' },
  settings: { enabled: true, slot: 'settings.section' },
}

/** Normalize a user-supplied `entries` config against the defaults. */
function normalizeEntries(config) {
  const raw = config !== null && typeof config === 'object' ? config.entries : undefined
  const out = {}
  for (const key of Object.keys(DEFAULT_ENTRIES)) {
    const base = DEFAULT_ENTRIES[key]
    const row = raw !== undefined && raw !== null && typeof raw === 'object'
      && raw[key] !== undefined && raw[key] !== null && typeof raw[key] === 'object'
      ? raw[key]
      : {}
    const entry = {
      enabled: typeof row.enabled === 'boolean' ? row.enabled : base.enabled,
      slot: typeof row.slot === 'string' && row.slot !== '' ? row.slot : base.slot,
    }
    // `order` is only carried when the deployment set it: absent means the
    // browser half registers at the dynamic tail of the slot.
    if (typeof row.order === 'number' && Number.isFinite(row.order)) entry.order = row.order
    out[key] = entry
  }
  return out
}

/** Copy one catalog entry into owned, wire-safe JSON (never live objects). */
function leafOf(s, groups) {
  return {
    name: s.name,
    description: s.description,
    whenToUse: s.whenToUse === undefined ? null : s.whenToUse,
    source: s.source,
    provider: s.provider,
    path: s.path === undefined ? null : s.path,
    modelInvocable: s.invocation.modelInvocable,
    userInvocable: s.invocation.userInvocable,
    groups: Array.isArray(groups) ? groups.slice() : [],
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

// ── skill groups: plugin-owned domain data (ctx.storageDomain) ─────────
// "组" 是 dsh-skill-panel 插件自己的数据，通过 dsh 官方领域存储
// (ctx.storageDomain) 持久化，不触碰 skill 文件、不自造存储文件：
//   - groups 表: 组名 → { description }
//   - membership 表: skill 名 → 所属组名数组（一个 skill 可属于多个组）
const GROUP_DOMAIN = defineDomain({
  name: 'skill_groups',
  version: 1,
  tables: {
    groups: domainTable(z.object({ description: z.string() })),
    membership: domainTable(z.array(z.string())),
  },
})

/** Trim one request string field to a non-empty value or ''. */
function reqStr(request, key) {
  const v = request === undefined || request === null ? undefined : request[key]
  return typeof v === 'string' ? v.trim() : ''
}

class SkillPanelService extends TypertRemoteService {
  constructor(ctx, config) {
    super(ctx, 'skillPanel')
    this.entries = normalizeEntries(config)
    this._domainPromise = undefined
  }

  /**
   * Resolved entry placement for this deployment (order absent = the browser
   * half registers that entry at the slot's dynamic tail).
   * @param request - unused; kept for the gateway's signature reflection.
   */
  async getConfig(request) {
    // The gateway derives the wire shape from this signature, so the single
    // `request` parameter must stay even though getConfig takes no input.
    void request
    return { entries: this.entries }
  }

  /**
   * Open the group domain once, lazily. Returns the domain handle, or null
   * when the storage facility is absent or open fails (panel degrades to
   * read-only group views).
   */
  ensureDomain() {
    if (this._domainPromise === undefined) {
      const facility = this.ctx.get('storageDomain')
      this._domainPromise = facility === undefined
        ? Promise.resolve(null)
        : facility.open(GROUP_DOMAIN).catch(() => null)
    }
    return this._domainPromise
  }

  /** skill name → its groups, as a plain Map (empty when storage is unavailable). */
  async membershipMap() {
    const domain = await this.ensureDomain()
    if (domain === null) return new Map()
    return new Map(domain.table('membership').entries())
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
    const membership = await this.membershipMap()

    /** Resolve each entry's on-disk path through a scoped get (summaries omit it). */
    const withPaths = async (entries, view) => Promise.all(entries.map(async (entry) => {
      const leaf = leafOf(entry, membership.get(entry.name))
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
    const membership = await this.membershipMap()
    return {
      skill: {
        ...leafOf(def, membership.get(def.name)),
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

  /** List every group with its member skill names (in definition order). */
  async groupList(request) {
    // The gateway derives the wire shape from this signature, so the single
    // `request` parameter must stay even though groupList takes no input.
    void request
    const domain = await this.ensureDomain()
    if (domain === null) return { groups: [], error: 'storage 服务不可用' }
    const groups = []
    for (const [name, rec] of domain.table('groups').entries()) {
      groups.push({ name, description: rec.description, members: [] })
    }
    for (const [skillName, gs] of domain.table('membership').entries()) {
      for (const g of gs) {
        const entry = groups.find((x) => x.name === g)
        if (entry !== undefined) entry.members.push(skillName)
      }
    }
    return { groups }
  }

  /** Create a group by name; description is optional. */
  async groupCreate(request) {
    const name = reqStr(request, 'name')
    if (name === '') return { ok: false, error: '组名不能为空' }
    const domain = await this.ensureDomain()
    if (domain === null) return { ok: false, error: 'storage 服务不可用' }
    const groupsTable = domain.table('groups')
    if (groupsTable.get(name) !== undefined) return { ok: false, error: '组「' + name + '」已存在' }
    await groupsTable.put(name, { description: reqStr(request, 'description') })
    return { ok: true }
  }

  /** Rename a group and/or change its description; membership keys follow. */
  async groupUpdate(request) {
    const name = reqStr(request, 'name')
    if (name === '') return { ok: false, error: '组名不能为空' }
    const domain = await this.ensureDomain()
    if (domain === null) return { ok: false, error: 'storage 服务不可用' }
    const groupsTable = domain.table('groups')
    const current = groupsTable.get(name)
    if (current === undefined) return { ok: false, error: '组「' + name + '」不存在' }
    const newName = reqStr(request, 'newName') || name
    const description = typeof (request === undefined || request === null ? undefined : request.description) === 'string'
      ? request.description.trim()
      : current.description
    if (newName !== name) {
      if (groupsTable.get(newName) !== undefined) return { ok: false, error: '组「' + newName + '」已存在' }
      await groupsTable.put(newName, { description })
      await groupsTable.delete(name)
      const membershipTable = domain.table('membership')
      for (const [skillName, gs] of membershipTable.entries()) {
        if (gs.includes(name)) await membershipTable.put(skillName, gs.map((g) => (g === name ? newName : g)))
      }
    } else {
      await groupsTable.put(name, { description })
    }
    return { ok: true }
  }

  /** Delete a group and remove it from every member skill. */
  async groupDelete(request) {
    const name = reqStr(request, 'name')
    if (name === '') return { ok: false, error: '组名不能为空' }
    const domain = await this.ensureDomain()
    if (domain === null) return { ok: false, error: 'storage 服务不可用' }
    const groupsTable = domain.table('groups')
    if (groupsTable.get(name) === undefined) return { ok: false, error: '组「' + name + '」不存在' }
    await groupsTable.delete(name)
    const membershipTable = domain.table('membership')
    for (const [skillName, gs] of membershipTable.entries()) {
      if (gs.includes(name)) {
        const next = gs.filter((g) => g !== name)
        if (next.length === 0) await membershipTable.delete(skillName)
        else await membershipTable.put(skillName, next)
      }
    }
    return { ok: true }
  }

  /** Add one skill to one group (validated against the scoped catalog). */
  async groupAddSkill(request) {
    const name = reqStr(request, 'name')
    const skillName = reqStr(request, 'skillName')
    if (name === '') return { ok: false, error: '组名不能为空' }
    if (skillName === '') return { ok: false, error: 'skill 名称不能为空' }
    const domain = await this.ensureDomain()
    if (domain === null) return { ok: false, error: 'storage 服务不可用' }
    if (domain.table('groups').get(name) === undefined) return { ok: false, error: '组「' + name + '」不存在' }
    if (this.ctx.get('skills') !== undefined) {
      const def = await this.resolveDefinition(skillName, request === undefined || request === null ? undefined : request.sessionId)
      if (def === undefined || def === null) return { ok: false, error: 'skill「' + skillName + '」不存在' }
    }
    const membershipTable = domain.table('membership')
    const list = membershipTable.get(skillName) ?? []
    if (!list.includes(name)) {
      await membershipTable.put(skillName, [...list, name])
    }
    return { ok: true }
  }

  /** Remove one skill from one group. */
  async groupRemoveSkill(request) {
    const name = reqStr(request, 'name')
    const skillName = reqStr(request, 'skillName')
    if (name === '' || skillName === '') return { ok: false, error: '参数不完整' }
    const domain = await this.ensureDomain()
    if (domain === null) return { ok: false, error: 'storage 服务不可用' }
    const membershipTable = domain.table('membership')
    const list = membershipTable.get(skillName)
    if (list === undefined) return { ok: true, unchanged: true }
    const next = list.filter((g) => g !== name)
    if (next.length === list.length) return { ok: true, unchanged: true }
    if (next.length === 0) await membershipTable.delete(skillName)
    else await membershipTable.put(skillName, next)
    return { ok: true }
  }
}

// Hand-rolled equivalent of TS `@Remote('...')` decorators: the decorator's
// runtime form records a marker through its context initializer.
//
// IMPORTANT: the gateway derives the wire parameter from the METHOD SIGNATURE
// (source-mode reflection) — every Remote method above must keep its single
// parameter named `request`, or the endpoint breaks.
const markerInitializers = []
for (const method of ['getConfig', 'listDetailed', 'getDetail', 'setInvocation', 'setDisabled', 'uninstall', 'groupList', 'groupCreate', 'groupUpdate', 'groupDelete', 'groupAddSkill', 'groupRemoveSkill']) {
  Remote(method)(SkillPanelService.prototype, {
    name: method,
    private: false,
    static: false,
    addInitializer: (fn) => { markerInitializers.push(fn) },
  })
}

export function apply(ctx, config) {
  const service = new SkillPanelService(ctx, config)
  for (const init of markerInitializers) init.call(service)
  // 插件卸载时关闭打开的 domain（懒打开可能尚未完成，用 promise 链等待）。
  ctx.effect(() => () => {
    if (service._domainPromise !== undefined) {
      service._domainPromise.then((domain) => {
        if (domain !== null && domain !== undefined) domain.close().catch(() => {})
      }).catch(() => {})
    }
  })
}
