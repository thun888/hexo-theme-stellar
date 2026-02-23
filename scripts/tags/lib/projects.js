/**
 * projects.js v2 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% projects name %}
 */

'use strict'

module.exports = ctx => function(args) {
  let name = args[0]
  var el = '<div class="tag-plugin-wrap">'
  if (name) {
    const links = ctx.theme.config.links || {}
    el += '<div class="grid-box"><div class="post-list wiki">'

    for (let item of (links[name] || [])) {
      if (item?.name) {
        var tagsHtml = '';
        var content = item.content ? ":" + item.content : '';
        var tagsList = item.tags ? item.tags : [];
        // 添加语言标签
        
        if (item.language) {
          if (Array.isArray(item.language)) {
            item.language.forEach(lang => {
              var [icon,color] = getLanguageIcon(lang);
              tagsList.unshift({name: lang, icon: icon,color:color});
            });
          } else {
            var [icon,color] = getLanguageIcon(item.language);
            tagsList.unshift({name: item.language, icon: icon,color:color});
          }
        }
        // 添加时间标签
        if (item.time) {
          tagsList.unshift({name: item.time, icon: 'line-md:calendar',color:"#6b6c6c"});
        }
        // console.log(tagsList);          
        tagsList.forEach(element => {
        var icon = '';
        var iconsList = ctx.theme.config.icons;
        if (element.icon){
          if (element.icon.startsWith('http')){
            icon = `<span class="link-image" style="background-image: url(${element.icon}); border-radius: 25%;"></span>`;
          }else if (iconsList[element.icon]){
            icon = iconsList[element.icon].replace('width="20" height="20"', 'width="1rem" height="1rem"');
          }  
        }
        var Tag = element.color ? `<span class="cap breadcrumb project-tag" style="color:${element.color};border-color:${element.color}; ">${icon}${element.name}${content}</span>` : `<span class="cap breadcrumb">${icon}${element.name}${content}</span>`;
        if (element.url){
          Tag = `<a href="${element.url}">${Tag}</a>`
        }
        tagsHtml += Tag
      });
        
        el += `<div class="post-card wiki" onclick="cardClick(event, '${item.url}')">`
        el += `<article class="md-text">`
        el += item.logo ? `<div class="preview"><img src="${item.logo}"></div>` : '<div class="preview"><img src="https://onep.hzchu.top/mount/pic/myself/2025/07/no_media.png?fmt=webp"></div>'
        el += `<div class="excerpt">`
        el += `<span class="post-title">${item.name}</span>`
        el += `<p>${item.description}</p>`
        el += tagsHtml ? `<div class="caps">${tagsHtml}</div>` : ''
        el += `</div>`
        el += `</article>`
        el += `</div>`
      }
    }
    
    el += '</div></div>'
  }

  el += '</div>'
  return el
}

function getLanguageIcon(language) {
  switch (language) {
    case 'Python':
      return ['mdi:language-python', '#3572a5'];
    case 'JS':
      return ['mdi:language-javascript', '#d5a900'];
    case 'Go':
      return ['mdi:language-go', '#00c9ff'];
    case 'HTML':
      return ['mdi:language-html5', '#e34c26'];
    case 'Bash':
      return ['hugeicons:bash', '#181818'];
    case 'Next.js':
      return ['cib:next-js', '#181818'];
    default:
      return ['hugeicons:bash', '#181818'];
  }
}
