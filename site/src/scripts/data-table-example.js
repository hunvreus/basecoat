// Docs recipe only: simple-datatables is not part of Basecoat's runtime.
export function mountPayments(root, DataTable) {
  const element = root.querySelector('table');
  // The library snapshots the HTML. Do not copy initialized menus without their listeners.
  element.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.close?.(false);
    menu._destroy?.();
    delete menu._destroy;
    delete menu.dataset.dropdownMenuInitialized;
    delete menu.dataset.basecoatComponent;
  });
  const selected = new Set();
  const arabic = root.lang === 'ar';
  const table = new DataTable(element, {
    sortable: false,
    searchable: true,
    perPage: 3,
    perPageSelect: false,
    fixedColumns: false,
    columns: [{ select: [0, 1, 3, 4], searchable: false }],
    labels: {
      noRows: arabic ? 'لا توجد نتائج.' : 'No results.',
      noResults: arabic ? 'لا توجد نتائج.' : 'No results.',
    },
    template: (options) => `<div class="${options.classes.container}"></div>`,
  });
  const previous = root.querySelector('[data-previous]');
  const next = root.querySelector('[data-next]');
  const status = root.querySelector('output');
  let currentPage = 1;
  let sortColumn = -1;
  let sortDirection = 'asc';
  const sync = () => {
    // Keep filtering the original email column even when its cells are hidden.
    for (const item of root.querySelectorAll('[data-column]')) {
      for (const row of element.rows) {
        if (row.cells.length === element.tHead.rows[0].cells.length) {
          row.cells[Number(item.dataset.column)].hidden = item.getAttribute('aria-checked') === 'false';
        }
      }
    }
    const emptyCell = element.querySelector('td.datatable-empty');
    if (emptyCell) emptyCell.colSpan = element.tHead.querySelectorAll('th:not([hidden])').length;
    const boxes = [...element.querySelectorAll('tbody input[type="checkbox"]')];
    boxes.forEach(box => {
      box.checked = selected.has(box.value);
      if (box.checked) box.closest('tr').dataset.state = 'selected';
      else delete box.closest('tr').dataset.state;
    });
    const all = element.querySelector('thead input[type="checkbox"]');
    all.checked = boxes.length > 0 && boxes.every(box => box.checked);
    all.indeterminate = boxes.some(box => box.checked) && !all.checked;
    all.disabled = boxes.length === 0;
    // A search with no matches sets totalPages to zero but retains the previous pages.
    const matches = table.totalPages ? table.pages.flat() : [];
    const selectedMatches = matches.filter(({ row }) => selected.has(row.attributes['data-payment-id'])).length;
    root.querySelector('[data-selection-count]').textContent = arabic
      ? `تم تحديد ${selectedMatches} من ${matches.length} صفوف.`
      : `${selectedMatches} of ${matches.length} row(s) selected.`;
    root.querySelector('[data-page-count]').textContent = table.totalPages
      ? (arabic ? `الصفحة ${currentPage} من ${table.totalPages}` : `Page ${currentPage} of ${table.totalPages}`)
      : '';
    previous.disabled = table.onFirstPage || !table.totalPages;
    next.disabled = table.onLastPage || !table.totalPages;
    element.querySelectorAll('th').forEach(th => {
      const button = th.querySelector('[data-sort]');
      th.removeAttribute('aria-sort');
      if (button && Number(button.dataset.sort) === sortColumn) th.setAttribute('aria-sort', sortDirection === 'asc' ? 'ascending' : 'descending');
    });
    window.basecoat?.initAll();
  };
  const onInput = (event) => {
    if (event.target.matches('input[type="search"]')) table.search(event.target.value);
  };
  const onChange = (event) => {
    const input = event.target;
    if (input.matches('thead input[type="checkbox"]')) {
      element.querySelectorAll('tbody input[type="checkbox"]').forEach(box => input.checked ? selected.add(box.value) : selected.delete(box.value));
    } else if (input.matches('tbody input[type="checkbox"]')) {
      input.checked ? selected.add(input.value) : selected.delete(input.value);
    }
    sync();
  };
  const onClick = async (event) => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    if (button.hasAttribute('data-column')) {
      sync();
    } else if (button.hasAttribute('data-sort')) {
      const column = Number(button.dataset.sort);
      sortDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
      sortColumn = column;
      table.columns.sort(column, sortDirection);
    } else if (button === previous || button === next) {
      const forward = button === next;
      table.page(currentPage + (forward ? 1 : -1));
      // A disabled pagination control should not strand keyboard focus.
      if (button.disabled && document.activeElement === button) (forward ? previous : next).focus();
    } else if (button.hasAttribute('data-copy-payment')) {
      try {
        await navigator.clipboard.writeText(button.closest('tr').dataset.paymentId);
        if (root.isConnected) status.textContent = arabic ? 'تم نسخ معرف الدفع.' : 'Payment ID copied.';
      } catch (_) {
        if (root.isConnected) status.textContent = arabic ? 'تعذر نسخ معرف الدفع.' : 'Could not copy the payment ID.';
      }
    } else if (button.hasAttribute('data-payment-details')) {
      status.textContent = `${arabic ? 'معرف الدفع' : 'Payment ID'}: ${button.closest('tr').dataset.paymentId}`;
    } else if (button.hasAttribute('data-customer')) {
      status.textContent = `${arabic ? 'العميل' : 'Customer'}: ${button.dataset.customer}`;
    }
  };
  table.on('datatable.page', page => { currentPage = page; sync(); });
  table.on('datatable.search', () => { currentPage = 1; sync(); });
  table.on('datatable.sort', () => { currentPage = 1; sync(); });
  ['datatable.init', 'datatable.update'].forEach(event => table.on(event, sync));
  root.addEventListener('input', onInput);
  root.addEventListener('change', onChange);
  root.addEventListener('click', onClick);
  root.querySelectorAll('[data-table-controls]').forEach(node => { node.inert = false; });
  sync();
  return () => {
    root.removeEventListener('input', onInput);
    root.removeEventListener('change', onChange);
    root.removeEventListener('click', onClick);
    table.destroy();
    root.querySelector('input[type="search"]').value = '';
    root.querySelectorAll('[data-column]').forEach(item => item.setAttribute('aria-checked', 'true'));
    root.querySelectorAll('[data-table-controls]').forEach(node => { node.inert = true; });
  };
}
