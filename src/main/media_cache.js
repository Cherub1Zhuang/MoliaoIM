import path from 'path'
import fs from 'fs'
import { app, protocol } from 'electron'
import crypto from 'crypto'

const mediaCacheDir = path.join(app.getPath('userData'), 'media_cache')
export const ensureMediaCacheDirExists = () => {
  if (!fs.existsSync(mediaCacheDir)) {
    fs.mkdirSync(mediaCacheDir, { recursive: true })
  }
}

export const getHashKey = (str) => {
  return crypto.createHash('md5').update(str).digest('hex')
}
export const getExtFromUrl = (url) => {
  try {
    const u = new URL(url)
    const p = u.pathname
    const ext = path.extname(p)
    return ext || ''
  } catch {
    return ''
  }
}
export const registerMediaCacheProtocol = () => {
  protocol.registerFileProtocol('cache', (request, callback) => {
    try {
      let filename = request.url.replace('cache://', '')
      filename = decodeURIComponent(filename)
      filename = filename.replace(/\/+$/, '') // 防止结尾 /

      const localFilePath = path.join(mediaCacheDir, filename)

      callback({ path: localFilePath })
    } catch (e) {
      console.error('[cache protocol] error:', e)
    }
  })
}

export const cacheRemoteFile = async (url) => {
  const ext = getExtFromUrl(url)
  const filename = `${getHashKey(url)}${ext}`
  const localFilePath = path.join(mediaCacheDir, filename)
  if (fs.existsSync(localFilePath)) {
    return `cache://${filename}`
  } else {
    const res = await fetch(url)
    if (!res.ok) {
      return null
    }
    const arrayBuffer = await res.arrayBuffer()
    fs.writeFileSync(localFilePath, Buffer.from(arrayBuffer))
    return `cache://${filename}`
  }
}

export const cleanCache = (days = 30) => {
  const now = Date.now()
  const maxAge = days * 24 * 60 * 60 * 1000
  for (const file of fs.readdirSync(mediaCacheDir)) {
    const filePath = path.join(mediaCacheDir, file)
    const stats = fs.statSync(filePath)
    if (now - stats.mtimeMs > maxAge) {
      fs.unlinkSync(filePath)
    }
  }
}
