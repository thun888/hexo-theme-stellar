function queryAll(root, selector) { return [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)]; }

// 本地自定义：mermaid 交互查看器（缩放 / 平移 / 工具条 / 键盘）
// v2 的 diagrams 扩展原本只做 initialize + run，查看器资源在此并行加载后挂载
const VIEWER_SCRIPT = '/js/plugins/mermaid-keynav.js';
const VIEWER_STYLE = '/css/plugins/mermaid.css';

export async function mount(root, context) {
  const config = context.extension.config;
  await context.assets.script(config.assets.js);
  context.signal?.throwIfAborted();
  const theme = config.colorScheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : config.theme;
  window.mermaid.initialize({
    startOnLoad: false,
    theme,
    logLevel: 3,
    flowchart: { useMaxWidth: false, htmlLabels: true, curve: 'linear' },
    gantt: { axisFormat: '%Y/%m/%d' },
    sequence: { actorMargin: 50 }
  });

  const nodes = queryAll(root, '.mermaid');
  // 渲染会替换 innerHTML，先留一份源码给查看器的「复制」按钮
  nodes.forEach(el => {
    el.dataset.mermaidSrc = el.textContent.trim();
  });

  // 查看器脚本与样式和渲染并行准备，避免渲染结束后才串行等待
  const viewer = Promise.all([
    context.assets.script(VIEWER_SCRIPT),
    context.assets.style(VIEWER_STYLE)
  ]).catch(error => {
    console.warn('[mermaid] 查看器资源加载失败：', error);
  });

  await window.mermaid.run({ nodes });
  await viewer;
  if (typeof window.setupMermaidKeyNav === 'function') window.setupMermaidKeyNav();
  return () => {};
}
