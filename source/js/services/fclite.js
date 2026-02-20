utils.jq(() => {
    $(function () {
      const els = document.getElementsByClassName('ds-fclite');
      for (var i = 0; i < els.length; i++) {
        const el = els[i];
        const limit = parseInt(el.getAttribute('limit')) || 10;
        const api = el.dataset.api
        if (api == null) {
          continue;
        }
        utils.request(el, api, async resp => {
          var data = await resp.json();
          data = data.article_data || [];
        let htmlBuffer = '';
        data.slice(0, limit).forEach((item, i) => {
          htmlBuffer += `
            <div class="timenode" index="${i}">
              <div class="header">
                <div class="user-info"><span>${item.author}</span></div>
                <span>${item.created}</span>
              </div>
              <a class="body" href="${item.link}" target="_blank" rel="external nofollow noopener noreferrer">
                ${item.title}
              </a>
            </div>`;
        });

        $(el).append(htmlBuffer);
        });
      }
    });
  });