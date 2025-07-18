// 前端处理的
utils.jq(() => {
  $(function () {
    const els = document.getElementsByClassName('ds-coding');
    let cssLoaded = false;

    for (let i = 0; i < els.length; i++) {
      const el = els[i];

      const loadContent = () => {
        const srcBase = el.getAttribute('url');
        const css = el.getAttribute('withcss') === 'true';
        let src = srcBase;

        if (css && !cssLoaded) {
          utils.css('https://static.hzchu.top/pygments-css/igor.css');
          cssLoaded = true;
        }

        utils.request(el, src, async (resp) => {
          const data = await resp.json();
          $(el).append(data.result);
        });
      };

      const lazyload = el.hasAttribute('lazyload');
      util.viewportLazyload(el, loadContent, lazyload);
    }
  });
});
