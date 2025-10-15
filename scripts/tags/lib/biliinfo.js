/**
 * biliinfo.js v1 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% biliinfo [width] [height] [av:xxx] [style:white/gray/black] bv %}
 */

'use strict'

module.exports = (ctx, type) => function(args) {
  args = ctx.args.map(args, ['style', 'av','height','width'], ['bv'])
  if (args.width == null) {
    args.width = '100%'
  }
  if (args.height == null) {
    args.height = '10em'
  }
  if (args.style == null) {
    args.style = 'gray'
  }
  var el = ''
  // div
  if (args.av){
    el += `<iframe src="https://api.paugram.com/bili?av=${args.av}&style=${args.style}" style="height:${args.height}; width:${args.width}"></iframe>`
  }else{
    el += `<iframe src="https://api.paugram.com/bili?bv=${args.bv}&style=${args.style}" style="height:${args.height}; width:${args.width}"></iframe>`
  }
  return el
}
