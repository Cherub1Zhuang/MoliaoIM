import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { machineIdSync } from 'node-machine-id'
import * as m from './mqtt_utils'
import DB from './db'
let mainWindow = null
let db = null
const initDBForUser = (userId) => {
  if (!db) {
    db = new DB(userId)
  }
}
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    minWidth: 700,
    height: 670,
    minHeight: 500,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
const registerIpc = () => {
  ipcMain.handle('get-machine-id', async () => {
    return machineIdSync(true)
  })
  ipcMain.on('operate-window', (event, action) => {
    if (action === 'close') {
      mainWindow.close()
    }
    if (action === 'minimize') {
      mainWindow.minimize()
    }
    if (action === 'maximize') {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
  })
  ipcMain.on('connect-mqtt', (event, data) => {
    m.connectMqtt(data)
  })
  ipcMain.on('init-db', (event, userId) => {
    initDBForUser(userId)
  })
  ipcMain.handle('db-operation', async (event, operation, data = {}) => {
    if (!db) {
      throw new Error('Database not initialized')
    }
    switch (operation) {
      case 'get-conversations':
        return await db.getAllConversations()
      case 'upsert-conversations':
        db.upsertConversations(data.conversations)
        return true
      case 'upsert-messages':
        db.upsertMessages(data.messages)
        return true
      case 'get-messages-by-conversation':
        return await db.getMessagesByConversation(data)
      case 'filter-messages-and-upsert':
        return await db.filterNewMessagesAndUpsert(data.messages)
      case 'upsert-message':
        db.upsertMessage(data.message)
        return true
      case 'mark-conversation-as-read':
        db.markConversationAsRead(data.conversationType, data.target, data.line)
        return true
    }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.weizhi.avconverter')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  registerIpc()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//发送消息到渲染进程
export const sendToRenderer = (channel, ...args) => {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, ...args)
  }
}
