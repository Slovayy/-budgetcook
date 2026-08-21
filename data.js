/* =========================================================
   BUDGETCOOK V4 — DATA.JS
   VERSION COMPLÈTE
   =========================================================
   Aliments
   Nutrition
   Recettes
   Repas
   Planning
   Courses
   Budget
   Garde-manger
   Profil
   Mensurations
   Objectifs
   Progression
   Coach
   Streaks
   Préférences
   Magasins
   Premium
   ========================================================= */


/* =========================================================
   APP CONFIG
========================================================= */

const APP_CONFIG = {

  name: "BudgetCook",
  version: "V4",

  currency: "€",

  defaultLanguage: "fr",

  defaultCountry: "Portugal",

  nutrition: {
    proteinCaloriesPerGram: 4,
    carbsCaloriesPerGram: 4,
    fatCaloriesPerGram: 9
  },

  planning: {
    daysPerWeek: 7,
    mealsPerDay: 4
  },

  goals: [
    "cut",
    "maintain",
    "bulk",
    "recomposition"
  ]

};


/* =========================================================
   PROFIL UTILISATEUR
========================================================= */

const DEFAULT_PROFILE = {

  personal: {

    firstName: "",

    age: 20,

    sex: "male",

    heightCm: 179,

    weightKg: 88

  },


  bodyMeasurements: {

    neckCm: null,

    shouldersCm: null,

    chestCm: null,

    waistCm: null,

    abdomenCm: null,

    hipsCm: null,

    leftArmCm: null,

    rightArmCm: null,

    leftThighCm: null,

    rightThighCm: null,

    leftCalfCm: null,

    rightCalfCm: null

  },


  bodyComposition: {

    bodyFatPercent: null,

    muscleMassKg: null,

    fatMassKg: null,

    leanMassKg: null

  },


  activity: {

    trainingDaysPerWeek: 5,

    activityLevel: "moderately_active",

    dailySteps: 8000

  },


  goal: {

    type: "recomposition",

    targetWeightKg: null,

    targetBodyFatPercent: null,

    weeklyWeightChangeKg: -0.4

  },


  nutrition: {

    calorieTarget: 2000,

    proteinTarget: null,

    fatTarget: null,

    carbsTarget: null

  },


  budget: {

    weeklyBudget: 50,

    monthlyBudget: 220

  },


  preferences: {

    mealsPerDay: 4,

    breakfast: true,

    snacks: true,

    vegetarian: false,

    vegan: false,

    lactoseFree: false,

    glutenFree: false,

    allergies: [],

    dislikedFoods: []

  }

};


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
    id: "lightly_active",
    name: "Légèrement actif",
    multiplier: 1.375
  },

  {
    id: "moderately_active",
    name: "Modérément actif",
    multiplier: 1.55
  },

  {
    id: "very_active",
    name: "Très actif",
    multiplier: 1.725
  },

  {
    id: "extremely_active",
    name: "Extrêmement actif",
    multiplier: 1.9
  }

];


/* =========================================================
   OBJECTIFS
========================================================= */

const GOALS = [

  {
    id: "cut",
    name: "Perte de graisse",
    emoji: "🔥",
    description: "Réduire le poids et le taux de masse grasse.",
    calorieAdjustment: -300
  },

  {
    id: "maintain",
    name: "Maintien",
    emoji: "⚖️",
    description: "Maintenir le poids actuel.",
    calorieAdjustment: 0
  },

  {
    id: "bulk",
    name: "Prise de masse",
    emoji: "💪",
    description: "Augmenter le poids et favoriser la prise musculaire.",
    calorieAdjustment: 250
  },

  {
    id: "recomposition",
    name: "Recomposition",
    emoji: "🔄",
    description: "Perdre du gras tout en favorisant le maintien ou le gain musculaire.",
    calorieAdjustment: -200
  }

];


/* =========================================================
   ALIMENTS
   Valeurs nutritionnelles pour 100 g/ml
========================================================= */

const FOODS = [

  {
    id: "chicken",
    name: "Poulet",
    category: "Viandes",
    emoji: "🍗",
    unit: "g",
    kcal: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6
  },

  {
    id: "turkey",
    name: "Escalope de dinde",
    category: "Viandes",
    emoji: "🦃",
    unit: "g",
    kcal: 114,
    protein: 24,
    carbs: 0,
    fat: 1.5
  },

  {
    id: "beef",
    name: "Bœuf haché 5%",
    category: "Viandes",
    emoji: "🥩",
    unit: "g",
    kcal: 137,
    protein: 21,
    carbs: 0,
    fat: 5
  },

  {
    id: "ham",
    name: "Jambon blanc",
    category: "Viandes",
    emoji: "🥩",
    unit: "g",
    kcal: 116,
    protein: 20,
    carbs: 1.5,
    fat: 3
  },

  {
    id: "tuna",
    name: "Thon au naturel",
    category: "Poissons",
    emoji: "🐟",
    unit: "g",
    kcal: 116,
    protein: 26,
    carbs: 0,
    fat: 1
  },

  {
    id: "salmon",
    name: "Saumon",
    category: "Poissons",
    emoji: "🐟",
    unit: "g",
    kcal: 208,
    protein: 20,
    carbs: 0,
    fat: 13
  },

  {
    id: "egg",
    name: "Œuf",
    category: "Œufs",
    emoji: "🥚",
    unit: "g",
    kcal: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5
  },

  {
    id: "rice",
    name: "Riz blanc cuit",
    category: "Féculents",
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
    category: "Féculents",
    emoji: "🍝",
    unit: "g",
    kcal: 158,
    protein: 5.8,
    carbs: 30.9,
    fat: 0.9
  },

  {
    id: "potato",
    name: "Pomme de terre",
    category: "Féculents",
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
    category: "Petit-déjeuner",
    emoji: "🥣",
    unit: "g",
    kcal: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9
  },

  {
    id: "bread",
    name: "Pain",
    category: "Féculents",
    emoji: "🍞",
    unit: "g",
    kcal: 265,
    protein: 9,
    carbs: 49,
    fat: 3.2
  },

  {
    id: "lentils",
    name: "Lentilles cuites",
    category: "Légumineuses",
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
    category: "Légumineuses",
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
    category: "Légumineuses",
    emoji: "🫘",
    unit: "g",
    kcal: 164,
    protein: 8.9,
    carbs: 27.4,
    fat: 2.6
  },

  {
    id: "banana",
    name: "Banane",
    category: "Fruits",
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
    category: "Fruits",
    emoji: "🍎",
    unit: "g",
    kcal: 52,
    protein: 0.3,
    carbs: 13.8,
    fat: 0.2
  },

  {
    id: "orange",
    name: "Orange",
    category: "Fruits",
    emoji: "🍊",
    unit: "g",
    kcal: 47,
    protein: 0.9,
    carbs: 11.8,
    fat: 0.1
  },

  {
    id: "strawberry",
    name: "Fraises",
    category: "Fruits",
    emoji: "🍓",
    unit: "g",
    kcal: 32,
    protein: 0.7,
    carbs: 7.7,
    fat: 0.3
  },

  {
    id: "avocado",
    name: "Avocat",
    category: "Fruits",
    emoji: "🥑",
    unit: "g",
    kcal: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7
  },

  {
    id: "tomato",
    name: "Tomate",
    category: "Légumes",
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
    category: "Légumes",
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
    category: "Légumes",
    emoji: "🥕",
    unit: "g",
    kcal: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2
  },

  {
    id: "cucumber",
    name: "Concombre",
    category: "Légumes",
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
    category: "Légumes",
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
    category: "Légumes",
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
    category: "Légumes",
    emoji: "🥬",
    unit: "g",
    kcal: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4
  },

  {
    id: "corn",
    name: "Maïs",
    category: "Légumes",
    emoji: "🌽",
    unit: "g",
    kcal: 86,
    protein: 3.2,
    carbs: 19,
    fat: 1.2
  },

  {
    id: "milk",
    name: "Lait demi-écrémé",
    category: "Produits laitiers",
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
    category: "Produits laitiers",
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
    category: "Produits laitiers",
    emoji: "🥣",
    unit: "g",
    kcal: 63,
    protein: 10.6,
    carbs: 3.9,
    fat: 0.2
  },

  {
    id: "cottage_cheese",
    name: "Fromage blanc 0%",
    category: "Produits laitiers",
    emoji: "🥛",
    unit: "g",
    kcal: 48,
    protein: 8,
    carbs: 4,
    fat: 0.2
  },

  {
    id: "cheese",
    name: "Emmental",
    category: "Produits laitiers",
    emoji: "🧀",
    unit: "g",
    kcal: 380,
    protein: 28,
    carbs: 0.5,
    fat: 29
  },

  {
    id: "peanut_butter",
    name: "Beurre de cacahuète",
    category: "Oléagineux",
    emoji: "🥜",
    unit: "g",
    kcal: 588,
    protein: 25,
    carbs: 20,
    fat: 50
  },

  {
    id: "olive_oil",
    name: "Huile d’olive",
    category: "Matières grasses",
    emoji: "🫒",
    unit: "g",
    kcal: 884,
    protein: 0,
    carbs: 0,
    fat: 100
  },

  {
    id: "protein_powder",
    name: "Protéine en poudre",
    category: "Compléments",
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
    category: "Déjeuner",
    prepTime: 15,
    cookTime: 20,
    servings: 1,
    difficulty: "facile",
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
    category: "Déjeuner",
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: "facile",
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
    category: "Déjeuner",
    prepTime: 10,
    cookTime: 25,
    servings: 1,
    difficulty: "facile",
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
    category: "Petit-déjeuner",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: "très facile",
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
    category: "Déjeuner",
    prepTime: 10,
    cookTime: 20,
    servings: 1,
    difficulty: "facile",
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
    category: "Déjeuner",
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: "facile",
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
    category: "Petit-déjeuner",
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    difficulty: "facile",
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
    category: "Déjeuner",
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    difficulty: "facile",
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
    category: "Déjeuner",
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: "facile",
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
    category: "Collation",
    prepTime: 3,
    cookTime: 0,
    servings: 1,
    difficulty: "très facile",
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
    category: "Déjeuner",
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    difficulty: "très facile",
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
    category: "Déjeuner",
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    difficulty: "facile",
    ingredients: [
      { food: "beef", grams: 180 },
      { food: "pasta", grams: 220 },
      { food: "tomato", grams: 150 }
    ]
  }

];


/* =========================================================
   TYPES DE REPAS
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
    emoji: "☀️"
  },

  {
    id: "snack",
    name: "Collation",
    emoji: "🍎"
  },

  {
    id: "dinner",
    name: "Dîner",
    emoji: "🌙"
  }

];


/* =========================================================
   PLANNING HEBDOMADAIRE
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
   COURSES
========================================================= */

const SHOPPING_ITEMS = [

  {
    id: "chicken",
    name: "Poulet",
    quantity: "1 kg",
    price: 8,
    category: "Viandes"
  },

  {
    id: "turkey",
    name: "Escalopes de dinde",
    quantity: "500 g",
    price: 5,
    category: "Viandes"
  },

  {
    id: "beef",
    name: "Bœuf haché 5%",
    quantity: "500 g",
    price: 6,
    category: "Viandes"
  },

  {
    id: "rice",
    name: "Riz",
    quantity: "1 kg",
    price: 2,
    category: "Féculents"
  },

  {
    id: "pasta",
    name: "Pâtes",
    quantity: "1 kg",
    price: 2,
    category: "Féculents"
  },

  {
    id: "tuna",
    name: "Thon",
    quantity: "4 boîtes",
    price: 5,
    category: "Poissons"
  },

  {
    id: "egg",
    name: "Œufs",
    quantity: "12",
    price: 3,
    category: "Œufs"
  },

  {
    id: "potato",
    name: "Pommes de terre",
    quantity: "2 kg",
    price: 3,
    category: "Féculents"
  },

  {
    id: "oats",
    name: "Flocons d’avoine",
    quantity: "500 g",
    price: 2,
    category: "Petit-déjeuner"
  },

  {
    id: "banana",
    name: "Bananes",
    quantity: "1 kg",
    price: 2,
    category: "Fruits"
  },

  {
    id: "apple",
    name: "Pommes",
    quantity: "1 kg",
    price: 2.5,
    category: "Fruits"
  },

  {
    id: "broccoli",
    name: "Brocoli",
    quantity: "500 g",
    price: 2,
    category: "Légumes"
  },

  {
    id: "tomato",
    name: "Tomates",
    quantity: "1 kg",
    price: 3,
    category: "Légumes"
  },

  {
    id: "carrot",
    name: "Carottes",
    quantity: "1 kg",
    price: 1.5,
    category: "Légumes"
  },

  {
    id: "lentils",
    name: "Lentilles",
    quantity: "500 g",
    price: 1.5,
    category: "Légumineuses"
  },

  {
    id: "chickpeas",
    name: "Pois chiches",
    quantity: "500 g",
    price: 1.5,
    category: "Légumineuses"
  },

  {
    id: "milk",
    name: "Lait",
    quantity: "1 L",
    price: 1.5,
    category: "Produits laitiers"
  },

  {
    id: "greek_yogurt",
    name: "Skyr",
    quantity: "4 pots",
    price: 3.5,
    category: "Produits laitiers"
  },

  {
    id: "cottage_cheese",
    name: "Fromage blanc 0%",
    quantity: "500 g",
    price: 2,
    category: "Produits laitiers"
  },

  {
    id: "bread",
    name: "Pain",
    quantity: "500 g",
    price: 1.5,
    category: "Féculents"
  },

  {
    id: "olive_oil",
    name: "Huile d’olive",
    quantity: "500 ml",
    price: 5,
    category: "Matières grasses"
  },

  {
    id: "avocado",
    name: "Avocats",
    quantity: "2",
    price: 3,
    category: "Fruits"
  }

];


/* =========================================================
   GARDE-MANGER
========================================================= */

const DEFAULT_PANTRY = [];


/* =========================================================
   MAGASINS
========================================================= */

const STORES = [

  {
    id: "generic",
    name: "Magasin préféré",
    country: "Portugal",
    currency: "€"
  },

  {
    id: "continente",
    name: "Continente",
    country: "Portugal",
    currency: "€"
  },

  {
    id: "pingo-doce",
    name: "Pingo Doce",
    country: "Portugal",
    currency: "€"
  },

  {
    id: "lidl",
    name: "Lidl",
    country: "Portugal",
    currency: "€"
  },

  {
    id: "aldi",
    name: "ALDI",
    country: "Portugal",
    currency: "€"
  }

];


/* =========================================================
   PROGRESSION
========================================================= */

const DEFAULT_PROGRESS = {

  weightHistory: [],

  bodyFatHistory: [],

  measurementsHistory: [],

  photos: [],

  strengthHistory: [],

  calorieHistory: [],

  proteinHistory: [],

  weeklySummary: []

};


/* =========================================================
   STREAKS
========================================================= */

const DEFAULT_STREAKS = {

  current: 0,

  best: 0,

  totalDays: 0,

  objectives: {

    calorieTarget: false,

    proteinTarget: false,

    waterTarget: false,

    stepsTarget: false,

    workoutCompleted: false,

    mealPlanCompleted: false

  }

};


/* =========================================================
   OBJECTIFS QUOTIDIENS
========================================================= */

const DAILY_TARGETS = {

  waterLiters: 2.5,

  steps: 8000,

  caloriesTolerance: 100,

  proteinTolerance: 10,

  vegetablesPortions: 3,

  fruitPortions: 2

};


/* =========================================================
   COACH
========================================================= */

const COACH_MESSAGES = {

  lowProtein: [

    "Ta journée manque un peu de protéines.",

    "Ajoute une source de protéines maigres à ton prochain repas.",

    "Un skyr, du poulet, du thon ou des œufs peuvent facilement compléter ta journée."

  ],

  caloriesLow: [

    "Tu es assez loin de ton objectif calorique aujourd’hui.",

    "Tu peux encore ajouter un repas ou une collation sans dépasser ton objectif."

  ],

  caloriesHigh: [

    "Tu approches de ton objectif calorique.",

    "Privilégie une source de protéines et des légumes pour terminer la journée."

  ],

  hydration: [

    "Pense à boire régulièrement.",

    "Une bonne hydratation aide à maintenir de bonnes habitudes alimentaires."

  ],

  motivation: [

    "Une journée imparfaite ne ruine absolument pas ta progression.",

    "La régularité compte beaucoup plus qu'une journée parfaite.",

    "Continue simplement ton plan aujourd’hui."

  ]

};


/* =========================================================
   NOTIFICATIONS
========================================================= */

const NOTIFICATION_SETTINGS = {

  mealReminder: true,

  shoppingReminder: true,

  weighInReminder: true,

  hydrationReminder: true,

  weeklySummary: true,

  streakReminder: true

};


/* =========================================================
   APP SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

  theme: "dark",

  language: "fr",

  units: "metric",

  currency: "EUR",

  notifications: true,

  animations: true,

  sound: false,

  autoSave: true

};


/* =========================================================
   PREMIUM
========================================================= */

const PREMIUM_FEATURES = [

  {
    id: "advanced_coach",
    name: "Coach nutrition avancé"
  },

  {
    id: "smart_planner",
    name: "Planning intelligent"
  },

  {
    id: "budget_optimizer",
    name: "Optimisation du budget"
  },

  {
    id: "store_comparison",
    name: "Comparaison des magasins"
  },

  {
    id: "advanced_progress",
    name: "Suivi avancé de progression"
  },

  {
    id: "unlimited_recipes",
    name: "Recettes illimitées"
  },

  {
    id: "advanced_macros",
    name: "Calcul avancé des macros"
  },

  {
    id: "custom_meals",
    name: "Repas personnalisés"
  }

];


/* =========================================================
   LOCAL STORAGE KEYS
========================================================= */

const STORAGE_KEYS = {

  profile: "budgetcook_profile",

  weekPlan: "budgetcook_week_plan",

  pantry: "budgetcook_pantry",

  progress: "budgetcook_progress",

  streaks: "budgetcook_streaks",

  settings: "budgetcook_settings",

  shopping: "budgetcook_shopping",

  favorites: "budgetcook_favorites"

};


/* =========================================================
   EXPORT GLOBAL
========================================================= */

const BUDGETCOOK_DATA = {

  APP_CONFIG,

  DEFAULT_PROFILE,

  ACTIVITY_LEVELS,

  GOALS,

  FOODS,

  RECIPES,

  MEAL_TYPES,

  DAYS,

  DEFAULT_WEEK_PLAN,

  SHOPPING_ITEMS,

  DEFAULT_PANTRY,

  STORES,

  DEFAULT_PROGRESS,

  DEFAULT_STREAKS,

  DAILY_TARGETS,

  COACH_MESSAGES,

  NOTIFICATION_SETTINGS,

  DEFAULT_SETTINGS,

  PREMIUM_FEATURES,

  STORAGE_KEYS

};


/* =========================================================
   COMPATIBILITÉ
========================================================= */

if (typeof window !== "undefined") {

  window.BUDGETCOOK_DATA = BUDGETCOOK_DATA;

  window.FOODS = FOODS;

  window.RECIPES = RECIPES;

  window.SHOPPING_ITEMS = SHOPPING_ITEMS;

  window.DAYS = DAYS;

  window.GOALS = GOALS;

  window.DEFAULT_PROFILE = DEFAULT_PROFILE;

}
