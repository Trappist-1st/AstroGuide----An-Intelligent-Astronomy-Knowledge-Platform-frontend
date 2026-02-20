# AstroGuide Frontend

AstroGuide 前端项目（Vue 3 + TypeScript + Vite）。

面向天文学习者，提供会话式 AI 问答、流式回答展示、术语解释与引用信息展示能力。

---

## 功能特性（MVP）

- Landing 页快速提问
- Chat 主页面（会话列表 + 消息区 + 输入区）
- SSE 流式回答（`meta` / `delta` / `done` / `error`）
- 生成中可停止，保留已生成内容
- 全局难度与语言切换（`basic|intermediate|advanced`，`zh|en`）
- `[[term:xxx]]` 术语点击解释（Concept Popover）
- 引用来源面板（Citations）
- 全局错误提示（含限流提示）

---

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia（状态管理）
- Vue Router
- markdown-it + KaTeX（Markdown + 数学公式）
- DOMPurify（渲染安全）

---

## 项目结构

```text
src/
	components/
		chat/                # 聊天域组件
		common/              # 通用组件
	pages/                 # Landing / Chat 页面
	router/                # 路由
	services/              # API 与 SSE 封装
	stores/                # Pinia 状态
	types/                 # 类型定义
	App.vue
	main.ts
	style.css
```

---

## 快速开始

### 1) 安装依赖

```bash
npm install
```

### 2) 启动开发环境

```bash
npm run dev
```

### 3) 生产构建

```bash
npm run build
```

### 4) 本地预览构建产物

```bash
npm run preview
```

---

## 环境变量

可在项目根目录新增 `.env`：

```bash
VITE_API_BASE_URL=http://localhost:8093/api/v0
```

若未配置，默认使用：

`http://localhost:8093/api/v0`

---

## 前后端接口约定（核心）

- 所有业务请求需带 `X-Client-Id`
- 会话：`/conversations`
- 消息提交：`/conversations/{conversationId}/messages`
- 流式回答：`/conversations/{conversationId}/messages/{messageId}/stream`
- 术语查询：`/concepts/lookup`

详见设计文档：

- `docs/AstroGuide – 前端设计文档.md`

---

## 已知说明

### 1) 首次或依赖变更后出现 Vite 依赖预构建报错

可执行：

```bash
npm run dev -- --force
```

必要时删除 `node_modules/.vite` 后重启。

### 2) 5173 端口占用

Vite 会自动切换到其他端口（例如 5174），属正常现象。

---

## 开发建议

- 页面组件负责展示与交互，业务逻辑尽量放在 Pinia `actions`
- SSE 事件统一由 `messageStore` 消费，保持单一状态机
- 接口错误统一走 `appStore.notifyApiError()`

---

## License

仅用于学习与项目开发使用。
