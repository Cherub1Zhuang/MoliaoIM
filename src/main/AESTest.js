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
import { sendToRenderer } from './index.js'

const log = (data) => {
  sendToRenderer('mqtt', data)
}

class AESTest {
  /**
   * 主测试方法
   */
  static main() {
    console.log('========== AES Encode test start ==========\n')

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

    console.log('\n========== AES Encode test completed ==========')
  }

  /**
   * 测试用例1: 使用String类型的密钥进行加密解密
   */
  static testStringKeyEncryption() {
    console.log('【Test Case 1】Encrypt and decrypt using String key')
    console.log('----------------------------------------')

    const originalText = 'Hello, World! This is a test message'
    const userKey = '1234567890123456' // 16位密钥

    console.log('originalText: ' + originalText)
    console.log('userKey: ' + userKey)

    // 加密
    const encryptedBytes = AES.AESEncrypt(originalText, userKey)
    if (encryptedBytes != null) {
      const encryptedBase64 = encryptedBytes.toString('base64')
      console.log('Encrypted result (Base64): ' + encryptedBase64)
      console.log('Encrypted result (byte length): ' + encryptedBytes.length)

      // 解密
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, userKey, false, invalidTime)
      console.log('decryptedBytes: ' + decryptedBytes)
      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        console.log('Decrypted result: ' + decryptedText)

        // 验证
        if (originalText === decryptedText) {
          console.log('✓ Test passed: Encryption and decryption successful, data matches\n')
        } else {
          console.log('✗ Test failed: Decrypted data does not match original\n')
        }
      } else {
        console.log('✗ Decryption failed\n')
      }
    } else {
      console.log('✗ Encryption failed\n')
    }
  }

  /**
   * Test Case 2: Encrypt and decrypt using byte[] key
   */
  static testByteArrayKeyEncryption() {
    console.log('【Test Case 2】Encrypt and decrypt using byte[] key')
    console.log('----------------------------------------')

    const originalText = 'Test data: Test Data 12345'
    const userKeyBytes = Buffer.from('abcdefghijklmnop', 'utf8') // 16字节密钥

    console.log('Original text: ' + originalText)
    console.log('User key (byte[]): [' + Array.from(userKeyBytes).join(', ') + ']')
    // Convert string to byte array
    const originalBytes = Buffer.from(originalText, 'utf8')

    // Encrypt - using byte[] key overload
    const encryptedBytes = AES.AESEncrypt(originalBytes, userKeyBytes)
    if (encryptedBytes != null) {
      const encryptedBase64 = encryptedBytes.toString('base64')
      console.log('Encrypted result (Base64): ' + encryptedBase64)

      // Decrypt - using byte[] key overload
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, userKeyBytes, false, invalidTime)

      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        console.log('Decrypted result: ' + decryptedText)

        // Verify
        if (originalText === decryptedText) {
          console.log(
            '✓ Test passed: Encryption and decryption using byte[] key successful, data matches\n'
          )
        } else {
          console.log('✗ Test failed: Decrypted data does not match original\n')
        }
      } else {
        console.log('✗ Decryption failed\n')
      }
    } else {
      console.log('✗ Encryption failed\n')
    }
  }

  /**
   * Test Case 3: Encrypt and decrypt using default key
   */
  static testDefaultKeyEncryption() {
    console.log('【Test Case 3】Encrypt and decrypt using default key')
    console.log('----------------------------------------')

    const originalText = 'Test message using default key'

    console.log('Original text: ' + originalText)
    console.log('Using default key (no userKey provided)')

    // Encrypt - pass null or empty string to use default key
    const encryptedBytes = AES.AESEncrypt(originalText, null)
    if (encryptedBytes != null) {
      const encryptedBase64 = encryptedBytes.toString('base64')
      console.log('Encrypted result (Base64): ' + encryptedBase64)
      // 解密 - 传入null使用默认密钥
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, null, false, invalidTime)

      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        console.log('Decrypted result: ' + decryptedText)

        // Verify
        if (originalText === decryptedText) {
          console.log('✓ Test passed: Encryption and decryption using default key successful\n')
        } else {
          console.log('✗ Test failed: Decrypted data does not match original\n')
        }
      } else {
        console.log('✗ Decryption failed\n')
      }
    } else {
      console.log('✗ Encryption failed\n')
    }
  }

  /**
   * Test Case 4: Test different key lengths
   */
  static testDifferentKeyLengths() {
    console.log('【Test Case 4】Test different key lengths')
    console.log('----------------------------------------')

    const originalText = 'Test different key lengths'

    // Test 16-byte key
    this.testKeyLength(originalText, '1234567890123456', '16-byte key')

    // Test 32-byte key (if AES-256 is supported)
    AES.useAes256(true)
    this.testKeyLength(originalText, '12345678901234567890123456789012', '32-byte key (AES-256)')
    // 恢复为16位密钥
    AES.useAes256(false)

    // Test key longer than 16 bytes (will be truncated)
    this.testKeyLength(
      originalText,
      '12345678901234567890',
      '20-byte key (will be truncated to 16 bytes)'
    )
  }

  static testKeyLength(originalText, userKey, keyDescription) {
    console.log('\n  ' + keyDescription + ': ' + userKey)
    console.log('  Original text: ' + originalText)

    const encryptedBytes = AES.AESEncrypt(originalText, userKey)
    if (encryptedBytes != null) {
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, userKey, false, invalidTime)

      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        if (originalText === decryptedText) {
          console.log('  ✓ ' + keyDescription + ' Test passed')
        } else {
          console.log('  ✗ ' + keyDescription + ' Test failed: Data mismatch')
        }
      } else {
        console.log('  ✗ ' + keyDescription + ' Decryption failed')
      }
    } else {
      console.log('  ✗ ' + keyDescription + ' Encryption failed')
    }
  }

  /**
   * Test Case 5: Test empty string and special characters
   */
  static testSpecialCases() {
    console.log('\n【Test Case 5】Test special cases: empty string and special characters')
    console.log('----------------------------------------')

    const userKey = '1234567890123456'

    // Test empty string
    this.testSpecialCase('', userKey, 'Empty string')

    // Test string with special characters
    this.testSpecialCase(
      'Special characters: !@#$%^&*()_+-=[]{}|;\':",./<>?',
      userKey,
      'Special characters'
    )

    // Test Chinese string
    this.testSpecialCase('Chinese test: 你好世界！', userKey, 'Chinese characters')

    // Test long text
    let longText = ''
    for (let i = 0; i < 100; i++) {
      longText += 'This is a long test text used to test encryption and decryption functionality.'
    }
    this.testSpecialCase(
      longText,
      userKey,
      'Long text (approx. ' + longText.length + ' characters)'
    )
  }

  static testSpecialCase(originalText, userKey, caseDescription) {
    console.log('\n  Test case: ' + caseDescription)
    console.log('  Original text length: ' + originalText.length)

    const encryptedBytes = AES.AESEncrypt(originalText, userKey)
    if (encryptedBytes != null) {
      const invalidTime = [false]
      const decryptedBytes = AES.AESDecrypt(encryptedBytes, userKey, false, invalidTime)

      if (decryptedBytes != null) {
        const decryptedText = decryptedBytes.toString('utf8')
        log({ originalText, decryptedText })
        if (originalText === decryptedText) {
          console.log('  ✓ ' + caseDescription + ' Test passed')
        } else {
          console.log('  ✗ ' + caseDescription + ' Test failed: Data mismatch')
          console.log(
            '    Original: ' + originalText.substring(0, Math.min(50, originalText.length))
          )
          console.log(
            '    Decrypted: ' + decryptedText.substring(0, Math.min(50, decryptedText.length))
          )
        }
      } else {
        console.log('  ✗ ' + caseDescription + ' Decryption failed')
      }
    } else {
      console.log('  ✗ ' + caseDescription + ' Encryption failed')
    }
  }

  /**
   * Test Case 6: Test the functionality of the checkTime parameter
   */
  static testCheckTimeParameter() {
    console.log('\n【Test Case 6】Test the functionality of the checkTime parameter')
    console.log('----------------------------------------')

    const originalText = 'Test the functionality of the checkTime parameter'
    const userKey = '1234567890123456'

    console.log('Original text: ' + originalText)
    console.log('User key: ' + userKey)
    // 加密
    const encryptedBytes = AES.AESEncrypt(originalText, userKey)
    if (encryptedBytes != null) {
      console.log('Encryption successful')

      // Test 1: checkTime = false, do not check time
      console.log('\n  Test 1: checkTime = false (do not check time)')
      const invalidTime1 = [false]
      const decryptedBytes1 = AES.AESDecrypt(encryptedBytes, userKey, false, invalidTime1)
      if (decryptedBytes1 != null) {
        const decryptedText1 = decryptedBytes1.toString('utf8')
        if (originalText === decryptedText1) {
          console.log('  ✓ checkTime=false Test passed')
        } else {
          console.log('  ✗ checkTime=false Test failed: Data mismatch')
        }
      } else {
        console.log('  ✗ checkTime=false Decryption failed')
      }

      // Test 2: checkTime = true, check time (should succeed within 24 hours)
      console.log('\n  Test 2: checkTime = true (check time, within 24 hours)')
      const invalidTime2 = [false]
      const decryptedBytes2 = AES.AESDecrypt(encryptedBytes, userKey, true, invalidTime2)
      if (decryptedBytes2 != null) {
        const decryptedText2 = decryptedBytes2.toString('utf8')
        if (originalText === decryptedText2) {
          console.log('  ✓ checkTime=true Test passed (within 24 hours)')
        } else {
          console.log('  ✗ checkTime=true Test failed: Data mismatch')
        }
        console.log(
          '  Time validation result: ' + (invalidTime2[0] ? 'Invalid time' : 'Valid time')
        )
      } else {
        console.log('  ✗ checkTime=true Decryption failed (possibly exceeded 24 hours)')
        console.log('  Time validation result: ' + (invalidTime2[0] ? 'Invalid time' : 'Unknown'))
      }

      // Test 3: Use simplified AESDecrypt method (without passing invalidTime array)
      console.log('\n  Test 3: Use simplified AESDecrypt method')
      const decryptedBytes3 = AES.AESDecrypt(encryptedBytes, userKey, false)
      if (decryptedBytes3 != null) {
        const decryptedText3 = decryptedBytes3.toString('utf8')
        if (originalText === decryptedText3) {
          console.log('  ✓ Simplified AESDecrypt method test passed')
        } else {
          console.log('  ✗ Simplified AESDecrypt method test failed: Data mismatch')
        }
      } else {
        console.log('  ✗ Simplified AESDecrypt method decryption failed')
      }
    } else {
      console.log('✗ Encryption failed, unable to perform checkTime tests  \n')
    }
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  AESTest.main()
}

export default AESTest
