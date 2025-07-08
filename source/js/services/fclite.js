utils.jq(() => {
    $(function () {
      const els = document.getElementsByClassName('ds-fclite');
      for (var i = 0; i < els.length; i++) {
        const el = els[i];
        const api = el.dataset.api
        if (api == null) {
          continue;
        }
        utils.request(el, api, async resp => {
          var data = await resp.json();
          data = data.article_data || [];
          data.forEach((item, i) => {
          // console.log(content)
          var cell = '<div class="timenode" index="' + i + '">';
          cell += '<div class="header">';
          cell += '<div class="user-info">';
          // cell += '<img src="' + (item.avatar || default_avatar) + '" onerror="javascript:this.src=\'' + default_avatar + '\';">';
          cell += '<span>' + item.author + '</span>';
          cell += '</div>';
          cell += '<span>' + item.created + '</span>';
          cell += '</div>';
          cell += '<a class="body" href="' + item.link + '" target="_blank" rel="external nofollow noopener noreferrer">';
          cell += item.title;
          cell += '</a>';
          cell += '</div>';
          $(el).append(cell);
          });
        });
      }
    });
  });


function getMeaning(message) {
  if (message.toUpperCase() != message && message.length != 2) {
    if (message  == "fix") {
      return "修复";
    }
    return message;
  }
  const firstLetter = message.charAt(0);
  const secondLetter = message.charAt(1);
  var firstLetterMeaning = '';
  switch (firstLetter) {
    // A（新增）	D（移除）	M（修改）	E（修订） 	F（修复）
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

