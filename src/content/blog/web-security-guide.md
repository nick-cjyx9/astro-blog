---
title: "Web 安全防护完全指南"
description: "全面覆盖 Web 安全的各个方面，从 XSS、CSRF 到 SQL 注入，以及现代安全防护策略和最佳实践。"
pubDate: 2024-12-15
lastModified: 2024-12-25
author: "Nick Chen"
tags: ["Web安全", "网络安全", "前端安全", "后端安全", "安全最佳实践"]
---

Web 安全是现代 Web 开发中不可忽视的重要环节。随着网络攻击手段的不断演进，开发者需要了解各种安全威胁并掌握相应的防护措施。

## 常见 Web 安全威胁

### 跨站脚本攻击 (XSS)

XSS 是最常见的 Web 安全漏洞之一，攻击者通过注入恶意脚本来窃取用户信息。

#### 反射型 XSS

```javascript
// 危险的做法
app.get('/search', (req, res) => {
  const query = req.query.q
  res.send(`<h1>搜索结果：${query}</h1>`)
  // 如果 query 包含 <script>alert('XSS')</script>，将直接执行
})

// 安全的做法
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

app.get('/search', (req, res) => {
  const query = escapeHtml(req.query.q)
  res.send(`<h1>搜索结果：${query}</h1>`)
})
```

#### 存储型 XSS

```javascript
// 前端输入验证
function sanitizeInput(input) {
  // 移除危险标签
  const dangerous = /<script[^>]*>.*?<\/script>/gi
  return input.replace(dangerous, '')
}

// 更严格的过滤
function strictSanitize(input) {
  // 只允许特定标签
  const allowedTags = ['b', 'i', 'u', 'strong', 'em']
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi

  return input.replace(tagRegex, (match, tagName) => {
    return allowedTags.includes(tagName.toLowerCase()) ? match : ''
  })
}

// 使用 DOMPurify 库（推荐）
const DOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')

const window = new JSDOM('').window
const purify = DOMPurify(window)

function safeSanitize(dirty) {
  return purify.sanitize(dirty)
}
```

#### DOM 型 XSS

```javascript
// 危险的 DOM 操作
document.getElementById('content').innerHTML = userInput

// 安全的替代方案
document.getElementById('content').textContent = userInput

// 或者使用安全的 HTML 插入
function safeInsertHTML(element, html) {
  // 创建临时容器
  const temp = document.createElement('div')
  temp.textContent = html
  element.innerHTML = temp.innerHTML
}
```

### 跨站请求伪造 (CSRF)

CSRF 攻击利用用户已认证的身份执行未授权操作。

```javascript
// CSRF Token 生成
const crypto = require('node:crypto')

class CSRFProtection {
  generateToken() {
    return crypto.randomBytes(32).toString('hex')
  }

  verifyToken(sessionToken, requestToken) {
    return sessionToken === requestToken
  }
}

// Express 中间件
function csrfProtection(req, res, next) {
  if (req.method === 'GET') {
    // 为 GET 请求生成 token
    req.session.csrfToken = csrf.generateToken()
    res.locals.csrfToken = req.session.csrfToken
    return next()
  }

  // 验证 POST 请求的 token
  const token = req.body._csrf || req.headers['x-csrf-token']

  if (!csrf.verifyToken(req.session.csrfToken, token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }

  next()
}

// 前端使用
function makeSecureRequest(url, data) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
  })
}
```

### SQL 注入防护

```javascript
// 危险的 SQL 查询
const getUserById = (id) => {
  const query = `SELECT * FROM users WHERE id = ${id}`;
  return db.query(query);
  // 攻击者可以输入: 1 OR 1=1
};

// 安全的参数化查询
const getUserById = (id) => {
  const query = 'SELECT * FROM users WHERE id = ?';
  return db.query(query, [id]);
};

// 使用 ORM（如 Sequelize）
const User = require('./models/User');

const getUserById = async (id) => {
  return await User.findByPk(id);
};

// 输入验证
function validateUserId(id) {
  // 确保 ID 是数字
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    throw new Error('Invalid user ID');
  }
  return numId;
}
```

## 身份认证与授权

### JWT 安全实践

```javascript
const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')

class JWTService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET
    this.accessTokenExpiry = '15m'
    this.refreshTokenExpiry = '7d'
  }

  generateTokenPair(payload) {
    const accessToken = jwt.sign(
      payload,
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry }
    )

    const refreshToken = jwt.sign(
      { ...payload, tokenType: 'refresh' },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    )

    return { accessToken, refreshToken }
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret)
    }
    catch (error) {
      throw new Error('Invalid access token')
    }
  }

  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret)
      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type')
      }
      return decoded
    }
    catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  // Token 黑名单（使用 Redis）
  async blacklistToken(token) {
    const decoded = jwt.decode(token)
    const expiry = decoded.exp - Math.floor(Date.now() / 1000)
    await redis.setex(`blacklist:${token}`, expiry, 'true')
  }

  async isTokenBlacklisted(token) {
    return await redis.exists(`blacklist:${token}`)
  }
}
```

### 安全的密码处理

```javascript
const bcrypt = require('bcrypt')
const zxcvbn = require('zxcvbn')

class PasswordService {
  constructor() {
    this.saltRounds = 12
  }

  // 密码强度检查
  checkPasswordStrength(password) {
    const result = zxcvbn(password)

    return {
      score: result.score, // 0-4
      feedback: result.feedback,
      crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
      isStrong: result.score >= 3
    }
  }

  // 密码要求验证
  validatePassword(password) {
    const requirements = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonWords: !this.isCommonPassword(password)
    }

    const isValid = Object.values(requirements).every(req => req)

    return {
      isValid,
      requirements,
      strength: this.checkPasswordStrength(password)
    }
  }

  async hashPassword(password) {
    // 验证密码强度
    const validation = this.validatePassword(password)
    if (!validation.isValid) {
      throw new Error('Password does not meet requirements')
    }

    return await bcrypt.hash(password, this.saltRounds)
  }

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash)
  }

  isCommonPassword(password) {
    const commonPasswords = [
      'password',
      '123456',
      'password123',
      'admin',
      'qwerty'
    ]
    return commonPasswords.includes(password.toLowerCase())
  }
}
```

## 数据传输安全

### HTTPS 和安全头

```javascript
const express = require('express')
const helmet = require('helmet')

const app = express()

// 使用 Helmet 设置安全头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
      fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      scriptSrc: ['\'self\''],
      connectSrc: ['\'self\'', 'https://api.example.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// 自定义安全中间件
function securityHeaders(req, res, next) {
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY')

  // 防止 MIME 类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // XSS 防护
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // 引用者策略
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 权限策略
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  next()
}

app.use(securityHeaders)
```

### 数据加密

```javascript
const crypto = require('node:crypto')

class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm'
    this.secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32)
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.secretKey)
    cipher.setAAD(Buffer.from('additional-data'))

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex')
    }
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(
      this.algorithm,
      this.secretKey,
      Buffer.from(encryptedData.iv, 'hex')
    )

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))
    decipher.setAAD(Buffer.from('additional-data'))

    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // 敏感数据哈希
  hashSensitiveData(data, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(32).toString('hex')
    }

    const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512')

    return {
      hash: hash.toString('hex'),
      salt
    }
  }
}
```

## 输入验证与清理

### 前端验证

```javascript
class InputValidator {
  static sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string')
      return ''

    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // 移除潜在的 HTML 标签
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  static validateURL(url) {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    }
    catch {
      return false
    }
  }

  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9.-]/gi, '_')
      .replace(/\.+/g, '.')
      .slice(0, 255)
  }

  static validatePhoneNumber(phone) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''))
  }
}

// 表单验证示例
function validateForm(formData) {
  const errors = {}

  // 验证用户名
  if (!formData.username || formData.username.length < 3) {
    errors.username = '用户名至少需要3个字符'
  }

  // 验证邮箱
  if (!InputValidator.validateEmail(formData.email)) {
    errors.email = '请输入有效的邮箱地址'
  }

  // 验证 URL
  if (formData.website && !InputValidator.validateURL(formData.website)) {
    errors.website = '请输入有效的网址'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
```

### 后端验证

```javascript
const Joi = require('joi')

// 使用 Joi 进行数据验证
const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#\$%\^&\*])'))
    .required(),

  age: Joi.number()
    .integer()
    .min(13)
    .max(120),

  website: Joi.string()
    .uri()
    .optional()
})

// 验证中间件
function validateUser(req, res, next) {
  const { error, value } = userSchema.validate(req.body)

  if (error) {
    return res.status(400).json({
      error: '数据验证失败',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    })
  }

  req.validatedData = value
  next()
}
```

## 文件上传安全

```javascript
const crypto = require('node:crypto')
const path = require('node:path')
const multer = require('multer')

// 安全的文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    // 生成安全的文件名
    const uniqueSuffix = crypto.randomBytes(16).toString('hex')
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  }
})

function fileFilter(req, file, cb) {
  // 允许的文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']

  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true)
  }
  else {
    cb(new Error('不支持的文件类型'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // 最多5个文件
  }
})

// 文件验证
function validateUploadedFile(file) {
  // 验证文件头（魔数）
  const fileSignatures = {
    'image/jpeg': ['FFD8FF'],
    'image/png': ['89504E47'],
    'image/gif': ['47494638']
  }

  const buffer = fs.readFileSync(file.path)
  const hex = buffer.toString('hex', 0, 4).toUpperCase()

  const expectedSignatures = fileSignatures[file.mimetype]
  if (!expectedSignatures || !expectedSignatures.some(sig => hex.startsWith(sig))) {
    throw new Error('文件内容与扩展名不匹配')
  }

  return true
}
```

## 安全监控与日志

```javascript
class SecurityMonitor {
  constructor() {
    this.suspiciousActivities = new Map()
    this.ipAttempts = new Map()
  }

  // 监控可疑活动
  logSuspiciousActivity(ip, activity, severity = 'medium') {
    const key = `${ip}:${activity}`
    const attempts = this.suspiciousActivities.get(key) || 0
    this.suspiciousActivities.set(key, attempts + 1)

    console.log({
      timestamp: new Date().toISOString(),
      type: 'security_alert',
      ip,
      activity,
      severity,
      attempts: attempts + 1
    })

    // 超过阈值时采取行动
    if (attempts > 5) {
      this.blockIP(ip, activity)
    }
  }

  // IP 限制
  checkRateLimit(ip, endpoint) {
    const key = `${ip}:${endpoint}`
    const now = Date.now()
    const windowStart = now - 60000 // 1分钟窗口

    if (!this.ipAttempts.has(key)) {
      this.ipAttempts.set(key, [])
    }

    const attempts = this.ipAttempts.get(key)

    // 清理过期的尝试
    const validAttempts = attempts.filter(time => time > windowStart)
    this.ipAttempts.set(key, validAttempts)

    // 检查是否超过限制
    if (validAttempts.length >= 100) { // 每分钟最多100次请求
      this.logSuspiciousActivity(ip, 'rate_limit_exceeded', 'high')
      return false
    }

    validAttempts.push(now)
    return true
  }

  blockIP(ip, reason) {
    console.log({
      timestamp: new Date().toISOString(),
      type: 'ip_blocked',
      ip,
      reason
    })

    // 在实际应用中，这里会添加到防火墙规则或 Redis 黑名单
  }
}

// 安全中间件
const securityMonitor = new SecurityMonitor()

function securityMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress

  // 检查频率限制
  if (!securityMonitor.checkRateLimit(ip, req.path)) {
    return res.status(429).json({ error: '请求过于频繁' })
  }

  // 检查可疑的用户代理
  const userAgent = req.get('User-Agent')
  if (!userAgent || userAgent.length < 10) {
    securityMonitor.logSuspiciousActivity(ip, 'suspicious_user_agent')
  }

  // 检查可疑的请求头
  if (req.get('X-Forwarded-For') && req.get('X-Real-IP')) {
    securityMonitor.logSuspiciousActivity(ip, 'proxy_header_spoofing')
  }

  next()
}
```

Web 安全是一个持续演进的领域，需要开发者保持警惕并及时更新安全知识。通过实施多层防护策略，包括输入验证、输出编码、身份验证、授权控制和安全监控，可以大大提高 Web 应用的安全性。

记住，安全不是一次性的工作，而是需要在整个开发生命周期中持续关注的重要议题。

---

**安全资源推荐：**

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [Security Headers](https://securityheaders.com/)
