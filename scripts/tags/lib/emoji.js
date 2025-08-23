/**
 * emoji.js v1 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% emoji [rawurl:rawurl] [source] name [height:1.75em] %}
 *
 * rawurl只能单独使用
 * 
 */

'use strict'

module.exports = ctx => function(args) {
  const config = ctx.theme.config.tag_plugins.emoji
  args = ctx.args.map(args, ['height', 'rawurl'], ['source', 'name'])
  var el = ''
  var url = ''
  if (args.source == undefined & args.rawurl == undefined) {
    return el
  }
  el += '<span class="tag-plugin emoji">'
  if (args.name == undefined & args.rawurl == undefined) {
    // 省略了 source
    for (let id in config) {
      if (config[id]) {
        args.name = args.source
        args.source = id
        break
      }
    }
  }
  if (config[args.source] && args.name) {
    url = config[args.source].replace('{name}', args.name)
    el += '<img no-lazy="" class="inline" src="' + url + '"'
    if (args.height) {
      el += ' style="height:' + args.height + '"'
    }
    el += '/>'
  }
  if (args.rawurl) {
    url = args.rawurl
    el += '<img no-lazy="" class="inline" src="' + url + '"'
    if (args.height) {
      el += ' style="height:' + args.height + '"'
    }
    el += '/>'
  }
  el += '</span>'
  return el
}
