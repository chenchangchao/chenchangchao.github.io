# Astro Starter Kit: Blog

```sh
bun create astro@latest -- --template blog
git add .
git commit -m "Initial commit"
git push -u origin main
git push
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

Features:

- ✅ Minimal styling (make it your own!)
- ✅ 100/100 Lighthouse performance
- ✅ SEO-friendly with canonical URLs and Open Graph data
- ✅ Sitemap support
- ✅ RSS Feed support
- ✅ Markdown & MDX support

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## everyday idea
### web页面浏览体验提升
* 学习了前端后可以做什么，网页浏览用户体验比较糟糕，开发一款浏览器插件，修改前端页面，提升用户体验。
* https://medium.com/hackernoon/introducing-immer-immutability-the-easy-way-9d73d8f71cb3， 这个网页的背景颜色是深绿色的，看起来视觉疲劳，我可以通过修改本地前端页面，实现更友好的视觉体验嘛
* 用户样式扩展：安装类似 Stylus 或 Stylish 的扩展，然后针对该 Medium 页面的 URL 写入自定义 CSS 规则，比如：
* 开发者工具：你也可以打开浏览器的开发者工具（F12），手动修改页面上的 CSS 样式。不过这种方法的修改在刷新页面后不会保留，适合临时调试。
* 用户脚本管理器：另一种方式是使用 Tampermonkey 或 Greasemonkey 来编写脚本，动态注入你自己的 CSS 样式。
### 微信文章去广告
* 鹅厂吃相太难看，广告太多，移动端去广告，微信文章去广告，突破微信生态壁垒
### 掘金计划写文章
* npm常用包介绍，按照STAR原则，详细对比说明