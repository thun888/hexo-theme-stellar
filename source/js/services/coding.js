// 前端处理的
document.currentScript.stellarMount = function (root, context) {
  const utils = context.serviceUtils;
  const els = root.getElementsByClassName('ds-coding');
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
        utils.dom(el).append(data.result);
      });
    };

    const lazyload = el.hasAttribute('lazyload');
    if (lazyload) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          loadContent();
        });
      });
      observer.observe(el);
      context.signal?.addEventListener('abort', () => observer.disconnect(), { once: true });
    } else {
      loadContent();
    }
  }
  return () => {};
};
