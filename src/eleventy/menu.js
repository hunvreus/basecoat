export const docUrl = (slug) => {
  if (slug === 'index') return '/';
  if (slug.endsWith('/index')) return '/' + slug.replace(/\/index$/, '/');
  return '/' + slug + '/';
};

export const flattenMenuSlugs = (menu) => {
  const out = [];

  const walk = (items) => {
    (items || []).forEach((item) => {
      if (typeof item === 'string') {
        out.push(item);
        return;
      }

      if (item?.type === 'submenu' && Array.isArray(item.items)) {
        walk(item.items);
      }
    });
  };

  (menu || []).forEach((group) => {
    if (group?.type !== 'group') return;
    walk(group.items);
  });

  return out;
};

export const collectMenuSlugs = (menu) => {
  return [...new Set(flattenMenuSlugs(menu))];
};

export const fallbackLabelFromSlug = (slug) => {
  if (slug === 'index') return 'Introduction';
  const parts = String(slug).split('/');
  const last = parts[parts.length - 1];
  const base = last === 'index' && parts.length > 1 ? parts[parts.length - 2] : last;
  return base.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};
