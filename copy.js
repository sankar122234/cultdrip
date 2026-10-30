/* cd-version:13 */
/* Suggested wording for the whole site, from the approved copy deck (28 Oct 2026).
   The owner never has to touch this file: business details go in the Store Manager (STORE.facts),
   the owner's own wording goes in STORE.copy or the flat STORE fields, and either one wins over this file.
   Template language: _dev/SPEC.md section 3. The rules this wording keeps:
   - A line that needs a business detail the owner has not filled in is left out, never shown with a gap.
   - No claim without the detail behind it: "heavyweight" and gsm need the gsm figures, "retired" and
     "limited-run" need retireDesigns=yes, member promises need memberPerk, delivery and print times need the
     day figures, ship-by dates are mentioned only while a drop is live (the only time a product page shows
     one), and anything about age needs adultsOnly=yes.
   - The faulty-goods rights (Australian Consumer Law) are always shown. The change-of-mind text appears
     only for the option the owner chose (swap or refund), never both. "Not decided yet" (blank) and
     "Nothing extra" (none) behave the same: no change-of-mind text.
   - Free shipping is always worded "Free shipping on orders of {freeShip} or more", because the cart gives
     it at that amount or above.
   - Plain text only. The only markup is **bold** and [[page.html#anchor|label]] links to our own pages. */
var COPY_META={date:"30 October 2026"};

/* Old placeholder values: the first builder's defaults in data.js and the old built-in fallbacks in
   script.js (v12). A flat field that still holds exactly one of these counts as blank, so the suggested
   wording shows. Anything the owner really wrote is kept.
   priceNote: "GST included" came from the old Store Manager's example text. The business is not
   registered for GST, so that wording must not show. */
var COPY_LEGACY={
  announce:["Free shipping on orders over $95"],
  heroTitle:["Welcome"],
  heroText:["Limited-run streetwear in heavy fabric. Small drops, no restocks."],
  shopTitle:["Shop"],
  delivery:["Free standard delivery on orders over $95.","Ask us about delivery before you buy."],
  returns:["Ask us about returns before you buy."],
  perks:["Free shipping on orders over $95"],
  priceNote:["Prices in AUD, GST included","Prices in AUD, GST included."]
};

/* k: line (first surviving line) | inline (lines joined by a space) | p (paragraphs) | steps | items | creed | faq | map | btn
   flat: the existing STORE field this key is stored in (blank there = suggested wording)
   edit: 1 = shown in the Store Manager "Page words" panel (non-flat keys only)
   g: group in the Store Manager, l: label, h: one-line help, t: the suggested wording (one line per item) */
var COPY={

  /* ---------- every page ---------- */
  announce:{k:"line",flat:"announce",g:"Every page",l:"Top banner (when no drop is on)",
    h:"The strip across the top of every page; a drop banner replaces it while a drop is on.",t:[
    "Free shipping on orders of {freeShip} or more."]},
  bannerDrop:{k:"line",g:"Every page",l:"Top banner while a drop is on",
    h:"Replaces the top banner once a drop mode is chosen and its name and dates are filled in.",t:[
    "@if dropMode=live&dropName&dropCloses {dropName} is live until {dropCloses}.{?freeShip| Free shipping on orders of {freeShip} or more.}",
    "@if dropMode=before&dropName&dropOpens {dropName} opens {dropOpens}.{?memberPerk| Join the Cult for the link first.}{?freeShip| Free shipping on orders of {freeShip} or more.}",
    "@if dropMode=between&dropNext {?dropName|{dropName} has closed. }Next drop: {dropNext}.{?memberPerk| Members get the link first.}"]},

  /* ---------- home ---------- */
  eyebrow:{k:"line",g:"Home",l:"Small line above the home headline",
    h:"Shows the drop when one is on, otherwise “Streetwear drops”.",t:[
    "@if dropMode=live&dropName {dropName} · Live now",
    "@if dropMode=before&dropOpens Next drop · {dropOpens}",
    "@if dropMode=between&dropNext Next drop · {dropNext}",
    "Streetwear drops"]},
  heroButton:{k:"btn",g:"Home",l:"Home button",
    h:"“Shop the drop” while a drop is open, “Join the Cult” before and between drops, otherwise “Shop now”.",t:[
    "@if dropMode=live Shop the drop | shop.html",
    "@if dropMode=before,dropMode=between Join the Cult | #join",
    "Shop now | shop.html"]},
  heroTitle:{k:"line",flat:"heroTitle",g:"Home",l:"Home headline",
    h:"The big line at the top of the home page.",t:[
    "Dress like you belong."]},
  heroText:{k:"inline",flat:"heroText",g:"Home",l:"Home sub-text",
    h:"The line under the home headline.",t:[
    "@if teeGsm&hoodieGsm Heavyweight oversized tees and hoodies, printed to order in small drops.",
    "@if !teeGsm,!hoodieGsm Oversized tees and hoodies, printed to order in small drops.",
    "@if retireDesigns=yes When a drop closes, the design is retired."]},
  marquee:{k:"items",g:"Home",l:"Scrolling strip",edit:1,
    h:"Short phrases that scroll across the home page under the headline.",t:[
    "Wear it loud",
    "Drops, not dumps",
    "@if memberPerk Members first",
    "Printed to order"]},
  trust:{k:"items",g:"Home",l:"Trust strip",edit:1,
    h:"Up to three short facts in a row under the scrolling strip.",t:[
    "@if teeGsm {teeGsm} gsm heavyweight tees",
    "@if hoodieGsm&!teeGsm {hoodieGsm} gsm heavyweight hoodies",
    "@if freeShip Free shipping on orders of {freeShip} or more",
    "@if changeOfMind=swap Swap your size once"]},
  freshNote:{k:"line",g:"Home",l:"Note under “Fresh in”",
    h:"Explains the order of the newest pieces on the home page.",t:[
    "Anything you can buy right now comes first. Coming soon and sold out pieces follow."]},
  rangeText:{k:"inline",g:"Home",l:"The range",edit:1,
    h:"The paragraph beside “The range” on the home page.",t:[
    "@if teeGsm&hoodieGsm Oversized silhouettes. Heavyweight tees and hoodies.",
    "@if !teeGsm,!hoodieGsm Oversized silhouettes.",
    "@if teeGsm&hoodieGsm Tees are {teeGsm} gsm and hoodies are {hoodieGsm} gsm, printed to order in small drops{?printPartner| by {printPartner}}.",
    "@if teeGsm&!hoodieGsm Tees are {teeGsm} gsm.",
    "@if hoodieGsm&!teeGsm Hoodies are {hoodieGsm} gsm.",
    "@if !teeGsm,!hoodieGsm Every piece is printed to order in small drops{?printPartner| by {printPartner}}.",
    "@if sizeGuides Size guides list measurements in cm, so you can pick your size with confidence."]},
  joinText:{k:"inline",g:"Home",l:"Join the Cult line",edit:1,
    h:"The line under “Join the Cult” on the home and About pages.",t:[
    "@if memberPerk Members get {memberPerk}.",
    "Free to join, and you can leave any time."]},
  joinSmall:{k:"inline",g:"Home",l:"Small print under the sign-up form",edit:1,
    h:"Says how often you email, whether sign-up is for adults only, and links to the Privacy policy.",t:[
    "We’ll email about drops{?emailsPerMonth|: {emailsPerMonth} a month}.",
    "@if adultsOnly=yes For people 18 and over.",
    "[[help.html#privacy|Privacy policy]]"]},
  officialLine:{k:"line",g:"Home",l:"Official store line (optional)",edit:1,
    h:"Empty unless you write one, and only if it is true, for example “This is the only official Cult Drip store. We sell nowhere else.”",t:[]},

  /* ---------- shop ---------- */
  shopTitle:{k:"line",flat:"shopTitle",g:"Shop",l:"Shop page title",
    h:"The heading of the shop page.",t:[
    "The Drop"]},
  shopIntro:{k:"inline",g:"Shop",l:"Shop intro line",edit:1,
    h:"The line under the shop title; it follows the drop you set under Current drop.",t:[
    "@if dropMode=live&dropName&dropCloses {dropName} is open until {dropCloses}.",
    "@if dropMode=before&dropName&dropOpens {dropName} opens {dropOpens}.",
    "@if dropMode=between&dropNext Next drop: {dropNext}.{?memberPerk| Join the Cult to get the link first.}",
    "@if dropMode!=between Every piece is printed after you order.{?sizeGuides| Size guides list measurements in cm.}"]},
  catLines:{k:"map",g:"Shop",l:"Category lines",edit:1,
    h:"One short line shown when a shopper picks a category.",t:[
    "@if hoodieGsm Hoodies | {hoodieGsm} gsm, oversized fit. Printed to order.",
    "@if !hoodieGsm Hoodies | Oversized fit. Printed to order.",
    "@if teeGsm Tees | {teeGsm} gsm, oversized fit. Printed to order.",
    "@if !teeGsm Tees | Oversized fit. Printed to order.",
    "Bottoms | Printed to order.",
    "Headwear | One size. Printed to order.",
    "// the category names before the rename (Pants is now Bottoms, Caps is now Headwear)",
    "Pants | Printed to order.",
    "Caps | One size. Printed to order."]},
  emptyShop:{k:"inline",g:"Shop",l:"Empty shop message",
    h:"Shown when no piece is on the site at all.",t:[
    "Nothing is live right now.",
    "@if dropNext Next drop: {dropNext}.",
    "@if memberPerk [[index.html#join|Join the Cult]] to get the link first.",
    "@if !memberPerk [[index.html#join|Join the Cult]] to hear about the next drop."]},

  /* ---------- product pages ---------- */
  soonNote:{k:"inline",g:"Products",l:"Coming soon note",
    h:"Shown on the page of a piece set to Coming soon.",t:[
    "Coming soon.",
    "@if memberPerk [[index.html#join|Join the Cult]] to get the link first."]},
  soldNote:{k:"inline",g:"Products",l:"Sold-out note",
    h:"Shown on the page of a sold-out piece, with a link to the sign-up.",t:[
    "Sold out.",
    "@if memberPerk [[index.html#join|Join the Cult]] to hear about the next drop first."]},
  productDropLine:{k:"line",g:"Products",l:"Drop line under the price",
    h:"Shown on pieces you can buy while a drop is open.",t:[
    "@if dropMode=live&dropName&dropCloses {dropName} · Open until {dropCloses}{?shipBy| · Ships by {shipBy}}"]},
  perks:{k:"p",flat:"perks",g:"Products",l:"Info lines above the Add to cart button",
    h:"Short lines shown on every product page, one per line; the size swap line is left out for one-size pieces such as caps.",t:[
    "Printed to order, then posted.",
    "@if freeShip Free shipping on orders of {freeShip} or more.",
    "@if changeOfMind=swap&type!=cap&!oneSize Ordered the wrong size? Swap it once.",
    "@if changeOfMind=refund&refundDays Changed your mind? Return it unworn and unwashed within {refundDays} days."]},
  seoProductTitle:{k:"line",g:"Products",l:"Product page title (search and link previews)",
    h:"The browser tab title and link preview title of each product page.",t:[
    "@if type=tee&teeGsm {name}, {teeGsm} gsm oversized tee | {brand}",
    "@if type=hoodie&hoodieGsm {name}, {hoodieGsm} gsm oversized hoodie | {brand}",
    "@if type=tee {name}, oversized tee | {brand}",
    "@if type=hoodie {name}, oversized hoodie | {brand}",
    "{name} | {brand}"]},
  seoProductDesc:{k:"line",g:"Products",l:"Product page description (search and link previews)",
    h:"The short description search engines and link previews show for each product page.",t:[
    "@if type=tee&teeGsm {name}{?colour| in {colour}}: {teeGsm} gsm heavyweight tee, oversized fit, printed to order. {price}.{?freeShip| Free shipping on orders of {freeShip} or more.}",
    "@if type=hoodie&hoodieGsm {name}{?colour| in {colour}}: {hoodieGsm} gsm heavyweight hoodie, oversized fit, printed to order. {price}.{?freeShip| Free shipping on orders of {freeShip} or more.}",
    "@if type=tee,type=hoodie {name}{?colour| in {colour}}: oversized {garment}, printed to order. {price}.{?freeShip| Free shipping on orders of {freeShip} or more.}",
    "{name}{?colour| in {colour}}, printed to order. {price}.{?freeShip| Free shipping on orders of {freeShip} or more.}"]},

  /* ---------- cart and checkout (the short delivery and returns text also shows on product pages) ---------- */
  delivery:{k:"inline",flat:"delivery",g:"Cart and checkout",l:"Delivery, short version",
    h:"Shown in the cart and on every product page; the full version is on the Help page.",t:[
    "Printed to order, then posted.",
    "@if deliveryDays Most orders arrive in {deliveryDays} business days.",
    "@if freeShip Free shipping on orders of {freeShip} or more.",
    "@if freeShip&shipFee Under {freeShip}, delivery costs {currency}{shipFee}.",
    "@if freeShip&!shipFee Under {freeShip}, we tell you the postage before you pay.",
    "We ship within Australia only, for now."]},
  returns:{k:"inline",flat:"returns",g:"Cart and checkout",l:"Returns, short version",
    h:"Shown in the cart and on every product page; the full version is on the Help page.",t:[
    "@if changeOfMind=swap&type!=cap&!oneSize Ordered the wrong size? Swap it once{?swapDays| within {swapDays} days} if it’s unworn and unwashed. You pay the return postage, and we send the new size free.",
    "@if changeOfMind=refund Changed your mind? Return it{?refundDays| within {refundDays} days}, unworn and unwashed, for a refund or exchange. You pay the return postage.",
    "Faulty or not as described? Australian Consumer Law covers you, and we pay the return postage.",
    "Details on the [[help.html#returns|Help page]]."]},
  priceNote:{k:"line",flat:"priceNote",g:"Cart and checkout",l:"Note under prices",
    h:"The small note under prices in the cart and on product pages.",t:[
    "Prices in AUD."]},
  checkoutMsg:{k:"inline",g:"Cart and checkout",l:"Message after pressing Checkout",
    h:"Tells the shopper their email app opens with the order and what happens next.",t:[
    "Your email app should open with your order ready. Press send, and we’ll reply{?confirmTime| within {confirmTime}} to confirm it and share how to pay. You aren’t charged until then.",
    "No email app? Email {email} and paste your order in."]},
  cartNote:{k:"line",g:"Cart and checkout",l:"Line under the Checkout button",
    h:"Reminds shoppers that nothing is paid online.",t:[
    "@if email No payment yet. We confirm your order by email first."]},

  /* ---------- help page ---------- */
  shippingFull:{k:"p",g:"Help page",l:"Shipping and delivery",edit:1,
    h:"The Shipping section of the Help page.",t:[
    "@if printDays,carrier,transitDays Every piece is printed after you order it.{?printDays| Printing takes {printDays} business days.}{?carrier| Then your parcel travels with {carrier}{?transitDays|, which takes about {transitDays} business days depending on where you live}.}{?!carrier&transitDays| Then your parcel takes about {transitDays} business days to reach you, depending on where you live.}{?!carrier&!transitDays| Then it is posted to you.}",
    "@if !printDays&!carrier&!transitDays Every piece is printed after you order it, then posted.",
    "@if freeShip Shipping is free on orders of {freeShip} or more.{?!shipFee| For smaller orders we tell you the postage before you pay.}",
    "@if shipFee&freeShip Delivery in Australia costs {currency}{shipFee} on orders under {freeShip}. All prices are in Australian dollars.",
    "@if shipFee&!freeShip Delivery in Australia costs {currency}{shipFee}. All prices are in Australian dollars.",
    "@if carrier We email you a tracking link when your order ships.",
    "@if shipBy&dropMode=live&dropName&dropCloses While a drop is open, each piece you can buy shows a ship-by date on its product page. If we are going to miss it, we will email you before that date. You can then wait or cancel for a full refund.",
    "@if printDays,transitDays,deliveryDays Delivery times are estimates. Public holidays, busy shopping periods and bad weather can add days.",
    "Your parcel is our responsibility until it reaches you. If it is lost, we will reship it or refund you. If it arrives damaged, email us and we will make it right. A photo helps us sort it faster.",
    "@if deliveryDays,transitDays If your parcel has not arrived by the estimated date, email us and we will sort it out with the carrier.",
    "We ship within Australia only, for now."]},
  returnsFull:{k:"p",g:"Help page",l:"Returns and refunds",edit:1,
    h:"The Returns section of the Help page; keep the faulty-goods rights in it if you write your own.",t:[
    "Our returns policy adds to your rights under the Australian Consumer Law. It does not replace them.",
    "**Faulty, damaged, not as described, or not what you ordered.** Email us as soon as you notice. Include your order number and a photo. This covers printing faults too, such as a misaligned, cracked or faded print. If we sent the wrong size, colour or design, that is our mistake. We fix it at our cost and we pay the return postage.",
    "For a minor problem, we will repair, replace or refund the piece at no cost to you. For a major problem (for example, unsafe, unusable, or very different from what we showed), you can choose a replacement or a full refund, or keep the piece and get compensation for its lower value. Refunds go back to the way you paid. We pay the return postage.",
    "You don’t need the original packaging or a receipt. Your order number or payment record is enough.",
    "@if changeOfMind=swap **Ordered the wrong size, or changed your mind?** Each piece is printed to order, so we can’t refund a change of mind. We will swap the size once if you email us{?swapDays| within {swapDays} days of delivery} and the piece is unworn and unwashed. You pay the return postage, and we send the new size free. If we can’t supply your size, we will refund you instead.",
    "@if changeOfMind=refund **Changed your mind?** Return it{?refundDays| within {refundDays} days}, unworn and unwashed, for a refund or exchange. You pay the return postage. We refund the way you paid{?refundProcessing| within {refundProcessing} business days of receiving it}. Faulty and not-as-described pieces are covered as above.",
    "@if email **How to start a return.** Email {email} with your order number and what’s wrong{?changeOfMind=swap,changeOfMind=refund|, or the size you want}. We reply{?replyDays| within {replyDays} business days} with the return address and next steps.",
    "**Sale pieces.** Sale pieces follow the same rules as full-price ones.",
    "**Finishes.** When a product page describes a washed, distressed or cracked-print finish, that finish is part of the design, not a fault."]},
  faq:{k:"faq",g:"Help page",l:"FAQ",edit:1,
    h:"Questions and answers on the Help page; keep them in step with your Shipping and Returns text.",t:[
    "# Orders and payment",
    "@if email How do I order? | Add pieces to your cart and press checkout. Your email app opens with your order ready. Press send, and we reply{?confirmTime| within {confirmTime}} to confirm it and tell you how to pay. You aren’t charged until then.",
    "@if payMethod How do I pay? | {payMethod}. We send the details when we confirm your order. Prices are in Australian dollars, and we don’t add card fees.",
    "@if !payMethod How do I pay? | We send the payment details when we confirm your order. Prices are in Australian dollars, and we don’t add card fees.",
    "Can I change or cancel my order? | Email us as soon as you can with your order number. If printing hasn’t started, we change or cancel it for free.",
    "# Sizing and fit",
    "How do the pieces fit? | Our tees and hoodies are cut oversized.{?fitAdvice| {fitAdvice}}{?sizeGuides| Size guides list garment measurements in cm{?modelHeight&modelSize| and the height and size our model wears}.}{?!sizeGuides&modelHeight&modelSize| Product pages list the height and size our model wears.}",
    "I’m between sizes. Which one? | Size up for a looser, longer drape. Size down for a closer fit. Not sure? Email us your height and usual size and we’ll point you to the right one.",
    "@if changeOfMind=swap Can I swap the size? | Yes, once{?swapDays|, within {swapDays} days of delivery}{?!swapDays|,} if the piece is unworn and unwashed. You pay the return postage, and we send the new size free. See [[help.html#returns|Returns]] for how.",
    "@if changeOfMind=refund Can I change the size? | Yes. Return it{?refundDays| within {refundDays} days}, unworn and unwashed, for a refund or exchange. You pay the return postage. See [[help.html#returns|Returns]] for how.",
    "# The pieces",
    "@if teeGsm,hoodieGsm What does heavyweight mean? | Thick, dense fabric.{?teeGsm&hoodieGsm| Our tees are {teeGsm} gsm and our hoodies are {hoodieGsm} gsm.}{?teeGsm&!hoodieGsm| Our tees are {teeGsm} gsm.}{?hoodieGsm&!teeGsm| Our hoodies are {hoodieGsm} gsm.} Gsm is grams per square metre, so higher means heavier.",
    "How are they printed? | Each piece is printed to order{?printPartner| by {printPartner}}{?printCity| in {printCity}}{?printMethod| using {printMethod}}.{?teeGsm&hoodieGsm| Our tees and hoodies are heavyweight.} Nothing sits in a warehouse waiting for you.",
    "@if careAdvice How do I wash it? | Follow the care label on the piece. {careAdvice}",
    "@if !careAdvice How do I wash it? | Follow the care label on the piece. As a rule, wash cold and inside out, and skip hot tumble drying, to keep the print sharp.",
    "# Drops and members",
    "What’s a drop? | A small set of new designs, released on a set date.{?dropLength| Each drop is open for {dropLength}{?retireDesigns=yes| and then retired}.}{?!dropLength&retireDesigns=yes| When a drop closes, the design is retired.}{?retireDesigns=yes| A retired design doesn’t come back.}",
    "@if memberPerk What do members get? | Members get {memberPerk}, and a heads-up email when a drop is about to land. It’s free to join, and you can leave any time. Anyone can buy once a drop is public.",
    "# Delivery and returns",
    "@if deliveryDays How long will it take? | {deliveryDays} business days from your order{?printDays&transitDays|: {printDays} to print, then {transitDays} to post}.{?shipBy&dropMode=live&dropName&dropCloses| Drop pieces show a ship-by date on the product page.}",
    "@if !deliveryDays&printDays&transitDays How long will it take? | {printDays} business days to print, then {transitDays} business days to post.{?shipBy&dropMode=live&dropName&dropCloses| Drop pieces show a ship-by date on the product page.}",
    "@if freeShip&shipFee How much is postage? | Shipping is free on orders of {freeShip} or more. Delivery in Australia costs {currency}{shipFee} on orders under {freeShip}.",
    "@if freeShip&!shipFee How much is postage? | Shipping is free on orders of {freeShip} or more. For smaller orders we tell you the postage before you pay.",
    "@if shipFee&!freeShip How much is postage? | Delivery in Australia costs {currency}{shipFee}.",
    "Do you ship overseas? | Not yet. Australia only, for now.",
    "@if carrier Where’s my order? | We email a tracking link when it ships. Nothing yet? Check your spam folder, then email us your order number.",
    "It’s faulty, or the print is wrong. What now? | Email us your order number and a photo. We’ll sort it out at no cost to you, and we pay the return postage. See [[help.html#returns|Returns]] for your rights.",
    "@if changeOfMind=swap Can I return it if I change my mind? | We don’t refund a change of mind, but we swap the size once{?swapDays| within {swapDays} days} if the piece is unworn and unwashed. You pay the return postage, and we send the new size free. See [[help.html#returns|Returns]].",
    "@if changeOfMind=refund Can I return it if I change my mind? | Yes. Return it{?refundDays| within {refundDays} days}, unworn and unwashed, for a refund or exchange. You pay the return postage. See [[help.html#returns|Returns]].",
    "@if email How do I contact you? | Email {email}.{?replyDays| We reply within {replyDays} business days, Monday to Friday.}"]},
  sizeGuideText:{k:"p",g:"Help page",l:"Size guide",edit:1,
    h:"The Size guide section of the Help page; the tables themselves go on each product.",t:[
    "Our tees and hoodies are cut oversized.{?sizeGuides| Measurements are of the garment, laid flat, in cm.}",
    "@if fitAdvice {fitAdvice}",
    "Between sizes? Size up for a looser, longer drape. Size down for a closer fit. Still unsure? Email us your height and usual size and we’ll tell you which to pick.",
    "@if sizeGuides How to measure: lay a piece you already own flat. Chest is across the piece, from armpit to armpit. Length is from the collar seam at the shoulder down to the hem. Compare both with the table.",
    "@if changeOfMind=swap Ordered the wrong size? We swap it once. See [[help.html#returns|Returns]].",
    "@if changeOfMind=refund Ordered the wrong size? Return it for a refund or exchange. See [[help.html#returns|Returns]]."]},
  privacy:{k:"p",flat:"privacy",g:"Help page",l:"Privacy policy",
    h:"The Privacy section of the Help page; it describes what the site does today, so update it before adding analytics, ad pixels, a payment service or a form service.",t:[
    "Last updated: {copyDate}.",
    "This policy explains what {brand}{?legalName&abn| ({legalName}, ABN {abn})}{?legalName&!abn| ({legalName})}{?abn&!legalName| (ABN {abn})} does with your personal information.",
    "**What we collect.** Your name, email address, delivery address and phone number when you order or write to us, your order details, and anything you put in a message. Your cart is saved in your own browser. It is not sent to us until you place an order.",
    "@if !formService **How we collect it.** When you email an order, join the member list or use the contact form. Each of these opens your email app, and nothing is sent until you press send.",
    "@if formService **How we collect it.** When you email an order, your email app sends it, and nothing is sent until you press send. When you join the member list or use the contact form, what you type is sent through the form service this site uses, which passes it to us.",
    "**Why we use it.** To make and send your order, to reply to you, to keep our records, and, only if you join the member list, to tell you about drops.",
    "**Who sees it.** Our print supplier{?printPartner| ({printPartner})} gets your name, delivery address and order so they can print and post it. Our courier{?carrier| ({carrier})} gets your name and address to deliver it. Our email provider stores the emails you send us. This site is hosted on GitHub Pages and loads fonts from Google Fonts, so those services see your IP address and device details when a page loads, as they do on most websites.",
    "**Where it is stored.** Some of these services may keep data outside Australia.",
    "**What we don’t do.** We don’t sell or rent your details. We don’t currently use analytics or advertising pixels. If that changes, we will update this policy first.",
    "**Marketing.** We email you about drops only if you joined the member list. Every email tells you how to unsubscribe, and we take you off the list within five business days.",
    "**How long we keep it.** We keep order records for as long as tax law requires. If you leave the member list, we delete your email address from it.",
    "**Keeping it safe.** We keep your details in our email account and our supplier’s order system, and we limit who can see them.",
    "@if adultsOnly=yes **Age.** You need to be 18 or over to order or join the member list. If you’re younger, ask a parent or guardian to order for you.",
    "**Your rights.** You can ask to see, correct or delete the information we hold about you.{?email| Email {email} and we will reply{?resolveDays| within {resolveDays} business days}.}",
    "@if email **Questions or complaints.** Send them to the same email address.{?replyDays| We reply within {replyDays} business days.}"]},
  terms:{k:"p",flat:"terms",g:"Help page",l:"Terms of sale",
    h:"The Terms section of the Help page; keep it in step with your Shipping and Returns text.",t:[
    "Last updated: {copyDate}.",
    "These terms cover purchases from {brand}{?legalName&abn| ({legalName}, ABN {abn})}{?legalName&!abn| ({legalName})}{?abn&!legalName| (ABN {abn})}. By placing an order you agree to them. Nothing in them limits your rights under the Australian Consumer Law.",
    "**Prices.** All prices are in Australian dollars.{?shipFee&freeShip| Postage on orders under {freeShip} is {currency}{shipFee}, shown in your cart.}{?shipFee&!freeShip| Postage is {currency}{shipFee}, shown in your cart.}{?!shipFee| We confirm your total, including any postage, by email before you pay.} We don’t add card or payment surcharges.",
    "**When your order is confirmed.** Your order is a request to buy. It becomes a contract when we confirm it by email. If we can’t supply an item, or an item is listed at the wrong price, we won’t confirm it and will refund anything you have paid. Where the same item was shown at two prices, we will honour the lower one.",
    "**Drops and made-to-order pieces.** Each piece is printed after you order it.{?shipBy&dropMode=live&dropName&dropCloses| Drop pieces ship by the date on the product page. If we are going to miss that date, we will tell you before it passes, and you can wait or cancel for a full refund.}",
    "**Cancelling.** Email us as soon as you can with your order number. If printing hasn’t started, we cancel the order and refund you in full. Once it has started we can’t cancel, but your rights for faulty or not-as-described pieces don’t change.",
    "**Delivery and returns.** Our [[help.html#shipping|Shipping]] and [[help.html#returns|Returns]] policies are part of these terms.",
    "**Member list.** Joining is free{?adultsOnly=yes| and open to anyone aged 18 or over}.{?memberPerk| Members get {memberPerk}.} Joining doesn’t reserve stock, and pieces can sell out.",
    "**Our content.** The words, layout and designs we create for this site belong to {brand}. Please don’t copy or reuse them without our written permission.",
    "@if adultsOnly=yes **Age.** You need to be 18 or over to order or join the member list.",
    "**Changes.** We may update these terms. Orders we have already confirmed stay under the terms in force when you ordered.",
    "@if email **Problems.** Email {email}.{?replyDays| We reply within {replyDays} business days{?resolveDays| and aim to resolve things within {resolveDays} business days}.}{?!replyDays&resolveDays| We aim to resolve things within {resolveDays} business days.}",
    "@if state **Law.** These terms are governed by the laws of {state}. This doesn’t take away any right you have under Australian law."]},

  /* ---------- about ---------- */
  aboutWho:{k:"p",g:"About",l:"Who’s behind it",edit:1,
    h:"Your own story on the About page; it stays hidden until your name is filled in under About you.",t:[
    "@if founderName I’m {founderName}.{?city,foundedWhen,foundedWhy| I started {brand}{?city| in {city}}{?foundedWhen| in {foundedWhen}}{?foundedWhy| because {foundedWhy}}.}{?foundedDetail| {foundedDetail}}"]},
  aboutMake:{k:"inline",g:"About",l:"What we make",edit:1,
    h:"The paragraph under “What we make” on the About page.",t:[
    "Oversized silhouettes.{?teeGsm&hoodieGsm| Heavyweight tees and hoodies.} Graphics that look like they were found on a wall at 3 a.m. Wear it hard, layer it deep, and never explain it.",
    "Every piece is printed to order{?printPartner| by {printPartner}}{?printCity| in {printCity}}, so nothing is printed until someone wants it."]},
  aboutHow:{k:"steps",g:"About",l:"How a drop works",edit:1,
    h:"The numbered steps under “How a drop works” on the About page.",t:[
    "@if memberPerk Members get the link first, by email.",
    "The drop opens on a set date{?dropLength| and stays open for {dropLength}}. Each piece is printed after you order.",
    "@if retireDesigns=yes When the window closes, the design is retired.",
    "@if shipBy&dropMode=live&dropName&dropCloses Your order ships by the date on the product page."]},
  creed:{k:"creed",g:"About",l:"The creed",edit:1,
    h:"The three numbered lines under “The creed” on the About page.",t:[
    "Wear it loud, or wear it low. | Either way, wear it like you mean it.",
    "@if retireDesigns=yes One drop at a time. | Small drops, then gone.",
    "@if retireDesigns=no One drop at a time. | Small drops. Back only when we say.",
    "@if !retireDesigns One drop at a time. | Small drops, big attitude.",
    "Your people will know. | Every piece is built so your people can spot you across a crowded room."]},
  aboutMembers:{k:"inline",g:"About",l:"The members",edit:1,
    h:"The paragraph under “The members” on the About page.",t:[
    "We don’t have customers. We have members.",
    "@if memberPerk It’s free to join, and you get the link to every drop before everyone else.",
    "{memberStat}"]},
  aboutLast:{k:"line",g:"About",l:"Last line of the About page",
    h:"Points people to your email.",t:[
    "Questions? Email {email}."]},

  /* ---------- contact ---------- */
  contactIntro:{k:"inline",g:"Contact",l:"Contact page intro",
    h:"The line under the Contact heading.",t:[
    "Questions about sizing, orders or drops? Send us a message{?replyDays| and we’ll reply within {replyDays} business days}."]},
  contactNote:{k:"inline",g:"Contact",l:"Note under the Send button",
    h:"Says that sending opens the shopper’s email app.",t:[
    "@if !formService&email Sending opens your email app with your message ready. Nothing is sent until you press send there. No email app? Use the email address under Business details.",
    "@if formService Your message goes straight to us.{?email| You can also use the email address under Business details.}"]},
  contactPrivacy:{k:"inline",g:"Contact",l:"Privacy line on the contact form",
    h:"One line on how message details are used, with a link to the Privacy policy.",t:[
    "We use your details only to reply. [[help.html#privacy|Privacy policy]]"]},
  contactBusiness:{k:"p",g:"Contact",l:"Business details",edit:1,
    h:"The Business details block on the Contact page, built from your business details.",t:[
    "@if legalName {brand} is a trading name of {legalName}{?abn|, ABN {abn}}.",
    "@if abn&!legalName ABN {abn}.",
    "Email: {email}",
    "Post: {postAddress}",
    "Replies: {hours}. Messages sent outside those hours wait for the next business day.",
    "Instagram: {igHandle}",
    "Order help: {?carrier|[[help.html#faq|Where’s my order?]] · }[[help.html#shipping|Shipping]] · [[help.html#returns|Returns]] · [[help.html#faq|FAQ]]"]},
  contactSent:{k:"line",g:"Contact",l:"Message after a contact form is sent",
    h:"Only used if you add a form service.",t:[
    "Thanks. We’ve got your message and will reply{?replyDays| within {replyDays} business days}."]},

  /* ---------- footer and 404 ---------- */
  footerTagline:{k:"line",g:"Every page",l:"Footer tagline",
    h:"The short line under the brand name in the footer; it says “limited-run” only if you chose to retire designs.",t:[
    "@if retireDesigns=yes Limited-run streetwear, printed to order.",
    "Streetwear drops, printed to order."]},
  footerLegal:{k:"inline",g:"Every page",l:"Footer small print",
    h:"The legal line in the footer, with your business name and ABN when filled in.",t:[
    "© {year} {brand}{?legalName|, a trading name of {legalName}}.{?abn| ABN {abn}.} Prices in AUD."]},
  notFoundBody:{k:"inline",g:"Page not found",l:"Page not found message",
    h:"The text on the page people see after a broken link.",t:[
    "The link may be old or mistyped. Try the shop, or head back home.",
    "Still stuck? Email {email}."]}
};

/* Suggested wording for a product's blank boxes, by product type ("_" = any other type).
   Product tokens: {name} {type} {cat} {colour} {price} {gsm} {garment}. The gsm lines name the
   type's own figure (teeGsm, hoodieGsm) so the Store Manager can show where each figure is used.
   No suggestions for tagline, feature tiles, performance bars or size guide: those stay hidden until filled in. */
var COPY_PRODUCT={
  _:{
    desc:["{name}{?colour| in {colour}}. Printed to order in small drops."],
    specs:["@if printMethod Print: {printMethod}","@if careAdvice Care: {careAdvice}","@if printCity Printed in: {printCity}"]},
  hoodie:{
    desc:["@if !hoodieGsm {name}{?colour| in {colour}}. Printed to order in small drops.",
      "@if hoodieGsm {name}{?colour| in {colour}}. A {hoodieGsm} gsm hoodie, cut oversized and boxy. Printed to order in small drops."],
    specs:["Fit: oversized, boxy","@if hoodieGsm Weight: {hoodieGsm} gsm","@if printMethod Print: {printMethod}","@if careAdvice Care: {careAdvice}","@if printCity Printed in: {printCity}"],
    materials:["@if hoodieGsm {hoodieGsm} gsm"],
    modelNote:["Model is {modelHeight} cm and wears {modelSize}."]},
  tee:{
    desc:["@if !teeGsm {name}{?colour| in {colour}}. Printed to order in small drops.",
      "@if teeGsm {name}{?colour| in {colour}}. A {teeGsm} gsm tee, cut oversized. Printed to order in small drops."],
    specs:["Fit: oversized","@if teeGsm Weight: {teeGsm} gsm","@if printMethod Print: {printMethod}","@if careAdvice Care: {careAdvice}","@if printCity Printed in: {printCity}"],
    materials:["@if teeGsm {teeGsm} gsm"],
    modelNote:["Model is {modelHeight} cm and wears {modelSize}."]},
  pants:{
    desc:["{name}{?colour| in {colour}}. Printed to order in small drops."],
    specs:["@if printMethod Print: {printMethod}","@if careAdvice Care: {careAdvice}","@if printCity Printed in: {printCity}"],
    modelNote:["Model is {modelHeight} cm and wears {modelSize}."]},
  cap:{
    desc:["{name}{?colour| in {colour}}. Printed to order in small drops."],
    specs:["@if printCity Printed in: {printCity}"],
    modelNote:[]}
};

/* Business details the owner can fill in later. Each becomes a box in the Store Manager.
   t: text | num | area | select (select uses o:[[value,label],...]). l = label, h = what it is for and
   what happens when it is left empty, ph = an example shown in grey. Anything left empty is left out of the site. */
var FACTS=[
  {id:"business",g:"Your business",h:"Shown on the Contact page, in the footer and in the Privacy and Terms text.",items:[
    {k:"legalName",l:"Legal name on your ABN",t:"text",ph:"J Citizen Trading Pty Ltd",
      h:"The name your ABN is registered under: your own name or a company name. Shown as “Cult Drip is a trading name of …”. If your ABN is registered as Cult Drip itself, leave this empty. Left empty, no business name is shown."},
    {k:"abn",l:"ABN",t:"text",ph:"00 000 000 000",
      h:"Your 11-digit Australian Business Number, shown next to the business name. Left empty, no ABN is shown."},
    {k:"state",l:"State or territory",t:"text",ph:"Western Australia",
      h:"Whose laws your Terms are under (“governed by the laws of …”). Left empty, the Terms leave that line out."},
    {k:"city",l:"Where you started (city or town)",t:"text",ph:"Perth",
      h:"Used in your About page story (“I started Cult Drip in …”). Left empty, the story leaves the place out."},
    {k:"postAddress",l:"Postal address for returns",t:"text",ph:"PO Box 000, Perth WA 6000",
      h:"A PO Box or parcel locker, not your home address. Shown on the Contact page. Left empty, no address is shown."}
  ]},
  {id:"contact",g:"Contact and replies",h:"Only promise reply times you can keep.",items:[
    {k:"replyDays",l:"Reply time (business days)",t:"num",ph:"2",
      h:"A number only. Used wherever the site promises a reply (Contact page, FAQ, Returns, Privacy, Terms). Left empty, no reply time is promised."},
    {k:"hours",l:"Reply hours",t:"text",ph:"Monday to Friday, 9am to 5pm AWST",
      h:"The days and hours you answer messages, shown on the Contact page as “Replies: …”. Left empty, that line is left out."},
    {k:"confirmTime",l:"Time to confirm an order",t:"text",ph:"1 business day",
      h:"Include the unit. Finishes “we’ll reply within …” after someone presses Checkout, and in the FAQ. Left empty, no time is promised."}
  ]},
  {id:"drop",g:"Current drop",h:"Change these when a drop opens or closes.",items:[
    {k:"dropMode",l:"What is happening now",t:"select",o:[["","No drop on (normal banner)"],["before","A drop opens soon"],["live","A drop is open now"],["between","A drop has closed, the next one is coming"]],
      h:"Switches the top banner, the line above the home headline, the home button and the shop intro; “No drop on” keeps the normal ones. Before a drop opens, set its pieces to Coming soon. Between drops the top banner says the drop has closed and the shop intro gives the next date, so set the closed drop’s pieces to Sold out or Coming soon."},
    {k:"dropName",l:"Drop name",t:"text",ph:"Drop 001",
      h:"Shown in the banner, on the home page and on product pages. Left empty, no drop banner or drop line shows."},
    {k:"dropOpens",l:"Opens (date and time)",t:"text",ph:"Friday 6 November, 6pm AWST (9pm AEDT)",
      h:"When the next drop opens, written the way you want it shown, in Perth time with eastern time added. Left empty, the “opens soon” banner stays off."},
    {k:"dropCloses",l:"Closes (date and time)",t:"text",ph:"Friday 13 November, 6pm AWST (9pm AEDT)",
      h:"When the open drop closes, written the way you want it shown. Only write a time you will keep. At that time switch the mode and set the pieces to Sold out. Left empty, the “drop is open” banner and the drop line on product pages stay off."},
    {k:"dropNext",l:"Next drop date",t:"text",ph:"Friday 4 December",
      h:"Shown between drops (“Next drop: …”) and when the shop is empty. Left empty, the “drop has closed” banner stays off."},
    {k:"shipBy",l:"Ships by (date)",t:"text",ph:"Friday 27 November",
      h:"The date every order from the open drop ships by. Only a date you are sure you can meet. It appears on product pages, and in the Shipping, FAQ, Terms and About text, only while “A drop is open now” is chosen and the drop name and closing time are filled in. Left empty, no ship-by date is promised."},
    {k:"dropLength",l:"How long each drop stays open",t:"text",ph:"7 days",
      h:"Include the unit, for example 7 days or 48 hours. Used in the FAQ and on the About page. Left empty, no length is mentioned."},
    {k:"retireDesigns",l:"When a drop closes",t:"select",o:[["","Not decided yet (say nothing)"],["yes","The design is retired for good and never comes back"],["no","The design may come back"]],
      h:"Choose “retired for good” only if you will never reprint the design: the site then says so on the home, About and FAQ pages, and the footer calls the shop “limited-run”. “Not decided” says neither."}
  ]},
  {id:"pieces",g:"The pieces",h:"Take these from your supplier’s spec sheet or a sample you have measured.",items:[
    {k:"teeGsm",l:"Tee fabric weight (gsm)",t:"num",ph:"240",
      h:"A number only, for the finished fabric. Once filled in, the site calls your tees heavyweight and shows the figure, so leave it empty if you would not call them heavyweight."},
    {k:"hoodieGsm",l:"Hoodie fabric weight (gsm)",t:"num",ph:"400",
      h:"A number only, for the finished fabric. Once filled in, the site calls your hoodies heavyweight and shows the figure, so leave it empty if you would not call them heavyweight."},
    {k:"printMethod",l:"Print method",t:"text",ph:"direct-to-garment printing",
      h:"How your designs are printed. Fits “printed to order using …” in the FAQ and “Print: …” on product pages. Left empty, it is not mentioned."},
    {k:"careAdvice",l:"Care advice",t:"text",ph:"Wash cold, inside out. Skip hot tumble drying.",
      h:"Short washing advice in full sentences. Shown on tee, hoodie and bottoms pages and in the FAQ. Left empty, the FAQ gives general advice instead."},
    {k:"fitAdvice",l:"Sizing advice",t:"text",ph:"Take your usual size for the intended look, or size down one for a closer fit.",
      h:"One or two sentences on which size to pick, shown in the FAQ and the Help page size guide. Left empty, only the general advice shows."},
    {k:"modelHeight",l:"Model height (cm)",t:"num",ph:"183",
      h:"A number only. With the model’s size it adds “Model is … cm and wears …” to tee, hoodie and bottoms pages that have no model note of their own. Left empty, no model note is added."},
    {k:"modelSize",l:"Size the model wears",t:"text",ph:"M",
      h:"The size the model wears in your photos. Left empty, no model note is added."}
  ]},
  {id:"shipping",g:"Making and shipping",h:"Run a real test order first, then use those numbers.",items:[
    {k:"printPartner",l:"Print partner (business name)",t:"text",ph:"Example Print Co",
      h:"Who prints your pieces, named on the home and About pages, in the FAQ and in the Privacy policy. Name them only if they agree. Left empty, the site just says “printed to order”."},
    {k:"printCity",l:"City where pieces are printed",t:"text",ph:"Melbourne",
      h:"Where the printing happens, not where the blank garments come from. Shown as “Printed in: …” on product pages and as “printed to order in …” on the About page and in the FAQ. Only fill it in if it is true. Left empty, no place is mentioned."},
    {k:"carrier",l:"Delivery company",t:"text",ph:"Australia Post",
      h:"Named on the Help page and in the Privacy policy, and lets the site say you email a tracking link. Left empty, no company is named and no tracking link is promised."},
    {k:"printDays",l:"Printing takes (business days)",t:"text",ph:"2 to 4",
      h:"A number or range, without the words “business days”. Shown on the Help page and in the FAQ. Left empty, no printing time is promised."},
    {k:"transitDays",l:"Postage takes (business days)",t:"text",ph:"2 to 6",
      h:"From dispatch to the door, without the words “business days”. Shown on the Help page and in the FAQ. Left empty, no postage time is promised."},
    {k:"deliveryDays",l:"Order to door (business days)",t:"text",ph:"4 to 10",
      h:"The whole time from order to delivery, without the words “business days”. Shown in the cart, on product pages and in the FAQ. Left empty, no delivery time is promised."},
    {k:"shipFee",l:"Delivery fee under the free-shipping amount",t:"num",ph:"9.95",
      h:"A number only, without the $ sign. Shown on the Help page and added to the cart on orders under your free-shipping amount. Left empty, no fee is shown or added, and you quote the postage when you confirm each order."}
  ]},
  {id:"payment",g:"Payment",items:[
    {k:"payMethod",l:"How customers pay",t:"text",ph:"PayID or bank transfer",
      h:"Starts the FAQ answer to “How do I pay?”, so begin with a capital letter. Left empty, the FAQ only says you send payment details when you confirm the order."}
  ]},
  {id:"returns",g:"Returns",h:"The rights for faulty goods are always shown, whatever you choose here.",items:[
    {k:"changeOfMind",l:"If someone changes their mind",t:"select",o:[["","Not decided yet (only the rights for faulty goods are shown)"],["none","Nothing extra (only the rights for faulty goods)"],["swap","Swap the size once"],["refund","Refund or exchange"]],
      h:"Your choice switches on matching text on the Help page, in the FAQ, in the cart and on product pages. “Swap the size once” promises one size swap, and that you send the new size free. “Refund or exchange” promises a refund or exchange on any unworn, unwashed piece that comes back, refunded the way the shopper paid. With either, the shopper pays the return postage. Only choose what you will honour. The first two choices show only the rights for faulty goods, which are always shown; “Not decided yet” also leaves this on your before-launch list."},
    {k:"swapDays",l:"Days to ask for a size swap",t:"num",ph:"14",
      h:"A number only, counted from delivery. Used when you offer a size swap. Left empty, there is no time limit: shoppers can ask for a swap at any time."},
    {k:"refundDays",l:"Days to return for a change of mind",t:"num",ph:"30",
      h:"A number only. Used when you offer refunds. Left empty, there is no time limit: shoppers can return a piece at any time."},
    {k:"refundProcessing",l:"Days to pay a refund (business days)",t:"num",ph:"5",
      h:"A number only: how soon you refund once the piece is back. Used when you offer refunds. Left empty, no time is promised."},
    {k:"resolveDays",l:"Days to sort out a problem (business days)",t:"num",ph:"10",
      h:"A number only. The Terms say you aim to resolve problems within it, and the Privacy policy uses it as the reply time for privacy requests. Left empty, neither promises a time."}
  ]},
  {id:"members",g:"Members",h:"Only promise what you will really do.",items:[
    {k:"memberPerk",l:"Early access for members",t:"text",ph:"the drop link before it goes public",
      h:"Finishes the sentence “Members get …”. Fill it in only if members really hear first. While it is filled in, your words appear in the sign-up line, the FAQ and the Terms, and the site also promises members the drop link first in the top banner, the scrolling strip, the shop, the coming soon and sold out notes and the About page. Left empty, no member promise is made anywhere."},
    {k:"emailsPerMonth",l:"Emails a month",t:"text",ph:"about 2",
      h:"A number such as 2, or “about 2”. Shown under the sign-up form as “We’ll email about drops: … a month.” Left empty, no number is given."},
    {k:"memberStat",l:"A true member number",t:"text",ph:"120 members joined before the first drop.",
      h:"One full sentence with a real number, once you have one. Shown on the About page. Left empty, nothing is shown."},
    {k:"adultsOnly",l:"Only adults (18 and over)?",t:"select",o:[["yes","Yes, 18 and over only"],["no","No age limit"]],
      h:"Choose “Yes” only if you will turn away anyone under 18. The site then says so under the sign-up form and in the Privacy policy and the Terms. Left empty, or set to “No age limit”, the site says nothing about age."}
  ]},
  {id:"about",g:"About you",h:"Your true story for the About page.",items:[
    {k:"founderName",l:"Your name",t:"text",ph:"Alex",
      h:"The “Who’s behind it” part of the About page only shows once this is filled in."},
    {k:"foundedWhen",l:"When you started (month and year)",t:"text",ph:"March 2026",
      h:"Month and year only. Used in “I started Cult Drip in … in …”. Left empty, the date is left out."},
    {k:"foundedWhy",l:"Why you started",t:"area",ph:"I wanted streetwear that felt like it belonged to something.",
      h:"One true reason in one sentence. It finishes “I started Cult Drip … because …”. Left empty, the story leaves the reason out."},
    {k:"foundedDetail",l:"One true detail",t:"area",ph:"My first sample was a black tee I wore for a month straight.",
      h:"One sentence: the first sketch, the first sample you ordered, or the first friend who wore it. Added to the end of your story; left empty, nothing is added."}
  ]}
];
