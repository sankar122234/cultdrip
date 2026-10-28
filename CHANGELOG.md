# Cult Drip update log

Each time new files are sent, the version number goes up by one. The Store Manager's "Site files check" compares the files live on your site with the newest version and lists any you forgot to upload. It also shows a reminder at the top of the Store Manager.

## Every update: upload checklist
1. Upload every file listed with the update. Leave data.js, lock.js and paper.jpg alone unless told otherwise.
2. Click Commit changes, wait two minutes, then hard-refresh with Ctrl+Shift+R.
3. Open the Store Manager, then Site files check. Everything should show a tick.

## Version 11 (28 Oct 2026)
Built from the full site audit, then tested in 162 browser/device/page combinations and reviewed separately by five independent reviewers (phone shopper, accessibility, QA breaker, design critic, security).
- New **Help page** (help.html) with Shipping, Returns, Privacy and Terms. A proper 4-column footer links to it. New Store Manager boxes: Privacy, Terms, and a small "price note" (for example "Prices in AUD, GST included").
- Caps and other one-size items no longer show S/M/L/XL. They say "One size" and add in one tap.
- Sold-out items offer "Email me if it returns". Shop filters, search and sort now stay in the web address, so Back and sharing work.
- Phone shop shows two products per row. Product pages line up with the header. The "More like this" row hides when there is only one match.
- Cart: focus stays inside while open and returns to the Cart button, the page behind is locked, buttons keep focus when you change a quantity, and the new total is announced. Checkout button now says "CHECKOUT" (no padlock) and tells the buyer nothing is charged online. Totals are summed in cents so "Add $0.00 more" can no longer appear.
- Accessibility: skip link, darker green and grey text for contrast, bigger tap areas, a Pause button on the moving banner, labelled contact form, keyboard-friendly photo zoom, menu focus.
- Store Manager: refuses to publish live products with a price of 0, asks before publishing items still named "New product", and fixes the broken Preview button and the invisible "Go back" button. Typing 1,000 now means 1000. If you edit while it is saving, it tells you to publish again instead of saying everything is live. Photo slots no longer shuffle when one is cleared.
- Security hardening: currency symbol escaped, stricter order-email check, safer data.js reader.
- Page titles and link previews are set per page.

Upload everything in the zip except data.js, lock.js and paper.jpg.

## Version 10
- Store Manager: "Save token" with an empty box now runs a GitHub connection test. Saving no longer fails on odd characters. Clearer errors. Upload: admin.js.

## Version 9
- Store Manager: clearer message when the browser cannot reach GitHub (shows the real cause, retries reads once). Upload: admin.js only.

## Version 8
- Cart and product page restyled after the Represent reference: flat white panels, black buttons, free-shipping bar under the header, Shipping & returns row, scrolling Others also bought, lock icon on Secure checkout, full-width product page with large photo, caption tiles, 3-column Performance, 2-column accordions, bottom bar with Colour / Size / Add to cart.
- Upload: script.js, style.css, admin.js.

## Version 7
- Fixed: product photo collapsed into a thin column when a product has one photo (title/price box stretched).
- Fixed: cart no longer squashes items on short/phone screens.
- Upload: script.js, style.css, admin.js.

## Version 6 (27 Oct 2026)
- Cart drawer redesigned after the reference: photo, name, price, size and colour, quantity buttons and a clear remove (X) button on every row. Subtotal and free-shipping bar at the top, "Others also bought" row, total and a Secure checkout bar at the bottom. The cut-off Remove button is fixed.
- The single-colour "Colour" dot is gone from the product page. The colour panel only appears when an item has several colours linked by Colour group.
- Upload: script.js, style.css, product.html, admin.js, admin.html. Do not upload data.js.

## Version 5 (27 Oct 2026)
- Product page now follows the Represent layout: vertical thumbnails beside one large photo, stacked panels (colour swatches, sizes, info lines, big Add to cart), feature photo tiles, performance score bars, intro text, 2x2 accordions (Specifications, Materials, Size guide, Shipping & Returns) and a sticky bottom buy bar with colour and size pickers.
- Store Manager: Performance scores box, optional photo for each feature tile, and a store-wide info-lines box.
- Upload: product.html, script.js, style.css, admin.js, admin.html. Do not upload data.js.

## Version 4 (27 Oct 2026)
- Product page redesigned: photo gallery with thumbnails, arrows, swipe and enlarge, model-size note, tagline, colour swatches, size guide, out-of-stock sizes, tabs (Description, Materials, Specifications, Shipping & Returns), feature tiles, Style with row.
- Store Manager: up to 5 photos per product with Upload (resized automatically) and new editing boxes for all the new sections.
- Shop cards show the second photo on hover.
- Upload: product.html, script.js, style.css, admin.js, admin.html. Other pages unchanged. Do not upload data.js.

## Version 3 (27 Oct 2026)
- Phones: a Menu button now shows the page links (they were hidden before).
- Cart: quantities (+ and -), identical items merge, unavailable items are removed with a note, Esc closes it, and it no longer traps keyboard users.
- Checkout: no more pop-up. With an order email set, it opens an email with the order.
- Sign-up and contact forms really work once you add an email or a form address (Store Manager, Store settings).
- Footer links only appear when you add them. Dead links are gone.
- Shop: result count, Clear filters, sold-out items last, search by category, filters stay in the web address.
- Data safety: missing settings, bad prices and broken products can no longer break the page. The banner follows the free-shipping amount.
- Friendly 404 page, a tab icon, skip link and clearer small text.
- Upload: index.html, shop.html, product.html, about.html, contact.html, 404.html, style.css, script.js, admin.js.

## Version 2 (27 Oct 2026)
- Save & publish is one press. The extra buttons (Download, Copy, Load file, publish switches) are gone.
- Preview always shows your latest changes, even right after publishing.
- Your GitHub token stays saved in this browser until you change or remove it.
- Prices and numbers: easier to type, with the discount shown next to each product.
- Upload: admin.html, admin.js, script.js, style.css (the other pages are unchanged).

## Version 1 (27 Oct 2026)
- Store Manager publishes to GitHub when you press Save.
- The shop refreshes itself from GitHub.
- Site files check and update reminder added.
- Upload: index.html, shop.html, product.html, about.html, contact.html, admin.html, style.css, script.js, admin.js. This is a one-time full upload to add the version stamps.
