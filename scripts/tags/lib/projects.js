/**
 * projects.js v2 | https://github.com/xaoxuu/hexo-theme-stellar/
 * 格式与官方标签插件一致使用空格分隔，中括号内的是可选参数（中括号不需要写出来）
 *
 * {% projects [group] [repo:owner/repo] [api:http] %}
 */

'use strict'

module.exports = ctx => function(args) {
  args = ctx.args.map(args, ['repo', 'api'], ['group'])
  const host = ctx.theme.config.api_host.ghraw
  var api
  if (args.api) {
    api = args.api
  } else if (args.repo) {
    api = `https://${host}/${args.repo}/output/v2/data.json`
  }
  
  var el = '<div class="tag-plugin projects-wrap">'
  if (api) {
    el += '<div class="data-service ds-projects"'
    el += ` data-api="${api}"`
    el += '>'
    el += '<div class="grid-box"></div>'
    el += '</div>'
  } else if (args.group) {
    const links = ctx.theme.config.links || {}
    el += '<div class="grid-box"><div class="post-list wiki">'

    for (let item of (links[args.group] || [])) {
      if (item?.name) {
        var tagsHtml = '';
        var content = item.content ? ":" + item.content : '';
        var tagsList = item.tags ? item.tags : [];
        tagsList.unshift({name: item.time, icon: 'myself:calendar',color:"#6b6c6c"});
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
          Tag = `<a class="cap breadcrumb project-a" href="${element.url}">${Tag}</a>`
        }
        tagsHtml += Tag
      });
        
        el += `<div class="post-card wiki" onclick="cardClick(event, '${item.url}')">`
        el += `<article class="md-text">`
        el += item.logo ? `<div class="preview"><img src="${item.logo}"></div>` : '<div class="preview"><img src="https://onep.hzchu.top/mount/pic/myself/2025/07/no_media.png?fmt=webp"></div>'
        el += `<div class="excerpt">`
        el += `<h2 class="post-title">${item.name}</h2>`
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
