/**
 * office.js v1.0 | https://github.com/volantis-x/hexo-theme-volantis/
 * contributor: @MHuiG
 * 
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% office src [width:width] [height:height] %}
 *
 */
'use strict'


module.exports = ctx => function(args) {
  args = ctx.args.map(args, ['width', 'height'], ['src'])
  if (!args.src) {
    return el;
  }
  let width = args.width ? Number(args.width) : 480;
  let height = args.height ? Number(args.height) : 270;
  let ratio = (width / height).toFixed(2);
  return `
  <iframe src="https://view.officeapps.live.com/op/embed.aspx?src=${args.src}&wdAr=${ratio}" width="${width}px" height="${height}px" frameborder="0">这是嵌入 <a target="_blank" href="https://office.com">Microsoft Office</a> 演示文稿，由 <a target="_blank" href="https://office.com/webapps">Office</a> 提供支持。</iframe>
  `
}