import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'
class DB {
  constructor(userId) {
    this.userId = userId
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, `db_${userId}.sqlite3`)
    this.dbPath = dbPath
    this.version = 16
    this.init()
  }
  init() {
    this.versionCheck()
    console.log('Database path:', this.dbPath)
    console.log('Initializing database for user:', this.userId)
    this.db = new Database(this.dbPath)
    console.log('Database opened successfully.')
    this.createTable()
    this.setUserVersion(this.version)
  }
  disconnect() {
    if (this.db) {
      this.db.close()
      console.log('Database disconnected successfully.')
    }
  }
  versionCheck() {
    if (!fs.existsSync(this.dbPath)) {
      console.log('Database file does not exist. No version check needed.')
      return
    }
    const tmpDb = new Database(this.dbPath)
    const oldVersion = tmpDb.prepare(`PRAGMA user_version`).get().user_version || 0
    tmpDb.close()
    if (oldVersion < this.version) {
      console.log(
        `Database version outdated (found: ${oldVersion}, expected: ${this.version}). Recreating database.`
      )
      fs.unlinkSync(this.dbPath)
    } else {
      console.log(`Database version is up-to-date (version: ${oldVersion}).`)
    }
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

    this.db.exec(`
    -- 会话表
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_type INTEGER NOT NULL,
      target TEXT NOT NULL,
      line INTEGER DEFAULT 0,

      receiver_portrait TEXT,
      receiver_alias TEXT,

      group_portrait TEXT,
      group_alias TEXT,

      last_message_id TEXT DEFAULT '',
      last_message_sender TEXT,
      last_message_content TEXT,
      last_message_time INTEGER DEFAULT 0,

      -- ✅ 新增
      last_message_type INTEGER DEFAULT 1,

      is_top INTEGER DEFAULT 0,
      unread_count INTEGER DEFAULT 0,

      UNIQUE(conversation_type, target, line)
    );




    -- 消息表
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message_id TEXT NOT NULL UNIQUE,

      conversation_type INTEGER NOT NULL,
      conversation_target TEXT NOT NULL,
      line INTEGER DEFAULT 0,

      sender TEXT NOT NULL,

      payload_type INTEGER NOT NULL,
      searchable_content TEXT,
      push_content TEXT,
      push_data TEXT,
      content TEXT,
      base64ed_data TEXT,
      media_type INTEGER DEFAULT 0,
      remote_media_url TEXT,
      persist_flag INTEGER DEFAULT 0,
      expire_duration INTEGER DEFAULT 0,
      mentioned_type INTEGER DEFAULT 0,
      mentioned_target TEXT,
      extra TEXT,
      is_read INTEGER DEFAULT 0,

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
  // getAllConversations() {
  //   const stmt = this.db.prepare(`
  //     SELECT * FROM conversations
  //     ORDER BY is_top DESC, last_message_time DESC
  //   `)
  //   const rows = stmt.all()
  //   return rows.map((row) => {
  //     const lastMessage = this._buildLastMessage(row.last_message_id)
  //     return {
  //       conversationType: row.conversation_type,
  //       target: row.target,
  //       line: row.line,

  //       receiverPortrait: row.receiver_portrait,
  //       receiverAlias: row.receiver_alias,

  //       groupPortrait: row.group_portrait,
  //       groupAlias: row.group_alias,

  //       lastMessageId: row.last_message_id,
  //       lastMessageSender: row.last_message_sender,
  //       lastMessageContent: row.last_message_content,
  //       lastMessageTime: row.last_message_time,

  //       // ✅ 新增
  //       lastMessageType: row.last_message_type,

  //       isTop: row.is_top,
  //       unreadCount: row.unread_count,
  //       lastMessage
  //     }
  //   })
  // }
  getAllConversations() {
    // 1️⃣ 先取会话基本信息（不要相信 last_message_* / unread_count）
    const stmt = this.db.prepare(`
    SELECT *
    FROM conversations
    ORDER BY is_top DESC, last_message_time DESC
  `)

    const rows = stmt.all()

    // 2️⃣ 预编译：查询最后一条消息（每个会话）
    const lastMsgStmt = this.db.prepare(`
    SELECT
      message_id,
      sender,
      content,
      payload_type,
      timestamp
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
      AND line = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `)

    // 3️⃣ 预编译：统计未读数量（每个会话）
    const unreadStmt = this.db.prepare(`
    SELECT COUNT(*) AS cnt
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
      AND line = ?
      AND is_read = 0
      AND sender != ?
  `)

    // 4️⃣ 预编译：回写 conversations 派生字段
    const updateConvStmt = this.db.prepare(`
    UPDATE conversations
    SET
      last_message_id = ?,
      last_message_sender = ?,
      last_message_content = ?,
      last_message_time = ?,
      last_message_type = ?,
      unread_count = ?
    WHERE conversation_type = ?
      AND target = ?
      AND line = ?
  `)

    const tx = this.db.transaction((list) => {
      const result = []

      for (const row of list) {
        const conversationType = row.conversation_type
        const target = row.target
        const line = row.line ?? 0

        // ✅ 实时计算最后一条消息
        const lastMsg = lastMsgStmt.get(conversationType, target, line)

        let lastMessageId = ''
        let lastMessageSender = ''
        let lastMessageContent = ''
        let lastMessageTime = 0
        let lastMessageType = 1

        if (lastMsg) {
          lastMessageId = lastMsg.message_id
          lastMessageSender = lastMsg.sender
          lastMessageContent = lastMsg.content || ''
          lastMessageTime = lastMsg.timestamp || 0
          lastMessageType = lastMsg.payload_type ?? 1
        }

        // ✅ 实时计算未读数
        const unreadRow = unreadStmt.get(conversationType, target, line, this.userId)
        const unreadCount = unreadRow?.cnt || 0

        // ✅ 同步回 conversations（让缓存字段保持一致）
        updateConvStmt.run(
          lastMessageId,
          lastMessageSender,
          lastMessageContent,
          lastMessageTime,
          lastMessageType,
          unreadCount,
          conversationType,
          target,
          line
        )

        // ✅ lastMessage 直接从 lastMsg 拼出来（不用 conversations 表）
        const lastMessage = lastMsg
          ? {
              messageId: lastMsg.message_id,
              sender: lastMsg.sender,
              conv: {
                type: conversationType,
                target,
                line
              },
              payload: {
                type: lastMsg.payload_type ?? 1,
                content: lastMsg.content || ''
              },
              timestamp: lastMsg.timestamp || 0
            }
          : null

        // ✅ 返回给 UI（这些字段全部来自实时计算）
        result.push({
          conversationType,
          target,
          line,

          receiverPortrait: row.receiver_portrait,
          receiverAlias: row.receiver_alias,

          groupPortrait: row.group_portrait,
          groupAlias: row.group_alias,

          lastMessageId,
          lastMessageSender,
          lastMessageContent,
          lastMessageTime,
          lastMessageType,

          isTop: row.is_top,
          unreadCount,

          lastMessage
        })
      }

      return result
    })

    return tx(rows)
  }

  // 读取单个回话
  getConversation(conversationType, target, line) {
    // ===============================
    // 1️⃣ 查询最后一条消息
    // ===============================
    const lastMsgStmt = this.db.prepare(`
    SELECT
      message_id,
      sender,
      content,
      payload_type,
      timestamp
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
      AND line = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `)

    const lastMsg = lastMsgStmt.get(conversationType, target, line)

    let lastMessageId = 0
    let lastMessageSender = ''
    let lastMessageContent = ''
    let lastMessageTime = 0
    let lastMessageType = 1

    if (lastMsg) {
      lastMessageId = lastMsg.message_id
      lastMessageSender = lastMsg.sender
      lastMessageContent = lastMsg.content || ''
      lastMessageTime = lastMsg.timestamp || 0
      lastMessageType = lastMsg.payload_type ?? 1
    }

    // ===============================
    // 2️⃣ 统计未读数量
    // ===============================
    const unreadStmt = this.db.prepare(`
    SELECT COUNT(*) AS cnt
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
      AND line = ?
      AND is_read = 0
      AND sender != ?
  `)

    const unreadRow = unreadStmt.get(conversationType, target, line, this.userId)
    const unreadCount = unreadRow?.cnt || 0

    // ===============================
    // 3️⃣ 更新 conversations 派生字段
    // ===============================
    const updateStmt = this.db.prepare(`
    UPDATE conversations
    SET
      last_message_id = ?,
      last_message_sender = ?,
      last_message_content = ?,
      last_message_time = ?,
      last_message_type = ?,
      unread_count = ?
    WHERE conversation_type = ?
      AND target = ?
      AND line = ?
  `)

    updateStmt.run(
      lastMessageId,
      lastMessageSender,
      lastMessageContent,
      lastMessageTime,
      lastMessageType,
      unreadCount,
      conversationType,
      target,
      line
    )

    // ===============================
    // 4️⃣ 查询并返回（结构与 getAllConversations 完全一致）
    // ===============================
    const stmt = this.db.prepare(`
    SELECT *
    FROM conversations
    WHERE conversation_type = ?
      AND target = ?
      AND line = ?
  `)

    const row = stmt.get(conversationType, target, line)
    if (!row) return null
    const lastMessage = this._buildLastMessage(row.last_message_id)
    return {
      conversationType: row.conversation_type,
      target: row.target,
      line: row.line,

      receiverPortrait: row.receiver_portrait,
      receiverAlias: row.receiver_alias,

      groupPortrait: row.group_portrait,
      groupAlias: row.group_alias,

      lastMessageId: row.last_message_id,
      lastMessageSender: row.last_message_sender,
      lastMessageContent: row.last_message_content,
      lastMessageTime: row.last_message_time,
      lastMessageType: row.last_message_type,

      isTop: row.is_top,
      unreadCount: row.unread_count,
      lastMessage
    }
  }

  // 查询指定会话的消息
  // getMessagesByConversation({
  //   conversationType,
  //   target,
  //   line,
  //   limit = 30,
  //   beforeTimestamp = null
  // }) {
  //   // ===============================
  //   // 1️⃣ 查询消息
  //   // ===============================
  //   let sql = `
  //   SELECT *
  //   FROM messages
  //   WHERE conversation_type = ?
  //     AND conversation_target = ?
  //     AND line = ?
  // `
  //   const args = [conversationType, target, line]

  //   if (beforeTimestamp !== null) {
  //     sql += ` AND timestamp < ? `
  //     args.push(beforeTimestamp)
  //   }

  //   sql += `
  //   ORDER BY timestamp DESC
  //   LIMIT ?
  // `
  //   args.push(limit)

  //   const rows = this.db.prepare(sql).all(...args)

  //   // ===============================
  //   // 2️⃣ 标记该会话所有消息为已读
  //   // ===============================
  //   const markReadStmt = this.db.prepare(`
  //   UPDATE messages
  //   SET extra = json(
  //     '{"read":true,"readTime":' || strftime('%s','now') || '000}'
  //   )
  //   WHERE conversation_type = ?
  //     AND conversation_target = ?
  //     AND line = ?
  //     AND (
  //       extra IS NULL
  //       OR extra = ''
  //       OR extra = '[]'
  //       OR extra NOT LIKE '%"read":true%'
  //     )
  // `)

  //   markReadStmt.run(conversationType, target, line)

  //   // ===============================
  //   // 3️⃣ 会话 unread_count 置 0
  //   // ===============================
  //   const clearUnreadStmt = this.db.prepare(`
  //   UPDATE conversations
  //   SET unread_count = 0
  //   WHERE conversation_type = ?
  //     AND target = ?
  //     AND line = ?
  // `)

  //   clearUnreadStmt.run(conversationType, target, line)

  //   // ===============================
  //   // 4️⃣ 返回给 UI（ASC）
  //   // ===============================
  //   return rows.reverse().map((row) => ({
  //     messageId: row.message_id,
  //     sender: row.sender,
  //     conv: {
  //       type: row.conversation_type,
  //       target: row.conversation_target,
  //       line: row.line
  //     },
  //     payload: {
  //       base64edData: row.base64ed_data,
  //       type: row.payload_type,
  //       searchableContent: row.searchable_content,
  //       pushContent: row.push_content,
  //       pushData: row.push_data,
  //       content: row.content,
  //       mediaType: row.media_type,
  //       remoteMediaUrl: row.remote_media_url,
  //       persistFlag: row.persist_flag,
  //       expireDuration: row.expire_duration,
  //       mentionedType: row.mentioned_type,
  //       mentionedTarget: row.mentioned_target ? JSON.parse(row.mentioned_target) : [],
  //       extra: row.extra
  //     },
  //     toUsers: [],
  //     timestamp: row.timestamp
  //   }))
  // }
  getMessagesByConversation({
    conversationType,
    target,
    line,
    limit = 30,
    beforeTimestamp = null
  }) {
    // ===============================
    // 1️⃣ 查询消息
    // ===============================
    let sql = `
    SELECT *
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
      AND line = ?
  `
    const args = [conversationType, target, line]

    if (beforeTimestamp !== null) {
      sql += ` AND timestamp < ? `
      args.push(beforeTimestamp)
    }

    sql += `
    ORDER BY timestamp DESC
    LIMIT ?
  `
    args.push(limit)

    const rows = this.db.prepare(sql).all(...args)

    // ===============================
    // ✅ 2️⃣ 查出“本次未读 -> 已读”的消息ID列表
    //    注意：只统计当前会话内本次会被置为已读的
    // ===============================
    const getUnreadIdsStmt = this.db.prepare(`
    SELECT message_id
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
      AND line = ?
      AND is_read = 0
  `)

    const unreadRows = getUnreadIdsStmt.all(conversationType, target, line)
    const changedReadMessageIds = unreadRows.map((r) => r.message_id)

    // ===============================
    // 3️⃣ 标记该会话所有消息为已读
    // ===============================
    const markReadStmt = this.db.prepare(`
      UPDATE messages
      SET is_read = 1
      WHERE conversation_type = ?
        AND conversation_target = ?
        AND line = ?
        AND is_read = 0
    `)

    markReadStmt.run(conversationType, target, line)

    // ===============================
    // 4️⃣ 会话 unread_count 置 0
    // ===============================
    const clearUnreadStmt = this.db.prepare(`
    UPDATE conversations
    SET unread_count = 0
    WHERE conversation_type = ?
      AND target = ?
      AND line = ?
  `)

    clearUnreadStmt.run(conversationType, target, line)

    // ===============================
    // 5️⃣ 返回给 UI（ASC）
    // ===============================
    const messages = rows.reverse().map((row) => ({
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
    }))

    // ✅ 新增返回：changedReadMessageIds
    return {
      messages,
      changedReadMessageIds
    }
  }

  upsertConversation(conversation) {
    const insertStmt = this.db.prepare(`
    INSERT OR IGNORE INTO conversations (
      conversation_type,
      target,
      line,

      receiver_alias,
      receiver_portrait,

      -- ✅ 新增
      group_alias,
      group_portrait,

      last_message_id,
      last_message_sender,
      last_message_content,
      last_message_type,
      last_message_time,
      is_top,
      unread_count
    )VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    const updateStmt = this.db.prepare(`
    UPDATE conversations
    SET
      receiver_alias = COALESCE(?, receiver_alias),
      receiver_portrait = COALESCE(?, receiver_portrait),

      -- ✅ 新增
      group_alias = COALESCE(?, group_alias),
      group_portrait = COALESCE(?, group_portrait),

      last_message_id = COALESCE(?, last_message_id),
      last_message_sender = COALESCE(?, last_message_sender),
      last_message_content = COALESCE(?, last_message_content),
      last_message_type = COALESCE(?, last_message_type),
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

      // ✅ 新增
      conversation.groupAlias ?? null,
      conversation.groupPortrait ?? null,

      conversation.lastMessageId ?? 0,
      conversation.lastMessageSender ?? null,
      conversation.lastMessageContent ?? null,
      conversation.lastMessageType ?? 1,
      conversation.lastMessageTime ?? 0,
      conversation.isTop ?? 0,
      conversation.unreadCount ?? 0
    )

    // 2️⃣ 已存在则更新
    updateStmt.run(
      conversation.receiverAlias ?? null,
      conversation.receiverPortrait ?? null,

      // ✅ 新增
      conversation.groupAlias ?? null,
      conversation.groupPortrait ?? null,

      conversation.lastMessageId ?? null,
      conversation.lastMessageSender ?? null,
      conversation.lastMessageContent ?? null,
      conversation.lastMessageType ?? null,
      conversation.lastMessageTime ?? null,
      conversation.isTop ?? null,
      conversation.unreadCount ?? null,

      conversation.conversationType,
      conversation.target,
      conversation.line
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
      payload_type,
      timestamp
    FROM messages
    WHERE conversation_type = ?
      AND conversation_target = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `)

    // ② 统计未读数量（extra IS NULL）
    const unreadCountStmt = this.db.prepare(`
      SELECT COUNT(*) AS cnt
      FROM messages
      WHERE conversation_type = ?
        AND conversation_target = ?
        AND line = ?
        AND (
          extra IS NULL
          OR extra = ''
          OR extra = '[]'
          OR extra NOT LIKE '%"read":true%'
        )
        AND sender != ?

    `)

    // ③ 判断 conversation 是否存在（只看 type + target）
    const existsStmt = this.db.prepare(`
    SELECT 1
    FROM conversations
    WHERE conversation_type = ?
      AND target = ?
      AND line = ?
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
      group_alias,
      group_portrait,
      last_message_id,
      last_message_sender,
      last_message_content,
      last_message_type,   -- ✅
      last_message_time,
      is_top,
      unread_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    // ⑤ 更新
    const updateStmt = this.db.prepare(`
    UPDATE conversations
    SET
      line = ?,
      receiver_alias = ?,
      receiver_portrait = ?,
      group_alias = ?,
      group_portrait = ?,
      last_message_id = ?,
      last_message_sender = ?,
      last_message_content = ?,
      last_message_type = ?,   -- ✅
      last_message_time = ?,
      is_top = ?,
      unread_count = ?
    WHERE conversation_type = ?
      AND target = ?
      AND line = ?

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
        let lastMessageType = 1

        if (lastMsg) {
          lastMessageId = lastMsg.message_id
          lastMessageSender = lastMsg.sender
          lastMessageContent = lastMsg.content || ''
          lastMessageTime = lastMsg.timestamp || 0
          lastMessageType = lastMsg.payload_type ?? 1
        }

        // 🔹 统计未读
        const unreadRow = unreadCountStmt.get(
          c.conversationType,
          c.target,
          c.line ?? 0,
          this.userId
        )

        const unreadCount = unreadRow?.cnt || 0

        const exists = existsStmt.get(c.conversationType, c.target, c.line ?? 0)

        if (exists) {
          // ✅ 已存在 → UPDATE
          updateStmt.run(
            c.line ?? 0,
            c.receiverAlias ?? null,
            c.receiverPortrait ?? null,
            c.groupAlias ?? null,
            c.groupPortrait ?? null,
            lastMessageId,
            lastMessageSender,
            lastMessageContent,
            lastMessageType,
            lastMessageTime,
            c.isTop ?? 0,
            unreadCount,
            c.conversationType,
            c.target,
            c.line ?? 0 // ✅ 补上这一项
          )
        } else {
          // ✅ 不存在 → INSERT
          insertStmt.run(
            c.conversationType,
            c.target,
            c.line ?? 0,
            c.receiverAlias ?? null,
            c.receiverPortrait ?? null,
            c.groupAlias ?? null,
            c.groupPortrait ?? null,
            lastMessageId,
            lastMessageSender,
            lastMessageContent,
            lastMessageType, // ✅ 必须有
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
      base64ed_data,
      media_type,
      remote_media_url,
      persist_flag,
      expire_duration,
      mentioned_type,
      mentioned_target,
      extra,
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      msg.payload.base64edData ?? null,
      msg.payload.mediaType ?? 0,
      msg.payload.remoteMediaUrl ?? null,
      msg.payload.persistFlag ?? 0,
      msg.payload.expireDuration ?? 0,
      msg.payload.mentionedType ?? 0,
      msg.payload.mentionedTarget ? JSON.stringify(msg.payload.mentionedTarget) : null,
      msg.payload.extra ?? null,

      msg.timestamp
    )
    return true
  }
  upsertMessages(messages = []) {
    if (!Array.isArray(messages) || messages.length === 0) return []

    const existsStmt = this.db.prepare(`
    SELECT extra FROM messages WHERE message_id = ? LIMIT 1
  `)

    const insertStmt = this.db.prepare(`
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
      timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

    const updateStmt = this.db.prepare(`
    UPDATE messages SET
      conversation_type = ?,
      conversation_target = ?,
      line = ?,
      sender = ?,
      payload_type = ?,
      searchable_content = ?,
      push_content = ?,
      push_data = ?,
      content = ?,
      base64ed_data = ?,
      media_type = ?,
      remote_media_url = ?,
      persist_flag = ?,
      expire_duration = ?,
      mentioned_type = ?,
      mentioned_target = ?,
      extra = ?,
      timestamp = ?
    WHERE message_id = ?
  `)

    const affectedMap = new Map()

    const tx = this.db.transaction((list) => {
      for (const msg of list) {
        if (!msg || !msg.messageId || !msg.conv) continue

        const conversationType = msg.conv.type
        const target = msg.conv.target
        const line = msg.conv.line ?? 0

        const key = `${conversationType}|${target}|${line}`
        if (!affectedMap.has(key)) {
          affectedMap.set(key, { conversationType, target, line })
        }

        const mentionedTarget = msg.payload.mentionedTarget
          ? JSON.stringify(msg.payload.mentionedTarget)
          : null

        const newExtra =
          !msg.payload.extra || msg.payload.extra === '{}' || msg.payload.extra === '[]'
            ? null
            : msg.payload.extra

        const existedRow = existsStmt.get(msg.messageId)

        if (existedRow) {
          // ===== UPDATE 分支（关键逻辑） =====
          const oldExtra = existedRow.extra

          let finalExtra = oldExtra

          // ✅ 只有「未读 → 已读」才允许升级
          if (
            (oldExtra === null || oldExtra === '' || oldExtra === '[]') &&
            typeof newExtra === 'string' &&
            newExtra.includes('"read":true')
          ) {
            finalExtra = newExtra
          }

          updateStmt.run(
            conversationType,
            target,
            line,
            msg.sender,
            msg.payload.type,
            msg.payload.searchableContent ?? null,
            msg.payload.pushContent ?? null,
            msg.payload.pushData ?? null,
            msg.payload.content ?? null,
            msg.payload.base64edData ?? null,
            msg.payload.mediaType ?? 0,
            msg.payload.remoteMediaUrl ?? null,
            msg.payload.persistFlag ?? 0,
            msg.payload.expireDuration ?? 0,
            msg.payload.mentionedType ?? 0,
            mentionedTarget,
            finalExtra, // ⭐ 使用最终 extra
            msg.timestamp,
            msg.messageId
          )
        } else {
          // ===== INSERT 分支 =====
          insertStmt.run(
            msg.messageId,
            conversationType,
            target,
            line,
            msg.sender,
            msg.payload.type,
            msg.payload.searchableContent ?? null,
            msg.payload.pushContent ?? null,
            msg.payload.pushData ?? null,
            msg.payload.content ?? null,
            msg.payload.base64edData ?? null,
            msg.payload.mediaType ?? 0,
            msg.payload.remoteMediaUrl ?? null,
            msg.payload.persistFlag ?? 0,
            msg.payload.expireDuration ?? 0,
            msg.payload.mentionedType ?? 0,
            mentionedTarget,
            newExtra,
            msg.timestamp
          )
        }
      }
    })

    tx(messages)

    return Array.from(affectedMap.values())
  }

  filterNewMessagesAndUpsert(messages = []) {
    // 本方法作废，保留防止调用报错
    return []
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
  _buildLastMessage(lastMessageId) {
    if (!lastMessageId || lastMessageId === '') return null

    const stmt = this.db.prepare(`
    SELECT *
    FROM messages
    WHERE message_id = ?
    LIMIT 1
  `)

    const row = stmt.get(lastMessageId)
    if (!row) return null

    return {
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
        base64edData: row.base64ed_data,
        mediaType: row.media_type,
        remoteMediaUrl: row.remote_media_url,
        persistFlag: row.persist_flag,
        expireDuration: row.expire_duration,
        mentionedType: row.mentioned_type,
        mentionedTarget: row.mentioned_target ? JSON.parse(row.mentioned_target) : [],
        extra: row.extra
      },
      timestamp: row.timestamp
    }
  }
  /**
   * 根据 msgId 修改 payload_type
   * @param {string} msgId  message_id
   * @param {number} newType 新的 payload_type
   * @returns {boolean} 是否更新成功
   */
  updateMessagePayloadTypeByMsgId(msgId, newType) {
    if (!msgId) return false
    if (typeof newType !== 'number') return false

    // 1) 更新 messages 表
    const updateMsgStmt = this.db.prepare(`
      UPDATE messages
      SET payload_type = ?
      WHERE message_id = ?
    `)

    const ret = updateMsgStmt.run(newType, msgId)
    if (!ret || ret.changes === 0) return false

    // 2) 如果这条消息刚好是某个会话的 last_message_id，则同步 conversations.last_message_type
    const syncConvStmt = this.db.prepare(`
      UPDATE conversations
      SET last_message_type = ?
      WHERE last_message_id = ?
    `)
    syncConvStmt.run(newType, msgId)

    return true
  }
  deleteMessagesByIds(messageIds = []) {
    if (!Array.isArray(messageIds) || messageIds.length === 0) return 0

    // 去重 + 过滤空值
    const ids = Array.from(new Set(messageIds)).filter(Boolean)
    if (ids.length === 0) return 0

    const placeholders = ids.map(() => '?').join(',')

    const stmt = this.db.prepare(`
    DELETE FROM messages
    WHERE message_id IN (${placeholders})
  `)

    const ret = stmt.run(...ids)
    return ret.changes || 0
  }
}
export default DB
