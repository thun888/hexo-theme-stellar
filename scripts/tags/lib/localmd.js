/**
 * localmd.js v1.0 
 * 
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% localmd src %}
 *
 */
'use strict'


const fs = require('fs')
const path = require('path')
const yfm = require('hexo-front-matter')

module.exports = ctx => async function(args) {
  args = ctx.args.map(args, [''], ['src'])
  if (!args.src) {
    console.warn('[localmd] No source file specified.')
    return ''
  }
  const filepath = path.join(ctx.source_dir, args.src)
  if (!fs.existsSync(filepath)) {
    console.warn(`[localmd] File not found: ${filepath}`)
    return ''
  }
  const rawContent = fs.readFileSync(filepath, { encoding: 'utf-8' })
  const data = yfm.parse(rawContent)
  // console.log(data)
  const title = data.title || path.basename(filepath, path.extname(filepath))
  const link = "/" + (data.permalink || path.basename(filepath, path.extname(filepath)))
  let el = `
    <div class="divider-container">
      <div class="divider-line"></div>
      <span class="divider-text">下文来自<a target="_blank" href="${link}">「${title}」</a></span>
      <div class="divider-line"></div>
    </div>
  `
  const result = await ctx.post.render(null, { 
    content: data._content, 
    engine: 'markdown',
    source: filepath 
  })
  el += result.content
  el += `
  <div class="divider-container">
    <div class="divider-line"></div>
    <span class="divider-text">外部引用截止</span>
    <div class="divider-line"></div>
  </div>
  `
  return el


}