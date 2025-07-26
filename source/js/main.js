// utils
const util = {

  // https://github.com/jerryc127/hexo-theme-butterfly
  diffDate: (d, more = false) => {
    const dateNow = new Date()
    const datePost = new Date(d)
    const dateDiff = dateNow.getTime() - datePost.getTime()
    const minute = 1000 * 60
    const hour = minute * 60
    const day = hour * 24

    let result
    if (more) {
      const dayCount = dateDiff / day
      const hourCount = dateDiff / hour
      const minuteCount = dateDiff / minute

      if (dayCount > 14) {
        result = null
      } else if (dayCount >= 1) {
        result = parseInt(dayCount) + ' ' + ctx.date_suffix.day
      } else if (hourCount >= 1) {
        result = parseInt(hourCount) + ' ' + ctx.date_suffix.hour
      } else if (minuteCount >= 1) {
        result = parseInt(minuteCount) + ' ' + ctx.date_suffix.min
      } else {
        result = ctx.date_suffix.just
      }
    } else {
      result = parseInt(dateDiff / day)
    }
    return result
  },

  copy: (id, msg) => {
    const el = document.getElementById(id);
    if (el) {
      el.select();
      document.execCommand("Copy");
      if (msg && msg.length > 0) {
        hud.toast(msg, 2500);
      }
    }
  },

  toggle: (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle("display");
    }
  },

  scrollTop: () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  },

  scrollComment: () => {
    document.getElementById('comments').scrollIntoView({behavior: "smooth"});
  },

  viewportLazyload: (target, func, enabled = true) => {
    if (!enabled || !("IntersectionObserver" in window)) {
      func();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].intersectionRatio > 0) {
        func();
        observer.disconnect();
      }
    });
    observer.observe(target);
  }
}

const hud = {
  toast: (msg, duration) => {
    const d = Number(isNaN(duration) ? 2000 : duration);
    var el = document.createElement('div');
    el.classList.add('toast');
    el.classList.add('show');
    el.innerHTML = msg;
    document.body.appendChild(el);

    setTimeout(function(){ document.body.removeChild(el) }, d);
    
  },

}

// defines

const l_body = document.querySelector('.l_body');


const init = {
  toc: () => {
    utils.jq(() => {
      const scrollOffset = 32;
      var segs = [];
      $("article.md-text :header").each(function (idx, node) {
        segs.push(node);
      });
      function activeTOC() {
        var scrollTop = $(this).scrollTop();
        var topSeg = null;
        for (var idx in segs) {
          var seg = $(segs[idx]);
          if (seg.offset().top > scrollTop + scrollOffset) {
            continue;
          }
          if (!topSeg) {
            topSeg = seg;
          } else if (seg.offset().top >= topSeg.offset().top) {
            topSeg = seg;
          }
        }
        if (topSeg) {
          $("#data-toc a.toc-link").removeClass("active");
          var link = "#" + topSeg.attr("id");
          if (link != '#undefined') {
            const highlightItem = $('#data-toc a.toc-link[href="' + encodeURI(link) + '"]');
            if (highlightItem.length > 0) {
              highlightItem.addClass("active");
            }
          } else {
            $('#data-toc a.toc-link:first').addClass("active");
          }
        }
      }
      function scrollTOC() {
        const e0 = document.querySelector('#data-toc .toc');
        const e1 = document.querySelector('#data-toc .toc a.toc-link.active');
        if (e0 == null || e1 == null) {
          return;
        }
        const offsetBottom = e1.getBoundingClientRect().bottom - e0.getBoundingClientRect().bottom + 100;
        const offsetTop = e1.getBoundingClientRect().top - e0.getBoundingClientRect().top - 64;
        if (offsetTop < 0) {
          e0.scrollBy({top: offsetTop, behavior: "smooth"});
        } else if (offsetBottom > 0) {
          e0.scrollBy({top: offsetBottom, behavior: "smooth"});
        }
      }
      
      var timeout = null;
      window.addEventListener('scroll', function() {
        activeTOC();
        if(timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(function() {
          scrollTOC();
        }.bind(this), 50);
      });      
    })
  },
  sidebar: () => {
    utils.jq(() => {
      $("#data-toc a.toc-link").click(function (e) {
        sidebar.dismiss();
      });
    })
  },
  relativeDate: (selector) => {
    selector.forEach(item => {
      const $this = item
      const timeVal = $this.getAttribute('datetime')
      let relativeValue = util.diffDate(timeVal, true)
      if (relativeValue) {
        $this.innerText = relativeValue
      }
    })
  },
  /**
   * Tabs tag listener (without twitter bootstrap).
   */
  registerTabsTag: function () {
    // Binding `nav-tabs` & `tab-content` by real time permalink changing.
    document.querySelectorAll('.tabs .nav-tabs .tab').forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();
        // Prevent selected tab to select again.
        if (element.classList.contains('active')) return;
        // Add & Remove active class on `nav-tabs` & `tab-content`.
        [...element.parentNode.children].forEach(target => {
          target.classList.toggle('active', target === element);
        });
        // https://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
        const tActive = document.getElementById(element.querySelector('a').getAttribute('href').replace('#', ''));
        [...tActive.parentNode.children].forEach(target => {
          target.classList.toggle('active', target === tActive);
        });
        // Trigger event
        tActive.dispatchEvent(new Event('tabs:click', {
          bubbles: true
        }));
      });
    });

    window.dispatchEvent(new Event('tabs:register'));
  },

  canonicalCheck: () => {
    const canonical = window.canonical;
    function showTip(isOfficial = false) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
      const notice = document.createElement('div');
      const originalURL = `https://${canonical.originalHost}`;
      if (isOfficial) {
        notice.className = 'canonical-tip official';
        notice.innerHTML = `
        <a href="${originalURL}" target="_self" rel="noopener noreferrer">
        本站为官方备用站，仅供应急。主站：${originalURL}
        </a>
        `;
      } else {
        notice.className = 'canonical-tip unofficial';
        notice.innerHTML = `
        <a href="${originalURL}" target="_self" rel="noopener noreferrer">
        <div class="headline icon">☠️</div>
        本站为非法克隆站，请前往官方源站访问。<br>
        源站：${originalURL}
        </a>
        `;
      }
      document.body.appendChild(notice);
    }
    if (!canonical.originalHost) return;
    const currentURL = new URL(window.location.href);
    const currentHost = currentURL.hostname.replace(/^www\./, '');
    if (currentHost == 'localhost') return;
    const encodedCurrentHost = window.btoa(currentHost);
    const isCurrentHostValid = canonical.encoded === encodedCurrentHost;
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      if (isCurrentHostValid) {
        return;
      }
      if (canonical.officialHosts?.includes(currentHost)) {
        showTip(true);
        return;
      }
      showTip(false);
      return;
    }
    const canonicalURL = new URL(canonicalTag.href);
    const canonicalHost = canonicalURL.hostname.replace(/^www\./, '');
    const encodedCanonicalHost = window.btoa(canonicalHost);
    const isCanonicalHostValid = canonical.encoded === encodedCanonicalHost;
    if (isCanonicalHostValid && isCurrentHostValid) {
      return;
    }
    showTip(canonical.officialHosts?.includes(currentHost));
  }

}

function cardClick(event, url) {
  if (event.target.closest('a')) return;
  window.open(url, '_blank');
}


function generatePoints(w, h, n, maxd, mind, circle_radius, maxAttempts = 1000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 先随机一个中心，让圆都能在边界内
    let cx = randRange(circle_radius, w - circle_radius);
    let cy = randRange(circle_radius, h - circle_radius);
    let clusterR = maxd / 2;

    // 极坐标生成 n 个点
    let pts = [];
    for (let i = 0; i < n; i++) {
      let theta = Math.random() * 2 * Math.PI;
      let r = clusterR * Math.sqrt(Math.random());
      let x = cx + r * Math.cos(theta);
      let y = cy + r * Math.sin(theta);
      pts.push({x, y});
    }

    // 检查两两距离约束
    let ok = true;
    for (let i = 0; i < n && ok; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = pts[i].x - pts[j].x;
        let dy = pts[i].y - pts[j].y;
        let d = Math.hypot(dx, dy);
        if (d < mind || d > maxd) {
          ok = false;
          break;
        }
      }
    }

    if (ok) {
      // 再附加检查：每个点离边界 ≥ circle_radius
      let inBounds = pts.every(p => p.x >= circle_radius && p.x <= w - circle_radius && p.y >= circle_radius && p.y <= h - circle_radius);
      if (inBounds) return pts;
    }
  }
  return null;
}

// 获取 [min, max] 随机浮点
function randRange(min, max) {
  return min + Math.random() * (max - min);
}

// 主画图函数
function drawClouds() {
  // 检查本地缓存
  const cachedData = localStorage.getItem('cloudDataCache');
  const cachedTime = localStorage.getItem('cloudDataCacheTime');
  const currentTime = new Date().getTime();

  // 如果缓存存在且未超过30分钟
  if (cachedData && cachedTime && (currentTime - cachedTime < 30 * 60 * 1000)) {
    const data = JSON.parse(cachedData);
    console.log('[drawClouds] 使用缓存数据:', data);
    renderClouds(data);
    return;
  }

  // 如果缓存不存在或已过期，重新获取
  fetch("https://generate-cloud-image.hzchu.top/v1/image?format=json")
  .then(res => res.json())
  .then(data => {
    // 存储数据和时间戳到 localStorage
    localStorage.setItem('cloudDataCache', JSON.stringify(data));
    localStorage.setItem('cloudDataCacheTime', currentTime.toString());

    renderClouds(data);
  })
  .catch(error => {
    console.error('[drawClouds] 获取云朵数据失败:', error);
  });
}

function renderClouds(data) {
  const w = document.querySelector('.sidebg').getBoundingClientRect().width
  const h = document.querySelector('.sidebg').getBoundingClientRect().height
  const pointCount = 5
  const minDist = 10
  const maxDist = 40
  const circle_radius = 25

  const cloudCount = data.cloud_count
  const color = data.color

  const canvas = document.getElementById("cloud-canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");

  // 透明背景
  ctx.clearRect(0, 0, w, h);

  for (let ci = 0; ci < cloudCount; ci++) {
    const pts = generatePoints(w, h, pointCount, maxDist, minDist, circle_radius);
    if (!pts) {
      console.log(`[drawClouds] 第 ${ci+1} 朵云生成失败！`);
      return;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let p of pts) {
      ctx.moveTo(p.x + circle_radius, p.y);
      ctx.arc(p.x, p.y, circle_radius, 0, 2 * Math.PI);
    }
    ctx.fill();
  }
}


// init
init.toc()
init.sidebar()
init.relativeDate(document.querySelectorAll('#post-meta time'))
init.registerTabsTag()
init.canonicalCheck()
drawClouds()

