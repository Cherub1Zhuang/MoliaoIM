/**
 * AES加密解密测试类
 * 用于测试 AES 类中的 AESEncrypt 和 AESDecrypt 方法
 * 与 Java 版本 io.moquette.spi.impl.security.AESTest 完全对应
 *
 * @author Test
 * @date 2024
 */

import AES from './AES.js'
import crypto from 'crypto'

class AESTest {
  /**
   * 主测试方法
   */
  static main() {
    console.log('========== AES加密解密测试开始 ==========\n')

    // 测试用例1: 使用String类型的密钥进行加密解密
    this.testStringKeyEncryption()

    // 测试用例2: 使用byte[]类型的密钥进行加密解密
    this.testByteArrayKeyEncryption()

    // 测试用例3: 使用默认密钥进行加密解密
    this.testDefaultKeyEncryption()

    // 测试用例4: 测试不同长度的密钥
    this.testDifferentKeyLengths()

    // 测试用例5: 测试空字符串和特殊字符
    this.testSpecialCases()

    // 测试用例6: 测试checkTime参数
    this.testCheckTimeParameter()

    console.log('\n========== AES加密解密测试完成 ==========')
  }

  /**
   * 测试用例1: 使用String类型的密钥进行加密解密
   */
  static testStringKeyEncryption() {
    console.log('【测试用例1】使用String类型密钥进行加密解密')
    console.log('----------------------------------------')

    const originalText = 'Hello, World! 这是一条测试消息'
    const userKey = '1234567890123456' // 16位密钥

    console.log('原始文本: ' + originalText)
    console.log('用户密钥: ' + userKey)

    // 加密
    const encryptedBytes = AES.AESEncrypt(originalText, userKey)
    if (encryptedBytes != null) {
      const encryptedBase64 = encryptedBytes.toString('base64')
      console.log('加密结果(Base64): ' + encryptedBase64)
      console.log('加密结果(字节长度): ' + encryptedBytes.length)

      // 解密
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, userKey, false, invalidTime)
      console.log('decryptedBytes: ' + decryptedBytes)
      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        console.log('解密结果: ' + decryptedText)

        // 验证
        if (originalText === decryptedText) {
          console.log('✓ 测试通过: 加密解密成功，数据一致\n')
        } else {
          console.log('✗ 测试失败: 解密后的数据与原始数据不一致\n')
        }
      } else {
        console.log('✗ 解密失败\n')
      }
    } else {
      console.log('✗ 加密失败\n')
    }
  }

  /**
   * 测试用例2: 使用byte[]类型的密钥进行加密解密
   */
  static testByteArrayKeyEncryption() {
    console.log('【测试用例2】使用byte[]类型密钥进行加密解密')
    console.log('----------------------------------------')

    const originalText = '测试数据: Test Data 12345'
    const userKeyBytes = Buffer.from('abcdefghijklmnop', 'utf8') // 16字节密钥

    console.log('原始文本: ' + originalText)
    console.log('用户密钥(byte[]): [' + Array.from(userKeyBytes).join(', ') + ']')

    // 将字符串转换为字节数组
    const originalBytes = Buffer.from(originalText, 'utf8')

    // 加密 - 使用byte[]密钥
    const encryptedBytes = AES.AESEncrypt(originalBytes, userKeyBytes)
    if (encryptedBytes != null) {
      const encryptedBase64 = encryptedBytes.toString('base64')
      console.log('加密结果(Base64): ' + encryptedBase64)

      // 解密 - 直接使用byte[]密钥的重载方法
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, userKeyBytes, false, invalidTime)

      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        console.log('解密结果: ' + decryptedText)

        // 验证
        if (originalText === decryptedText) {
          console.log('✓ 测试通过: 使用byte[]密钥加密解密成功，数据一致\n')
        } else {
          console.log('✗ 测试失败: 解密后的数据与原始数据不一致\n')
        }
      } else {
        console.log('✗ 解密失败\n')
      }
    } else {
      console.log('✗ 加密失败\n')
    }
  }

  /**
   * 测试用例3: 使用默认密钥进行加密解密
   */
  static testDefaultKeyEncryption() {
    console.log('【测试用例3】使用默认密钥进行加密解密')
    console.log('----------------------------------------')

    const originalText = '使用默认密钥的测试消息'

    console.log('原始文本: ' + originalText)
    console.log('使用默认密钥(不传入userKey)')

    // 加密 - 传入null或空字符串使用默认密钥
    const encryptedBytes = AES.AESEncrypt(originalText, null)
    if (encryptedBytes != null) {
      const encryptedBase64 = encryptedBytes.toString('base64')
      console.log('加密结果(Base64): ' + encryptedBase64)

      // 解密 - 传入null使用默认密钥
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, null, false, invalidTime)

      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        console.log('解密结果: ' + decryptedText)

        // 验证
        if (originalText === decryptedText) {
          console.log('✓ 测试通过: 使用默认密钥加密解密成功\n')
        } else {
          console.log('✗ 测试失败: 解密后的数据与原始数据不一致\n')
        }
      } else {
        console.log('✗ 解密失败\n')
      }
    } else {
      console.log('✗ 加密失败\n')
    }
  }

  /**
   * 测试用例4: 测试不同长度的密钥
   */
  static testDifferentKeyLengths() {
    console.log('【测试用例4】测试不同长度的密钥')
    console.log('----------------------------------------')

    const originalText = '测试不同密钥长度'

    // 测试16位密钥
    this.testKeyLength(originalText, '1234567890123456', '16位密钥')

    // 测试32位密钥（如果支持AES-256）
    AES.useAes256(true)
    this.testKeyLength(originalText, '12345678901234567890123456789012', '32位密钥(AES-256)')

    // 恢复为16位密钥
    AES.useAes256(false)

    // 测试超过16位的密钥（会被截取）
    this.testKeyLength(originalText, '12345678901234567890', '20位密钥(会被截取为16位)')
  }

  static testKeyLength(originalText, userKey, keyDescription) {
    console.log('\n  ' + keyDescription + ': ' + userKey)
    console.log('  原始文本: ' + originalText)

    const encryptedBytes = AES.AESEncrypt(originalText, userKey)
    if (encryptedBytes != null) {
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, userKey, false, invalidTime)

      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        if (originalText === decryptedText) {
          console.log('  ✓ ' + keyDescription + ' 测试通过')
        } else {
          console.log('  ✗ ' + keyDescription + ' 测试失败: 数据不一致')
        }
      } else {
        console.log('  ✗ ' + keyDescription + ' 解密失败')
      }
    } else {
      console.log('  ✗ ' + keyDescription + ' 加密失败')
    }
  }

  /**
   * 测试用例5: 测试空字符串和特殊字符
   */
  static testSpecialCases() {
    console.log('\n【测试用例5】测试特殊场景')
    console.log('----------------------------------------')

    const userKey = '1234567890123456'

    // 测试空字符串
    this.testSpecialCase('', userKey, '空字符串')

    // 测试包含特殊字符的字符串
    this.testSpecialCase('特殊字符: !@#$%^&*()_+-=[]{}|;\':",./<>?', userKey, '特殊字符')

    // 测试中文字符串
    this.testSpecialCase('中文测试：你好世界！', userKey, '中文字符')

    // 测试长文本
    let longText = ''
    for (let i = 0; i < 100; i++) {
      longText += '这是一段很长的测试文本，用于测试加密解密功能。'
    }
    this.testSpecialCase(longText, userKey, '长文本(约' + longText.length + '字符)')
  }

  static testSpecialCase(originalText, userKey, caseDescription) {
    console.log('\n  测试场景: ' + caseDescription)
    console.log('  原始文本长度: ' + originalText.length)

    const encryptedBytes = AES.AESEncrypt(originalText, userKey)
    if (encryptedBytes != null) {
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, userKey, false, invalidTime)

      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        if (originalText === decryptedText) {
          console.log('  ✓ ' + caseDescription + ' 测试通过')
        } else {
          console.log('  ✗ ' + caseDescription + ' 测试失败: 数据不一致')
          console.log('    原始: ' + originalText.substring(0, Math.min(50, originalText.length)))
          console.log('    解密: ' + decryptedText.substring(0, Math.min(50, decryptedText.length)))
        }
      } else {
        console.log('  ✗ ' + caseDescription + ' 解密失败')
      }
    } else {
      console.log('  ✗ ' + caseDescription + ' 加密失败')
    }
  }

  /**
   * 测试用例6: 测试checkTime参数的功能
   */
  static testCheckTimeParameter() {
    console.log('\n【测试用例6】测试checkTime参数')
    console.log('----------------------------------------')

    const originalText = '测试checkTime参数功能'
    const userKey = '1234567890123456'

    console.log('原始文本: ' + originalText)
    console.log('用户密钥: ' + userKey)

    // 加密
    const encryptedBytes = AES.AESEncrypt(originalText, userKey)
    if (encryptedBytes != null) {
      console.log('加密成功')

      // 测试1: checkTime = false，不检查时间
      console.log('\n  测试1: checkTime = false (不检查时间)')
      const invalidTime1 = [false]
      const decryptedBytes1 = AES.AESDecrypt(encryptedBytes, userKey, false, invalidTime1)
      if (decryptedBytes1 != null) {
        const decryptedText1 = decryptedBytes1.toString('utf8')
        if (originalText === decryptedText1) {
          console.log('  ✓ checkTime=false 测试通过')
        } else {
          console.log('  ✗ checkTime=false 测试失败: 数据不一致')
        }
      } else {
        console.log('  ✗ checkTime=false 解密失败')
      }

      // 测试2: checkTime = true，检查时间（在24小时内应该成功）
      console.log('\n  测试2: checkTime = true (检查时间，24小时内)')
      const invalidTime2 = [false]
      const decryptedBytes2 = AES.AESDecrypt(encryptedBytes, userKey, true, invalidTime2)
      if (decryptedBytes2 != null) {
        const decryptedText2 = decryptedBytes2.toString('utf8')
        if (originalText === decryptedText2) {
          console.log('  ✓ checkTime=true 测试通过（在24小时内）')
        } else {
          console.log('  ✗ checkTime=true 测试失败: 数据不一致')
        }
        console.log('  时间验证结果: ' + (invalidTime2[0] ? '时间无效' : '时间有效'))
      } else {
        console.log('  ✗ checkTime=true 解密失败（可能超过24小时）')
        console.log('  时间验证结果: ' + (invalidTime2[0] ? '时间无效' : '未知'))
      }

      // 测试3: 使用简化版AESDecrypt方法（不传入invalidTime数组）
      console.log('\n  测试3: 使用简化版AESDecrypt方法')
      const decryptedBytes3 = AES.AESDecrypt(encryptedBytes, userKey, false)
      if (decryptedBytes3 != null) {
        const decryptedText3 = decryptedBytes3.toString('utf8')
        if (originalText === decryptedText3) {
          console.log('  ✓ 简化版AESDecrypt方法测试通过')
        } else {
          console.log('  ✗ 简化版AESDecrypt方法测试失败')
        }
      } else {
        console.log('  ✗ 简化版AESDecrypt方法解密失败')
      }
    } else {
      console.log('✗ 加密失败，无法进行checkTime测试\n')
    }
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  AESTest.main()
}

export default AESTest
