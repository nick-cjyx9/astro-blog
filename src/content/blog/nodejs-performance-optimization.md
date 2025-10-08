---
title: "Node.js 性能优化与监控实践"
description: "深入探讨 Node.js 应用的性能优化策略，包括内存管理、事件循环优化、集群模式和生产环境监控。"
pubDate: 2024-12-20
lastModified: 2025-01-03
author: "Nick Chen"
tags: ["Node.js", "性能优化", "监控", "后端开发", "JavaScript"]
---

Node.js 的非阻塞 I/O 和事件驱动架构使其在高并发场景下表现出色，但要充分发挥其潜力，需要深入理解其工作原理并采用适当的优化策略。

## 理解 Node.js 事件循环

### 事件循环阶段

```javascript
// 事件循环的六个阶段示例
console.log('=== Program Starts ===')

// 1. Timer 阶段
setTimeout(() => console.log('Timer 1'), 0)
setTimeout(() => console.log('Timer 2'), 0)

// 2. I/O callbacks 阶段
setImmediate(() => console.log('setImmediate 1'))

// 3. Poll 阶段
process.nextTick(() => console.log('nextTick 1'))

// 微任务队列
Promise.resolve().then(() => console.log('Promise 1'))

console.log('=== Program Ends ===')

// 输出顺序分析
/*
=== Program Starts ===
=== Program Ends ===
nextTick 1
Promise 1
Timer 1
Timer 2
setImmediate 1
*/
```

### 事件循环监控

```javascript
const { performance, PerformanceObserver } = require('node:perf_hooks')

// 监控事件循环延迟
function monitorEventLoop() {
  const obs = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      console.log(`Event Loop Lag: ${entry.duration.toFixed(2)}ms`)

      // 如果延迟超过阈值，记录警告
      if (entry.duration > 100) {
        console.warn('⚠️  Event loop is blocked!')
      }
    })
  })

  obs.observe({ entryTypes: ['measure'] })

  setInterval(() => {
    const start = performance.now()
    setImmediate(() => {
      const lag = performance.now() - start
      performance.mark('event-loop-start')
      performance.mark('event-loop-end')
      performance.measure('event-loop-lag', 'event-loop-start', 'event-loop-end')
    })
  }, 1000)
}

monitorEventLoop()
```

## 内存管理与优化

### 内存泄漏检测

```javascript
const process = require('node:process')

// 内存使用监控
function memoryMonitor() {
  const usage = process.memoryUsage()

  console.log({
    rss: `${Math.round(usage.rss / 1024 / 1024 * 100) / 100} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
    external: `${Math.round(usage.external / 1024 / 1024 * 100) / 100} MB`,
  })
}

// 检测内存泄漏
class MemoryLeakDetector {
  constructor() {
    this.baseline = process.memoryUsage()
    this.samples = []
  }

  sample() {
    const current = process.memoryUsage()
    this.samples.push({
      timestamp: Date.now(),
      heapUsed: current.heapUsed,
      heapTotal: current.heapTotal,
      rss: current.rss
    })

    // 保留最近 100 个样本
    if (this.samples.length > 100) {
      this.samples.shift()
    }
  }

  detectLeak() {
    if (this.samples.length < 10)
      return false

    const recent = this.samples.slice(-10)
    const old = this.samples.slice(0, 10)

    const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length
    const oldAvg = old.reduce((sum, s) => sum + s.heapUsed, 0) / old.length

    const growthRate = (recentAvg - oldAvg) / oldAvg

    return growthRate > 0.1 // 10% 增长被认为是潜在泄漏
  }
}

const detector = new MemoryLeakDetector()
setInterval(() => {
  detector.sample()
  if (detector.detectLeak()) {
    console.warn('🔥 Potential memory leak detected!')
  }
}, 5000)
```

### 对象池模式

```javascript
// 对象池减少 GC 压力
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.pool = []

    // 预先创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop()
    }
    return this.createFn()
  }

  release(obj) {
    this.resetFn(obj)
    this.pool.push(obj)
  }

  size() {
    return this.pool.length
  }
}

// 使用示例：HTTP 响应对象池
const responsePool = new ObjectPool(
  () => ({ status: 200, headers: {}, body: '' }),
  (obj) => {
    obj.status = 200
    obj.headers = {}
    obj.body = ''
  }
)

function handleRequest(req, res) {
  const response = responsePool.acquire()

  try {
    // 处理请求
    response.status = 200
    response.body = 'Hello World'

    res.writeHead(response.status)
    res.end(response.body)
  }
  finally {
    responsePool.release(response)
  }
}
```

## 性能分析工具

### 内置性能分析

```javascript
const { performance, PerformanceObserver } = require('node:perf_hooks')

// HTTP 请求性能分析
function profileHTTPServer() {
  const http = require('node:http')

  const server = http.createServer((req, res) => {
    const startTime = performance.now()

    // 模拟业务逻辑
    processRequest(req, (result) => {
      const endTime = performance.now()
      const duration = endTime - startTime

      // 记录性能指标
      console.log(`${req.method} ${req.url} - ${duration.toFixed(2)}ms`)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(result))
    })
  })

  return server
}

// CPU 密集型任务分析
function profileCPUTask(taskName, fn) {
  const startTime = process.hrtime.bigint()
  const startCPU = process.cpuUsage()

  const result = fn()

  const endTime = process.hrtime.bigint()
  const endCPU = process.cpuUsage(startCPU)

  const wallTime = Number(endTime - startTime) / 1000000 // 转换为毫秒
  const cpuTime = (endCPU.user + endCPU.system) / 1000 // 转换为毫秒

  console.log(`Task: ${taskName}`)
  console.log(`Wall time: ${wallTime.toFixed(2)}ms`)
  console.log(`CPU time: ${cpuTime.toFixed(2)}ms`)
  console.log(`CPU usage: ${((cpuTime / wallTime) * 100).toFixed(2)}%`)

  return result
}
```

### 自定义性能指标

```javascript
class PerformanceCollector {
  constructor() {
    this.metrics = new Map()
    this.timers = new Map()
  }

  startTimer(name) {
    this.timers.set(name, process.hrtime.bigint())
  }

  endTimer(name) {
    const startTime = this.timers.get(name)
    if (!startTime)
      return

    const duration = Number(process.hrtime.bigint() - startTime) / 1000000
    this.recordMetric(name, duration)
    this.timers.delete(name)

    return duration
  }

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0
      })
    }

    const metric = this.metrics.get(name)
    metric.count++
    metric.total += value
    metric.min = Math.min(metric.min, value)
    metric.max = Math.max(metric.max, value)
    metric.avg = metric.total / metric.count
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  reset() {
    this.metrics.clear()
    this.timers.clear()
  }
}

const perf = new PerformanceCollector()

// 使用示例
async function databaseQuery(sql) {
  perf.startTimer('db_query')

  try {
    // 模拟数据库查询
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
    const result = { data: 'query result' }

    perf.endTimer('db_query')
    return result
  }
  catch (error) {
    perf.endTimer('db_query')
    throw error
  }
}
```

## 集群模式和负载均衡

### 集群设置

```javascript
const cluster = require('node:cluster')
const numCPUs = require('node:os').cpus().length

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)
  console.log(`Starting ${numCPUs} workers`)

  // 创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  // 监听工作进程退出
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
    console.log('Starting a new worker')
    cluster.fork()
  })

  // 监听工作进程状态
  cluster.on('listening', (worker, address) => {
    console.log(`Worker ${worker.process.pid} listening on ${address.address}:${address.port}`)
  })
}
else {
  // 工作进程代码
  const http = require('node:http')

  const server = http.createServer((req, res) => {
    res.writeHead(200)
    res.end(`Hello from worker ${process.pid}\n`)
  })

  server.listen(3000, () => {
    console.log(`Worker ${process.pid} started`)
  })
}
```

### 优雅关闭

```javascript
class GracefulShutdown {
  constructor(server) {
    this.server = server
    this.connections = new Set()
    this.isShuttingDown = false

    // 跟踪活跃连接
    server.on('connection', (conn) => {
      this.connections.add(conn)
      conn.on('close', () => {
        this.connections.delete(conn)
      })
    })
  }

  async shutdown(signal) {
    if (this.isShuttingDown)
      return
    this.isShuttingDown = true

    console.log(`Received ${signal}. Starting graceful shutdown...`)

    // 停止接受新连接
    this.server.close(() => {
      console.log('HTTP server closed')
    })

    // 关闭现有连接
    for (const conn of this.connections) {
      conn.destroy()
    }

    // 等待所有异步操作完成
    await this.waitForAsyncOperations()

    console.log('Graceful shutdown completed')
    process.exit(0)
  }

  async waitForAsyncOperations() {
    // 等待数据库连接关闭、缓存清理等
    return new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })
  }
}

// 使用示例
const server = http.createServer(/* ... */)
const gracefulShutdown = new GracefulShutdown(server)

process.on('SIGTERM', () => gracefulShutdown.shutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown.shutdown('SIGINT'))
```

## 缓存策略

### 内存缓存

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (this.cache.has(key)) {
      // 移动到最前面（最近使用）
      const value = this.cache.get(key)
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return null
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    else if (this.cache.size >= this.capacity) {
      // 删除最少使用的项
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  clear() {
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }
}

// 带过期时间的缓存
class TTLCache {
  constructor() {
    this.cache = new Map()
    this.timers = new Map()
  }

  set(key, value, ttl = 60000) {
    // 清除现有定时器
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
    }

    this.cache.set(key, value)

    // 设置过期定时器
    const timer = setTimeout(() => {
      this.cache.delete(key)
      this.timers.delete(key)
    }, ttl)

    this.timers.set(key, timer)
  }

  get(key) {
    return this.cache.get(key)
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
      this.timers.delete(key)
    }
    return this.cache.delete(key)
  }
}
```

## 监控和日志

### 健康检查端点

```javascript
class HealthCheck {
  constructor() {
    this.checks = new Map()
  }

  addCheck(name, checkFn) {
    this.checks.set(name, checkFn)
  }

  async runChecks() {
    const results = {}
    let overallStatus = 'healthy'

    for (const [name, checkFn] of this.checks) {
      try {
        const startTime = Date.now()
        const result = await checkFn()
        const duration = Date.now() - startTime

        results[name] = {
          status: result ? 'healthy' : 'unhealthy',
          duration: `${duration}ms`,
          timestamp: new Date().toISOString()
        }

        if (!result) {
          overallStatus = 'unhealthy'
        }
      }
      catch (error) {
        results[name] = {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        }
        overallStatus = 'unhealthy'
      }
    }

    return {
      status: overallStatus,
      checks: results,
      timestamp: new Date().toISOString()
    }
  }
}

// 设置健康检查
const healthCheck = new HealthCheck()

healthCheck.addCheck('database', async () => {
  // 检查数据库连接
  try {
    await db.ping()
    return true
  }
  catch (error) {
    return false
  }
})

healthCheck.addCheck('memory', () => {
  const usage = process.memoryUsage()
  const heapUsedMB = usage.heapUsed / 1024 / 1024
  return heapUsedMB < 500 // 内存使用小于 500MB
})

healthCheck.addCheck('event_loop', () => {
  return new Promise((resolve) => {
    const start = process.hrtime()
    setImmediate(() => {
      const delta = process.hrtime(start)
      const nanosec = delta[0] * 1e9 + delta[1]
      const millisec = nanosec / 1e6
      resolve(millisec < 100) // 事件循环延迟小于 100ms
    })
  })
})
```

### 结构化日志

```javascript
class Logger {
  constructor(service, version, environment) {
    this.service = service
    this.version = version
    this.environment = environment
  }

  log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      version: this.version,
      environment: this.environment,
      message,
      ...meta,
      pid: process.pid,
      memory: process.memoryUsage(),
    }

    console.log(JSON.stringify(logEntry))
  }

  info(message, meta) {
    this.log('info', message, meta)
  }

  warn(message, meta) {
    this.log('warn', message, meta)
  }

  error(message, meta) {
    this.log('error', message, meta)
  }

  debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta)
    }
  }
}

const logger = new Logger('api-server', '1.0.0', process.env.NODE_ENV)

// 请求日志中间件
function requestLogger(req, res, next) {
  const startTime = Date.now()

  logger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  })

  res.on('finish', () => {
    const duration = Date.now() - startTime
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    })
  })

  next()
}
```

Node.js 性能优化是一个持续的过程，需要根据具体的应用场景和业务需求来调整策略。通过理解事件循环、合理管理内存、使用集群模式和完善的监控，可以构建出高性能、可靠的 Node.js 应用。

---

**推荐工具：**

- [clinic.js](https://clinicjs.org/) - Node.js 性能分析工具
- [0x](https://github.com/davidmarkclements/0x) - 火焰图分析
- [autocannon](https://github.com/mcollina/autocannon) - HTTP 压力测试
