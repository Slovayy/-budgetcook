/* =========================================================
   BUDGETCOOK V4 — DATA.JS
   DATA CENTRAL COMPLÈTE
   ---------------------------------------------------------
   Profil • Mensurations • Objectifs • Calories • Macros
   Aliments • Recettes • Courses • Budget • Jours
   Garde-manger • Progression • Coach • Streaks
   Paramètres • Historique • Magasins
========================================================= */


/* =========================================================
   VERSION / CONFIG
========================================================= */

const APP_DATA = {
  version: "4.0.0",
  appName: "BudgetCook V4",
  currency: "EUR",
  language: "fr-FR",

  nutrition: {
    proteinCaloriesPerGram: 4,
    carbsCaloriesPerGram: 4,
    fatCaloriesPerGram: 9,

    defaultProteinPerKg: 2.0,
    defaultFatPerKg: 0.8,

    minProteinPerKg: 1.6,
    maxProteinPerKg: 2.4,

    minFatPerKg: 0.6,
    maxFatPerKg: 1.2
  },

  planning: {
    daysPerWeek: 7,
    mealsPerDay: 4
  }
};


/* =========================================================
   PROFIL UTILISATEUR
========================================================= */

const USER_PROFILE = {

  firstName: "",
  age: 20,
  sex: "male",

  heightCm: 179,
  weightKg: 88,

  /* Activité */
  activityLevel: "active",
  trainingDaysPerWeek: 5,

  /* Objectif */
  goal: "cut",

  /* Déficit / surplus */
  calorieAdjustment: -300,

  /* Budget */
  weeklyBudget: 50,
  monthlyBudget: 220,

  /* Préférences */
  diet: "omnivore",
  mealsPerDay: 4,

  /* Aliments */
  excludedFoods: [],
  allergies: [],
  favoriteFoods: [],

  /* Unités */
  weightUnit: "kg",
  heightUnit: "cm",

  /* Données calculées */
  calculated: {
    bmi: null,
    bmr: null,
    tdee: null,
    targetCalories: null,

    proteinGrams: null,
    fatGrams: null,
    carbsGrams: null,

    proteinCalories: null,
    fatCalories: null,
    carbsCalories: null
  }
};


/* =========================================================
   MENSURATIONS
========================================================= */

const BODY_MEASUREMENTS = {

  date: null,

  weightKg: 88,

  waistCm: null,
  abdomenCm: null,
  hipsCm: null,

  chestCm: null,
  shouldersCm: null,

  leftArmCm: null,
  rightArmCm: null,

  leftThighCm: null,
  rightThighCm: null,

  leftCalfCm: null,
  rightCalfCm: null,

  neckCm: null,

  bodyFatPercent: null,

  notes: ""
};


/* =========================================================
   HISTORIQUE DES MENSURATIONS
========================================================= */

const MEASUREMENTS_HISTORY = [];


/* =========================================================
   OBJECTIFS
========================================================= */

const GOALS = {

  primary: "fat_loss",

  targetWeightKg: null,
  targetBodyFatPercent: null,

  targetWaistCm: null,

  weeklyWeightLossKg: 0.5,

  dailyCaloriesAdjustment: -300,

  targetDate: null,

  muscleGain: true,
  preserveMuscle: true,

  stepsPerDay: 8000,

  waterLitersPerDay: 2.5,

  sleepHoursPerNight: 8
};


/* =========================================================
   CALCULATEUR NUTRITION
========================================================= */

const CALORIE_CALCULATOR = {

  formula: "Mifflin-St Jeor",

  activityMultipliers: {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    active: 1.725,
    very_active: 1.9
  },

  calculateBMR(profile) {

    if (!profile) return 0;

    const weight = Number(profile.weightKg) || 0;
    const height = Number(profile.heightCm) || 0;
    const age = Number(profile.age) || 0;

    if (profile.sex === "female") {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  },

  calculateTDEE(profile) {

    const bmr = this.calculateBMR(profile);

    const multiplier =
      this.activityMultipliers[profile.activityLevel] || 1.55;

    return bmr * multiplier;
  },

  calculateTargetCalories(profile) {

    const tdee = this.calculateTDEE(profile);

    const adjustment =
      Number(profile.calorieAdjustment) || 0;

    return Math.max(1200, tdee + adjustment);
  },

  calculateMacros(profile) {

    const calories = this.calculateTargetCalories(profile);

    const weight = Number(profile.weightKg) || 0;

    /* Protéines */
    const proteinPerKg =
      APP_DATA.nutrition.defaultProteinPerKg;

    const protein =
      weight * proteinPerKg;

    /* Lipides */
    const fatPerKg =
      APP_DATA.nutrition.defaultFatPerKg;

    const fat =
      weight * fatPerKg;

    /*
      Calories utilisées par protéines + lipides
    */

    const proteinCalories =
      protein * APP_DATA.nutrition.proteinCaloriesPerGram;

    const fatCalories =
      fat * APP_DATA.nutrition.fatCaloriesPerGram;

    /*
      Glucides = calories restantes
    */

    const remainingCalories =
      calories - proteinCalories - fatCalories;

    const carbs =
      Math.max(
        0,
        remainingCalories /
        APP_DATA.nutrition.carbsCaloriesPerGram
      );

    return {

      calories: Math.round(calories),

      protein: Math.round(protein),

      fat: Math.round(fat),

      carbs: Math.round(carbs),

      proteinCalories:
        Math.round(proteinCalories),

      fatCalories:
        Math.round(fatCalories),

      carbsCalories:
        Math.round(carbs * 4)
    };
  }
};


/* =========================================================
   ALIMENTS
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
    fat: 3.6,
    fiber: 0,
    pricePerKg: 8
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
    fat: 1.5,
    fiber: 0,
    pricePerKg: 10
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
    fat: 5,
    fiber: 0,
    pricePerKg: 12
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
    fat: 3,
    fiber: 0,
    pricePerKg: 12
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
    fat: 13,
    fiber: 0,
    pricePerKg: 20
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
    fat: 1,
    fiber: 0,
    pricePerKg: 12
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
    fat: 9.5,
    fiber: 0,
    pricePerKg: 5
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
    fat: 0.3,
    fiber: 0.4,
    pricePerKg: 2
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
    fat: 0.9,
    fiber: 1.8,
    pricePerKg: 2
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
    fat: 0.1,
    fiber: 2.2,
    pricePerKg: 1.5
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
    fat: 6.9,
    fiber: 10.6,
    pricePerKg: 4
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
    fat: 3.2,
    fiber: 2.7,
    pricePerKg: 3
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
    fat: 0.3,
    fiber: 2.6,
    pricePerKg: 2
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
    fat: 0.2,
    fiber: 2.4,
    pricePerKg: 2.5
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
    fat: 0.1,
    fiber: 2.4,
    pricePerKg: 2.2
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
    fat: 0.3,
    fiber: 2,
    pricePerKg: 5
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
    fat: 14.7,
    fiber: 6.7,
    pricePerKg: 6
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
    fat: 1.6,
    fiber: 0,
    pricePerLiter: 1.5
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
    fat: 3.3,
    fiber: 0,
    pricePerKg: 4
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
    fat: 0.2,
    fiber: 0,
    pricePerKg: 7
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
    fat: 0.2,
    fiber: 0,
    pricePerKg: 4
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
    fat: 29,
    fiber: 0,
    pricePerKg: 12
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
    fat: 50,
    fiber: 6,
    pricePerKg: 8
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
    fat: 100,
    fiber: 0,
    pricePerKg: 10
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
    fat: 0.2,
    fiber: 1.2,
    pricePerKg: 3
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
    fat: 0.4,
    fiber: 2.6,
    pricePerKg: 4
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
    fat: 0.2,
    fiber: 2.8,
    pricePerKg: 1.5
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
    fat: 0.1,
    fiber: 0.5,
    pricePerKg: 2
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
    fat: 0.1,
    fiber: 1.7,
    pricePerKg: 1.5
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
    fat: 0.2,
    fiber: 3.4,
    pricePerKg: 4
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
    fat: 0.4,
    fiber: 2.2,
    pricePerKg: 5
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
    fat: 1.2,
    fiber: 2.7,
    pricePerKg: 3
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
    fat: 0.4,
    fiber: 7.9,
    pricePerKg: 3
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
    fat: 0.5,
    fiber: 6.4,
    pricePerKg: 3
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
    fat: 2.6,
    fiber: 7.6,
    pricePerKg: 3
  },

  {
    id: "protein_powder",
    name: "Protéine en poudre",
    category: "Suppléments",
    emoji: "🥤",
    unit: "g",
    kcal: 400,
    protein: 80,
    carbs: 8,
    fat: 6,
    fiber: 0,
    pricePerKg: 25
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
    prepTime: 20,
    difficulty: "facile",
    servings: 1,

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
    prepTime: 15,
    difficulty: "facile",
    servings: 1,

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
    prepTime: 25,
    difficulty: "facile",
    servings: 1,

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
    difficulty: "facile",
    servings: 1,

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
    category: "Dîner",
    prepTime: 25,
    difficulty: "facile",
    servings: 1,

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
    prepTime: 20,
    difficulty: "facile",
    servings: 1,

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
    prepTime: 10,
    difficulty: "facile",
    servings: 1,

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
    prepTime: 15,
    difficulty: "facile",
    servings: 1,

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
    prepTime: 20,
    difficulty: "facile",
    servings: 1,

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
    difficulty: "facile",
    servings: 1,

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
    prepTime: 10,
    difficulty: "facile",
    servings: 1,

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
    prepTime: 20,
    difficulty: "facile",
    servings: 1,

    ingredients: [
      { food: "beef", grams: 180 },
      { food: "pasta", grams: 220 },
      { food: "tomato", grams: 150 }
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
    category: "Viandes",
    quantity: "1 kg",
    price: 8
  },

  {
    id: "turkey",
    name: "Escalopes de dinde",
    category: "Viandes",
    quantity: "500 g",
    price: 5
  },

  {
    id: "beef",
    name: "Bœuf haché 5%",
    category: "Viandes",
    quantity: "500 g",
    price: 6
  },

  {
    id: "rice",
    name: "Riz",
    category: "Féculents",
    quantity: "1 kg",
    price: 2
  },

  {
    id: "pasta",
    name: "Pâtes",
    category: "Féculents",
    quantity: "1 kg",
    price: 2
  },

  {
    id: "tuna",
    name: "Thon",
    category: "Poissons",
    quantity: "4 boîtes",
    price: 5
  },

  {
    id: "egg",
    name: "Œufs",
    category: "Œufs",
    quantity: "12",
    price: 3
  },

  {
    id: "potato",
    name: "Pommes de terre",
    category: "Féculents",
    quantity: "2 kg",
    price: 3
  },

  {
    id: "oats",
    name: "Flocons d’avoine",
    category: "Petit-déjeuner",
    quantity: "500 g",
    price: 2
  },

  {
    id: "banana",
    name: "Bananes",
    category: "Fruits",
    quantity: "1 kg",
    price: 2
  },

  {
    id: "apple",
    name: "Pommes",
    category: "Fruits",
    quantity: "1 kg",
    price: 2.5
  },

  {
    id: "broccoli",
    name: "Brocoli",
    category: "Légumes",
    quantity: "500 g",
    price: 2
  },

  {
    id: "tomato",
    name: "Tomates",
    category: "Légumes",
    quantity: "1 kg",
    price: 3
  },

  {
    id: "carrot",
    name: "Carottes",
    category: "Légumes",
    quantity: "1 kg",
    price: 1.5
  },

  {
    id: "lentils",
    name: "Lentilles",
    category: "Légumineuses",
    quantity: "500 g",
    price: 1.5
  },

  {
    id: "chickpeas",
    name: "Pois chiches",
    category: "Légumineuses",
    quantity: "500 g",
    price: 1.5
  },

  {
    id: "milk",
    name: "Lait",
    category: "Produits laitiers",
    quantity: "1 L",
    price: 1.5
  },

  {
    id: "greek_yogurt",
    name: "Skyr",
    category: "Produits laitiers",
    quantity: "4 pots",
    price: 3.5
  },

  {
    id: "cottage_cheese",
    name: "Fromage blanc 0%",
    category: "Produits laitiers",
    quantity: "500 g",
    price: 2
  },

  {
    id: "bread",
    name: "Pain",
    category: "Féculents",
    quantity: "500 g",
    price: 1.5
  },

  {
    id: "olive_oil",
    name: "Huile d’olive",
    category: "Matières grasses",
    quantity: "500 ml",
    price: 5
  },

  {
    id: "avocado",
    name: "Avocats",
    category: "Fruits",
    quantity: "2",
    price: 3
  }
];


/* =========================================================
   MAGASINS
========================================================= */

const STORES = [

  {
    id: "generic",
    name: "Prix moyen",
    location: "Portugal",
    currency: "EUR"
  },

  {
    id: "continente",
    name: "Continente",
    location: "Portugal",
    currency: "EUR"
  },

  {
    id: "pingo-doce",
    name: "Pingo Doce",
    location: "Portugal",
    currency: "EUR"
  },

  {
    id: "lidl",
    name: "Lidl",
    location: "Portugal",
    currency: "EUR"
  },

  {
    id: "aldi",
    name: "Aldi",
    location: "Portugal",
    currency: "EUR"
  },

  {
    id: "mercadona",
    name: "Mercadona",
    location: "Portugal",
    currency: "EUR"
  }
];


/* =========================================================
   GARDE-MANGER
========================================================= */

const PANTRY = [];


/* =========================================================
   PLANIFICATION DES REPAS
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


const WEEK_PLAN = {

  weekStart: null,

  days: DAYS.map(day => ({

    day,

    meals: {
      breakfast: null,
      lunch: null,
      snack: null,
      dinner: null
    },

    totals: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }

  }))
};


/* =========================================================
   JOURNAL ALIMENTAIRE
========================================================= */

const FOOD_LOG = [];


/* =========================================================
   HISTORIQUE CALORIES / MACROS
========================================================= */

const NUTRITION_HISTORY = [];


/* =========================================================
   PROGRESSION
========================================================= */

const PROGRESS = {

  currentWeight: null,
  startingWeight: null,

  lowestWeight: null,
  highestWeight: null,

  weightLost: 0,

  bodyFat: null,

  waist: null,

  streak: 0,
  bestStreak: 0,

  totalDaysTracked: 0,

  caloriesAverage: 0,
  proteinAverage: 0,

  lastUpdated: null
};


/* =========================================================
   STREAKS / OBJECTIFS QUOTIDIENS
========================================================= */

const STREAKS = {

  current: 0,
  best: 0,

  objectives: {

    calories: false,
    protein: false,
    water: false,
    steps: false,
    workout: false,
    foodLogging: false
  }
};


/* =========================================================
   EAU
========================================================= */

const WATER_TRACKER = {

  dailyTargetLiters: 2.5,

  currentLiters: 0,

  glasses: 0,

  glassSizeMl: 250
};


/* =========================================================
   ACTIVITÉ
========================================================= */

const ACTIVITY_TRACKER = {

  dailyStepGoal: 8000,

  currentSteps: 0,

  workoutsThisWeek: 0,

  workoutGoalPerWeek: 5,

  caloriesBurned: 0
};


/* =========================================================
   ENTRAÎNEMENTS
========================================================= */

const WORKOUT_HISTORY = [];


/* =========================================================
   BUDGET
========================================================= */

const BUDGET = {

  weeklyLimit: 50,

  monthlyLimit: 220,

  currentWeekSpent: 0,

  currentMonthSpent: 0,

  currency: "EUR",

  alerts: {

    enabled: true,

    thresholdPercent: 80
  }
};


/* =========================================================
   HISTORIQUE DES DÉPENSES
========================================================= */

const EXPENSE_HISTORY = [];


/* =========================================================
   COACH
========================================================= */

const COACH = {

  enabled: true,

  personality: "friendly",

  messages: [],

  recommendations: [],

  dailyTips: [

    "Pense à boire régulièrement dans la journée 💧",

    "Une source de protéines à chaque repas peut faciliter l’atteinte de ton objectif 💪",

    "Les légumes permettent d’augmenter le volume des repas sans exploser les calories 🥦",

    "Préparer plusieurs portions à l’avance peut aider à respecter ton budget 🛒",

    "Le poids peut varier d’un jour à l’autre : regarde surtout la tendance 📈"
  ]
};


/* =========================================================
   OBJECTIFS / BADGES
========================================================= */

const ACHIEVEMENTS = [

  {
    id: "first_day",
    name: "Premier jour",
    description: "Enregistrer ton premier jour",
    icon: "🌱",
    unlocked: false
  },

  {
    id: "7_days",
    name: "7 jours",
    description: "Suivre ton alimentation pendant 7 jours",
    icon: "🔥",
    unlocked: false
  },

  {
    id: "30_days",
    name: "30 jours",
    description: "Suivre ton alimentation pendant 30 jours",
    icon: "🏆",
    unlocked: false
  },

  {
    id: "protein_goal",
    name: "Objectif protéines",
    description: "Atteindre ton objectif de protéines",
    icon: "💪",
    unlocked: false
  },

  {
    id: "budget_master",
    name: "Budget maîtrisé",
    description: "Respecter ton budget hebdomadaire",
    icon: "💰",
    unlocked: false
  },

  {
    id: "meal_planner",
    name: "Planificateur",
    description: "Créer une semaine complète",
    icon: "📅",
    unlocked: false
  }
];


/* =========================================================
   PRÉFÉRENCES APPLICATION
========================================================= */

const APP_SETTINGS = {

  theme: "dark",

  language: "fr",

  notifications: true,

  reminderMeal: true,

  reminderWater: true,

  reminderWeight: true,

  notificationTime: "20:00",

  firstDayOfWeek: "monday",

  decimals: 1,

  showCalories: true,

  showMacros: true,

  showFiber: true,

  showBudget: true,

  autoSave: true
};


/* =========================================================
   FILTRES RECETTES
========================================================= */

const RECIPE_FILTERS = {

  search: "",

  category: "all",

  maxCalories: null,

  minProtein: null,

  maxPrice: null,

  maxTime: null,

  difficulty: "all",

  favoriteOnly: false
};


/* =========================================================
   FAVORIS
========================================================= */

const FAVORITES = {

  foods: [],

  recipes: [],

  meals: []
};


/* =========================================================
   LISTE DE COURSES ACTIVE
========================================================= */

const ACTIVE_SHOPPING_LIST = {

  items: [],

  totalEstimatedPrice: 0,

  completedItems: [],

  lastUpdated: null
};


/* =========================================================
   CALCUL NUTRITION D'UN ALIMENT
========================================================= */

function calculateFoodNutrition(foodId, grams) {

  const food = FOODS.find(
    item => item.id === foodId
  );

  if (!food) {

    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }

  const amount =
    Number(grams) || 0;

  const factor =
    amount / 100;

  return {

    calories:
      food.kcal * factor,

    protein:
      food.protein * factor,

    carbs:
      food.carbs * factor,

    fat:
      food.fat * factor,

    fiber:
      (food.fiber || 0) * factor
  };
}


/* =========================================================
   CALCUL D'UNE RECETTE
========================================================= */

function calculateRecipeNutrition(recipeId) {

  const recipe =
    RECIPES.find(
      item => item.id === recipeId
    );

  if (!recipe) {

    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }

  const total = {

    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };

  recipe.ingredients.forEach(
    ingredient => {

      const nutrition =
        calculateFoodNutrition(
          ingredient.food,
          ingredient.grams
        );

      total.calories += nutrition.calories;
      total.protein += nutrition.protein;
      total.carbs += nutrition.carbs;
      total.fat += nutrition.fat;
      total.fiber += nutrition.fiber;
    }
  );

  return total;
}


/* =========================================================
   CALCUL D'UN REPAS
========================================================= */

function calculateMealNutrition(meal) {

  if (!meal) {

    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }

  if (meal.recipeId) {

    return calculateRecipeNutrition(
      meal.recipeId
    );
  }

  if (meal.foodId) {

    return calculateFoodNutrition(
      meal.foodId,
      meal.grams
    );
  }

  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };
}


/* =========================================================
   CALCUL D'UNE JOURNÉE
========================================================= */

function calculateDayNutrition(dayPlan) {

  const total = {

    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };

  if (!dayPlan || !dayPlan.meals) {
    return total;
  }

  Object.values(dayPlan.meals).forEach(
    meal => {

      const nutrition =
        calculateMealNutrition(meal);

      total.calories += nutrition.calories;
      total.protein += nutrition.protein;
      total.carbs += nutrition.carbs;
      total.fat += nutrition.fat;
      total.fiber += nutrition.fiber;
    }
  );

  return total;
}


/* =========================================================
   CALCUL PRIX ALIMENT
========================================================= */

function calculateFoodPrice(foodId, grams) {

  const food =
    FOODS.find(
      item => item.id === foodId
    );

  if (!food) return 0;

  const amount =
    Number(grams) || 0;

  if (food.pricePerKg) {

    return (
      amount /
      1000
    ) * food.pricePerKg;
  }

  if (food.pricePerLiter) {

    return (
      amount /
      1000
    ) * food.pricePerLiter;
  }

  return 0;
}


/* =========================================================
   CALCUL PRIX RECETTE
========================================================= */

function calculateRecipePrice(recipeId) {

  const recipe =
    RECIPES.find(
      item => item.id === recipeId
    );

  if (!recipe) return 0;

  return recipe.ingredients.reduce(
    (total, ingredient) => {

      return total +
        calculateFoodPrice(
          ingredient.food,
          ingredient.grams
        );

    },
    0
  );
}


/* =========================================================
   CALCUL IMC
========================================================= */

function calculateBMI(weightKg, heightCm) {

  const weight =
    Number(weightKg);

  const height =
    Number(heightCm) / 100;

  if (!weight || !height) {
    return 0;
  }

  return weight /
    (height * height);
}


/* =========================================================
   CATÉGORIES
========================================================= */

const FOOD_CATEGORIES = [

  "Toutes",

  "Viandes",

  "Poissons",

  "Œufs",

  "Féculents",

  "Légumes",

  "Fruits",

  "Produits laitiers",

  "Légumineuses",

  "Oléagineux",

  "Matières grasses",

  "Petit-déjeuner",

  "Suppléments"
];


/* =========================================================
   NIVEAUX D'ACTIVITÉ
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
   OBJECTIFS DISPONIBLES
========================================================= */

const GOAL_TYPES = [

  {
    id: "cut",
    name: "Perte de graisse",
    calorieAdjustment: -300
  },

  {
    id: "maintenance",
    name: "Maintien",
    calorieAdjustment: 0
  },

  {
    id: "lean_bulk",
    name: "Prise de muscle",
    calorieAdjustment: 200
  },

  {
    id: "bulk",
    name: "Prise de masse",
    calorieAdjustment: 300
  }
];


/* =========================================================
   INITIALISATION DES CALCULS
========================================================= */

function initializeUserNutrition() {

  const profile =
    USER_PROFILE;

  const bmr =
    CALORIE_CALCULATOR
      .calculateBMR(profile);

  const tdee =
    CALORIE_CALCULATOR
      .calculateTDEE(profile);

  const targetCalories =
    CALORIE_CALCULATOR
      .calculateTargetCalories(profile);

  const macros =
    CALORIE_CALCULATOR
      .calculateMacros(profile);

  profile.calculated = {

    bmi:
      calculateBMI(
        profile.weightKg,
        profile.heightCm
      ),

    bmr:
      Math.round(bmr),

    tdee:
      Math.round(tdee),

    targetCalories:
      macros.calories,

    proteinGrams:
      macros.protein,

    fatGrams:
      macros.fat,

    carbsGrams:
      macros.carbs,

    proteinCalories:
      macros.proteinCalories,

    fatCalories:
      macros.fatCalories,

    carbsCalories:
      macros.carbsCalories
  };

  return profile.calculated;
}


/* =========================================================
   EXPORT GLOBAL
   ---------------------------------------------------------
   Permet aux autres fichiers JS de retrouver toutes
   les données même si le projet n'utilise pas de modules.
========================================================= */

window.BudgetCookData = {

  APP_DATA,

  USER_PROFILE,
  BODY_MEASUREMENTS,
  MEASUREMENTS_HISTORY,

  GOALS,
  CALORIE_CALCULATOR,

  FOODS,
  RECIPES,

  SHOPPING_ITEMS,
  STORES,

  PANTRY,

  DAYS,
  MEAL_TYPES,
  WEEK_PLAN,

  FOOD_LOG,
  NUTRITION_HISTORY,

  PROGRESS,
  STREAKS,

  WATER_TRACKER,
  ACTIVITY_TRACKER,
  WORKOUT_HISTORY,

  BUDGET,
  EXPENSE_HISTORY,

  COACH,
  ACHIEVEMENTS,

  APP_SETTINGS,

  RECIPE_FILTERS,
  FAVORITES,

  ACTIVE_SHOPPING_LIST,

  FOOD_CATEGORIES,
  ACTIVITY_LEVELS,
  GOAL_TYPES,

  calculateFoodNutrition,
  calculateRecipeNutrition,
  calculateMealNutrition,
  calculateDayNutrition,

  calculateFoodPrice,
  calculateRecipePrice,

  calculateBMI,
  initializeUserNutrition
};


/* =========================================================
   INITIALISATION
========================================================= */

initializeUserNutrition();

console.log(
  "🍳 BudgetCook V4 — DATA.JS chargé",
  BudgetCookData
);
