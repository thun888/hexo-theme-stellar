utils.jq(() => {
  $(function () {
    const els = document.getElementsByClassName('ds-rss');

    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const api = el.dataset.api;
      if (!api) continue;

      utils.request(el, api, async resp => {
        const text = await resp.text();

        const head = text.slice(0, 1024).trim();

        // JSON Feed
        if (head.startsWith('{') && head.includes('jsonfeed.org/version')) {
          handleJsonFeed(el, JSON.parse(text));
          return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/xml');

        if (doc.querySelector('parsererror')) {
          console.error('Failed to parse feed XML.');
          return;
        }
        // Atom Feed
        if (doc.documentElement.nodeName === 'feed' &&
            doc.documentElement.namespaceURI === 'http://www.w3.org/2005/Atom') {
          handleAtom(el, doc);
          return;
        }
        // RSS 2.0 Feed
        if (doc.documentElement.nodeName === 'rss') {
          handleRSS2(el, doc);
          return;
        }
        // RSS 1.0 Feed
        if (doc.documentElement.nodeName === 'rdf:RDF') {
          handleRSS1(el, doc);
          return;
        }
      });
    }
  });
});


function handleAtom(el, doc) {
  const content_type = el.getAttribute('content_type');
  // const feedTitle = doc.querySelector('feed > title')?.textContent || '未命名订阅源';
  const entries = doc.querySelectorAll('entry');
  const feedAuthorName = doc.querySelector('feed > author > name')?.textContent || '匿名';

  entries.forEach((item, i) => {
    const title = item.querySelector('title')?.textContent || '无题';
    const link = item.querySelector('link')?.getAttribute('href') || '#';
    const published = item.querySelector('published, updated')?.textContent;
    const content = item.querySelector('content')?.textContent || '';
    const summary = item.querySelector('summary')?.textContent || '';
    const authorName = item.querySelector('author > name')?.textContent || feedAuthorName;

    let cell = '<div class="timenode" index="' + i + '">';
    
    cell += '<div class="header">';
    cell += '<span class="user-info"><strong>' + authorName + '</strong></span>';
    if (published) {
      let date = new Date(published);
      cell += '<span>' + date.toLocaleString() + '</span>';
    }
    cell += '</div>';

    cell += '<div class="body">';
    cell += '<p class="title">';
    cell += '<a href="' + link + '" target="_blank" rel="external nofollow noopener noreferrer">';
    cell += title;
    cell += '</a>';
    cell += '</p>';
    
    cell += '<div class="content">' + (content_type === 'summary' ? summary : content) + '</div>';
    cell += '</div>';
    cell += '</div>';

    $(el).append(cell); 
  });
}

function handleRSS2(el, doc) {
  const content_type = el.getAttribute('content_type');
  const show_title = el.getAttribute('show_title') === 'true';
  const items = doc.querySelectorAll('item');
  const feedAuthorName = doc.querySelector('channel > managingEditor, channel > webMaster, channel > title')?.textContent || '匿名';

  items.forEach((item, i) => {
    const title = item.querySelector('title')?.textContent || '无题';
    const link = item.querySelector('link')?.textContent || '#';
    const pubDate = item.querySelector('pubDate')?.textContent;
    const content = item.querySelector('content\\:encoded')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const authorName = item.querySelector('author, creator')?.textContent || feedAuthorName;

    let cell = '<div class="timenode" index="' + i + '">';
    
    cell += '<div class="header">';
    cell += '<span class="user-info"><strong>' + authorName + '</strong></span>';
    if (pubDate) {
      let date = new Date(pubDate);
      cell += '<span>' + (isNaN(date) ? pubDate : date.toLocaleString()) + '</span>';
    }
    cell += '</div>';

    cell += '<div class="body">';
    if (show_title) {
      cell += '<p class="title">';
      cell += '<a href="' + link + '" target="_blank" rel="external nofollow noopener noreferrer">';
      cell += title;
      cell += '</a>';
      cell += '</p>';
    }
    
    cell += '<div class="content">' + (content_type === 'summary' ? description : content) + '</div>';
    cell += '</div>';
    cell += '</div>';

    $(el).append(cell); 
  });
}

function handleRSS1(el, doc) {
  const content_type = el.getAttribute('content_type');
  const show_title = el.getAttribute('show_title') === 'true';
  const items = doc.querySelectorAll('item');
  
  const feedTitle = doc.querySelector('channel > title')?.textContent || '匿名';

  items.forEach((item, i) => {
    const title = item.querySelector('title')?.textContent || '无题';
    const link = item.querySelector('link')?.textContent || '#';
    
    const pubDate = (item.querySelector('pubDate') || item.getElementsByTagName('dc:date')[0])?.textContent;
    const content = item.querySelector('content\\:encoded')?.textContent || '';
    const description = (item.querySelector('description') || item.querySelector('summary'))?.textContent || '';
    const authorName = (item.querySelector('author') || item.getElementsByTagName('dc:creator')[0])?.textContent || feedTitle;

    let cell = '<div class="timenode" index="' + i + '">';
    
    cell += '<div class="header">';
    cell += '<span class="user-info"><strong>' + authorName + '</strong></span>';
    if (pubDate) {
      let date = new Date(pubDate);
      cell += '<span>' + (isNaN(date) ? pubDate : date.toLocaleString()) + '</span>';
    }
    cell += '</div>';

    cell += '<div class="body">';
    if (show_title) {
    cell += '<p class="title">';
    cell += '<a href="' + link + '" target="_blank" rel="external nofollow noopener noreferrer">';
    cell += title;
    cell += '</a>';
    cell += '</p>';
    }
    cell += '<div class="content">' + (content_type === 'summary' ? description : content) + '</div>';
    cell += '</div>';
    cell += '</div>';

    $(el).append(cell); 
  });
}
function handleJsonFeed(el, data) {
  const content_type = el.getAttribute('content_type');
  const show_title = el.getAttribute('show_title') === 'true';
  const items = data.items || [];
  const feedAuthorName = data.authors?.[0]?.name || data.title || '匿名';

  items.forEach((item, i) => {
    const id = item.id || i;
    const title = item.title || '无题';
    const link = item.url || '#';
    const pubDate = item.date_published;
    
    const content = item.content_html || '';
    const summary = item.summary || '';
    
    let authorName = '';
    for (i in item.authors || []) {
      const author = item.authors[i];
      if (author.name) {
        authorName += author.name + ' ';
      }
    }
    if (authorName.length === 0) {
      authorName = feedAuthorName;
    }

    let cell = '<div class="timenode" index="' + id + '">';
    
    cell += '<div class="header">';
    cell += '<span class="user-info"><strong>' + authorName + '</strong></span>';
    if (pubDate) {
      let date = new Date(pubDate);
      cell += '<span>' + (isNaN(date.getTime()) ? pubDate : date.toLocaleString()) + '</span>';
    }
    cell += '</div>';

    cell += '<div class="body">';
    if (show_title) {
    cell += '<p class="title">';
    cell += '<a href="' + link + '" target="_blank" rel="external nofollow noopener noreferrer">';
    cell += title;
    cell += '</a>';
    cell += '</p>';
    }
    cell += '<div class="content">' + (content_type === 'summary' ? summary : content) + '</div>';
    cell += '</div>';
    cell += '</div>';

    $(el).append(cell); 
  });
}