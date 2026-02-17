utils.jq(() => {
    $(function () {
      const els = document.getElementsByClassName('ds-git_commit');
      for (var i = 0; i < els.length; i++) {
        const el = els[i];
        const api = el.dataset.api
        if (api == null) {
          continue;
        }
        utils.request(el, api, async resp => {
          var data = await resp.json();
          data = data.commit || [];
          data.forEach((item, i) => {

            var content = '<ul>';
            item.files.forEach(file => {
              content += '<li>' + file + '</li>';
            });
            content += '</ul>';

            // console.log(content)
            var cell = '<div class="timenode" index="' + i + '">';
            cell += '<div class="header">';
            cell += '<span>' + new Date(item.date).toLocaleString() + '</span>';
            cell += '</div>';
            cell += '<div class="body">';
            // cell += '<p class="title">' + item.message + '</p>';
            cell += '<p class="title">' +  getMeaning(item.message) + '</p>';
            cell += "<h2>更改：</h2>";
            cell += content;
            cell += '<div class="footer">';
            cell += '<div class="flex left">';
            cell += '<a class="item download" href="https://github.com/thun888/myblog/commit/' + item.hash + '" target="_blank" rel="external nofollow noopener noreferrer"><span>🔗 ' + item.hash + '</span></a>';
            cell += '</div>';
            cell += '</div>';
            cell += '</div>';
            cell += '</div>';
            $(el).append(cell);
          });
        });
      }
    });
  });


function getMeaning(message) {
  if (message.toUpperCase() != message || message.length != 2) {
    if (message  == "fix") {
      return "修复";
    }
    return message;
  }
  const firstLetter = message.charAt(0);
  const secondLetter = message.charAt(1);
  var firstLetterMeaning = '';
  switch (firstLetter) {
    // A（新增）	D（移除）	M（修改）	E（修订） 	F（修复）  U（升级）
    case 'A':
      firstLetterMeaning = '新增';
      break;
    case 'D':
      firstLetterMeaning = '移除';
      break;
    case 'M':
      firstLetterMeaning = '修改';
      break;
    case 'E':
      firstLetterMeaning = '修订';
      break;
    case 'F':
      firstLetterMeaning = '修复';
      break;
    case 'U':
      firstLetterMeaning = '升级';
      break;
    default:
      firstLetterMeaning = '未知';
  }
  switch (secondLetter) {
    // P（页面） F（功能） T（主题）
    case 'P':
      secondLetterMeaning = '页面/文章';
      break;
    case 'F':
      secondLetterMeaning = '功能';
      break;
    case 'T':
      secondLetterMeaning = '主题';
      break;
    default:
      secondLetterMeaning = '未知';
  }
  return firstLetterMeaning + "：" + secondLetterMeaning;
}

