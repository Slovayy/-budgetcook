/* =========================================================
   BUDGETCOOK V4 — DATA.JS
   Aliments • Recettes • Courses • Jours
========================================================= */


/* =========================================================
   ALIMENTS
========================================================= */

const FOODS = [

  {
    id: "chicken",
    name: "Poulet",
    emoji: "🍗",
    unit: "g",
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6
  },

  {
    id: "rice",
    name: "Riz blanc cuit",
    emoji: "🍚",
    unit: "g",
    kcal: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3
  },

  {
    id: "pasta",
    name: "Pâtes cuites",
    emoji: "🍝",
    unit: "g",
    kcal: 158,
    protein: 5.8,
    carbs: 30.9,
    fat: 0.9
  },

  {
    id: "tuna",
    name: "Thon au naturel",
    emoji: "🐟",
    unit: "g",
    kcal: 116,
    protein: 26,
    carbs: 0,
    fat: 1
  },

  {
    id: "egg",
    name: "Œuf",
    emoji: "🥚",
    unit: "g",
    kcal: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5
  },

  {
    id: "beef",
    name: "Bœuf haché 5%",
    emoji: "🥩",
    unit: "g",
    kcal: 137,
    protein: 21,
    carbs: 0,
    fat: 5
  },

  {
    id: "salmon",
    name: "Saumon",
    emoji: "🐟",
    unit: "g",
    kcal: 208,
    protein: 20,
    carbs: 0,
    fat: 13
  },

  {
    id: "potato",
    name: "Pomme de terre",
    emoji: "🥔",
    unit: "g",
    kcal: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1
  },

  {
    id: "oats",
    name: "Flocons d’avoine",
    emoji: "🥣",
    unit: "g",
    kcal: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9
  },

  {
    id: "banana",
    name: "Banane",
    emoji: "🍌",
    unit: "g",
    kcal: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3
  },

  {
    id: "apple",
    name: "Pomme",
    emoji: "🍎",
    unit: "g",
    kcal: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2
  },

  {
    id: "avocado",
    name: "Avocat",
    emoji: "🥑",
    unit: "g",
    kcal: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7
  },

  {
    id: "bread",
    name: "Pain",
    emoji: "🍞",
    unit: "g",
    kcal: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2
  },

  {
    id: "milk",
    name: "Lait demi-écrémé",
    emoji: "🥛",
    unit: "ml",
    kcal: 46,
    protein: 3.2,
    carbs: 4.8,
    fat: 1.6
  },

  {
    id: "yogurt",
    name: "Yaourt nature",
    emoji: "🥛",
    unit: "g",
    kcal: 61,
    protein: 3.5,
    carbs: 4.7,
    fat: 3.3
  },

  {
    id: "greek_yogurt",
    name: "Skyr",
    emoji: "🥣",
    unit: "g",
    kcal: 63,
    protein: 10.6,
    carbs: 3.9,
    fat: 0.2
  },

  {
    id: "cheese",
    name: "Emmental",
    emoji: "🧀",
    unit: "g",
    kcal: 380,
    protein: 28,
    carbs: 0.5,
    fat: 29
  },

  {
    id: "olive_oil",
    name: "Huile d’olive",
    emoji: "🫒",
    unit: "g",
    kcal: 884,
    protein: 0,
    carbs: 0,
    fat: 100
  },

  {
    id: "tomato",
    name: "Tomate",
    emoji: "🍅",
    unit: "g",
    kcal: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2
  },

  {
    id: "broccoli",
    name: "Brocoli",
    emoji: "🥦",
    unit: "g",
    kcal: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4
  },

  {
    id: "carrot",
    name: "Carotte",
    emoji: "🥕",
    unit: "g",
    kcal: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2
  },

  {
    id: "lentils",
    name: "Lentilles cuites",
    emoji: "🫘",
    unit: "g",
    kcal: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4
  },

  {
    id: "beans",
    name: "Haricots rouges cuits",
    emoji: "🫘",
    unit: "g",
    kcal: 127,
    protein: 8.7,
    carbs: 22.8,
    fat: 0.5
  },

  {
    id: "chickpeas",
    name: "Pois chiches cuits",
    emoji: "🫘",
    unit: "g",
    kcal: 164,
    protein: 8.9,
    carbs: 27.4,
    fat: 2.6
  },

  {
    id: "turkey",
    name: "Escalope de dinde",
    emoji: "🦃",
    unit: "g",
    kcal: 114,
    protein: 24,
    carbs: 0,
    fat: 1.5
  },

  {
    id: "ham",
    name: "Jambon blanc",
    emoji: "🥩",
    unit: "g",
    kcal: 116,
    protein: 20,
    carbs: 1.5,
    fat: 3
  },

  {
    id: "cottage_cheese",
    name: "Fromage blanc 0%",
    emoji: "🥛",
    unit: "g",
    kcal: 48,
    protein: 8,
    carbs: 4,
    fat: 0.2
  },

  {
    id: "peanut_butter",
    name: "Beurre de cacahuète",
    emoji: "🥜",
    unit: "g",
    kcal: 588,
    protein: 25,
    carbs: 20,
    fat: 50
  },

  {
    id: "corn",
    name: "Maïs",
    emoji: "🌽",
    unit: "g",
    kcal: 86,
    protein: 3.2,
    carbs: 19,
    fat: 1.2
  },

  {
    id: "cucumber",
    name: "Concombre",
    emoji: "🥒",
    unit: "g",
    kcal: 15,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1
  },

  {
    id: "onion",
    name: "Oignon",
    emoji: "🧅",
    unit: "g",
    kcal: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1
  },

  {
    id: "green_beans",
    name: "Haricots verts",
    emoji: "🫛",
    unit: "g",
    kcal: 31,
    protein: 1.8,
    carbs: 7,
    fat: 0.2
  },

  {
    id: "spinach",
    name: "Épinards",
    emoji: "🥬",
    unit: "g",
    kcal: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4
  },

  {
    id: "strawberry",
    name: "Fraises",
    emoji: "🍓",
    unit: "g",
    kcal: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3
  },

  {
    id: "orange",
    name: "Orange",
    emoji: "🍊",
    unit: "g",
    kcal: 47,
    protein: 0.9,
    carbs: 11.8,
    fat: 0.1
  },

  {
    id: "protein_powder",
    name: "Protéine en poudre",
    emoji: "🥤",
    unit: "g",
    kcal: 400,
    protein: 80,
    carbs: 8,
    fat: 6
  }

];


/* =========================================================
   RECETTES
========================================================= */

const RECIPES = [

  {
    id: "chicken-rice",
    name: "Poulet & riz",
    emoji: "🍗",

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
  },

  {
    id: "turkey-pasta",
    name: "Pâtes à la dinde",
    emoji: "🍝",

    ingredients: [
      {
        food: "turkey",
        grams: 180
      },
      {
        food: "pasta",
        grams: 220
      },
      {
        food: "tomato",
        grams: 150
      },
      {
        food: "olive_oil",
        grams: 5
      }
    ]
  },

  {
    id: "omelette",
    name: "Omelette complète",
    emoji: "🍳",

    ingredients: [
      {
        food: "egg",
        grams: 200
      },
      {
        food: "bread",
        grams: 80
      },
      {
        food: "tomato",
        grams: 150
      }
    ]
  },

  {
    id: "lentil-bowl",
    name: "Bowl lentilles & œufs",
    emoji: "🫘",

    ingredients: [
      {
        food: "lentils",
        grams: 250
      },
      {
        food: "egg",
        grams: 150
      },
      {
        food: "tomato",
        grams: 150
      }
    ]
  },

  {
    id: "chickpea-chicken",
    name: "Poulet & pois chiches",
    emoji: "🍗",

    ingredients: [
      {
        food: "chicken",
        grams: 170
      },
      {
        food: "chickpeas",
        grams: 180
      },
      {
        food: "tomato",
        grams: 150
      }
    ]
  },

  {
    id: "skyr-banana",
    name: "Skyr & banane",
    emoji: "🥣",

    ingredients: [
      {
        food: "greek_yogurt",
        grams: 250
      },
      {
        food: "banana",
        grams: 120
      },
      {
        food: "oats",
        grams: 30
      }
    ]
  },

  {
    id: "tuna-rice",
    name: "Riz au thon",
    emoji: "🐟",

    ingredients: [
      {
        food: "rice",
        grams: 250
      },
      {
        food: "tuna",
        grams: 150
      },
      {
        food: "corn",
        grams: 80
      },
      {
        food: "tomato",
        grams: 100
      }
    ]
  },

  {
    id: "beef-pasta",
    name: "Pâtes au bœuf",
    emoji: "🥩",

    ingredients: [
      {
        food: "beef",
        grams: 180
      },
      {
        food: "pasta",
        grams: 220
      },
      {
        food: "tomato",
        grams: 150
      }
    ]
  }

];


/* =========================================================
   COURSES
========================================================= */

const SHOPPING_ITEMS = [

  {
    id: "chicken",
    name: "Poulet",
    quantity: "1 kg",
    price: 8
  },

  {
    id: "turkey",
    name: "Escalopes de dinde",
    quantity: "500 g",
    price: 5
  },

  {
    id: "beef",
    name: "Bœuf haché 5%",
    quantity: "500 g",
    price: 6
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
    id: "apple",
    name: "Pommes",
    quantity: "1 kg",
    price: 2.5
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
    id: "carrot",
    name: "Carottes",
    quantity: "1 kg",
    price: 1.5
  },

  {
    id: "lentils",
    name: "Lentilles",
    quantity: "500 g",
    price: 1.5
  },

  {
    id: "chickpeas",
    name: "Pois chiches",
    quantity: "500 g",
    price: 1.5
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
  },

  {
    id: "cottage_cheese",
    name: "Fromage blanc 0%",
    quantity: "500 g",
    price: 2
  },

  {
    id: "bread",
    name: "Pain",
    quantity: "500 g",
    price: 1.5
  },

  {
    id: "olive_oil",
    name: "Huile d’olive",
    quantity: "500 ml",
    price: 5
  },

  {
    id: "avocado",
    name: "Avocats",
    quantity: "2",
    price: 3
  }

];


/* =========================================================
   JOURS
========================================================= */

const DAYS = [

  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"

];
