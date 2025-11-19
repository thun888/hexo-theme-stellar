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
    
    icon: (key, args) => {
      const { icons } = hexo.theme.config
      var result = ''
      if (icons[key]) {
        result = icons[key]
      } else {
        result = key
      }
      if (result.startsWith('/') || result.startsWith('https://') || result.startsWith('http://')) {
        return `<img ${args?.length > 0 ? args : ''} src="${result}" />`
      } else {
        // 检查是否使用 SVG Sprites
        const useSvgSprites = hexo.theme.config.svg_sprites?.enable === true
        
        if (useSvgSprites && result.includes('<svg') && !result.includes('Loop')) {
          // 提取 SVG 内容并生成唯一 ID
          const iconId = `icon-${key.replace(/[^a-zA-Z0-9]/g, '-')}`
          // 解析 SVG 标签属性和内容
          const svgTagMatch = result.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/)
          if (!svgTagMatch) return result
          const svgAttrsRaw = svgTagMatch[1]
          const svgContent = svgTagMatch[2]
          // 解析属性为对象
          const attrsObj = {}
          svgAttrsRaw.replace(/([a-zA-Z0-9\-:]+)="([^"]*)"/g, (m, k, v) => { attrsObj[k] = v })
          // 构造属性字符串，去掉 id
          let attrsStr = ''
          Object.keys(attrsObj).forEach(k => {
            if (k !== 'id') attrsStr += ` ${k}="${attrsObj[k]}"`
          })
          // 存储到 sprites map
          if (!hexo.utils.svgSprites.has(iconId)) {
            hexo.utils.svgSprites.set(iconId, {
              attrs: attrsStr,
              content: svgContent
            })
          }
          // 返回 use 引用，允许传递额外属性
          const argsStr = args?.length > 0 ? ` ${args}` : ''
          return `<svg${attrsStr}${argsStr}><use href="#${iconId}"/></svg>`
        }
        
        // 默认行为：直接返回完整 SVG
        return result
      }
    },
    
    // 生成 SVG Sprites 定义
    getSvgSpritesHtml: () => {
      if (hexo.utils.svgSprites.size === 0) {
        return ''
      }
      
      let html = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n'
      hexo.utils.svgSprites.forEach((data, id) => {
        html += `  <symbol id="${id}">\n`
        html += `    ${data.content}\n`
        html += `  </symbol>\n`
      })
      html += '</svg>'
      return html
    }
  };
};
