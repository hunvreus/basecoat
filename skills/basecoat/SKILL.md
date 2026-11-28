---
name: basecoat
description: Build and update interfaces in projects using basecoat-css. Use when implementing Basecoat components in HTML, server-rendered templates, or an existing frontend stack.
---

# Using Basecoat

Check the project's installed `basecoat-css` version or CDN URL, active style pack, and script imports. Follow the setup already used by neighboring templates.

Find the component in [the Markdown index](https://basecoatui.com/llms.txt). Fetch its linked page and start with the HTML under **Usage** or the closest example. Basecoat components use semantic HTML. Keep the documented element order, classes, roles, and ARIA attributes. When repeating an example, give each instance unique IDs and update its labels and control references.

For behavior, check the component's JavaScript instructions. CSS-only components need just the stylesheet. If the project loads individual scripts, load the Basecoat runtime once before those scripts. If it loads the all-in-one bundle, check what it already includes. Chart has its own setup.

For Jinja or Nunjucks projects that already use Basecoat macros, look up the component in [Templates](https://basecoatui.com/templates.md). If the installed release differs from the current site, confirm markup and exports against the installed package or its matching repository tag.
