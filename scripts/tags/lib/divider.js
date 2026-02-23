/**
 * divider.js v1.0 
 * 
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% divider direction:方向 内容 %}
 *
 */
'use strict'

module.exports = ctx => function(args) {
  args = ctx.args.map(args, ['direction'], ['content']);
  if (!args.content) {
    return '';
  }
  let el = `
    <div class="divider-container">
      ${ args.direction === 'right' ? `<div class="divider-line"></div>` : '' }
      <span class="divider-text">${args.content}</span>
      ${ args.direction === 'left' ? `<div class="divider-line"></div>` : '' }
    </div>
  `

  return el;

}