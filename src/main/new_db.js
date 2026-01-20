import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

const schema = {
  conversations: {
    columns: {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      conversation_type: 'INTEGER NOT NULL',
      target: 'TEXT NOT NULL',
      line: 'INTEGER  DEFAULT 0',
      receiver_portrait: 'TEXT',
      receiver_alias: 'TEXT',
      group_portrait: 'TEXT',
      group_alias: 'TEXT',
      // last_message_id: "TEXT DEFAULT ''",
      is_top: 'INTEGER DEFAULT 0'
    },
    constraints: ['UNIQUE(conversation_type, target, line)'],
    indexes: [
      {
        name: 'idx_conversations_main',
        fields: ['conversation_type', 'target', 'line']
      }
    ]
  },
  messages: {
    columns: {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      message_id: 'TEXT NOT NULL UNIQUE',

      conversation_type: 'INTEGER NOT NULL',
      conversation_target: 'TEXT NOT NULL',
      line: 'INTEGER DEFAULT 0',

      sender: 'TEXT NOT NULL',

      payload_type: 'INTEGER NOT NULL',
      searchable_content: 'TEXT',
      push_content: 'TEXT',
      push_data: 'TEXT',
      content: 'TEXT',
      base64ed_data: 'TEXT',
      media_type: 'INTEGER DEFAULT 0',
      remote_media_url: 'TEXT',
      persist_flag: 'INTEGER DEFAULT 0',
      expire_duration: 'INTEGER DEFAULT 0',
      mentioned_type: 'INTEGER DEFAULT 0',
      mentioned_target: 'TEXT',
      extra: 'TEXT',
      is_read: 'INTEGER DEFAULT 0',

      timestamp: 'INTEGER NOT NULL'
    },
    indexes: [
      {
        name: 'idx_messages_conversation_time',
        fields: ['conversation_type', 'conversation_target', 'line', 'timestamp']
      },
      {
        name: 'idx_messages_message_id',
        fields: ['message_id']
      }
    ]
  }
}
const convert_db_msg_to_json = (row) => {
  return {
    messageId: row.message_id,
    sender: row.sender,
    conv: {
      type: row.conversation_type,
      target: row.conversation_target,
      line: row.line
    },
    payload: {
      base64edData: row.base64ed_data,
      type: row.payload_type,
      searchableContent: row.searchable_content,
      pushContent: row.push_content,
      pushData: row.push_data,
      content: row.content,
      mediaType: row.media_type,
      remoteMediaUrl: row.remote_media_url,
      persistFlag: row.persist_flag,
      expireDuration: row.expire_duration,
      mentionedType: row.mentioned_type,
      mentionedTarget: row.mentioned_target ? JSON.parse(row.mentioned_target) : [],
      extra: row.extra
    },
    toUsers: [],
    timestamp: row.timestamp
  }
}
/** ✅ 自动生成 CREATE TABLE SQL */
function buildCreateTableSQL(tableName, def) {
  const colLines = Object.entries(def.columns).map(([name, type]) => `  ${name} ${type}`)
  const constraintLines = def.constraints?.map((c) => `  ${c}`) ?? []

  return `
CREATE TABLE IF NOT EXISTS ${tableName} (
${[...colLines, ...constraintLines].join(',\n')}
);
`
}

/** ✅ 自动生成 CREATE INDEX SQL */
function buildCreateIndexSQL(tableName, indexes = []) {
  return indexes
    .map(
      (idx) => `
CREATE INDEX IF NOT EXISTS ${idx.name}
ON ${tableName}(${idx.fields.join(', ')});
`
    )
    .join('\n')
}
class DB {
  constructor(userId) {
    this.userId = userId
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, `db_${userId}.sqlite3`)
    this.dbPath = dbPath
    this.version = 1
    this.init()
  }
  init() {
    this.versionCheck()
    this.db = new Database(this.dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('synchronous = NORMAL')
    this.db.pragma('foreign_keys = ON')
    console.log('Database opened successfully.')
    this.createTable()
    this.setUserVersion(this.version)
  }
  close() {
    if (this.db) {
      this.db.close()
      console.log('Database connection closed.')
    }
  }
  disconnect() {
    this.close()
  }
  versionCheck() {
    if (!fs.existsSync(this.dbPath)) {
      console.log('Database file does not exist. No version check needed.')
      return
    }

    const tmpDb = new Database(this.dbPath)
    const oldVersion = tmpDb.prepare(`PRAGMA user_version`).get().user_version || 0
    tmpDb.close()

    if (oldVersion !== this.version) {
      console.log(`DB version changed, rebuilding DB. old=${oldVersion}, new=${this.version}`)
      fs.unlinkSync(this.dbPath)
    } else {
      console.log(`Database version is up-to-date (version: ${oldVersion}).`)
    }
  }
  rebuildDatabase() {
    console.log('Manual rebuild database...')
    this.close()

    if (fs.existsSync(this.dbPath)) {
      fs.unlinkSync(this.dbPath)
      console.log('Database deleted:', this.dbPath)
    }

    this.init()
  }

  getUserVersion() {
    const row = this.db.prepare(`PRAGMA user_version`).get()
    return row.user_version || 0
  }

  setUserVersion(version) {
    this.db.prepare(`PRAGMA user_version = ${version}`).run()
    console.log(`Database user_version set to ${version}.`)
  }
  createTable() {
    console.log('Creating tables if not exist...')

    for (const [tableName, def] of Object.entries(schema)) {
      const createTableSQL = buildCreateTableSQL(tableName, def)
      const indexSQL = buildCreateIndexSQL(tableName, def.indexes)

      this.db.exec(createTableSQL)
      if (indexSQL) this.db.exec(indexSQL)
    }

    console.log('Tables & indexes created successfully.')
  }
  getAllConversations() {
    const stmt = this.db.prepare(`SELECT * FROM conversations`)
    const rows = stmt.all()
    const lastMsgStmt = this.db.prepare(`
      SELECT * FROM messages
      WHERE conversation_type = ?
        AND conversation_target = ?
        AND line = ?
      ORDER BY timestamp DESC
      LIMIT 1
    `)
    const unreadStmt = this.db.prepare(`
      SELECT COUNT(*) AS cnt
      FROM messages
      WHERE conversation_type = ?
        AND conversation_target = ?
        AND line = ?
        AND is_read = 0
        AND sender != ?
    `)
    return rows.map((conv) => {
      const lastMsg = lastMsgStmt.get(conv.conversation_type, conv.target, conv.line)
      const unreadCountRow = unreadStmt.get(
        conv.conversation_type,
        conv.target,
        conv.line,
        this.userId
      )
      return {
        conversationType: conv.conversation_type,
        target: conv.target,
        line: conv.line,

        receiverPortrait: conv.receiver_portrait,
        receiverAlias: conv.receiver_alias,

        groupPortrait: conv.group_portrait,
        groupAlias: conv.group_alias,
        lastMessage: lastMsg ? convert_db_msg_to_json(lastMsg) : null,
        unreadCount: unreadCountRow.cnt,
        isTop: conv.is_top
      }
    })
  }
  getMessagesByConversation(data) {
    const { conversationType, target, line, limit = 20, beforeTimestamp = null } = data
    let sql = `
      SELECT *
      FROM messages
      WHERE conversation_type = ?
        AND conversation_target = ?
        AND line = ?
    `
    const params = [conversationType, target, line]

    if (beforeTimestamp) {
      sql += ` AND timestamp < ?`
      params.push(beforeTimestamp)
    }

    sql += `
      ORDER BY timestamp DESC
      LIMIT ?
    `
    params.push(limit)
    const rows = this.db.prepare(sql).all(...params)
    // 将回话的说有已读消息标记为已读并统计Ids
    const getUnreadIdsStmt = this.db.prepare(`
      SELECT message_id FROM messages
      WHERE conversation_type = ?
        AND conversation_target = ?
        AND line = ?
        AND is_read = 0
        AND sender != ?
    `)
    const unreadRows = getUnreadIdsStmt.all(conversationType, target, line, this.userId)
    const unreadIds = unreadRows.map((r) => r.message_id)
    const markReadStmt = this.db.prepare(`
      UPDATE messages
      SET is_read = 1
      WHERE conversation_type = ?
        AND conversation_target = ?
        AND line = ?
        AND is_read = 0
        AND sender != ?
    `)
    markReadStmt.run(conversationType, target, line, this.userId)

    return {
      messages: rows.map((row) => convert_db_msg_to_json(row)).reverse(),
      markedReadIds: unreadIds
    }
  }
  upsertConversations(convs = []) {
    if (!Array.isArray(convs) || convs.length === 0) return

    const stmt = this.db.prepare(`
    INSERT INTO conversations (
      conversation_type,
      target,
      line,
      receiver_portrait,
      receiver_alias,
      group_portrait,
      group_alias,
      is_top
    )
    VALUES (
      @conversation_type,
      @target,
      @line,
      @receiver_portrait,
      @receiver_alias,
      @group_portrait,
      @group_alias,
      @is_top
    )
    ON CONFLICT(conversation_type, target, line)
    DO UPDATE SET
      receiver_portrait = COALESCE(NULLIF(excluded.receiver_portrait, ''), conversations.receiver_portrait),
      receiver_alias = COALESCE(NULLIF(excluded.receiver_alias, ''), conversations.receiver_alias),
      group_portrait = COALESCE(NULLIF(excluded.group_portrait, ''), conversations.group_portrait),
      group_alias = COALESCE(NULLIF(excluded.group_alias, ''), conversations.group_alias),
      is_top= excluded.is_top
  `)

    const runMany = this.db.transaction((items) => {
      for (const c of items) {
        stmt.run({
          conversation_type: c.conversationType,
          target: c.target,
          line: c.line ?? 0,

          receiver_portrait: c.receiverPortrait ?? null,
          receiver_alias: c.receiverAlias ?? null,

          group_portrait: c.groupPortrait ?? null,
          group_alias: c.groupAlias ?? null,

          is_top: c.isTop ? 1 : 0
        })
      }
    })

    runMany(convs)
  }
  upsertMessages(messages = []) {
    if (!Array.isArray(messages) || messages.length === 0) return

    const stmt = this.db.prepare(`
    INSERT INTO messages (
      message_id,
      conversation_type,
      conversation_target,
      line,
      sender,
      payload_type,
      searchable_content,
      push_content,
      push_data,
      content,
      base64ed_data,
      media_type,
      remote_media_url,
      persist_flag,
      expire_duration,
      mentioned_type,
      mentioned_target,
      extra,
      is_read,
      timestamp
    )
    VALUES (
      @message_id,
      @conversation_type,
      @conversation_target,
      @line,
      @sender,
      @payload_type,
      @searchable_content,
      @push_content,
      @push_data,
      @content,
      @base64ed_data,
      @media_type,
      @remote_media_url,
      @persist_flag,
      @expire_duration,
      @mentioned_type,
      @mentioned_target,
      @extra,
      @is_read,
      @timestamp
    )
    ON CONFLICT(message_id)
    DO UPDATE SET
      -- 这些字段“新值有就覆盖，没有就保留旧值”
      conversation_type = COALESCE(excluded.conversation_type, messages.conversation_type),
      conversation_target = COALESCE(NULLIF(excluded.conversation_target, ''), messages.conversation_target),
      line = COALESCE(excluded.line, messages.line),

      sender = COALESCE(NULLIF(excluded.sender, ''), messages.sender),

      payload_type = COALESCE(excluded.payload_type, messages.payload_type),
      searchable_content = COALESCE(NULLIF(excluded.searchable_content, ''), messages.searchable_content),
      push_content = COALESCE(NULLIF(excluded.push_content, ''), messages.push_content),
      push_data = COALESCE(NULLIF(excluded.push_data, ''), messages.push_data),
      content = COALESCE(NULLIF(excluded.content, ''), messages.content),
      base64ed_data = COALESCE(NULLIF(excluded.base64ed_data, ''), messages.base64ed_data),

      media_type = COALESCE(excluded.media_type, messages.media_type),
      remote_media_url = COALESCE(NULLIF(excluded.remote_media_url, ''), messages.remote_media_url),

      persist_flag = COALESCE(excluded.persist_flag, messages.persist_flag),
      expire_duration = COALESCE(excluded.expire_duration, messages.expire_duration),

      mentioned_type = COALESCE(excluded.mentioned_type, messages.mentioned_type),
      mentioned_target = COALESCE(NULLIF(excluded.mentioned_target, ''), messages.mentioned_target),
      extra = COALESCE(NULLIF(excluded.extra, ''), messages.extra),

      -- 已读字段建议“只升不降”：旧=1 就不要被覆盖回 0
      is_read = CASE
        WHEN messages.is_read = 1 THEN 1
        ELSE excluded.is_read
      END,

      -- 时间戳一般用新的（如果你希望保留老的也可以改成 COALESCE）
      timestamp = COALESCE(excluded.timestamp, messages.timestamp)
  `)

    const runMany = this.db.transaction((items) => {
      for (const m of items) {
        stmt.run({
          message_id: m.messageId,

          conversation_type: m.conv?.type ?? null,
          conversation_target: m.conv?.target ?? '',
          line: m.conv?.line ?? 0,

          sender: m.sender ?? '',

          payload_type: m.payload?.type ?? null,
          searchable_content: m.payload?.searchableContent ?? null,
          push_content: m.payload?.pushContent ?? null,
          push_data: m.payload?.pushData ?? null,
          content: m.payload?.content ?? null,
          base64ed_data: m.payload?.base64edData ?? null,

          media_type: m.payload?.mediaType ?? 0,
          remote_media_url: m.payload?.remoteMediaUrl ?? null,

          persist_flag: m.payload?.persistFlag ?? 0,
          expire_duration: m.payload?.expireDuration ?? 0,

          mentioned_type: m.payload?.mentionedType ?? 0,
          mentioned_target: m.payload?.mentionedTarget
            ? JSON.stringify(m.payload.mentionedTarget)
            : null,

          extra: m.payload?.extra ?? null,

          is_read: m.isRead ? 1 : 0,

          timestamp: m.timestamp ?? Date.now()
        })
      }
    })

    runMany(messages)
  }
  deleteMessagesByIds(ids = []) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { ok: false, changes: 0, error: 'No IDs provided', stack: '' }
      }

      const placeholders = ids.map(() => '?').join(', ')
      const sql = `DELETE FROM messages WHERE message_id IN (${placeholders})`
      const info = this.db.prepare(sql).run(...ids)

      return { ok: true, changes: info.changes }
    } catch (err) {
      console.error('❌ deleteMessagesByIds 失败原因:', err)
      return {
        ok: false,
        changes: 0,
        error: err.message, // 失败原因（最关键）
        stack: err.stack // 堆栈（定位更精准）
      }
    }
  }

  setConversationTop(conversationType, target, line, isTop) {
    const stmt = this.db.prepare(`
    UPDATE conversations
    SET is_top = ?
    WHERE conversation_type = ?
      AND target = ?
      AND line = ?
  `)

    stmt.run(isTop ? 1 : 0, conversationType, target, line)
  }
}

export default DB
