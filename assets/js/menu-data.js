/*
 * ============================================================
 *  THE CHILLI'OZ — MENU
 *  Change names, descriptions and prices here. Prices are in AUD.
 *  Prices below are indicative, taken from the business plan ranges.
 *
 *  tags: "signature" (spice-meets-sweet item), "spicy", "veg"
 *  options: "coffee" adds milk choice + extra shot (see OPTIONS below)
 *  To hide an item without deleting it, add  soldOut: true
 * ============================================================
 */
window.CHILLIOZ_OPTIONS = {
  coffee: {
    milk: [
      { label: "Full cream", price: 0 },
      { label: "Skim", price: 0 },
      { label: "Oat", price: 0.7 },
      { label: "Almond", price: 0.7 },
      { label: "Soy", price: 0.7 }
    ],
    extraShot: 0.5
  }
};

window.CHILLIOZ_MENU = [
  {
    id: "coffee",
    name: "Coffee",
    blurb: "Specialty beans from a local Melbourne roaster.",
    items: [
      { id: "espresso", name: "Espresso", desc: "A short, rich single origin shot.", price: 5.0 },
      { id: "long-black", name: "Long Black", desc: "Double shot over hot water.", price: 5.5, options: "coffee" },
      { id: "flat-white", name: "Flat White", desc: "Velvety microfoam, Melbourne's favourite.", price: 5.8, options: "coffee" },
      { id: "latte", name: "Latte", desc: "Smooth and milky.", price: 5.8, options: "coffee" },
      { id: "cappuccino", name: "Cappuccino", desc: "Foamy, with a dusting of chocolate.", price: 5.8, options: "coffee" },
      { id: "mocha", name: "Mocha", desc: "Espresso meets rich cocoa.", price: 6.5, options: "coffee" }
    ]
  },
  {
    id: "signature-drinks",
    name: "Signature drinks",
    blurb: "Where spice meets sweet, in a cup.",
    items: [
      { id: "spiced-chai", name: "Spiced Chai Latte", desc: "House chai with cinnamon, cardamom and ginger.", price: 6.0, options: "coffee", tags: ["signature"] },
      { id: "chilli-cocoa", name: "Chilli-Cocoa Hot Chocolate", desc: "Dark chocolate with a gentle chilli warmth.", price: 6.5, options: "coffee", tags: ["signature", "spicy"] },
      { id: "cinnamon-cold-brew", name: "Cinnamon-Spiced Cold Brew", desc: "Slow-steeped cold brew with house cinnamon syrup.", price: 6.5, tags: ["signature"] },
      { id: "ginger-lemongrass", name: "Ginger & Lemongrass Tea", desc: "Fresh, zesty and warming.", price: 5.0, tags: ["signature", "veg"] }
    ]
  },
  {
    id: "bakery",
    name: "Bakery",
    blurb: "Baked fresh every morning.",
    items: [
      { id: "croissant", name: "Butter Croissant", desc: "Flaky and golden.", price: 4.5, tags: ["veg"] },
      { id: "danish", name: "Fruit Danish", desc: "Seasonal fruit on crisp pastry.", price: 5.5, tags: ["veg"] },
      { id: "muffin", name: "Muffin", desc: "Ask us for today's flavour.", price: 5.0, tags: ["veg"] },
      { id: "scone", name: "Scone with jam & cream", desc: "A classic, served warm.", price: 6.5, tags: ["veg"] }
    ]
  },
  {
    id: "signature-sweets",
    name: "Signature sweets",
    blurb: "Sweet treats with a little kick.",
    items: [
      { id: "chilli-brownie", name: "Chilli-Chocolate Brownie", desc: "Fudgy, dark and lightly spiced.", price: 6.0, tags: ["signature", "spicy", "veg"] },
      { id: "apple-pie", name: "Spiced Apple & Cinnamon Pie", desc: "Buttery pastry, warm spiced apple.", price: 7.5, tags: ["signature", "veg"] },
      { id: "ginger-shortbread", name: "Ginger-Chilli Shortbread", desc: "Crumbly, buttery, with a ginger-chilli finish.", price: 5.5, tags: ["signature", "spicy", "veg"] },
      { id: "cardamom-bun", name: "Cardamom Bun", desc: "Soft, twisted and fragrant.", price: 6.5, tags: ["signature", "veg"] }
    ]
  },
  {
    id: "toasties",
    name: "Toasties",
    blurb: "Pressed hot to order.",
    items: [
      { id: "ham-cheese", name: "Ham & Cheese", desc: "The classic, done right.", price: 9.0 },
      { id: "avo-chilli", name: "Avocado & Chilli Flakes", desc: "Smashed avo, feta and chilli flakes.", price: 11.0, tags: ["spicy", "veg"] },
      { id: "spiced-bean", name: "Spiced Bean & Cheese", desc: "Smoky spiced beans with melted cheese.", price: 11.0, tags: ["signature", "spicy", "veg"] },
      { id: "chicken-chilli-mayo", name: "Chicken & Chilli Mayo", desc: "Roast chicken, house chilli mayo, greens.", price: 13.5, tags: ["signature", "spicy"] },
      { id: "peri-peri-veggie", name: "Peri-Peri Veggie", desc: "Roast vegetables with peri-peri sauce.", price: 12.5, tags: ["signature", "spicy", "veg"] }
    ]
  },
  {
    id: "kebabs",
    name: "Kebabs",
    blurb: "Freshly made, wrapped and ready to go.",
    items: [
      { id: "kebab", name: "Fresh Kebab", desc: "Ask for today's fillings and sauces.", price: 12.3 }
    ]
  }
];
