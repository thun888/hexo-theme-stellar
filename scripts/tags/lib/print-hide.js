/**
 * print-hide.js v1.1 | https://github.com/weekdaycare/hexo-theme-stellar/
 * 格式与官方标签插件一致，使用空格分隔；中括号内的是可选参数（中括号不需要写出来）
 *
 * {% printhide %}{% endprinthide %}
 */

'use strict'

module.exports = ctx => function(args, content) {
  let el = "";
  // content
  el += '<div class="print_hide">';
  el += ctx.render.renderSync({text: content, engine: 'markdown'}).split('\n').join('');
  el += '</div>';

  return el;

}

