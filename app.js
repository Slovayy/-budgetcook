/* =========================================================
   BUDGETCOOK V4 — APP.JS
   Logique principale de l'application
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

  // Mensurations
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

  calorieTarget: 0,

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

    return mergeDeep(
      structuredClone(DEFAULT_STATE),
      parsed
    );

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
    ? FOODS.find(food => food.id === foodId)
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


/* =========================================================
   CALCUL NUTRITIONNEL
========================================================= */

function calculateFoodNutrition(
  foodId,
  quantity
) {

  const food =
    getFood(foodId);

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
    recipe.ingredients.map(
      ingredient => ({
        food: ingredient.food,
        grams:
          ingredient.grams *
          multiplier
      })
    );

  return calculateMealNutrition(items);
}


/* =========================================================
   CALORIES PROVENANT DES MACROS
========================================================= */

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
   PROFIL — CALORIES
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

  if (
    profile.sex === "female"
  ) {

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


function calculateCalorieTarget(
  profile = state.profile
) {

  const tdee =
    calculateTDEE(profile);

  let target =
    tdee;

  if (
    profile.goal === "cut"
  ) {

    target -=
      Number(profile.deficit) || 0;
  }

  if (
    profile.goal === "bulk"
  ) {

    target +=
      Number(profile.surplus) || 250;
  }

  if (
    profile.goal === "maintain"
  ) {

    target =
      tdee;
  }

  return Math.max(
    1200,
    Math.round(target)
  );
}


/* =========================================================
   ⭐ SOURCE UNIQUE DES MACROS ⭐

   IMPORTANT :

   Protéines = poids × g/kg protéines
   Lipides = poids × g/kg lipides

   Glucides = calories restantes

   Protéines : 4 kcal/g
   Glucides  : 4 kcal/g
   Lipides   : 9 kcal/g

   Toutes les pages utilisent cette fonction.
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

  const protein =
    weight *
    (
      Number.isFinite(proteinPerKg)
        ? proteinPerKg
        : 2
    );

  const fat =
    weight *
    (
      Number.isFinite(fatPerKg)
        ? fatPerKg
        : 0.8
    );

  const proteinCalories =
    protein * 4;

  const fatCalories =
    fat * 9;

  const remainingCalories =
    calories -
    proteinCalories -
    fatCalories;

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


/*
  Compatibilité avec le reste du projet.
*/

function calculateMacros(
  profile = state.profile
) {

  return getDailyTargets(profile);
}


function calculateProfileTargets() {

  const targets =
    getDailyTargets(state.profile);

  state.profile.calorieTarget =
    targets.calories;

  return targets;
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
   ESTIMATION MASSE GRASSE
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

  if (
    profile.sex === "female"
  ) {

    const hip =
      Number(profile.hip);

    if (!hip) {
      return null;
    }

    const value =
      waist +
      hip -
      neck;

    if (value <= 0) {
      return null;
    }

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

    if (value <= 0) {
      return null;
    }

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

  if (
    !Number.isFinite(bodyFat)
  ) {
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

  const navButtons =
    $$("[data-section]");

  navButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const sectionName =
          button.dataset.section;

        showSection(
          sectionName
        );
      }
    );
  });
}


function showSection(
  sectionName
) {

  $$("[data-page]").forEach(
    page => {

      page.classList.remove(
        "active"
      );

      if (
        page.dataset.page ===
        sectionName
      ) {

        page.classList.add(
          "active"
        );
      }
    }
  );

  $$("[data-section]").forEach(
    button => {

      button.classList.toggle(
        "active",
        button.dataset.section ===
          sectionName
      );
    }
  );
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


function handleGlobalClick(
  event
) {

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
        target.dataset.meal ||
          "lunch"
      );
      break;

    case "delete-meal-item":
      deleteMealItem(
        target.dataset.meal,
        Number(
          target.dataset.index
        )
      );
      break;

    case "add-shopping":
      addShoppingItemFromDOM();
      break;

    case "delete-shopping":
      deleteShoppingItem(
        Number(
          target.dataset.index
        )
      );
      break;

    case "toggle-shopping":
      toggleShoppingItem(
        Number(
          target.dataset.index
        )
      );
      break;

    case "add-pantry":
      addPantryItemFromDOM();
      break;

    case "delete-pantry":
      deletePantryItem(
        Number(
          target.dataset.index
        )
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


function handleGlobalChange(
  event
) {

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

    height:
      profile.height,

    weight:
      profile.weight,

    neck:
      profile.neck,

    chest:
      profile.chest,

    waist:
      profile.waist,

    hip:
      profile.hip,

    leftArm:
      profile.leftArm,

    rightArm:
      profile.rightArm,

    leftThigh:
      profile.leftThigh,

    rightThigh:
      profile.rightThigh,

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

  Object.entries(mapping)
    .forEach(
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


/* =========================================================
   APERÇU PROFIL
========================================================= */

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


/* =========================================================
   ENREGISTREMENT PROFIL
========================================================= */

function saveProfileFromDOM() {

  const profile =
    getProfileFromDOM();

  state.profile = {
    ...state.profile,
    ...profile
  };

  calculateProfileTargets();

  saveState();

  /*
    IMPORTANT :
    on recalcule TOUT immédiatement.
  */

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
    calculateMacros(state.profile);

  const day =
    getCurrentDay();

  const totals =
    calculateDayNutrition(day);


  /* =====================================================
     CALORIES
  ===================================================== */

  const remainingCalories =
    Math.max(
      0,
      macros.calories - totals.kcal
    );

  const caloriePercent =
    macros.calories > 0
      ? Math.min(
          100,
          (totals.kcal / macros.calories) * 100
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
    `${Math.round(remainingCalories)} kcal restantes`
  );

  setText(
    "#homeCaloriesPercent",
    `${Math.round(caloriePercent)}%`
  );


  /* =====================================================
     PROTÉINES
  ===================================================== */

  const remainingProtein =
    Math.max(
      0,
      macros.protein - totals.protein
    );

  setText(
    "#homeProteinConsumed",
    round(totals.protein)
  );

  setText(
    "#homeProteinTarget",
    round(macros.protein)
  );


  /* =====================================================
     GLUCIDES
  ===================================================== */

  const remainingCarbs =
    Math.max(
      0,
      macros.carbs - totals.carbs
    );

  setText(
    "#homeCarbsConsumed",
    round(totals.carbs)
  );

  setText(
    "#homeCarbsTarget",
    round(macros.carbs)
  );


  /* =====================================================
     LIPIDES
  ===================================================== */

  const remainingFat =
    Math.max(
      0,
      macros.fat - totals.fat
    );

  setText(
    "#homeFatConsumed",
    round(totals.fat)
  );

  setText(
    "#homeFatTarget",
    round(macros.fat)
  );


  /* =====================================================
     BARRE CALORIES
  ===================================================== */

  updateProgressBar(
    "#homeCaloriesProgress",
    totals.kcal,
    macros.calories
  );


  /* =====================================================
     BARRE PROTÉINES
  ===================================================== */

  updateProgressBar(
    "#homeProteinProgress",
    totals.protein,
    macros.protein
  );


  /* =====================================================
     BARRE GLUCIDES
  ===================================================== */

  updateProgressBar(
    "#homeCarbsProgress",
    totals.carbs,
    macros.carbs
  );


  /* =====================================================
     BARRE LIPIDES
  ===================================================== */

  updateProgressBar(
    "#homeFatProgress",
    totals.fat,
    macros.fat
  );


  /* =====================================================
     AUTRES INFOS ACCUEIL
  ===================================================== */

  setText(
    "#homeWeight",
    `${Number(state.profile.weight) || 0} kg`
  );


  /*
    On conserve également les anciens sélecteurs
    pour éviter de casser une éventuelle ancienne
    partie de l'interface.
  */

  setText(
    "[data-total-kcal]",
    `${Math.round(totals.kcal)} kcal`
  );

  setText(
    "[data-target-kcal]",
    `${Math.round(macros.calories)} kcal`
  );

  setText(
    "[data-total-protein]",
    `${round(totals.protein)} g`
  );

  setText(
    "[data-target-protein]",
    `${round(macros.protein)} g`
  );

  setText(
    "[data-total-carbs]",
    `${round(totals.carbs)} g`
  );

  setText(
    "[data-target-carbs]",
    `${round(macros.carbs)} g`
  );

  setText(
    "[data-total-fat]",
    `${round(totals.fat)} g`
  );

  setText(
    "[data-target-fat]",
    `${round(macros.fat)} g`
  );

  setText(
    "[data-remaining-kcal]",
    `${Math.round(remainingCalories)} kcal`
  );

  setText(
    "[data-remaining-protein]",
    `${round(remainingProtein)} g`
  );

  setText(
    "[data-remaining-carbs]",
    `${round(remainingCarbs)} g`
  );

  setText(
    "[data-remaining-fat]",
    `${round(remainingFat)} g`
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

  if (!food) return;

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
   MODALE ALIMENT
========================================================= */

function openFoodModal() {

  const existing =
    $("#foodModal");

  if (existing) {

    existing.classList.add(
      "active"
    );

    populateFoodModal();

    return;
  }

  const modal =
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

  recipe.ingredients.forEach(
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
   GÉNÉRATION AUTOMATIQUE DE JOURNÉE
========================================================= */

function generateDay() {

  const target =
    getDailyTargets(
      state.profile
    );

  clearCurrentDay(false);

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
  };

  state.meals =
    meals;

  let totals =
    calculateDayNutrition(
      state.meals
    );

  /*
    Ajustement protéines.
  */

  if (
    totals.protein <
    target.protein
  ) {

    const missing =
      target.protein -
      totals.protein;

    const chicken =
      getFood("chicken");

    const chickenProtein =
      chicken
        ? Number(
            chicken.protein
          )
        : 31;

    const additionalChicken =
      Math.ceil(
        (
          missing /
          chickenProtein
        ) * 100
      );

    state.meals.dinner.push({
      food: "chicken",
      grams:
        additionalChicken
    });
  }

  totals =
    calculateDayNutrition(
      state.meals
    );

  saveState();

  renderJournal();
  renderDashboard();

  notify(
    "Journée générée 🍽️"
  );
}


/* =========================================================
   RESET JOURNÉE
========================================================= */

function clearCurrentDay(
  save = true
) {

  state.meals = {

    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []

  };

  if (save) {
    saveState();
  }

  renderJournal();
  renderDashboard();
}


/* =========================================================
   PLANNER
========================================================= */

function renderPlanner() {

  const container =
    $("[data-planner-list]");

  if (!container) return;

  const days =
    typeof DAYS !== "undefined"
      ? DAYS
      : [
          "Lundi",
          "Mardi",
          "Mercredi",
          "Jeudi",
          "Vendredi",
          "Samedi",
          "Dimanche"
        ];

  container.innerHTML =
    days.map(
      day => {

        const items =
          state.planner[day] ||
          [];

        const nutrition =
          calculateMealNutrition(
            items
          );

        return `

          <div class="planner-day">

            <div class="planner-day-header">

              <strong>
                ${day}
              </strong>

              <span>
                ${Math.round(
                  nutrition.kcal
                )} kcal
              </span>

            </div>

            <div class="planner-day-items">

              ${
                items.length
                  ? items.map(
                      item => {

                        const food =
                          getFood(
                            item.food
                          );

                        return `
                          <div>
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

                            —
                            ${item.grams}g
                          </div>
                        `;
                      }
                    ).join("")
                  : `
                    <small>
                      Aucun repas planifié
                    </small>
                  `
              }

            </div>

          </div>

        `;
      }
    ).join("");
}


function addDayToPlanner(
  day,
  meals
) {

  const days =
    typeof DAYS !== "undefined"
      ? DAYS
      : [];

  if (
    !days.includes(day)
  ) {
    return;
  }

  const items = [

    ...(meals.breakfast || []),
    ...(meals.lunch || []),
    ...(meals.snack || []),
    ...(meals.dinner || [])

  ];

  state.planner[day] =
    structuredClone(items);

  saveState();

  renderPlanner();
}


/* =========================================================
   COURSES
========================================================= */

function renderShopping() {

  const container =
    $("[data-shopping-list]");

  if (!container) return;

  const defaultItems =
    typeof SHOPPING_ITEMS !== "undefined"
      ? SHOPPING_ITEMS
      : [];

  const items =
    state.shopping.length
      ? state.shopping
      : defaultItems.map(
          item => ({
            ...item,
            checked: false
          })
        );

  container.innerHTML =
    items.map(
      (item, index) => `

        <div class="
          shopping-item
          ${item.checked
            ? "checked"
            : ""}
        ">

          <input
            type="checkbox"
            ${
              item.checked
                ? "checked"
                : ""
            }
            onchange="
              toggleShoppingItem(
                ${index}
              )
            "
          />

          <div class="shopping-info">

            <strong>
              ${escapeHTML(
                item.name
              )}
            </strong>

            <small>
              ${escapeHTML(
                item.quantity
              )}
            </small>

          </div>

          <span>
            ${formatEuro(
              item.price
            )}
          </span>

          <button
            type="button"
            data-action="delete-shopping"
            data-index="${index}"
          >
            ✕
          </button>

        </div>

      `
    ).join("");

  if (
    !state.shopping.length
  ) {

    state.shopping =
      items.map(
        item => ({
          ...item
        })
      );

    saveState();
  }

  renderShoppingTotal();
}


function renderShoppingTotal() {

  const total =
    state.shopping.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.price || 0
        ),
      0
    );

  setText(
    "[data-shopping-total]",
    formatEuro(total)
  );
}


function addShoppingItem(
  item
) {

  state.shopping.push({

    id:
      item.id ||
      `custom-${Date.now()}`,

    name:
      item.name,

    quantity:
      item.quantity ||
      "1",

    price:
      Number(
        item.price
      ) || 0,

    checked:
      false
  });

  saveState();

  renderShopping();
}


function addShoppingItemFromDOM() {

  const name =
    $(
      "[data-shopping-name]"
    )?.value;

  const quantity =
    $(
      "[data-shopping-quantity]"
    )?.value;

  const price =
    Number(
      $(
        "[data-shopping-price]"
      )?.value
    );

  if (!name) {

    notify(
      "Indique un aliment"
    );

    return;
  }

  addShoppingItem({
    name,
    quantity,
    price
  });
}


function deleteShoppingItem(
  index
) {

  state.shopping.splice(
    index,
    1
  );

  saveState();

  renderShopping();
}


function toggleShoppingItem(
  index
) {

  if (
    !state.shopping[index]
  ) {
    return;
  }

  state.shopping[index].checked =
    !state.shopping[index].checked;

  saveState();

  renderShopping();
}


/* =========================================================
   GÉNÉRATION COURSES
========================================================= */

function generateShoppingFromPlanner() {

  const totals = {};

  const days =
    typeof DAYS !== "undefined"
      ? DAYS
      : [];

  days.forEach(
    day => {

      const items =
        state.planner[day] ||
        [];

      items.forEach(
        item => {

          if (
            !totals[item.food]
          ) {

            totals[item.food] =
              0;
          }

          totals[item.food] +=
            Number(
              item.grams
            ) || 0;
        }
      );
    }
  );

  const shopping = [];

  Object.entries(
    totals
  ).forEach(
    ([foodId, grams]) => {

      const food =
        getFood(foodId);

      if (!food) return;

      shopping.push({

        id:
          foodId,

        name:
          food.name,

        quantity:
          `${Math.ceil(
            grams
          )} g`,

        price:
          0,

        checked:
          false
      });
    }
  );

  state.shopping =
    shopping;

  saveState();

  renderShopping();
}


/* =========================================================
   PANTRY
========================================================= */

function renderPantry() {

  const container =
    $("[data-pantry-list]");

  if (!container) return;

  container.innerHTML =
    state.pantry.length

      ? state.pantry
          .map(
            (item, index) => `

              <div class="pantry-item">

                <span>
                  ${escapeHTML(
                    item.name
                  )}
                </span>

                <span>
                  ${escapeHTML(
                    item.quantity
                  )}
                </span>

                <button
                  type="button"
                  data-action="delete-pantry"
                  data-index="${index}"
                >
                  ✕
                </button>

              </div>

            `
          )
          .join("")

      : `
          <div class="empty-state">
            Garde-manger vide
          </div>
        `;
}


function addPantryItem(
  item
) {

  state.pantry.push({

    id:
      item.id ||
      `pantry-${Date.now()}`,

    name:
      item.name,

    quantity:
      item.quantity ||
      "1",

    expiration:
      item.expiration ||
      ""
  });

  saveState();

  renderPantry();
}


function addPantryItemFromDOM() {

  const name =
    $(
      "[data-pantry-name]"
    )?.value;

  const quantity =
    $(
      "[data-pantry-quantity]"
    )?.value;

  if (!name) {

    notify(
      "Indique un aliment"
    );

    return;
  }

  addPantryItem({
    name,
    quantity
  });
}


function deletePantryItem(
  index
) {

  state.pantry.splice(
    index,
    1
  );

  saveState();

  renderPantry();
}


/* =========================================================
   PROGRESSION
========================================================= */

function renderProgress() {

  const container =
    $("[data-progress-list]");

  if (!container) return;

  const entries =
    [
      ...state.progress
    ].reverse();

  container.innerHTML =
    entries.length

      ? entries.map(
          entry => `

            <div class="progress-entry">

              <strong>
                ${escapeHTML(
                  entry.date
                )}
              </strong>

              <span>
                ${entry.weight} kg
              </span>

              ${
                entry.bodyFat
                  ? `
                    <span>
                      ${entry.bodyFat}% MG
                    </span>
                  `
                  : ""
              }

              ${
                entry.waist
                  ? `
                    <span>
                      ${entry.waist}
                      cm tour de taille
                    </span>
                  `
                  : ""
              }

              ${
                entry.chest
                  ? `
                    <span>
                      ${entry.chest}
                      cm poitrine
                    </span>
                  `
                  : ""
              }

              ${
                entry.hip
                  ? `
                    <span>
                      ${entry.hip}
                      cm hanches
                    </span>
                  `
                  : ""
              }

            </div>

          `
        ).join("")

      : `
          <div class="empty-state">
            Aucune mesure enregistrée
          </div>
        `;
}


function addProgressEntry(
  entry
) {

  state.progress.push({

    date:
      entry.date ||
      new Date()
        .toISOString()
        .split("T")[0],

    weight:
      Number(
        entry.weight
      ) || 0,

    bodyFat:
      Number(
        entry.bodyFat
      ) || 0,

    neck:
      Number(
        entry.neck
      ) || 0,

    chest:
      Number(
        entry.chest
      ) || 0,

    waist:
      Number(
        entry.waist
      ) || 0,

    hip:
      Number(
        entry.hip
      ) || 0,

    leftArm:
      Number(
        entry.leftArm
      ) || 0,

    rightArm:
      Number(
        entry.rightArm
      ) || 0,

    leftThigh:
      Number(
        entry.leftThigh
      ) || 0,

    rightThigh:
      Number(
        entry.rightThigh
      ) || 0

  });

  saveState();

  renderProgress();
}


function addProgressEntryFromDOM() {

  const weight =
    Number(
      $(
        "[data-progress-weight]"
      )?.value
    );

  const bodyFat =
    Number(
      $(
        "[data-progress-bodyfat]"
      )?.value
    );

  const waist =
    Number(
      $(
        "[data-progress-waist]"
      )?.value
    );

  if (!weight) {

    notify(
      "Indique ton poids"
    );

    return;
  }

  addProgressEntry({
    weight,
    bodyFat,
    waist
  });

  notify(
    "Mesure enregistrée 📈"
  );
}


/* =========================================================
   COACH
========================================================= */

function renderCoach() {

  const container =
    $("[data-coach-content]");

  if (!container) return;

  const profile =
    state.profile;

  const targets =
    getDailyTargets(profile);

  const bmi =
    calculateBMI(profile);

  const bodyFat =
    calculateBodyFat(profile);

  const currentWeight =
    Number(
      profile.weight
    ) || 0;

  const targetWeight =
    Number(
      profile.targetWeight
    ) || 0;

  const advice = [];

  if (
    profile.goal === "cut"
  ) {

    advice.push(
      `Objectif déficit : ${profile.deficit} kcal/jour.`
    );
  }

  if (
    profile.goal === "bulk"
  ) {

    advice.push(
      "Objectif : surplus calorique contrôlé."
    );
  }

  if (
    profile.goal === "maintain"
  ) {

    advice.push(
      "Objectif : maintien du poids."
    );
  }

  advice.push(
    `Protéines : ${targets.protein} g/jour.`
  );

  advice.push(
    `Lipides : ${targets.fat} g/jour.`
  );

  advice.push(
    `Glucides : ${targets.carbs} g/jour.`
  );

  if (bmi) {

    advice.push(
      `IMC calculé : ${round(
        bmi,
        1
      )} (${getBMICategory(
        bmi
      )}).`
    );
  }

  if (
    bodyFat !== null
  ) {

    advice.push(
      `Masse grasse estimée : ${round(
        bodyFat,
        1
      )} %.`
    );
  }

  if (
    targetWeight &&
    currentWeight
  ) {

    const difference =
      currentWeight -
      targetWeight;

    if (
      difference > 0
    ) {

      advice.push(
        `Il reste environ ${round(
          difference,
          1
        )} kg jusqu'au poids cible.`
      );
    }
  }

  container.innerHTML = `
    <div class="coach-card">

      <h3>
        Coach BudgetCook 🧠
      </h3>

      ${advice
        .map(
          text => `
            <p>
              ${escapeHTML(
                text
              )}
            </p>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   PARAMÈTRES
========================================================= */

function applySettings() {

  document.body.classList.toggle(
    "dark-mode",
    state.settings.darkMode
  );
}


function toggleDarkMode() {

  state.settings.darkMode =
    !state.settings.darkMode;

  saveState();

  applySettings();
}


function resetApp() {

  const confirmed =
    confirm(
      "Supprimer toutes les données BudgetCook ?"
    );

  if (!confirmed) return;

  state =
    structuredClone(
      DEFAULT_STATE
    );

  saveState();

  location.reload();
}


/* =========================================================
   UI HELPERS
========================================================= */

function setText(
  selector,
  value
) {

  const element =
    $(selector);

  if (element) {
    element.textContent =
      value;
  }
}


function updateProgressBar(
  selector,
  current,
  target
) {

  const element =
    $(selector);

  if (!element) return;

  const percentage =
    target > 0
      ? clamp(
          (
            current /
            target
          ) * 100,
          0,
          100
        )
      : 0;

  element.style.width =
    `${percentage}%`;
}


function notify(
  message
) {

  let notification =
    $("#budgetcookNotification");

  if (!notification) {

    notification =
      document.createElement(
        "div"
      );

    notification.id =
      "budgetcookNotification";

    notification.className =
      "budgetcook-notification";

    document.body.appendChild(
      notification
    );
  }

  notification.textContent =
    message;

  notification.classList.add(
    "show"
  );

  clearTimeout(
    notification._timer
  );

  notification._timer =
    setTimeout(
      () => {

        notification.classList.remove(
          "show"
        );

      },
      2500
    );
}


/* =========================================================
   OUTILS NUTRITIONNELS
========================================================= */

function getFoodPer100g(
  foodId
) {

  const food =
    getFood(foodId);

  if (!food) return null;

  return {

    kcal:
      food.kcal,

    protein:
      food.protein,

    carbs:
      food.carbs,

    fat:
      food.fat

  };
}


function getDailyMacroPercentages() {

  const targets =
    getDailyTargets(
      state.profile
    );

  const proteinCalories =
    targets.protein * 4;

  const carbCalories =
    targets.carbs * 4;

  const fatCalories =
    targets.fat * 9;

  const total =
    proteinCalories +
    carbCalories +
    fatCalories;

  if (!total) {

    return {
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }

  return {

    protein:
      round(
        proteinCalories /
        total *
        100
      ),

    carbs:
      round(
        carbCalories /
        total *
        100
      ),

    fat:
      round(
        fatCalories /
        total *
        100
      )
  };
}


/* =========================================================
   ANALYSE REPAS
========================================================= */

function analyzeMeal(
  items
) {

  const nutrition =
    calculateMealNutrition(
      items
    );

  const caloriesFromMacros =
    calculateMacroCalories(
      nutrition.protein,
      nutrition.carbs,
      nutrition.fat
    );

  return {

    ...nutrition,

    caloriesFromMacros:
      round(
        caloriesFromMacros
      ),

    calorieDifference:
      round(
        nutrition.kcal -
        caloriesFromMacros
      )

  };
}


/* =========================================================
   RECHERCHE
========================================================= */

function searchFoods(
  query
) {

  const q =
    String(
      query || ""
    )
      .trim()
      .toLowerCase();

  if (!q) {

    return typeof FOODS !== "undefined"
      ? FOODS
      : [];
  }

  return (
    typeof FOODS !== "undefined"
      ? FOODS
      : []
  ).filter(
    food =>
      food.name
        .toLowerCase()
        .includes(q)
  );
}


function searchRecipes(
  query
) {

  const q =
    String(
      query || ""
    )
      .trim()
      .toLowerCase();

  if (!q) {

    return typeof RECIPES !== "undefined"
      ? RECIPES
      : [];
  }

  return (
    typeof RECIPES !== "undefined"
      ? RECIPES
      : []
  ).filter(
    recipe =>
      recipe.name
        .toLowerCase()
        .includes(q)
  );
}


/* =========================================================
   BUDGET
========================================================= */

function calculateShoppingBudget() {

  return state.shopping.reduce(
    (
      total,
      item
    ) =>
      total +
      Number(
        item.price || 0
      ),
    0
  );
}


function getRemainingBudget() {

  const budget =
    Number(
      state.profile.budget
    ) || 0;

  return Math.max(
    0,
    budget -
      calculateShoppingBudget()
  );
}


/* =========================================================
   EXPORT
========================================================= */

function exportData() {

  const data =
    JSON.stringify(
      state,
      null,
      2
    );

  const blob =
    new Blob(
      [data],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    "budgetcook-backup.json";

  link.click();

  URL.revokeObjectURL(
    url
  );
}


function importData(
  file
) {

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload =
    event => {

      try {

        const imported =
          JSON.parse(
            event.target.result
          );

        state =
          mergeDeep(
            structuredClone(
              DEFAULT_STATE
            ),
            imported
          );

        saveState();

        location.reload();

      } catch (error) {

        console.error(
          error
        );

        notify(
          "Fichier invalide ❌"
        );
      }
    };

  reader.readAsText(
    file
  );
}


/* =========================================================
   EXPOSITION GLOBALE
========================================================= */

window.BudgetCook = {

  state,

  FOODS:
    typeof FOODS !== "undefined"
      ? FOODS
      : [],

  RECIPES:
    typeof RECIPES !== "undefined"
      ? RECIPES
      : [],

  SHOPPING_ITEMS:
    typeof SHOPPING_ITEMS !== "undefined"
      ? SHOPPING_ITEMS
      : [],

  DAYS:
    typeof DAYS !== "undefined"
      ? DAYS
      : [],

  getDailyTargets,

  calculateFoodNutrition,
  calculateMealNutrition,
  calculateRecipeNutrition,

  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,

  calculateBMI,
  calculateBodyFat,

  calculateDayNutrition,

  addFoodToMeal,
  addRecipeToCurrentMeal,

  generateDay,

  generateShoppingFromPlanner,

  addShoppingItem,
  addPantryItem,
  addProgressEntry,

  searchFoods,
  searchRecipes,

  exportData,
  importData,

  saveState

};


/* =========================================================
   COMPATIBILITÉ HTML
========================================================= */

window.saveProfileFromDOM =
  saveProfileFromDOM;

window.generateDay =
  generateDay;

window.clearCurrentDay =
  clearCurrentDay;

window.addFoodToMeal =
  addFoodToMeal;

window.confirmAddFood =
  confirmAddFood;

window.closeModal =
  closeModal;

window.toggleShoppingItem =
  toggleShoppingItem;

window.deleteShoppingItem =
  deleteShoppingItem;

window.addShoppingItemFromDOM =
  addShoppingItemFromDOM;

window.addPantryItemFromDOM =
  addPantryItemFromDOM;

window.deletePantryItem =
  deletePantryItem;

window.addProgressEntryFromDOM =
  addProgressEntryFromDOM;

window.toggleFavorite =
  toggleFavorite;

window.toggleDarkMode =
  toggleDarkMode;

window.resetApp =
  resetApp;

window.exportData =
  exportData;

window.importData =
  importData;
