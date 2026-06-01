# TextManager

轻量 Windows 桌面文本管理工具，用于管理 AI 提示词、命令行片段和文件路径。

## 功能

- 两栏布局：左侧分类、右侧片段卡片列表
- 片段正文前两行预览，超出截断
- 新建/编辑/删除分类与片段
- 一键复制到剪贴板（按钮或 Ctrl+C）
- 本地 JSON 持久化（`%APPDATA%/TextManager/data.json`）

## 开发

```bash
cd text-manager
npm install
npm run tauri dev
```

## 构建 exe

```bash
npm run tauri:build
```

或：`npm run tauri build -- --no-bundle`

构建产物：`src-tauri/target/release/text-manager.exe`

可直接双击运行，无需安装。

> 默认不打包 NSIS 安装程序（避免从 GitHub 下载 NSIS 超时）。若需要安装包：`npm run tauri:build:installer`（需能访问 GitHub）。

## 技术栈

- Tauri 2 + React + TypeScript
- Tailwind CSS
- Rust 本地存储 + 剪贴板
