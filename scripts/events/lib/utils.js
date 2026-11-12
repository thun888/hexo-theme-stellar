/**
 * utils.js v1 | https://github.com/xaoxuu/hexo-theme-stellar/
 */

'use strict';

module.exports = hexo => {
  hexo.args = {
    map: (args, keys, others) => {
      if (Array.isArray(args) == false) {
        return args;
      }
      var map = {others: Array()};
      args.forEach((arg, i) => {
        let kv = arg.trim();
        if (kv.includes('://') && kv.split(':').length == 2) {
          // 纯 url
          map.others.push(kv);
        } else {
          kv = kv.split(':');
          if (kv.length > 1) {
            if (keys.includes(kv[0]) == true) {
              map[kv.shift()] = kv.join(':');
            } else {
              map.others.push(kv.join(':'));
            }
          } else if (kv.length == 1) {
            map.others.push(kv[0]);
          }
        }
      });
      // 解析不带 key 的参数
      if (others && others.length > 0 && map.others.length > 0) {
        if (Array.isArray(others) == false) {
          others = [others];
        }
        others.forEach((arg, i) => {
          map[arg] = map.others.shift();
        });
        // 最后一段合并到最后一个参数中
        if (map.others.length > 0) {
          map[others[others.length-1]] += ' ' + map.others.join(' ');
          map.others = [];
        }
      }
      return map;
    },
    joinTags: (args, keys) => {
      if (Array.isArray(keys) == false) {
        keys = [keys];
      }
      var ret = [];
      keys.forEach((key, i) => {
        if (args[key] && args[key].length > 0) {
          ret.push(key + '="' + args[key] + '"');
        }
      });
      return ret;
    },
    joinURLParams: (args, keys) => {
      if (Array.isArray(keys) == false) {
        keys = [keys];
      }
      var ret = [];
      keys.forEach((key, i) => {
        if (args[key] && args[key].length > 0) {
          ret.push(key + '=' + args[key]);
        }
      });
      return ret.join('&');
    }
  };
  hexo.utils = {
    // SVG Sprites 存储
    svgSprites: new Map(),
    
    icon: (key, args, inline) => {
      const { icons } = hexo.stellar.data;
      var result = ''
      if (icons[key]) {
        result = icons[key]
      } else {
        result = key
      }
      if (result.startsWith('/') || result.startsWith('https://') || result.startsWith('http://')) {
        return `<img ${args?.length > 0 ? args : ''} src="${result}" />`
      } else if (inline === true) {
        return result
      } else if (result.startsWith('<svg')) {
        // 特例跳过：该图标本身带内部引用，不能拆成 sprite
        const skipList = ['rating:star']
        if (skipList.includes(key)) {
          return result
        }
        // 本地优化：开启 svg_sprites 时，同一图标只保留一份 symbol，其余用 use 引用
        const useSvgSprites = hexo.theme.config.svg_sprites?.enable === true
        if (useSvgSprites && !result.includes('Loop')) {
          const iconId = `icon-${key.replace(/[^a-zA-Z0-9]/g, '-')}`
          const svgTagMatch = result.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/)
          if (svgTagMatch) {
            const svgContent = svgTagMatch[2]
            const attrsObj = {}
            svgTagMatch[1].replace(/([a-zA-Z0-9\-:]+)="([^"]*)"/g, (m, k, v) => { attrsObj[k] = v })
            let attrsStr = ''
            Object.keys(attrsObj).forEach(k => {
              if (k !== 'id') attrsStr += ` ${k}="${attrsObj[k]}"`
            })
            if (!hexo.utils.svgSprites.has(iconId)) {
              hexo.utils.svgSprites.set(iconId, { attrs: attrsStr, content: svgContent })
            }
            return `<svg${attrsStr}><use href="#${iconId}"/></svg>`
          }
        }
        // v2：非首屏图标输出占位符，由 deferred-icons Runtime Extension 异步替换
        return `<svg class="icon" viewBox="0 0 1 1" data-icon="${key}" aria-hidden="true"></svg>`
      } else {
        return result
      }
    },
    iconData: (key) => {
      const { icons } = hexo.stellar.data;
      return icons && icons[key] ? icons[key] : ''
    },

    // 生成 SVG Sprites 定义
    // usedIds 为 Set 时只输出被引用的 symbol；为 null/undefined 时输出全部
    getSvgSpritesHtml: (usedIds) => {
      const icons = hexo.stellar?.data?.icons || {}
      const symbolId = key => `icon-${key.replace(/[^a-zA-Z0-9]/g, '-')}`
      const symbols = []
      const emitted = new Set()
      const push = (id, content) => {
        if (emitted.has(id) || !content) return
        emitted.add(id)
        symbols.push({ id, content })
      }

      // 1) 运行时注册表：本次渲染实时产出的图标
      hexo.utils.svgSprites.forEach((data, id) => {
        if (usedIds && !usedIds.has(id)) return
        push(id, data.content)
      })

      // 2) 兜底回查 _data/icons.yml
      //    Hexo 会把渲染后的正文缓存进 db.json（Page.content），重建时源文件未变就不会
      //    重新执行标签插件，运行时注册表因此是空的。此时按 id 反查图标源串补齐，
      //    否则页面里只剩 <use> 引用而没有任何 <symbol> 定义，图标全部显示为空白。
      if (usedIds) {
        usedIds.forEach(id => {
          if (emitted.has(id)) return
          for (const key of Object.keys(icons)) {
            if (symbolId(key) !== id) continue
            const matched = icons[key] && icons[key].match(/<svg([^>]*)>([\s\S]*?)<\/svg>/)
            if (matched) push(id, matched[2])
            break
          }
        })
      }

      if (symbols.length === 0) {
        return ''
      }

      let html = '<div class="svg-sprites"><svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n'
      symbols.forEach(({ id, content }) => {
        html += `  <symbol id="${id}">\n`
        html += `    ${content}\n`
        html += `  </symbol>\n`
      })
      html += '</svg></div>'
      return html
    }
  };
};
