/**
 * tip.js v1.0 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% tip key:被注解内容 注解内容 %}
 * 
 */

'use strict'

module.exports = ctx => function(args) {
  args = ctx.args.map(args, ['key'], ['content']);

  if (args.key == null) {
    return '';
  }
  var el = '';
  el += '<span class="annotated" data-note="' + args.content + '">' + args.key + '</span>'
  return el;
}
