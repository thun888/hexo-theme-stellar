/**
 * image.js v1 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% image src [alt] [width:400px] [bg:#eee] [download:true/false/url] [fancybox:true/false/url] [ratio] [more:url] %}
 */

'use strict'

// const fs = require('fs');
// const path = require('path');

// // 懒加载 blurhash 缓存（只读一次）
// let _blurhashCache = null;
// function getBlurhashCache() {
//   if (_blurhashCache !== null) return _blurhashCache;
//   const cachePath = path.join(__dirname, '../../../../../image-blurhashes.json');
//   _blurhashCache = fs.existsSync(cachePath)
//     ? JSON.parse(fs.readFileSync(cachePath, 'utf8'))
//     : {};
//   return _blurhashCache;
// }

module.exports = ctx => function(args) {
  args = ctx.args.map(args, ['width', 'height', 'bg', 'download', 'padding', 'fancybox', 'ratio', 'more'], ['src', 'alt'])
  // // 从缓存动态查找 blurhash
  // const sourceKey = this.source ? path.relative(process.cwd(), path.join('source', this.source)).replace(/\\/g, '/').replace(/^\.\//,'') : null;
  // const blurhashCache = getBlurhashCache();
  // // 尝试匹配缓存 key（windows/unix 路径兼容）
  // let blurhash = null;
  // if (sourceKey && args.src) {
  //   const fileCache = blurhashCache[sourceKey]
  //     || blurhashCache[sourceKey.replace(/\//g, '\\')]
  //     || blurhashCache['source/' + sourceKey.replace(/^source[\\/]/, '')];
  //   if (fileCache) blurhash = fileCache[args.src] || null;
  // }
  var style = ''
  if (args.width) {
    style += 'width:' + args.width + ';'
  }
  if (args.height) {
    style += 'height:' + args.height + ';'
  }
  // fancybox 默认开启（不再支持全局关闭），单图可用 fancybox:false 关闭
  var fancybox = true
  var fancyboxHref = null
  if (args.fancybox && args.fancybox.length > 0) {
    if (args.fancybox == 'false') {
      fancybox = false
    } else if (args.fancybox === 'true') {
      fancybox = true
    } else {
      fancybox = true
      fancyboxHref = args.fancybox
    }
  }

  var safeAlt = require('hexo-util').escapeHTML(args.alt || '')
  // 懒加载占位图（1x1 透明 PNG），真实地址放在 data-src
  const loadingImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAADa6r/EAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII='
  function img(src, alt, style) {
    let a = '<a data-fancybox'
    let img = ''
    img += `<img class="lazy" src="${loadingImg}" data-src="${src}" data-original-src="${src}"`
    // if (blurhash) {
    //   img += ` data-blurhash="${blurhash}"`
    // }
    if (safeAlt) {
      img += ` alt="${safeAlt}"`
      a += ` data-caption="${safeAlt}"`
    }
    if (fancybox && !fancyboxHref) {
      img += ` data-fancybox="${fancybox}"`
    }
    if (style.length > 0 && !args.ratio) {
      img += ' style="' + style + '"'
    }
    if (args.more) {
      img += ` data-more-src="${args.more}"`
    }
    img += `onerror="this.src=&quot;${ctx.theme.config.default.image_onerror || ctx.utils.iconData('image:onerror')}&quot;"`
    img += '/>'
    // // blurhash canvas 占位 / loading
    // if (blurhash) {
    //   img += `<canvas class="blurhash-preview" data-blurhash="${blurhash}" aria-hidden="true"></canvas>`
    // } else {
    //   img += `<div class="lazy-icon" style="background-image:url(${ctx.theme.config.default.loading || ctx.utils.iconData('default:loading-placeholder')});"></div>`
    // }
    if (fancyboxHref) {
      a += ` href="${fancyboxHref}">${img}</a>`
      return a
    }
    return img
  }

  var el = ''
  // wrap
  el += '<div class="tag-plugin image">'
  // bg
  el += `<div class="image-bg"`
  if (args.bg || args.padding || args.ratio || style) {
    el += ' style="'
    if (args.bg && args.bg.length > 0) {
      el += 'background:' + args.bg + ';'
    }
    if (args.padding) {
      el += 'padding:' + args.padding + ';'
    }
    if (args.ratio) {
      el += 'aspect-ratio:' + args.ratio + ';'
      if (style) {
        el += style
      }
    } else if (style) {
      // 如果设置了图片宽度，但没有长宽比，那背景区就要铺满宽度
      el += 'width:100%;'
    }
    el += '"'
  }
  el += '>'
  el += img(args.src, args.alt, style)
  if (args.download && args.download.length > 0) {
    let href = args.download
    if (args.download == 'true') {
      href = args.src
    }
    let download = ''
    if (args.alt) {
      download = ' download="' + args.alt + '"'
    }
    el += '<a class="image-download blur" style="opacity:0" target="_blank"' + download + ' href="' + href + '">' + ctx.utils.icon('image:download') + '</a>'
  }
  if (args.more) {
    el += `<a class="image-more-btn blur" style="opacity:0" href="javascript:void(0)" onclick="util.toggleImageMore(this)">`
    el += '<svg class="icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M847.9 592H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h605.2L612.9 851c-4.1 5.2-.4 13 6.3 13h72.5c4.9 0 9.5-2.2 12.6-6.1l168.8-214.1c16.5-21 1.6-51.8-25.2-51.8M872 356H266.8l144.3-183c4.1-5.2.4-13-6.3-13h-72.5c-4.9 0-9.5 2.2-12.6 6.1L150.9 380.2c-16.5 21-1.6 51.8 25.1 51.8h696c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8"/></svg>'
    el += '</a>'
  }
  el += '</div>'

  if (safeAlt) {
    el += '<div class="image-meta">'
    el += '<span class="image-caption center">' + safeAlt + '</span>'
    el += '</div>'
  }

  el += '</div>'
  return el
}
