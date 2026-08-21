/* =========================================================
   BUDGETCOOK V4 — APP.JS
   Version autonome
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
   ========================================================= */

const STORAGE_KEY = "budgetcook_v4";

const DEFAULT_PROFILE = {
  name: "",
  age: 20,
  sex: "male",
  height: 179,
  weight: 88,
  activity: 1.5,
  training: 5,
  goal: "cut",
  adjustment: 300,
  budget: 50
};

/*
  Valeurs nutritionnelles pour 100 g.
  Les valeurs sont volontairement simples et cohérentes.
*/
const FOODS = [
  {
    id: "chicken",
    name: "Blanc de poulet",
    category: "Viandes",
    kcal: 110,
    protein: 23,
    carbs: 0,
    fat: 1.5,
    price100: 1.20
  },
  {
    id: "turkey",
    name: "Escalope de dinde",
    category: "Viandes",
    kcal: 110,
    protein: 24,
    carbs: 0,
    fat: 1.5,
    price100: 1.30
  },
  {
    id: "beef",
    name: "Steak haché 5%",
    category: "Viandes",
    kcal: 137,
    protein: 21,
    carbs: 0,
    fat: 5,
    price100: 1.70
  },
  {
    id: "tuna",
    name: "Thon au naturel",
    category: "Poissons",
    kcal: 116,
    protein: 26,
    carbs: 0,
    fat: 1,
    price100: 1.40
  },
  {
    id: "salmon",
    name: "Saumon",
    category: "Poissons",
    kcal: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    price100: 2.20
  },
  {
    id: "egg",
    name: "Œuf",
    category: "Œufs",
    kcal: 143,
    protein: 12.6,
    carbs: 0.7,
    fat: 9.5,
    price100: 0.45
  },
  {
    id: "rice",
    name: "Riz cru",
    category: "Féculents",
    kcal: 360,
    protein: 7,
    carbs: 79,
    fat: 0.7,
    price100: 0.25
  },
  {
    id: "pasta",
    name: "Pâtes crues",
    category: "Féculents",
    kcal: 350,
    protein: 12,
    carbs: 72,
    fat: 1.5,
    price100: 0.22
  },
  {
    id: "potato",
    name: "Pomme de terre",
    category: "Féculents",
    kcal: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    price100: 0.18
  },
  {
    id: "oats",
    name: "Flocons d'avoine",
    category: "Petit-déjeuner",
    kcal: 389,
    protein: 16.9,
    carbs: 66,
    fat: 6.9,
    price100: 0.35
  },
  {
    id: "bread",
    name: "Pain complet",
    category: "Féculents",
    kcal: 247,
    protein: 13,
    carbs: 41,
    fat: 4.2,
    price100: 0.40
  },
  {
    id: "skyr",
    name: "Skyr",
    category: "Produits laitiers",
    kcal: 63,
    protein: 10.5,
    carbs: 4,
    fat: 0.2,
    price100: 0.70
  },
  {
    id: "greekYogurt",
    name: "Yaourt grec 0%",
    category: "Produits laitiers",
    kcal: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    price100: 0.60
  },
  {
    id: "milk",
    name: "Lait demi-écrémé",
    category: "Produits laitiers",
    kcal: 46,
    protein: 3.3,
    carbs: 4.8,
    fat: 1.5,
    price100: 0.15
  },
  {
    id: "banana",
    name: "Banane",
    category: "Fruits",
    kcal: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    price100: 0.20
  },
  {
    id: "apple",
    name: "Pomme",
    category: "Fruits",
    kcal: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    price100: 0.22
  },
  {
    id: "broccoli",
    name: "Brocoli",
    category: "Légumes",
    kcal: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    price100: 0.35
  },
  {
    id: "tomato",
    name: "Tomate",
    category: "Légumes",
    kcal: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    price100: 0.30
  },
  {
    id: "zucchini",
    name: "Courgette",
    category: "Légumes",
    kcal: 17,
    protein: 1.2,
    carbs: 3.1,
    fat: 0.3,
    price100: 0.30
  },
  {
    id: "carrot",
    name: "Carotte",
    category: "Légumes",
    kcal: 41,
    protein: 0.9,
    carbs: 9.6,
    fat: 0.2,
    price100: 0.20
  },
  {
    id: "oliveOil",
    name: "Huile d'olive",
    category: "Matières grasses",
    kcal: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    price100: 0.90
  },
  {
    id: "peanutButter",
    name: "Beurre de cacahuète",
    category: "Matières grasses",
    kcal: 588,
    protein: 25,
    carbs: 20,
    fat: 50,
    price100: 0.90
  },
  {
    id: "lentils",
    name: "Lentilles cuites",
    category: "Légumineuses",
    kcal: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    price100: 0.35
  },
  {
    id: "beans",
    name: "Haricots rouges cuits",
    category: "Légumineuses",
    kcal: 127,
    protein: 8.7,
    carbs: 22.8,
    fat: 0.5,
    price100: 0.35
  },
  {
    id: "cheese",
    name: "Emmental",
    category: "Produits laitiers",
    kcal: 380,
    protein: 28,
    carbs: 0,
    fat: 29,
    price100: 1.40
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
      { food: "chicken", grams: 180 },
      { food: "rice", grams: 100 },
      { food: "broccoli", grams: 150 },
      { food: "oliveOil", grams: 10 }
    ]
  },
  {
    id: "tuna-pasta",
    name: "Pâtes au thon",
    emoji: "🍝",
    ingredients: [
      { food: "pasta", grams: 100 },
      { food: "tuna", grams: 120 },
      { food: "tomato", grams: 150 },
      { food: "oliveOil", grams: 8 }
    ]
  },
  {
    id: "beef-potato",
    name: "Steak & pommes de terre",
    emoji: "🥩",
    ingredients: [
      { food: "beef", grams: 150 },
      { food: "potato", grams: 300 },
      { food: "broccoli", grams: 150 },
      { food: "oliveOil", grams: 8 }
    ]
  },
  {
    id: "salmon-rice",
    name: "Saumon & riz",
    emoji: "🐟",
    ingredients: [
      { food: "salmon", grams: 150 },
      { food: "rice", grams: 80 },
      { food: "zucchini", grams: 200 }
    ]
  },
  {
    id: "oat-bowl",
    name: "Bowl avoine & skyr",
    emoji: "🥣",
    ingredients: [
      { food: "oats", grams: 60 },
      { food: "skyr", grams: 200 },
      { food: "banana", grams: 100 },
      { food: "peanutButter", grams: 15 }
    ]
  },
  {
    id: "egg-toast",
    name: "Œufs & tartines",
    emoji: "🍳",
    ingredients: [
      { food: "egg", grams: 150 },
      { food: "bread", grams: 100 },
      { food: "tomato", grams: 100 }
    ]
  }
];


/* =========================================================
   ÉTAT
   ========================================================= */

let state = loadState();

let selectedPlannerDay = 0;


/* =========================================================
   UTILITAIRES
   ========================================================= */

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function todayKey() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

function formatNumber(value, decimals = 0) {
  if (!Number.isFinite(value)) return "0";

  return Number(value).toLocaleString("fr-FR", {
    maximumFractionDigits: decimals
  });
}

function round(value, decimals = 1) {
  const p = Math.pow(10, decimals);

  return Math.round(value * p) / p;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* =========================================================
   ÉTAT PAR DÉFAUT
   ========================================================= */

function createDefaultState() {
  return {
    profile: clone(DEFAULT_PROFILE),

    journal: {},

    weights: [],

    pantry: [],

    shopping: [],

    shoppingChecked: {},

    planner: {},

    darkMode: false,

    streak: 0,

    lastActiveDate: null
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return createDefaultState();
    }

    const parsed = JSON.parse(saved);

    const base = createDefaultState();

    return {
      ...base,
      ...parsed,
      profile: {
        ...base.profile,
        ...(parsed.profile || {})
      }
    };
  } catch (error) {
    console.error(error);

    return createDefaultState();
  }
}


/* =========================================================
   RECHERCHE ALIMENTS
   ========================================================= */

function getFood(id) {
  return FOODS.find(food => food.id === id);
}


/* =========================================================
   NUTRITION
   ========================================================= */

function nutritionForFood(foodId, grams) {
  const food = getFood(foodId);

  if (!food) {
    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      price: 0
    };
  }

  const factor = Number(grams) / 100;

  return {
    kcal: food.kcal * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
    price: (food.price100 || 0) * factor
  };
}

function calculateRecipe(recipe) {
  const result = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    price: 0
  };

  recipe.ingredients.forEach(item => {
    const n = nutritionForFood(
      item.food,
      item.grams
    );

    result.kcal += n.kcal;
    result.protein += n.protein;
    result.carbs += n.carbs;
    result.fat += n.fat;
    result.price += n.price;
  });

  return {
    kcal: round(result.kcal),
    protein: round(result.protein, 1),
    carbs: round(result.carbs, 1),
    fat: round(result.fat, 1),
    price: round(result.price, 2)
  };
}


/* =========================================================
   CALCULS PROFIL
   ========================================================= */

function calculateNutritionTargets(profile = state.profile) {
  const age = Number(profile.age) || 20;
  const weight = Number(profile.weight) || 88;
  const height = Number(profile.height) || 179;

  /*
    Mifflin-St Jeor
  */

  let bmr;

  if (profile.sex === "female") {
    bmr =
      (10 * weight) +
      (6.25 * height) -
      (5 * age) -
      161;
  } else {
    bmr =
      (10 * weight) +
      (6.25 * height) -
      (5 * age) +
      5;
  }

  const activity =
    Number(profile.activity) || 1.5;

  const tdee = bmr * activity;

  let target = tdee;

  if (profile.goal === "cut") {
    target =
      tdee -
      (Number(profile.adjustment) || 300);
  }

  if (profile.goal === "bulk") {
    target =
      tdee +
      (Number(profile.adjustment) || 300);
  }

  /*
    Sécurité.
  */

  target = Math.max(1200, target);

  /*
    MACROS STRICTS

    Protéines = 2 g/kg
    Lipides = 0,8 g/kg
    Glucides = calories restantes / 4
  */

  const protein = weight * 2;

  const fat = weight * 0.8;

  const proteinCalories = protein * 4;

  const fatCalories = fat * 9;

  const remainingCalories =
    target -
    proteinCalories -
    fatCalories;

  const carbs = Math.max(
    0,
    remainingCalories / 4
  );

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    protein: round(protein),
    fat: round(fat),
    carbs: round(carbs)
  };
}


/* =========================================================
   JOURNAL
   ========================================================= */

function getTodayJournal() {
  const key = todayKey();

  if (!Array.isArray(state.journal[key])) {
    state.journal[key] = [];
  }

  return state.journal[key];
}

function calculateJournalTotals(items = getTodayJournal()) {
  return items.reduce(
    (total, item) => {
      total.kcal += Number(item.kcal) || 0;
      total.protein += Number(item.protein) || 0;
      total.carbs += Number(item.carbs) || 0;
      total.fat += Number(item.fat) || 0;

      return total;
    },
    {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  );
}

function addFoodToJournal(foodId, grams) {
  const food = getFood(foodId);

  if (!food) return;

  grams = Number(grams);

  if (!Number.isFinite(grams) || grams <= 0) {
    showToast("Indique une quantité valide.");
    return;
  }

  const n = nutritionForFood(
    foodId,
    grams
  );

  getTodayJournal().push({
    id:
      Date.now() +
      "-" +
      Math.random().toString(16).slice(2),

    type: "food",

    foodId,

    name: food.name,

    grams,

    kcal: n.kcal,

    protein: n.protein,

    carbs: n.carbs,

    fat: n.fat
  });

  saveState();

  updateAll();

  closeFoodModal();

  registerActivity();

  showToast(`${food.name} ajouté.`);
}

function addRecipeToJournal(recipe, multiplier = 1) {
  const nutrition =
    calculateRecipe(recipe);

  const entry = {
    id:
      Date.now() +
      "-" +
      Math.random().toString(16).slice(2),

    type: "recipe",

    recipeId: recipe.id,

    name: recipe.name,

    grams: multiplier,

    kcal: nutrition.kcal * multiplier,

    protein: nutrition.protein * multiplier,

    carbs: nutrition.carbs * multiplier,

    fat: nutrition.fat * multiplier
  };

  getTodayJournal().push(entry);

  saveState();

  updateAll();

  registerActivity();

  showToast(`${recipe.name} ajouté.`);
}

function removeJournalItem(id) {
  const list = getTodayJournal();

  state.journal[todayKey()] =
    list.filter(item => item.id !== id);

  saveState();

  updateAll();

  showToast("Aliment supprimé.");
}

function clearJournal() {
  state.journal[todayKey()] = [];

  saveState();

  updateAll();

  showToast("Journal vidé.");
}


/* =========================================================
   AFFICHAGE JOURNAL
   ========================================================= */

function renderJournal() {
  const list =
    document.getElementById("journalList");

  if (!list) return;

  const items = getTodayJournal();

  if (!items.length) {
    list.innerHTML = `
      <div class="card">
        <p class="empty-text">
          Aucun aliment enregistré aujourd'hui.
        </p>
      </div>
    `;

    return;
  }

  list.innerHTML = items.map(item => `
    <div class="card meal-row">

      <div>
        <strong>
          ${escapeHTML(item.name)}
        </strong>

        <small>
          ${formatNumber(item.grams, 0)} g
          • ${formatNumber(item.kcal, 0)} kcal
        </small>
      </div>

      <div class="meal-macros">
        <span>
          P ${formatNumber(item.protein, 1)}g
        </span>

        <span>
          G ${formatNumber(item.carbs, 1)}g
        </span>

        <span>
          L ${formatNumber(item.fat, 1)}g
        </span>
      </div>

      <button
        class="secondary-button"
        onclick="removeJournalItem('${item.id}')"
      >
        ✕
      </button>

    </div>
  `).join("");
}


/* =========================================================
   MODALE ALIMENT
   ========================================================= */

function openFoodModal() {
  const modal =
    document.getElementById("foodModal");

  if (!modal) return;

  modal.classList.add("active");

  renderFoodResults("");

  setTimeout(() => {
    document
      .getElementById("foodSearch")
      ?.focus();
  }, 50);
}

function closeFoodModal() {
  document
    .getElementById("foodModal")
    ?.classList.remove("active");
}

function renderFoodResults(query = "") {
  const container =
    document.getElementById("foodResults");

  if (!container) return;

  const q =
    String(query)
      .trim()
      .toLowerCase();

  const results =
    FOODS.filter(food =>
      !q ||
      food.name
        .toLowerCase()
        .includes(q)
    );

  container.innerHTML =
    results.map(food => `
      <div class="food-result card">

        <div>
          <strong>
            ${escapeHTML(food.name)}
          </strong>

          <small>
            ${food.kcal} kcal •
            P ${food.protein}g •
            G ${food.carbs}g •
            L ${food.fat}g / 100g
          </small>
        </div>

        <button
          class="primary-button"
          onclick="promptFoodGrams('${food.id}')"
        >
          Ajouter
        </button>

      </div>
    `).join("");
}

function promptFoodGrams(foodId) {
  const food = getFood(foodId);

  if (!food) return;

  const grams =
    prompt(
      `Quantité de ${food.name} en grammes :`,
      "100"
    );

  if (grams === null) return;

  addFoodToJournal(
    foodId,
    Number(grams)
  );
}


/* =========================================================
   ACCUEIL
   ========================================================= */

function updateHome() {
  const targets =
    calculateNutritionTargets();

  const totals =
    calculateJournalTotals();

  const dailyTarget =
    document.getElementById("dailyTarget");

  const consumed =
    document.getElementById("consumedCalories");

  const remaining =
    document.getElementById("remainingCalories");

  const progress =
    document.getElementById("calorieProgress");

  if (dailyTarget)
    dailyTarget.textContent =
      formatNumber(targets.target);

  if (consumed)
    consumed.textContent =
      formatNumber(totals.kcal);

  if (remaining)
    remaining.textContent =
      formatNumber(
        Math.max(
          0,
          targets.target - totals.kcal
        )
      );

  if (progress) {
    const percent =
      targets.target > 0
        ? Math.min(
            100,
            (totals.kcal /
              targets.target) *
              100
          )
        : 0;

    progress.style.width =
      `${percent}%`;
  }

  const pill =
    document.getElementById("goalPill");

  if (pill) {
    const labels = {
      cut: "Perte de gras",
      maintain: "Maintien",
      bulk: "Prise de muscle"
    };

    pill.textContent =
      labels[state.profile.goal] ||
      "Profil";
  }

  const protein =
    document.getElementById("homeProtein");

  const carbs =
    document.getElementById("homeCarbs");

  const fat =
    document.getElementById("homeFat");

  if (protein) {
    protein.textContent =
      `${formatNumber(totals.protein, 1)} / ${formatNumber(targets.protein, 1)} g`;
  }

  if (carbs) {
    carbs.textContent =
      `${formatNumber(totals.carbs, 1)} / ${formatNumber(targets.carbs, 1)} g`;
  }

  if (fat) {
    fat.textContent =
      `${formatNumber(totals.fat, 1)} / ${formatNumber(targets.fat, 1)} g`;
  }

  renderHomeMeals();

  const streak =
    document.getElementById("streakNumber");

  if (streak) {
    streak.textContent =
      state.streak || 0;
  }
}

function renderHomeMeals() {
  const container =
    document.getElementById("homeMeals");

  if (!container) return;

  const items = getTodayJournal();

  if (!items.length) {
    container.innerHTML = `
      <div class="card">
        <p class="empty-text">
          Aucun repas enregistré aujourd'hui.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    items.slice(-4).map(item => `
      <div class="card meal-row">

        <div>
          <strong>
            ${escapeHTML(item.name)}
          </strong>

          <small>
            ${formatNumber(item.kcal)} kcal
          </small>
        </div>

        <span>
          P ${formatNumber(item.protein, 1)}g
        </span>

      </div>
    `).join("");
}


/* =========================================================
   PROFIL
   ========================================================= */

function readProfileForm() {
  const p = state.profile;

  p.name =
    document.getElementById("profileName")?.value ||
    "";

  p.age =
    Number(
      document.getElementById("profileAge")?.value
    ) || 20;

  p.sex =
    document.getElementById("profileSex")?.value ||
    "male";

  p.height =
    Number(
      document.getElementById("profileHeight")?.value
    ) || 179;

  p.weight =
    Number(
      document.getElementById("profileWeight")?.value
    ) || 88;

  p.activity =
    Number(
      document.getElementById("profileActivity")?.value
    ) || 1.5;

  p.training =
    Number(
      document.getElementById("profileTraining")?.value
    ) || 0;

  p.goal =
    document.getElementById("profileGoal")?.value ||
    "cut";

  p.adjustment =
    Number(
      document.getElementById("profileAdjustment")?.value
    ) || 300;

  p.budget =
    Number(
      document.getElementById("profileBudget")?.value
    ) || 0;
}

function populateProfileForm() {
  const p = state.profile;

  const set = (id, value) => {
    const el = document.getElementById(id);

    if (el) el.value = value;
  };

  set("profileName", p.name);
  set("profileAge", p.age);
  set("profileSex", p.sex);
  set("profileHeight", p.height);
  set("profileWeight", p.weight);
  set("profileActivity", p.activity);
  set("profileTraining", p.training);
  set("profileGoal", p.goal);
  set("profileAdjustment", p.adjustment);
  set("profileBudget", p.budget);
}

function updateProfileCalculations() {
  const targets =
    calculateNutritionTargets();

  const values = {
    profileBmr: targets.bmr,
    profileTdee: targets.tdee,
    profileTarget: targets.target,
    profileProteinTarget:
      `${formatNumber(targets.protein, 1)} g`,
    profileCarbsTarget:
      `${formatNumber(targets.carbs, 1)} g`,
    profileFatTarget:
      `${formatNumber(targets.fat, 1)} g`
  };

  Object.entries(values).forEach(
    ([id, value]) => {
      const el =
        document.getElementById(id);

      if (el) {
        el.textContent = value;
      }
    }
  );

  const currentWeight =
    document.getElementById("currentWeight");

  if (currentWeight) {
    currentWeight.textContent =
      formatNumber(
        state.profile.weight,
        1
      );
  }

  const maintenance =
    document.getElementById(
      "maintenanceCalories"
    );

  if (maintenance) {
    maintenance.textContent =
      formatNumber(targets.tdee);
  }

  const progressCalories =
    document.getElementById(
      "progressCalories"
    );

  if (progressCalories) {
    progressCalories.textContent =
      formatNumber(targets.target);
  }

  const progressProtein =
    document.getElementById(
      "progressProtein"
    );

  if (progressProtein) {
    progressProtein.textContent =
      `${formatNumber(targets.protein, 1)} g`;
  }
}

function saveProfile() {
  readProfileForm();

  /*
    Le poids du profil devient également
    une donnée de progression.
  */

  if (state.profile.weight > 0) {
    const last =
      state.weights[state.weights.length - 1];

    if (
      !last ||
      Number(last.weight) !==
        Number(state.profile.weight)
    ) {
      state.weights.push({
        date: todayKey(),
        weight: state.profile.weight
      });
    }
  }

  saveState();

  updateAll();

  showToast(
    "Profil enregistré avec succès."
  );
}


/* =========================================================
   JOURNAL STATS
   ========================================================= */

function updateJournalStats() {
  const totals =
    calculateJournalTotals();

  const values = {
    journalCalories:
      formatNumber(totals.kcal),

    journalProtein:
      `${formatNumber(totals.protein, 1)} g`,

    journalCarbs:
      `${formatNumber(totals.carbs, 1)} g`,

    journalFat:
      `${formatNumber(totals.fat, 1)} g`
  };

  Object.entries(values).forEach(
    ([id, value]) => {
      const el =
        document.getElementById(id);

      if (el) el.textContent = value;
    }
  );
}


/* =========================================================
   RECETTES
   ========================================================= */

function renderRecipes() {
  const container =
    document.getElementById("recipeList");

  if (!container) return;

  container.innerHTML =
    RECIPES.map(recipe => {
      const n =
        calculateRecipe(recipe);

      return `
        <div class="card recipe-card">

          <div class="recipe-title">

            <span class="recipe-emoji">
              ${recipe.emoji}
            </span>

            <div>
              <h2>
                ${escapeHTML(recipe.name)}
              </h2>

              <small>
                ${formatNumber(n.kcal)} kcal
                • P ${formatNumber(n.protein, 1)}g
                • G ${formatNumber(n.carbs, 1)}g
                • L ${formatNumber(n.fat, 1)}g
              </small>
            </div>

          </div>

          <div class="recipe-ingredients">

            ${recipe.ingredients.map(
              item => {
                const food =
                  getFood(item.food);

                return `
                  <span>
                    ${food?.name || item.food}
                    ${item.grams}g
                  </span>
                `;
              }
            ).join("")}

          </div>

          <button
            class="primary-button"
            onclick="addRecipeToJournalById('${recipe.id}')"
          >
            Ajouter au journal
          </button>

        </div>
      `;
    }).join("");
}

function addRecipeToJournalById(recipeId) {
  const recipe =
    RECIPES.find(
      r => r.id === recipeId
    );

  if (!recipe) return;

  addRecipeToJournal(
    recipe,
    1
  );
}


/* =========================================================
   PORTION INTELLIGENTE
   ========================================================= */

function smartMeal() {
  const targets =
    calculateNutritionTargets();

  const totals =
    calculateJournalTotals();

  const remaining =
    Math.max(
      200,
      targets.target - totals.kcal
    );

  /*
    On cherche la recette dont la portion
    de base est la plus proche de 40-50%
    des calories restantes.
  */

  const desired =
    Math.min(
      800,
      Math.max(
        400,
        remaining * 0.45
      )
    );

  let best = null;

  RECIPES.forEach(recipe => {
    const nutrition =
      calculateRecipe(recipe);

    if (nutrition.kcal <= 0) return;

    const multiplier =
      desired / nutrition.kcal;

    const score =
      Math.abs(
        nutrition.kcal * multiplier -
        desired
      );

    if (
      !best ||
      score < best.score
    ) {
      best = {
        recipe,
        multiplier,
        score,
        nutrition
      };
    }
  });

  if (!best) return;

  const multiplier =
    round(
      Math.max(
        0.5,
        Math.min(
          2,
          best.multiplier
        )
      ),
      2
    );

  const n = best.nutrition;

  const kcal =
    n.kcal * multiplier;

  const protein =
    n.protein * multiplier;

  const carbs =
    n.carbs * multiplier;

  const fat =
    n.fat * multiplier;

  const confirmed =
    confirm(
      `${best.recipe.emoji} ${best.recipe.name}\n\n` +
      `Portion recommandée : ${multiplier}×\n\n` +
      `${formatNumber(kcal)} kcal\n` +
      `P ${formatNumber(protein, 1)} g\n` +
      `G ${formatNumber(carbs, 1)} g\n` +
      `L ${formatNumber(fat, 1)} g\n\n` +
      `Ajouter au journal ?`
    );

  if (confirmed) {
    addRecipeToJournal(
      best.recipe,
      multiplier
    );
  }
}


/* =========================================================
   PLANNING
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

function generatePlanner() {
  DAYS.forEach(
    (day, index) => {
      const date =
        getDateForWeekDay(index);

      const key =
        date.toISOString()
          .slice(0, 10);

      const recipe =
        RECIPES[
          index %
          RECIPES.length
        ];

      state.planner[key] = {
        recipeId: recipe.id
      };
    }
  );

  saveState();

  renderPlanner();

  showToast(
    "Planning régénéré."
  );
}

function getDateForWeekDay(index) {
  const now = new Date();

  const day =
    now.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  const monday =
    new Date(now);

  monday.setDate(
    now.getDate() + diff
  );

  monday.setHours(
    12,
    0,
    0,
    0
  );

  const date =
    new Date(monday);

  date.setDate(
    monday.getDate() + index
  );

  return date;
}

function renderPlannerDays() {
  const container =
    document.getElementById(
      "daysContainer"
    );

  if (!container) return;

  container.innerHTML =
    DAYS.map((day, index) => `
      <button
        class="day-button ${
          index === selectedPlannerDay
            ? "active"
            : ""
        }"
        onclick="selectPlannerDay(${index})"
      >
        <strong>
          ${day.slice(0, 3)}
        </strong>

        <small>
          ${getDateForWeekDay(index).getDate()}
        </small>
      </button>
    `).join("");
}

function selectPlannerDay(index) {
  selectedPlannerDay = index;

  renderPlanner();

  const title =
    document.getElementById(
      "selectedDayTitle"
    );

  if (title) {
    title.textContent =
      DAYS[index];
  }
}

function renderPlanner() {
  renderPlannerDays();

  const container =
    document.getElementById(
      "dayMeals"
    );

  if (!container) return;

  const date =
    getDateForWeekDay(
      selectedPlannerDay
    );

  const key =
    date.toISOString()
      .slice(0, 10);

  const plan =
    state.planner[key];

  if (!plan) {
    container.innerHTML = `
      <p class="empty-text">
        Aucun repas prévu.
      </p>
    `;

    return;
  }

  const recipe =
    RECIPES.find(
      r => r.id === plan.recipeId
    );

  if (!recipe) return;

  const n =
    calculateRecipe(recipe);

  container.innerHTML = `
    <div class="meal-row">

      <div>
        <strong>
          ${recipe.emoji}
          ${escapeHTML(recipe.name)}
        </strong>

        <small>
          ${formatNumber(n.kcal)} kcal
          • P ${formatNumber(n.protein, 1)}g
          • G ${formatNumber(n.carbs, 1)}g
          • L ${formatNumber(n.fat, 1)}g
        </small>
      </div>

      <button
        class="primary-button"
        onclick="addRecipeToJournalById('${recipe.id}')"
      >
        Ajouter
      </button>

    </div>
  `;
}


/* =========================================================
   COURSES
   ========================================================= */

function generateShoppingList() {
  const totals = {};

  /*
    On prend les recettes du planning
    et on additionne les ingrédients.
  */

  Object.values(state.planner)
    .forEach(plan => {
      const recipe =
        RECIPES.find(
          r => r.id === plan.recipeId
        );

      if (!recipe) return;

      recipe.ingredients.forEach(item => {
        totals[item.food] =
          (totals[item.food] || 0) +
          item.grams;
      });
    });

  /*
    Ajout des éléments du garde-manger :
    ils sont considérés disponibles et ne
    sont donc pas ajoutés aux courses.
  */

  state.shopping =
    Object.entries(totals)
      .filter(
        ([foodId]) =>
          !state.pantry.includes(foodId)
      )
      .map(
        ([foodId, grams]) => ({
          id: foodId,
          grams
        })
      );

  saveState();

  renderShopping();

  showToast(
    "Liste de courses actualisée."
  );
}

function renderShopping() {
  const container =
    document.getElementById(
      "shoppingList"
    );

  if (!container) return;

  if (!state.shopping.length) {
    container.innerHTML = `
      <p class="empty-text">
        Ta liste de courses est vide.
      </p>
    `;

    updateShoppingTotals();

    return;
  }

  container.innerHTML =
    state.shopping.map(item => {
      const food =
        getFood(item.id);

      if (!food) return "";

      const checked =
        !!state.shoppingChecked[item.id];

      return `
        <label
          class="shopping-item ${
            checked ? "checked" : ""
          }"
        >

          <input
            type="checkbox"
            ${
              checked
                ? "checked"
                : ""
            }
            onchange="toggleShoppingItem('${item.id}')"
          >

          <span>
            <strong>
              ${escapeHTML(food.name)}
            </strong>

            <small>
              ${formatNumber(item.grams, 0)} g
            </small>
          </span>

          <strong>
            ${formatNumber(
              food.price100 *
              item.grams /
              100,
              2
            )} €
          </strong>

        </label>
      `;
    }).join("");

  updateShoppingTotals();
}

function toggleShoppingItem(id) {
  state.shoppingChecked[id] =
    !state.shoppingChecked[id];

  saveState();

  renderShopping();
}

function checkAllShopping() {
  const allChecked =
    state.shopping.every(
      item =>
        state.shoppingChecked[item.id]
    );

  state.shopping.forEach(item => {
    state.shoppingChecked[item.id] =
      !allChecked;
  });

  saveState();

  renderShopping();
}

function updateShoppingTotals() {
  const budget =
    Number(state.profile.budget) || 0;

  let total = 0;

  state.shopping.forEach(item => {
    const food =
      getFood(item.id);

    if (!food) return;

    total +=
      food.price100 *
      item.grams /
      100;
  });

  const budgetEl =
    document.getElementById(
      "weeklyBudget"
    );

  const basketEl =
    document.getElementById(
      "estimatedBasket"
    );

  if (budgetEl)
    budgetEl.textContent =
      formatNumber(
        budget,
        2
      );

  if (basketEl)
    basketEl.textContent =
      formatNumber(
        total,
        2
      );
}


/* =========================================================
   GARDE-MANGER
   ========================================================= */

function addPantryItem() {
  const input =
    document.getElementById(
      "pantryInput"
    );

  if (!input) return;

  const query =
    input.value
      .trim()
      .toLowerCase();

  if (!query) return;

  const food =
    FOODS.find(
      item =>
        item.name
          .toLowerCase()
          .includes(query)
    );

  if (!food) {
    showToast(
      "Aliment introuvable."
    );

    return;
  }

  if (!state.pantry.includes(food.id)) {
    state.pantry.push(food.id);
  }

  input.value = "";

  saveState();

  renderPantry();

  showToast(
    `${food.name} ajouté au garde-manger.`
  );
}

function removePantryItem(id) {
  state.pantry =
    state.pantry.filter(
      item => item !== id
    );

  saveState();

  renderPantry();
}

function renderPantry() {
  const container =
    document.getElementById(
      "pantryList"
    );

  if (!container) return;

  if (!state.pantry.length) {
    container.innerHTML = `
      <p class="empty-text">
        Ton garde-manger est vide.
      </p>
    `;

    return;
  }

  container.innerHTML =
    state.pantry.map(id => {
      const food =
        getFood(id);

      if (!food) return "";

      return `
        <div class="meal-row">

          <strong>
            🥫 ${escapeHTML(food.name)}
          </strong>

          <button
            class="secondary-button"
            onclick="removePantryItem('${id}')"
          >
            Supprimer
          </button>

        </div>
      `;
    }).join("");
}


/* =========================================================
   POIDS
   ========================================================= */

function addWeight() {
  const input =
    document.getElementById(
      "newWeight"
    );

  if (!input) return;

  const weight =
    Number(input.value);

  if (
    !Number.isFinite(weight) ||
    weight <= 0
  ) {
    showToast(
      "Entre un poids valide."
    );

    return;
  }

  state.profile.weight =
    weight;

  state.weights.push({
    date: todayKey(),
    weight
  });

  input.value = "";

  saveState();

  updateAll();

  showToast(
    `${formatNumber(weight, 1)} kg enregistré.`
  );
}

function renderWeightChart() {
  const container =
    document.getElementById(
      "weightChart"
    );

  if (!container) return;

  const data =
    state.weights.slice(-10);

  if (!data.length) {
    container.innerHTML = `
      <span class="empty-text">
        Ajoute ton premier poids.
      </span>
    `;

    return;
  }

  const max =
    Math.max(
      ...data.map(
        x => Number(x.weight)
      )
    );

  const min =
    Math.min(
      ...data.map(
        x => Number(x.weight)
      )
    );

  const range =
    Math.max(
      1,
      max - min
    );

  container.innerHTML = `
    <div class="weight-chart-inner">

      ${data.map(item => {
        const percentage =
          ((item.weight - min) /
            range) *
          70 + 20;

        return `
          <div
            class="weight-point"
            style="height:${percentage}%"
            title="${item.weight} kg"
          >
            <span>
              ${formatNumber(
                item.weight,
                1
              )}
            </span>
          </div>
        `;
      }).join("")}

    </div>

    <div class="weight-dates">

      ${data.map(item => `
        <small>
          ${item.date.slice(5)}
        </small>
      `).join("")}

    </div>
  `;
}


/* =========================================================
   COACH
   ========================================================= */

function coachAnswer(question) {
  const q =
    question
      .toLowerCase()
      .trim();

  const targets =
    calculateNutritionTargets();

  const totals =
    calculateJournalTotals();

  const remainingCalories =
    Math.max(
      0,
      targets.target - totals.kcal
    );

  const remainingProtein =
    Math.max(
      0,
      targets.protein -
      totals.protein
    );

  const remainingCarbs =
    Math.max(
      0,
      targets.carbs -
      totals.carbs
    );

  const remainingFat =
    Math.max(
      0,
      targets.fat -
      totals.fat
    );

  if (
    q.includes("protéine") ||
    q.includes("protein")
  ) {
    return `
      Il te reste environ
      <strong>
        ${formatNumber(
          remainingProtein,
          1
        )} g
      </strong>
      de protéines aujourd'hui.
    `;
  }

  if (
    q.includes("glucide") ||
    q.includes("carb")
  ) {
    return `
      Il te reste environ
      <strong>
        ${formatNumber(
          remainingCarbs,
          1
        )} g
      </strong>
      de glucides.
    `;
  }

  if (
    q.includes("lipide") ||
    q.includes("gras")
  ) {
    return `
      Il te reste environ
      <strong>
        ${formatNumber(
          remainingFat,
          1
        )} g
      </strong>
      de lipides.
    `;
  }

  if (
    q.includes("calorie") ||
    q.includes("kcal")
  ) {
    return `
      Il te reste
      <strong>
        ${formatNumber(
          remainingCalories
        )} kcal
      </strong>
      aujourd'hui.
    `;
  }

  if (
    q.includes("soir") ||
    q.includes("manger")
  ) {
    const recipe =
      RECIPES[
        Math.floor(
          Math.random() *
          RECIPES.length
        )
      ];

    const n =
      calculateRecipe(recipe);

    return `
      Je te propose
      <strong>
        ${recipe.emoji}
        ${recipe.name}
      </strong> :
      environ ${formatNumber(n.kcal)} kcal,
      ${formatNumber(n.protein, 1)} g de protéines.
      Si tu veux une portion adaptée,
      utilise « Me proposer un repas ».
    `;
  }

  if (
    q.includes("économ") ||
    q.includes("budget")
  ) {
    return `
      Pour économiser, privilégie
      le riz, les pâtes, les œufs,
      les lentilles, le thon en boîte,
      les légumes surgelés et les
      produits en gros formats.
    `;
  }

  return `
    Ton objectif est de
    <strong>
      ${formatNumber(
        targets.target
      )} kcal
    </strong>
    avec environ
    <strong>
      ${formatNumber(
        targets.protein,
        1
      )} g de protéines
    </strong>,
    <strong>
      ${formatNumber(
        targets.carbs,
        1
      )} g de glucides
    </strong>
    et
    <strong>
      ${formatNumber(
        targets.fat,
        1
      )} g de lipides
    </strong>.
  `;
}

function sendCoachMessage(text = null) {
  const input =
    document.getElementById(
      "coachInput"
    );

  const messages =
    document.getElementById(
      "coachMessages"
    );

  if (!input || !messages) return;

  const question =
    text ||
    input.value.trim();

  if (!question) return;

  messages.insertAdjacentHTML(
    "beforeend",
    `
      <div class="coach-message user">
        ${escapeHTML(question)}
      </div>
    `
  );

  input.value = "";

  const answer =
    coachAnswer(question);

  setTimeout(() => {
    messages.insertAdjacentHTML(
      "beforeend",
      `
        <div class="coach-message">
          ${answer}
        </div>
      `
    );

    messages.scrollTop =
      messages.scrollHeight;
  }, 250);
}


/* =========================================================
   STREAK
   ========================================================= */

function registerActivity() {
  const today =
    todayKey();

  if (
    state.lastActiveDate === today
  ) {
    return;
  }

  if (!state.lastActiveDate) {
    state.streak = 1;
  } else {
    const previous =
      new Date(
        state.lastActiveDate +
        "T12:00:00"
      );

    const current =
      new Date(
        today +
        "T12:00:00"
      );

    const diff =
      Math.round(
        (
          current - previous
        ) /
        86400000
      );

    if (diff === 1) {
      state.streak += 1;
    } else {
      state.streak = 1;
    }
  }

  state.lastActiveDate =
    today;

  saveState();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });

  const page =
    document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  document
    .querySelectorAll(
      ".nav-button"
    )
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.page === pageId
      );
    });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   MODE SOMBRE
   ========================================================= */

function applyDarkMode() {
  document.body.classList.toggle(
    "dark-mode",
    !!state.darkMode
  );
}

function toggleDarkMode() {
  state.darkMode =
    !state.darkMode;

  saveState();

  applyDarkMode();

  showToast(
    state.darkMode
      ? "Mode sombre activé."
      : "Mode sombre désactivé."
  );
}


/* =========================================================
   MISE À JOUR GLOBALE
   ========================================================= */

function updateAll() {
  updateHome();

  updateJournalStats();

  renderJournal();

  updateProfileCalculations();

  renderRecipes();

  renderPlanner();

  renderShopping();

  renderPantry();

  renderWeightChart();

  updateShoppingTotals();

  applyDarkMode();
}


/* =========================================================
   ÉVÉNEMENTS
   ========================================================= */

function setupEvents() {

  /*
    Navigation
  */

  document
    .querySelectorAll(
      "[data-page]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {
          showPage(
            button.dataset.page
          );
        }
      );

    });


  /*
    Profil
  */

  document
    .getElementById(
      "profileButton"
    )
    ?.addEventListener(
      "click",
      () => {
        showPage(
          "profilePage"
        );
      }
    );

  document
    .getElementById(
      "saveProfileButton"
    )
    ?.addEventListener(
      "click",
      saveProfile
    );


  /*
    Journal
  */

  document
    .getElementById(
      "addFoodButton"
    )
    ?.addEventListener(
      "click",
      openFoodModal
    );

  document
    .getElementById(
      "clearJournalButton"
    )
    ?.addEventListener(
      "click",
      () => {
        if (
          confirm(
            "Vider le journal d'aujourd'hui ?"
          )
        ) {
          clearJournal();
        }
      }
    );


  /*
    Modale
  */

  document
    .getElementById(
      "closeFoodModal"
    )
    ?.addEventListener(
      "click",
      closeFoodModal
    );

  document
    .getElementById(
      "foodSearch"
    )
    ?.addEventListener(
      "input",
      event => {
        renderFoodResults(
          event.target.value
        );
      }
    );

  document
    .getElementById(
      "foodModal"
    )
    ?.addEventListener(
      "click",
      event => {
        if (
          event.target.id ===
          "foodModal"
        ) {
          closeFoodModal();
        }
      }
    );


  /*
    Recettes
  */

  document
    .getElementById(
      "smartMealButton"
    )
    ?.addEventListener(
      "click",
      smartMeal
    );


  /*
    Planning
  */

  document
    .getElementById(
      "regenerateWeekButton"
    )
    ?.addEventListener(
      "click",
      () => {
        generatePlanner();
      }
    );


  /*
    Courses
  */

  document
    .getElementById(
      "checkAllButton"
    )
    ?.addEventListener(
      "click",
      checkAllShopping
    );


  /*
    Garde-manger
  */

  document
    .getElementById(
      "addPantryButton"
    )
    ?.addEventListener(
      "click",
      addPantryItem
    );

  document
    .getElementById(
      "pantryInput"
    )
    ?.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Enter"
        ) {
          addPantryItem();
        }
      }
    );


  /*
    Poids
  */

  document
    .getElementById(
      "addWeightButton"
    )
    ?.addEventListener(
      "click",
      addWeight
    );


  /*
    Coach
  */

  document
    .getElementById(
      "sendCoachButton"
    )
    ?.addEventListener(
      "click",
      () => {
        sendCoachMessage();
      }
    );

  document
    .getElementById(
      "coachInput"
    )
    ?.addEventListener(
      "keydown",
      event => {
        if (
          event.key === "Enter"
        ) {
          sendCoachMessage();
        }
      }
    );

  document
    .querySelectorAll(
      ".quick-button"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          sendCoachMessage(
            button.textContent.trim()
          );
        }
      );
    });


  /*
    Mode sombre
  */

  document
    .getElementById(
      "darkModeButton"
    )
    ?.addEventListener(
      "click",
      toggleDarkMode
    );
}


/* =========================================================
   INITIALISATION
   ========================================================= */

function initializeApp() {

  /*
    Si aucun planning n'existe,
    on en génère un.
  */

  if (
    !state.planner ||
    Object.keys(
      state.planner
    ).length === 0
  ) {
    generatePlanner();
  }

  /*
    Si le profil est vide,
    on charge les valeurs par défaut.
  */

  populateProfileForm();

  setupEvents();

  updateAll();

  /*
    Nom personnalisé dans l'accueil.
  */

  if (state.profile.name) {
    const title =
      document.querySelector(
        "#homePage h1"
      );

    if (title) {
      title.textContent =
        `Bonjour ${state.profile.name} 👋`;
    }
  }
}


/* =========================================================
   API GLOBALE
   Permet aux onclick du HTML de fonctionner.
   ========================================================= */

window.removeJournalItem =
  removeJournalItem;

window.promptFoodGrams =
  promptFoodGrams;

window.addRecipeToJournalById =
  addRecipeToJournalById;

window.selectPlannerDay =
  selectPlannerDay;

window.toggleShoppingItem =
  toggleShoppingItem;

window.removePantryItem =
  removePantryItem;


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);
