---
title: Stellar 多语言内容体系
date: 2026-08-18
status: 已实施
---

# 多语言内容体系方案

## 1. 问题与目标

为 issue #294 提供完整的语言入口，而不是只增加一个静态按钮。主题需要能够识别当前页面语言，关联同一翻译组的页面，并输出可访问且可被搜索引擎理解的语言链接。

## 2. 技术方案

- `language_switcher` 配置控制语言入口及各语言首页。
- 页面通过 `lang` 指定语言，通过 `translation_key` 关联同一内容的不同语言版本。
- `language_versions()` helper 从 Hexo locals 中查找同组页面和文章。
- 语言入口放在主导航菜单末尾，使用原生 `<details>`，无需新增客户端状态管理。
- head 中只输出已存在翻译页面的 `alternate hreflang`。

## 3. 影响范围

- `scripts/helpers/language.js`
- `layout/_partial/sidebar/menu.ejs`
- `layout/_partial/head.ejs`
- `source/css/_components/sidebar/menu.styl`
- `languages/*.yml`、`_config.yml`、知识库本地化文档

## 4. 验证方式

- 页面无 `translation_key` 时仍能显示语言首页入口。
- 同一 `translation_key` 的页面互相链接。
- 无翻译版本时不输出错误的 `hreflang` 页面链接。
- 主题构建和知识库核查通过。
