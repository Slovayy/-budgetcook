/* =========================================================
   BUDGETCOOK V4 — APP.JS
   VERSION PROPRE ET STABLE
========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const APP_KEY = "budgetcook_v4";

const DEFAULT_PROFILE = {
  age: 20,
  sex: "male",
  height: 179,
  weight: 88,

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

  proteinPerKg: 2,
  fatPerKg: 0.8,

  budget: 50,

  targetWeight: 0,
  targetBodyFat: 0
};

const DEFAULT_STATE = {
  profile: { ...DEFAULT_PROFILE },

  selectedDate: new Date().toISOString().split("T")[0],

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
   ÉTAT
========================================================= */

let state = loadState();

/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return [...document.querySelectorAll(selector)];
}

function setText(selector, value) {
  const el = $(selector);
  if (el) el.textContent = value;
}

function round(value, decimals = 1) {
  const n = Number(value) || 0;
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNumber(value, decimals = 0) {
  return Number(value || 0).toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatEuro(value) {
  return `${formatNumber(value, 2)} €`;
}

/* =========================================================
   DATA
========================================================= */

function getFood(foodId) {
  if (typeof FOODS === "undefined") return null;

  return FOODS.find(food =>
    String(food.id) === String(foodId)
  ) || null;
}

function getRecipe(recipeId) {
  if (typeof RECIPES === "undefined") return null;

  return RECIPES.find(recipe =>
    String(recipe.id) === String(recipeId)
  ) || null;
}

/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadState() {
  try {
    const saved = localStorage.getItem(APP_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_STATE);
    }

    const parsed = JSON.parse(saved);

    return mergeDeep(
      structuredClone(DEFAULT_STATE),
      parsed
    );

  } catch (error) {
    console.error("BudgetCook load error:", error);
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
    console.error("BudgetCook save error:", error);
  }
}

function mergeDeep(target, source) {
  if (!source || typeof source !== "object") {
    return target;
  }

  Object.keys(source).forEach(key => {
    const value = source[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }

      mergeDeep(target[key], value);

    } else {
      target[key] = value;
    }
  });

  return target;
}

/* =========================================================
   NUTRITION
========================================================= */

function calculateFoodNutrition(foodId, grams) {
  const food = getFood(foodId);

  if (!food) {
    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }

  const factor = (Number(grams) || 0) / 100;

  return {
    kcal: Number(food.kcal || 0) * factor,
    protein: Number(food.protein || 0) * factor,
    carbs: Number(food.carbs || 0) * factor,
    fat: Number(food.fat || 0) * factor
  };
}

function calculateMealNutrition(items = []) {
  const total = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  items.forEach(item => {
    const n = calculateFoodNutrition(
      item.food,
      item.grams
    );

    total.kcal += n.kcal;
    total.protein += n.protein;
    total.carbs += n.carbs;
    total.fat += n.fat;
  });

  return total;
}

function calculateDayNutrition(meals = state.meals) {
  const allItems = [
    ...(meals?.breakfast || []),
    ...(meals?.lunch || []),
    ...(meals?.snack || []),
    ...(meals?.dinner || [])
  ];

  return calculateMealNutrition(allItems);
}

function getCurrentDay() {
  return state.meals || {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  };
}

function calculateRecipeNutrition(recipeId, multiplier = 1) {
  const recipe = getRecipe(recipeId);

  if (!recipe || !Array.isArray(recipe.ingredients)) {
    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }

  return calculateMealNutrition(
    recipe.ingredients.map(item => ({
      food: item.food,
      grams: Number(item.grams || 0) * multiplier
    }))
  );
}

function calculateMacroCalories(protein, carbs, fat) {
  return (
    Number(protein || 0) * 4 +
    Number(carbs || 0) * 4 +
    Number(fat || 0) * 9
  );
}

/* =========================================================
   CALORIES
========================================================= */

function calculateBMR(profile = state.profile) {
  const weight = Number(profile.weight) || 0;
  const height = Number(profile.height) || 0;
  const age = Number(profile.age) || 0;

  if (!weight || !height || !age) {
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

function calculateTDEE(profile = state.profile) {
  const bmr = calculateBMR(profile);
  const activity = Number(profile.activity) || 1.2;

  return bmr * activity;
}

function calculateCalorieTarget(profile = state.profile) {
  const tdee = calculateTDEE(profile);

  let target = tdee;

  if (profile.goal === "cut") {
    target -= Number(profile.deficit) || 0;
  }

  if (profile.goal === "bulk") {
    target += Number(profile.surplus) || 250;
  }

  if (profile.goal === "maintain") {
    target = tdee;
  }

  return Math.max(1200, Math.round(target));
}

/* =========================================================
   ⭐ MACROS — SOURCE UNIQUE
========================================================= */

function getDailyTargets(profile = state.profile) {
  const calories = calculateCalorieTarget(profile);

  const weight = Number(profile.weight) || 0;

  const proteinPerKg =
    Number.isFinite(Number(profile.proteinPerKg))
      ? Number(profile.proteinPerKg)
      : 2;

  const fatPerKg =
    Number.isFinite(Number(profile.fatPerKg))
      ? Number(profile.fatPerKg)
      : 0.8;

  const protein = weight * proteinPerKg;
  const fat = weight * fatPerKg;

  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;

  const remainingCalories =
    calories -
    proteinCalories -
    fatCalories;

  const carbs = Math.max(
    0,
    remainingCalories / 4
  );

  return {
    calories: Math.round(calories),

    protein: round(protein, 1),

    carbs: round(carbs, 1),

    fat: round(fat, 1),

    proteinCalories: round(
      proteinCalories,
      1
    ),

    carbCalories: round(
      carbs * 4,
      1
    ),

    fatCalories: round(
      fatCalories,
      1
    ),

    totalMacroCalories: round(
      proteinCalories +
      carbs * 4 +
      fatCalories,
      1
    )
  };
}

function calculateMacros(profile = state.profile) {
  return getDailyTargets(profile);
}

function calculateProfileTargets() {
  const targets = getDailyTargets(state.profile);

  state.profile.calorieTarget =
    targets.calories;

  return targets;
}

/* =========================================================
   IMC
========================================================= */

function calculateBMI(profile = state.profile) {
  const weight = Number(profile.weight) || 0;
  const height = (Number(profile.height) || 0) / 100;

  if (!weight || !height) return 0;

  return weight / (height * height);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return "Insuffisance pondérale";
  if (bmi < 25) return "Corpulence normale";
  if (bmi < 30) return "Surpoids";
  return "Obésité";
}

/* =========================================================
   MASSE GRASSE
========================================================= */

function calculateBodyFat(profile = state.profile) {
  const height = Number(profile.height);
  const neck = Number(profile.neck);
  const waist = Number(profile.waist);

  if (!height || !neck || !waist) {
    return null;
  }

  let bodyFat;

  if (profile.sex === "female") {
    const hip = Number(profile.hip);

    if (!hip) return null;

    const value = waist + hip - neck;

    if (value <= 0) return null;

    bodyFat =
      495 /
      (
        1.29579 -
        0.35004 * Math.log10(value) +
        0.22100 * Math.log10(height)
      ) -
      450;

  } else {
    const value = waist - neck;

    if (value <= 0) return null;

    bodyFat =
      495 /
      (
        1.0324 -
        0.19077 * Math.log10(value) +
        0.15456 * Math.log10(height)
      ) -
      450;
  }

  if (!Number.isFinite(bodyFat)) {
    return null;
  }

  return clamp(bodyFat, 2, 60);
}

/* =========================================================
   NAVIGATION
========================================================= */

function showSection(sectionName) {
  if (!sectionName) return;

  const pages = $$("[data-page]");

  pages.forEach(page => {
    const pageName =
      page.dataset.page ||
      page.id?.replace(/^page-/, "");

    page.classList.toggle(
      "active",
      pageName === sectionName
    );
  });

  $$("[data-section], [data-page]").forEach(button => {
    const value =
      button.dataset.section ||
      button.dataset.page;

    button.classList.toggle(
      "active",
      value === sectionName
    );
  });

  try {
    localStorage.setItem(
      `${APP_KEY}_section`,
      sectionName
    );
  } catch (_) {}
}

function setupNavigation() {
  $$("[data-section], [data-page]").forEach(button => {
    button.addEventListener("click", event => {
      const section =
        button.dataset.section ||
        button.dataset.page;

      if (section) {
        event.preventDefault();
        showSection(section);
      }
    });
  });

  const savedSection =
    localStorage.getItem(
      `${APP_KEY}_section`
    );

  if (savedSection) {
    showSection(savedSection);
  }
}

/* =========================================================
   PROFIL
========================================================= */

function getProfileFromDOM() {
  const inputs = $$("[data-profile]");

  const profile = {
    ...state.profile
  };

  inputs.forEach(input => {
    const key = input.dataset.profile;

    if (!key) return;

    let value = input.value;

    if (
      input.type === "number" ||
      input.type === "range"
    ) {
      value = Number(value);
    }

    profile[key] = value;
  });

  return profile;
}

function renderProfile() {
  const profile = state.profile;

  Object.entries(profile).forEach(
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
  const profile = getProfileFromDOM();

  const targets =
    getDailyTargets(profile);

  setText(
    "[data-profile-bmr]",
    `${Math.round(
      calculateBMR(profile)
    )} kcal`
  );

  setText(
    "[data-profile-tdee]",
    `${Math.round(
      calculateTDEE(profile)
    )} kcal`
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

  const bmi = calculateBMI(profile);

  setText(
    "[data-profile-bmi]",
    bmi
      ? `${round(bmi, 1)} — ${getBMICategory(bmi)}`
      : "—"
  );
}

function saveProfileFromDOM() {
  const profile = getProfileFromDOM();

  state.profile = {
    ...state.profile,
    ...profile
  };

  calculateProfileTargets();

  saveState();

  renderProfile();
  renderDashboard();
  renderCoach();

  notify("Profil enregistré ✅");
}

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {
  const targets =
    getDailyTargets(state.profile);

  const totals =
    calculateDayNutrition(
      getCurrentDay()
    );

  const remainingCalories =
    Math.max(
      0,
      targets.calories - totals.kcal
    );

  const remainingProtein =
    Math.max(
      0,
      targets.protein - totals.protein
    );

  const remainingCarbs =
    Math.max(
      0,
      targets.carbs - totals.carbs
    );

  const remainingFat =
    Math.max(
      0,
      targets.fat - totals.fat
    );

  setText(
    "#homeCaloriesConsumed",
    Math.round(totals.kcal)
  );

  setText(
    "#homeCaloriesTarget",
    Math.round(targets.calories)
  );

  setText(
    "#homeCaloriesRemaining",
    `${Math.round(
      remainingCalories
    )} kcal restantes`
  );

  setText(
    "#homeCaloriesPercent",
    targets.calories
      ? `${Math.round(
          (totals.kcal /
            targets.calories) *
            100
        )}%`
      : "0%"
  );

  setText(
    "#homeProteinConsumed",
    round(totals.protein)
  );

  setText(
    "#homeProteinTarget",
    round(targets.protein)
  );

  setText(
    "#homeCarbsConsumed",
    round(totals.carbs)
  );

  setText(
    "#homeCarbsTarget",
    round(targets.carbs)
  );

  setText(
    "#homeFatConsumed",
    round(totals.fat)
  );

  setText(
    "#homeFatTarget",
    round(targets.fat)
  );

  setText(
    "#homeWeight",
    `${Number(state.profile.weight) || 0} kg`
  );

  setText(
    "[data-total-kcal]",
    `${Math.round(totals.kcal)} kcal`
  );

  setText(
    "[data-target-kcal]",
    `${Math.round(targets.calories)} kcal`
  );

  setText(
    "[data-total-protein]",
    `${round(totals.protein)} g`
  );

  setText(
    "[data-target-protein]",
    `${round(targets.protein)} g`
  );

  setText(
    "[data-total-carbs]",
    `${round(totals.carbs)} g`
  );

  setText(
    "[data-target-carbs]",
    `${round(targets.carbs)} g`
  );

  setText(
    "[data-total-fat]",
    `${round(totals.fat)} g`
  );

  setText(
    "[data-target-fat]",
    `${round(targets.fat)} g`
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

  updateProgressBar(
    "#homeCaloriesProgress",
    totals.kcal,
    targets.calories
  );

  updateProgressBar(
    "#homeProteinProgress",
    totals.protein,
    targets.protein
  );

  updateProgressBar(
    "#homeCarbsProgress",
    totals.carbs,
    targets.carbs
  );

  updateProgressBar(
    "#homeFatProgress",
    totals.fat,
    targets.fat
  );
}

/* =========================================================
   JOURNAL
========================================================= */

function renderJournal() {
  const container =
    $("[data-journal-list]") ||
    $("[data-meals-list]");

  if (!container) return;

  const meals = [
    ["breakfast", "Petit-déjeuner"],
    ["lunch", "Déjeuner"],
    ["snack", "Collation"],
    ["dinner", "Dîner"]
  ];

  container.innerHTML = meals.map(
    ([key, title]) => {

      const items =
        state.meals[key] || [];

      const nutrition =
        calculateMealNutrition(items);

      return `
        <section class="meal-card">
          <div class="meal-header">
            <h3>${title}</h3>
            <span>
              ${Math.round(
                nutrition.kcal
              )} kcal
            </span>
          </div>

          <div class="meal-items">
            ${
              items.length
                ? items.map(
                    (item, index) => {
                      const food =
                        getFood(item.food);

                      const n =
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
                              · ${Math.round(
                                n.kcal
                              )} kcal
                              · P ${round(
                                n.protein
                              )} g
                              · G ${round(
                                n.carbs
                              )} g
                              · L ${round(
                                n.fat
                              )} g
                            </small>
                          </div>

                          <button
                            type="button"
                            data-action="delete-meal-item"
                            data-meal="${key}"
                            data-index="${index}"
                          >
                            ✕
                          </button>
                        </div>
                      `;
                    }
                  ).join("")
                : `
                  <div class="empty-state">
                    Aucun aliment
                  </div>
                `
            }
          </div>
        </section>
      `;
    }
  ).join("");
}

/* =========================================================
   ALIMENTS
========================================================= */

function addFoodToMeal(
  foodId,
  grams,
  meal = "lunch"
) {
  const food = getFood(foodId);

  if (!food) {
    notify("Aliment introuvable ❌");
    return;
  }

  const quantity = Number(grams);

  if (!quantity || quantity <= 0) {
    notify("Quantité invalide ❌");
    return;
  }

  if (!state.meals[meal]) {
    state.meals[meal] = [];
  }

  state.meals[meal].push({
    food: food.id,
    grams: quantity
  });

  saveState();

  renderJournal();
  renderDashboard();

  closeModal();

  notify("Aliment ajouté ✅");
}

function deleteMealItem(meal, index) {
  if (!state.meals[meal]) return;

  state.meals[meal].splice(index, 1);

  saveState();

  renderJournal();
  renderDashboard();
}

/* =========================================================
   MODALE ALIMENT
========================================================= */

function openFoodModal() {
  let modal = $("#foodModal");

  if (!modal) {
    modal = document.createElement("div");

    modal.id = "foodModal";
    modal.className = "modal active";

    modal.innerHTML = `
      <div class="modal-content">

        <button
          type="button"
          class="modal-close"
          onclick="closeModal()"
        >
          ✕
        </button>

        <h2>Ajouter un aliment</h2>

        <label>
          Aliment

          <select id="modalFoodSelect">
            ${
              typeof FOODS !== "undefined"
                ? FOODS.map(
                    food => `
                      <option value="${food.id}">
                        ${
                          food.emoji ||
                          "🍽️"
                        }
                        ${
                          escapeHTML(
                            food.name
                          )
                        }
                      </option>
                    `
                  ).join("")
                : ""
            }
          </select>
        </label>

        <label>
          Quantité (g)

          <input
            id="modalFoodGrams"
            type="number"
            min="1"
            value="100"
          >
        </label>

        <label>
          Repas

          <select id="modalFoodMeal">
            <option value="breakfast">
              Petit-déjeuner
            </option>

            <option value="lunch" selected>
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

    document.body.appendChild(modal);

  } else {
    modal.classList.add("active");
    populateFoodModal();
  }
}

function populateFoodModal() {
  const select = $("#modalFoodSelect");

  if (!select) return;

  if (typeof FOODS === "undefined") {
    select.innerHTML = "";
    return;
  }

  select.innerHTML =
    FOODS.map(
      food => `
        <option value="${food.id}">
          ${
            food.emoji ||
            "🍽️"
          }
          ${
            escapeHTML(
              food.name
            )
          }
        </option>
      `
    ).join("");
}

function confirmAddFood() {
  const food =
    $("#modalFoodSelect")?.value;

  const grams =
    Number(
      $("#modalFoodGrams")?.value
    );

  const meal =
    $("#modalFoodMeal")?.value ||
    "lunch";

  addFoodToMeal(
    food,
    grams,
    meal
  );
}

function closeModal() {
  const modal = $("#foodModal");

  if (modal) {
    modal.classList.remove("active");
  }
}

/* =========================================================
   RECETTES
========================================================= */

function renderRecipes() {
  const container =
    $("[data-recipes-list]");

  if (!container) return;

  if (typeof RECIPES === "undefined") {
    container.innerHTML = "";
    return;
  }

  container.innerHTML =
    RECIPES.map(recipe => {

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
            ${
              recipe.emoji ||
              "🍽️"
            }
          </div>

          <div class="recipe-content">

            <h3>
              ${
                escapeHTML(
                  recipe.name
                )
              }
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
                )} g
              </span>

              <span>
                G ${round(
                  nutrition.carbs
                )} g
              </span>

              <span>
                L ${round(
                  nutrition.fat
                )} g
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
    }).join("");
}

function addRecipeToCurrentMeal(
  recipeId,
  meal = "lunch"
) {
  const recipe = getRecipe(recipeId);

  if (!recipe) {
    notify("Recette introuvable ❌");
    return;
  }

  if (!state.meals[meal]) {
    state.meals[meal] = [];
  }

  (recipe.ingredients || []).forEach(
    ingredient => {
      state.meals[meal].push({
        food: ingredient.food,
        grams: Number(
          ingredient.grams || 0
        )
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

function toggleFavorite(recipeId) {
  const index =
    state.favorites.indexOf(recipeId);

  if (index >= 0) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push(recipeId);
  }

  saveState();
  renderRecipes();
}

/* =========================================================
   GÉNÉRATION JOURNÉE
========================================================= */

function generateDay() {
  if (
    typeof FOODS === "undefined" ||
    !FOODS.length
  ) {
    notify("Aucun aliment disponible ❌");
    return;
  }

  const target =
    getDailyTargets(
      state.profile
    );

  const findFood = (...ids) => {
    for (const id of ids) {
      const food = getFood(id);
      if (food) return food.id;
    }

    return null;
  };

  const breakfast = [];
  const lunch = [];
  const snack = [];
  const dinner = [];

  const oats =
    findFood("oats", "avoine");

  const milk =
    findFood("milk", "lait");

  const yogurt =
    findFood(
      "greek_yogurt",
      "yogurt",
      "yaourt"
    );

  const banana =
    findFood("banana", "banane");

  const chicken =
    findFood(
      "chicken",
      "chicken_breast",
      "poulet"
    );

  const rice =
    findFood("rice", "riz");

  const broccoli =
    findFood(
      "broccoli",
      "brocolis"
    );

  const tuna =
    findFood(
      "tuna",
      "thon"
    );

  const pasta =
    findFood(
      "pasta",
      "pates",
      "pâtes"
    );

  if (oats)
    breakfast.push({
      food: oats,
      grams: 60
    });

  if (milk)
    breakfast.push({
      food: milk,
      grams: 250
    });

  if (yogurt)
    breakfast.push({
      food: yogurt,
      grams: 200
    });

  if (banana)
    breakfast.push({
      food: banana,
      grams: 100
    });

  if (chicken)
    lunch.push({
      food: chicken,
      grams: 180
    });

  if (rice)
    lunch.push({
      food: rice,
      grams: 250
    });

  if (broccoli)
    lunch.push({
      food: broccoli,
      grams: 150
    });

  if (yogurt)
    snack.push({
      food: yogurt,
      grams: 200
    });

  if (banana)
    snack.push({
      food: banana,
      grams: 100
    });

  if (tuna)
    dinner.push({
      food: tuna,
      grams: 150
    });

  if (pasta)
    dinner.push({
      food: pasta,
      grams: 220
    });

  if (broccoli)
    dinner.push({
      food: broccoli,
      grams: 150
    });

  state.meals = {
    breakfast,
    lunch,
    snack,
    dinner
  };

  /*
    Ajustement simple des protéines.
  */

  let totals =
    calculateDayNutrition(
      state.meals
    );

  if (
    chicken &&
    totals.protein < target.protein
  ) {
    const food = getFood(chicken);

    if (food && Number(food.protein) > 0) {
      const missing =
        target.protein -
        totals.protein;

      const extra =
        Math.ceil(
          (missing /
            Number(food.protein)) *
            100
        );

      state.meals.dinner.push({
        food: chicken,
        grams: extra
      });
    }
  }

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

function clearCurrentDay(save = true) {
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

  if (save) {
    notify("Journée vidée 🗑️");
  }
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
    days.map(day => {

      const items =
        state.planner[day] || [];

      const nutrition =
        calculateMealNutrition(
          items
        );

      return `
        <div class="planner-day">

          <div class="planner-day-header">
            <strong>${day}</strong>

            <span>
              ${Math.round(
                nutrition.kcal
              )} kcal
            </span>
          </div>

          <div class="planner-day-items">

            ${
              items.length
                ? items.map(item => {

                    const food =
                      getFood(item.food);

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
                        ${item.grams} g
                      </div>
                    `;

                  }).join("")
                : `
                  <small>
                    Aucun repas planifié
                  </small>
                `
            }

          </div>
        </div>
      `;

    }).join("");
}

function addDayToPlanner(day, meals) {
  if (!state.planner[day]) {
    state.planner[day] = [];
  }

  state.planner[day] = [
    ...(meals?.breakfast || []),
    ...(meals?.lunch || []),
    ...(meals?.snack || []),
    ...(meals?.dinner || [])
  ].map(item => ({
    ...item
  }));

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

  container.innerHTML =
    state.shopping.length
      ? state.shopping.map(
          (item, index) => `
            <div class="
              shopping-item
              ${
                item.checked
                  ? "checked"
                  : ""
              }
            ">

              <input
                type="checkbox"
                ${
                  item.checked
                    ? "checked"
                    : ""
                }
                data-action="toggle-shopping"
                data-index="${index}"
              >

              <div class="shopping-info">
                <strong>
                  ${
                    escapeHTML(
                      item.name
                    )
                  }
                </strong>

                <small>
                  ${
                    escapeHTML(
                      item.quantity
                    )
                  }
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
        ).join("")
      : `
        <div class="empty-state">
          Aucune course
        </div>
      `;

  renderShoppingTotal();
}

function renderShoppingTotal() {
  const total =
    state.shopping.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0),
      0
    );

  setText(
    "[data-shopping-total]",
    formatEuro(total)
  );
}

function addShoppingItem(item) {
  state.shopping.push({
    id:
      item.id ||
      `shopping-${Date.now()}`,

    name:
      item.name,

    quantity:
      item.quantity || "1",

    price:
      Number(item.price) || 0,

    checked: false
  });

  saveState();
  renderShopping();
}

function addShoppingItemFromDOM() {
  const name =
    $("[data-shopping-name]")?.value;

  const quantity =
    $("[data-shopping-quantity]")?.value;

  const price =
    Number(
      $("[data-shopping-price]")?.value
    );

  if (!name) {
    notify("Indique un aliment");
    return;
  }

  addShoppingItem({
    name,
    quantity,
    price
  });
}

function deleteShoppingItem(index) {
  if (!state.shopping[index]) return;

  state.shopping.splice(index, 1);

  saveState();
  renderShopping();
}

function toggleShoppingItem(index) {
  if (!state.shopping[index]) return;

  state.shopping[index].checked =
    !state.shopping[index].checked;

  saveState();
  renderShopping();
}

function generateShoppingFromPlanner() {
  const totals = {};

  Object.values(
    state.planner
  ).forEach(items => {
    items.forEach(item => {
      totals[item.food] =
        (totals[item.food] || 0) +
        Number(item.grams || 0);
    });
  });

  state.shopping =
    Object.entries(totals)
      .map(([foodId, grams]) => {
        const food =
          getFood(foodId);

        if (!food) return null;

        return {
          id: foodId,
          name: food.name,
          quantity:
            `${Math.ceil(grams)} g`,
          price: 0,
          checked: false
        };
      })
      .filter(Boolean);

  saveState();
  renderShopping();

  notify("Liste de courses générée 🛒");
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
      ? state.pantry.map(
          (item, index) => `
            <div class="pantry-item">

              <span>
                ${
                  escapeHTML(
                    item.name
                  )
                }
              </span>

              <span>
                ${
                  escapeHTML(
                    item.quantity
                  )
                }
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
        ).join("")
      : `
        <div class="empty-state">
          Garde-manger vide
        </div>
      `;
}

function addPantryItem(item) {
  state.pantry.push({
    id:
      item.id ||
      `pantry-${Date.now()}`,

    name:
      item.name,

    quantity:
      item.quantity || "1",

    expiration:
      item.expiration || ""
  });

  saveState();
  renderPantry();
}

function addPantryItemFromDOM() {
  const name =
    $("[data-pantry-name]")?.value;

  const quantity =
    $("[data-pantry-quantity]")?.value;

  if (!name) {
    notify("Indique un aliment");
    return;
  }

  addPantryItem({
    name,
    quantity
  });
}

function deletePantryItem(index) {
  if (!state.pantry[index]) return;

  state.pantry.splice(index, 1);

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
    [...state.progress].reverse();

  container.innerHTML =
    entries.length
      ? entries.map(entry => `
          <div class="progress-entry">

            <strong>
              ${
                escapeHTML(
                  entry.date
                )
              }
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
                    ${entry.waist} cm
                  </span>
                `
                : ""
            }

          </div>
        `).join("")
      : `
        <div class="empty-state">
          Aucune mesure enregistrée
        </div>
      `;
}

function addProgressEntry(entry) {
  state.progress.push({
    date:
      entry.date ||
      new Date()
        .toISOString()
        .split("T")[0],

    weight:
      Number(entry.weight) || 0,

    bodyFat:
      Number(entry.bodyFat) || 0,

    waist:
      Number(entry.waist) || 0,

    neck:
      Number(entry.neck) || 0,

    chest:
      Number(entry.chest) || 0,

    hip:
      Number(entry.hip) || 0,

    leftArm:
      Number(entry.leftArm) || 0,

    rightArm:
      Number(entry.rightArm) || 0,

    leftThigh:
      Number(entry.leftThigh) || 0,

    rightThigh:
      Number(entry.rightThigh) || 0
  });

  saveState();
  renderProgress();
}

function addProgressEntryFromDOM() {
  const weight =
    Number(
      $("[data-progress-weight]")?.value
    );

  const bodyFat =
    Number(
      $("[data-progress-bodyfat]")?.value
    );

  const waist =
    Number(
      $("[data-progress-waist]")?.value
    );

  if (!weight) {
    notify("Indique ton poids");
    return;
  }

  addProgressEntry({
    weight,
    bodyFat,
    waist
  });

  notify("Mesure enregistrée 📈");
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

  const advice = [];

  if (profile.goal === "cut") {
    advice.push(
      `Déficit : ${profile.deficit} kcal/jour.`
    );
  }

  if (profile.goal === "bulk") {
    advice.push(
      `Surplus : ${profile.surplus} kcal/jour.`
    );
  }

  if (profile.goal === "maintain") {
    advice.push(
      "Objectif : maintien."
    );
  }

  advice.push(
    `Calories : ${targets.calories} kcal/jour.`
  );

  advice.push(
    `Protéines : ${targets.protein} g/jour.`
  );

  advice.push(
    `Glucides : ${targets.carbs} g/jour.`
  );

  advice.push(
    `Lipides : ${targets.fat} g/jour.`
  );

  if (bmi) {
    advice.push(
      `IMC : ${round(
        bmi,
        1
      )} — ${getBMICategory(bmi)}.`
    );
  }

  if (bodyFat !== null) {
    advice.push(
      `Masse grasse estimée : ${round(
        bodyFat,
        1
      )} %.`
    );
  }

  container.innerHTML = `
    <div class="coach-card">

      <h3>
        Coach BudgetCook 🧠
      </h3>

      ${advice.map(
        text => `
          <p>
            ${escapeHTML(text)}
          </p>
        `
      ).join("")}

    </div>
  `;
}

/* =========================================================
   SETTINGS
========================================================= */

function applySettings() {
  document.body.classList.toggle(
    "dark-mode",
    Boolean(
      state.settings.darkMode
    )
  );
}

function toggleDarkMode() {
  state.settings.darkMode =
    !state.settings.darkMode;

  saveState();
  applySettings();

  notify(
    state.settings.darkMode
      ? "Mode sombre activé 🌙"
      : "Mode clair activé ☀️"
  );
}

function resetApp() {
  if (
    !confirm(
      "Supprimer toutes les données BudgetCook ?"
    )
  ) {
    return;
  }

  localStorage.removeItem(APP_KEY);

  state =
    structuredClone(
      DEFAULT_STATE
    );

  location.reload();
}

/* =========================================================
   BARRES
========================================================= */

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
          (current / target) * 100,
          0,
          100
        )
      : 0;

  element.style.width =
    `${percentage}%`;
}

/* =========================================================
   NOTIFICATION
========================================================= */

function notify(message) {
  let notification =
    $("#budgetcookNotification");

  if (!notification) {
    notification =
      document.createElement("div");

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

  notification.classList.add("show");

  clearTimeout(
    notification._timer
  );

  notification._timer =
    setTimeout(() => {
      notification.classList.remove(
        "show"
      );
    }, 2500);
}

/* =========================================================
   RECHERCHE
========================================================= */

function searchFoods(query) {
  const foods =
    typeof FOODS !== "undefined"
      ? FOODS
      : [];

  const q =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!q) return foods;

  return foods.filter(food =>
    String(food.name || "")
      .toLowerCase()
      .includes(q)
  );
}

function searchRecipes(query) {
  const recipes =
    typeof RECIPES !== "undefined"
      ? RECIPES
      : [];

  const q =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!q) return recipes;

  return recipes.filter(recipe =>
    String(recipe.name || "")
      .toLowerCase()
      .includes(q)
  );
}

/* =========================================================
   BUDGET
========================================================= */

function calculateShoppingBudget() {
  return state.shopping.reduce(
    (total, item) =>
      total +
      Number(item.price || 0),
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
   EXPORT / IMPORT
========================================================= */

function exportData() {
  const blob =
    new Blob(
      [
        JSON.stringify(
          state,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    "budgetcook-backup.json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = event => {
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
      console.error(error);
      notify(
        "Fichier invalide ❌"
      );
    }
  };

  reader.readAsText(file);
}

/* =========================================================
   ÉVÉNEMENTS GLOBAUX
========================================================= */

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

function handleGlobalChange(event) {
  const target = event.target;

  if (
    target.matches(
      "[data-profile]"
    )
  ) {
    calculateProfilePreview();
  }
}

/* =========================================================
   BOUTONS
========================================================= */

function setupButtonEvents() {

  const directButtons = [
    [
      "#quickAddButton",
      openFoodModal
    ],

    [
      "#addMealButton",
      openFoodModal
    ],

    [
      "#journalAddButton",
      openFoodModal
    ],

    [
      "#generateDayButton",
      generateDay
    ],

    [
      "#emptyGenerateButton",
      generateDay
    ],

    [
      "#mobileMenuButton",
      () => {
        const sidebar =
          $(".sidebar");

        if (sidebar) {
          sidebar.classList.toggle(
            "mobile-open"
          );
        }
      }
    ],

    [
      "#premiumButton",
      () => {
        notify(
          "BudgetCook Premium arrive bientôt ⭐"
        );
      }
    ]
  ];

  directButtons.forEach(
    ([selector, action]) => {
      const button = $(selector);

      if (!button) return;

      button.addEventListener(
        "click",
        event => {
          event.preventDefault();
          action(event);
        }
      );
    }
  );

  $$(".add-small-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();

          openFoodModal();

          const meal =
            button.dataset.meal;

          const select =
            $("#modalFoodMeal");

          if (
            select &&
            meal
          ) {
            select.value =
              meal;
          }
        }
      );
    });
}

/* =========================================================
   INITIALISATION
========================================================= */

function initializeApp() {

  try {

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

    /*
      Si aucune page n'est active,
      on affiche la première.
    */

    const activePage =
      $("[data-page].active");

    if (!activePage) {
      const firstPage =
        $("[data-page]");

      if (firstPage) {
        const name =
          firstPage.dataset.page ||
          firstPage.id?.replace(
            /^page-/,
            ""
          );

        if (name) {
          showSection(name);
        }
      }
    }

    console.log(
      "BudgetCook V4 chargé correctement ✅"
    );

  } catch (error) {

    console.error(
      "ERREUR BUDGETCOOK :",
      error
    );

    notify(
      "Une erreur est survenue dans BudgetCook ❌"
    );
  }
}

/* =========================================================
   GLOBALS HTML
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

window.showSection =
  showSection;

/* =========================================================
   API BUDGETCOOK
========================================================= */

window.BudgetCook = {
  get state() {
    return state;
  },

  FOODS:
    typeof FOODS !== "undefined"
      ? FOODS
      : [],

  RECIPES:
    typeof RECIPES !== "undefined"
      ? RECIPES
      : [],

  DAYS:
    typeof DAYS !== "undefined"
      ? DAYS
      : [],

  getDailyTargets,

  calculateFoodNutrition,
  calculateMealNutrition,
  calculateDayNutrition,
  calculateRecipeNutrition,

  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,

  calculateBMI,
  calculateBodyFat,

  addFoodToMeal,
  addRecipeToCurrentMeal,

  generateDay,
  clearCurrentDay,

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
   DOM READY
========================================================= */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp,
    {
      once: true
    }
  );
} else {
  initializeApp();
}
