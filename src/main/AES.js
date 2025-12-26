/**
 * AES加密解密工具类
 * 对应后端 io.moquette.spi.impl.security.AES 的实现
 *
 * 加密算法：AES/CBC/PKCS5Padding
 * 支持 AES-128 (16字节密钥) 和 AES-256 (32字节密钥)
 *
 * @author Auto-generated
 * @date 2024
 */

const crypto = require('crypto')

class AES {
  // 默认密钥（32字节）
  static aes_key = Buffer.from([
    0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f,
    0x3a, 0x1f, 0x28, 0x39, 0x4f, 0x52, 0x68, 0x79, 0x71, 0x73, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f
  ])

  static keyLen = 16
  static ivLen = 16

  /**
   * 设置是否使用 AES-256
   * @param {boolean} aes256 - true 使用 AES-256 (32字节密钥), false 使用 AES-128 (16字节密钥)
   */
  static useAes256(aes256) {
    if (aes256) {
      this.keyLen = 32
    } else {
      this.keyLen = 16
    }
  }

  /**
   * 将用户密钥字符串转换为字节数组
   * @param {string} userKey - 用户密钥字符串
   * @returns {Buffer} 密钥字节数组
   */
  static convertUserKey(userKey) {
    const key = Buffer.alloc(this.keyLen)
    for (let i = 0; i < this.keyLen && i < userKey.length; i++) {
      key[i] = userKey.charCodeAt(i) & 0xff
    }
    return key
  }

  /**
   * 获取无符号字节值
   * @param {number} data - 字节值
   * @returns {number} 0-255 的无符号值
   */
  static getUnsignedByte(data) {
    return data & 0xff
  }

  /**
   * AES加密
   * 支持多种参数类型：
   * - AESEncrypt(string, string) - 字符串输入，字符串密钥
   * - AESEncrypt(Buffer, string) - 字节数组输入，字符串密钥
   * - AESEncrypt(Buffer, Buffer) - 字节数组输入，字节数组密钥
   *
   * @param {string|Buffer} sSrc - 要加密的字符串或字节数组
   * @param {string|Buffer} userKeyOrAesKey - 用户密钥字符串或密钥字节数组
   * @returns {Buffer|null} 加密后的字节数组，失败返回 null
   */
  static AESEncrypt(sSrc, userKeyOrAesKey) {
    // 处理第一个参数：如果是字符串，转换为Buffer（使用UTF-8编码）
    let tobeencrypdata
    if (typeof sSrc === 'string') {
      // Java的getBytes()默认使用平台编码，但现代Java环境通常是UTF-8
      // 为了兼容，我们使用UTF-8编码
      tobeencrypdata = Buffer.from(sSrc, 'utf8')
    } else if (Buffer.isBuffer(sSrc)) {
      tobeencrypdata = sSrc
    } else {
      console.log('第一个参数类型错误')
      return null
    }

    // 处理第二个参数：判断是字符串密钥还是字节数组密钥
    let aesKey
    if (typeof userKeyOrAesKey === 'string') {
      // 字符串密钥：如果为空或null，使用默认密钥；否则转换
      if (userKeyOrAesKey == null || userKeyOrAesKey === '') {
        aesKey = this.aes_key
      } else {
        aesKey = this.convertUserKey(userKeyOrAesKey)
      }
    } else if (Buffer.isBuffer(userKeyOrAesKey)) {
      // 字节数组密钥
      aesKey = userKeyOrAesKey
    } else if (userKeyOrAesKey == null) {
      // null值，使用默认密钥
      aesKey = this.aes_key
    } else {
      console.log('第二个参数类型错误')
      return null
    }

    // 执行实际的加密逻辑
    return this._AESEncryptInternal(tobeencrypdata, aesKey)
  }

  /**
   * AES加密内部实现
   * @param {Buffer} tobeencrypdata - 要加密的字节数组
   * @param {Buffer} aesKey - 密钥字节数组
   * @returns {Buffer|null} 加密后的字节数组，失败返回 null
   */
  static _AESEncryptInternal(tobeencrypdata, aesKey) {
    if (aesKey == null) {
      console.log('Key为空null')
      return null
    }

    // 判断Key长度
    if (aesKey.length < this.keyLen) {
      console.log('Key长度不是' + this.keyLen + '位')
      return null
    }

    // 如果密钥长度超过 keyLen，截取前 keyLen 字节
    if (aesKey.length > this.keyLen) {
      aesKey = aesKey.slice(0, this.keyLen)
    }

    // 确定 IV：如果密钥长度等于 ivLen，使用整个密钥；否则使用前 ivLen 字节
    let ivKeys
    if (aesKey.length === this.ivLen) {
      ivKeys = aesKey
    } else {
      ivKeys = aesKey.slice(0, this.ivLen)
    }

    try {
      // 计算2018.1.1 0:0:0 以来的小时数
      const baseTime = 1514736000 // 2018-01-01 00:00:00 UTC 的时间戳（秒）
      const currentTime = Math.floor(Date.now() / 1000)
      const curhour = Math.floor((currentTime - baseTime) / 3600)

      // 将小时数编码为4字节（小端序）
      // 注意：Java代码第77行有bug，应该是 (curhour & 0xFF000000) >> 24
      // 但写成了 (curhour & 0xFF) >> 24，这会导致最高字节总是0
      // 为了完全兼容Java的实际行为，我们按照bug的写法实现
      const tobeencrypdatawithtime = Buffer.alloc(tobeencrypdata.length + 4)
      tobeencrypdatawithtime[0] = curhour & 0xff // 最低字节
      tobeencrypdatawithtime[1] = (curhour & 0xff00) >> 8 // 次低字节
      tobeencrypdatawithtime[2] = (curhour & 0xff0000) >> 16 // 次高字节
      tobeencrypdatawithtime[3] = ((curhour & 0xff) >> 24) & 0xff // 最高字节（bug：总是0）

      // 复制原始数据
      tobeencrypdata.copy(tobeencrypdatawithtime, 4)

      // 创建加密器
      const algorithm = this.keyLen === 32 ? 'aes-256-cbc' : 'aes-128-cbc'
      const cipher = crypto.createCipheriv(algorithm, aesKey, ivKeys)
      cipher.setAutoPadding(true) // PKCS5Padding

      // 执行加密
      const encrypted = Buffer.concat([cipher.update(tobeencrypdatawithtime), cipher.final()])

      return encrypted
    } catch (error) {
      console.error('AES加密失败:', error)
      return null
    }
  }

  /**
   * AES解密 - 字符串密钥，不检查时间
   * @param {Buffer} sSrc - 加密的字节数组
   * @param {string} userKey - 用户密钥字符串
   * @param {boolean} checkTime - 是否检查时间戳
   * @returns {Buffer|null} 解密后的字节数组，失败返回 null
   */
  static AESDecrypt(sSrc, userKey, checkTime) {
    return this.AESDecrypt(sSrc, userKey, checkTime, null)
  }

  /**
   * AES解密 - 字符串密钥，支持时间检查
   * @param {Buffer} sSrc - 加密的字节数组
   * @param {string} userKey - 用户密钥字符串
   * @param {boolean} checkTime - 是否检查时间戳
   * @param {boolean[]|null} invalidTime - 时间无效标志数组（输出参数）
   * @returns {Buffer|null} 解密后的字节数组，失败返回 null
   */
  static AESDecrypt(sSrc, userKey, checkTime, invalidTime) {
    let aesKey = this.aes_key
    if (userKey != null && userKey !== '') {
      aesKey = this.convertUserKey(userKey)
    }
    return this.AESDecrypt(sSrc, aesKey, checkTime, invalidTime)
  }

  /**
   * AES解密 - 字节数组密钥
   * @param {Buffer} sSrc - 加密的字节数组
   * @param {Buffer} aesKey - 密钥字节数组
   * @param {boolean} checkTime - 是否检查时间戳
   * @param {boolean[]|null} invalidTime - 时间无效标志数组（输出参数）
   * @returns {Buffer|null} 解密后的字节数组，失败返回 null
   */
  static AESDecrypt(sSrc, aesKey, checkTime, invalidTime) {
    try {
      // 判断Key是否正确
      if (aesKey == null) {
        aesKey = this.aes_key
      }

      // 判断Key长度
      if (aesKey.length < this.keyLen) {
        console.log('Key长度不是' + this.keyLen + '位')
        return null
      }

      // 如果密钥长度超过 keyLen，截取前 keyLen 字节
      if (aesKey.length > this.keyLen) {
        aesKey = aesKey.slice(0, this.keyLen)
      }

      // 确定 IV
      let ivKeys
      if (aesKey.length === this.ivLen) {
        ivKeys = aesKey
      } else {
        ivKeys = aesKey.slice(0, this.ivLen)
      }

      // 创建解密器
      const algorithm = this.keyLen === 32 ? 'aes-256-cbc' : 'aes-128-cbc'
      const decipher = crypto.createDecipheriv(algorithm, aesKey, ivKeys)
      decipher.setAutoPadding(true) // PKCS5Padding

      try {
        // 执行解密
        const original = Buffer.concat([decipher.update(sSrc), decipher.final()])

        if (original.length > 4) {
          // 读取时间戳（按照Java代码的逻辑）
          let hours = 0
          hours += this.getUnsignedByte(original[3])
          hours <<= 8
          hours += this.getUnsignedByte(original[2])
          hours <<= 8
          hours += this.getUnsignedByte(original[1])
          hours <<= 8
          hours += this.getUnsignedByte(original[0])

          // 检查时间戳（如果启用）
          if (checkTime) {
            const baseTime = 1514736000 // 2018-01-01 00:00:00 UTC
            const currentTime = Math.floor(Date.now() / 1000)
            const curhour = Math.floor((currentTime - baseTime) / 3600)

            if (Math.abs(curhour - hours) > 24) {
              if (invalidTime != null) {
                invalidTime[0] = true
              }
              return null
            }
          }

          // 去掉前4字节的时间戳，返回实际数据
          const neworiginal = original.slice(4)
          return neworiginal
        }

        return null
      } catch (error) {
        console.log('解密失败: ' + error.toString())
        return null
      }
    } catch (error) {
      console.log('解密失败: ' + error.toString())
      return null
    }
  }
}

export default AES
