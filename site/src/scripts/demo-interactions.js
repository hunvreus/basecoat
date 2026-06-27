const initPriceRange = () => {
  const input = document.getElementById("price-range");
  const output = document.getElementById("price-range-output");
  if (!input || !output || input.dataset.demoRangeInitialized) return;
  input.dataset.demoRangeInitialized = "true";

  const updateRange = () => {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const value = Number(input.value || 0);
    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    input.style.setProperty("--slider-value", `${percent}%`);
    output.textContent = `(up to $${value})`;
  };

  input.addEventListener("input", updateRange);
  updateRange();
};

const initCheckboxTables = () => {
  document.querySelectorAll("[data-checkbox-table]").forEach((table) => {
    if (table.dataset.demoCheckboxTableInitialized) return;
    table.dataset.demoCheckboxTableInitialized = "true";

    const selectAll = table.querySelector("thead input[type='checkbox']");
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const rowCheckboxes = rows
      .map((row) => row.querySelector("input[type='checkbox']"))
      .filter(Boolean);

    const syncRows = () => {
      rows.forEach((row) => {
        const checkbox = row.querySelector("input[type='checkbox']");
        if (checkbox?.checked) {
          row.dataset.state = "selected";
        } else {
          row.removeAttribute("data-state");
        }
      });
    };

    const syncSelectAll = () => {
      if (!selectAll || rowCheckboxes.length === 0) return;
      const checkedCount = rowCheckboxes.filter((checkbox) => checkbox.checked).length;
      selectAll.checked = checkedCount === rowCheckboxes.length;
      selectAll.indeterminate = checkedCount > 0 && checkedCount < rowCheckboxes.length;
    };

    const sync = () => {
      syncRows();
      syncSelectAll();
    };

    selectAll?.addEventListener("change", () => {
      rowCheckboxes.forEach((checkbox) => {
        checkbox.checked = selectAll.checked;
      });
      sync();
    });

    rowCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", sync);
    });

    sync();
  });
};

const initDemos = () => {
  initPriceRange();
  initCheckboxTables();
};

document.addEventListener("keydown", (event) => {
  if (!(event.metaKey || event.ctrlKey) || event.key !== "j") return;
  const dialog = document.getElementById("command-basic");
  if (!dialog) return;
  event.preventDefault();
  dialog.open ? dialog.close() : dialog.showModal();
  dialog.querySelector("header input")?.focus();
});

document.addEventListener("click", (event) => {
  const checkbox = event.target.closest("#dropdown-checkboxes [role='menuitemcheckbox']");
  if (checkbox) {
    if (checkbox.getAttribute("aria-disabled") === "true") return;
    checkbox.setAttribute("aria-checked", checkbox.getAttribute("aria-checked") !== "true");
    return;
  }

  const radio = event.target.closest("#dropdown-radio-group [role='menuitemradio']");
  if (radio) {
    const group = radio.closest("#dropdown-radio-group");
    group?.querySelectorAll("[role='menuitemradio']").forEach((item) => item.setAttribute("aria-checked", "false"));
    radio.setAttribute("aria-checked", "true");
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDemos, { once: true });
} else {
  initDemos();
}

document.addEventListener("htmx:afterSettle", initDemos);
