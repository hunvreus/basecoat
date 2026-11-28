// Run in DevTools on the Data Table docs page. Compare the same browser, page and style pack.
(() => {
  const cell = document.querySelector('table td');
  const probe = document.createElement('span');
  const iterations = 100;
  const sample = update => {
    const start = performance.now();
    for (let index = 0; index < iterations; index++) update(index);
    return (performance.now() - start) / iterations;
  };
  const insertRemove = sample(() => {
    cell.append(probe);
    void cell.offsetHeight;
    probe.remove();
    void cell.offsetHeight;
  });
  cell.append(probe);
  try {
    const textUpdate = sample(index => {
      probe.textContent = index % 2 ? 'alpha' : 'bravo';
      void cell.offsetHeight;
    });
    console.table({ 'Insert and remove (ms)': insertRemove, 'Update text (ms)': textUpdate });
  } finally {
    probe.remove();
  }
})();
