/* =========================================================
   BUDGETCOOK V4 — APP.JS
   Version synchronisée avec index.html + data.js
========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const APP_KEY = "budgetcook_v4";

const DEFAULT_APP_STATE = {
  profile: {
    firstName: "",
    age: 20,
    sex: "male",
    height: 179,
    weight: 88,
    bodyFat: 0,

    neck: 0,
    waist: 0,
    hips: 0,
    chest: 0,
    arm: 0,
    thigh: 0,

    trainingDays: 5,
    activity: "moderate",

    goal: "cut",
    deficit: 300,

    targetWeight: 0,
    targetBodyFat: 0,

    proteinTarget: 0,
    fatTarget: 0,

    budget: 50,
    store: ""
  },

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
  progress: [],
  favorites: [],

  preferences: {
    autoGenerate: false,
    budgetOptimization: true,
    highProtein: true
  }
};

let state = loadState();

/* =========================================================
   HELPERS
========================================================= */

const $ = selector => document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveState() {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(Number(value || 0) * factor) / factor;
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function food(id) {
  return FOODS.find(item => item.id === id);
}

function recipe(id) {
  return RECIPES.find(item => item.id === id);
}

function euro(value) {
  return `${round(value, 2).toFixed(2).replace(".", ",")} €`;
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message) {
  const container = $("#toastContainer");
  if (!container) return;

  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;

  container.appendChild(item);

  setTimeout(() => {
    item.remove();
  }, 2600);
}

/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadState() {
  try {
    const saved = localStorage.getItem(APP_KEY);

    if (!saved) {
      return clone(DEFAULT_APP_STATE);
    }

    const parsed = JSON.parse(saved);

    const result = clone(DEFAULT_APP_STATE);

    Object.assign(
      result.profile,
      parsed.profile || {}
    );

    Object.assign(
      result.preferences,
      parsed.preferences || {}
    );

    if (parsed.meals) {
      result.meals = {
        ...result.meals,
        ...parsed.meals
      };
    }

    if (parsed.planner) {
      result.planner = {
        ...result.planner,
        ...parsed.planner
      };
    }

    result.shopping = Array.isArray(parsed.shopping)
      ? parsed.shopping
      : [];

    result.progress = Array.isArray(parsed.progress)
      ? parsed.progress
      : [];

    result.favorites = Array.isArray(parsed.favorites)
      ? parsed.favorites
      : [];

    return result;

  } catch (error) {
    console.error(error);
    return clone(DEFAULT_APP_STATE);
  }
}

/* =========================================================
   NAVIGATION
========================================================= */

function showPage(pageName) {

  $$(".page").forEach(page => {
    page.classList.toggle(
      "active",
      page.id === `page-${pageName}`
    );
  });

  $$("[data-page]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  const sidebar = $(".sidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function setupNavigation() {

  $$("[data-page]").forEach(button => {

    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });

  });

  $("#mobileMenuButton")?.addEventListener(
    "click",
    () => {
      $(".sidebar")?.classList.toggle("open");
    }
  );
}

/* =========================================================
   NUTRITION
========================================================= */

function calculateFoodNutrition(foodId, grams) {

  const item = food(foodId);

  if (!item) {
    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }

  const factor = number(grams) / 100;

  return {
    kcal: item.kcal * factor,
    protein: item.protein * factor,
    carbs: item.carbs * factor,
    fat: item.fat * factor
  };
}

function calculateItemsNutrition(items = []) {

  return items.reduce(
    (total, item) => {

      const n = calculateFoodNutrition(
        item.food,
        item.grams
      );

      total.kcal += n.kcal;
      total.protein += n.protein;
      total.carbs += n.carbs;
      total.fat += n.fat;

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

function calculateDayNutrition() {

  return calculateItemsNutrition([
    ...state.meals.breakfast,
    ...state.meals.lunch,
    ...state.meals.snack,
    ...state.meals.dinner
  ]);
}

function calculateRecipeNutrition(recipeId) {

  const r = recipe(recipeId);

  if (!r) {
    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }

  return calculateItemsNutrition(
    r.ingredients
  );
}

/* =========================================================
   CALCULS PROFIL
========================================================= */

function activityMultiplier(value) {

  const map = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  return map[value] || 1.55;
}

function calculateBMR(profile = state.profile) {

  const weight = number(profile.weight);
  const height = number(profile.height);
  const age = number(profile.age);

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

  return (
    calculateBMR(profile) *
    activityMultiplier(profile.activity)
  );
}

function calculateCalorieTarget(profile = state.profile) {

  const tdee = calculateTDEE(profile);

  let adjustment = 0;

  switch (profile.goal) {

    case "cut":
      adjustment = -Math.abs(
        number(profile.deficit, 300)
      );
      break;

    case "recomp":
    case "recomposition":
      adjustment = -200;
      break;

    case "bulk":
      adjustment = 250;
      break;

    case "maintain":
      adjustment = 0;
      break;
  }

  return Math.max(
    1200,
    Math.round(tdee + adjustment)
  );
}

/*
  LOGIQUE BUDGETCOOK :

  protéines = poids × objectif protéines
  lipides = poids × objectif lipides
  glucides = calories restantes ÷ 4

  4 kcal/g protéines
  4 kcal/g glucides
  9 kcal/g lipides
*/

function calculateMacros(profile = state.profile) {

  const calories =
    calculateCalorieTarget(profile);

  const protein =
    number(profile.proteinTarget) > 0
      ? number(profile.proteinTarget)
      : number(profile.weight) * 2;

  const fat =
    number(profile.fatTarget) > 0
      ? number(profile.fatTarget)
      : number(profile.weight) * 0.8;

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

  return {
    calories,
    protein: round(protein),
    fat: round(fat),
    carbs: round(carbs)
  };
}

/* =========================================================
   PROFILE
========================================================= */

function readProfile() {

  const p = state.profile;

  p.firstName =
    $("#profileName")?.value ?? p.firstName;

  p.age =
    number($("#profileAge")?.value, p.age);

  p.sex =
    $("#profileSex")?.value || p.sex;

  p.height =
    number($("#profileHeight")?.value, p.height);

  p.weight =
    number($("#profileWeight")?.value, p.weight);

  p.bodyFat =
    number($("#profileBodyFat")?.value, p.bodyFat);

  p.chest =
    number($("#profileChest")?.value, p.chest);

  p.waist =
    number($("#profileWaist")?.value, p.waist);

  p.hips =
    number($("#profileHips")?.value, p.hips);

  p.arm =
    number($("#profileArm")?.value, p.arm);

  p.thigh =
    number($("#profileThigh")?.value, p.thigh);

  p.neck =
    number($("#profileNeck")?.value, p.neck);

  p.trainingDays =
    number(
      $("#profileTraining")?.value,
      p.trainingDays
    );

  p.activity =
    $("#profileActivity")?.value ||
    p.activity;

  const goal =
    document.querySelector(
      'input[name="profileGoal"]:checked'
    );

  if (goal) {
    p.goal = goal.value;
  }

  p.targetWeight =
    number(
      $("#profileTargetWeight")?.value,
      p.targetWeight
    );

  p.targetBodyFat =
    number(
      $("#profileTargetBodyFat")?.value,
      p.targetBodyFat
    );

  p.deficit =
    number(
      $("#profileDeficit")?.value,
      p.deficit
    );

  p.proteinTarget =
    number(
      $("#proteinTarget")?.value,
      p.proteinTarget
    );

  p.fatTarget =
    number(
      $("#fatTarget")?.value,
      p.fatTarget
    );

  p.budget =
    number(
      $("#profileBudget")?.value,
      p.budget
    );

  p.store =
    $("#profileStore")?.value ||
    p.store;

  return p;
}

function renderProfile() {

  const p = state.profile;

  const values = {
    profileName: p.firstName,
    profileAge: p.age,
    profileSex: p.sex,
    profileHeight: p.height,
    profileWeight: p.weight,
    profileBodyFat: p.bodyFat || "",
    profileChest: p.chest || "",
    profileWaist: p.waist || "",
    profileHips: p.hips || "",
    profileArm: p.arm || "",
    profileThigh: p.thigh || "",
    profileNeck: p.neck || "",
    profileTraining: p.trainingDays,
    profileActivity: p.activity,
    profileTargetWeight: p.targetWeight || "",
    profileTargetBodyFat: p.targetBodyFat || "",
    profileDeficit: p.deficit,
    proteinTarget: p.proteinTarget || "",
    fatTarget: p.fatTarget || "",
    profileBudget: p.budget,
    profileStore: p.store
  };

  Object.entries(values).forEach(
    ([id, value]) => {

      const element = $(`#${id}`);

      if (element) {
        element.value = value ?? "";
      }

    }
  );

  const goal =
    document.querySelector(
      `input[name="profileGoal"][value="${p.goal}"]`
    );

  if (goal) {
    goal.checked = true;
  }

  renderProfileCalculations();
}

function renderProfileCalculations() {

  const p = state.profile;

  const macros = calculateMacros(p);
  const bmr = calculateBMR(p);
  const tdee = calculateTDEE(p);

  setText(
    "#profileCalculatedCalories",
    `${macros.calories} kcal`
  );

  setText(
    "#profileCalculatedProtein",
    `${macros.protein} g`
  );

  setText(
    "#profileCalculatedFat",
    `${macros.fat} g`
  );

  setText(
    "#profileCalculatedCarbs",
    `${macros.carbs} g`
  );

  setText(
    "#calculatedCarbs",
    `${macros.carbs} g`
  );

  setText(
    "#profileBMR",
    `${Math.round(bmr)} kcal`
  );

  setText(
    "#profileTDEE",
    `${Math.round(tdee)} kcal`
  );
}

function saveProfile() {

  readProfile();
  saveState();

  renderProfile();
  renderHome();
  renderCoach();
  renderProgress();

  toast("Profil enregistré ✅");
}

/* =========================================================
   HOME
========================================================= */

function setProgress(selector, value, target) {

  const el = $(selector);

  if (!el) return;

  const percentage =
    target > 0
      ? Math.min(100, Math.max(0, value / target * 100))
      : 0;

  el.style.width = `${percentage}%`;
}

function renderHome() {

  const macros =
    calculateMacros(state.profile);

  const totals =
    calculateDayNutrition();

  setText(
    "#homeCaloriesConsumed",
    Math.round(totals.kcal)
  );

  setText(
    "#homeCaloriesTarget",
    macros.calories
  );

  setText(
    "#homeCaloriesRemaining",
    `${Math.max(
      0,
      Math.round(macros.calories - totals.kcal)
    )} kcal restantes`
  );

  setText(
    "#homeProteinConsumed",
    round(totals.protein)
  );

  setText(
    "#homeProteinTarget",
    macros.protein
  );

  setText(
    "#homeCarbsConsumed",
    round(totals.carbs)
  );

  setText(
    "#homeCarbsTarget",
    macros.carbs
  );

  setText(
    "#homeFatConsumed",
    round(totals.fat)
  );

  setText(
    "#homeFatTarget",
    macros.fat
  );

  setProgress(
    "#homeCaloriesProgress",
    totals.kcal,
    macros.calories
  );

  setProgress(
    "#homeProteinProgress",
    totals.protein,
    macros.protein
  );

  setProgress(
    "#homeCarbsProgress",
    totals.carbs,
    macros.carbs
  );

  setProgress(
    "#homeFatProgress",
    totals.fat,
    macros.fat
  );

  const percent =
    macros.calories > 0
      ? Math.round(
          totals.kcal /
          macros.calories *
          100
        )
      : 0;

  setText(
    "#homeCaloriesPercent",
    `${percent}%`
  );

  setText(
    "#homeBudget",
    `${number(state.profile.budget)} €`
  );

  setText(
    "#homeWeight",
    `${number(state.profile.weight)} kg`
  );

  renderTodayMeals();
}

/* =========================================================
   TODAY MEALS
========================================================= */

function renderTodayMeals() {

  const container = $("#todayMeals");

  if (!container) return;

  const all =
    [
      ["breakfast", "Petit-déjeuner", "🌅"],
      ["lunch", "Déjeuner", "☀️"],
      ["snack", "Collation", "🍎"],
      ["dinner", "Dîner", "🌙"]
    ];

  const hasMeals =
    all.some(([key]) =>
      state.meals[key]?.length
    );

  if (!hasMeals) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>Aucun repas ajouté</h3>
        <p>Ajoute un repas ou génère automatiquement ta journée.</p>
        <button
          class="primary-button"
          id="emptyGenerateButton"
        >
          ✨ Générer ma journée
        </button>
      </div>
    `;

    $("#emptyGenerateButton")
      ?.addEventListener(
        "click",
        generateDay
      );

    return;
  }

  container.innerHTML =
    all.map(([key,label,emoji]) => {

      const items =
        state.meals[key] || [];

      if (!items.length) return "";

      const n =
        calculateItemsNutrition(items);

      return `
        <div class="meal-section">
          <div class="meal-section-header">
            <div>
              <span class="meal-emoji">${emoji}</span>
              <div>
                <h3>${label}</h3>
                <span>${Math.round(n.kcal)} kcal</span>
              </div>
            </div>
          </div>

          <div class="meal-items">
            ${items.map((item,index) => {

              const f = food(item.food);

              if (!f) return "";

              const nutrition =
                calculateFoodNutrition(
                  item.food,
                  item.grams
                );

              return `
                <div class="food-row">
                  <div class="food-info">
                    <span class="food-emoji">${f.emoji}</span>
                    <div>
                      <strong>${escapeHTML(f.name)}</strong>
                      <small>${item.grams}${f.unit}</small>
                    </div>
                  </div>

                  <div class="food-nutrition">
                    ${Math.round(nutrition.kcal)} kcal
                  </div>

                  <button
                    type="button"
                    data-delete-meal="${key}"
                    data-index="${index}"
                  >
                    ✕
                  </button>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }).join("");

  $$("[data-delete-meal]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const meal =
            button.dataset.deleteMeal;

          const index =
            number(button.dataset.index);

          state.meals[meal].splice(
            index,
            1
          );

          saveState();
          renderHome();
          renderJournal();

        }
      );

    });
}

/* =========================================================
   JOURNAL
========================================================= */

function renderJournal() {

  const macros =
    calculateMacros(state.profile);

  const totals =
    calculateDayNutrition();

  setText(
    "#journalCalories",
    Math.round(totals.kcal)
  );

  setText(
    "#journalCaloriesTarget",
    macros.calories
  );

  setText(
    "#journalProtein",
    round(totals.protein)
  );

  setText(
    "#journalProteinTarget",
    macros.protein
  );

  setText(
    "#journalCarbs",
    round(totals.carbs)
  );

  setText(
    "#journalCarbsTarget",
    macros.carbs
  );

  setText(
    "#journalFat",
    round(totals.fat)
  );

  setText(
    "#journalFatTarget",
    macros.fat
  );

  const types = [
    ["breakfast","breakfastItems","breakfastCalories"],
    ["lunch","lunchItems","lunchCalories"],
    ["snack","snackItems","snackCalories"],
    ["dinner","dinnerItems","dinnerCalories"]
  ];

  types.forEach(
    ([meal,containerId,kcalId]) => {

      const container =
        $(`#${containerId}`);

      if (!container) return;

      const items =
        state.meals[meal] || [];

      const n =
        calculateItemsNutrition(items);

      setText(
        `#${kcalId}`,
        `${Math.round(n.kcal)} kcal`
      );

      container.innerHTML =
        items.length
          ? items.map((item,index) => {

              const f = food(item.food);

              return `
                <div class="food-row">
                  <div class="food-info">
                    <span class="food-emoji">${f?.emoji || "🍽️"}</span>
                    <div>
                      <strong>${escapeHTML(f?.name || item.food)}</strong>
                      <small>${item.grams} g</small>
                    </div>
                  </div>

                  <div class="food-nutrition">
                    ${Math.round(
                      calculateFoodNutrition(
                        item.food,
                        item.grams
                      ).kcal
                    )} kcal
                  </div>

                  <button
                    data-journal-delete="${meal}"
                    data-index="${index}"
                  >
                    ✕
                  </button>
                </div>
              `;

            }).join("")
          : `<div class="empty-state">Aucun aliment</div>`;
    }
  );

  $$("[data-journal-delete]")
    .forEach(button => {

      button.onclick = () => {

        const meal =
          button.dataset.journalDelete;

        const index =
          number(button.dataset.index);

        state.meals[meal].splice(
          index,
          1
        );

        saveState();
        renderJournal();
        renderHome();

      };

    });
}

/* =========================================================
   MODAL
========================================================= */

function openModal(content) {

  const overlay = $("#modalOverlay");
  const modal = $("#modalContent");

  if (!overlay || !modal) return;

  modal.innerHTML = content;
  overlay.classList.remove("hidden");
}

function closeModal() {
  $("#modalOverlay")
    ?.classList.add("hidden");
}

function setupModal() {

  $("#modalCloseButton")
    ?.addEventListener(
      "click",
      closeModal
    );

  $("#modalOverlay")
    ?.addEventListener(
      "click",
      event => {

        if (
          event.target.id ===
          "modalOverlay"
        ) {
          closeModal();
        }

      }
    );
}

function openFoodModal(defaultMeal = "lunch") {

  openModal(`
    <h2>Ajouter un aliment</h2>

    <div class="modal-form">

      <label>
        Repas
        <select id="modalMeal">
          <option value="breakfast">Petit-déjeuner</option>
          <option value="lunch" ${defaultMeal === "lunch" ? "selected" : ""}>Déjeuner</option>
          <option value="snack">Collation</option>
          <option value="dinner">Dîner</option>
        </select>
      </label>

      <label>
        Aliment
        <select id="modalFood">
          ${FOODS.map(f => `
            <option value="${f.id}">
              ${f.emoji} ${escapeHTML(f.name)}
            </option>
          `).join("")}
        </select>
      </label>

      <label>
        Quantité
        <input
          id="modalGrams"
          type="number"
          min="1"
          value="100"
        >
      </label>

      <button
        id="modalAddFood"
        class="primary-button"
      >
        Ajouter
      </button>

    </div>
  `);

  $("#modalAddFood")
    ?.addEventListener(
      "click",
      () => {

        const meal =
          $("#modalMeal").value;

        const foodId =
          $("#modalFood").value;

        const grams =
          number($("#modalGrams").value);

        if (!grams || grams <= 0) {
          toast("Quantité invalide");
          return;
        }

        state.meals[meal].push({
          food: foodId,
          grams
        });

        saveState();

        closeModal();
        renderJournal();
        renderHome();

        toast("Aliment ajouté ✅");
      }
    );
}

/* =========================================================
   RECIPES
========================================================= */

function renderRecipes() {

  const container = $("#recipesGrid");

  if (!container) return;

  const search =
    ($("#recipeSearch")?.value || "")
      .trim()
      .toLowerCase();

  const filter =
    $("#recipeGoalFilter")?.value ||
    "all";

  let recipes =
    RECIPES.filter(r =>
      r.name.toLowerCase().includes(search)
    );

  recipes =
    recipes.filter(r => {

      if (filter === "all") return true;

      const n =
        calculateRecipeNutrition(r.id);

      if (filter === "high-protein") {
        return n.protein >= 30;
      }

      if (filter === "low-calorie") {
        return n.kcal <= 600;
      }

      if (filter === "budget") {
        return true;
      }

      return true;
    });

  container.innerHTML =
    recipes.map(r => {

      const n =
        calculateRecipeNutrition(r.id);

      const favorite =
        state.favorites.includes(r.id);

      return `
        <article class="recipe-card">

          <div class="recipe-image">
            ${r.emoji}
          </div>

          <div class="recipe-content">

            <h3>${escapeHTML(r.name)}</h3>

            <div class="recipe-macros">

              <span class="recipe-macro">
                ${Math.round(n.kcal)} kcal
              </span>

              <span class="recipe-macro">
                P ${round(n.protein)}g
              </span>

              <span class="recipe-macro">
                G ${round(n.carbs)}g
              </span>

              <span class="recipe-macro">
                L ${round(n.fat)}g
              </span>

            </div>

            <div class="recipe-actions">

              <button
                data-recipe-add="${r.id}"
                data-meal="lunch"
              >
                + Déjeuner
              </button>

              <button
                data-recipe-add="${r.id}"
                data-meal="dinner"
              >
                + Dîner
              </button>

              <button
                data-favorite="${r.id}"
              >
                ${favorite ? "❤️" : "♡"}
              </button>

            </div>

          </div>

        </article>
      `;
    }).join("");

  $$("[data-recipe-add]")
    .forEach(button => {

      button.onclick = () => {

        addRecipe(
          button.dataset.recipeAdd,
          button.dataset.meal
        );

      };

    });

  $$("[data-favorite]")
    .forEach(button => {

      button.onclick = () => {

        const id =
          button.dataset.favorite;

        if (state.favorites.includes(id)) {

          state.favorites =
            state.favorites.filter(
              item => item !== id
            );

        } else {

          state.favorites.push(id);

        }

        saveState();
        renderRecipes();

      };

    });
}

function addRecipe(recipeId, meal) {

  const r = recipe(recipeId);

  if (!r) return;

  state.meals[meal].push(
    ...clone(r.ingredients)
  );

  saveState();

  renderJournal();
  renderHome();

  toast(`${r.name} ajouté ✅`);
}

/* =========================================================
   GENERATE DAY
========================================================= */

function generateDay() {

  const target =
    calculateMacros(state.profile);

  state.meals = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  };

  const presets = [
    ["breakfast","oat-bowl"],
    ["lunch","chicken-rice"],
    ["snack","skyr-banana"],
    ["dinner","tuna-pasta"]
  ];

  presets.forEach(
    ([meal,id]) => {

      const r = recipe(id);

      if (!r) return;

      state.meals[meal].push(
        ...clone(r.ingredients)
      );

    }
  );

  /*
    Ajustement simple des protéines.
    On ajoute du poulet jusqu'à atteindre
    approximativement l'objectif protéique.
  */

  let totals =
    calculateDayNutrition();

  if (
    totals.protein <
    target.protein
  ) {

    const missing =
      target.protein -
      totals.protein;

    const grams =
      Math.ceil(
        missing /
        31 *
        100
      );

    state.meals.dinner.push({
      food: "chicken",
      grams
    });
  }

  saveState();

  renderHome();
  renderJournal();

  toast("Journée générée 🍽️");
}

/* =========================================================
   PLANNER
========================================================= */

function renderPlanner() {

  const container = $("#weekPlanner");

  if (!container) return;

  container.innerHTML =
    DAYS.map(day => {

      const items =
        state.planner[day] || [];

      const n =
        calculateItemsNutrition(items);

      return `
        <div class="planner-day">

          <h3>${day}</h3>

          <div class="planner-kcal">
            ${Math.round(n.kcal)} kcal
          </div>

          <div>
            ${
              items.length
                ? items.map(item => {

                    const f = food(item.food);

                    return `
                      <div class="planner-food">
                        ${f?.emoji || "🍽️"}
                        <span>
                          ${escapeHTML(
                            f?.name || item.food
                          )}
                          <br>
                          ${item.grams} g
                        </span>
                      </div>
                    `;

                  }).join("")
                : `
                  <div class="empty-state">
                    Aucun repas
                  </div>
                `
            }
          </div>

        </div>
      `;

    }).join("");

  const allItems =
    DAYS.flatMap(
      day => state.planner[day] || []
    );

  const total =
    calculateItemsNutrition(allItems);

  setText(
    "#plannerAverageCalories",
    `${Math.round(
      total.kcal / 7
    )} kcal`
  );

  setText(
    "#plannerAverageProtein",
    `${round(
      total.protein / 7
    )} g`
  );

  setText(
    "#plannerBudget",
    euro(calculateShoppingBudget())
  );
}

/* =========================================================
   SHOPPING
========================================================= */

function calculateShoppingBudget() {

  return state.shopping.reduce(
    (sum,item) =>
      sum + number(item.price),
    0
  );
}

function renderShopping() {

  const container =
    $("#shoppingList");

  if (!container) return;

  container.innerHTML =
    state.shopping.length
      ? state.shopping.map((item,index) => `

          <div class="shopping-item">

            <input
              type="checkbox"
              ${item.checked ? "checked" : ""}
              data-shopping-check="${index}"
            >

            <div class="shopping-info">
              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <small>
                ${escapeHTML(item.quantity || "")}
              </small>
            </div>

            <span>
              ${euro(item.price)}
            </span>

            <button
              data-shopping-delete="${index}"
            >
              ✕
            </button>

          </div>

        `).join("")
      : `
        <div class="empty-state">
          🛒
          <h3>Liste vide</h3>
          <p>Génère ta liste depuis ton planning.</p>
        </div>
      `;

  setText(
    "#shoppingBudget",
    euro(calculateShoppingBudget())
  );

  setText(
    "#shoppingBudgetLimit",
    euro(state.profile.budget)
  );

  setText(
    "#shoppingBudgetDifference",
    euro(
      state.profile.budget -
      calculateShoppingBudget()
    )
  );

  $$("[data-shopping-delete]")
    .forEach(button => {

      button.onclick = () => {

        state.shopping.splice(
          number(button.dataset.shoppingDelete),
          1
        );

        saveState();
        renderShopping();

      };

    });

  $$("[data-shopping-check]")
    .forEach(input => {

      input.onchange = () => {

        state.shopping[
          number(input.dataset.shoppingCheck)
        ].checked = input.checked;

        saveState();

      };

    });
}

function generateShopping() {

  const totals = {};

  DAYS.forEach(day => {

    (state.planner[day] || [])
      .forEach(item => {

        totals[item.food] =
          number(totals[item.food]) +
          number(item.grams);

      });

  });

  state.shopping =
    Object.entries(totals)
      .map(([id,grams]) => {

        const f = food(id);

        return {
          id,
          name: f?.name || id,
          quantity: `${Math.ceil(grams)} g`,
          price: 0,
          checked: false
        };

      });

  saveState();
  renderShopping();

  toast("Liste de courses générée 🛒");
}

/* =========================================================
   PROGRESS
========================================================= */

function renderProgress() {

  const current =
    state.progress.at(-1);

  const previous =
    state.progress.at(-2);

  setText(
    "#progressCurrentWeight",
    current
      ? `${current.weight} kg`
      : `${state.profile.weight} kg`
  );

  setText(
    "#progressWeightChange",
    current && previous
      ? `${round(
          current.weight -
          previous.weight
        )} kg`
      : "--"
  );

  setText(
    "#progressBodyFat",
    current?.bodyFat
      ? `${current.bodyFat} %`
      : state.profile.bodyFat
        ? `${state.profile.bodyFat} %`
        : "-- %"
  );

  setText(
    "#progressBodyFatGoal",
    state.profile.targetBodyFat
      ? `${state.profile.targetBodyFat} %`
      : "--"
  );

  setText(
    "#progressWaist",
    current?.waist
      ? `${current.waist} cm`
      : state.profile.waist
        ? `${state.profile.waist} cm`
        : "-- cm"
  );

  setText(
    "#progressWaistGoal",
    "--"
  );

  setText(
    "#progressGoal",
    goalName(state.profile.goal)
  );

  renderWeightChart();
}

function goalName(goal) {

  const names = {
    cut: "Perte de graisse",
    recomp: "Recomposition",
    maintain: "Maintien",
    bulk: "Prise de masse"
  };

  return names[goal] || goal;
}

function renderWeightChart() {

  const container = $("#weightChart");

  if (!container) return;

  const entries =
    state.progress.slice(-30);

  if (!entries.length) {

    container.innerHTML = `
      <div class="empty-state">
        Pas encore assez de mesures.
      </div>
    `;

    return;
  }

  const weights =
    entries.map(x => number(x.weight));

  const min =
    Math.min(...weights);

  const max =
    Math.max(...weights);

  const range =
    Math.max(1, max - min);

  container.innerHTML =
    entries.map(entry => {

      const height =
        20 +
        (
          (number(entry.weight) - min) /
          range
        ) * 75;

      return `
        <div
          class="chart-bar"
          style="height:${height}%"
          title="${entry.date} — ${entry.weight} kg"
        ></div>
      `;

    }).join("");
}

function addProgress() {

  openModal(`
    <h2>Nouvelle mesure</h2>

    <div class="modal-form">

      <label>
        Poids
        <input
          id="progressWeightInput"
          type="number"
          step="0.1"
          value="${state.profile.weight}"
        >
      </label>

      <label>
        Masse grasse
        <input
          id="progressFatInput"
          type="number"
          step="0.1"
        >
      </label>

      <label>
        Tour de taille
        <input
          id="progressWaistInput"
          type="number"
          step="0.1"
        >
      </label>

      <button
        id="saveProgressModal"
        class="primary-button"
      >
        Enregistrer
      </button>

    </div>
  `);

  $("#saveProgressModal")
    ?.addEventListener(
      "click",
      () => {

        const entry = {
          date:
            new Date()
              .toISOString()
              .split("T")[0],

          weight:
            number(
              $("#progressWeightInput").value
            ),

          bodyFat:
            number(
              $("#progressFatInput").value
            ),

          waist:
            number(
              $("#progressWaistInput").value
            )
        };

        state.progress.push(entry);

        state.profile.weight =
          entry.weight;

        if (entry.bodyFat) {
          state.profile.bodyFat =
            entry.bodyFat;
        }

        if (entry.waist) {
          state.profile.waist =
            entry.waist;
        }

        saveState();

        closeModal();

        renderProfile();
        renderHome();
        renderProgress();
        renderCoach();

        toast("Mesure enregistrée 📈");
      }
    );
}

/* =========================================================
   COACH
========================================================= */

function renderCoach() {

  const p = state.profile;
  const m = calculateMacros(p);

  const totals =
    calculateDayNutrition();

  setText(
    "#coachCaloriesText",
    `${m.calories} kcal/jour`
  );

  setText(
    "#coachProteinText",
    `${m.protein} g/jour`
  );

  setText(
    "#coachBudgetText",
    `${p.budget} €/semaine`
  );

  setText(
    "#coachFoodQualityText",
    totals.protein >= m.protein * .8
      ? "Très bon apport protéique aujourd'hui."
      : "Essaie d'augmenter les sources de protéines."
  );

  setText(
    "#coachDailyAnalysis",
    `Objectif : ${goalName(p.goal)}. ` +
    `Ton besoin estimé est de ${m.calories} kcal/jour.`
  );

  const recommendations = [];

  if (totals.protein < m.protein) {
    recommendations.push(
      `Il te manque environ ${round(
        m.protein - totals.protein
      )} g de protéines aujourd'hui.`
    );
  }

  if (totals.kcal > m.calories) {
    recommendations.push(
      "Tu dépasses actuellement ton objectif calorique."
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "Tes objectifs du jour sont bien suivis. Continue comme ça."
    );
  }

  const container =
    $("#coachRecommendations");

  if (container) {
    container.innerHTML =
      recommendations.map(text => `
        <div class="recommendation">
          ${escapeHTML(text)}
        </div>
      `).join("");
  }
}

/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  $("#saveProfileButton")
    ?.addEventListener(
      "click",
      saveProfile
    );

  $("#generateDayButton")
    ?.addEventListener(
      "click",
      generateDay
    );

  $("#emptyGenerateButton")
    ?.addEventListener(
      "click",
      generateDay
    );

  $("#quickAddButton")
    ?.addEventListener(
      "click",
      () => openFoodModal("lunch")
    );

  $("#journalAddButton")
    ?.addEventListener(
      "click",
      () => openFoodModal("lunch")
    );

  $("#addMealButton")
    ?.addEventListener(
      "click",
      () => openFoodModal("lunch")
    );

  $("#addProgressButton")
    ?.addEventListener(
      "click",
      addProgress
    );

  $("#generateShoppingButton")
    ?.addEventListener(
      "click",
      generateShopping
    );

  $("#addShoppingItemButton")
    ?.addEventListener(
      "click",
      () => {

        openModal(`
          <h2>Ajouter aux courses</h2>

          <div class="modal-form">

            <label>
              Aliment
              <input id="customShoppingName">
            </label>

            <label>
              Quantité
              <input
                id="customShoppingQuantity"
                value="1"
              >
            </label>

            <label>
              Prix
              <input
                id="customShoppingPrice"
                type="number"
                step="0.01"
                value="0"
              >
            </label>

            <button
              id="saveShoppingItem"
              class="primary-button"
            >
              Ajouter
            </button>

          </div>
        `);

        $("#saveShoppingItem")
          ?.addEventListener(
            "click",
            () => {

              const name =
                $("#customShoppingName").value.trim();

              if (!name) {
                toast("Indique un aliment");
                return;
              }

              state.shopping.push({
                id: `custom-${Date.now()}`,
                name,
                quantity:
                  $("#customShoppingQuantity").value,
                price:
                  number(
                    $("#customShoppingPrice").value
                  ),
                checked: false
              });

              saveState();
              closeModal();
              renderShopping();

              toast("Ajouté aux courses ✅");
            }
          );
      }
    );

  $("#recipeSearch")
    ?.addEventListener(
      "input",
      renderRecipes
    );

  $("#recipeGoalFilter")
    ?.addEventListener(
      "change",
      renderRecipes
    );

  [
    "#profileAge",
    "#profileSex",
    "#profileHeight",
    "#profileWeight",
    "#profileBodyFat",
    "#profileTraining",
    "#profileActivity",
    "#profileTargetWeight",
    "#profileTargetBodyFat",
    "#profileDeficit",
    "#proteinTarget",
    "#fatTarget"
  ].forEach(selector => {

    $(selector)?.addEventListener(
      "input",
      () => {

        readProfile();
        renderProfileCalculations();

      }
    );

    $(selector)?.addEventListener(
      "change",
      () => {

        readProfile();
        renderProfileCalculations();

      }
    );

  });

  $$('input[name="profileGoal"]')
    .forEach(input => {

      input.addEventListener(
        "change",
        () => {

          state.profile.goal =
            input.value;

          renderProfileCalculations();

        }
      );

    });
}

/* =========================================================
   INIT
========================================================= */

function initializeApp() {

  setupNavigation();
  setupModal();
  setupEvents();

  renderProfile();
  renderHome();
  renderJournal();
  renderRecipes();
  renderPlanner();
  renderShopping();
  renderProgress();
  renderCoach();

  showPage("home");
}

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);

/* =========================================================
   PUBLIC API
========================================================= */

window.BudgetCook = {

  state,

  FOODS,
  RECIPES,
  DAYS,

  calculateFoodNutrition,
  calculateItemsNutrition,
  calculateDayNutrition,
  calculateRecipeNutrition,

  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateMacros,

  generateDay,
  generateShopping,

  saveProfile,

  saveState,
  renderHome,
  renderJournal,
  renderRecipes,
  renderPlanner,
  renderShopping,
  renderProgress,
  renderCoach
};
