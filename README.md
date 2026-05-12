<div align="center">

# 🌿 宠物手帐 · Pet Journal

**给毛孩子的专属记忆本**

把每一个温柔瞬间做成手帐——记录吃饭、散步、犯傻和睡相，用文字、心情和照片，拼出属于你和毛孩子的小日子。

[**🌍 海外访问**](https://pet-journal.vincenv72.workers.dev) · [**🇨🇳 国内访问**](https://pet-journal-cn-d2gigyjbz13fa448c-1253801547.tcloudbaseapp.com) · [**📦 GitHub 仓库**](https://github.com/vincenv72-spec/pet-journal)

</div>

---

## ✨ 功能一览

### 🎨 视觉
- **手绘水彩森林插画**作整页氛围底图（每个页面专属插画）
- **6 层 Apple 式堆叠**：插画 + 光斑 + 色温 + 噪点 + 渐隐 + 内容
- **半透明玻璃卡片**，背景插画清晰可见
- **4 套主题** —— 同一组图片实现晨光 / 黄昏 / 月夜 / 春日 4 种氛围
- **水彩光点拖尾** + 持续飘落的小元素（叶 / 樱花 / 萤火虫，跟主题变）

### 📝 手帐
- 写手帐：标题 / 心情 emoji / 日期 / 关联宠物 / 上传照片 / 标签
- **12 个预设标签**（吃喝 🍖 / 出游 🌳 / 就医 🏥 / 撒娇 🥰 ...）+ 自由输入
- 编辑、删除、按宠物筛选、按标签筛选

### 🐶 毛孩子档案
- 多宠物：名字 / 种类（猫/狗/兔/鸟/仓鼠/鱼/其他）/ 品种（24 个常见 + 自定义）/ 生日 / 头像 / 一句话介绍
- 详情页 3 Tab：**手帐墙 / Pinterest 相册 / 心情曲线**
- **心情曲线**：自定义 SVG 折线 + 心情分布条 + 自动洞察 + 30 天 emoji heatmap
- **年度回顾**：7 张 Story 卡片（统计 / 高光时刻 / 月度活跃柱状图 / 心情盘）
- **保存为图片**（html2canvas）

### 👨‍👩‍👧 家庭共享
- 邀请码（XXX-XXX-XXX 9 位字符，7 天有效）
- 共同写手帐 / 共看相册 / 共看心情
- 主人 / 成员两种角色

### 📲 体验
- **无密码登录** —— 邮箱 OTP 验证码，注册=登录
- **一键分享** —— 把单篇手帐生成精美卡片（带胶带 / 水印），保存或复制图片
- **手机端底部导航** + PWA（可"添加到主屏幕"）
- **响应式设计**

---

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| **前端** | React 19 + TypeScript |
| **构建** | Vite 8 + Tailwind CSS 4 |
| **路由** | react-router-dom |
| **动画** | Framer Motion |
| **图片导出** | html2canvas（按需懒加载） |
| **后端** | Supabase（Auth + Postgres + Storage + RLS） |
| **部署** | Cloudflare Workers（静态资源） |

### 数据库表
- `entries` — 手帐条目（标题、内容、心情、日期、照片、标签）
- `pets` — 宠物档案
- `pet_members` — 宠物 ↔ 用户多对多（共享）
- `pet_invites` — 邀请码

所有表启用 RLS，安全策略通过 `SECURITY DEFINER` 函数避免循环引用。

---

## 🚀 本地开发

```bash
# 1. 克隆 + 安装依赖
git clone https://github.com/vincenv72-spec/pet-journal.git
cd pet-journal
npm install

# 2. 配置 Supabase（可选，已 hardcode 默认值）
cp .env.example .env
# 编辑 .env 填入你自己的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY

# 3. 启动 dev server
npm run dev
# → http://localhost:5173

# 4. 生产构建预览（视觉精确还原线上）
npm run build
npx vite preview --port 4173
# → http://localhost:4173
```

> ⚠️ **dev mode 已知问题**：`backdrop-filter` 在 Vite dev 模式下渲染会比生产模式偏重糊。视觉验收建议跑 `npm run build` 后看 4173。

---

## 📁 项目结构

```
pet-journal-web/
├── public/
│   ├── bg/             # 5 张背景插画（hero/login/dashboard/editor/empty）
│   ├── icon-*.png      # PWA 图标
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx       # 手机端底部导航
│   │   ├── CursorTrail.tsx     # 水彩光点拖尾（主题化）
│   │   ├── InviteModal.tsx     # 邀请家人弹窗
│   │   ├── PhotoBackground.tsx # 整页氛围底层（6 层堆叠）
│   │   ├── ShareCard.tsx       # 单篇手帐分享卡
│   │   └── ThemePicker.tsx     # 主题切换器
│   ├── lib/
│   │   ├── auth.tsx        # AuthProvider / useAuth
│   │   ├── supabase.ts     # client + types + presets
│   │   └── theme.tsx       # 4 主题配置 + Provider
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── AuthPage.tsx        # 邮箱 OTP 登录
│   │   ├── DashboardPage.tsx   # 手帐本（筛选 / 分享 / 编辑）
│   │   ├── EditorPage.tsx      # 写/改手帐
│   │   ├── PetsPage.tsx        # 毛孩子列表 + 添加 + 用邀请码加入
│   │   ├── PetDetailPage.tsx   # 单宠物详情（3 Tab）
│   │   └── YearReviewPage.tsx  # 年度回顾（7 卡片）
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
└── package.json
```

---

## 🌈 主题系统说明

4 个主题用**同一组背景图**，只通过不同 CSS 处理实现：

| 主题 | 滤镜 | 拖尾 | 飘落 |
|------|------|------|------|
| 🌿 晨光森林 | 自然色 | 苔绿/蜂蜜/玫瑰水彩 | 🍃 🍂 🌿 ✿ |
| 🌅 黄昏森林 | sepia + 暖橘 | 番茄红/蜂蜜金 | 🍂 🌾 ✨ |
| 🌙 月夜森林 | 蓝调 + 暗化 | 萤火虫黄/月光蓝 | ✨ ⭐ |
| 🌸 春日花海 | 粉色 hue-shift | 樱花粉系列 | 🌸 🌷 ✿ |

要加新主题：在 `src/lib/theme.tsx` 的 `THEMES` 对象里加一项即可（不需要新图片）。

---

## 📦 部署

**main 分支 → 生产环境**：push 到 main 后 Cloudflare 自动构建部署到 `pet-journal.vincenv72.workers.dev`，1-2 分钟生效。

**其他分支 → 预览环境**：Cloudflare 自动给每个非 main 分支生成专属预览 URL（形如 `<branch>-pet-journal.vincenv72.workers.dev` 或 `<commit>-pet-journal.pages.dev`），不影响生产。

### 推荐工作流（避免改坏线上）

```bash
# 1. 从 main 拉新分支做改动
git checkout main && git pull
git checkout -b feature/xxx

# 2. 改代码、commit、push
git add .
git commit -m "feat: ..."
git push -u origin feature/xxx
# → Cloudflare 自动生成预览 URL，可在 PR 页或 Cloudflare 后台查看

# 3. 在预览 URL 验证 OK 后，合并到 main
git checkout main
git merge feature/xxx
git push   # → 触发生产部署

# 4. 删掉已合并的 feature 分支
git branch -d feature/xxx
git push origin --delete feature/xxx
```

### 紧急回滚

```bash
# 回滚到任一已发布版本
git checkout v0.3
git checkout -b hotfix/rollback-to-v0.3
git push   # → 看预览，确认是想要的旧版本
git checkout main && git reset --hard v0.3 && git push --force-with-lease
```

---

## 🏷 版本里程碑

- **v0.1-baseline** — 视觉风格定稿
- **v0.2-features-complete** — 多宠物 / 详情页 / 年度回顾 / 家庭共享
- **v0.3** — 无密码登录 + 标签 + 手机端 + 分享卡 + 4 主题

`git checkout v0.x-tag` 可恢复到任一版本。

---

## 🌱 致谢

- 背景插画：用户提供
- 字体：[Ma Shan Zheng](https://fonts.google.com/specimen/Ma+Shan+Zheng) · [Caveat](https://fonts.google.com/specimen/Caveat) · [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand)
- 设计灵感：参考 Apple 网页设计语言 + 日系手帐风
- 开发：Claude Code（Anthropic）

---

<div align="center">
<sub>© 2026 宠物手帐 · made with ♡ for every furry friend</sub>
</div>
