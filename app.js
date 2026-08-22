/* =========================================================
   BUDGETCOOK V4 — APP.JS
   VERSION PROPRE ET CORRIGÉE
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const APP_KEY = "budgetcook_v4";

const DEFAULT_PROFILE = {
  age: 20,
  sex: "male",

  height: 179,
  weight: 88,

  /* Mensurations */
  neck: 0,
  chest: 0,
  waist: 0,
  hip: 0,
  leftArm: 0,
  rightArm: 0,
  leftThigh: 0,
  rightThigh: 0,

  activity: 1.55,
  trainingDays: 5,

  goal: "cut",
  deficit: 300,
  surplus: 250,

  /*
    IMPORTANT :
    Objectif calorique manuel.
    2000 kcal = 176 P / 165.6 G / 70.4 L
  */
  calorieTarget: 2000,

  proteinPerKg: 2.0,
  fatPerKg: 0.8,

  budget: 50,

  targetWeight: 0,
  targetBodyFat: 0
};


const DEFAULT_STATE = {
  profile: { ...DEFAULT_PROFILE },

  selectedDate:
    new Date().toISOString().split("T")[0],

  meals: {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  },

  planner: {
    Lundi: [],
    Mardi: [],
    Mercredi: [],
    Jeudi: [],
    Vendredi: [],
    Samedi: [],
    Dimanche: []
  },

  shopping: [],
  pantry: [],
  progress: [],
  favorites: [],

  settings: {
    darkMode: false,
    currency: "€",
    unitSystem: "metric"
  }
};


/* =========================================================
   ÉTAT GLOBAL
========================================================= */

let state = loadState();


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});


function initializeApp() {

  calculateProfileTargets();

  setupNavigation();
  setupGlobalEvents();
  setupButtonEvents();

  renderProfile();
  renderDashboard();
  renderJournal();
  renderRecipes();
  renderPlanner();
  renderShopping();
  renderPantry();
  renderProgress();
  renderCoach();

  applySettings();
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadState() {

  try {

    const saved =
      localStorage.getItem(APP_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_STATE);
    }

    const parsed =
      JSON.parse(saved);

    const merged =
      mergeDeep(
        structuredClone(DEFAULT_STATE),
        parsed
      );

    /*
      Si l'ancien état contenait 0 comme objectif
      calorique, on remet l'objectif à 2000.
    */
    if (
      !Number.isFinite(
        Number(merged.profile.calorieTarget)
      ) ||
      Number(merged.profile.calorieTarget) <= 0
    ) {
      merged.profile.calorieTarget = 2000;
    }

    return merged;

  } catch (error) {

    console.error(
      "Erreur chargement données :",
      error
    );

    return structuredClone(DEFAULT_STATE);
  }
}


function saveState() {

  try {

    localStorage.setItem(
      APP_KEY,
      JSON.stringify(state)
    );

  } catch (error) {

    console.error(
      "Erreur sauvegarde :",
      error
    );
  }
}


function mergeDeep(target, source) {

  if (
    !source ||
    typeof source !== "object"
  ) {
    return target;
  }

  Object.keys(source).forEach(key => {

    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {

      if (!target[key]) {
        target[key] = {};
      }

      mergeDeep(
        target[key],
        source[key]
      );

    } else {

      target[key] = source[key];

    }

  });

  return target;
}


/* =========================================================
   UTILITAIRES
========================================================= */

function $(selector) {
  return document.querySelector(selector);
}


function $$(selector) {
  return [
    ...document.querySelectorAll(selector)
  ];
}


function getFood(foodId) {

  return typeof FOODS !== "undefined"
    ? FOODS.find(
        food => food.id === foodId
      )
    : null;
}


function getRecipe(recipeId) {

  return typeof RECIPES !== "undefined"
    ? RECIPES.find(
        recipe => recipe.id === recipeId
      )
    : null;
}


function round(
  value,
  decimals = 1
) {

  const factor =
    Math.pow(10, decimals);

  return (
    Math.round(
      Number(value || 0) * factor
    ) / factor
  );
}


function clamp(
  value,
  min,
  max
) {

  return Math.min(
    Math.max(value, min),
    max
  );
}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatNumber(
  value,
  decimals = 0
) {

  return Number(value || 0)
    .toLocaleString("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
}


function formatEuro(value) {
  return `${formatNumber(value, 2)} €`;
}


function setText(selector, value) {

  const element = $(selector);

  if (element) {
    element.textContent = value;
  }
}


function updateProgressBar(
  selector,
  current,
  target
) {

  const element = $(selector);

  if (!element) return;

  const percentage =
    target > 0
      ? clamp(
          current / target * 100,
          0,
          100
        )
      : 0;

  element.style.width =
    `${percentage}%`;
}


/* =========================================================
   NUTRITION
========================================================= */

function calculateFoodNutrition(
  foodId,
  quantity
) {

  const food = getFood(foodId);

  if (!food) {

    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }

  const factor =
    Number(quantity || 0) / 100;

  return {
    kcal:
      Number(food.kcal || 0) * factor,

    protein:
      Number(food.protein || 0) * factor,

    carbs:
      Number(food.carbs || 0) * factor,

    fat:
      Number(food.fat || 0) * factor
  };
}


function calculateMealNutrition(
  items = []
) {

  const totals = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  items.forEach(item => {

    const nutrition =
      calculateFoodNutrition(
        item.food,
        item.grams
      );

    totals.kcal += nutrition.kcal;
    totals.protein += nutrition.protein;
    totals.carbs += nutrition.carbs;
    totals.fat += nutrition.fat;
  });

  return totals;
}


function calculateDayNutrition(
  meals = state.meals
) {

  const totals = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  if (!meals) {
    return totals;
  }

  Object.values(meals).forEach(items => {

    const nutrition =
      calculateMealNutrition(
        items || []
      );

    totals.kcal += nutrition.kcal;
    totals.protein += nutrition.protein;
    totals.carbs += nutrition.carbs;
    totals.fat += nutrition.fat;
  });

  return totals;
}


function calculateRecipeNutrition(
  recipeId,
  multiplier = 1
) {

  const recipe =
    getRecipe(recipeId);

  if (!recipe) {

    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }

  const items =
    (recipe.ingredients || []).map(
      ingredient => ({
        food: ingredient.food,
        grams:
          Number(ingredient.grams || 0) *
          multiplier
      })
    );

  return calculateMealNutrition(items);
}


function calculateMacroCalories(
  protein,
  carbs,
  fat
) {

  return (
    Number(protein || 0) * 4 +
    Number(carbs || 0) * 4 +
    Number(fat || 0) * 9
  );
}


/* =========================================================
   CALCULS CALORIES
========================================================= */

function calculateBMR(
  profile = state.profile
) {

  const weight =
    Number(profile.weight) || 0;

  const height =
    Number(profile.height) || 0;

  const age =
    Number(profile.age) || 0;

  if (
    !weight ||
    !height ||
    !age
  ) {
    return 0;
  }

  if (profile.sex === "female") {

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


function calculateTDEE(
  profile = state.profile
) {

  const bmr =
    calculateBMR(profile);

  const activity =
    Number(profile.activity) || 1.2;

  return bmr * activity;
}


/* =========================================================
   OBJECTIF CALORIQUE
========================================================= */

function calculateCalorieTarget(
  profile = state.profile
) {

  /*
    PRIORITÉ :
    Si calorieTarget est défini et > 0,
    on l'utilise directement.

    Cela évite que l'application transforme
    automatiquement ton objectif de 2000 kcal
    en ~2650 kcal.
  */

  const manualTarget =
    Number(profile.calorieTarget);

  if (
    Number.isFinite(manualTarget) &&
    manualTarget > 0
  ) {

    return Math.round(
      manualTarget
    );
  }

  const tdee =
    calculateTDEE(profile);

  let target = tdee;

  if (profile.goal === "cut") {

    target -=
      Number(profile.deficit) || 0;
  }

  if (profile.goal === "bulk") {

    target +=
      Number(profile.surplus) || 250;
  }

  if (profile.goal === "maintain") {

    target = tdee;
  }

  return Math.max(
    1200,
    Math.round(target)
  );
}


/* =========================================================
   ⭐ MACROS — SOURCE UNIQUE ⭐
========================================================= */

function getDailyTargets(
  profile = state.profile
) {

  const calories =
    calculateCalorieTarget(profile);

  const weight =
    Number(profile.weight) || 0;

  const proteinPerKg =
    Number(profile.proteinPerKg);

  const fatPerKg =
    Number(profile.fatPerKg);

  /*
    PROTÉINES
    = poids × g/kg
  */

  const protein =
    weight *
    (
      Number.isFinite(proteinPerKg)
        ? proteinPerKg
        : 2
    );


  /*
    LIPIDES
    = poids × g/kg
  */

  const fat =
    weight *
    (
      Number.isFinite(fatPerKg)
        ? fatPerKg
        : 0.8
    );


  /*
    CALORIES PROTÉINES
  */

  const proteinCalories =
    protein * 4;


  /*
    CALORIES LIPIDES
  */

  const fatCalories =
    fat * 9;


  /*
    CALORIES RESTANTES
    = glucides
  */

  const remainingCalories =
    calories -
    proteinCalories -
    fatCalories;


  /*
    GLUCIDES
    = calories restantes / 4
  */

  const carbs =
    Math.max(
      0,
      remainingCalories / 4
    );


  const totalMacroCalories =
    proteinCalories +
    carbs * 4 +
    fatCalories;


  return {

    calories:
      Math.round(calories),

    protein:
      round(protein),

    carbs:
      round(carbs),

    fat:
      round(fat),

    proteinCalories:
      round(proteinCalories),

    carbCalories:
      round(carbs * 4),

    fatCalories:
      round(fatCalories),

    totalMacroCalories:
      round(totalMacroCalories)
  };
}


function calculateMacros(
  profile = state.profile
) {

  return getDailyTargets(profile);
}


function calculateProfileTargets() {

  const target =
    calculateCalorieTarget(
      state.profile
    );

  state.profile.calorieTarget =
    target;

  return getDailyTargets(
    state.profile
  );
}


/* =========================================================
   IMC
========================================================= */

function calculateBMI(
  profile = state.profile
) {

  const weight =
    Number(profile.weight);

  const height =
    Number(profile.height) / 100;

  if (
    !weight ||
    !height
  ) {
    return 0;
  }

  return (
    weight /
    (height * height)
  );
}


function getBMICategory(bmi) {

  if (bmi < 18.5)
    return "Insuffisance pondérale";

  if (bmi < 25)
    return "Corpulence normale";

  if (bmi < 30)
    return "Surpoids";

  return "Obésité";
}


/* =========================================================
   MASSE GRASSE
========================================================= */

function calculateBodyFat(
  profile = state.profile
) {

  const height =
    Number(profile.height);

  const neck =
    Number(profile.neck);

  const waist =
    Number(profile.waist);

  if (
    !height ||
    !neck ||
    !waist
  ) {
    return null;
  }

  let bodyFat;

  if (profile.sex === "female") {

    const hip =
      Number(profile.hip);

    if (!hip) return null;

    const value =
      waist +
      hip -
      neck;

    if (value <= 0) return null;

    bodyFat =
      495 /
      (
        1.29579 -
        0.35004 *
        Math.log10(value) +
        0.22100 *
        Math.log10(height)
      ) -
      450;

  } else {

    const value =
      waist -
      neck;

    if (value <= 0) return null;

    bodyFat =
      495 /
      (
        1.0324 -
        0.19077 *
        Math.log10(value) +
        0.15456 *
        Math.log10(height)
      ) -
      450;
  }

  if (!Number.isFinite(bodyFat)) {
    return null;
  }

  return clamp(
    bodyFat,
    2,
    60
  );
}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  const buttons =
    $$("[data-section], [data-page]");

  buttons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const sectionName =
          button.dataset.section ||
          button.dataset.page;

        if (sectionName) {
          showSection(sectionName);
        }

      }
    );

  });
}


function showSection(sectionName) {

  if (!sectionName) return;

  /*
    Compatible avec plusieurs structures
    possibles de l'interface.
  */

  $$("[data-section-content], [data-page-content]").forEach(
    section => {

      const name =
        section.dataset.sectionContent ||
        section.dataset.pageContent;

      section.classList.toggle(
        "active",
        name === sectionName
      );
    }
  );


  $$("[data-section], [data-page]").forEach(
    button => {

      const name =
        button.dataset.section ||
        button.dataset.page;

      button.classList.toggle(
        "active",
        name === sectionName
      );
    }
  );


  /*
    Compatibilité avec les IDs
    page-home, page-journal, etc.
  */

  $$("[id^='page-']").forEach(page => {

    page.classList.toggle(
      "active",
      page.id ===
      `page-${sectionName}`
    );
  });


  /*
    Ferme le menu mobile après navigation.
  */

  const sidebar =
    $(".sidebar");

  if (sidebar) {
    sidebar.classList.remove(
      "mobile-open"
    );
  }
}


/* =========================================================
   BOUTONS
========================================================= */

function setupButtonEvents() {

  const buttons = [

    ["#quickAddButton", openFoodModal],

    ["#addMealButton", openFoodModal],

    ["#journalAddButton", openFoodModal],

    ["#generateDayButton", generateDay],

    ["#emptyGenerateButton", generateDay]

  ];


  buttons.forEach(
    ([selector, action]) => {

      const button =
        $(selector);

      if (button) {

        button.addEventListener(
          "click",
          action
        );

      }

    }
  );


  $$(".add-small-button").forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          openFoodModal();

          const meal =
            button.dataset.meal;

          const select =
            $("#modalFoodMeal");

          if (
            select &&
            meal
          ) {
            select.value = meal;
          }

        }
      );

    }
  );


  const mobileMenuButton =
    $("#mobileMenuButton");

  if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
      "click",
      () => {

        const sidebar =
          $(".sidebar");

        if (sidebar) {

          sidebar.classList.toggle(
            "mobile-open"
          );

        }

      }
    );

  }


  const premiumButton =
    $("#premiumButton");

  if (premiumButton) {

    premiumButton.addEventListener(
      "click",
      () => {

        notify(
          "BudgetCook Premium arrive bientôt ⭐"
        );

      }
    );

  }
}


/* =========================================================
   ÉVÉNEMENTS GLOBAUX
========================================================= */

function setupGlobalEvents() {

  document.addEventListener(
    "click",
    handleGlobalClick
  );

  document.addEventListener(
    "change",
    handleGlobalChange
  );
}


function handleGlobalClick(event) {

  const target =
    event.target.closest(
      "[data-action]"
    );

  if (!target) return;

  const action =
    target.dataset.action;

  switch (action) {

    case "save-profile":
      saveProfileFromDOM();
      break;

    case "generate-day":
      generateDay();
      break;

    case "clear-day":
      clearCurrentDay();
      break;

    case "reset-app":
      resetApp();
      break;

    case "toggle-dark":
      toggleDarkMode();
      break;

    case "add-food":
      openFoodModal();
      break;

    case "add-recipe":
      addRecipeToCurrentMeal(
        target.dataset.recipe,
        target.dataset.meal || "lunch"
      );
      break;

    case "delete-meal-item":
      deleteMealItem(
        target.dataset.meal,
        Number(target.dataset.index)
      );
      break;

    case "add-shopping":
      addShoppingItemFromDOM();
      break;

    case "delete-shopping":
      deleteShoppingItem(
        Number(target.dataset.index)
      );
      break;

    case "toggle-shopping":
      toggleShoppingItem(
        Number(target.dataset.index)
      );
      break;

    case "add-pantry":
      addPantryItemFromDOM();
      break;

    case "delete-pantry":
      deletePantryItem(
        Number(target.dataset.index)
      );
      break;

    case "add-progress":
      addProgressEntryFromDOM();
      break;

    case "favorite-recipe":
      toggleFavorite(
        target.dataset.recipe
      );
      break;
  }
}


function handleGlobalChange(event) {

  const target =
    event.target;

  if (
    target.matches(
      "[data-profile]"
    )
  ) {

    calculateProfilePreview();
  }
}


/* =========================================================
   PROFIL
========================================================= */

function renderProfile() {

  const profile =
    state.profile;

  const mapping = {

    age: profile.age,
    sex: profile.sex,

    height: profile.height,
    weight: profile.weight,

    neck: profile.neck,
    chest: profile.chest,
    waist: profile.waist,
    hip: profile.hip,

    leftArm: profile.leftArm,
    rightArm: profile.rightArm,

    leftThigh: profile.leftThigh,
    rightThigh: profile.rightThigh,

    trainingDays:
      profile.trainingDays,

    activity:
      profile.activity,

    goal:
      profile.goal,

    deficit:
      profile.deficit,

    surplus:
      profile.surplus,

    calorieTarget:
      profile.calorieTarget,

    proteinPerKg:
      profile.proteinPerKg,

    fatPerKg:
      profile.fatPerKg,

    budget:
      profile.budget,

    targetWeight:
      profile.targetWeight,

    targetBodyFat:
      profile.targetBodyFat
  };


  Object.entries(mapping).forEach(
    ([key, value]) => {

      const input =
        document.querySelector(
          `[data-profile="${key}"]`
        );

      if (input) {
        input.value =
          value ?? "";
      }

    }
  );


  calculateProfilePreview();
}


function calculateProfilePreview() {

  const profile =
    getProfileFromDOM();

  if (!profile) return;

  const targets =
    getDailyTargets(profile);

  const bmr =
    calculateBMR(profile);

  const tdee =
    calculateTDEE(profile);

  const bmi =
    calculateBMI(profile);


  setText(
    "[data-profile-bmr]",
    `${Math.round(bmr)} kcal`
  );

  setText(
    "[data-profile-tdee]",
    `${Math.round(tdee)} kcal`
  );

  setText(
    "[data-profile-calories]",
    `${targets.calories} kcal`
  );

  setText(
    "[data-profile-protein]",
    `${targets.protein} g`
  );

  setText(
    "[data-profile-carbs]",
    `${targets.carbs} g`
  );

  setText(
    "[data-profile-fat]",
    `${targets.fat} g`
  );

  setText(
    "[data-profile-bmi]",
    bmi
      ? `${round(bmi, 1)} — ${getBMICategory(bmi)}`
      : "—"
  );
}


function getProfileFromDOM() {

  const inputs =
    $$("[data-profile]");

  if (!inputs.length) {
    return {
      ...state.profile
    };
  }

  const profile = {
    ...state.profile
  };


  inputs.forEach(input => {

    const key =
      input.dataset.profile;

    let value =
      input.value;


    if (
      input.type === "number" ||
      input.type === "range"
    ) {

      value =
        Number(value);

    }


    profile[key] =
      value;

  });


  return profile;
}


function saveProfileFromDOM() {

  const profile =
    getProfileFromDOM();


  state.profile = {
    ...state.profile,
    ...profile
  };


  /*
    Si l'utilisateur n'a pas renseigné
    d'objectif calorique valide,
    on utilise 2000 kcal.
  */

  if (
    !Number.isFinite(
      Number(state.profile.calorieTarget)
    ) ||
    Number(state.profile.calorieTarget) <= 0
  ) {

    state.profile.calorieTarget =
      2000;
  }


  calculateProfileTargets();

  saveState();

  renderProfile();
  renderDashboard();
  renderCoach();

  notify(
    "Profil enregistré ✅"
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  const macros =
    getDailyTargets(
      state.profile
    );

  const day =
    getCurrentDay();

  const totals =
    calculateDayNutrition(day);


  const remainingCalories =
    Math.max(
      0,
      macros.calories -
      totals.kcal
    );


  const caloriePercent =
    macros.calories > 0
      ? Math.min(
          100,
          totals.kcal /
          macros.calories *
          100
        )
      : 0;


  setText(
    "#homeCaloriesConsumed",
    Math.round(totals.kcal)
  );

  setText(
    "#homeCaloriesTarget",
    Math.round(macros.calories)
  );

  setText(
    "#homeCaloriesRemaining",
    `${Math.round(
      remainingCalories
    )} kcal restantes`
  );

  setText(
    "#homeCaloriesPercent",
    `${Math.round(
      caloriePercent
    )}%`
  );


  const remainingProtein =
    Math.max(
      0,
      macros.protein -
      totals.protein
    );

  setText(
    "#homeProteinConsumed",
    round(totals.protein)
  );

  setText(
    "#homeProteinTarget",
    round(macros.protein)
  );


  const remainingCarbs =
    Math.max(
      0,
      macros.carbs -
      totals.carbs
    );

  setText(
    "#homeCarbsConsumed",
    round(totals.carbs)
  );

  setText(
    "#homeCarbsTarget",
    round(macros.carbs)
  );


  const remainingFat =
    Math.max(
      0,
      macros.fat -
      totals.fat
    );

  setText(
    "#homeFatConsumed",
    round(totals.fat)
  );

  setText(
    "#homeFatTarget",
    round(macros.fat)
  );


  updateProgressBar(
    "#homeCaloriesProgress",
    totals.kcal,
    macros.calories
  );

  updateProgressBar(
    "#homeProteinProgress",
    totals.protein,
    macros.protein
  );

  updateProgressBar(
    "#homeCarbsProgress",
    totals.carbs,
    macros.carbs
  );

  updateProgressBar(
    "#homeFatProgress",
    totals.fat,
    macros.fat
  );


  setText(
    "#homeWeight",
    `${Number(
      state.profile.weight
    ) || 0} kg`
  );


  setText(
    "[data-total-kcal]",
    `${Math.round(
      totals.kcal
    )} kcal`
  );

  setText(
    "[data-target-kcal]",
    `${Math.round(
      macros.calories
    )} kcal`
  );

  setText(
    "[data-total-protein]",
    `${round(
      totals.protein
    )} g`
  );

  setText(
    "[data-target-protein]",
    `${round(
      macros.protein
    )} g`
  );

  setText(
    "[data-total-carbs]",
    `${round(
      totals.carbs
    )} g`
  );

  setText(
    "[data-target-carbs]",
    `${round(
      macros.carbs
    )} g`
  );

  setText(
    "[data-total-fat]",
    `${round(
      totals.fat
    )} g`
  );

  setText(
    "[data-target-fat]",
    `${round(
      macros.fat
    )} g`
  );

  setText(
    "[data-remaining-kcal]",
    `${Math.round(
      remainingCalories
    )} kcal`
  );

  setText(
    "[data-remaining-protein]",
    `${round(
      remainingProtein
    )} g`
  );

  setText(
    "[data-remaining-carbs]",
    `${round(
      remainingCarbs
    )} g`
  );

  setText(
    "[data-remaining-fat]",
    `${round(
      remainingFat
    )} g`
  );
}


/* =========================================================
   JOURNAL
========================================================= */

function getCurrentDay() {
  return state.meals || {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  };
}


function renderJournal() {

  const day =
    getCurrentDay();


  const mealNames = {
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    snack: "Collation",
    dinner: "Dîner"
  };


  Object.entries(mealNames).forEach(
    ([meal, label]) => {

      const container =
        document.querySelector(
          `[data-meal-list="${meal}"]`
        );

      if (!container) return;

      const items =
        day[meal] || [];


      if (!items.length) {

        container.innerHTML = `
          <div class="empty-state">
            Aucun aliment
          </div>
        `;

        return;
      }


      container.innerHTML =
        items.map(
          (item, index) => {

            const food =
              getFood(item.food);

            const nutrition =
              calculateFoodNutrition(
                item.food,
                item.grams
              );

            return `
              <div class="meal-item">

                <div>
                  <strong>
                    ${
                      food?.emoji ||
                      "🍽️"
                    }
                    ${
                      escapeHTML(
                        food?.name ||
                        item.food
                      )
                    }
                  </strong>

                  <small>
                    ${item.grams} g
                    ·
                    ${Math.round(
                      nutrition.kcal
                    )} kcal
                  </small>
                </div>

                <div>
                  <small>
                    P ${round(
                      nutrition.protein
                    )}g
                    · G ${round(
                      nutrition.carbs
                    )}g
                    · L ${round(
                      nutrition.fat
                    )}g
                  </small>

                  <button
                    type="button"
                    data-action="delete-meal-item"
                    data-meal="${meal}"
                    data-index="${index}"
                  >
                    ✕
                  </button>
                </div>

              </div>
            `;
          }
        ).join("");


      setText(
        `[data-meal-kcal="${meal}"]`,
        `${Math.round(
          calculateMealNutrition(
            items
          ).kcal
        )} kcal`
      );

    }
  );


  const total =
    calculateDayNutrition(day);

  setText(
    "[data-journal-total-kcal]",
    `${Math.round(
      total.kcal
    )} kcal`
  );
}


/* =========================================================
   AJOUT ALIMENT
========================================================= */

function addFoodToMeal(
  foodId,
  grams,
  meal = "lunch"
) {

  const food =
    getFood(foodId);

  if (!food) {

    notify(
      "Aliment introuvable ❌"
    );

    return;
  }


  grams =
    Number(grams);


  if (
    !grams ||
    grams <= 0
  ) {

    notify(
      "Quantité invalide"
    );

    return;
  }


  if (!state.meals[meal]) {
    state.meals[meal] = [];
  }


  state.meals[meal].push({
    food: foodId,
    grams
  });


  saveState();

  renderJournal();
  renderDashboard();

  closeModal();

  notify(
    `${food.name} ajouté ✅`
  );
}


function deleteMealItem(
  meal,
  index
) {

  if (
    !state.meals[meal]
  ) {
    return;
  }


  state.meals[meal].splice(
    index,
    1
  );


  saveState();

  renderJournal();
  renderDashboard();
}


/* =========================================================
   MODALE
========================================================= */

function openFoodModal() {

  let modal =
    $("#foodModal");


  if (modal) {

    modal.classList.add(
      "active"
    );

    populateFoodModal();

    return;
  }


  modal =
    document.createElement(
      "div"
    );


  modal.id =
    "foodModal";

  modal.className =
    "modal active";


  modal.innerHTML = `

    <div class="modal-content">

      <button
        class="modal-close"
        type="button"
        onclick="closeModal()"
      >
        ✕
      </button>

      <h2>
        Ajouter un aliment
      </h2>

      <label>
        Aliment

        <select id="modalFoodSelect">

          ${
            typeof FOODS !== "undefined"
              ? FOODS.map(
                  food => `
                    <option value="${food.id}">
                      ${food.emoji || "🍽️"}
                      ${escapeHTML(
                        food.name
                      )}
                    </option>
                  `
                ).join("")
              : ""
          }

        </select>

      </label>

      <label>
        Quantité

        <input
          id="modalFoodGrams"
          type="number"
          min="1"
          value="100"
        />

      </label>

      <label>
        Repas

        <select id="modalFoodMeal">

          <option value="breakfast">
            Petit-déjeuner
          </option>

          <option value="lunch">
            Déjeuner
          </option>

          <option value="snack">
            Collation
          </option>

          <option value="dinner">
            Dîner
          </option>

        </select>

      </label>

      <button
        type="button"
        onclick="confirmAddFood()"
      >
        Ajouter
      </button>

    </div>
  `;


  document.body.appendChild(
    modal
  );
}


function populateFoodModal() {

  const select =
    $("#modalFoodSelect");

  if (!select) return;

  if (
    typeof FOODS === "undefined"
  ) {
    return;
  }


  select.innerHTML =
    FOODS.map(
      food => `
        <option value="${food.id}">
          ${food.emoji || "🍽️"}
          ${escapeHTML(food.name)}
        </option>
      `
    ).join("");
}


function confirmAddFood() {

  const food =
    $("#modalFoodSelect")
      ?.value;

  const grams =
    Number(
      $("#modalFoodGrams")
        ?.value
    );

  const meal =
    $("#modalFoodMeal")
      ?.value ||
    "lunch";


  addFoodToMeal(
    food,
    grams,
    meal
  );
}


function closeModal() {

  const modal =
    $("#foodModal");

  if (modal) {

    modal.classList.remove(
      "active"
    );
  }
}


/* =========================================================
   RECETTES
========================================================= */

function renderRecipes() {

  const container =
    $("[data-recipes-list]");

  if (!container) return;


  if (
    typeof RECIPES === "undefined"
  ) {

    container.innerHTML = "";

    return;
  }


  container.innerHTML =
    RECIPES.map(
      recipe => {

        const nutrition =
          calculateRecipeNutrition(
            recipe.id
          );

        const favorite =
          state.favorites.includes(
            recipe.id
          );


        return `

          <article class="recipe-card">

            <div class="recipe-icon">
              ${recipe.emoji || "🍽️"}
            </div>

            <div class="recipe-content">

              <h3>
                ${escapeHTML(
                  recipe.name
                )}
              </h3>

              <div class="recipe-macros">

                <span>
                  ${Math.round(
                    nutrition.kcal
                  )} kcal
                </span>

                <span>
                  P ${round(
                    nutrition.protein
                  )}g
                </span>

                <span>
                  G ${round(
                    nutrition.carbs
                  )}g
                </span>

                <span>
                  L ${round(
                    nutrition.fat
                  )}g
                </span>

              </div>

              <div class="recipe-actions">

                <button
                  type="button"
                  data-action="add-recipe"
                  data-recipe="${recipe.id}"
                  data-meal="lunch"
                >
                  + Déjeuner
                </button>

                <button
                  type="button"
                  data-action="add-recipe"
                  data-recipe="${recipe.id}"
                  data-meal="dinner"
                >
                  + Dîner
                </button>

                <button
                  type="button"
                  data-action="favorite-recipe"
                  data-recipe="${recipe.id}"
                >
                  ${
                    favorite
                      ? "❤️"
                      : "♡"
                  }
                </button>

              </div>

            </div>

          </article>

        `;
      }
    ).join("");
}


function addRecipeToCurrentMeal(
  recipeId,
  meal = "lunch"
) {

  const recipe =
    getRecipe(recipeId);

  if (!recipe) return;


  if (!state.meals[meal]) {
    state.meals[meal] = [];
  }


  (recipe.ingredients || []).forEach(
    ingredient => {

      state.meals[meal].push({

        food:
          ingredient.food,

        grams:
          ingredient.grams

      });

    }
  );


  saveState();

  renderJournal();
  renderDashboard();

  notify(
    `${recipe.name} ajouté ✅`
  );
}


function toggleFavorite(
  recipeId
) {

  const index =
    state.favorites.indexOf(
      recipeId
    );


  if (index >= 0) {

    state.favorites.splice(
      index,
      1
    );

  } else {

    state.favorites.push(
      recipeId
    );
  }


  saveState();

  renderRecipes();
}


/* =========================================================
   GÉNÉRATION JOURNÉE
========================================================= */

function generateDay() {

  const meals = {

    breakfast: [
      {
        food: "oats",
        grams: 60
      },
      {
        food: "milk",
        grams: 250
      },
      {
        food: "greek_yogurt",
        grams: 200
      },
      {
        food: "banana",
        grams: 100
      }
    ],

    lunch: [
      {
        food: "chicken",
        grams: 180
      },
      {
        food: "rice",
        grams: 250
      },
      {
        food: "broccoli",
        grams: 150
      },
      {
        food: "olive_oil",
        grams: 8
      }
    ],

    snack: [
      {
        food: "cottage_cheese",
        grams: 250
      },
      {
        food: "apple",
        grams: 150
      }
    ],

    dinner: [
      {
        food: "tuna",
        grams: 150
      },
      {
        food: "pasta",
        grams: 220
