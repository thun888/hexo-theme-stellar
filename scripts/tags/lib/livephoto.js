/**
 * livephoto.js v1 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% livephoto image: width: height: %}
 *
 */

'use strict'


module.exports = ctx => function(args) {
  args = ctx.args.map(args, ['image', 'video', 'width', 'height', 'type', 'muted'], ['text'])
  if (args == undefined) {
    return ''
  }
  var el = `<div class="ds-livephoto"`
  if (args.image) el += ` data-image="${args.image}"`
  if (args.video) el += ` data-video="${args.video}"`
  if (args.width) el += ` data-width="${args.width}"`
  if (args.height) el += ` data-height="${args.height}"`
  if (args.type) el += ` data-type="${args.type}"`
  if (args.muted) el += ` data-muted="${args.muted}"`
  el += ` data-alt="${args.text ? args.text : 'no description'}"`
  el +=` style="width:${args.width ? args.width : 'auto'}; height:${args.height ? args.height : 'auto'};"></div>`
  return el
}
