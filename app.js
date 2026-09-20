/* =========================================================
   BUDGETCOOK V2 — APPLICATION CONTROLLER
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const STORAGE_KEY = "budgetcook_v2";

const MEALS = [
  "breakfast",
  "lunch",
  "snack",
  "dinner"
];

const MEAL_LABELS = {
  breakfast: "🌅 Petit-déjeuner",
  lunch: "☀️ Déjeuner",
  snack: "🍎 Collation",
  dinner: "🌙 Dîner"
};

const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"
];

const MEAL_CALORIE_SPLIT = {
  breakfast: 0.22,
  lunch: 0.36,
  snack: 0.12,
  dinner: 0.30
};


/* =========================================================
   PROFIL PAR DÉFAUT
========================================================= */

const DEFAULT_PROFILE = {

  name: "",

  age: 20,

  sex: "male",

  height: 179,

  weight: 88,

  bodyFat: 30,

  chest: 0,

  waist: 0,

  hips: 0,

  arm: 0,

  thigh: 0,

  neck: 0,

  trainingDays: 5,

  activity: "active",

  goal: "recomp",

  targetWeight: 80,

  targetBodyFat: 15,

  deficit: 300,

  proteinPerKg: 2,

  fatPerKg: 0.8,

  budget: 50,

  store: "",

  preferences: {

    autoGenerate: false,

    budgetOptimization: true,

    highProtein: true

  }

};


/* =========================================================
   OUTILS
========================================================= */

function clone(value) {

  return JSON.parse(JSON.stringify(value));

}


function id(prefix = "item") {

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;

}


function number(value, fallback = 0) {

  const result = Number(value);

  return Number.isFinite(result)
    ? result
    : fallback;

}


function round(value, precision = 1) {

  const factor = 10 ** precision;

  return Math.round(number(value) * factor) / factor;

}


function format(value, digits = 0) {

  return new Intl.NumberFormat("fr-FR", {

    minimumFractionDigits: digits,

    maximumFractionDigits: digits

  }).format(number(value));

}


function euro(value) {

  return `${format(value, 2)} €`;

}


function byId(value) {

  return document.getElementById(value);

}


function setText(target, value) {

  const node =
    typeof target === "string"
      ? byId(target)
      : target;

  if (node) {

    node.textContent = value;

  }

}


function escapeHtml(value) {

  const node = document.createElement("span");

  node.textContent = String(value ?? "");

  return node.innerHTML;

}


function dateKey(date = new Date()) {

  const local = new Date(
    date.getTime() -
    date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);

}


function randomItem(array) {

  if (!Array.isArray(array) || !array.length) {

    return null;

  }

  return array[
    Math.floor(Math.random() * array.length)
  ];

}


/* =========================================================
   STRUCTURE JOUR / PLANNING
========================================================= */

function newDay() {

  return {

    breakfast: [],

    lunch: [],

    snack: [],

    dinner: []

  };

}


function defaultPlanner() {

  return DAYS.map((day, index) => ({

    day,

    index,

    meals: newDay()

  }));

}


/* =========================================================
   ÉTAT
========================================================= */

function defaultState() {

  return {

    version: 2,

    profile: clone(DEFAULT_PROFILE),

    journal: {},

    planner: defaultPlanner(),

    recipes: [],

    shopping: [],

    pantry: [],

    progress: []

  };

}


function normalizeDay(day) {

  const result = newDay();

  MEALS.forEach(meal => {

    result[meal] =
      Array.isArray(day?.[meal])

        ? day[meal]

            .filter(
              item =>
                item &&
                item.foodId &&
                number(item.grams) > 0
            )

            .map(item => ({

              id: item.id || id("meal"),

              foodId: item.foodId,

              grams: round(item.grams)

            }))

        : [];

  });

  return result;

}


function loadState() {

  try {

    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {

      return defaultState();

    }

    const saved = JSON.parse(raw);

    const fallback = defaultState();

    const profile = {

      ...fallback.profile,

      ...(saved.profile || {}),

      preferences: {

        ...fallback.profile.preferences,

        ...(saved.profile?.preferences || {})

      }

    };

    const planner =
      Array.isArray(saved.planner) &&
      saved.planner.length === 7

        ? saved.planner.map(
            (day, index) => ({

              day: DAYS[index],

              index,

              meals: normalizeDay(
                day?.meals
              )

            })
          )

        : fallback.planner;

    const journal =
      saved.journal &&
      !Array.isArray(saved.journal)

        ? Object.fromEntries(

            Object.entries(saved.journal)
              .map(([key, day]) => [

                key,

                normalizeDay(day)

              ])

          )

        : {};

    return {

      ...fallback,

      ...saved,

      version: 2,

      profile,

      journal,

      planner,

      recipes: Array.isArray(saved.recipes)
        ? saved.recipes
        : [],

      shopping: Array.isArray(saved.shopping)
        ? saved.shopping
        : [],

      pantry: Array.isArray(saved.pantry)
        ? saved.pantry
        : [],

      progress: Array.isArray(saved.progress)
        ? saved.progress
        : []

    };

  } catch (error) {

    console.warn(
      "BudgetCook : impossible de charger la sauvegarde.",
      error
    );

    return defaultState();

  }

}


let state = loadState();


function saveState() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

  } catch (error) {

    console.warn(
      "BudgetCook : sauvegarde impossible.",
      error
    );

  }

}


/* =========================================================
   ALIMENTS
========================================================= */

function foods() {

  return typeof FOODS !== "undefined" &&
    Array.isArray(FOODS)

    ? FOODS

    : [];

}


function food(foodId) {

  return foods().find(
    item => item.id === foodId
  ) || null;

}


function nutrition(foodId, grams) {

  const item = food(foodId);

  if (!item) {

    return {

      kcal: 0,

      protein: 0,

      carbs: 0,

      fat: 0,

      price: 0

    };

  }

  const factor =
    Math.max(0, number(grams)) / 100;

  return {

    kcal: round(
      number(item.kcal) * factor
    ),

    protein: round(
      number(item.protein) * factor
    ),

    carbs: round(
      number(item.carbs) * factor
    ),

    fat: round(
      number(item.fat) * factor
    ),

    price: round(
      number(item.price) * factor,
      2
    )

  };

}


function totals(items = []) {

  return items.reduce(

    (sum, item) => {

      const value = nutrition(
        item.foodId,
        item.grams
      );

      sum.kcal += value.kcal;

      sum.protein += value.protein;

      sum.carbs += value.carbs;

      sum.fat += value.fat;

      sum.price += value.price;

      return sum;

    },

    {

      kcal: 0,

      protein: 0,

      carbs: 0,

      fat: 0,

      price: 0

    }

  );

}


function dailyTotals(day = currentDay()) {

  return totals(

    MEALS.flatMap(
      meal => day[meal] || []
    )

  );

}


/* =========================================================
   CALCUL DES OBJECTIFS
========================================================= */

function getActivityFactor(activity) {

  const factors = {

    sedentary: 1.20,

    light: 1.375,

    moderate: 1.55,

    active: 1.725,

    very_active: 1.90,

    lightly_active: 1.375,

    moderately_active: 1.55,

    very_active_old: 1.725

  };

  return factors[activity] || 1.55;

}


function normalizeGoal(goal) {

  if (goal === "gain") {

    return "bulk";

  }

  if (goal === "recomposition") {

    return "recomp";

  }

  return goal || "recomp";

}


function targets(profile = state.profile) {

  const weight =
    Math.max(
      1,
      number(profile.weight, 88)
    );

  const height =
    Math.max(
      1,
      number(profile.height, 179)
    );

  const age =
    Math.max(
      1,
      number(profile.age, 20)
    );


  /* Mifflin-St Jeor */

  const bmr =
    profile.sex === "female"

      ? 10 * weight +
        6.25 * height -
        5 * age -
        161

      : 10 * weight +
        6.25 * height -
        5 * age +
        5;


  const activityFactor =
    getActivityFactor(
      profile.activity
    );


  const maintenance =
    bmr * activityFactor;


  const goal =
    normalizeGoal(profile.goal);


  let adjustment = 0;


  if (goal === "cut") {

    adjustment =
      -Math.abs(
        number(profile.deficit, 300)
      );

  }

  else if (goal === "bulk") {

    adjustment =
      Math.abs(
        number(profile.surplus, 250)
      );

  }

  else if (goal === "recomp") {

    adjustment =
      -Math.min(
        300,
        Math.abs(
          number(profile.deficit, 200)
        )
      );

  }


  let calories =
    Math.round(
      maintenance + adjustment
    );


  /*
     Évite les objectifs extrêmement bas.
     Le minimum ici est une protection technique,
     pas une recommandation médicale.
  */

  calories =
    Math.max(
      1200,
      calories
    );


  /*
     Protéines et lipides sont calculés EN PREMIER.
     Les glucides correspondent uniquement aux calories restantes.
  */

  const protein =
    Math.max(
      0,
      number(
        profile.proteinPerKg,
        2
      ) * weight
    );


  const fat =
    Math.max(
      0,
      number(
        profile.fatPerKg,
        0.8
      ) * weight
    );


  const remainingCalories =
    calories -
    protein * 4 -
    fat * 9;


  const carbs =
    Math.max(
      0,
      remainingCalories / 4
    );


  return {

    calories,

    protein: round(protein),

    fat: round(fat),

    carbs: round(carbs),

    bmr: Math.round(bmr),

    maintenance: Math.round(
      maintenance
    )

  };

}


/* =========================================================
   JOUR COURANT
========================================================= */

function currentDay() {

  const key = dateKey();

  if (!state.journal[key]) {

    state.journal[key] = newDay();

  }

  return state.journal[key];

}


/* =========================================================
   TOAST / MODALES
========================================================= */

function toast(
  message,
  type = "info"
) {

  const container =
    byId("toastContainer");

  if (!container) return;

  const item =
    document.createElement("div");

  item.className =
    `toast toast-${type}`;

  item.textContent = message;

  container.appendChild(item);

  requestAnimationFrame(
    () => item.classList.add("show")
  );

  setTimeout(() => {

    item.classList.remove("show");

    setTimeout(
      () => item.remove(),
      250
    );

  }, 2600);

}


function openModal(content) {

  const overlay =
    byId("modalOverlay");

  const modalContent =
    byId("modalContent");

  if (!overlay || !modalContent) {

    return;

  }

  modalContent.innerHTML = content;

  overlay.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );

}


function closeModal() {

  byId("modalOverlay")
    ?.classList.add("hidden");

  document.body.classList.remove(
    "modal-open"
  );

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(page) {

  document
    .querySelectorAll(".page")
    .forEach(node => {

      node.classList.toggle(
        "active",
        node.id === `page-${page}`
      );

    });


  document
    .querySelectorAll("[data-page]")
    .forEach(node => {

      node.classList.toggle(
        "active",
        node.dataset.page === page
      );

    });


  document
    .querySelector(".sidebar")
    ?.classList.remove(
      "mobile-open"
    );

}


/* =========================================================
   ALIMENTS — JOURNAL
========================================================= */

function addFood(
  foodId,
  grams,
  meal = "lunch",
  day = currentDay()
) {

  if (!food(foodId)) {

    toast(
      "Aliment introuvable.",
      "error"
    );

    return false;

  }


  if (!MEALS.includes(meal)) {

    return false;

  }


  const quantity =
    Math.max(
      1,
      round(grams)
    );


  day[meal].push({

    id: id("meal"),

    foodId,

    grams: quantity

  });


  saveState();

  render();

  return true;

}


function updateFood(
  meal,
  itemId,
  grams
) {

  const day =
    currentDay();

  const item =
    day[meal]?.find(
      entry =>
        entry.id === itemId
    );


  if (!item) return;


  item.grams =
    Math.max(
      1,
      round(grams)
    );


  saveState();

  render();

}


function removeFood(
  meal,
  itemId
) {

  const day =
    currentDay();


  day[meal] =
    day[meal].filter(
      item =>
        item.id !== itemId
    );


  saveState();

  render();

}


/* =========================================================
   RECETTES
========================================================= */

function recipes() {

  const source =
    typeof RECIPES !== "undefined" &&
    Array.isArray(RECIPES)

      ? RECIPES

      : [];


  const all = [

    ...source,

    ...state.recipes

  ];


  const seen =
    new Set();


  return all.filter(recipe => {

    if (!recipe?.id) {

      return false;

    }

    if (seen.has(recipe.id)) {

      return false;

    }

    seen.add(recipe.id);

    return true;

  });

}


function recipeNutrition(recipe) {

  return totals(

    (recipe.ingredients || [])
      .map(item => ({

        foodId:
          item.foodId ||
          item.food,

        grams:
          item.grams

      }))

  );

}


/* =========================================================
   RENDU ACCUEIL
========================================================= */

function renderMacro(
  prefix,
  consumed,
  target
) {

  setText(
    `${prefix}Consumed`,
    format(consumed)
  );

  setText(
    `${prefix}Target`,
    format(target)
  );


  const progress =
    byId(`${prefix}Progress`);


  if (progress) {

    progress.style.width =
      `${Math.min(
        100,
        target
          ? consumed / target * 100
          : 0
      )}%`;

  }

}


function renderHome() {

  const total =
    dailyTotals();

  const goal =
    targets();


  setText(
    "homeCaloriesConsumed",
    format(total.kcal)
  );


  setText(
    "homeCaloriesTarget",
    format(goal.calories)
  );


  setText(
    "homeCaloriesRemaining",

    `${format(
      Math.max(
        0,
        goal.calories -
        total.kcal
      )
    )} kcal restants`

  );


  setText(

    "homeCaloriesPercent",

    `${format(
      goal.calories
        ? total.kcal /
          goal.calories *
          100
        : 0
    )}%`

  );


  const circle =
    byId(
      "homeCaloriesProgress"
    );


  if (circle) {

    circle.style.setProperty(

      "--progress",

      `${Math.min(
        100,
        goal.calories
          ? total.kcal /
            goal.calories *
            100
          : 0
      )}%`

    );

  }


  renderMacro(
    "homeProtein",
    total.protein,
    goal.protein
  );


  renderMacro(
    "homeCarbs",
    total.carbs,
    goal.carbs
  );


  renderMacro(
    "homeFat",
    total.fat,
    goal.fat
  );


  setText(
    "homeBudget",
    euro(total.price)
  );


  setText(
    "homeWeight",
    `${format(
      state.profile.weight,
      1
    )} kg`
  );


  const preview =
    byId("todayMeals");


  if (!preview) return;


  const items =
    MEALS.flatMap(
      meal =>
        currentDay()[meal]
          .map(item => ({
            meal,
            item
          }))
    );


  if (!items.length) {

    preview.innerHTML = `

      <div class="empty-state">

        <p>
          Aucun repas enregistré aujourd'hui.
        </p>

      </div>

    `;

    return;

  }


  preview.innerHTML =
    items.map(
      ({ meal, item }) => {

        const entry =
          food(item.foodId);

        const value =
          nutrition(
            item.foodId,
            item.grams
          );


        return `

          <div class="meal-item">

            <span>
              ${entry?.emoji || "🍽️"}
            </span>

            <div>

              <strong>
                ${escapeHtml(
                  entry?.name ||
                  "Aliment"
                )}
              </strong>

              <small>
                ${MEAL_LABELS[meal]}
                ·
                ${format(item.grams)} g
              </small>

            </div>

            <strong>
              ${format(value.kcal)}
              kcal
            </strong>

          </div>

        `;

      }

    ).join("");

}


/* =========================================================
   JOURNAL
========================================================= */

function renderJournal() {

  const total =
    dailyTotals();

  const goal =
    targets();


  const values = [

    ["Calories", "kcal"],

    ["Protein", "protein"],

    ["Carbs", "carbs"],

    ["Fat", "fat"]

  ];


  values.forEach(
    ([label, key]) => {

      setText(
        `journal${label}`,
        format(total[key])
      );

      setText(
        `journal${label}Target`,
        format(goal[key])
      );

    }
  );


  MEALS.forEach(meal => {

    const items =
      currentDay()[meal];

    const container =
      byId(`${meal}Items`);


    setText(

      `${meal}Calories`,

      `${format(
        totals(items).kcal
      )} kcal`

    );


    if (!container) return;


    container.innerHTML =
      items.length

        ? items
            .map(item =>
              mealItemHtml(
                meal,
                item
              )
            )
            .join("")

        : `

          <div class="meal-empty">

            <span>
              Aucun aliment ajouté
            </span>

          </div>

        `;

  });

}


function mealItemHtml(
  meal,
  item
) {

  const entry =
    food(item.foodId);

  const value =
    nutrition(
      item.foodId,
      item.grams
    );


  return `

    <div class="meal-item">

      <div class="meal-item-info">

        <span class="meal-item-icon">
          ${entry?.emoji || "🍽️"}
        </span>

        <div>

          <strong>
            ${escapeHtml(
              entry?.name ||
              "Aliment"
            )}
          </strong>

          <span>
            ${format(item.grams)}
            g
            ·
            ${format(value.kcal)}
            kcal
            ·
            P
            ${format(value.protein)}
            g
          </span>

        </div>

      </div>

      <div class="meal-item-actions">

        <button
          type="button"
          class="icon-button-small"
          data-edit-item="${item.id}"
          data-meal="${meal}"
          aria-label="Modifier"
        >
          ✏️
        </button>

        <button
          type="button"
          class="icon-button-small danger"
          data-remove-item="${item.id}"
          data-meal="${meal}"
          aria-label="Supprimer"
        >
          ×
        </button>

      </div>

    </div>

  `;

}


/* =========================================================
   RECETTES — AFFICHAGE
========================================================= */

function renderRecipes() {

  const container =
    byId("recipesGrid");

  if (!container) return;


  const query =
    String(
      byId("recipeSearch")?.value ||
      ""
    )
      .trim()
      .toLocaleLowerCase("fr");


  const goal =
    byId("recipeGoalFilter")
      ?.value || "";


  const filtered =
    recipes().filter(recipe => {

      const matchesSearch =
        !query ||
        recipe.name
          .toLocaleLowerCase("fr")
          .includes(query);


      const matchesGoal =
        !goal ||
        goal === "all" ||
        recipe.goal === goal;


      return (
        matchesSearch &&
        matchesGoal
      );

    });


  container.innerHTML =
    filtered.length

      ? filtered
          .map(recipe =>
            recipeHtml(recipe)
          )
          .join("")

      : `

        <div class="empty-state">

          <p>
            Aucune recette trouvée.
          </p>

        </div>

      `;

}


function recipeHtml(recipe) {

  const value =
    recipeNutrition(recipe);


  return `

    <article class="recipe-card">

      <div class="recipe-image">

        ${recipe.emoji || "🍳"}

      </div>

      <div class="recipe-content">

        <h3>
          ${escapeHtml(
            recipe.name
          )}
        </h3>

        <p>
          ${escapeHtml(
            recipe.category ||
            "Recette"
          )}
        </p>

        <div class="recipe-macros">

          <span>
            ${format(value.kcal)}
            kcal
          </span>

          <span>
            P
            ${format(value.protein)}
            g
          </span>

          <span>
            G
            ${format(value.carbs)}
            g
          </span>

        </div>

        <div class="recipe-actions">

          <button
            type="button"
            class="secondary-button"
            data-recipe-detail="${recipe.id}"
          >
            Voir
          </button>

          <button
            type="button"
            class="primary-button"
            data-recipe-add="${recipe.id}"
          >
            Ajouter
          </button>

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   PLANNING
========================================================= */

function plannerTotals() {

  return state.planner.reduce(

    (sum, day) => {

      const value =
        dailyTotals(day.meals);

      sum.kcal += value.kcal;

      sum.protein += value.protein;

      sum.price += value.price;

      return sum;

    },

    {

      kcal: 0,

      protein: 0,

      price: 0

    }

  );

}


function renderPlanner() {

  const container =
    byId("weekPlanner");

  if (!container) return;


  container.innerHTML =
    state.planner
      .map(
        (day, index) => {

          const value =
            dailyTotals(
              day.meals
            );


          return `

            <section class="planner-day">

              <div class="planner-day-header">

                <strong>
                  ${day.day}
                </strong>

                <span>
                  ${format(value.kcal)}
                  kcal
                  ·
                  P
                  ${format(value.protein)}
                  g
                </span>

              </div>


              ${MEALS.map(meal => `

                <div class="planner-meal">

                  <strong>
                    ${MEAL_LABELS[meal]}
                  </strong>

                  <div>

                    ${
                      day.meals[meal].length

                        ? day.meals[meal]
                            .map(
                              item =>
                                `${escapeHtml(
                                  food(
                                    item.foodId
                                  )?.name ||
                                  "Aliment"
                                )}
                                (${format(
                                  item.grams
                                )} g)`
                            )
                            .join(", ")

                        : "Aucun aliment"

                    }

                  </div>

                  <button
                    type="button"
                    class="add-small-button"
                    data-planner-add="${meal}"
                    data-planner-day="${index}"
                  >
                    +
                  </button>

                </div>

              `).join("")}

            </section>

          `;

        }

      )
      .join("");


  const value =
    plannerTotals();


  setText(
    "plannerAverageCalories",

    `${format(
      value.kcal / 7
    )} kcal`

  );


  setText(
    "plannerAverageProtein",

    `${format(
      value.protein / 7
    )} g`

  );


  setText(
    "plannerBudget",

    euro(value.price)

  );

}


/* =========================================================
   PROFIL
========================================================= */

function renderProfile() {

  const p =
    state.profile;


  const fields = {

    profileName: p.name,

    profileAge: p.age,

    profileSex: p.sex,

    profileHeight: p.height,

    profileWeight: p.weight,

    profileBodyFat: p.bodyFat,

    profileChest: p.chest,

    profileWaist: p.waist,

    profileHips: p.hips,

    profileArm: p.arm,

    profileThigh: p.thigh,

    profileNeck: p.neck,

    profileTraining: p.trainingDays,

    profileActivity: p.activity,

    profileTargetWeight:
      p.targetWeight,

    profileTargetBodyFat:
      p.targetBodyFat,

    profileDeficit:
      p.deficit,

    proteinTarget:
      p.proteinPerKg,

    fatTarget:
      p.fatPerKg,

    profileBudget:
      p.budget,

    profileStore:
      p.store

  };


  Object.entries(fields)
    .forEach(
      ([key, value]) => {

        const node =
          byId(key);

        if (node) {

          node.value =
            value ?? "";

        }

      }
    );


  const selectedGoal =
    document.querySelector(
      `input[name="profileGoal"][value="${p.goal}"]`
    );


  if (selectedGoal) {

    selectedGoal.checked =
      true;

  }


  const preferenceMap = {

    preferenceAutoGenerate:
      "autoGenerate",

    preferenceBudgetOptimization:
      "budgetOptimization",

    preferenceHighProtein:
      "highProtein"

  };


  Object.entries(
    preferenceMap
  ).forEach(
    ([elementId, key]) => {

      const node =
        byId(elementId);

      if (node) {

        node.checked =
          Boolean(
            p.preferences[key]
          );

      }

    }
  );


  const goal =
    targets();


  setText(
    "calculatedCarbs",
    `${format(goal.carbs)} g`
  );


  setText(
    "profileCalculatedCalories",
    `${format(goal.calories)} kcal`
  );


  setText(
    "profileCalculatedProtein",
    `${format(goal.protein)} g`
  );


  setText(
    "profileCalculatedFat",
    `${format(goal.fat)} g`
  );


  setText(
    "profileCalculatedCarbs",
    `${format(goal.carbs)} g`
  );

}


/* =========================================================
   COACH
========================================================= */

function renderCoach() {

  const total =
    dailyTotals();

  const goal =
    targets();


  setText(

    "coachCaloriesText",

    `${format(total.kcal)}
     / ${format(goal.calories)}
     kcal`

  );


  setText(

    "coachProteinText",

    `${format(total.protein)}
     / ${format(goal.protein)}
     g`

  );


  setText(

    "coachBudgetText",

    `${euro(total.price)}
     aujourd'hui`

  );


  if (total.protein >= goal.protein) {

    setText(
      "coachFoodQualityText",
      "Objectif protéines atteint."
    );

  }

  else {

    setText(
      "coachFoodQualityText",
      "Il manque encore des protéines."
    );

  }


  const list =
    byId(
      "coachRecommendations"
    );


  if (!list) return;


  const recommendations = [];


  if (
    total.kcal <
    goal.calories * 0.75
  ) {

    recommendations.push(
      "Ton apport calorique est encore assez bas aujourd'hui."
    );

  }

  else if (
    total.kcal >
    goal.calories * 1.10
  ) {

    recommendations.push(
      "Tu dépasses actuellement ton objectif calorique."
    );

  }

  else {

    recommendations.push(
      "Ton apport calorique est dans une zone proche de ton objectif."
    );

  }


  if (
    total.protein <
    goal.protein * 0.8
  ) {

    recommendations.push(
      "Ajoute une source de protéines : poulet, dinde, thon, œufs ou poisson."
    );

  }

  else {

    recommendations.push(
      "Ton apport en protéines est bien avancé."
    );

  }


  if (
    total.fat <
    goal.fat * 0.5
  ) {

    recommendations.push(
      "Pense aussi à conserver suffisamment de matières grasses dans la journée."
    );

  }


  list.innerHTML =
    recommendations
      .map(
        item =>
          `<li>${escapeHtml(item)}</li>`
      )
      .join("");

}


/* =========================================================
   RENDU GLOBAL
========================================================= */

function render() {

  renderHome();

  renderJournal();

  renderRecipes();

  renderPlanner();

  renderProfile();

  renderCoach();

}


/* =========================================================
   AJOUT D'ALIMENT
========================================================= */

function openFoodPicker({
  meal = "lunch",
  plannerDay = null
} = {}) {

  const options =
    foods()
      .map(
        item => `

          <option value="${item.id}">

            ${escapeHtml(
              item.name
            )}
            —
            ${format(item.kcal)}
            kcal/100 g

          </option>

        `
      )
      .join("");


  if (!options) {

    toast(
      "Aucun aliment disponible.",
      "error"
    );

    return;

  }


  openModal(`

    <div class="modal-header">

      <h2>
        Ajouter un aliment
      </h2>

      <p>
        Choisis l'aliment et la quantité.
      </p>

    </div>


    <div class="form-group">

      <label for="foodPickerSelect">
        Aliment
      </label>

      <select id="foodPickerSelect">
        ${options}
      </select>

    </div>


    <div class="form-group">

      <label for="foodPickerGrams">
        Quantité en grammes
      </label>

      <input
        id="foodPickerGrams"
        type="number"
        min="1"
        step="1"
        value="100"
      >

    </div>


    <div class="form-group">

      <label for="foodPickerMeal">
        Repas
      </label>

      <select id="foodPickerMeal">

        ${MEALS.map(
          value => `

            <option
              value="${value}"
              ${
                value === meal
                  ? "selected"
                  : ""
              }
            >
              ${MEAL_LABELS[value]}
            </option>

          `
        ).join("")}

      </select>

    </div>


    <div class="modal-actions">

      <button
        type="button"
        class="secondary-button"
        id="cancelFoodPicker"
      >
        Annuler
      </button>

      <button
        type="button"
        class="primary-button"
        id="confirmFoodPicker"
      >
        Ajouter
      </button>

    </div>

  `);


  byId(
    "cancelFoodPicker"
  )?.addEventListener(
    "click",
    closeModal
  );


  byId(
    "confirmFoodPicker"
  )?.addEventListener(
    "click",
    () => {

      const foodId =
        byId(
          "foodPickerSelect"
        )?.value;


      const grams =
        number(
          byId(
            "foodPickerGrams"
          )?.value
        );


      const selectedMeal =
        byId(
          "foodPickerMeal"
        )?.value;


      if (
        !foodId ||
        grams <= 0
      ) {

        toast(
          "Indique une quantité valide.",
          "error"
        );

        return;

      }


      if (
        plannerDay === null
      ) {

        addFood(
          foodId,
          grams,
          selectedMeal
        );

      }

      else {

        state.planner[
          plannerDay
        ].meals[
          selectedMeal
        ].push({

          id: id("plan"),

          foodId,

          grams:
            round(grams)

        });


        saveState();

        render();

      }


      closeModal();

      toast(
        "Aliment ajouté.",
        "success"
      );

    }

  );

}


/* =========================================================
   MODIFIER QUANTITÉ
========================================================= */

function openEditPicker(
  meal,
  itemId
) {

  const item =
    currentDay()[meal]
      ?.find(
        entry =>
          entry.id === itemId
      );


  if (!item) return;


  const entry =
    food(item.foodId);


  openModal(`

    <div class="modal-header">

      <h2>
        Modifier la quantité
      </h2>

      <p>
        ${escapeHtml(
          entry?.name ||
          "Aliment"
        )}
      </p>

    </div>


    <div class="form-group">

      <label for="editGrams">
        Quantité en grammes
      </label>

      <input
        id="editGrams"
        type="number"
        min="1"
        step="1"
        value="${item.grams}"
      >

    </div>


    <div class="modal-actions">

      <button
        type="button"
        class="secondary-button"
        id="cancelEdit"
      >
        Annuler
      </button>

      <button
        type="button"
        class="primary-button"
        id="saveEdit"
      >
        Enregistrer
      </button>

    </div>

  `);


  byId("cancelEdit")
    ?.addEventListener(
      "click",
      closeModal
    );


  byId("saveEdit")
    ?.addEventListener(
      "click",
      () => {

        const grams =
          number(
            byId(
              "editGrams"
            )?.value
          );


        if (grams <= 0) {

          toast(
            "Indique une quantité valide.",
            "error"
          );

          return;

        }


        updateFood(
          meal,
          itemId,
          grams
        );


        closeModal();

        toast(
          "Quantité mise à jour.",
          "success"
        );

      }
    );

}


/* =========================================================
   DÉTAIL RECETTE
========================================================= */

function openRecipeDetail(
  recipeId
) {

  const recipe =
    recipes().find(
      item =>
        item.id === recipeId
    );


  if (!recipe) return;


  const value =
    recipeNutrition(recipe);


  openModal(`

    <div class="modal-header">

      <h2>
        ${escapeHtml(
          recipe.name
        )}
      </h2>

      <p>
        ${escapeHtml(
          recipe.category ||
          "Recette"
        )}
      </p>

    </div>


    <div class="recipe-macros">

      <span>
        ${format(value.kcal)}
        kcal
      </span>

      <span>
        P
        ${format(value.protein)}
        g
      </span>

      <span>
        G
        ${format(value.carbs)}
        g
      </span>

      <span>
        L
        ${format(value.fat)}
        g
      </span>

    </div>


    <ul>

      ${(recipe.ingredients || [])
        .map(item => `

          <li>

            ${escapeHtml(
              food(
                item.foodId ||
                item.food
              )?.name ||
              item.foodId ||
              item.food ||
              "Aliment"
            )}

            —
            ${format(
              item.grams
            )} g

          </li>

        `)
        .join("")}

    </ul>


    <div class="modal-actions">

      <button
        type="button"
        class="secondary-button"
        id="closeRecipe"
      >
        Fermer
      </button>

      <button
        type="button"
        class="primary-button"
        id="addRecipe"
      >
        Ajouter au journal
      </button>

    </div>

  `);


  byId("closeRecipe")
    ?.addEventListener(
      "click",
      closeModal
    );


  byId("addRecipe")
    ?.addEventListener(
      "click",
      () => {

        (recipe.ingredients || [])
          .forEach(item => {

            addFood(
              item.foodId ||
              item.food,

              item.grams,

              "lunch"
            );

          });


        closeModal();

        toast(
          "Recette ajoutée au déjeuner.",
          "success"
        );

      }
    );

}


/* =========================================================
   CRÉATEUR DE RECETTE
========================================================= */

function openRecipeCreator() {

  const options =
    foods()
      .map(
        item => `

          <option value="${item.id}">

            ${escapeHtml(
              item.name
            )}

          </option>

        `
      )
      .join("");


  openModal(`

    <div class="modal-header">

      <h2>
        Créer une recette
      </h2>

      <p>
        Crée une recette personnalisée.
      </p>

    </div>


    <div class="form-group">

      <label for="recipeName">
        Nom
      </label>

      <input
        id="recipeName"
        type="text"
        placeholder="Ex. Bowl protéiné"
      >

    </div>


    <div class="form-group">

      <label for="recipeFood">
        Aliment
      </label>

      <select id="recipeFood">
        ${options}
      </select>

    </div>


    <div class="form-group">

      <label for="recipeGrams">
        Quantité
      </label>

      <input
        id="recipeGrams"
        type="number"
        min="1"
        value="100"
      >

    </div>


    <div class="modal-actions">

      <button
        type="button"
        class="secondary-button"
        id="cancelRecipe"
      >
        Annuler
      </button>

      <button
        type="button"
        class="primary-button"
        id="saveRecipe"
      >
        Enregistrer
      </button>

    </div>

  `);


  byId("cancelRecipe")
    ?.addEventListener(
      "click",
      closeModal
    );


  byId("saveRecipe")
    ?.addEventListener(
      "click",
      () => {

        const name =
          byId(
            "recipeName"
          )
            ?.value
            .trim();


        const foodId =
          byId(
            "recipeFood"
          )?.value;


        const grams =
          number(
            byId(
              "recipeGrams"
            )?.value
          );


        if (
          !name ||
          !foodId ||
          grams <= 0
        ) {

          toast(
            "Nom, aliment et quantité sont requis.",
            "error"
          );

          return;

        }


        state.recipes.push({

          id: id("recipe"),

          name,

          emoji:
            food(foodId)?.emoji ||
            "🍳",

          category:
            "Personnalisée",

          servings: 1,

          ingredients: [

            {

              foodId,

              grams:
                round(grams)

            }

          ]

        });


        saveState();

        render();

        closeModal();

        toast(
          "Recette enregistrée.",
          "success"
        );

      }
    );

}


/* =========================================================
   GÉNÉRATEUR DE JOURNÉE
========================================================= */

function getFoodPools() {

  const available =
    foods();


  const protein =
    available.filter(
      item =>
        number(item.protein) >= 15 &&
        number(item.kcal) > 0
    );


  const carb =
    available.filter(
      item =>
        number(item.carbs) >= 15 &&
        number(item.kcal) > 0
    );


  const vegetables =
    available.filter(
      item =>
        /légumes/i.test(
          item.category || ""
        ) &&
        number(item.kcal) > 0
    );


  const fruit =
    available.filter(
      item =>
        /fruits/i.test(
          item.category || ""
        ) &&
        number(item.kcal) > 0
    );


  const fat =
    available.filter(
      item =>
        number(item.fat) >= 8 &&
        number(item.kcal) > 0
    );


  return {

    available,

    protein,

    carb,

    vegetables,

    fruit,

    fat

  };

}


function addGeneratedFood(
  day,
  meal,
  item,
  grams
) {

  if (!item || grams <= 0) {

    return;

  }


  day[meal].push({

    id: id("generated"),

    foodId: item.id,

    grams:
      Math.max(
        1,
        round(grams)
      )

  });

}


/*
   Génération d'un repas :

   1. source protéinée
   2. source glucidique
   3. légumes/fruits
   4. ajustement calorique

   Le but est d'approcher l'objectif,
   plutôt que de simplement mettre des
   quantités fixes au hasard.
*/

function buildGeneratedMeal(
  meal,
  calorieTarget,
  proteinTarget,
  pools,
  variation = 0
) {

  const result = [];


  const proteinFood =
    randomItem(
      pools.protein
    );


  const carbFood =
    randomItem(
      pools.carb
    );


  const vegetableFood =
    randomItem(
      pools.vegetables
    );


  if (!proteinFood) {

    return result;

  }


  /*
     On vise environ 55 à 65 %
     des protéines du repas avec
     la source principale.
  */

  const proteinShare =
    meal === "snack"
      ? 0.65
      : 0.70;


  let proteinGrams =
    proteinTarget *
    proteinShare /
    Math.max(
      0.1,
      number(proteinFood.protein)
    ) *
    100;


  /*
     Petite variation pour éviter
     d'avoir exactement les mêmes repas.
  */

  proteinGrams *=
    0.90 +
    variation;


  proteinGrams =
    Math.max(
      80,
      Math.min(
        300,
        proteinGrams
      )
    );


  addGeneratedFood(
    {
      [meal]: result
    },
    meal,
    proteinFood,
    proteinGrams
  );


  /*
     Légumes :
     quantité raisonnable pour ne pas
     transformer automatiquement chaque
     repas en énorme assiette de légumes.
  */

  if (
    vegetableFood &&
    meal !== "snack"
  ) {

    addGeneratedFood(
      {
        [meal]: result
      },
      meal,
      vegetableFood,
      100 + Math.round(
        Math.random() * 50
      )
    );

  }


  /*
     Calories restantes après protéines
     et légumes.
  */

  let current =
    totals(result);


  if (carbFood) {

    const remaining =
      Math.max(
        0,
        calorieTarget -
        current.kcal
      );


    const carbGrams =
      Math.max(
        40,
        Math.min(
          450,
          remaining /
          Math.max(
            1,
            carbFood.kcal
          ) *
          100 *
          0.82
        )
      );


    addGeneratedFood(
      {
        [meal]: result
      },
      meal,
      carbFood,
      carbGrams
    );

  }


  /*
     Ajustement final avec une matière grasse
     si le repas est très en dessous de sa cible.
  */

  current =
    totals(result);


  if (
    current.kcal <
    calorieTarget * 0.78 &&
    pools.fat.length
  ) {

    const fatFood =
      randomItem(
        pools.fat
      );


    const remaining =
      calorieTarget -
      current.kcal;


    const grams =
      Math.min(
        20,
        Math.max(
          5,
          remaining /
          Math.max(
            1,
            fatFood.kcal
          ) *
          100 *
          0.60
        )
      );


    addGeneratedFood(
      {
        [meal]: result
      },
      meal,
      fatFood,
      grams
    );

  }


  return result;

}


function generateDay() {

  const pools =
    getFoodPools();


  if (!pools.available.length) {

    toast(
      "Base d'aliments indisponible.",
      "error"
    );

    return;

  }


  const goal =
    targets();


  const day =
    newDay();


  MEALS.forEach(
    meal => {

      const calorieTarget =
        goal.calories *
        MEAL_CALORIE_SPLIT[meal];


      const proteinTarget =
        goal.protein *
        MEAL_CALORIE_SPLIT[meal];


      const variation =
        (Math.random() * 0.16) -
        0.08;


      const generated =
        buildGeneratedMeal(

          meal,

          calorieTarget,

          proteinTarget,

          pools,

          variation

        );


      day[meal] =
        generated;

    }
  );


  state.journal[
    dateKey()
  ] = day;


  saveState();

  render();


  const total =
    dailyTotals(day);


  toast(

    `Journée générée : ${format(
      total.kcal
    )} kcal · ${format(
      total.protein
    )} g de protéines.`,

    "success"

  );

}


/* =========================================================
   GÉNÉRATEUR DE SEMAINE
========================================================= */

function generateWeekDay(
  dayIndex,
  pools,
  goal
) {

  const day =
    newDay();


  /*
     Variation de journée :
     on change légèrement la répartition
     et les aliments utilisés.
  */

  MEALS.forEach(
    meal => {

      const calorieTarget =
        goal.calories *
        MEAL_CALORIE_SPLIT[meal];


      const proteinTarget =
        goal.protein *
        MEAL_CALORIE_SPLIT[meal];


      const generated =
        buildGeneratedMeal(

          meal,

          calorieTarget,

          proteinTarget,

          pools,

          (dayIndex * 0.02) -
          0.05

        );


      day[meal] =
        generated;

    }
  );


  return day;

}


function generateWeek() {

  const pools =
    getFoodPools();


  if (!pools.available.length) {

    toast(
      "Base d'aliments indisponible.",
      "error"
    );

    return;

  }


  const goal =
    targets();


  for (
    let index = 0;
    index < 7;
    index++
  ) {

    state.planner[index].meals =
      generateWeekDay(
        index,
        pools,
        goal
      );

  }


  saveState();

  render();


  toast(
    "Les 7 journées ont été générées.",
    "success"
  );

}


/* =========================================================
   PROFIL
========================================================= */

function saveProfile() {

  const p =
    state.profile;


  const values = {

    name: "profileName",

    age: "profileAge",

    sex: "profileSex",

    height: "profileHeight",

    weight: "profileWeight",

    bodyFat: "profileBodyFat",

    chest: "profileChest",

    waist: "profileWaist",

    hips: "profileHips",

    arm: "profileArm",

    thigh: "profileThigh",

    neck: "profileNeck",

    trainingDays:
      "profileTraining",

    activity:
      "profileActivity",

    targetWeight:
      "profileTargetWeight",

    targetBodyFat:
      "profileTargetBodyFat",

    deficit:
      "profileDeficit",

    proteinPerKg:
      "proteinTarget",

    fatPerKg:
      "fatTarget",

    budget:
      "profileBudget",

    store:
      "profileStore"

  };


  Object.entries(values)
    .forEach(
      ([key, elementId]) => {

        const node =
          byId(elementId);

        if (!node) return;


        if (
          [
            "name",
            "sex",
            "store",
            "activity"
          ].includes(key)
        ) {

          p[key] =
            node.value;

        }

        else {

          const value =
            number(
              node.value,
              p[key]
            );


          p[key] =
            value;

        }

      }
    );


  p.goal =
    document.querySelector(
      'input[name="profileGoal"]:checked'
    )?.value ||
    p.goal;


  /*
     On s'assure que l'activité
     utilise une valeur reconnue.
  */

  const activityAliases = {

    lightly_active: "light",

    moderately_active: "moderate",

    very_active_old: "active"

  };


  if (
    activityAliases[p.activity]
  ) {

    p.activity =
      activityAliases[
        p.activity
      ];

  }


  p.preferences = {

    autoGenerate:
      Boolean(
        byId(
          "preferenceAutoGenerate"
        )?.checked
      ),

    budgetOptimization:
      Boolean(
        byId(
          "preferenceBudgetOptimization"
        )?.checked
      ),

    highProtein:
      Boolean(
        byId(
          "preferenceHighProtein"
        )?.checked
      )

  };


  saveState();

  render();


  toast(
    "Profil et objectifs enregistrés.",
    "success"
  );

}


/* =========================================================
   PWA
========================================================= */

function registerServiceWorker() {

  if (
    !("serviceWorker" in navigator)
  ) {

    return;

  }


  /*
     Le service worker ne fonctionne
     correctement qu'en HTTPS ou localhost.
     GitHub Pages est compatible.
  */

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js")
        .then(
          registration => {

            console.log(
              "BudgetCook PWA : service worker actif.",
              registration.scope
            );

          }
        )
        .catch(
          error => {

            console.warn(
              "BudgetCook PWA : service worker non enregistré.",
              error
            );

          }
        );

    }
  );

}


/* =========================================================
   ÉVÉNEMENTS
========================================================= */

function bindEvents() {


  /* Navigation */

  document
    .querySelectorAll("[data-page]")
    .forEach(node => {

      node.addEventListener(
        "click",
        event => {

          event.preventDefault();

          navigate(
            node.dataset.page
          );

        }
      );

    });


  /* Menu mobile */

  byId(
    "mobileMenuButton"
  )?.addEventListener(
    "click",
    () => {

      document
        .querySelector(
          ".sidebar"
        )
        ?.classList.toggle(
          "mobile-open"
        );

    }
  );


  /* Modal */

  byId(
    "modalCloseButton"
  )?.addEventListener(
    "click",
    closeModal
  );


  byId(
    "modalOverlay"
  )?.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        event.currentTarget
      ) {

        closeModal();

      }

    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeModal();

      }

    }
  );


  /* Ajouter aliment */

  [

    "quickAddButton",

    "addMealButton",

    "journalAddButton"

  ].forEach(key => {

    byId(key)?.addEventListener(
      "click",
      () =>
        openFoodPicker()
    );

  });


  /* Générer journée */

  [

    "generateDayButton",

    "emptyGenerateButton"

  ].forEach(key => {

    byId(key)?.addEventListener(
      "click",
      generateDay
    );

  });


  /* Recettes */

  byId(
    "createRecipeButton"
  )?.addEventListener(
    "click",
    openRecipeCreator
  );


  byId(
    "recipeSearch"
  )?.addEventListener(
    "input",
    renderRecipes
  );


  byId(
    "recipeGoalFilter"
  )?.addEventListener(
    "change",
    renderRecipes
  );


  /* Planning */

  byId(
    "generateWeekButton"
  )?.addEventListener(
    "click",
    generateWeek
  );


  byId(
    "clearPlannerButton"
  )?.addEventListener(
    "click",
    () => {

      if (
        window.confirm(
          "Réinitialiser le planning ?"
        )
      ) {

        state.planner =
          defaultPlanner();

        saveState();

        render();

        toast(
          "Planning réinitialisé.",
          "success"
        );

      }

    }
  );


  /* Profil */

  byId(
    "saveProfileButton"
  )?.addEventListener(
    "click",
    saveProfile
  );


  /*
     Actions dynamiques :
     modifier / supprimer / recettes /
     ajout au planning.
  */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "button"
        );


      if (!button) return;


      if (
        button.dataset.editItem
      ) {

        openEditPicker(

          button.dataset.meal,

          button.dataset.editItem

        );

      }


      if (
        button.dataset.removeItem
      ) {

        removeFood(

          button.dataset.meal,

          button.dataset.removeItem

        );


        toast(
          "Aliment supprimé.",
          "success"
        );

      }


      if (
        button.dataset.recipeDetail
      ) {

        openRecipeDetail(
          button.dataset.recipeDetail
        );

      }


      if (
        button.dataset.recipeAdd
      ) {

        openRecipeDetail(
          button.dataset.recipeAdd
        );

      }


      if (
        button.dataset.plannerAdd
      ) {

        openFoodPicker({

          meal:
            button.dataset.plannerAdd,

          plannerDay:
            number(
              button.dataset.plannerDay
            )

        });

      }

    }
  );

}


/* =========================================================
   INITIALISATION
========================================================= */

function init() {

  bindEvents();

  render();

  registerServiceWorker();


  /*
     Génération automatique uniquement
     si l'utilisateur l'a activée.
  */

  const today =
    dateKey();


  if (
    state.profile
      .preferences
      .autoGenerate &&
    !state.journal[today]
  ) {

    generateDay();

  }

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  init,
  {
    once: true
  }
);
