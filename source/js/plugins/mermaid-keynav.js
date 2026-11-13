/**
 * Mermaid 交互查看器（缩放 / 平移 / 工具条）
 *
 * mermaid 只负责把文本渲染成一个静态 <svg>，本身没有任何缩放、平移、键盘交互
 * （12.3.0 的 dist 里 search 不到 panzoom / zoomIn / transform: translate）。
 * GitHub、mermaid.js.org 之所以能缩放，是它们在 SVG 外面套了自己的查看器。
 * 这里做的也是同一件事：
 *
 *   1. <pre class="mermaid"> 当作视口（overflow: hidden），内层 .mm-stage 做 transform
 *   2. 拖拽平移、滚轮缩放（以指针位置为锚点）、双击复位
 *   3. 右上角：适应宽度 / 复制源码；右侧：方向盘 + 缩放 + 复位
 *   4. 键盘：方向键平移、＋/－ 缩放、0 复位（沿用上一版）
 *
 * 视口高度固定为“适应宽度后的高度”，放大后超出部分裁切，靠平移查看，
 * 这样图表不会把整篇文章撑得很长。
 */
(function () {
  'use strict';

  const OPTIONS = {
    mode: 'fit', // 'fit' 初始适应宽度；'original' 初始按原始尺寸
    minScale: 0.2,
    maxScale: 6,
    zoomStep: 1.25, // 按钮/键盘每次缩放倍率
    panStep: 60, // 方向键/方向盘单次平移 px
    panFast: 4, // 按住 Shift 的加速倍数
    wheelSensitivity: 0.0015,
    maxHeightRatio: 0.7, // 视口最多占屏高的比例
    minHeight: 120,
  };

  // 3×3 方向盘：中间复位，右侧上下缩放
  // 四个方向共用一个 “向上” 的 chevron，靠 CSS rotate 转向
  const PAD = [
    { act: 'blank' },
    { act: 'up', icon: 'chevron', title: '上移' },
    { act: 'zoom-in', icon: 'zoom-in', title: '放大' },
    { act: 'left', icon: 'chevron', title: '左移' },
    { act: 'reset', icon: 'reset', title: '复位' },
    { act: 'right', icon: 'chevron', title: '右移' },
    { act: 'blank' },
    { act: 'down', icon: 'chevron', title: '下移' },
    { act: 'zoom-out', icon: 'zoom-out', title: '缩小' },
  ];

  // 统一用内联 SVG，避免 ▼◀⟳ 之类符号在部分字体下缺字
  const ICONS = {
    chevron: '<path d="M4 10l4-4 4 4"/>', // 默认朝上，其余方向用 CSS 旋转
    // 放大镜样式，和 GitHub 的 zoom-in / zoom-out 图标一致
    'zoom-in':
      '<circle cx="7" cy="7" r="4.3"/><path d="M10.2 10.2L14 14"/><path d="M7 5.1v3.8M5.1 7h3.8"/>',
    'zoom-out': '<circle cx="7" cy="7" r="4.3"/><path d="M10.2 10.2L14 14"/><path d="M5.1 7h3.8"/>',
    reset: '<path d="M13 8a5 5 0 1 1-1.5-3.6"/><path d="M13 2.8v2.6h-2.6"/>',
    expand: '<path d="M6.5 2.5h-4v4M9.5 2.5h4v4M6.5 13.5h-4v-4M9.5 13.5h4v-4"/>',
    close: '<path d="M4 4l8 8M12 4l-8 8"/>',
    copy:
      '<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/>' +
      '<path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/>',
  };

  // 图标只在文档里定义一份（<symbol>），按钮里用 <use> 引用，
  // 避免每张图的每个按钮都塞一份路径（5 张图 ≈ 45 份重复 DOM）
  let spriteReady = false;

  function ensureSprite() {
    if (spriteReady || !document.body) return;
    spriteReady = true;
    // 必须用 SVG 命名空间创建，否则 innerHTML 里的 <symbol> 会落在 HTML 命名空间，<use> 解析不到
    const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sprite.setAttribute('aria-hidden', 'true');
    sprite.setAttribute('class', 'mm-sprite');
    sprite.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    sprite.innerHTML = Object.keys(ICONS)
      .map(function (name) {
        return (
          '<symbol id="mm-i-' + name + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
          'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</symbol>'
        );
      })
      .join('');
    document.body.appendChild(sprite);
  }

  function mmIcon(name) {
    ensureSprite();
    return (
      '<svg class="mm-i" width="14" height="14" aria-hidden="true"><use href="#mm-i-' + name + '"></use></svg>'
    );
  }

  const states = new WeakMap();

  /* ---------------- 基础工具 ---------------- */

  function baseSize(svg) {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (vb && vb.width && vb.height) return { w: vb.width, h: vb.height };
    const w = svg.width && svg.width.baseVal ? svg.width.baseVal.value : 0;
    const h = svg.height && svg.height.baseVal ? svg.height.baseVal.value : 0;
    return { w: w || 800, h: h || 600 };
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  /* ---------------- 视图状态 ---------------- */

  function apply(st) {
    st.stage.style.transform = 'translate3d(' + st.tx + 'px,' + st.ty + 'px,0) scale(' + st.k + ')';
    st.el.classList.toggle('mm-zoomed', st.k > st.fit * 1.01);
    // 补间期间跳过按钮同步，避免每帧写 DOM
    if (!st.animating) updateButtons(st);
  }

  function cancelAnim(st) {
    if (st.raf) {
      cancelAnimationFrame(st.raf);
      st.raf = 0;
    }
    if (st.timer) {
      clearTimeout(st.timer);
      st.timer = 0;
    }
    st.animating = false;
  }

  // 补间：缩放按指数插值（26%→30% 和 130%→150% 观感一致），位移线性插值，收尾 easeOutCubic
  function animateTo(st, target, duration) {
    cancelAnim(st);
    const from = { k: st.k, tx: st.tx, ty: st.ty };
    const dur = duration || 170;
    const t0 = performance.now();
    const kRatio = target.k / from.k;

    if (
      Math.abs(target.k - from.k) < 1e-4 &&
      Math.abs(target.tx - from.tx) < 0.5 &&
      Math.abs(target.ty - from.ty) < 0.5
    ) {
      st.k = target.k;
      st.tx = target.tx;
      st.ty = target.ty;
      apply(st);
      return;
    }

    st.animating = true;
    let finished = false;

    // 收尾：正常结束、被取消、或 rAF 被节流（后台标签页）时都收敛到目标态
    function finish() {
      if (finished) return;
      finished = true;
      if (st.raf) {
        cancelAnimationFrame(st.raf);
        st.raf = 0;
      }
      if (st.timer) {
        clearTimeout(st.timer);
        st.timer = 0;
      }
      st.animating = false;
      st.k = target.k;
      st.tx = target.tx;
      st.ty = target.ty;
      apply(st);
    }

    function step(now) {
      if (finished) return;
      const p = Math.min(1, (now - t0) / dur);
      if (p >= 1) {
        finish();
        return;
      }
      const e = 1 - Math.pow(1 - p, 3);
      st.k = from.k * Math.pow(kRatio, e);
      st.tx = from.tx + (target.tx - from.tx) * e;
      st.ty = from.ty + (target.ty - from.ty) * e;
      clampPan(st);
      apply(st);
      st.raf = requestAnimationFrame(step);
    }

    st.raf = requestAnimationFrame(step);
    st.timer = setTimeout(finish, dur + 80);
  }

  function setBtn(st, act, disabled) {
    const btn = st.el.querySelector('button[data-act="' + act + '"]');
    if (btn) btn.disabled = disabled;
  }

  // 该方向还有没有可移动的余量，没有就禁用按钮（否则点了没反应，像是坏了）
  function updateButtons(st) {
    const vw = st.el.clientWidth;
    const vh = st.el.clientHeight;
    const w = st.base.w * st.k;
    const h = st.base.h * st.k;
    const canX = w > vw + 1;
    const canY = h > vh + 1;
    setBtn(st, 'left', !canX || st.tx >= -0.5); // 已经在最左
    setBtn(st, 'right', !canX || st.tx <= vw - w + 0.5); // 已经在最右
    setBtn(st, 'up', !canY || st.ty >= -0.5); // 已经在最上
    setBtn(st, 'down', !canY || st.ty <= vh - h + 0.5); // 已经在最下
    setBtn(st, 'zoom-in', st.k >= OPTIONS.maxScale - 1e-3);
    setBtn(st, 'zoom-out', st.k <= OPTIONS.minScale + 1e-3);
  }

  // 内容比视口小时居中，比视口大时限制在边界内，避免拖飞
  function clampPan(st) {
    const vw = st.el.clientWidth;
    const vh = st.el.clientHeight;
    const w = st.base.w * st.k;
    const h = st.base.h * st.k;
    st.tx = w <= vw ? (vw - w) / 2 : clamp(st.tx, vw - w, 0);
    st.ty = h <= vh ? (vh - h) / 2 : clamp(st.ty, vh - h, 0);
  }

  function layout(st, animate) {
    const el = st.el;
    const vw = el.clientWidth || 0;
    if (!vw) return;
    cancelAnim(st);
    const fitW = Math.min(1, (vw - 2) / st.base.w);
    if (st.opts && st.opts.height) {
      // 弹窗里高度固定，内容按需平移
      el.style.height = st.opts.height;
    } else {
      const maxHeight = window.innerHeight * OPTIONS.maxHeightRatio;
      el.style.height = Math.round(Math.max(OPTIONS.minHeight, Math.min(st.base.h * fitW, maxHeight))) + 'px';
    }
    // 同时受宽高约束：时序图这类竖长的图，只按宽度算会被上下裁掉
    const vh = el.clientHeight || 0;
    st.fit = Math.min(fitW, vh ? (vh - 2) / st.base.h : fitW, 1);
    const k = OPTIONS.mode === 'original' ? 1 : st.fit;
    const target = { k: k, tx: (vw - st.base.w * k) / 2, ty: (vh - st.base.h * k) / 2 };
    if (animate) {
      animateTo(st, target, 240);
    } else {
      st.k = target.k;
      st.tx = target.tx;
      st.ty = target.ty;
      apply(st);
    }
  }

  // 以 (ax, ay) 为锚点缩放：先把目标算好（含边界夹取），再决定是补间还是立即生效
  function zoomAt(st, factor, ax, ay, animate) {
    const next = clamp(st.k * factor, OPTIONS.minScale, OPTIONS.maxScale);
    if (Math.abs(next - st.k) < 1e-4) return false;
    st.dirty = true;

    const vw = st.el.clientWidth;
    const vh = st.el.clientHeight;
    const ratio = next / st.k;
    const w = st.base.w * next;
    const h = st.base.h * next;
    const tx = ax - (ax - st.tx) * ratio;
    const ty = ay - (ay - st.ty) * ratio;
    const target = {
      k: next,
      tx: w <= vw ? (vw - w) / 2 : clamp(tx, vw - w, 0),
      ty: h <= vh ? (vh - h) / 2 : clamp(ty, vh - h, 0),
    };

    if (animate === false) {
      cancelAnim(st);
      st.k = target.k;
      st.tx = target.tx;
      st.ty = target.ty;
      apply(st);
      return true;
    }
    animateTo(st, target, 170);
    return true;
  }

  function panBy(st, dx, dy, animate) {
    const vw = st.el.clientWidth;
    const vh = st.el.clientHeight;
    const w = st.base.w * st.k;
    const h = st.base.h * st.k;
    const tx = w <= vw ? (vw - w) / 2 : clamp(st.tx + dx, vw - w, 0);
    const ty = h <= vh ? (vh - h) / 2 : clamp(st.ty + dy, vh - h, 0);
    if (Math.abs(tx - st.tx) < 0.5 && Math.abs(ty - st.ty) < 0.5) return false;
    st.dirty = true;

    if (animate === false) {
      cancelAnim(st);
      st.tx = tx;
      st.ty = ty;
      apply(st);
      return true;
    }
    animateTo(st, { k: st.k, tx: tx, ty: ty }, 160);
    return true;
  }

  function centerPoint(st) {
    return { x: st.el.clientWidth / 2, y: st.el.clientHeight / 2 };
  }

  /* ---------------- DOM 构建 ---------------- */

  function button(act, label, title, cls) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.act = act;
    btn.title = title;
    btn.setAttribute('aria-label', title);
    if (cls) btn.className = cls;
    btn.innerHTML = label;
    return btn;
  }

  function buildBar() {
    const bar = document.createElement('div');
    bar.className = 'mm-bar';
    bar.appendChild(button('expand', mmIcon('expand'), '放大预览'));
    bar.appendChild(button('copy', mmIcon('copy'), '复制 mermaid 源码'));
    return bar;
  }

  function buildPad() {
    const pad = document.createElement('div');
    pad.className = 'mm-pad';
    PAD.forEach(function (item) {
      if (item.act === 'blank') {
        pad.appendChild(document.createElement('span'));
        return;
      }
      pad.appendChild(button(item.act, mmIcon(item.icon), item.title));
    });
    return pad;
  }

  /* ---------------- 行为 ---------------- */

  function doAction(st, act) {
    const vw = st.el.clientWidth;
    const vh = st.el.clientHeight;
    switch (act) {
      // 注意方向：tx/ty 是内容的偏移，想“看右边”要让内容左移，即 tx 减小
      case 'up':
        return panBy(st, 0, OPTIONS.panStep);
      case 'down':
        return panBy(st, 0, -OPTIONS.panStep);
      case 'left':
        return panBy(st, OPTIONS.panStep, 0);
      case 'right':
        return panBy(st, -OPTIONS.panStep, 0);
      case 'zoom-in':
        return zoomAt(st, OPTIONS.zoomStep, vw / 2, vh / 2);
      case 'zoom-out':
        return zoomAt(st, 1 / OPTIONS.zoomStep, vw / 2, vh / 2);
      case 'reset':
        layout(st, true);
        return true;
      case 'expand':
        openModal(st);
        return false;
      case 'copy':
        copySource(st);
        return false;
    }
    return false;
  }

  function copySource(st) {
    const src = st.el.dataset.mermaidSrc || '';
    if (!src || !navigator.clipboard) return;
    navigator.clipboard.writeText(src).then(
      function () {
        flash(st, 'copy');
      },
      function () {
        /* 用户拒绝授权时静默失败 */
      }
    );
  }

  let flashTimer = 0;
  function flash(st, act) {
    const btn = st.el.querySelector('.mm-bar button[data-act="' + act + '"]');
    if (!btn) return;
    btn.classList.add('mm-ok');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      btn.classList.remove('mm-ok');
    }, 900);
  }

  function bind(st) {
    const el = st.el;

    // 工具条 / 方向盘
    el.addEventListener('click', function (e) {
      const btn = e.target.closest && e.target.closest('button[data-act]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      doAction(st, btn.dataset.act);
    });

    // 拖拽平移
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (e.target.closest && e.target.closest('button')) return;
      cancelAnim(st);
      const start = { x: e.clientX, y: e.clientY, tx: st.tx, ty: st.ty };
      st.drag = start;
      el.classList.add('mm-dragging');
      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {
        /* 合成事件没有可捕获的指针 */
      }
    });

    el.addEventListener('pointermove', function (e) {
      if (!st.drag) return;
      st.tx = st.drag.tx + (e.clientX - st.drag.x);
      st.ty = st.drag.ty + (e.clientY - st.drag.y);
      clampPan(st);
      apply(st);
    });

    function endDrag(e) {
      if (!st.drag) return;
      st.drag = null;
      el.classList.remove('mm-dragging');
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (err) {
        /* 忽略 */
      }
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    // 滚轮缩放：只有聚焦或已放大时才接管，避免影响阅读时翻页
    el.addEventListener(
      'wheel',
      function (e) {
        const active = document.activeElement === el || st.k > st.fit * 1.01;
        if (!active) return;
        const rect = el.getBoundingClientRect();
        const factor = Math.exp(-e.deltaY * OPTIONS.wheelSensitivity);
        if (zoomAt(st, factor, e.clientX - rect.left, e.clientY - rect.top, false)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    // 双击：在适应宽度和 2× 之间切换
    el.addEventListener('dblclick', function (e) {
      const target = st.fit * 2;
      if (st.k > st.fit * 1.5) {
        layout(st, true);
      } else {
        const rect = el.getBoundingClientRect();
        zoomAt(st, target / st.k, e.clientX - rect.left, e.clientY - rect.top);
      }
    });
  }

  /* ---------------- 键盘 ---------------- */

  function handleKeydown(e) {
    const el = e.target.closest && e.target.closest('.mm-viewer');
    if (!el || !states.has(el)) return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;

    const st = states.get(el);
    const center = centerPoint(st);
    let handled = false;

    if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
      handled = zoomAt(st, OPTIONS.zoomStep, center.x, center.y);
    } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
      handled = zoomAt(st, 1 / OPTIONS.zoomStep, center.x, center.y);
    } else if (e.key === '0' || e.code === 'Numpad0' || e.key === 'Escape') {
      layout(st, true);
      handled = e.key !== 'Escape';
    } else {
      const step = OPTIONS.panStep * (e.shiftKey ? OPTIONS.panFast : 1);
      switch (e.key) {
        case 'ArrowLeft':
          handled = panBy(st, step, 0);
          break;
        case 'ArrowRight':
          handled = panBy(st, -step, 0);
          break;
        case 'ArrowUp':
          handled = panBy(st, 0, step);
          break;
        case 'ArrowDown':
          handled = panBy(st, 0, -step);
          break;
        case 'Home': {
          const w = st.base.w * st.k;
          const vw = st.el.clientWidth;
          handled = panBy(st, (w <= vw ? (vw - w) / 2 : 0) - st.tx, 0);
          break;
        }
        case 'End': {
          const w = st.base.w * st.k;
          const vw = st.el.clientWidth;
          handled = panBy(st, (w <= vw ? (vw - w) / 2 : vw - w) - st.tx, 0);
          break;
        }
        default:
          break;
      }
    }

    // 只有真的产生位移/缩放才拦截，否则把按键还给页面
    if (handled) e.preventDefault();
  }

  /* ---------------- 初始化 ---------------- */

  /**
   * 把已渲染的 SVG 挂载成可交互查看器
   * @param {HTMLElement} el 视口容器
   * @param {SVGElement} svg 已渲染的 SVG
   * @param {{height?: string, bar?: boolean}} [opts] 高度覆盖 / 是否显示右上角工具条
   */
  function mount(el, svg, opts) {
    const conf = opts || {};
    const base = baseSize(svg);
    svg.style.maxWidth = 'none';
    svg.style.display = 'block';
    svg.setAttribute('width', Math.round(base.w));
    svg.setAttribute('height', Math.round(base.h));

    const stage = document.createElement('div');
    stage.className = 'mm-stage';
    el.appendChild(stage);
    stage.appendChild(svg);

    const st = { el: el, svg: svg, stage: stage, base: base, k: 1, tx: 0, ty: 0, fit: 1, drag: null, opts: conf };
    states.set(el, st);

    el.classList.add('mm-viewer', 'mm-ready');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', '图表：可拖拽平移，加减号缩放，方向键平移，按 0 复位');

    layout(st);
    if (conf.bar !== false) el.appendChild(buildBar());
    if (conf.pad !== false) el.appendChild(buildPad());
    updateButtons(st);
    bind(st);
    return st;
  }

  function setup(el) {
    if (el.classList.contains('mm-ready')) return;
    const svg = el.querySelector('svg');
    if (!svg) return;
    // 正文里的卡片较矮，只留右上角的“放大预览 / 复制”，缩放平移放到弹窗里
    mount(el, svg, { pad: false });
  }

  function setupAll() {
    document.querySelectorAll('.mermaid').forEach(setup);
  }

  /* ---------------- 放大预览 ---------------- */

  let modal = null;

  function openModal(st) {
    if (modal) return;

    const overlay = document.createElement('div');
    overlay.className = 'mm-modal';

    const card = document.createElement('div');
    card.className = 'mm-modal-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', '图表放大预览');

    const body = document.createElement('div');
    body.className = 'mm-modal-viewer';

    const close = button('close', mmIcon('close'), '关闭预览', 'mm-modal-close');
    close.addEventListener('click', closeModal);

    card.appendChild(body);
    card.appendChild(close);
    overlay.appendChild(card);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.body.appendChild(overlay);
    document.body.classList.add('mm-modal-open');
    document.addEventListener('keydown', onModalKeydown, true);

    // 直接搬移原 SVG 而不是 clone：mermaid 会在 <svg> 内写 <style>#id{...}，
    // 复制会导致 id 重复、样式互相串味
    body.appendChild(st.svg);
    const mst = mount(body, st.svg, { height: '80vh', bar: false });

    modal = { overlay: overlay, body: body, st: mst, origin: st, trigger: document.activeElement };
    close.focus();
  }

  function onModalKeydown(e) {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  }

  function closeModal() {
    if (!modal) return;
    const current = modal;
    modal = null;

    document.removeEventListener('keydown', onModalKeydown, true);
    document.body.classList.remove('mm-modal-open');
    states.delete(current.body);

    // SVG 搬回原位，原查看器重新布局
    current.origin.stage.appendChild(current.st.svg);
    layout(current.origin);

    current.overlay.remove();
    if (current.trigger && current.trigger.focus) current.trigger.focus();
  }

  let bound = false;

  function init() {
    if (!document.querySelector('.mermaid')) return;
    setupAll();

    if (bound) return;
    bound = true;
    document.addEventListener('keydown', handleKeydown);

    let timer = 0;
    window.addEventListener(
      'resize',
      function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          document.querySelectorAll('.mm-viewer').forEach(function (el) {
            const st = states.get(el);
            if (st) layout(st);
          });
        }, 200);
      },
      { passive: true }
    );
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setupAll);
    }
    // 字体/图片晚到会改变尺寸，重新布局一次
    function relayoutAll() {
      document.querySelectorAll('.mm-viewer').forEach(function (el) {
        const st = states.get(el);
        // 用户已经缩放/平移过就不要重置，否则刚点一下就被打回去
        if (st && !st.dirty) layout(st);
      });
    }
    if (document.readyState === 'complete') {
      relayoutAll();
    } else {
      window.addEventListener('load', relayoutAll, { once: true });
    }
  }

  window.setupMermaidKeyNav = init;
})();
