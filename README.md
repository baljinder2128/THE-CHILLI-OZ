# The Chilli'Oz

Website for The Chilli'Oz, a Melbourne café. *Where spice meets sweet.*

- **Pages:** home, menu, about, contact, and an order page with pickup times
- **Orders:** sent to a Google Sheet through Google Apps Script, with an email for every order
- **Hosting:** GitHub Pages, free. No build step, just plain HTML, CSS and JavaScript.

**Setup and editing guide: [SETUP.md](SETUP.md)**

| Folder / file | What it is |
|---|---|
| `assets/js/config.js` | Order service URL, contact details, opening hours |
| `assets/js/menu-data.js` | The menu and prices |
| `assets/js/site.js` | Header, footer, cart and opening-hours logic |
| `assets/js/menu.js`, `order.js` | Menu page and checkout |
| `google-apps-script/Code.gs` | The order service to paste into Google Apps Script |
