# Setting up The Chilli'Oz website

The website is free to run: GitHub Pages hosts it, and a Google Sheet with a small
Google Apps Script receives orders and emails you. There are three steps only you can do,
because they need your own GitHub and Google accounts. They take about 10 minutes in total.

---

## Step 1 · Turn on the website (GitHub Pages)

1. Open the repository on GitHub: <https://github.com/baljinder2128/THE-CHILLI-OZ>
2. Click **Settings** (top bar), then **Pages** (left menu).
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, choose **main** and **/ (root)**, then click **Save**.
5. Wait one or two minutes and refresh. GitHub shows your address at the top of the page:
   **https://baljinder2128.github.io/THE-CHILLI-OZ/**

The site works straight away. Until you finish Step 2, the order page says
"Online ordering opens soon" instead of sending orders.

---

## Step 2 · Create the orders sheet and order service (Google)

1. Go to <https://sheets.new> to make a new Google Sheet. Name it **Chilli'Oz Orders**.
2. In the sheet, click **Extensions → Apps Script**. A code editor opens in a new tab.
3. Delete everything in the editor. Open
   [google-apps-script/Code.gs](google-apps-script/Code.gs) in this repository, click the
   **Copy raw file** button, and paste it into the editor. Click the **Save** icon.
4. In the toolbar, pick **setup** from the function list and click **Run**.
   - Google asks for permission. Click **Review permissions**, choose your account.
   - You'll see "Google hasn't verified this app". That's normal for your own script:
     click **Advanced → Go to (project name) (unsafe)** and then **Allow**.
   - Back in the sheet, a new **Orders** tab with column headings appears.
5. Click **Deploy → New deployment**.
   - Click the gear next to "Select type" and choose **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy**, then **copy the Web app URL** (it ends in `/exec`).

---

## Step 3 · Connect the website to the order service

1. In the repository, open [assets/js/config.js](assets/js/config.js) and click the
   **pencil icon** (Edit).
2. Paste your Web app URL between the quotes on the `orderEndpoint` line:
   ```js
   orderEndpoint: "https://script.google.com/macros/s/AKfy.../exec",
   ```
3. While you're there, add your phone number and email if you want them on the site.
4. Click **Commit changes**. The live site updates within a minute or two.

Or just send the Web app URL to Claude in the project thread and it will do this step for you.

**Test it:** open the site, add something to your order, and place it. You should see an
order number on screen, a new row in the **Orders** tab, and an email in your inbox.

---

## Running it day to day

- **New orders** arrive by email (subject starts with 🌶 New order) and as a row in the sheet.
- Use the **Status** column (New → Making → Ready → Collected) to keep track.
- Customers **pay when they collect**. There is no online payment.

## Changing things later

| To change… | Edit this file |
|---|---|
| Menu items, descriptions, prices, sold out | `assets/js/menu-data.js` (add `soldOut: true` to hide an item for the day) |
| Milk options and extra shot price | top of `assets/js/menu-data.js` |
| Phone, email, address, social links, opening hours | `assets/js/config.js` |
| Page wording | `index.html`, `about.html`, `contact.html` |
| Logo | replace `assets/img/logo.png` and `assets/img/logo-small.png` |
| Who gets order emails, customer receipts on/off | settings at the top of `Code.gs` in Apps Script |

If you change `Code.gs` in Apps Script, publish it again with
**Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
This keeps the same Web app URL, so the website doesn't need changing.

## Free limits to know about

- A personal Google account can send about **100 emails a day** from a script. Each order
  sends one email to you, plus one receipt if the customer gives an email, so plan on roughly
  50 orders a day with receipts on. Set `SEND_CUSTOMER_EMAIL = false` in `Code.gs` to double that.
  Orders are always saved to the sheet even if the email limit is reached.
- Prices on the site are indicative ones from the business plan. Please check them before launch.
