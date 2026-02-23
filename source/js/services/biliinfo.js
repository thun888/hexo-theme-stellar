utils.jq(() => {
  $(function () {
    const els = document.getElementsByClassName('ds-biliinfo');
    for (var i = 0; i < els.length; i++) {
      const el = els[i];
      const api = el.dataset.api;
      if (api == null) {
        continue;
      }
      // layout
      utils.request(el, api, async resp => {
        const data = await resp.json();
        if (data.code && data.code !== 0) {
          console.warn('[Biliinfo] API error:', data);
          return;
        }
        // 替换 http:// 为 https://
        let pic = data.data.pic.replace(/^http:\/\//i, 'https://');
        let title = data.data.title;
        let desc = data.data.desc == '-' ? '*无描述' : data.data.desc;
        let url = 'https://www.bilibili.com/video/' + data.data.bvid;
        const date = new Date(data.data.pubdate * 1000);
        let pubdate = date.toLocaleDateString();
        let owner = data.data.owner;
        let stat = data.data.stat;

        // 注 owner：
        // "owner": {
        //     "mid": 12345678, // 账号ID
        //     "name": "用户名", // 用户名
        //     "face": "https://i0.hdslb.com/bfs/face/12345678.jpg" // 头像
        // },

        // 注 stat：
        // "stat": {
        //     "aid": 79360470, // av号
        //     "view": 7611, // 播放数
        //     "danmaku": 3, // 弹幕数
        //     "reply": 24, // 评论数
        //     "favorite": 249, // 收藏数
        //     "coin": 87, // 硬币数
        //     "share": 28, // 分享数
        //     "now_rank": 0, // 当前排名
        //     "his_rank": 0, // 历史最高排名
        //     "like": 131, // 点赞数
        //     "dislike": 0, // 踩
        //     "evaluation": "", // 评测
        //     "vt": 0
        // }
        //           <span class="cap breadcrumb project-tag" style="color:#6b6c6c;border-color:#6b6c6c"><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><path fill="currentColor" fill-opacity="0" d="M12 8c0 0 0 0 0.76 -1c0.88 -1.16 2.18 -2 3.74 -2c2.49 0 4.5 2.01 4.5 4.5c0 0.93 -0.28 1.79 -0.76 2.5c-0.81 1.21 -8.24 9 -8.24 9c0 0 -7.43 -7.79 -8.24 -9c-0.48 -0.71 -0.76 -1.57 -0.76 -2.5c0 -2.49 2.01 -4.5 4.5 -4.5c1.56 0 2.87 0.84 3.74 2c0.76 1 0.76 1 0.76 1Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.15s" values="0;0.3"/></path><path fill="none" stroke="currentColor" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c0 0 0 0 -0.76 -1c-0.88 -1.16 -2.18 -2 -3.74 -2c-2.49 0 -4.5 2.01 -4.5 4.5c0 0.93 0.28 1.79 0.76 2.5c0.81 1.21 8.24 9 8.24 9M12 8c0 0 0 0 0.76 -1c0.88 -1.16 2.18 -2 3.74 -2c2.49 0 4.5 2.01 4.5 4.5c0 0.93 -0.28 1.79 -0.76 2.5c-0.81 1.21 -8.24 9 -8.24 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.7s" values="32;0"/></path></svg>${stat.like}</span>
        //           <a target="_blank" rel="noopener" href="${url}"><span class="cap breadcrumb project-tag" style="color:#181818;border-color:#181818"><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="64" stroke-dashoffset="64" d="M3 12c0 4.97 4.03 9 9 9c4.97 0 9 -4.03 9 -9c0 -4.97 -4.03 -9 -9 -9c-4.97 0 -9 4.03 -9 9Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate></path><path stroke-dasharray="12" stroke-dashoffset="12" d="M7 12h9.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="12;0"></animate></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M17 12l-4 4M17 12l-4 -4"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.9s" dur="0.2s" values="8;0"></animate></path></g></svg>Let's see</span></a>

        let caps = `
          <span class="cap breadcrumb project-tag" style="color:#6b6c6c;border-color:#6b6c6c"><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><rect width="14" height="0" x="5" y="5" fill="currentColor"><animate fill="freeze" attributeName="height" begin="0.6s" dur="0.2s" values="0;3"></animate></rect><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="64" stroke-dashoffset="64" d="M12 4h7c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-14c-0.55 0 -1 -0.45 -1 -1v-14c0 -0.55 0.45 -1 1 -1Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate></path><path stroke-dasharray="4" stroke-dashoffset="4" d="M7 4v-2M17 4v-2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="4;0"></animate></path><path stroke-dasharray="12" stroke-dashoffset="12" d="M7 11h10"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="12;0"></animate></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M7 15h7"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.2s" values="8;0"></animate></path></g></svg>${pubdate}</span>
          <span class="cap breadcrumb project-tag" style="color:#6b6c6c;border-color:#6b6c6c"><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><circle cx="12" cy="12" r="0" fill="currentColor"><animate fill="freeze" attributeName="r" dur="0.2s" values="0;3"/></circle><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12c1.38 -0.77 4.42 -1.3 8 -1.3c3.58 0 6.62 0.53 8 1.3c-1.38 0.77 -4.42 1.3 -8 1.3c-3.58 0 -6.62 -0.53 -8 -1.3Z"><animate fill="freeze" attributeName="d" dur="0.5s" values="M4 12c1.38 -0.77 4.42 -1.3 8 -1.3c3.58 0 6.62 0.53 8 1.3c-1.38 0.77 -4.42 1.3 -8 1.3c-3.58 0 -6.62 -0.53 -8 -1.3Z;M2 12c1.72 -3.83 5.53 -6.5 10 -6.5c4.47 0 8.28 2.67 10 6.5c-1.72 3.83 -5.53 6.5 -10 6.5c-4.47 0 -8.28 -2.67 -10 -6.5Z"/></path></svg>${stat.view}</span>
          <span class="cap breadcrumb project-tag" style="color:#6b6c6c;border-color:#6b6c6c"><svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-dasharray="28" stroke-dashoffset="28" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M4 21v-1c0 -3.31 2.69 -6 6 -6h4c3.31 0 6 2.69 6 6v1"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="28;0"/></path><path d="M12 11c-2.21 0 -4 -1.79 -4 -4c0 -2.21 1.79 -4 4 -4c2.21 0 4 1.79 4 4c0 2.21 -1.79 4 -4 4Z"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="28;0"/></path></g></svg>${owner.name}</span>
          `
        let cell = `<div class="grid-box"><div class="post-list wiki"><div class="post-card wiki" onclick="cardClick(event,&quot;${url}&quot;)">`;

        cell += `<article class="md-text">`;
        cell += `<div class="preview biliinfo-preview"><img src="${pic}"></div>`;
        cell += `<div class="excerpt">`;
        cell += `<span class="post-title">${title}</span>`
        cell += `<p>${desc}</p>`;
        cell += `<div class="caps">${caps}</div>`;
        cell += `</article>`;
        cell += `</div></div></div></div>`;

        $(el).append(cell);
        
      });
    }
  });
});