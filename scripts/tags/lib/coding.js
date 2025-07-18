/**
 * coding.js v1.1 | https://github.com/weekdaycare/hexo-theme-stellar/
 * 格式与官方标签插件一致，使用空格分隔；中括号内的是可选参数（中括号不需要写出来）
 *
 * {% coding url[#L1-L4] [lang:string] [withcss:boolean] %}
 */

'use strict'

module.exports = (ctx) => {
  return function (args) {
    // 映射并提取参数
    args = ctx.args.map(args, ['lang', 'withcss'], ['url'])

    // 获取 API 地址并去除末尾斜杠
    const api = ctx.theme.config.tag_plugins.coding?.api.replace(/\/$/, '')

    // 拼接完整的请求 URL
    args.url = api + '/api/v1/generate?usejson=true&showsupporter=false' + '&url=' + args.url + '&lang=' + args.lang 

    // 设置默认 withcss 参数
    args.withcss = args.withcss || 'true'

    // 构造最终的 HTML 元素字符串
    let el = ''
    el += `<div class="tag-plugin ds-coding" `
    el += ctx.args.joinTags(args, ['url', 'withcss']).join(' ')
    // 懒加载
    el += ' lazyload'
    el += '>'
    el += '</div>'

    return el
  }
}
