// Pagefind search integration for docs site
(() => {
  let pagefindPromise = null;

  const loadPagefind = () => {
    if (!pagefindPromise) {
      pagefindPromise = import('/pagefind/pagefind.js')
        .then(async (pf) => {
          await pf.init();
          return pf;
        })
        .catch((error) => {
          pagefindPromise = null;
          console.error('Failed to load Pagefind:', error);
          throw new Error('Search is not available');
        });
    }
    return pagefindPromise;
  };

  // Sanitize HTML, allowing only <mark> tags for search highlighting
  const sanitizeExcerpt = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    // Walk all nodes and only keep text and <mark> elements
    const sanitize = (node) => {
      const result = [];
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          result.push(document.createTextNode(child.textContent));
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'MARK') {
          const mark = document.createElement('mark');
          mark.textContent = child.textContent;
          result.push(mark);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          result.push(...sanitize(child));
        }
      });
      return result;
    };
    const container = document.createElement('span');
    sanitize(div).forEach((n) => container.appendChild(n));
    return container.innerHTML;
  };

  // Wait for basecoat to be available
  const init = () => {
    if (!window.basecoat?.commandAsync || !window.basecoat?.utils?.escapeHtml) {
      setTimeout(init, 50);
      return;
    }

    window.basecoat.commandAsync.register('site-search', {
      minLength: 2,
      debounce: 150,
      maxResults: 8,
      onSearch: async (query, signal) => {
        const pf = await loadPagefind();
        const search = await pf.search(query);

        if (signal?.aborted) return [];

        const results = await Promise.all(
          search.results.slice(0, 8).map(r => r.data())
        );

        return results.map(r => ({
          label: r.meta?.title || 'Untitled',
          excerpt: r.excerpt || '',
          url: r.url
        }));
      },
      renderItem: (item, id) => {
        const { escapeHtml } = window.basecoat.utils;
        const safeExcerpt = sanitizeExcerpt(item.excerpt);
        const safeLabel = escapeHtml(item.label);
        const safeUrl = escapeHtml(item.url);
        return `<a id="${id}" href="${safeUrl}" role="menuitem" class="search-result">
          <span class="search-result-title">${safeLabel}</span>
          <span class="search-result-excerpt">${safeExcerpt}</span>
        </a>`;
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
