const FOODS = [
  {
    id: "chicken",
    name: "Poulet",
    emoji: "🍗",
    unit: "100 g",
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6
  },

  {
    id: "rice",
    name: "Riz blanc cuit",
    emoji: "🍚",
    unit: "100 g",
    kcal: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3
  },

  {
    id: "pasta",
    name: "Pâtes cuites",
    emoji: "🍝",
    unit: "100 g",
    kcal: 158,
    protein: 5.8,
    carbs: 30.9,
    fat: 0.9
  },

  {
    id: "tuna",
    name: "Thon au naturel",
    emoji: "🐟",
    unit: "100 g",
    kcal: 116,
    protein: 26,
    carbs: 0,
    fat: 1
  },

  {
    id: "egg",
    name: "Œuf",
    emoji: "🥚",
    unit: "100 g",
    kcal: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5
  },

  {
    id: "beef",
    name: "Bœuf haché 5%",
    emoji: "🥩",
    unit: "100 g",
    kcal: 137,
    protein: 21,
    carbs: 0,
    fat: 5
  },

  {
    id: "salmon",
    name: "Saumon",
    emoji: "🐟",
    unit: "100 g",
    kcal: 208,
    protein: 20,
    carbs: 0,
    fat: 13
  },

  {
    id: "potato",
    name: "Pomme de terre",
    emoji: "🥔",
    unit: "100 g",
    kcal: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1
  },

  {
    id: "oats",
    name: "Flocons d’avoine",
    emoji: "🥣",
    unit: "100 g",
    kcal: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9
  },

  {
    id: "banana",
    name: "Banane",
    emoji: "🍌",
    unit: "100 g",
    kcal: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3
  },

  {
    id: "apple",
    name: "Pomme",
    emoji: "🍎",
    unit: "100 g",
    kcal: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2
  },

  {
    id: "avocado",
    name: "Avocat",
    emoji: "🥑",
    unit: "100 g",
    kcal: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7
  },

  {
    id: "bread",
    name: "Pain",
    emoji: "🍞",
    unit: "100 g",
    kcal: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2
  },

  {
    id: "milk",
    name: "Lait demi-écrémé",
    emoji: "🥛",
    unit: "100 ml",
    kcal: 46,
    protein: 3.2,
    carbs: 4.8,
    fat: 1.6
  },

  {
    id: "yogurt",
    name: "Yaourt nature",
    emoji: "🥛",
    unit: "100 g",
    kcal: 61,
    protein: 3.5,
    carbs: 4.7,
    fat: 3.3
  },

  {
    id: "greek_yogurt",
    name: "Skyr",
    emoji: "🥣",
    unit: "100 g",
    kcal: 63,
    protein: 10.6,
    carbs: 3.9,
    fat: 0.2
  },

  {
    id: "cheese",
    name: "Emmental",
    emoji: "🧀",
    unit: "100 g",
    kcal: 380,
    protein: 28,
    carbs: 0.5,
    fat: 29
  },

  {
    id: "olive_oil",
    name: "Huile d’olive",
    emoji: "🫒",
    unit: "100 g",
    kcal: 884,
    protein: 0,
    carbs: 0,
    fat: 100
  },

  {
    id: "tomato",
    name: "Tomate",
    emoji: "🍅",
    unit: "100 g",
    kcal: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2
  },

  {
    id: "broccoli",
    name: "Brocoli",
    emoji: "🥦",
    unit: "100 g",
    kcal: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4
  },

  {
    id: "carrot",
    name: "Carotte",
    emoji: "🥕",
    unit: "100 g",
    kcal: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2
  },

  {
    id: "lentils",
    name: "Lentilles cuites",
    emoji: "🫘",
    unit: "100 g",
    kcal: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4
  },

  {
    id: "beans",
    name: "Haricots rouges cuits",
    emoji: "🫘",
    unit: "100 g",
    kcal: 127,
    protein: 8.7,
    carbs: 22.8,
    fat: 0.5
  },

  {
    id: "chickpeas",
    name: "Pois chiches cuits",
    emoji: "🫘",
    unit: "100 g",
    kcal: 164,
    protein: 8.9,
    carbs: 27.4,
    fat: 2.6
  }
];


const RECIPES = [
  {
    id: "chicken-rice",
    name: "Poulet & riz",
    emoji: "🍗",
    kcal: 620,
    protein: 52,
    carbs: 72,
    fat: 12,

    ingredients: [
      {
        food: "chicken",
        grams: 180
      },
      {
        food: "rice",
        grams: 250
      },
      {
        food: "olive_oil",
        grams: 8
      },
      {
        food: "broccoli",
        grams: 150
      }
    ]
  },

  {
    id: "tuna-pasta",
    name: "Pâtes au thon",
    emoji: "🍝",
    kcal: 590,
    protein: 45,
    carbs: 78,
    fat: 10,

    ingredients: [
      {
        food: "pasta",
        grams: 250
      },
      {
        food: "tuna",
        grams: 120
      },
      {
        food: "tomato",
        grams: 150
      },
      {
        food: "olive_oil",
        grams: 8
      }
    ]
  },

  {
    id: "beef-potatoes",
    name: "Bœuf & pommes de terre",
    emoji: "🥩",
    kcal: 610,
    protein: 48,
    carbs: 58,
    fat: 20,

    ingredients: [
      {
        food: "beef",
        grams: 180
      },
      {
        food: "potato",
        grams: 300
      },
      {
        food: "broccoli",
        grams: 150
      }
    ]
  },

  {
    id: "oat-bowl",
    name: "Bowl avoine & banane",
    emoji: "🥣",
    kcal: 480,
    protein: 28,
    carbs: 65,
    fat: 12,

    ingredients: [
      {
        food: "oats",
        grams: 60
      },
      {
        food: "milk",
        grams: 200
      },
      {
        food: "banana",
        grams: 120
      },
      {
        food: "greek_yogurt",
        grams: 150
      }
    ]
  },

  {
    id: "salmon-rice",
    name: "Saumon & riz",
    emoji: "🐟",
    kcal: 650,
    protein: 43,
    carbs: 65,
    fat: 22,

    ingredients: [
      {
        food: "salmon",
        grams: 160
      },
      {
        food: "rice",
        grams: 250
      },
      {
        food: "broccoli",
        grams: 150
      }
    ]
  }
];


const SHOPPING_ITEMS = [
  {
    id: "chicken",
    name: "Poulet",
    quantity: "1 kg",
    price: 8
  },

  {
    id: "rice",
    name: "Riz",
    quantity: "1 kg",
    price: 2
  },

  {
    id: "pasta",
    name: "Pâtes",
    quantity: "1 kg",
    price: 2
  },

  {
    id: "tuna",
    name: "Thon",
    quantity: "4 boîtes",
    price: 5
  },

  {
    id: "egg",
    name: "Œufs",
    quantity: "12",
    price: 3
  },

  {
    id: "potato",
    name: "Pommes de terre",
    quantity: "2 kg",
    price: 3
  },

  {
    id: "oats",
    name: "Flocons d’avoine",
    quantity: "500 g",
    price: 2
  },

  {
    id: "banana",
    name: "Bananes",
    quantity: "1 kg",
    price: 2
  },

  {
    id: "broccoli",
    name: "Brocoli",
    quantity: "500 g",
    price: 2
  },

  {
    id: "tomato",
    name: "Tomates",
    quantity: "1 kg",
    price: 3
  },

  {
    id: "milk",
    name: "Lait",
    quantity: "1 L",
    price: 1.5
  },

  {
    id: "greek_yogurt",
    name: "Skyr",
    quantity: "4 pots",
    price: 3.5
  }
];


const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"
];
