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