/* global hexo */
"use strict";

const { generatorPath, requireLayoutProfiles, toRenderNavigation } = require("../lib/layout-config");
const { routeIdentity } = require("../lib/settings");

function pagesArray(locals) {
  const pages = locals?.pages;
  if (Array.isArray(pages)) return pages;
  if (typeof pages?.toArray === "function") return pages.toArray();
  return [];
}

hexo.extend.generator.register("settings", function (locals) {
  const profiles = requireLayoutProfiles(hexo.stellar?.config);
  const profile = profiles.settings;
  const outputPath = generatorPath(profile.path);
  if (profile.enabled === false) return [];
  const targetRoute = routeIdentity(outputPath);
  const profileConflict = Object.entries(profiles).find(([id, candidate]) => {
    return id !== "settings" && typeof candidate?.path === "string" && routeIdentity(generatorPath(candidate.path)) === targetRoute;
  });
  if (profileConflict) {
    throw new Error(`Stellar v2: 设置页路径 ${profile.path} 与 profiles.${profileConflict[0]} 冲突`);
  }
  // 同路径的站点页面并入设置页：设置页提供通用控件，页面正文追加在末尾。
  const mergedPage = pagesArray(locals).find(page => routeIdentity(page.path || page.permalink) === targetRoute);
  const translate = hexo.theme?.i18n?.__(hexo.config.language) || (key => key);
  return {
    path: outputPath,
    layout: ["settings"],
    data: {
      layout: "settings",
      source: mergedPage?.source,
      path: mergedPage?.path,
      title: mergedPage?.title || translate("settings.title"),
      content: mergedPage?.content || "",
      useai: mergedPage?.useai,
      robots: "noindex,nofollow",
      sitemap: false,
      feed: false,
      search: false,
      navigation: toRenderNavigation(profile)
    }
  };
});
