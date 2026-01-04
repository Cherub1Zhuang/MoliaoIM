import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
class DB {
  constructor(userId) {
    this.userId = userId
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, `db_${userId}.sqlite3`)
    this.dbPath = dbPath
    this.init()
  }
  init() {
    console.log('Database path:', this.dbPath)
    console.log('Initializing database for user:', this.userId)
    this.db = new Database(this.dbPath)
    console.log('Database opened successfully.')
    this.createTable()
  }
  createTable() {
    console.log('Creating tables if not exist...')

    this.db.exec(`
    -- 会话表
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_type INTEGER NOT NULL,
      target TEXT NOT NULL,
      line INTEGER DEFAULT 0,
      receiver_portrait TEXT,
      receiver_alias TEXT,
      last_message_id INTEGER DEFAULT 0,
      last_message_sender TEXT,
      last_message_content TEXT,
      last_message_time INTEGER DEFAULT 0,
      is_top INTEGER DEFAULT 0,
      unread_count INTEGER DEFAULT 0,
      UNIQUE(conversation_type, target, line)
    );

    -- 消息表
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id INTEGER NOT NULL UNIQUE,

      conversation_type INTEGER NOT NULL,
      conversation_target TEXT NOT NULL,
      line INTEGER DEFAULT 0,

      sender TEXT NOT NULL,

      payload_type INTEGER NOT NULL,
      searchable_content TEXT,
      push_content TEXT,
      push_data TEXT,
      content TEXT,
      media_type INTEGER DEFAULT 0,
      remote_media_url TEXT,
      persist_flag INTEGER DEFAULT 0,
      expire_duration INTEGER DEFAULT 0,
      mentioned_type INTEGER DEFAULT 0,
      mentioned_target TEXT,
      extra TEXT,

      timestamp INTEGER NOT NULL
    );

    -- 会话索引
    CREATE INDEX IF NOT EXISTS idx_conversations_main
    ON conversations(conversation_type, target, line);

    CREATE INDEX IF NOT EXISTS idx_conversations_sort
    ON conversations(is_top, last_message_time);

    -- 消息索引（核心）
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_time
    ON messages(conversation_type, conversation_target, line, timestamp);

    CREATE INDEX IF NOT EXISTS idx_messages_message_id
    ON messages(message_id);
  `)

    console.log('Tables & indexes created successfully.')
  }
  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close()
      console.log('Database connection closed.')
    }
  }
  // 读取所有会话
  getAllConversations() {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations
      ORDER BY is_top DESC, last_message_time DESC
    `)
    const rows = stmt.all()
    return rows.map((row) => ({
      conversationType: row.conversation_type,
      target: row.target,
      line: row.line,
      receiverPortrait: row.receiver_portrait,
      receiverAlias: row.receiver_alias,
      lastMessageId: row.last_message_id,
      lastMessageSender: row.last_message_sender,
      lastMessageContent: row.last_message_content,
      lastMessageTime: row.last_message_time,
      isTop: row.is_top,
      unreadCount: row.unread_count
    }))
  }
  // 读取单个回话
  getConversation(conversationType, target, line) {
    const stmt = this.db.prepare(`
      SELECT * FROM conversations
      WHERE conversation_type = ? AND target = ? AND line = ?
    `)
    const row = stmt.get(conversationType, target, line)
    if (!row) return null
    return {
      conversationType: row.conversation_type,
      target: row.target,
      line: row.line,
      receiverPortrait: row.receiver_portrait,
      receiverAlias: row.receiver_alias,
      lastMessageId: row.last_message_id,
      lastMessageSender: row.last_message_sender,
      lastMessageContent: row.last_message_content,
      lastMessageTime: row.last_message_time,
      isTop: row.is_top,
      unreadCount: row.unread_count
    }
  }
  // 查询指定会话的消息
  getMessagesByConversation({
    conversationType,
    target,
    line,
    limit = 30,
    beforeTimestamp = null
  }) {
    let sql = `
    SELECT *
    FROM messages
    WHERE
      conversation_type = ?
      AND conversation_target = ?
      AND line = ?
  `

    const args = [conversationType, target, line]

    // 👇 有时间戳 → 向上翻历史
    if (beforeTimestamp) {
      sql += ` AND timestamp < ? `
      args.push(beforeTimestamp)
    }

    // 👇 先倒序取最新 limit 条（走索引，性能最好）
    sql += `
    ORDER BY timestamp DESC
    LIMIT ?
  `
    args.push(limit)

    const rows = this.db.prepare(sql).all(...args)

    // 👇 翻转为 ASC，UI 正常渲染
    return rows.reverse().map((row) => ({
      messageId: row.message_id,
      sender: row.sender,
      conv: {
        type: row.conversation_type,
        target: row.conversation_target,
        line: row.line
      },
      payload: {
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
    }))
  }

  upsertConversation(conversation) {
    const insertStmt = this.db.prepare(`
    INSERT OR IGNORE INTO conversations (
      conversation_type,
      target,
      line,
      receiver_alias,
      receiver_portrait,
      last_message_id,
      last_message_sender,
      last_message_content,
      last_message_time,
      is_top,
      unread_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    const updateStmt = this.db.prepare(`
    UPDATE conversations
    SET
      receiver_alias = COALESCE(?, receiver_alias),
      receiver_portrait = COALESCE(?, receiver_portrait),
      last_message_id = COALESCE(?, last_message_id),
      last_message_sender = COALESCE(?, last_message_sender),
      last_message_content = COALESCE(?, last_message_content),
      last_message_time = COALESCE(?, last_message_time),
      is_top = COALESCE(?, is_top),
      unread_count = COALESCE(?, unread_count)
    WHERE
      conversation_type = ?
      AND target = ?
      AND line = ?
  `)

    // 1️⃣ 不存在则插入
    insertStmt.run(
      conversation.conversationType,
      conversation.target,
      conversation.line,
      conversation.receiverAlias ?? null,
      conversation.receiverPortrait ?? null,
      conversation.lastMessageId ?? 0,
      conversation.lastMessageSender ?? null,
      conversation.lastMessageContent ?? null,
      conversation.lastMessageTime ?? 0,
      conversation.isTop ?? 0,
      conversation.unreadCount ?? 0
    )

    // 2️⃣ 已存在则更新
    updateStmt.run(
      conversation.receiverAlias ?? null,
      conversation.receiverPortrait ?? null,
      conversation.lastMessageId ?? null,
      conversation.lastMessageSender ?? null,
      conversation.lastMessageContent ?? null,
      conversation.lastMessageTime ?? null,
      conversation.conversationType,
      conversation.target,
      conversation.line,
      conversation.isTop ?? null,
      conversation.unreadCount ?? null
    )
  }
  upsertConversations(conversations = []) {
    if (!Array.isArray(conversations) || conversations.length === 0) return

    // ① 查询最新一条消息
    const lastMsgStmt = this.db.prepare(`
    SELECT
      message_id,
      sender,
      content,
      timestamp
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `)

    // ② 统计未读数量（extra IS NULL）
    const unreadCountStmt = this.db.prepare(`
    SELECT COUNT(*) as cnt
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
      AND extra IS NULL
  `)

    // ③ 判断 conversation 是否存在（只看 type + target）
    const existsStmt = this.db.prepare(`
    SELECT 1
    FROM conversations
    WHERE conversation_type = ?
      AND target = ?
    LIMIT 1
  `)

    // ④ 插入
    const insertStmt = this.db.prepare(`
    INSERT INTO conversations (
      conversation_type,
      target,
      line,
      receiver_alias,
      receiver_portrait,
      last_message_id,
      last_message_sender,
      last_message_content,
      last_message_time,
      is_top,
      unread_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    // ⑤ 更新
    const updateStmt = this.db.prepare(`
    UPDATE conversations
    SET
      line = ?,
      receiver_alias = ?,
      receiver_portrait = ?,
      last_message_id = ?,
      last_message_sender = ?,
      last_message_content = ?,
      last_message_time = ?,
      is_top = ?,
      unread_count = ?
    WHERE conversation_type = ?
      AND target = ?
  `)

    const tx = this.db.transaction((list) => {
      for (const c of list) {
        if (c.conversationType === undefined || !c.target) continue

        // 🔹 查询最后一条消息
        const lastMsg = lastMsgStmt.get(c.conversationType, c.target)

        let lastMessageId = 0
        let lastMessageSender = ''
        let lastMessageContent = ''
        let lastMessageTime = 0

        if (lastMsg) {
          lastMessageId = lastMsg.message_id
          lastMessageSender = lastMsg.sender
          lastMessageContent = lastMsg.content || ''
          lastMessageTime = lastMsg.timestamp || 0
        }

        // 🔹 统计未读
        const unreadRow = unreadCountStmt.get(c.conversationType, c.target)
        const unreadCount = unreadRow?.cnt || 0

        const exists = existsStmt.get(c.conversationType, c.target)

        if (exists) {
          // ✅ 已存在 → UPDATE
          updateStmt.run(
            c.line ?? 0,
            c.receiverAlias ?? null,
            c.receiverPortrait ?? null,
            lastMessageId,
            lastMessageSender,
            lastMessageContent,
            lastMessageTime,
            c.isTop ?? 0,
            unreadCount,
            c.conversationType,
            c.target
          )
        } else {
          // ✅ 不存在 → INSERT
          insertStmt.run(
            c.conversationType,
            c.target,
            c.line ?? 0,
            c.receiverAlias ?? null,
            c.receiverPortrait ?? null,
            lastMessageId,
            lastMessageSender,
            lastMessageContent,
            lastMessageTime,
            c.isTop ?? 0,
            unreadCount
          )
        }
      }
    })

    tx(conversations)
  }

  upsertMessage(msg) {
    if (!msg || !msg.messageId || !msg.conv) return

    const stmt = this.db.prepare(`
    INSERT OR IGNORE INTO messages (
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
      media_type,
      remote_media_url,
      persist_flag,
      expire_duration,
      mentioned_type,
      mentioned_target,
      extra,
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    stmt.run(
      msg.messageId,
      msg.conv.type,
      msg.conv.target,
      msg.conv.line ?? 0,
      msg.sender,

      msg.payload.type,
      msg.payload.searchableContent ?? null,
      msg.payload.pushContent ?? null,
      msg.payload.pushData ?? null,
      msg.payload.content ?? null,
      msg.payload.mediaType ?? 0,
      msg.payload.remoteMediaUrl ?? null,
      msg.payload.persistFlag ?? 0,
      msg.payload.expireDuration ?? 0,
      msg.payload.mentionedType ?? 0,
      msg.payload.mentionedTarget ? JSON.stringify(msg.payload.mentionedTarget) : null,
      msg.payload.extra ?? null,

      msg.timestamp
    )
  }
  upsertMessages(messages = []) {
    if (!Array.isArray(messages) || messages.length === 0) return

    const stmt = this.db.prepare(`
    INSERT OR IGNORE INTO messages (
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
      media_type,
      remote_media_url,
      persist_flag,
      expire_duration,
      mentioned_type,
      mentioned_target,
      extra,
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    const tx = this.db.transaction((list) => {
      for (const msg of list) {
        if (!msg || !msg.messageId || !msg.conv) continue

        stmt.run(
          msg.messageId,
          msg.conv.type,
          msg.conv.target,
          msg.conv.line ?? 0,
          msg.sender,

          msg.payload.type,
          msg.payload.searchableContent ?? null,
          msg.payload.pushContent ?? null,
          msg.payload.pushData ?? null,
          msg.payload.content ?? null,
          msg.payload.mediaType ?? 0,
          msg.payload.remoteMediaUrl ?? null,
          msg.payload.persistFlag ?? 0,
          msg.payload.expireDuration ?? 0,
          msg.payload.mentionedType ?? 0,
          msg.payload.mentionedTarget ? JSON.stringify(msg.payload.mentionedTarget) : null,
          msg.payload.extra ?? null,

          msg.timestamp
        )
      }
    })

    tx(messages)
  }
  filterNewMessagesAndUpsert(messages = []) {
    if (!Array.isArray(messages) || messages.length === 0) return []
    const messagesIds = messages.map((msg) => msg.messageId)
    const placeholders = messagesIds.map(() => '?').join(', ')
    const existedRows = this.db
      .prepare(
        `
        SELECT message_id
        FROM messages
        WHERE message_id IN (${placeholders})
      `
      )
      .all(...messagesIds)
    const existedSet = new Set(existedRows.map((row) => row.message_id))
    const newMessages = messages.filter((msg) => !existedSet.has(msg.messageId))
    if (newMessages.length === 0) {
      return []
    }
    this.upsertMessages(newMessages)
    // 更新conversations表的最后一条消息信息
    const conversationMap = new Map()
    for (const msg of newMessages) {
      const key = `${msg.conv.type}|${msg.conv.target}|${msg.conv.line || 0}`
      if (!conversationMap.has(key)) {
        let c = this.getConversation(msg.conv.type, msg.conv.target, msg.conv.line || 0)
        console.log('Existing conversation from DB:', c)
        conversationMap.set(key, {
          conversationType: msg.conv.type,
          target: msg.conv.target,
          line: msg.conv.line || 0,
          lastMessageId: msg.messageId,
          lastMessageSender: msg.sender,
          lastMessageContent: msg.payload.content || '',
          lastMessageTime: msg.timestamp,
          unreadCount: c ? (c.unreadCount || 0) + 1 : 1
        })
      } else {
        const c = conversationMap.get(key)
        if (msg.timestamp > (c.lastMessageTime || 0)) {
          c.lastMessageId = msg.messageId
          c.lastMessageSender = msg.sender
          c.lastMessageContent = msg.payload.content || ''
          c.lastMessageTime = msg.timestamp
          c.unreadCount = (c.unreadCount || 0) + 1
        }
      }
    }
    this.upsertConversations([...conversationMap.values()])
    return conversationMap
    // return newMessages
  }
  // 将当前conversation的消息标记为已读
  markConversationAsRead(conversationType, target, line) {
    const stmt = this.db.prepare(`
      UPDATE conversations
      SET unread_count = 0
      WHERE conversation_type = ? AND target = ? AND line = ?
    `)
    stmt.run(conversationType, target, line)
  }
}
export default DB
