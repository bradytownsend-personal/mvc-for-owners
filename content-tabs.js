/* ===========================================================
   content-tabs.js
   Generic tab switching for any ".content-tabs" group followed by
   sibling ".content-panel" elements with matching data-tab-target /
   data-tab-panel values. Reusable across any page — supports more
   than one tab group per page.
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".content-tabs").forEach((tabGroup) => {
    const tabs = tabGroup.querySelectorAll(".content-tab");
    const container = tabGroup.parentElement;
    const panels = container.querySelectorAll(":scope > .content-panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab-target");
        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute("data-tab-panel") !== target;
        });
      });
    });
  });
});
