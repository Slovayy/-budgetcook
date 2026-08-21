/* =========================================================
   BUDGETCOOK V4 — APP.JS
   Version corrigée
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const APP_KEY = "budgetcook_v4";

const DEFAULT_APP_STATE = {
  profile: {
    age: 20,
    sex: "male",
    height: 179,
    weight: 88,
    neck: 0,
    waist: 0,
    hip: 0,
    trainingDays: 5,
    activity: 1.55,
    goal: "cut",
    deficit: 300,
    surplus: 250,
    proteinPerKg: 2,
    fatPerKg: 0.8,
    carbsPerKg: 0,
    budget: 50,
    targetWeight: 0,
    targetBodyFat: 0
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
  pantry: [],
  progress: [],
  favorites: [],

  settings: {
    darkMode: true
  }
};

let state = loadState();


/* =========================================================
   OUTILS
========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return [...document.querySelectorAll(selector)];
}

function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(number(value) * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setText(selector, value) {
  const element = $(selector);

  if (element) {
    element.textContent = value;
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatEuro(value) {
  return `${number(value).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} €`;
}


/* =========================================================
   STORAGE
========================================================= */

function cloneDefaultState() {
  return JSON.parse(
    JSON.stringify(DEFAULT_APP_STATE)
  );
}

function mergeDeep(target, source) {

  if (!source || typeof source !== "object") {
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

function loadState() {

  try {

    const saved =
      localStorage.getItem(APP_KEY);

    if (!saved) {
      return cloneDefaultState();
    }

    const parsed =
      JSON.parse(saved);

    return mergeDeep(
      cloneDefaultState(),
      parsed
    );

  } catch (error) {

    console.error(
      "BudgetCook — erreur chargement :",
      error
    );

    return cloneDefaultState();
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
      "BudgetCook — erreur sauvegarde :",
      error
    );

  }

}


/* =========================================================
   DATA
========================================================= */

function getFoods() {
  return Array.isArray(window.FOODS)
    ? window.FOODS
    : [];
}

function getRecipes() {
  return Array.isArray(window.RECIPES)
    ? window.RECIPES
    : [];
}

function getShoppingItems() {
  return Array.isArray(window.SHOPPING_ITEMS)
    ? window.SHOPPING_ITEMS
    : [];
}

function getDays() {

  return Array.isArray(window.DAYS)
    ? window.DAYS
    : [
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
        "Dimanche"
      ];
}

function getFood(foodId) {

  return getFoods().find(
    food => food.id === foodId
  );

}

function getRecipe(recipeId) {

  return getRecipes().find(
    recipe => recipe.id === recipeId
  );

}


/* =========================================================
   NUTRITION
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
    number(quantity) / 100;

  return {

    kcal:
      number(food.kcal) * factor,

    protein:
      number(food.protein) * factor,

    carbs:
      number(food.carbs) * factor,

    fat:
      number(food.fat) * factor

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

    const nutrition =
      calculateFoodNutrition(
        item.food,
        item.grams
      );

    total.kcal += nutrition.kcal;
    total.protein += nutrition.protein;
    total.carbs += nutrition.carbs;
    total.fat += nutrition.fat;

  });

  return total;
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

  return calculateMealNutrition(
    recipe.ingredients.map(
      ingredient => ({
        food: ingredient.food,
        grams:
          number(ingredient.grams) *
          multiplier
      })
    )
  );

}


/* =========================================================
   CALORIES
========================================================= */

function calculateBMR(
  profile = state.profile
) {

  const weight =
    number(profile.weight);

  const height =
    number(profile.height);

  const age =
    number(profile.age);

  if (
    !weight ||
    !height ||
    !age
  ) {
    return 0;
  }

  if (
    String(profile.sex)
      .toLowerCase() === "female"
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

function getActivityMultiplier(profile) {

  const value =
    profile.activity;

  if (
    typeof value === "number" &&
    value > 0
  ) {
    return value;
  }

  const map = {

    sedentary: 1.2,

    light: 1.375,

    lightly_active: 1.375,

    moderate: 1.55,

    moderately_active: 1.55,

    active: 1.725,

    very_active: 1.9,

    extremely_active: 1.9

  };

  return (
    map[value] ||
    1.55
  );
}

function calculateTDEE(
  profile = state.profile
) {

  return (
    calculateBMR(profile) *
    getActivityMultiplier(profile)
  );

}

function calculateCalorieTarget(
  profile = state.profile
) {

  const tdee =
    calculateTDEE(profile);

  let target =
    tdee;

  const goal =
    profile.goal;

  if (goal === "cut") {

    target -=
      number(
        profile.deficit,
        300
      );

  } else if (
    goal === "bulk"
  ) {

    target +=
      number(
        profile.surplus,
        250
      );

  } else if (
    goal === "recomp" ||
    goal === "recomposition"
  ) {

    target -= 200;

  }

  return Math.max(
    1200,
    Math.round(target)
  );

}


/* =========================================================
   MACROS
========================================================= */

/*
   IMPORTANT

   Protéines et lipides sont définis séparément.

   Les glucides sont calculés avec une logique
   cohérente avec l'objectif calorique :

   calories restantes / 4.

   Donc :

   protéines = g/kg
   lipides   = g/kg
   glucides  = calories restantes / 4

   Cela garantit :

   P × 4
   + G × 4
   + L × 9
   = objectif calorique
========================================================= */

function calculateMacros(
  profile = state.profile
) {

  const calories =
    calculateCalorieTarget(profile);

  const weight =
    number(profile.weight);

  const proteinPerKg =
    number(
      profile.proteinPerKg,
      2
    );

  const fatPerKg =
    number(
      profile.fatPerKg,
      0.8
    );

  const protein =
    weight *
    proteinPerKg;

  const fat =
    weight *
    fatPerKg;

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

    macroCalories:
      round(
        proteinCalories +
        carbs * 4 +
        fatCalories
      )

  };

}


/* =========================================================
   BMI
========================================================= */

function calculateBMI(
  profile = state.profile
) {

  const weight =
    number(profile.weight);

  const height =
    number(profile.height) / 100;

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
   MASSE GRASSE US NAVY
========================================================= */

function calculateBodyFat(
  profile = state.profile
) {

  const height =
    number(profile.height);

  const neck =
    number(profile.neck);

  const waist =
    number(profile.waist);

  if (
    !height ||
    !neck ||
    !waist
  ) {
    return null;
  }

  let result;

  if (
    profile.sex === "female"
  ) {

    const hip =
      number(profile.hip);

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

    result =
      495 /
      (
        1.29579 -
        0.35004 *
        Math.log10(value) +
        0.221 *
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

    result =
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
    !Number.isFinite(result)
  ) {
    return null;
  }

  return clamp(
    result,
    2,
    60
  );
}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(
  sectionName
) {

  if (!sectionName) {
    return;
  }

  $$(".page").forEach(page => {

    page.classList.toggle(
      "active",
      page.id ===
      `page-${sectionName}`
    );

  });

  $$("[data-page]").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page ===
      sectionName
    );

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}

function setupNavigation() {

  $$("[data-page]")
    .forEach(button => {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();

          showSection(
            button.dataset.page
          );

        }
      );

    });

}


/* =========================================================
   PROFIL
========================================================= */

function getInputValue(
  id,
  fallback = ""
) {

  const element =
    document.getElementById(id);

  if (!element) {
    return fallback;
  }

  return element.value;
}

function getProfileFromDOM() {

  const profile = {
    ...state.profile
  };

  profile.age =
    number(
      getInputValue(
        "profileAge",
        profile.age
      ),
      profile.age
    );

  profile.sex =
    getInputValue(
      "profileSex",
      profile.sex
    );

  profile.height =
    number(
      getInputValue(
        "profileHeight",
        profile.height
      ),
      profile.height
    );

  profile.weight =
    number(
      getInputValue(
        "profileWeight",
        profile.weight
      ),
      profile.weight
    );

  profile.trainingDays =
    number(
      getInputValue(
        "profileTraining",
        profile.trainingDays
      ),
      profile.trainingDays
    );

  const activity =
    getInputValue(
      "profileActivity",
      profile.activity
    );

  const activityMap = {

    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9

  };

  profile.activity =
    activityMap[activity] ||
    number(
      activity,
      1.55
    );

  const goal =
    document.querySelector(
      'input[name="profileGoal"]:checked'
    );

  if (goal) {

    profile.goal =
      goal.value === "recomp"
        ? "recomposition"
        : goal.value;

  }

  profile.targetWeight =
    number(
      getInputValue(
        "profileTargetWeight",
        profile.targetWeight
      )
    );

  profile.targetBodyFat =
    number(
      getInputValue(
        "profileTargetBodyFat",
        profile.targetBodyFat
      )
    );

  profile.deficit =
    number(
      getInputValue(
        "profileDeficit",
        profile.deficit
      ),
      300
    );

  profile.budget =
    number(
      getInputValue(
        "profileBudget",
        profile.budget
      ),
      50
    );

  const proteinTarget =
    number(
      getInputValue(
        "proteinTarget",
        0
      )
    );

  const fatTarget =
    number(
      getInputValue(
        "fatTarget",
        0
      )
    );

  if (proteinTarget > 0) {

    profile.proteinPerKg =
      proteinTarget /
      Math.max(
        profile.weight,
        1
      );

  }

  if (fatTarget > 0) {

    profile.fatPerKg =
      fatTarget /
      Math.max(
        profile.weight,
        1
      );

  }

  return profile;
}

function renderProfile() {

  const p =
    state.profile;

  const fields = {

    profileAge: p.age,

    profileSex: p.sex,

    profileHeight: p.height,

    profileWeight: p.weight,

    profileTraining: p.trainingDays,

    profileTargetWeight:
      p.targetWeight || "",

    profileTargetBodyFat:
      p.targetBodyFat || "",

    profileDeficit:
      p.deficit,

    profileBudget:
      p.budget

  };

  Object.entries(fields)
    .forEach(
      ([id, value]) => {

        const element =
          document.getElementById(id);

        if (element) {
          element.value =
            value ?? "";
        }

      }
    );

  $$(
    'input[name="profileGoal"]'
  ).forEach(input => {

    input.checked =
      input.value ===
      (
        p.goal === "recomposition"
          ? "recomp"
          : p.goal
      );

  });

  const proteinTarget =
    document.getElementById(
      "proteinTarget"
    );

  if (proteinTarget) {

    proteinTarget.value =
      Math.round(
        p.weight *
        p.proteinPerKg
      );

  }

  const fatTarget =
    document.getElementById(
      "fatTarget"
    );

  if (fatTarget) {

    fatTarget.value =
      Math.round(
        p.weight *
        p.fatPerKg
      );

  }

  updateProfileCalculations();
}

function updateProfileCalculations() {

  const profile =
    getProfileFromDOM();

  const macros =
    calculateMacros(profile);

  const bmr =
    calculateBMR(profile);

  const tdee =
    calculateTDEE(profile);

  const bmi =
    calculateBMI(profile);

  setText(
    "#profileBMR",
    `${Math.round(bmr)} kcal`
  );

  setText(
    "#profileTDEE",
    `${Math.round(tdee)} kcal`
  );

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
    "#profileBMI",
    bmi
      ? `${round(bmi, 1)} — ${getBMICategory(bmi)}`
      : "--"
  );

}

function saveProfile() {

  state.profile =
    getProfileFromDOM();

  saveState();

  updateProfileCalculations();

  renderDashboard();

  renderCoach();

  notify(
    "Profil enregistré ✅"
  );

}


/* =========================================================
   JOURNÉE
========================================================= */

function getCurrentDay() {
  return state.meals;
}

function calculateDayNutrition(
  meals = state.meals
) {

  const all = [

    ...(meals.breakfast || []),

    ...(meals.lunch || []),

    ...(meals.snack || []),

    ...(meals.dinner || [])

  ];

  return calculateMealNutrition(all);
}

function renderDashboard() {

  const target =
    calculateMacros(
      state.profile
    );

  const totals =
    calculateDayNutrition();

  setText(
    "#homeCaloriesConsumed",
    Math.round(totals.kcal)
  );

  setText(
    "#homeCaloriesTarget",
    target.calories
  );

  setText(
    "#homeCaloriesRemaining",
    `${Math.max(
      0,
      Math.round(
        target.calories -
        totals.kcal
      )
    )} kcal restantes`
  );

  setText(
    "#homeProteinConsumed",
    round(totals.protein)
  );

  setText(
    "#homeProteinTarget",
    target.protein
  );

  setText(
    "#homeCarbsConsumed",
    round(totals.carbs)
  );

  setText(
    "#homeCarbsTarget",
    target.carbs
  );

  setText(
    "#homeFatConsumed",
    round(totals.fat)
  );

  setText(
    "#homeFatTarget",
    target.fat
  );

  updateBar(
    "#homeCaloriesProgress",
    totals.kcal,
    target.calories
  );

  updateBar(
    "#homeProteinProgress",
    totals.protein,
    target.protein
  );

  updateBar(
    "#homeCarbsProgress",
    totals.carbs,
    target.carbs
  );

  updateBar(
    "#homeFatProgress",
    totals.fat,
    target.fat
  );

  setText(
    "#homeWeight",
    `${state.profile.weight || "--"} kg`
  );

  setText(
    "#homeBudget",
    `${number(
      state.profile.budget
    )} €`
  );

  renderTodayMeals();
}

function updateBar(
  selector,
  current,
  target
) {

  const element =
    $(selector);

  if (!element) {
    return;
  }

  const percentage =
    target > 0
      ? clamp(
          current /
          target *
          100,
          0,
          100
        )
      : 0;

  element.style.width =
    `${percentage}%`;
}


/* =========================================================
   JOURNAL
========================================================= */

function renderJournal() {

  const target =
    calculateMacros(
      state.profile
    );

  const totals =
    calculateDayNutrition();

  setText(
    "#journalCalories",
    Math.round(totals.kcal)
  );

  setText(
    "#journalCaloriesTarget",
    target.calories
  );

  setText(
    "#journalProtein",
    round(totals.protein)
  );

  setText(
    "#journalProteinTarget",
    target.protein
  );

  setText(
    "#journalCarbs",
    round(totals.carbs)
  );

  setText(
    "#journalCarbsTarget",
    target.carbs
  );

  setText(
    "#journalFat",
    round(totals.fat)
  );

  setText(
    "#journalFatTarget",
    target.fat
  );

  renderMeal(
    "breakfast",
    "breakfastItems",
    "breakfastCalories"
  );

  renderMeal(
    "lunch",
    "lunchItems",
    "lunchCalories"
  );

  renderMeal(
    "snack",
    "snackItems",
    "snackCalories"
  );

  renderMeal(
    "dinner",
    "dinnerItems",
    "dinnerCalories"
  );

}

function renderMeal(
  meal,
  containerId,
  caloriesId
) {

  const container =
    document.getElementById(
      containerId
    );

  const items =
    state.meals[meal] || [];

  const nutrition =
    calculateMealNutrition(items);

  setText(
    `#${caloriesId}`,
    `${Math.round(
      nutrition.kcal
    )} kcal`
  );

  if (!container) {
    return;
  }

  if (!items.length) {

    container.innerHTML = `
      <div class="empty-state">
        Aucun aliment ajouté
      </div>
    `;

    return;
  }

  container.innerHTML =
    items.map(
      (item, index) => {

        const food =
          getFood(item.food);

        if (!food) {
          return "";
        }

        const n =
          calculateFoodNutrition(
            item.food,
            item.grams
          );

        return `
          <div class="food-row">

            <div class="food-info">

              <span class="food-emoji">
                ${food.emoji || "🍽️"}
              </span>

              <div>
                <strong>
                  ${escapeHTML(
                    food.name
                  )}
                </strong>

                <small>
                  ${item.grams}${food.unit || "g"}
                </small>
              </div>

            </div>

            <div class="food-nutrition">
              ${Math.round(n.kcal)} kcal
            </div>

            <button
              type="button"
              class="icon-button"
              data-delete-meal="${meal}"
              data-index="${index}"
            >
              ✕
            </button>

          </div>
        `;

      }
    ).join("");
}

function renderTodayMeals() {

  const container =
    document.getElementById(
      "todayMeals"
    );

  if (!container) {
    return;
  }

  const meals = [
    [
      "breakfast",
      "Petit-déjeuner",
      "🌅"
    ],
    [
      "lunch",
      "Déjeuner",
      "☀️"
    ],
    [
      "snack",
      "Collation",
      "🍎"
    ],
    [
      "dinner",
      "Dîner",
      "🌙"
    ]
  ];

  const hasMeals =
    meals.some(
      ([key]) =>
        state.meals[key] &&
        state.meals[key].length
    );

  if (!hasMeals) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          🍽️
        </div>

        <h3>
          Aucun repas ajouté
        </h3>

        <p>
          Ajoute un repas ou génère
          automatiquement ta journée.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    meals.map(
      ([key, label, emoji]) => {

        const items =
          state.meals[key] || [];

        const nutrition =
          calculateMealNutrition(
            items
          );

        return `
          <div class="meal-card">

            <div class="meal-section-header">

              <div>
                <span>
                  ${emoji}
                </span>

                <strong>
                  ${label}
                </strong>
              </div>

              <span>
                ${Math.round(
                  nutrition.kcal
                )} kcal
              </span>

            </div>

          </div>
        `;

      }
    ).join("");
}


/* =========================================================
   AJOUT ALIMENT
========================================================= */

function openFoodModal(
  selectedMeal = "lunch"
) {

  const overlay =
    document.getElementById(
      "modalOverlay"
    );

  const content =
    document.getElementById(
      "modalContent"
    );

  if (!overlay || !content) {
    return;
  }

  content.innerHTML = `

    <h2>
      Ajouter un aliment
    </h2>

    <div class="form-group">

      <label>
        Aliment
      </label>

      <select
        id="modalFoodSelect"
        class="select-input"
      >

        ${getFoods().map(
          food => `
            <option
              value="${food.id}"
            >
              ${food.emoji || "🍽️"}
              ${escapeHTML(food.name)}
            </option>
          `
        ).join("")}

      </select>

    </div>

    <div class="form-group">

      <label>
        Quantité
      </label>

      <input
        id="modalFoodGrams"
        class="search-input"
        type="number"
        min="1"
        value="100"
      >

    </div>

    <div class="form-group">

      <label>
        Repas
      </label>

      <select
        id="modalFoodMeal"
        class="select-input"
      >

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

    </div>

    <button
      id="confirmFoodButton"
      class="primary-button"
      type="button"
    >
      Ajouter
    </button>
  `;

  const mealSelect =
    document.getElementById(
      "modalFoodMeal"
    );

  if (mealSelect) {
    mealSelect.value =
      selectedMeal;
  }

  overlay.classList.remove(
    "hidden"
  );

  overlay.classList.add(
    "active"
  );

  const confirm =
    document.getElementById(
      "confirmFoodButton"
    );

  if (confirm) {

    confirm.addEventListener(
      "click",
      () => {

        addFoodToMeal(
          document.getElementById(
            "modalFoodSelect"
          )?.value,

          number(
            document.getElementById(
              "modalFoodGrams"
            )?.value
          ),

          document.getElementById(
            "modalFoodMeal"
          )?.value || "lunch"
        );

      }
    );

  }

}

function closeModal() {

  const overlay =
    document.getElementById(
      "modalOverlay"
    );

  if (!overlay) {
    return;
  }

  overlay.classList.add(
    "hidden"
  );

  overlay.classList.remove(
    "active"
  );

}

function addFoodToMeal(
  foodId,
  grams,
  meal = "lunch"
) {

  if (!getFood(foodId)) {
    notify(
      "Aliment introuvable ❌"
    );
    return;
  }

  if (
    !grams ||
    grams <= 0
  ) {
    notify(
      "Quantité invalide ❌"
    );
    return;
  }

  if (!state.meals[meal]) {
    state.meals[meal] = [];
  }

  state.meals[meal].push({
    food: foodId,
    grams: grams
  });

  saveState();

  closeModal();

  renderAll();

  notify(
    "Aliment ajouté ✅"
  );
}

function deleteMealItem(
  meal,
  index
) {

  if (!state.meals[meal]) {
    return;
  }

  state.meals[meal].splice(
    index,
    1
  );

  saveState();

  renderAll();
}


/* =========================================================
   RECETTES
========================================================= */

function renderRecipes() {

  const grid =
    document.getElementById(
      "recipesGrid"
    );

  if (!grid) {
    return;
  }

  const recipes =
    getRecipes();

  grid.innerHTML =
    recipes.map(
      recipe => {

        const n =
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
                    n.kcal
                  )} kcal
                </span>

                <span>
                  P ${round(
                    n.protein
                  )}g
                </span>

                <span>
                  G ${round(
                    n.carbs
                  )}g
                </span>

                <span>
                  L ${round(
                    n.fat
                  )}g
                </span>

              </div>

              <div class="recipe-actions">

                <button
                  type="button"
                  data-add-recipe="${recipe.id}"
                  data-meal="lunch"
                >
                  + Déjeuner
                </button>

                <button
                  type="button"
                  data-add-recipe="${recipe.id}"
                  data-meal="dinner"
                >
                  + Dîner
                </button>

                <button
                  type="button"
                  data-favorite="${recipe.id}"
                >
                  ${favorite
                    ? "❤️"
                    : "♡"}
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

  if (!recipe) {
    return;
  }

  if (!state.meals[meal]) {
    state.meals[meal] = [];
  }

  recipe.ingredients.forEach(
    ingredient => {

      state.meals[meal].push({
        food:
          ingredient.food,
        grams:
          number(
            ingredient.grams
          )
      });

    }
  );

  saveState();

  renderAll();

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

  state.meals = {
    breakfast: [
      {
        food: "oats",
        grams: 50
      },
      {
        food: "greek_yogurt",
        grams: 250
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
        grams: 200
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
        grams: 180
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

  saveState();

  renderAll();

  notify(
    "Journée générée 🍽️"
  );
}

function clearCurrentDay() {

  state.meals = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  };

  saveState();

  renderAll();

  notify(
    "Journée réinitialisée"
  );
}


/* =========================================================
   PLANNING
========================================================= */

function renderPlanner() {

  const container =
    document.getElementById(
      "weekPlanner"
    );

  if (!container) {
    return;
  }

  const days =
    getDays();

  container.innerHTML =
    days.map(
      day => {

        const items =
          state.planner[day] || [];

        const n =
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
                  n.kcal
                )} kcal
              </span>

            </div>

            <div>
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
                            ${food?.emoji || "🍽️"}
                            ${escapeHTML(
                              food?.name ||
                              item.food
                            )}
                            — ${item.grams}g
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


/* =========================================================
   COURSES
========================================================= */

function renderShopping() {

  const container =
    document.getElementById(
      "shoppingList"
    );

  if (!container) {
    return;
  }

  if (!state.shopping.length) {

    container.innerHTML = `
      <div class="empty-state">
        Aucune course
      </div>
    `;

  } else {

    container.innerHTML =
      state.shopping.map(
        (item, index) => `

          <div class="shopping-item">

            <input
              type="checkbox"
              ${
                item.checked
                  ? "checked"
                  : ""
              }
              data-shopping-toggle="${index}"
            >

            <div class="shopping-info">

              <strong>
                ${escapeHTML(
                  item.name
                )}
              </strong>

              <small>
                ${escapeHTML(
                  item.quantity ||
                  ""
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
              data-delete-shopping="${index}"
            >
              ✕
            </button>

          </div>

        `
      ).join("");

  }

  updateShoppingTotals();
}

function updateShoppingTotals() {

  const total =
    state.shopping.reduce(
      (
        sum,
        item
      ) =>
        sum +
        number(item.price),
      0
    );

  setText(
    "#shoppingBudget",
    formatEuro(total)
  );

  setText(
    "#shoppingBudgetLimit",
    formatEuro(
      state.profile.budget
    )
  );

  setText(
    "#shoppingBudgetDifference",
    formatEuro(
      number(
        state.profile.budget
      ) - total
    )
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
      item.quantity || "1",

    price:
      number(item.price),

    checked:
      false
  });

  saveState();

  renderShopping();
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

function generateShoppingFromPlanner() {

  const totals = {};

  getDays().forEach(
    day => {

      const items =
        state.planner[day] ||
        [];

      items.forEach(
        item => {

          totals[item.food] =
            number(
              totals[item.food]
            ) +
            number(item.grams);

        }
      );

    }
  );

  state.shopping =
    Object.entries(totals)
      .map(
        ([foodId, grams]) => {

          const food =
            getFood(foodId);

          if (!food) {
            return null;
          }

          const shop =
            getShoppingItems()
              .find(
                item =>
                  item.id === foodId
              );

          return {

            id: foodId,

            name: food.name,

            quantity:
              `${Math.ceil(
                grams
              )} g`,

            price:
              shop
                ? number(
                    shop.price
                  )
                : 0,

            checked:
              false

          };

        }
      )
      .filter(Boolean);

  saveState();

  renderShopping();

  notify(
    "Courses générées 🛒"
  );
}


/* =========================================================
   PANTRY
========================================================= */

function renderPantry() {

  const grid =
    document.getElementById(
      "pantryGrid"
    );

  if (!grid) {
    return;
  }

  setText(
    "#pantryFoodCount",
    state.pantry.length
  );

  if (!state.pantry.length) {

    grid.innerHTML = `
      <div class="empty-state">
        Garde-manger vide
      </div>
    `;

    return;
  }

  grid.innerHTML =
    state.pantry.map(
      (item, index) => `

        <div class="pantry-item">

          <strong>
            ${escapeHTML(
              item.name
            )}
          </strong>

          <span>
            ${escapeHTML(
              item.quantity ||
              ""
            )}
          </span>

          <button
            type="button"
            data-delete-pantry="${index}"
          >
            ✕
          </button>

        </div>

      `
    ).join("");
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
      "1"
  });

  saveState();

  renderPantry();
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

  const history =
    state.progress || [];

  const latest =
    history.length
      ? history[
          history.length - 1
        ]
      : null;

  if (latest) {

    setText(
      "#progressCurrentWeight",
      `${latest.weight} kg`
    );

    setText(
      "#progressBodyFat",
      latest.bodyFat
        ? `${latest.bodyFat} %`
        : "-- %"
    );

    setText(
      "#progressWaist",
      latest.waist
        ? `${latest.waist} cm`
        : "-- cm"
    );

  } else {

    setText(
      "#progressCurrentWeight",
      `${state.profile.weight} kg`
    );

  }

  setText(
    "#progressBodyFatGoal",
    state.profile.targetBodyFat
      ? `${state.profile.targetBodyFat} %`
      : "--"
  );

  setText(
    "#progressGoal",
    state.profile.goal === "cut"
      ? "Perte de graisse"
      : state.profile.goal === "bulk"
        ? "Prise de masse"
        : "Recomposition"
  );
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
      number(entry.weight),

    bodyFat:
      number(entry.bodyFat),

    waist:
      number(entry.waist)

  });

  saveState();

  renderProgress();

  notify(
    "Mesure enregistrée 📈"
  );
}


/* =========================================================
   COACH
========================================================= */

function renderCoach() {

  const macros =
    calculateMacros(
      state.profile
    );

  const totals =
    calculateDayNutrition();

  setText(
    "#coachCaloriesText",
    `${Math.round(
      totals.kcal
    )} / ${macros.calories} kcal`
  );

  setText(
    "#coachProteinText",
    `${round(
      totals.protein
    )} / ${macros.protein} g`
  );

  setText(
    "#coachBudgetText",
    `${formatEuro(
      calculateShoppingBudget()
    )} utilisés`
  );

  setText(
    "#coachFoodQualityText",
    "Privilégie les aliments peu transformés et les légumes."
  );

  let message =
    "Ton objectif est basé sur ton profil.";

  if (
    totals.protein <
    macros.protein * 0.8
  ) {

    message =
      "Il te manque encore des protéines aujourd’hui.";

  } else if (
    totals.kcal >
    macros.calories
  ) {

    message =
      "Tu as dépassé ton objectif calorique aujourd’hui.";

  } else {

    message =
      "Ta journée est bien partie. Continue comme ça.";

  }

  setText(
    "#coachDailyAnalysis",
    message
  );

  const recommendations =
    document.getElementById(
      "coachRecommendations"
    );

  if (recommendations) {

    recommendations.innerHTML = `
      <div class="recommendation">
        💪 Objectif protéines :
        ${macros.protein} g/jour
      </div>

      <div class="recommendation">
        🔥 Objectif calories :
        ${macros.calories} kcal/jour
      </div>

      <div class="recommendation">
        🍚 Glucides :
        ${macros.carbs} g/jour
      </div>
    `;

  }
}


/* =========================================================
   RECHERCHE
========================================================= */

function searchFoods(
  query
) {

  const q =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!q) {
    return getFoods();
  }

  return getFoods().filter(
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
    String(query || "")
      .trim()
      .toLowerCase();

  if (!q) {
    return getRecipes();
  }

  return getRecipes().filter(
    recipe =>
      recipe.name
        .toLowerCase()
        .includes(q)
  );
}


/* =========================================================
   MODAL / BOUTONS
========================================================= */

function setupButtons() {

  const byId = (
    id,
    handler
  ) => {

    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    element.addEventListener(
      "click",
      handler
    );

  };


  /* Ajouter aliment */

  byId(
    "quickAddButton",
    () => openFoodModal()
  );

  byId(
    "journalAddButton",
    () => openFoodModal()
  );

  byId(
    "addMealButton",
    () => openFoodModal()
  );


  /* Génération */

  byId(
    "generateDayButton",
    generateDay
  );

  byId(
    "emptyGenerateButton",
    generateDay
  );


  /* Profil */

  byId(
    "saveProfileButton",
    saveProfile
  );


  /* Planning */

  byId(
    "generateWeekButton",
    generateWeek
  );

  byId(
    "clearPlannerButton",
    clearPlanner
  );


  /* Courses */

  byId(
    "generateShoppingButton",
    generateShoppingFromPlanner
  );

  byId(
    "clearShoppingButton",
    () => {

      state.shopping = [];

      saveState();

      renderShopping();

    }
  );

  byId(
    "addShoppingItemButton",
    () => {

      const name =
        prompt(
          "Nom de l'aliment :"
        );

      if (!name) {
        return;
      }

      const quantity =
        prompt(
          "Quantité :",
          "1"
        );

      const price =
        prompt(
          "Prix (€) :",
          "0"
        );

      addShoppingItem({
        name,
        quantity,
        price
      });

    }
  );


  /* Garde-manger */

  byId(
    "addPantryItemButton",
    () => {

      const name =
        prompt(
          "Nom de l'aliment :"
        );

      if (!name) {
        return;
      }

      const quantity =
        prompt(
          "Quantité :",
          "1"
        );

      addPantryItem({
        name,
        quantity
      });

    }
  );


  /* Progression */

  byId(
    "addProgressButton",
    () => {

      const weight =
        prompt(
          "Ton poids actuel (kg) :",
          state.profile.weight
        );

      if (!weight) {
        return;
      }

      const bodyFat =
        prompt(
          "Masse grasse (%) — facultatif :",
          ""
        );

      const waist =
        prompt(
          "Tour de taille (cm) — facultatif :",
          ""
        );

      addProgressEntry({
        weight,
        bodyFat,
        waist
      });

    }
  );


  /* Mesures */

  byId(
    "editMeasurementsButton",
    () => showSection("profile")
  );


  /* Premium */

  byId(
    "premiumButton",
    () => {

      notify(
        "BudgetCook Premium arrive bientôt ⭐"
      );

    }
  );


  /* Mobile menu */

  byId(
    "mobileMenuButton",
    () => {

      document.body.classList.toggle(
        "menu-open"
      );

    }
  );


  /* Modal fermeture */

  byId(
    "modalCloseButton",
    closeModal
  );


  const overlay =
    document.getElementById(
      "modalOverlay"
    );

  if (overlay) {

    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          overlay
        ) {
          closeModal();
        }

      }
    );

  }

}


/* =========================================================
   EVENTS DYNAMIQUES
========================================================= */

function setupDynamicEvents() {

  document.addEventListener(
    "click",
    event => {

      const deleteMeal =
        event.target.closest(
          "[data-delete-meal]"
        );

      if (deleteMeal) {

        deleteMealItem(
          deleteMeal.dataset.deleteMeal,
          number(
            deleteMeal.dataset.index
          )
        );

        return;
      }


      const addRecipe =
        event.target.closest(
          "[data-add-recipe]"
        );

      if (addRecipe) {

        addRecipeToCurrentMeal(
          addRecipe.dataset.addRecipe,
          addRecipe.dataset.meal ||
          "lunch"
        );

        return;
      }


      const favorite =
        event.target.closest(
          "[data-favorite]"
        );

      if (favorite) {

        toggleFavorite(
          favorite.dataset.favorite
        );

        return;
      }


      const deleteShopping =
        event.target.closest(
          "[data-delete-shopping]"
        );

      if (deleteShopping) {

        deleteShoppingItem(
          number(
            deleteShopping.dataset
              .deleteShopping
          )
        );

        return;
      }


      const deletePantry =
        event.target.closest(
          "[data-delete-pantry]"
        );

      if (deletePantry) {

        deletePantryItem(
          number(
            deletePantry.dataset
              .deletePantry
          )
        );

      }

    }
  );


  document.addEventListener(
    "change",
    event => {

      const toggle =
        event.target.closest(
          "[data-shopping-toggle]"
        );

      if (toggle) {

        toggleShoppingItem(
          number(
            toggle.dataset
              .shoppingToggle
          )
        );

        return;
      }


      if (
        event.target.id ===
        "profileActivity" ||

        event.target.id ===
        "profileTraining" ||

        event.target.id ===
        "profileAge" ||

        event.target.id ===
        "profileHeight" ||

        event.target.id ===
        "profileWeight" ||

        event.target.id ===
        "profileDeficit"
      ) {

        updateProfileCalculations();

      }


      if (
        event.target.name ===
        "profileGoal"
      ) {

        updateProfileCalculations();

      }

    }
  );


  const recipeSearch =
    document.getElementById(
      "recipeSearch"
    );

  if (recipeSearch) {

    recipeSearch.addEventListener(
      "input",
      () => {

        const query =
          recipeSearch.value
            .toLowerCase()
            .trim();

        $$("#recipesGrid .recipe-card")
          .forEach(card => {

            card.style.display =
              card.textContent
                .toLowerCase()
                .includes(query)
                  ? ""
                  : "none";

          });

      }
    );

  }

}


/* =========================================================
   PLANNING SEMAINE
========================================================= */

function generateWeek() {

  getDays().forEach(
    day => {

      state.planner[day] = [];

      const meals =
        [
          "breakfast",
          "lunch",
          "snack",
          "dinner"
        ];

      meals.forEach(
        meal => {

          const recipes =
            getRecipes();

          if (!recipes.length) {
            return;
          }

          const recipe =
            recipes[
              Math.floor(
                Math.random() *
                recipes.length
              )
            ];

          if (recipe) {

            recipe.ingredients
              .forEach(
                ingredient => {

                  state.planner[day]
                    .push({
                      food:
                        ingredient.food,

                      grams:
                        ingredient.grams
                    });

                }
              );

          }

        }
      );

    }
  );

  saveState();

  renderPlanner();

  notify(
    "Semaine générée 📅"
  );
}

function clearPlanner() {

  getDays().forEach(
    day => {

      state.planner[day] = [];

    }
  );

  saveState();

  renderPlanner();

}


/* =========================================================
   SETTINGS
========================================================= */

function applySettings() {

  document.body.classList.toggle(
    "dark-mode",
    state.settings.darkMode !== false
  );

}

function toggleDarkMode() {

  state.settings.darkMode =
    !state.settings.darkMode;

  saveState();

  applySettings();

}


/* =========================================================
   NOTIFICATION
========================================================= */

function notify(
  message
) {

  let toast =
    document.getElementById(
      "budgetcookNotification"
    );

  if (!toast) {

    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "budgetcookNotification";

    toast.className =
      "budgetcook-notification";

    document.body.appendChild(
      toast
    );

  }

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  clearTimeout(
    toast._timer
  );

  toast._timer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2500
    );

}


/* =========================================================
   EXPORT / IMPORT
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

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );

}

function importData(
  file
) {

  if (!file) {
    return;
  }

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
            cloneDefaultState(),
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

  reader.readAsText(file);
}


/* =========================================================
   RESET
========================================================= */

function resetApp() {

  const confirmed =
    confirm(
      "Supprimer toutes les données BudgetCook ?"
    );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(
    APP_KEY
  );

  location.reload();
}


/* =========================================================
   RENDER GLOBAL
========================================================= */

function renderAll() {

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
   INITIALISATION
========================================================= */

function initializeApp() {

  console.log(
    "BudgetCook V4 — initialisation"
  );

  setupNavigation();

  setupButtons();

  setupDynamicEvents();

  renderAll();

}


/* =========================================================
   GLOBAL API
========================================================= */

window.BudgetCook = {

  get state() {
    return state;
  },

  get FOODS() {
    return getFoods();
  },

  get RECIPES() {
    return getRecipes();
  },

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

  generateWeek,

  generateShoppingFromPlanner,

  addShoppingItem,

  addPantryItem,

  addProgressEntry,

  searchFoods,

  searchRecipes,

  exportData,

  importData,

  saveState,

  showSection

};


/* =========================================================
   COMPATIBILITÉ HTML
========================================================= */

window.saveProfileFromDOM =
  saveProfile;

window.generateDay =
  generateDay;

window.clearCurrentDay =
  clearCurrentDay;

window.addFoodToMeal =
  addFoodToMeal;

window.closeModal =
  closeModal;

window.toggleShoppingItem =
  toggleShoppingItem;

window.deleteShoppingItem =
  deleteShoppingItem;

window.addShoppingItem =
  addShoppingItem;

window.addPantryItem =
  addPantryItem;

window.deletePantryItem =
  deletePantryItem;

window.addProgressEntry =
  addProgressEntry;

window.generateWeek =
  generateWeek;

window.generateShoppingFromPlanner =
  generateShoppingFromPlanner;

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


/* =========================================================
   START
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

} else {

  initializeApp();

}
