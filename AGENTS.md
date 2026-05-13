# AGENTS - 水浒横版RPG开发技术规范与检测标准

---

## 目录
1. [前端开发规范](#前端开发规范)
2. [后端开发规范](#后端开发规范)
3. [代码质量检测](#代码质量检测)
4. [性能检测标准](#性能检测标准)
5. [网络通信规范](#网络通信规范)
6. [数据库规范](#数据库规范)
7. [测试规范](#测试规范)
8. [部署规范](#部署规范)

---

## 前端开发规范

### 技术栈要求
```
- TypeScript 5.0+
- Phaser.js 3.80+
- Three.js 0.160+
- Vite 5.0+
- ESLint 8.0+
- Prettier 3.0+
```

### 项目结构
```
src/
├── game/              # Phaser游戏核心
│   ├── scenes/       # 场景（战斗、主城、副本）
│   ├── objects/      # 游戏对象（玩家、怪物、NPC）
│   ├── systems/      # 系统（战斗、技能、AI）
│   └── utils/        # 工具函数
├── three/             # Three.js 3D渲染
│   ├── scenes/
│   ├── models/
│   └── shaders/
├── ui/                # UI组件
│   ├── components/
│   ├── pages/
│   └── styles/
├── network/           # 网络通信
│   ├── http/
│   └── socket/
├── shared/            # 共享类型与常量
└── assets/            # 资源文件
```

### 代码规范检测
| 检测项 | 标准 | 工具 |
|--------|------|------|
| TypeScript类型检查 | 严格模式，noImplicitAny | tsc --noEmit |
| ESLint代码检查 | 无error，warning<10 | eslint src/ |
| Prettier格式 | 统一格式化 | prettier --check |
| 命名规范 | PascalCase(类), camelCase(变量), UPPER_CASE(常量) | eslint |
| 注释覆盖率 | 公共API>80% | TypeDoc |
| 循环复杂度 | 单个函数<20 | eslint complexity |

### 性能优化检测
| 检测项 | 标准 | 检测方法 |
|--------|------|----------|
| 帧率 | 中高端机≥60fps，低端机≥30fps | Chrome DevTools |
| 内存占用 | 战斗场景<500MB | Memory Profiler |
| 包体大小 | 首包<100MB，完整包<500MB | 构建统计 |
| 加载时间 | 首屏<3s，场景切换<1s | Performance |
| 对象池复用率 | >90%游戏对象 | 自定义统计 |
| 视口剔除 | 屏幕外对象不渲染 | 调试模式 |

---

## 后端开发规范

### 技术栈要求
```
- Node.js 20+
- NestJS 10+
- TypeScript 5.0+
- MongoDB 6.0+
- Redis 7.0+
- Socket.io 4.0+
- Docker
```

### 项目结构
```
src/
├── modules/
│   ├── user/          # 用户模块
│   ├── game/          # 游戏模块
│   ├── battle/        # 战斗模块
│   ├── team/          # 组队模块
│   ├── chat/          # 聊天模块
│   └── guild/         # 军团模块
├── core/
│   ├── database/      # 数据库
│   ├── cache/         # 缓存
│   ├── guard/         # 鉴权
│   └── interceptors/ # 拦截器
├── shared/
│   ├── dto/
│   ├── entities/
│   └── utils/
└── main.ts
```

### 代码规范检测
| 检测项 | 标准 | 工具 |
|--------|------|------|
| TypeScript类型检查 | 严格模式 | tsc --noEmit |
| ESLint代码检查 | 无error | eslint src/ |
| API文档 | RESTful规范 | Swagger/OpenAPI |
| 错误处理 | 统一异常处理，错误码规范 | 代码审查 |
| 日志规范 | 分级日志（debug/info/warn/error） | Winston |
| 安全检测 | SQL注入、XSS、CSRF防护 | npm audit |

### 性能检测
| 检测项 | 标准 | 检测方法 |
|--------|------|----------|
| API响应时间 | P95<200ms | JMeter/Artillery |
| 并发连接数 | 支持5000并发 | 压力测试 |
| 数据库查询 | 慢查询<100ms | MongoDB Profiler |
| 缓存命中率 | >80% | Redis统计 |
| 内存占用 | 单实例<2GB | PM2 monit |
| CPU使用率 | <70% | 监控系统 |

---

## 代码质量检测

### Git提交规范
```
<type>(<scope>): <subject>

type: feat/fix/docs/style/refactor/perf/test/chore
```

### CI/CD流水线检测
| 阶段 | 检测内容 | 阈值 |
|------|----------|------|
| 构建 | 编译成功 | 必须通过 |
| 测试 | 单元测试通过 | 覆盖率>80% |
| Lint | 代码检查通过 | 0 error |
| 安全 | 漏洞扫描 | 无高危漏洞 |
| 构建产物 | 包体大小 | 前端<500MB |

### 代码审查清单
- [ ] 代码符合项目规范
- [ ] 命名清晰有意义
- [ ] 注释充分
- [ ] 无重复代码
- [ ] 错误处理完善
- [ ] 性能考虑周全
- [ ] 安全风险评估
- [ ] 测试用例覆盖

---

## 性能检测标准

### 战斗同步性能
| 指标 | 要求 |
|------|------|
| 状态广播频率 | 15次/秒 |
| 输入延迟 | <100ms |
| 同步误差 | <50ms |
| 丢包容忍 | 自动重连，状态恢复 |
| 断线重连 | <3秒内恢复 |

### 客户端性能分级
| 设备等级 | 帧率要求 | 特效等级 |
|----------|----------|----------|
| 高端（旗舰机） | 60fps | 全部特效 |
| 中端（主流机） | 60fps | 中特效 |
| 低端（入门机） | 30fps | 低特效 |

---

## 网络通信规范

### HTTP接口规范
| 项 | 规范 |
|----|------|
| 请求方法 | GET(查询)/POST(创建)/PUT(更新)/DELETE(删除) |
| 状态码 | 200(成功)/400(参数错误)/401(未授权)/500(服务器错误) |
| 响应格式 | { code: number, message: string, data: T } |
| 超时时间 | 10秒 |
| 重试机制 | 失败重试3次，指数退避 |

### Socket事件规范
```typescript
// 客户端→服务端
interface ClientToServerEvents {
  'battle:move': { x: number; y: number; timestamp: number };
  'battle:attack': { skillId: string; targetId: string };
  'team:join': { roomId: string };
  'chat:message': { channel: string; content: string };
}

// 服务端→客户端
interface ServerToClientEvents {
  'battle:state': { players: any[]; timestamp: number };
  'battle:damage': { targetId: string; damage: number };
  'team:updated': { members: any[] };
}
```

### 数据压缩
- HTTP: gzip压缩
- Socket: msgpack二进制序列化

---

## 数据库规范

### MongoDB设计规范
| 项 | 规范 |
|----|------|
| 集合命名 | snake_case，复数形式 |
| 字段命名 | camelCase |
| 索引 | 高频查询字段必须建索引 |
| _id | ObjectId类型 |
| 时间戳 | createdAt, updatedAt自动维护 |
| 软删除 | isDeleted字段 |

### Redis缓存策略
| 数据类型 | 缓存时间 |
|----------|----------|
| 用户会话 | 7天 |
| 在线用户 | 实时 |
| 排行榜 | 5分钟 |
| 配置数据 | 1小时 |
| 热点数据 | LRU淘汰 |

---

## 测试规范

### 测试类型与覆盖率要求
| 测试类型 | 覆盖率要求 | 工具 |
|----------|------------|------|
| 单元测试 | >80% | Jest |
| 集成测试 | >60% | Jest + Supertest |
| E2E测试 | 核心流程 | Playwright |
| 性能测试 | - | JMeter/Artillery |
| 压力测试 | - | k6 |

### 战斗系统测试用例
- [ ] 角色移动同步
- [ ] 技能释放判定
- [ ] 伤害计算准确
- [ ] 状态同步正确
- [ ] 网络延迟模拟
- [ ] 断线重连测试
- [ ] 多人组队战斗

---

## 部署规范

### Docker镜像规范
```dockerfile
# 前端
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### 环境配置
| 环境 | 说明 |
|------|------|
| development | 开发环境，热重载 |
| staging | 测试环境，数据隔离 |
| production | 生产环境，性能优化 |

### 监控告警
| 指标 | 告警阈值 |
|------|----------|
| CPU使用率 | >80%持续5分钟 |
| 内存使用率 | >85% |
| 错误率 | >5% |
| 响应时间 | P95>500ms |
| 磁盘空间 | >90% |

---

## AGENTS工作流

### 开发流程
1. 需求分析 → 技术方案评审
2. 开发 → 本地自测
3. 代码提交 → 自动Lint检查
4. PR提交 → Code Review
5. 合并主干 → CI自动测试
6. 部署测试环境 → QA测试
7. 发布生产 → 监控告警

### AGENTS角色
- **Frontend Agent**: 前端开发、性能优化
- **Backend Agent**: 后端开发、API设计
- **Gameplay Agent**: 战斗系统、游戏逻辑
- **QA Agent**: 测试用例、自动化测试
- **DevOps Agent**: 部署、监控、CI/CD

---

*文档版本: v1.0*
*最后更新: 2026-05-13*