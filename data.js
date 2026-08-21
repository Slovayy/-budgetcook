/* =========================================================
   BUDGETCOOK V4 — DATA.JS
   BASE DE DONNÉES COMPLÈTE
========================================================= */


/* =========================================================
   APP CONFIG
========================================================= */

const APP_CONFIG = {

  appName: "BudgetCook",
  version: "V4",

  currency: "EUR",
  currencySymbol: "€",

  defaultCountry: "PT",
  defaultLanguage: "fr",

  daysPerWeek: 7,

  mealsPerDay: [
    "breakfast",
    "lunch",
    "snack",
    "dinner"
  ],

  nutrition: {
    proteinCaloriesPerGram: 4,
    carbCaloriesPerGram: 4,
    fatCaloriesPerGram: 9,

    macroTolerancePercent: 5
  },

  units: [
    "g",
    "kg",
    "ml",
    "L",
    "piece",
    "portion",
    "slice",
    "pot"
  ]

};


/* =========================================================
   DAYS
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


/* =========================================================
   MEAL TYPES
========================================================= */

const MEAL_TYPES = [

  {
    id: "breakfast",
    name: "Petit-déjeuner",
    emoji: "🌅"
  },

  {
    id: "lunch",
    name: "Déjeuner",
    emoji: "🍽️"
  },

  {
    id: "snack",
    name: "Collation",
    emoji: "🥤"
  },

  {
    id: "dinner",
    name: "Dîner",
    emoji: "🌙"
  }

];


/* =========================================================
   FOOD CATEGORIES
========================================================= */

const FOOD_CATEGORIES = [

  { id: "meat", name: "Viandes", emoji: "🥩" },
  { id: "fish", name: "Poissons", emoji: "🐟" },
  { id: "seafood", name: "Fruits de mer", emoji: "🦐" },
  { id: "eggs", name: "Œufs", emoji: "🥚" },
  { id: "rice", name: "Riz & céréales", emoji: "🍚" },
  { id: "pasta", name: "Pâtes", emoji: "🍝" },
  { id: "potatoes", name: "Pommes de terre", emoji: "🥔" },
  { id: "legumes", name: "Légumineuses", emoji: "🫘" },
  { id: "vegetables", name: "Légumes", emoji: "🥦" },
  { id: "fruits", name: "Fruits", emoji: "🍎" },
  { id: "dairy", name: "Produits laitiers", emoji: "🥛" },
  { id: "cheese", name: "Fromages", emoji: "🧀" },
  { id: "bread", name: "Pains", emoji: "🍞" },
  { id: "nuts", name: "Oléagineux", emoji: "🥜" },
  { id: "oils", name: "Huiles & matières grasses", emoji: "🫒" },
  { id: "sauces", name: "Sauces & condiments", emoji: "🥫" },
  { id: "protein", name: "Protéines", emoji: "💪" },
  { id: "drinks", name: "Boissons", emoji: "🥤" },
  { id: "snacks", name: "Snacks", emoji: "🍫" },
  { id: "other", name: "Autres", emoji: "📦" }

];


/* =========================================================
   DIET TYPES
========================================================= */

const DIET_TYPES = [

  {
    id: "standard",
    name: "Alimentation classique"
  },

  {
    id: "high_protein",
    name: "Riche en protéines"
  },

  {
    id: "vegetarian",
    name: "Végétarien"
  },

  {
    id: "vegan",
    name: "Végan"
  },

  {
    id: "low_carb",
    name: "Low carb"
  },

  {
    id: "balanced",
    name: "Équilibrée"
  }

];


/* =========================================================
   GOALS
========================================================= */

const GOALS = [

  {
    id: "cut",
    name: "Perte de poids",
    emoji: "🔥",
    calorieAdjustment: -300
  },

  {
    id: "maintenance",
    name: "Maintien",
    emoji: "⚖️",
    calorieAdjustment: 0
  },

  {
    id: "bulk",
    name: "Prise de masse",
    emoji: "💪",
    calorieAdjustment: 250
  },

  {
    id: "recomposition",
    name: "Recomposition",
    emoji: "🔄",
    calorieAdjustment: -200
  }

];


/* =========================================================
   ACTIVITY LEVELS
========================================================= */

const ACTIVITY_LEVELS = [

  {
    id: "sedentary",
    name: "Sédentaire",
    multiplier: 1.2
  },

  {
    id: "light",
    name: "Légèrement actif",
    multiplier: 1.375
  },

  {
    id: "moderate",
    name: "Modérément actif",
    multiplier: 1.55
  },

  {
    id: "active",
    name: "Actif",
    multiplier: 1.725
  },

  {
    id: "very_active",
    name: "Très actif",
    multiplier: 1.9
  }

];


/* =========================================================
   TRAINING TYPES
========================================================= */

const TRAINING_TYPES = [

  "Musculation",
  "Cardio",
  "Course",
  "Football",
  "Natation",
  "Cyclisme",
  "Cross-training",
  "Marche",
  "Autre"

];


/* =========================================================
   ALLERGENS
========================================================= */

const ALLERGENS = [

  { id: "milk", name: "Lait" },
  { id: "eggs", name: "Œufs" },
  { id: "peanuts", name: "Arachides" },
  { id: "nuts", name: "Fruits à coque" },
  { id: "gluten", name: "Gluten" },
  { id: "fish", name: "Poisson" },
  { id: "shellfish", name: "Crustacés" },
  { id: "soy", name: "Soja" },
  { id: "sesame", name: "Sésame" }

];


/* =========================================================
   FOODS
   Valeurs nutritionnelles pour 100 g / 100 ml
========================================================= */

const FOODS = [

  /* ---------------- MEAT ---------------- */

  {
    id: "chicken",
    name: "Poulet",
    emoji: "🍗",
    category: "meat",
    unit: "g",
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    allergens: []
  },

  {
    id: "turkey",
    name: "Escalope de dinde",
    emoji: "🦃",
    category: "meat",
    unit: "g",
    kcal: 114,
    protein: 24,
    carbs: 0,
    fat: 1.5,
    fiber: 0,
    allergens: []
  },

  {
    id: "beef",
    name: "Bœuf haché 5%",
    emoji: "🥩",
    category: "meat",
    unit: "g",
    kcal: 137,
    protein: 21,
    carbs: 0,
    fat: 5,
    fiber: 0,
    allergens: []
  },

  {
    id: "lean_beef",
    name: "Steak de bœuf maigre",
    emoji: "🥩",
    category: "meat",
    unit: "g",
    kcal: 150,
    protein: 26,
    carbs: 0,
    fat: 5,
    fiber: 0,
    allergens: []
  },

  {
    id: "ham",
    name: "Jambon blanc",
    emoji: "🥩",
    category: "meat",
    unit: "g",
    kcal: 116,
    protein: 20,
    carbs: 1.5,
    fat: 3,
    fiber: 0,
    allergens: []
  },

  {
    id: "pork",
    name: "Filet de porc",
    emoji: "🥩",
    category: "meat",
    unit: "g",
    kcal: 143,
    protein: 27,
    carbs: 0,
    fat: 3.5,
    fiber: 0,
    allergens: []
  },


  /* ---------------- FISH ---------------- */

  {
    id: "salmon",
    name: "Saumon",
    emoji: "🐟",
    category: "fish",
    unit: "g",
    kcal: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    fiber: 0,
    allergens: ["fish"]
  },

  {
    id: "tuna",
    name: "Thon au naturel",
    emoji: "🐟",
    category: "fish",
    unit: "g",
    kcal: 116,
    protein: 26,
    carbs: 0,
    fat: 1,
    fiber: 0,
    allergens: ["fish"]
  },

  {
    id: "cod",
    name: "Cabillaud",
    emoji: "🐟",
    category: "fish",
    unit: "g",
    kcal: 82,
    protein: 18,
    carbs: 0,
    fat: 0.7,
    fiber: 0,
    allergens: ["fish"]
  },

  {
    id: "sardines",
    name: "Sardines",
    emoji: "🐟",
    category: "fish",
    unit: "g",
    kcal: 208,
    protein: 25,
    carbs: 0,
    fat: 11,
    fiber: 0,
    allergens: ["fish"]
  },


  /* ---------------- EGGS ---------------- */

  {
    id: "egg",
    name: "Œuf",
    emoji: "🥚",
    category: "eggs",
    unit: "g",
    kcal: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5,
    fiber: 0,
    allergens: ["eggs"]
  },

  {
    id: "egg_white",
    name: "Blanc d'œuf",
    emoji: "🥚",
    category: "eggs",
    unit: "g",
    kcal: 52,
    protein: 10.9,
    carbs: 0.7,
    fat: 0.2,
    fiber: 0,
    allergens: ["eggs"]
  },


  /* ---------------- RICE / GRAINS ---------------- */

  {
    id: "rice",
    name: "Riz blanc cuit",
    emoji: "🍚",
    category: "rice",
    unit: "g",
    kcal: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    allergens: []
  },

  {
    id: "brown_rice",
    name: "Riz complet cuit",
    emoji: "🍚",
    category: "rice",
    unit: "g",
    kcal: 123,
    protein: 2.7,
    carbs: 25.6,
    fat: 1,
    fiber: 1.6,
    allergens: []
  },

  {
    id: "quinoa",
    name: "Quinoa cuit",
    emoji: "🌾",
    category: "rice",
    unit: "g",
    kcal: 120,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    fiber: 2.8,
    allergens: []
  },

  {
    id: "oats",
    name: "Flocons d’avoine",
    emoji: "🥣",
    category: "rice",
    unit: "g",
    kcal: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    fiber: 10.6,
    allergens: ["gluten"]
  },


  /* ---------------- PASTA ---------------- */

  {
    id: "pasta",
    name: "Pâtes cuites",
    emoji: "🍝",
    category: "pasta",
    unit: "g",
    kcal: 158,
    protein: 5.8,
    carbs: 30.9,
    fat: 0.9,
    fiber: 1.8,
    allergens: ["gluten"]
  },

  {
    id: "whole_pasta",
    name: "Pâtes complètes cuites",
    emoji: "🍝",
    category: "pasta",
    unit: "g",
    kcal: 149,
    protein: 5.3,
    carbs: 30,
    fat: 1.1,
    fiber: 3.9,
    allergens: ["gluten"]
  },


  /* ---------------- POTATOES ---------------- */

  {
    id: "potato",
    name: "Pomme de terre",
    emoji: "🥔",
    category: "potatoes",
    unit: "g",
    kcal: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    fiber: 2.2,
    allergens: []
  },

  {
    id: "sweet_potato",
    name: "Patate douce",
    emoji: "🍠",
    category: "potatoes",
    unit: "g",
    kcal: 86,
    protein: 1.6,
    carbs: 20.1,
    fat: 0.1,
    fiber: 3,
    allergens: []
  },


  /* ---------------- LEGUMES ---------------- */

  {
    id: "lentils",
    name: "Lentilles cuites",
    emoji: "🫘",
    category: "legumes",
    unit: "g",
    kcal: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    fiber: 7.9,
    allergens: []
  },

  {
    id: "beans",
    name: "Haricots rouges cuits",
    emoji: "🫘",
    category: "legumes",
    unit: "g",
    kcal: 127,
    protein: 8.7,
    carbs: 22.8,
    fat: 0.5,
    fiber: 6.4,
    allergens: []
  },

  {
    id: "chickpeas",
    name: "Pois chiches cuits",
    emoji: "🫘",
    category: "legumes",
    unit: "g",
    kcal: 164,
    protein: 8.9,
    carbs: 27.4,
    fat: 2.6,
    fiber: 7.6,
    allergens: []
  },


  /* ---------------- VEGETABLES ---------------- */

  {
    id: "broccoli",
    name: "Brocoli",
    emoji: "🥦",
    category: "vegetables",
    unit: "g",
    kcal: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    allergens: []
  },

  {
    id: "tomato",
    name: "Tomate",
    emoji: "🍅",
    category: "vegetables",
    unit: "g",
    kcal: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    fiber: 1.2,
    allergens: []
  },

  {
    id: "carrot",
    name: "Carotte",
    emoji: "🥕",
    category: "vegetables",
    unit: "g",
    kcal: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    fiber: 2.8,
    allergens: []
  },

  {
    id: "cucumber",
    name: "Concombre",
    emoji: "🥒",
    category: "vegetables",
    unit: "g",
    kcal: 15,
    protein: 0.7,
    carbs: 3.6,
    fat: 0.1,
    fiber: 0.5,
    allergens: []
  },

  {
    id: "onion",
    name: "Oignon",
    emoji: "🧅",
    category: "vegetables",
    unit: "g",
    kcal: 40,
    protein: 1.1,
    carbs: 9.3,
    fat: 0.1,
    fiber: 1.7,
    allergens: []
  },

  {
    id: "green_beans",
    name: "Haricots verts",
    emoji: "🫛",
    category: "vegetables",
    unit: "g",
    kcal: 31,
    protein: 1.8,
    carbs: 7,
    fat: 0.2,
    fiber: 3.4,
    allergens: []
  },

  {
    id: "spinach",
    name: "Épinards",
    emoji: "🥬",
    category: "vegetables",
    unit: "g",
    kcal: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    allergens: []
  },

  {
    id: "zucchini",
    name: "Courgette",
    emoji: "🥒",
    category: "vegetables",
    unit: "g",
    kcal: 17,
    protein: 1.2,
    carbs: 3.1,
    fat: 0.3,
    fiber: 1,
    allergens: []
  },

  {
    id: "pepper",
    name: "Poivron",
    emoji: "🫑",
    category: "vegetables",
    unit: "g",
    kcal: 31,
    protein: 1,
    carbs: 6,
    fat: 0.3,
    fiber: 2.1,
    allergens: []
  },

  {
    id: "mushroom",
    name: "Champignons",
    emoji: "🍄",
    category: "vegetables",
    unit: "g",
    kcal: 22,
    protein: 3.1,
    carbs: 3.3,
    fat: 0.3,
    fiber: 1,
    allergens: []
  },


  /* ---------------- FRUITS ---------------- */

  {
    id: "banana",
    name: "Banane",
    emoji: "🍌",
    category: "fruits",
    unit: "g",
    kcal: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    fiber: 2.6,
    allergens: []
  },

  {
    id: "apple",
    name: "Pomme",
    emoji: "🍎",
    category: "fruits",
    unit: "g",
    kcal: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2,
    fiber: 2.4,
    allergens: []
  },

  {
    id: "orange",
    name: "Orange",
    emoji: "🍊",
    category: "fruits",
    unit: "g",
    kcal: 47,
    protein: 0.9,
    carbs: 11.8,
    fat: 0.1,
    fiber: 2.4,
    allergens: []
  },

  {
    id: "strawberry",
    name: "Fraises",
    emoji: "🍓",
    category: "fruits",
    unit: "g",
    kcal: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3,
    fiber: 2,
    allergens: []
  },

  {
    id: "blueberry",
    name: "Myrtilles",
    emoji: "🫐",
    category: "fruits",
    unit: "g",
    kcal: 57,
    protein: 0.7,
    carbs: 14.5,
    fat: 0.3,
    fiber: 2.4,
    allergens: []
  },

  {
    id: "avocado",
    name: "Avocat",
    emoji: "🥑",
    category: "fruits",
    unit: "g",
    kcal: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    allergens: []
  },


  /* ---------------- DAIRY ---------------- */

  {
    id: "milk",
    name: "Lait demi-écrémé",
    emoji: "🥛",
    category: "dairy",
    unit: "ml",
    kcal: 46,
    protein: 3.2,
    carbs: 4.8,
    fat: 1.6,
    fiber: 0,
    allergens: ["milk"]
  },

  {
    id: "yogurt",
    name: "Yaourt nature",
    emoji: "🥛",
    category: "dairy",
    unit: "g",
    kcal: 61,
    protein: 3.5,
    carbs: 4.7,
    fat: 3.3,
    fiber: 0,
    allergens: ["milk"]
  },

  {
    id: "greek_yogurt",
    name: "Skyr",
    emoji: "🥣",
    category: "dairy",
    unit: "g",
    kcal: 63,
    protein: 10.6,
    carbs: 3.9,
    fat: 0.2,
    fiber: 0,
    allergens: ["milk"]
  },

  {
    id: "cottage_cheese",
    name: "Fromage blanc 0%",
    emoji: "🥛",
    category: "dairy",
    unit: "g",
    kcal: 48,
    protein: 8,
    carbs: 4,
    fat: 0.2,
    fiber: 0,
    allergens: ["milk"]
  },


  /* ---------------- CHEESE ---------------- */

  {
    id: "cheese",
    name: "Emmental",
    emoji: "🧀",
    category: "cheese",
    unit: "g",
    kcal: 380,
    protein: 28,
    carbs: 0.5,
    fat: 29,
    fiber: 0,
    allergens: ["milk"]
  },

  {
    id: "mozzarella",
    name: "Mozzarella",
    emoji: "🧀",
    category: "cheese",
    unit: "g",
    kcal: 280,
    protein: 28,
    carbs: 3.1,
    fat: 17,
    fiber: 0,
    allergens: ["milk"]
  },


  /* ---------------- BREAD ---------------- */

  {
    id: "bread",
    name: "Pain",
    emoji: "🍞",
    category: "bread",
    unit: "g",
    kcal: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2,
    fiber: 2.7,
    allergens: ["gluten"]
  },

  {
    id: "whole_bread",
    name: "Pain complet",
    emoji: "🍞",
    category: "bread",
    unit: "g",
    kcal: 247,
    protein: 13,
    carbs: 41,
    fat: 4.2,
    fiber: 7,
    allergens: ["gluten"]
  },


  /* ---------------- NUTS ---------------- */

  {
    id: "peanut_butter",
    name: "Beurre de cacahuète",
    emoji: "🥜",
    category: "nuts",
    unit: "g",
    kcal: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    fiber: 6,
    allergens: ["peanuts"]
  },

  {
    id: "almonds",
    name: "Amandes",
    emoji: "🌰",
    category: "nuts",
    unit: "g",
    kcal: 579,
    protein: 21.2,
    carbs: 21.6,
    fat: 49.9,
    fiber: 12.5,
    allergens: ["nuts"]
  },

  {
    id: "walnuts",
    name: "Noix",
    emoji: "🌰",
    category: "nuts",
    unit: "g",
    kcal: 654,
    protein: 15.2,
    carbs: 13.7,
    fat: 65.2,
    fiber: 6.7,
    allergens: ["nuts"]
  },


  /* ---------------- OILS ---------------- */

  {
    id: "olive_oil",
    name: "Huile d’olive",
    emoji: "🫒",
    category: "oils",
    unit: "g",
    kcal: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    allergens: []
  },

  {
    id: "rapeseed_oil",
    name: "Huile de colza",
    emoji: "🫒",
    category: "oils",
    unit: "g",
    kcal: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    fiber: 0,
    allergens: []
  },


  /* ---------------- OTHER ---------------- */

  {
    id: "corn",
    name: "Maïs",
    emoji: "🌽",
    category: "vegetables",
    unit: "g",
    kcal: 86,
    protein: 3.2,
    carbs: 19,
    fat: 1.2,
    fiber: 2.7,
    allergens: []
  },

  {
    id: "protein_powder",
    name: "Protéine en poudre",
    emoji: "🥤",
    category: "protein",
    unit: "g",
    kcal: 400,
    protein: 80,
    carbs: 8,
    fat: 6,
    fiber: 1,
    allergens: ["milk"]
  }

];


/* =========================================================
   FOOD PORTIONS
========================================================= */

const FOOD_PORTIONS = [

  {
    food: "egg",
    portions: [
      { name: "1 œuf", grams: 60 },
      { name: "2 œufs", grams: 120 },
      { name: "3 œufs", grams: 180 }
    ]
  },

  {
    food: "banana",
    portions: [
      { name: "1 petite banane", grams: 90 },
      { name: "1 banane moyenne", grams: 120 },
      { name: "1 grosse banane", grams: 150 }
    ]
  },

  {
    food: "chicken",
    portions: [
      { name: "100 g", grams: 100 },
      { name: "150 g", grams: 150 },
      { name: "200 g", grams: 200 },
      { name: "250 g", grams: 250 }
    ]
  },

  {
    food: "rice",
    portions: [
      { name: "150 g", grams: 150 },
      { name: "200 g", grams: 200 },
      { name: "250 g", grams: 250 },
      { name: "300 g", grams: 300 }
    ]
  },

  {
    food: "pasta",
    portions: [
      { name: "150 g", grams: 150 },
      { name: "200 g", grams: 200 },
      { name: "250 g", grams: 250 },
      { name: "300 g", grams: 300 }
    ]
  }

];


/* =========================================================
   RECIPES
========================================================= */

const RECIPES = [

  {
    id: "chicken-rice",
    name: "Poulet & riz",
    emoji: "🍗",
    category: "lunch",
    servings: 1,
    prepTime: 20,
    difficulty: "easy",
    tags: ["high_protein", "meal_prep", "budget"],
    ingredients: [
      { food: "chicken", grams: 180 },
      { food: "rice", grams: 250 },
      { food: "olive_oil", grams: 8 },
      { food: "broccoli", grams: 150 }
    ]
  },

  {
    id: "tuna-pasta",
    name: "Pâtes au thon",
    emoji: "🍝",
    category: "lunch",
    servings: 1,
    prepTime: 15,
    difficulty: "easy",
    tags: ["high_protein", "budget"],
    ingredients: [
      { food: "pasta", grams: 250 },
      { food: "tuna", grams: 120 },
      { food: "tomato", grams: 150 },
      { food: "olive_oil", grams: 8 }
    ]
  },

  {
    id: "beef-potatoes",
    name: "Bœuf & pommes de terre",
    emoji: "🥩",
    category: "dinner",
    servings: 1,
    prepTime: 30,
    difficulty: "easy",
    tags: ["high_protein"],
    ingredients: [
      { food: "beef", grams: 180 },
      { food: "potato", grams: 300 },
      { food: "broccoli", grams: 150 }
    ]
  },

  {
    id: "oat-bowl",
    name: "Bowl avoine & banane",
    emoji: "🥣",
    category: "breakfast",
    servings: 1,
    prepTime: 5,
    difficulty: "easy",
    tags: ["breakfast", "high_protein"],
    ingredients: [
      { food: "oats", grams: 60 },
      { food: "milk", grams: 200 },
      { food: "banana", grams: 120 },
      { food: "greek_yogurt", grams: 150 }
    ]
  },

  {
    id: "salmon-rice",
    name: "Saumon & riz",
    emoji: "🐟",
    category: "dinner",
    servings: 1,
    prepTime: 25,
    difficulty: "easy",
    tags: ["high_protein"],
    ingredients: [
      { food: "salmon", grams: 160 },
      { food: "rice", grams: 250 },
      { food: "broccoli", grams: 150 }
    ]
  },

  {
    id: "turkey-pasta",
    name: "Pâtes à la dinde",
    emoji: "🍝",
    category: "lunch",
    servings: 1,
    prepTime: 20,
    difficulty: "easy",
    tags: ["high_protein", "budget"],
    ingredients: [
      { food: "turkey", grams: 180 },
      { food: "pasta", grams: 220 },
      { food: "tomato", grams: 150 },
      { food: "olive_oil", grams: 5 }
    ]
  },

  {
    id: "omelette",
    name: "Omelette complète",
    emoji: "🍳",
    category: "breakfast",
    servings: 1,
    prepTime: 10,
    difficulty: "easy",
    tags: ["breakfast", "high_protein"],
    ingredients: [
      { food: "egg", grams: 200 },
      { food: "bread", grams: 80 },
      { food: "tomato", grams: 150 }
    ]
  },

  {
    id: "lentil-bowl",
    name: "Bowl lentilles & œufs",
    emoji: "🫘",
    category: "lunch",
    servings: 1,
    prepTime: 20,
    difficulty: "easy",
    tags: ["budget", "high_protein"],
    ingredients: [
      { food: "lentils", grams: 250 },
      { food: "egg", grams: 150 },
      { food: "tomato", grams: 150 }
    ]
  },

  {
    id: "chickpea-chicken",
    name: "Poulet & pois chiches",
    emoji: "🍗",
    category: "dinner",
    servings: 1,
    prepTime: 20,
    difficulty: "easy",
    tags: ["high_protein", "budget"],
    ingredients: [
      { food: "chicken", grams: 170 },
      { food: "chickpeas", grams: 180 },
      { food: "tomato", grams: 150 }
    ]
  },

  {
    id: "skyr-banana",
    name: "Skyr & banane",
    emoji: "🥣",
    category: "snack",
    servings: 1,
    prepTime: 2,
    difficulty: "easy",
    tags: ["snack", "high_protein"],
    ingredients: [
      { food: "greek_yogurt", grams: 250 },
      { food: "banana", grams: 120 },
      { food: "oats", grams: 30 }
    ]
  },

  {
    id: "tuna-rice",
    name: "Riz au thon",
    emoji: "🐟",
    category: "lunch",
    servings: 1,
    prepTime: 10,
    difficulty: "easy",
    tags: ["budget", "high_protein"],
    ingredients: [
      { food: "rice", grams: 250 },
      { food: "tuna", grams: 150 },
      { food: "corn", grams: 80 },
      { food: "tomato", grams: 100 }
    ]
  },

  {
    id: "beef-pasta",
    name: "Pâtes au bœuf",
    emoji: "🥩",
    category: "dinner",
    servings: 1,
    prepTime: 20,
    difficulty: "easy",
    tags: ["high_protein"],
    ingredients: [
      { food: "beef", grams: 180 },
      { food: "pasta", grams: 220 },
      { food: "tomato", grams: 150 }
    ]
  },

  {
    id: "protein-pancakes",
    name: "Pancakes protéinés",
    emoji: "🥞",
    category: "breakfast",
    servings: 1,
    prepTime: 10,
    difficulty: "easy",
    tags: ["breakfast", "high_protein"],
    ingredients: [
      { food: "oats", grams: 60 },
      { food: "egg", grams: 100 },
      { food: "greek_yogurt", grams: 100 },
      { food: "banana", grams: 80 }
    ]
  },

  {
    id: "chicken-pasta",
    name: "Pâtes au poulet",
    emoji: "🍝",
    category: "lunch",
    servings: 1,
    prepTime: 20,
    difficulty: "easy",
    tags: ["high_protein", "meal_prep"],
    ingredients: [
      { food: "chicken", grams: 180 },
      { food: "pasta", grams: 220 },
      { food: "tomato", grams: 150 }
    ]
  },

  {
    id: "chicken-sweet-potato",
    name: "Poulet & patate douce",
    emoji: "🍗",
    category: "dinner",
    servings: 1,
    prepTime: 30,
    difficulty: "easy",
    tags: ["high_protein", "meal_prep"],
    ingredients: [
      { food: "chicken", grams: 180 },
      { food: "sweet_potato", grams: 300 },
      { food: "broccoli", grams: 150 }
    ]
  },

  {
    id: "skyr-oats",
    name: "Skyr avoine & fruits",
    emoji: "🥣",
    category: "breakfast",
    servings: 1,
    prepTime: 5,
    difficulty: "easy",
    tags: ["breakfast", "high_protein"],
    ingredients: [
      { food: "greek_yogurt", grams: 250 },
      { food: "oats", grams: 40 },
      { food: "strawberry", grams: 150 }
    ]
  },

  {
    id: "tuna-sandwich",
    name: "Sandwich thon",
    emoji: "🥪",
    category: "lunch",
    servings: 1,
    prepTime: 10,
    difficulty: "easy",
    tags: ["quick", "high_protein"],
    ingredients: [
      { food: "bread", grams: 120 },
      { food: "tuna", grams: 120 },
      { food: "tomato", grams: 80 },
      { food: "cucumber", grams: 80 }
    ]
  },

  {
    id: "egg-toast",
    name: "Toast aux œufs",
    emoji: "🍳",
    category: "breakfast",
    servings: 1,
    prepTime: 10,
    difficulty: "easy",
    tags: ["breakfast"],
    ingredients: [
      { food: "egg", grams: 150 },
      { food: "whole_bread", grams: 100 },
      { food: "avocado", grams: 50 }
    ]
  },

  {
    id: "chickpea-bowl",
    name: "Bowl pois chiches",
    emoji: "🥗",
    category: "lunch",
    servings: 1,
    prepTime: 10,
    difficulty: "easy",
    tags: ["vegetarian", "budget"],
    ingredients: [
      { food: "chickpeas", grams: 200 },
      { food: "tomato", grams: 100 },
      { food: "cucumber", grams: 100 },
      { food: "avocado", grams: 50 }
    ]
  }

];


/* =========================================================
   STORES
========================================================= */

const STORES = [

  {
    id: "continente",
    name: "Continente",
    country: "PT"
  },

  {
    id: "pingo_doce",
    name: "Pingo Doce",
    country: "PT"
  },

  {
    id: "lidl",
    name: "Lidl",
    country: "PT"
  },

  {
    id: "auchan",
    name: "Auchan",
    country: "PT"
  },

  {
    id: "carrefour",
    name: "Carrefour",
    country: "FR"
  },

  {
    id: "intermarche",
    name: "Intermarché",
    country: "FR"
  },

  {
    id: "leclerc",
    name: "E.Leclerc",
    country: "FR"
  }

];


/* =========================================================
   SHOPPING ITEMS
========================================================= */

const SHOPPING_ITEMS = [

  {
    id: "chicken",
    name: "Poulet",
    quantity: "1 kg",
    price: 8,
    unitPrice: 8,
    category: "meat"
  },

  {
    id: "turkey",
    name: "Escalopes de dinde",
    quantity: "500 g",
    price: 5,
    unitPrice: 10,
    category: "meat"
  },

  {
    id: "beef",
    name: "Bœuf haché 5%",
    quantity: "500 g",
    price: 6,
    unitPrice: 12,
    category: "meat"
  },

  {
    id: "rice",
    name: "Riz",
    quantity: "1 kg",
    price: 2,
    unitPrice: 2,
    category: "rice"
  },

  {
    id: "pasta",
    name: "Pâtes",
    quantity: "1 kg",
    price: 2,
    unitPrice: 2,
    category: "pasta"
  },

  {
    id: "tuna",
    name: "Thon",
    quantity: "4 boîtes",
    price: 5,
    category: "fish"
  },

  {
    id: "egg",
    name: "Œufs",
    quantity: "12",
    price: 3,
    category: "eggs"
  },

  {
    id: "potato",
    name: "Pommes de terre",
    quantity: "2 kg",
    price: 3,
    unitPrice: 1.5,
    category: "potatoes"
  },

  {
    id: "oats",
    name: "Flocons d’avoine",
    quantity: "500 g",
    price: 2,
    unitPrice: 4,
    category: "rice"
  },

  {
    id: "banana",
    name: "Bananes",
    quantity: "1 kg",
    price: 2,
    unitPrice: 2,
    category: "fruits"
  },

  {
    id: "apple",
    name: "Pommes",
    quantity: "1 kg",
    price: 2.5,
    unitPrice: 2.5,
    category: "fruits"
  },

  {
    id: "broccoli",
    name: "Brocoli",
    quantity: "500 g",
    price: 2,
    unitPrice: 4,
    category: "vegetables"
  },

  {
    id: "tomato",
    name: "Tomates",
    quantity: "1 kg",
    price: 3,
    unitPrice: 3,
    category: "vegetables"
  },

  {
    id: "carrot",
    name: "Carottes",
    quantity: "1 kg",
    price: 1.5,
    unitPrice: 1.5,
    category: "vegetables"
  },

  {
    id: "lentils",
    name: "Lentilles",
    quantity: "500 g",
    price: 1.5,
    unitPrice: 3,
    category: "legumes"
  },

  {
    id: "chickpeas",
    name: "Pois chiches",
    quantity: "500 g",
    price: 1.5,
    unitPrice: 3,
    category: "legumes"
  },

  {
    id: "milk",
    name: "Lait",
    quantity: "1 L",
    price: 1.5,
    unitPrice: 1.5,
    category: "dairy"
  },

  {
    id: "greek_yogurt",
    name: "Skyr",
    quantity: "4 pots",
    price: 3.5,
    category: "dairy"
  },

  {
    id: "cottage_cheese",
    name: "Fromage blanc 0%",
    quantity: "500 g",
    price: 2,
    unitPrice: 4,
    category: "dairy"
  },

  {
    id: "bread",
    name: "Pain",
    quantity: "500 g",
    price: 1.5,
    unitPrice: 3,
    category: "bread"
  },

  {
    id: "olive_oil",
    name: "Huile d’olive",
    quantity: "500 ml",
    price: 5,
    unitPrice: 10,
    category: "oils"
  },

  {
    id: "avocado",
    name: "Avocats",
    quantity: "2",
    price: 3,
    category: "fruits"
  },

  {
    id: "protein_powder",
    name: "Protéine en poudre",
    quantity: "1 kg",
    price: 30,
    unitPrice: 30,
    category: "protein"
  }

];


/* =========================================================
   USER PROFILE
========================================================= */

const DEFAULT_PROFILE = {

  personal: {

    firstName: "",
    lastName: "",

    age: null,

    birthDate: "",

    sex: "male",

    country: "PT",

    language: "fr"

  },


  body: {

    heightCm: null,

    currentWeightKg: null,

    startingWeightKg: null,

    targetWeightKg: null,

    bodyFatPercent: null,

    fatMassKg: null,

    leanMassKg: null,

    muscleMassKg: null,

    waterPercent: null,

    bmi: null

  },


  activity: {

    level: "moderate",

    trainingDaysPerWeek: 0,

    trainingMinutes: 60,

    trainingType: "Musculation",

    dailySteps: 0

  },


  goal: {

    type: "recomposition",

    calorieAdjustment: -200,

    targetRateKgPerWeek: 0.3

  },


  nutrition: {

    calorieTarget: null,

    proteinTarget: null,

    fatTarget: null,

    carbTarget: null,

    fiberTarget: 30,

    waterTargetMl: 2500

  },


  preferences: {

    dietType: "standard",

    favoriteFoods: [],

    dislikedFoods: [],

    excludedFoods: [],

    allergies: [],

    preferredMealsPerDay: 4,

    cookingTimeMaximum: 45,

    budgetPerWeek: 50

  }

};


/* =========================================================
   BODY MEASUREMENTS
========================================================= */

const DEFAULT_MEASUREMENTS = {

  neckCm: null,

  shouldersCm: null,

  chestCm: null,

  leftArmCm: null,

  rightArmCm: null,

  waistCm: null,

  bellyCm: null,

  hipsCm: null,

  leftThighCm: null,

  rightThighCm: null,

  leftCalfCm: null,

  rightCalfCm: null

};


/* =========================================================
   MEASUREMENT HISTORY
========================================================= */

const MEASUREMENT_HISTORY = [];


/* =========================================================
   WEIGHT HISTORY
========================================================= */

const WEIGHT_HISTORY = [];


/* =========================================================
   PROGRESS PHOTOS
========================================================= */

const PROGRESS_PHOTOS = [

  {
    id: "front",
    name: "Face",
    position: "front"
  },

  {
    id: "side",
    name: "Profil",
    position: "side"
  },

  {
    id: "back",
    name: "Dos",
    position: "back"
  }

];


/* =========================================================
   PANTRY
========================================================= */

const PANTRY = [];


/* =========================================================
   WEEKLY PLANNER DEFAULT
========================================================= */

const DEFAULT_WEEK_PLAN = {

  Lundi: {
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null
  },

  Mardi: {
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null
  },

  Mercredi: {
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null
  },

  Jeudi: {
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null
  },

  Vendredi: {
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null
  },

  Samedi: {
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null
  },

  Dimanche: {
    breakfast: null,
    lunch: null,
    snack: null,
    dinner: null
  }

};


/* =========================================================
   DAILY NUTRITION TRACKING
========================================================= */

const DAILY_NUTRITION = {

  calories: 0,

  protein: 0,

  carbs: 0,

  fat: 0,

  fiber: 0,

  waterMl: 0,

  mealsCompleted: 0,

  targetCalories: 0,

  targetProtein: 0,

  targetCarbs: 0,

  targetFat: 0

};


/* =========================================================
   STREAKS
========================================================= */

const STREAKS = {

  current: 0,

  best: 0,

  goalsCompleted: 0,

  daysTracked: 0,

  mealsTracked: 0,

  workoutsTracked: 0

};


/* =========================================================
   FAVORITES
========================================================= */

const FAVORITES = {

  foods: [],

  recipes: [],

  meals: []

};


/* =========================================================
   COACH SETTINGS
========================================================= */

const COACH_SETTINGS = {

  enabled: true,

  notifications: true,

  dailySummary: true,

  mealSuggestions: true,

  budgetWarnings: true,

  calorieWarnings: true,

  proteinWarnings: true,

  hydrationReminders: true

};


/* =========================================================
   COACH MESSAGES
========================================================= */

const COACH_MESSAGE_TYPES = [

  "calories",

  "protein",

  "carbs",

  "fat",

  "fiber",

  "hydration",

  "budget",

  "progress",

  "meal",

  "motivation"

];


/* =========================================================
   CALCULATION HELPERS
========================================================= */

function calculateFoodNutrition(foodId, grams) {

  const food = FOODS.find(item => item.id === foodId);

  if (!food) {

    return {

      kcal: 0,

      protein: 0,

      carbs: 0,

      fat: 0,

      fiber: 0

    };

  }

  const multiplier = Number(grams || 0) / 100;

  return {

    kcal: food.kcal * multiplier,

    protein: food.protein * multiplier,

    carbs: food.carbs * multiplier,

    fat: food.fat * multiplier,

    fiber: (food.fiber || 0) * multiplier

  };

}


/* =========================================================
   RECIPE NUTRITION
========================================================= */

function calculateRecipeNutrition(recipeId) {

  const recipe = RECIPES.find(item => item.id === recipeId);

  if (!recipe) return null;

  const totals = {

    kcal: 0,

    protein: 0,

    carbs: 0,

    fat: 0,

    fiber: 0

  };

  recipe.ingredients.forEach(ingredient => {

    const nutrition = calculateFoodNutrition(
      ingredient.food,
      ingredient.grams
    );

    totals.kcal += nutrition.kcal;

    totals.protein += nutrition.protein;

    totals.carbs += nutrition.carbs;

    totals.fat += nutrition.fat;

    totals.fiber += nutrition.fiber;

  });

  return totals;

}


/* =========================================================
   BMR — MIFflin St Jeor
========================================================= */

function calculateBMR(profile) {

  const weight = Number(profile.body.currentWeightKg);

  const height = Number(profile.body.heightCm);

  const age = Number(profile.personal.age);

  if (!weight || !height || !age) return 0;

  if (profile.personal.sex === "female") {

    return (
      10 * weight +
      6.25 * height -
      5 * age -
      161
    );

  }

  return (
    10 * weight +
    6.25 * height -
    5 * age +
    5
  );

}


/* =========================================================
   TDEE
========================================================= */

function calculateTDEE(profile) {

  const bmr = calculateBMR(profile);

  const activity = ACTIVITY_LEVELS.find(
    item => item.id === profile.activity.level
  );

  if (!activity) return bmr;

  return bmr * activity.multiplier;

}


/* =========================================================
   CALORIE TARGET
========================================================= */

function calculateCalorieTarget(profile) {

  const tdee = calculateTDEE(profile);

  const adjustment =
    Number(profile.goal.calorieAdjustment) || 0;

  return Math.max(1200, Math.round(tdee + adjustment));

}


/* =========================================================
   PROTEIN TARGET
========================================================= */

function calculateProteinTarget(profile) {

  const weight =
    Number(profile.body.currentWeightKg) || 0;

  if (!weight) return 0;

  switch (profile.goal.type) {

    case "cut":
      return Math.round(weight * 2.0);

    case "recomposition":
      return Math.round(weight * 2.0);

    case "bulk":
      return Math.round(weight * 1.8);

    case "maintenance":
      return Math.round(weight * 1.6);

    default:
      return Math.round(weight * 1.8);

  }

}


/* =========================================================
   FAT TARGET
========================================================= */

function calculateFatTarget(profile) {

  const weight =
    Number(profile.body.currentWeightKg) || 0;

  if (!weight) return 0;

  return Math.round(weight * 0.8);

}


/* =========================================================
   CARB TARGET
   Glucides = calories restantes
========================================================= */

function calculateCarbTarget(profile) {

  const calories =
    calculateCalorieTarget(profile);

  const protein =
    calculateProteinTarget(profile);

  const fat =
    calculateFatTarget(profile);

  const remainingCalories =
    calories -
    (protein * 4) -
    (fat * 9);

  return Math.max(
    0,
    Math.round(remainingCalories / 4)
  );

}


/* =========================================================
   MACRO CALORIE CHECK
========================================================= */

function calculateMacroCalories(
  protein,
  carbs,
  fat
) {

  return (
    protein * 4 +
    carbs * 4 +
    fat * 9
  );

}


/* =========================================================
   BMI
========================================================= */

function calculateBMI(weightKg, heightCm) {

  if (!weightKg || !heightCm) return 0;

  const heightM = heightCm / 100;

  return weightKg / (heightM * heightM);

}


/* =========================================================
   BODY COMPOSITION
========================================================= */

function calculateBodyComposition(
  weightKg,
  bodyFatPercent
) {

  if (
    !weightKg ||
    bodyFatPercent === null ||
    bodyFatPercent === undefined
  ) {

    return {

      fatMassKg: null,

      leanMassKg: null

    };

  }

  const fatMass =
    weightKg * (bodyFatPercent / 100);

  return {

    fatMassKg: fatMass,

    leanMassKg: weightKg - fatMass

  };

}


/* =========================================================
   DAILY TARGETS
========================================================= */

function calculateDailyTargets(profile) {

  const calories =
    calculateCalorieTarget(profile);

  const protein =
    calculateProteinTarget(profile);

  const fat =
    calculateFatTarget(profile);

  const carbs =
    calculateCarbTarget(profile);

  return {

    calories,

    protein,

    fat,

    carbs,

    fiber: 30,

    waterMl: 2500

  };

}


/* =========================================================
   SHOPPING CALCULATION
========================================================= */

function calculateShoppingNeeds(weekPlan) {

  const totals = {};

  Object.values(weekPlan).forEach(day => {

    Object.values(day).forEach(recipeId => {

      if (!recipeId) return;

      const recipe =
        RECIPES.find(item => item.id === recipeId);

      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {

        if (!totals[ingredient.food]) {

          totals[ingredient.food] = 0;

        }

        totals[ingredient.food] +=
          Number(ingredient.grams) || 0;

      });

    });

  });

  return totals;

}


/* =========================================================
   COST CALCULATION
========================================================= */

function calculateRecipeCost(recipeId) {

  const recipe =
    RECIPES.find(item => item.id === recipeId);

  if (!recipe) return 0;

  let total = 0;

  recipe.ingredients.forEach(ingredient => {

    const item =
      SHOPPING_ITEMS.find(
        product => product.id === ingredient.food
      );

    if (!item || !item.unitPrice) return;

    total +=
      (ingredient.grams / 1000) *
      item.unitPrice;

  });

  return total;

}


/* =========================================================
   NUTRITION GOAL STATUS
========================================================= */

function getNutritionStatus(
  current,
  target
) {

  if (!target) return "unknown";

  const ratio = current / target;

  if (ratio < 0.8) return "low";

  if (ratio <= 1.1) return "good";

  return "high";

}


/* =========================================================
   DEFAULT APP STATE
========================================================= */

const DEFAULT_APP_STATE = {

  profile: DEFAULT_PROFILE,

  measurements: DEFAULT_MEASUREMENTS,

  measurementHistory: MEASUREMENT_HISTORY,

  weightHistory: WEIGHT_HISTORY,

  progressPhotos: PROGRESS_PHOTOS,

  pantry: PANTRY,

  weekPlan: DEFAULT_WEEK_PLAN,

  dailyNutrition: DAILY_NUTRITION,

  streaks: STREAKS,

  favorites: FAVORITES,

  coach: COACH_SETTINGS,

  selectedDay: "Lundi",

  selectedMeal: "breakfast",

  onboardingCompleted: false

};


/* =========================================================
   EXPORT GLOBAL
========================================================= */

window.BudgetCookData = {

  APP_CONFIG,

  DAYS,

  MEAL_TYPES,

  FOOD_CATEGORIES,

  DIET_TYPES,

  GOALS,

  ACTIVITY_LEVELS,

  TRAINING_TYPES,

  ALLERGENS,

  FOODS,

  FOOD_PORTIONS,

  RECIPES,

  STORES,

  SHOPPING_ITEMS,

  DEFAULT_PROFILE,

  DEFAULT_MEASUREMENTS,

  MEASUREMENT_HISTORY,

  WEIGHT_HISTORY,

  PROGRESS_PHOTOS,

  PANTRY,

  DEFAULT_WEEK_PLAN,

  DAILY_NUTRITION,

  STREAKS,

  FAVORITES,

  COACH_SETTINGS,

  COACH_MESSAGE_TYPES,

  calculateFoodNutrition,

  calculateRecipeNutrition,

  calculateBMR,

  calculateTDEE,

  calculateCalorieTarget,

  calculateProteinTarget,

  calculateFatTarget,

  calculateCarbTarget,

  calculateMacroCalories,

  calculateBMI,

  calculateBodyComposition,

  calculateDailyTargets,

  calculateShoppingNeeds,

  calculateRecipeCost,

  getNutritionStatus,

  DEFAULT_APP_STATE

};
