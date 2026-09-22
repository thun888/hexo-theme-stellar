/**
 * divider.js v1.1
 *
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% divider [el:h2] direction:方向 内容 %}
 *
 * el:h2/h3/h4/h5/h6 可作为标题使用（带锚点 id，会出现在 TOC 中），与 quot 标签的 el 参数行为一致
 */
'use strict'

module.exports = ctx => function(args) {
  args = ctx.args.map(args, ['el', 'direction'], ['content']);
  if (!args.content) {
    return '';
  }
  // el:h1-h6 时渲染为标题元素，其余情况（含非法值）回退为 div
  const heading = /^h[1-6]$/i.test(String(args.el || '')) ? String(args.el).toLowerCase() : 'div';
  // 作为标题时附加锚点 id（与 quot 一致），供 TOC / 页内锚点引用；转义引号避免破坏属性
  const idAttr = heading !== 'div' ? ` id="${String(args.content).replace(/"/g, '&quot;')}"` : '';
  const lineL = (args.direction === 'right' || args.direction === 'center') ? '<span class="divider-line"></span>' : '';
  const lineR = (args.direction === 'left' || args.direction === 'center') ? '<span class="divider-line"></span>' : '';
  return `<${heading} class="divider-container"${idAttr}>${lineL}<span class="divider-text">${args.content}</span>${lineR}</${heading}>`;
}