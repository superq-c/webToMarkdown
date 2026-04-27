# Web to Markdown - Chrome Extension

一键将网页内容转换为 Markdown 格式并复制到剪贴板，方便粘贴到 AI 工具中进行检索和分析。

## 功能特性

- **选择区域复制** - 进入选择模式，鼠标悬停高亮元素，点击即可转换指定区域
- **整页复制** - 自动识别正文区域，一键转换整页内容
- **丰富的格式支持** - 标题、段落、加粗/斜体、链接、图片、代码块（自动识别语言）、有序/无序列表、表格、引用块等
- **智能过滤** - 自动跳过隐藏元素、脚本、样式等无关内容
- **自动附加来源** - 输出的 Markdown 自动包含页面标题和原始 URL

## 安装方式

1. 克隆本仓库到本地：

   ```bash
   git clone https://github.com/superq-c/webToMarkdown.git
   ```

2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启右上角 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择本项目文件夹

## 使用方式

在任意网页上点击鼠标右键，可以看到两个选项：

| 菜单项 | 说明 |
|--------|------|
| **选择区域复制为 Markdown** | 进入选择模式，点击目标区域即可复制。按 `ESC` 取消。 |
| **整页复制为 Markdown** | 自动识别正文区域并复制整页内容。 |

复制成功后，页面右上角会弹出提示，直接粘贴即可使用。

## 输出示例

```markdown
# 文章标题

> Source: https://example.com/article

## 正文标题

这是一段正文内容，包含 **加粗** 和 *斜体* 文字。

- 列表项 1
- 列表项 2
```

## 项目结构

```
webToMarkdown/
├── manifest.json   # Chrome 扩展配置 (Manifest V3)
├── background.js   # Service Worker，注册右键菜单
├── content.js      # 内容脚本，HTML → Markdown 转换 + 区域选择器
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

