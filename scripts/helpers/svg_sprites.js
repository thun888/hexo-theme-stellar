'use strict';

/**
 * 输出 SVG Sprites 定义
 * 在 layout.ejs 中使用 <%- svg_sprites() %> 调用
 */
hexo.extend.helper.register('svg_sprites', function() {
  if (hexo.utils && hexo.utils.getSvgSpritesHtml) {
    return hexo.utils.getSvgSpritesHtml()
  }
  return ''
})
