/*
 * ============================================================
 *  THE CHILLI'OZ — MENU
 *  Change names, descriptions and prices here. Prices are in AUD.
 *
 *  price:   one price for the item
 *  sizes:   use instead of price when there is Small / Large
 *  choices: pick-one options, e.g. sauce. A value can be text, or
 *           { label: "Oat", add: 0.7 } to charge extra
 *  addons:  tick-box extras, e.g. { label: "Add chilli", add: 0 }
 *  tags:    "spicy", "veg", "kids"
 *  To hide an item for the day without deleting it, add  soldOut: true
 *
 *  Section photos: free photos from Unsplash (unsplash.com/license).
 *  The home page background photo is set in index.html (class hero-bg).
 *  Swap them for your own photos any time: put the file in
 *  assets/img/ and change photo to e.g. "assets/img/breakfast.jpg"
 * ============================================================
 */
(function () {
  var MILK = { name: "Milk", values: ["Full cream", "Skim", "Oat", "Almond", "Soy"] };
  var STEAK = [
    { name: "Cooked", values: ["Rare", "Medium rare", "Medium", "Medium well", "Well done"], initial: "Medium" },
    { name: "Sauce", values: ["Mushroom", "Pepper", "Garlic"] }
  ];
  function sl(small, large) {
    return [{ label: "Small", price: small }, { label: "Large", price: large }];
  }
  function unsplash(id) {
    return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=1200&q=70";
  }

  window.CHILLIOZ_MENU = [
    {
      id: "breakfast",
      name: "Breakfast",
      blurb: "Served until 11:30am.",
      availableUntil: "11:30",
      photo: unsplash("1706378395079-1ae36eef1943"),
      items: [
        { id: "big-brekkie", name: "Big Chilli'oz Brekkie", desc: "2 eggs, bacon, sausage, grilled tomato, mushrooms, hash brown, toast & house chilli relish.", price: 24.5, tags: ["spicy"], featured: true },
        { id: "avocado-smash", name: "Avocado Smash", desc: "Sourdough, smashed avocado, feta, cherry tomatoes, poached eggs & chilli flakes.", price: 19.9, tags: ["veg", "spicy"] },
        { id: "spicy-shakshuka", name: "Spicy Shakshuka", desc: "Baked eggs in rich tomato & capsicum sauce, feta, herbs & crusty bread.", price: 18.9, tags: ["veg", "spicy"] },
        { id: "sweet-chilli-pancakes", name: "Sweet Chilli Pancakes", desc: "Fluffy pancakes, vanilla ice-cream, fresh berries & honey-chilli drizzle.", price: 17.5, tags: ["veg"] },
        { id: "eggs-benedict", name: "Eggs Benedict", desc: "Poached eggs, ham and hollandaise on sourdough.", price: 18.5, addons: [{ label: "Add chilli for extra kick", add: 0 }] }
      ]
    },
    {
      id: "coffee",
      name: "Coffee & hot drinks",
      blurb: "Small or large, made how you like it.",
      photo: unsplash("1524240485266-07dd6863d4ae"),
      items: [
        { id: "espresso-long-black", name: "Espresso / Long Black", desc: "", sizes: sl(4.0, 4.5), choices: [{ name: "Style", values: ["Espresso", "Long Black"] }] },
        { id: "milk-coffee", name: "Cappuccino / Latte / Flat White", desc: "", sizes: sl(4.5, 5.0), choices: [{ name: "Style", values: ["Cappuccino", "Latte", "Flat White"] }, MILK] },
        { id: "chilli-mocha", name: "Chilli Mocha", desc: "Dark chocolate, espresso and a gentle chilli warmth.", sizes: sl(5.5, 6.0), choices: [MILK], tags: ["spicy"], featured: true },
        { id: "chai-latte", name: "Chai Latte", desc: "Spiced and creamy.", sizes: sl(4.8, 5.3), choices: [MILK] },
        { id: "hot-chocolate", name: "Hot Chocolate", desc: "Plain, spiced, or chilli dark chocolate.", sizes: sl(4.8, 5.3), choices: [{ name: "Style", values: ["Plain", "Spiced", "Chilli dark chocolate"] }, MILK] }
      ]
    },
    {
      id: "seafood",
      name: "Seafood",
      blurb: "Fresh fish and local prawns.",
      photo: unsplash("1697748836791-9ddf7e616ece"),
      items: [
        { id: "seafood-basket", name: "Seafood Basket", desc: "Fish, calamari, local prawns, salad, chips & homemade tartare sauce.", price: 35.5, featured: true },
        { id: "red-spot-emperor", name: "Red Spot Emperor & Chips", desc: "Grilled or battered fish, chips & homemade tartare sauce.", sizes: sl(13.5, 25.5), choices: [{ name: "Fish", values: ["Battered", "Grilled"] }] },
        { id: "salt-pepper-squid", name: "Salt & Pepper Squid", desc: "With chips & salad.", sizes: sl(13.5, 25.5) },
        { id: "battered-prawns", name: "Battered Prawns", desc: "Chips & homemade tartare sauce.", sizes: sl(20.5, 35.5) }
      ]
    },
    {
      id: "steak",
      name: "Steak",
      blurb: "Cooked to your liking, with chips, salad and your choice of sauce.",
      photo: unsplash("1598577789978-b87168a57b69"),
      items: [
        { id: "porterhouse", name: "250g Porterhouse", desc: "Chips, salad and your choice of mushroom, pepper or garlic sauce.", price: 44.5, choices: STEAK },
        { id: "t-bone", name: "400g T-Bone", desc: "Chips, salad and your choice of mushroom, pepper or garlic sauce.", price: 46.5, choices: STEAK },
        { id: "reef-beef", name: "Reef & Beef", desc: "250g porterhouse steak with a garlic-sauce prawn kebab, chips & salad.", price: 49.5, choices: [STEAK[0]], featured: true }
      ]
    },
    {
      id: "pasta",
      name: "Pasta",
      blurb: "Fettuccine dishes and a classic lasagne.",
      photo: unsplash("1724041305855-704dad7d30b4"),
      items: [
        { id: "chicken-asparagus", name: "Creamy Chicken & Asparagus", desc: "Spring onion, garlic, fettuccine & cheese.", price: 25.5 },
        { id: "mediterranean-veg", name: "Mediterranean Veg", desc: "Capsicum, olives, mushroom, onion, fettuccine, napoli sauce & cheese.", price: 23.5, tags: ["veg"] },
        { id: "chilli-prawn", name: "Chilli Prawn", desc: "Spring onion, garlic, mid-chilli marinara, fettuccine & cheese.", price: 28.5, tags: ["spicy"], featured: true },
        { id: "lasagne", name: "Lasagne", desc: "Served with chips & salad.", sizes: sl(18.5, 34.5) }
      ]
    },
    {
      id: "sides",
      name: "Sides",
      blurb: "Add something to share.",
      photo: unsplash("1665117861973-fffa50c1afec"),
      items: [
        { id: "garden-salad", name: "Garden Salad", desc: "", price: 8.5, tags: ["veg"] },
        { id: "bowl-chips", name: "Bowl of Chips", desc: "", price: 13.5, tags: ["veg"] },
        { id: "bowl-wedges", name: "Bowl of Wedges", desc: "", price: 15.5, tags: ["veg"] }
      ]
    },
    {
      id: "kids",
      name: "Kids menu",
      blurb: "Smaller plates for little ones.",
      photo: unsplash("1636907229111-a8ac768fe6c9"),
      items: [
        { id: "kids-fish", name: "Kids Battered Fish", desc: "Served with chips.", price: 12.5, tags: ["kids"] },
        { id: "kids-nuggets", name: "Kids Chicken Nuggets", desc: "Served with chips.", price: 11.5, tags: ["kids"] },
        { id: "kids-burger", name: "Kids Cheese Burger", desc: "Served with chips.", price: 13.5, tags: ["kids"] },
        { id: "kids-fettuccine", name: "Kids Fettuccine", desc: "Napoli sauce & cheese.", price: 10.9, tags: ["kids", "veg"] }
      ]
    },
    {
      id: "dessert",
      name: "Dessert",
      blurb: "Homemade, with plenty of ice-cream.",
      photo: unsplash("1560052859-7deb492b0baf"),
      items: [
        { id: "cheesecake", name: "Homemade Cheesecake", desc: "Today's flavour, served with whipped cream.", price: 12.5, tags: ["veg"] },
        { id: "waffles", name: "Homemade Waffles", desc: "Vanilla ice-cream & topping of your choice. Tell us your topping in the order notes.", price: 11.9, tags: ["veg"] },
        { id: "brandy-snap", name: "Brandy Snap Basket", desc: "Vanilla ice-cream & strawberry coulis.", price: 13.5, tags: ["veg"] },
        { id: "chocolate-cake", name: "Warm Chocolate Cake", desc: "With vanilla ice-cream.", price: 12.9, tags: ["veg"] },
        { id: "sticky-date", name: "Sticky Date Pudding", desc: "Vanilla ice-cream & warm butterscotch sauce.", price: 13.5, tags: ["veg"], featured: true },
        { id: "sundae", name: "Ice-Cream Sundae", desc: "Vanilla ice-cream, sprinkles, crushed peanuts & topping of your choice.", price: 9.9, tags: ["veg"] }
      ]
    }
  ];
})();
