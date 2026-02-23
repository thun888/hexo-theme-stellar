/**
 * biliinfo.js v1 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% biliinfo bv %}
 */

'use strict'

module.exports = ctx => function(args) {
  args = ctx.args.map(args, [''], ['bv'])
  if (!args.bv) {
    return ''
  }
  const api = ctx.theme.config.tag_plugins.biliinfo?.api.replace(/\/$/, '')
  if (!api) {
    console.warn('[Biliinfo] API endpoint not configured.')
    return ''
  }
  args.url = api + '/api/v1/get_video_info?bvid=' + args.bv

  var el = `<div class="tag-plugin ds-biliinfo" data-api="${args.url}""></div>`

  return el
}

// 'use strict'

// module.exports = (ctx, type) => function(args) {
//   args = ctx.args.map(args, ['style', 'av','height','width'], ['bv'])
//   if (args.width == null) {
//     args.width = '100%'
//   }
//   if (args.height == null) {
//     args.height = '10em'
//   }
//   if (args.style == null) {
//     args.style = 'gray'
//   }
//   var el = ''
//   // div
//   if (args.av){
//     el += `<iframe class="biliinfo" src="https://api.paugram.com/bili?av=${args.av}&style=${args.style}" style="height:${args.height}; width:${args.width}"></iframe>`
//   }else{
//     el += `<iframe class="biliinfo" src="https://api.paugram.com/bili?bv=${args.bv}&style=${args.style}" style="height:${args.height}; width:${args.width}"></iframe>`
//   }
//   return el
// }
