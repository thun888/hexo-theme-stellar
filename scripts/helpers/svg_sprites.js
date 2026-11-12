'use strict';

/**
 * 输出 SVG Sprites 定义
 * 在 shell.ejs 中使用 `svg_sprites(bodyHtml)` 调用：
 * 传入已拼好的 body HTML 时，只输出该页真正被 `<use href="#id">` 引用到的 symbol，
 * 避免全站图标表在每页重复输出。不传参则输出全部（兼容旧用法）。
 */
hexo.extend.helper.register('svg_sprites', function(html) {
  if (!hexo.utils || !hexo.utils.getSvgSpritesHtml) {
    return ''
  }
  var usedIds = null
  if (typeof html === 'string' && html.length > 0) {
    usedIds = new Set()
    var re = /<use[^>]+href="#([^"]+)"/g
    var match
    while ((match = re.exec(html)) !== null) {
      usedIds.add(match[1])
    }
  }
  return hexo.utils.getSvgSpritesHtml(usedIds)
})
