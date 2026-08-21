/* =========================================================
   BUDGETCOOK V4 — APP.JS
   Version corrigée — macros rigoureuses
========================================================= */

const STORAGE_KEY = "budgetcook_v4";


/* =========================================================
   ÉTAT
========================================================= */

const defaultState = {
  profile: {
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
  },

  journal: [],
  weights: [],
  pantry: [],
  shopping: {},

  streak: {
    count: 0,
    lastDate: null
  },

  planner: {},
  darkMode: false
};


let state = loadState();
let selectedDay = 0;


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  setupNavigation();
  setupProfile();
  setupFoodModal();
  setupShopping();
  setupWeightTracking();
  setupPantry();
  setupCoach();
  setupPlanner();
  setupRecipeButtons();
  setupDarkMode();

  updateEverything();
  updateStreakDisplay();

  registerServiceWorker();

});


/* =========================================================
   STORAGE
========================================================= */

function loadState() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultState),
      ...parsed,

      profile: {
        ...defaultState.profile,
        ...(parsed.profile || {})
      },

      streak: {
        ...defaultState.streak,
        ...(parsed.streak || {})
      },

      journal: Array.isArray(parsed.journal)
        ? parsed.journal
        : [],

      weights: Array.isArray(parsed.weights)
        ? parsed.weights
        : [],

      pantry: Array.isArray(parsed.pantry)
        ? parsed.pantry
        : [],

      shopping:
        parsed.shopping &&
        typeof parsed.shopping === "object"
          ? parsed.shopping
          : {},

      planner:
        parsed.planner &&
        typeof parsed.planner === "object"
          ? parsed.planner
          : {}

    };

  } catch (error) {

    console.error("Erreur chargement :", error);

    return structuredClone(defaultState);

  }

}


function saveState() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

  } catch (error) {

    console.error("Erreur sauvegarde :", error);

  }

}


/* =========================================================
   UTILITAIRES
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function round(number, decimals = 0) {

  const factor = Math.pow(10, decimals);

  return Math.round(
    (Number(number) || 0) * factor
  ) / factor;

}


function formatNumber(number) {

  return Math.round(Number(number) || 0)
    .toLocaleString("fr-FR");

}


function todayKey() {

  const date = new Date();

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;

}


function showToast(message) {

  const toast = $("toast");

  if (!toast) return;

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);

}


/* =========================================================
   NUTRITION
========================================================= */

function calculateFood(food, grams) {

  const ratio =
    Number(grams) / 100;

  return {

    kcal:
      Number(food.kcal || 0) * ratio,

    protein:
      Number(food.protein || 0) * ratio,

    carbs:
      Number(food.carbs || 0) * ratio,

    fat:
      Number(food.fat || 0) * ratio

  };

}


function calculateDailyTotals() {

  const totals = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };

  const today = todayKey();

  state.journal.forEach(item => {

    if (
      item.date &&
      item.date !== today
    ) {
      return;
    }

    totals.kcal +=
      Number(item.kcal) || 0;

    totals.protein +=
      Number(item.protein) || 0;

    totals.carbs +=
      Number(item.carbs) || 0;

    totals.fat +=
      Number(item.fat) || 0;

  });

  return {

    kcal: round(totals.kcal),

    protein:
      round(totals.protein, 1),

    carbs:
      round(totals.carbs, 1),

    fat:
      round(totals.fat, 1)

  };

}


/* =========================================================
   CALORIES
========================================================= */

function calculateBMR() {

  const p = state.profile;

  const weight =
    Number(p.weight) || 0;

  const height =
    Number(p.height) || 0;

  const age =
    Number(p.age) || 0;

  if (
    !weight ||
    !height ||
    !age
  ) {
    return 0;
  }

  if (p.sex === "female") {

    return round(
      10 * weight +
      6.25 * height -
      5 * age -
      161
    );

  }

  return round(
    10 * weight +
    6.25 * height -
    5 * age +
    5
  );

}


function calculateTDEE() {

  const bmr =
    calculateBMR();

  const activity =
    Number(state.profile.activity) || 1.2;

  return round(
    bmr * activity
  );

}


function calculateTargetCalories() {

  const tdee =
    calculateTDEE();

  const adjustment =
    Number(state.profile.adjustment) || 0;

  if (!tdee) return 0;

  if (
    state.profile.goal === "bulk"
  ) {

    return Math.round(
      tdee + adjustment
    );

  }

  if (
    state.profile.goal === "maintain"
  ) {

    return Math.round(tdee);

  }

  return Math.max(
    1200,
    Math.round(
      tdee - adjustment
    )
  );

}


/* =========================================================
   MACROS
   CALCULS RIGOUREUX
========================================================= */

function calculateMacroTargets() {

  const weight =
    Number(state.profile.weight) || 0;

  const calories =
    calculateTargetCalories();


  if (
    !weight ||
    !calories
  ) {

    return {
      protein: 0,
      carbs: 0,
      fat: 0
    };

  }


  /* -------------------------------------------------------
     PROTÉINES
     
     2 g / kg de poids corporel

     Exemple :
     88 kg × 2 = 176 g

     1 g protéines = 4 kcal
  ------------------------------------------------------- */

  const protein =
    weight * 2;

  const proteinCalories =
    protein * 4;


  /* -------------------------------------------------------
     LIPIDES

     0,8 g / kg de poids corporel

     Exemple :
     88 kg × 0,8 = 70,4 g

     1 g lipides = 9 kcal
  ------------------------------------------------------- */

  const fat =
    weight * 0.8;

  const fatCalories =
    fat * 9;


  /* -------------------------------------------------------
     GLUCIDES

     Les glucides utilisent UNIQUEMENT
     les calories restantes.

     1 g glucides = 4 kcal
  ------------------------------------------------------- */

  const remainingCalories =
    calories -
    proteinCalories -
    fatCalories;


  const carbs =
    remainingCalories > 0
      ? remainingCalories / 4
      : 0;


  return {

    protein:
      round(protein, 1),

    carbs:
      round(carbs, 1),

    fat:
      round(fat, 1)

  };

}


function calculateProteinTarget() {

  return calculateMacroTargets().protein;

}


function calculateCarbsTarget() {

  return calculateMacroTargets().carbs;

}


function calculateFatTarget() {

  return calculateMacroTargets().fat;

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  document
    .querySelectorAll("[data-page]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openPage(
            button.dataset.page
          );

        }
      );

    });


  $("profileButton")
    ?.addEventListener(
      "click",
      () => {

        openPage("profilePage");

      }
    );


  $("clearJournalButton")
    ?.addEventListener(
      "click",
      clearJournal
    );

}


function openPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove(
        "active"
      );

    });


  const target =
    $(pageId);

  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-button")
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
   PROFIL
========================================================= */

function setupProfile() {

  loadProfileInputs();

  $("saveProfileButton")
    ?.addEventListener(
      "click",
      saveProfile
    );

}


function loadProfileInputs() {

  const p =
    state.profile;

  if ($("profileName"))
    $("profileName").value =
      p.name || "";

  if ($("profileAge"))
    $("profileAge").value =
      p.age || "";

  if ($("profileSex"))
    $("profileSex").value =
      p.sex || "male";

  if ($("profileHeight"))
    $("profileHeight").value =
      p.height || "";

  if ($("profileWeight"))
    $("profileWeight").value =
      p.weight || "";

  if ($("profileActivity"))
    $("profileActivity").value =
      p.activity || 1.5;

  if ($("profileTraining"))
    $("profileTraining").value =
      p.training || 0;

  if ($("profileGoal"))
    $("profileGoal").value =
      p.goal || "cut";

  if ($("profileAdjustment"))
    $("profileAdjustment").value =
      p.adjustment || 300;

  if ($("profileBudget"))
    $("profileBudget").value =
      p.budget || 50;

}


function saveProfile() {

  state.profile.name =
    $("profileName")?.value.trim() || "";

  state.profile.age =
    Number(
      $("profileAge")?.value
    ) || 0;

  state.profile.sex =
    $("profileSex")?.value || "male";

  state.profile.height =
    Number(
      $("profileHeight")?.value
    ) || 0;

  state.profile.weight =
    Number(
      $("profileWeight")?.value
    ) || 0;

  state.profile.activity =
    Number(
      $("profileActivity")?.value
    ) || 1.2;

  state.profile.training =
    Number(
      $("profileTraining")?.value
    ) || 0;

  state.profile.goal =
    $("profileGoal")?.value || "cut";

  state.profile.adjustment =
    Number(
      $("profileAdjustment")?.value
    ) || 0;

  state.profile.budget =
    Number(
      $("profileBudget")?.value
    ) || 0;

  saveState();

  updateEverything();

  showToast(
    "Profil enregistré ✅"
  );

}


/* =========================================================
   ALIMENTS
========================================================= */

function setupFoodModal() {

  $("addFoodButton")
    ?.addEventListener(
      "click",
      openFoodModal
    );


  $("closeFoodModal")
    ?.addEventListener(
      "click",
      closeFoodModal
    );


  $("foodModal")
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


  $("foodSearch")
    ?.addEventListener(
      "input",
      event => {

        renderFoodResults(
          event.target.value
        );

      }
    );

}


function openFoodModal() {

  $("foodModal")
    ?.classList.add("open");

  if ($("foodSearch")) {

    $("foodSearch").value = "";

  }

  renderFoodResults("");

  setTimeout(() => {

    $("foodSearch")
      ?.focus();

  }, 100);

}


function closeFoodModal() {

  $("foodModal")
    ?.classList.remove("open");

}


function renderFoodResults(search = "") {

  const container =
    $("foodResults");

  if (!container) return;

  if (
    typeof FOODS === "undefined" ||
    !Array.isArray(FOODS)
  ) {

    container.innerHTML = `
      <div class="card">
        <span class="empty-text">
          Aucun aliment disponible.
        </span>
      </div>
    `;

    return;

  }


  const term =
    search.trim().toLowerCase();


  const results =
    FOODS.filter(food =>
      food.name
        .toLowerCase()
        .includes(term)
    );


  container.innerHTML = "";


  if (!results.length) {

    container.innerHTML = `
      <div class="card">
        <span class="empty-text">
          Aucun aliment trouvé.
        </span>
      </div>
    `;

    return;

  }


  results.forEach(food => {

    const row =
      document.createElement("div");

    row.className =
      "food-result";


    row.innerHTML = `

      <div>

        <div class="food-name">
          ${food.emoji} ${food.name}
        </div>

        <div class="food-info">
          ${food.kcal} kcal •
          ${food.protein} g protéines /
          100 g
        </div>

      </div>

      <button
        class="secondary-button"
        data-food-id="${food.id}"
      >
        Ajouter
      </button>

    `;


    row
      .querySelector("button")
      .addEventListener(
        "click",
        () => askFoodGrams(food)
      );


    container.appendChild(row);

  });

}


function askFoodGrams(food) {

  const grams =
    prompt(
      `Quelle quantité de ${food.name} ?\n\nEntre le grammage exact.`
    );

  if (grams === null) return;


  const numericGrams =
    Number(
      String(grams)
        .replace(",", ".")
        .replace(/[^\d.]/g, "")
    );


  if (
    !numericGrams ||
    numericGrams <= 0
  ) {

    showToast(
      "Grammage invalide ❌"
    );

    return;

  }


  addFoodToJournal(
    food,
    numericGrams
  );

}


function addFoodToJournal(
  food,
  grams
) {

  const nutrition =
    calculateFood(
      food,
      grams
    );


  state.journal.push({

    id:
      Date.now() +
      Math.random(),

    foodId:
      food.id,

    name:
      food.name,

    emoji:
      food.emoji,

    grams:
      Number(grams),

    kcal:
      nutrition.kcal,

    protein:
      nutrition.protein,

    carbs:
      nutrition.carbs,

    fat:
      nutrition.fat,

    date:
      todayKey()

  });


  updateStreak();

  saveState();

  closeFoodModal();

  updateEverything();

  showToast(
    `${food.name} — ${grams} g ajouté ✅`
  );

}


/* =========================================================
   JOURNAL
========================================================= */

function renderJournal() {

  const container =
    $("journalList");

  if (!container) return;

  container.innerHTML = "";

  const today =
    todayKey();


  const items =
    state.journal.filter(
      item =>
        !item.date ||
        item.date === today
    );


  if (!items.length) {

    container.innerHTML = `
      <div class="card">
        <span class="empty-text">
          Aucun aliment enregistré aujourd'hui.
        </span>
      </div>
    `;

    return;

  }


  items.forEach(item => {

    const row =
      document.createElement("div");

    row.className =
      "meal";


    row.innerHTML = `

      <div class="meal-icon">
        ${item.emoji || "🍽️"}
      </div>

      <div class="meal-content">

        <div class="meal-type">
          ${item.recipe || "ALIMENT"}
        </div>

        <div class="meal-name">
          ${item.name}
        </div>

        <div class="meal-meta">
          ${formatNumber(item.grams)} g •
          ${formatNumber(item.kcal)} kcal •
          ${round(item.protein, 1)} g protéines
        </div>

      </div>

      <button
        class="delete-button"
        data-id="${item.id}"
      >
        ✕
      </button>

    `;


    row
      .querySelector(".delete-button")
      .addEventListener(
        "click",
        () =>
          deleteJournalItem(item.id)
      );


    container.appendChild(row);

  });

}


function deleteJournalItem(id) {

  state.journal =
    state.journal.filter(
      item =>
        item.id != id
    );

  saveState();

  updateEverything();

  showToast(
    "Aliment supprimé"
  );

}


function clearJournal() {

  const today =
    todayKey();


  const hasItems =
    state.journal.some(
      item =>
        !item.date ||
        item.date === today
    );


  if (!hasItems) return;


  if (
    !confirm(
      "Supprimer tous les aliments du jour ?"
    )
  ) {
    return;
  }


  state.journal =
    state.journal.filter(
      item =>
        item.date &&
        item.date !== today
    );


  saveState();

  updateEverything();

  showToast(
    "Journal vidé"
  );

}


/* =========================================================
   ACCUEIL
========================================================= */

function renderHome() {

  const totals =
    calculateDailyTotals();

  const target =
    calculateTargetCalories();

  const macros =
    calculateMacroTargets();


  const remaining =
    Math.max(
      0,
      target - totals.kcal
    );


  if ($("dailyTarget"))
    $("dailyTarget").textContent =
      formatNumber(target);


  if ($("consumedCalories"))
    $("consumedCalories").textContent =
      formatNumber(totals.kcal);


  if ($("remainingCalories"))
    $("remainingCalories").textContent =
      formatNumber(remaining);


  const progress =
    target > 0
      ? Math.min(
          100,
          totals.kcal /
          target *
          100
        )
      : 0;


  if ($("calorieProgress"))
    $("calorieProgress").style.width =
      `${progress}%`;


  if ($("goalPill")) {

    $("goalPill").textContent =
      state.profile.goal === "cut"
        ? "Déficit"
        : state.profile.goal === "bulk"
        ? "Surplus"
        : "Maintien";

  }


  if ($("homeProtein"))
    $("homeProtein").textContent =
      `${totals.protein} / ${macros.protein} g`;


  if ($("homeCarbs"))
    $("homeCarbs").textContent =
      `${totals.carbs} / ${macros.carbs} g`;


  if ($("homeFat"))
    $("homeFat").textContent =
      `${totals.fat} / ${macros.fat} g`;


  renderHomeMeals();

  renderMacroDiagram();

}


/* =========================================================
   GRAPHIQUE MACROS
========================================================= */

function renderMacroDiagram() {

  const container =
    $("macroDiagram");

  if (!container) return;


  const totals =
    calculateDailyTotals();

  const targets =
    calculateMacroTargets();


  const proteinPercent =
    targets.protein > 0
      ? Math.min(
          100,
          totals.protein /
          targets.protein *
          100
        )
      : 0;


  const carbsPercent =
    targets.carbs > 0
      ? Math.min(
          100,
          totals.carbs /
          targets.carbs *
          100
        )
      : 0;


  const fatPercent =
    targets.fat > 0
      ? Math.min(
          100,
          totals.fat /
          targets.fat *
          100
        )
      : 0;


  container.innerHTML = `

    <div class="macro-diagram">

      <div class="macro-circle">

        <div class="macro-circle-inner">

          <strong>
            ${formatNumber(totals.kcal)}
          </strong>

          <small>
            kcal
          </small>

        </div>

      </div>

      <div class="macro-bars">

        <div class="macro-line">

          <div class="macro-line-top">
            <span>🥩 Protéines</span>

            <strong>
              ${round(totals.protein, 1)} /
              ${round(targets.protein, 1)} g
            </strong>
          </div>

          <div class="macro-track">

            <div
              class="macro-fill protein"
              style="width:${proteinPercent}%"
            ></div>

          </div>

        </div>


        <div class="macro-line">

          <div class="macro-line-top">
            <span>🍚 Glucides</span>

            <strong>
              ${round(totals.carbs, 1)} /
              ${round(targets.carbs, 1)} g
            </strong>
          </div>

          <div class="macro-track">

            <div
              class="macro-fill carbs"
              style="width:${carbsPercent}%"
            ></div>

          </div>

        </div>


        <div class="macro-line">

          <div class="macro-line-top">
            <span>🥑 Lipides</span>

            <strong>
              ${round(totals.fat, 1)} /
              ${round(targets.fat, 1)} g
            </strong>
          </div>

          <div class="macro-track">

            <div
              class="macro-fill fat"
              style="width:${fatPercent}%"
            ></div>

          </div>

        </div>

      </div>

    </div>

  `;

}


function renderHomeMeals() {

  const container =
    $("homeMeals");

  if (!container) return;

  container.innerHTML = "";


  const today =
    todayKey();


  const recent =
    state.journal
      .filter(
        item =>
          !item.date ||
          item.date === today
      )
      .slice(-4);


  if (!recent.length) {

    container.innerHTML = `
      <div class="card">
        <span class="empty-text">
          Ajoute ton premier aliment pour commencer.
        </span>
      </div>
    `;

    return;

  }


  recent.forEach(item => {

    const row =
      document.createElement("div");

    row.className =
      "meal";


    row.innerHTML = `

      <div class="meal-icon">
        ${item.emoji || "🍽️"}
      </div>

      <div class="meal-content">

        <div class="meal-name">
          ${item.name}
        </div>

        <div class="meal-meta">
          ${formatNumber(item.grams)} g •
          ${formatNumber(item.kcal)} kcal
        </div>

      </div>

    `;


    container.appendChild(row);

  });

}


/* =========================================================
   STATS JOURNAL
========================================================= */

function renderJournalStats() {

  const totals =
    calculateDailyTotals();


  if ($("journalCalories"))
    $("journalCalories").textContent =
      formatNumber(totals.kcal);


  if ($("journalProtein"))
    $("journalProtein").textContent =
      `${totals.protein} g`;


  if ($("journalCarbs"))
    $("journalCarbs").textContent =
      `${totals.carbs} g`;


  if ($("journalFat"))
    $("journalFat").textContent =
      `${totals.fat} g`;

}


/* =========================================================
   RECETTES
========================================================= */

function setupRecipeButtons() {

  $("smartMealButton")
    ?.addEventListener(
      "click",
      suggestSmartMeal
    );

}


function renderRecipes() {

  const container =
    $("recipeList");

  if (!container) return;


  container.innerHTML = "";


  if (
    typeof RECIPES === "undefined" ||
    !Array.isArray(RECIPES)
  ) {

    container.innerHTML = `
      <div class="card">
        <span class="empty-text">
          Impossible de charger les recettes.
        </span>
      </div>
    `;

    return;

  }


  RECIPES.forEach(recipe => {

    const row =
      document.createElement("div");

    row.className =
      "meal";


    row.innerHTML = `

      <div class="meal-icon">
        ${recipe.emoji}
      </div>

      <div class="meal-content">

        <div class="meal-name">
          ${recipe.name}
        </div>

        <div class="meal-meta">
          ${recipe.kcal} kcal •
          ${recipe.protein} g protéines •
          ${recipe.carbs} g glucides •
          ${recipe.fat} g lipides
        </div>

      </div>

      <button
        class="add-meal-button"
        data-recipe="${recipe.id}"
      >
        +
      </button>

    `;


    row
      .querySelector("button")
      .addEventListener(
        "click",
        () =>
          addRecipeToJournal(recipe)
      );


    container.appendChild(row);

  });

}


function addRecipeToJournal(recipe) {

  if (
    !recipe ||
    !Array.isArray(recipe.ingredients)
  ) {

    showToast(
      "Recette invalide ❌"
    );

    return;

  }


  const multiplier =
    prompt(
      `Portion de "${recipe.name}" ?\n\n` +
      `1 = portion normale\n` +
      `0,5 = demi-portion\n` +
      `1,5 = une portion et demie`
    );


  if (multiplier === null) return;


  const factor =
    Number(
      String(multiplier)
        .replace(",", ".")
    );


  if (
    !Number.isFinite(factor) ||
    factor <= 0
  ) {

    showToast(
      "Portion invalide ❌"
    );

    return;

  }


  let added = false;


  recipe.ingredients.forEach(
    ingredient => {

      const food =
        FOODS.find(
          f =>
            f.id === ingredient.food
        );


      if (!food) return;


      const grams =
        Number(
          ingredient.grams
        ) * factor;


      const nutrition =
        calculateFood(
          food,
          grams
        );


      state.journal.push({

        id:
          Date.now() +
          Math.random(),

        foodId:
          food.id,

        name:
          food.name,

        emoji:
          food.emoji,

        grams,

        kcal:
          nutrition.kcal,

        protein:
          nutrition.protein,

        carbs:
          nutrition.carbs,

        fat:
          nutrition.fat,

        date:
          todayKey(),

        recipe:
          recipe.name

      });


      added = true;

    }
  );


  if (!added) {

    showToast(
      "Impossible d'ajouter la recette ❌"
    );

    return;

  }


  updateStreak();

  saveState();

  updateEverything();


  showToast(
    `${recipe.name} ajouté 🍽️`
  );

}


/* =========================================================
   GÉNÉRATEUR INTELLIGENT
========================================================= */

function suggestSmartMeal() {

  if (
    typeof RECIPES === "undefined" ||
    !RECIPES.length
  ) {

    showToast(
      "Aucune recette disponible ❌"
    );

    return;

  }


  const target =
    calculateTargetCalories();

  const totals =
    calculateDailyTotals();


  const remaining =
    Math.max(
      0,
      target - totals.kcal
    );


  const proteinTarget =
    calculateProteinTarget();


  const proteinRemaining =
    Math.max(
      0,
      proteinTarget -
      totals.protein
    );


  let best =
    RECIPES[0];

  let bestScore =
    Infinity;


  RECIPES.forEach(recipe => {

    const calorieDifference =
      Math.abs(
        remaining -
        Number(recipe.kcal || 0)
      );


    const proteinDifference =
      Math.abs(
        proteinRemaining -
        Number(recipe.protein || 0)
      );


    const score =
      calorieDifference +
      proteinDifference * 8;


    if (
      score < bestScore
    ) {

      bestScore =
        score;

      best =
        recipe;

    }

  });


  const message =
    `✨ Je te propose : ${best.name}\n\n` +
    `${best.kcal} kcal\n` +
    `${best.protein} g protéines\n` +
    `${best.carbs} g glucides\n` +
    `${best.fat} g lipides\n\n` +
    `Il te reste environ ${formatNumber(remaining)} kcal aujourd'hui.\n\n` +
    `Ajouter cette recette ?`;


  if (confirm(message)) {

    addRecipeToJournal(best);

  }

}


/* =========================================================
   PLANNING
========================================================= */

function setupPlanner() {

  renderDays();

  generatePlannerIfNeeded();

  saveState();

  renderSelectedDay();


  $("regenerateWeekButton")
    ?.addEventListener(
      "click",
      () => {

        state.planner = {};

        generatePlannerIfNeeded();

        saveState();

        renderSelectedDay();

        showToast(
          "Planning régénéré 📅"
        );

      }
    );

}


function generatePlannerIfNeeded() {

  if (
    typeof DAYS === "undefined" ||
    !Array.isArray(DAYS) ||
    typeof RECIPES === "undefined" ||
    !Array.isArray(RECIPES) ||
    !RECIPES.length
  ) {
    return;
  }


  DAYS.forEach(
    (day, index) => {

      if (
        !state.planner[index]
      ) {

        const first =
          RECIPES[
            index %
            RECIPES.length
          ];


        const second =
          RECIPES[
            (index + 2) %
            RECIPES.length
          ];


        state.planner[index] = [

          {
            meal: "Déjeuner",
            recipe: first.name,
            kcal: first.kcal
          },

          {
            meal: "Dîner",
            recipe: second.name,
            kcal: second.kcal
          }

        ];

      }

    }
  );

}


function renderDays() {

  const container =
    $("daysContainer");

  if (!container) return;


  if (
    typeof DAYS === "undefined" ||
    !Array.isArray(DAYS)
  ) {
    return;
  }


  container.innerHTML = "";


  DAYS.forEach(
    (day, index) => {

      const button =
        document.createElement("button");

      button.className =
        "day-button";


      if (
        index === selectedDay
      ) {

        button.classList.add(
          "active"
        );

      }


      button.textContent =
        day;


      button.addEventListener(
        "click",
        () => {

          selectedDay =
            index;

          renderDays();

          renderSelectedDay();

        }
      );


      container.appendChild(
        button
      );

    }
  );

}


function renderSelectedDay() {

  const title =
    $("selectedDayTitle");

  const container =
    $("dayMeals");

  if (
    !title ||
    !container
  ) {
    return;
  }


  if (
    typeof DAYS === "undefined" ||
    !DAYS.length
  ) {
    return;
  }


  title.textContent =
    DAYS[selectedDay];


  container.innerHTML = "";


  const meals =
    state.planner[selectedDay] ||
    [];


  if (!meals.length) {

    container.innerHTML = `
      <span class="empty-text">
        Aucun repas planifié.
      </span>
    `;

    return;

  }


  meals.forEach(item => {

    const row =
      document.createElement("div");

    row.className =
      "planner-meal";


    row.innerHTML = `

      <div>

        <strong>
          ${item.meal}
        </strong>

        <small>
          ${item.recipe}
        </small>

      </div>

      <strong>
        ${item.kcal} kcal
      </strong>

    `;


    container.appendChild(row);

  });

}


/* =========================================================
   COURSES
========================================================= */

function setupShopping() {

  $("checkAllButton")
    ?.addEventListener(
      "click",
      checkAllShopping
    );


  renderShopping();

}


function renderShopping() {

  const container =
    $("shoppingList");

  if (!container) return;


  if (
    typeof SHOPPING_ITEMS === "undefined" ||
    !Array.isArray(SHOPPING_ITEMS)
  ) {
    return;
  }


  container.innerHTML = "";


  let total = 0;


  SHOPPING_ITEMS.forEach(item => {

    total +=
      Number(item.price) || 0;


    const checked =
      Boolean(
        state.shopping[item.id]
      );


    const row =
      document.createElement("div");

    row.className =
      "shopping-row";


    row.innerHTML = `

      <div class="shopping-left">

        <button
          class="check-button ${
            checked
              ? "checked"
              : ""
          }"
          data-id="${item.id}"
        >
          ${checked ? "✓" : ""}
        </button>

        <span>

          ${item.name}

          <small>
            (${item.quantity})
          </small>

        </span>

      </div>

      <strong>
        ${Number(item.price).toFixed(2)} €
      </strong>

    `;


    row
      .querySelector("button")
      .addEventListener(
        "click",
        () => {

          state.shopping[item.id] =
            !state.shopping[item.id];

          saveState();

          renderShopping();

        }
      );


    container.appendChild(row);

  });


  if ($("weeklyBudget"))
    $("weeklyBudget").textContent =
      Number(
        state.profile.budget
      ).toFixed(0);


  if ($("estimatedBasket"))
    $("estimatedBasket").textContent =
      total.toFixed(2);

}


function checkAllShopping() {

  if (
    typeof SHOPPING_ITEMS === "undefined"
  ) {
    return;
  }


  const allChecked =
    SHOPPING_ITEMS.every(
      item =>
        Boolean(
          state.shopping[item.id]
        )
    );


  SHOPPING_ITEMS.forEach(
    item => {

      state.shopping[item.id] =
        !allChecked;

    }
  );


  saveState();

  renderShopping();

}


/* =========================================================
   POIDS
========================================================= */

function setupWeightTracking() {

  $("addWeightButton")
    ?.addEventListener(
      "click",
      addWeight
    );


  renderWeightChart();

}


function addWeight() {

  const input =
    $("newWeight");

  if (!input) return;


  const weight =
    Number(
      String(input.value)
        .replace(",", ".")
    );


  if (
    !weight ||
    weight < 30 ||
    weight > 300
  ) {

    showToast(
      "Poids invalide ❌"
    );

    return;

  }


  state.weights.push({

    date:
      todayKey(),

    weight

  });


  state.profile.weight =
    weight;


  input.value = "";


  saveState();

  loadProfileInputs();

  updateEverything();


  showToast(
    `${weight} kg enregistré ⚖️`
  );

}


function renderWeightChart() {

  const container =
    $("weightChart");

  if (!container) return;


  container.innerHTML = "";


  if (!state.weights.length) {

    container.innerHTML = `
      <span class="empty-text">
        Ajoute ton premier poids.
      </span>
    `;

    return;

  }


  const recent =
    state.weights.slice(-10);


  const values =
    recent.map(
      item =>
        Number(item.weight)
    );


  const min =
    Math.min(...values);

  const max =
    Math.max(...values);


  recent.forEach(item => {

    const bar =
      document.createElement("div");

    bar.className =
      "weight-bar";


    let height = 25;


    if (
      max !== min
    ) {

      height =
        25 +
        (
          (
            Number(item.weight) -
            min
          ) /
          (
            max -
            min
          )
        ) * 65;

    }


    bar.style.height =
      `${height}%`;


    bar.innerHTML = `
      <span>
        ${item.weight}
      </span>
    `;


    container.appendChild(
      bar
    );

  });

}


/* =========================================================
   GARDE-MANGER
========================================================= */

function setupPantry() {

  $("addPantryButton")
    ?.addEventListener(
      "click",
      addPantryItem
    );


  $("pantryInput")
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


  renderPantry();

}


function addPantryItem() {

  const input =
    $("pantryInput");

  if (!input) return;


  const value =
    input.value.trim();


  if (!value) return;


  state.pantry.push({

    id:
      Date.now() +
      Math.random(),

    name:
      value

  });


  input.value = "";


  saveState();

  renderPantry();


  showToast(
    `${value} ajouté 🥫`
  );

}


function renderPantry() {

  const container =
    $("pantryList");

  if (!container) return;


  container.innerHTML = "";


  if (!state.pantry.length) {

    container.innerHTML = `
      <span class="empty-text">
        Ton garde-manger est vide.
      </span>
    `;

    return;

  }


  state.pantry.forEach(item => {

    const row =
      document.createElement("div");

    row.className =
      "shopping-row";


    row.innerHTML = `

      <div class="shopping-left">

        <span>
          🥫 ${item.name}
        </span>

      </div>

      <button
        class="delete-button"
        data-id="${item.id}"
      >
        ✕
      </button>

    `;


    row
      .querySelector("button")
      .addEventListener(
        "click",
        () => {

          state.pantry =
            state.pantry.filter(
              pantryItem =>
                pantryItem.id != item.id
            );


          saveState();

          renderPantry();

        }
      );


    container.appendChild(row);

  });

}


/* =========================================================
   COACH
========================================================= */

function setupCoach() {

  $("sendCoachButton")
    ?.addEventListener(
      "click",
      sendCoachMessage
    );


  $("coachInput")
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
    .querySelectorAll(".quick-button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          if ($("coachInput")) {

            $("coachInput").value =
              button.textContent.trim();

            sendCoachMessage();

          }

        }
      );

    });

}


function sendCoachMessage() {

  const input =
    $("coachInput");

  if (!input) return;


  const message =
    input.value.trim();


  if (!message) return;


  addCoachMessage(
    message,
    true
  );


  input.value = "";


  setTimeout(() => {

    addCoachMessage(
      generateCoachResponse(
        message
      ),
      false
    );

  }, 350);

}


function addCoachMessage(
  message,
  user
) {

  const container =
    $("coachMessages");

  if (!container) return;


  const div =
    document.createElement("div");


  div.className =
    `coach-message ${
      user ? "user" : ""
    }`;


  div.textContent =
    message;


  container.appendChild(
    div
  );


  container.scrollTop =
    container.scrollHeight;

}


function generateCoachResponse(message) {

  const lower =
    message.toLowerCase();


  const totals =
    calculateDailyTotals();

  const target =
    calculateTargetCalories();

  const macros =
    calculateMacroTargets();


  const remaining =
    Math.max(
      0,
      target -
      totals.kcal
    );


  const proteinRemaining =
    Math.max(
      0,
      macros.protein -
      totals.protein
    );


  const carbsRemaining =
    Math.max(
      0,
      macros.carbs -
      totals.carbs
    );


  const fatRemaining =
    Math.max(
      0,
      macros.fat -
      totals.fat
    );


  if (
    lower.includes("protéine") ||
    lower.includes("protein")
  ) {

    return (
      `Il te reste environ ` +
      `${round(
        proteinRemaining,
        1
      )} g de protéines aujourd'hui. 💪`
    );

  }


  if (
    lower.includes("glucide") ||
    lower.includes("carb")
  ) {

    return (
      `Il te reste environ ` +
      `${round(
        carbsRemaining,
        1
      )} g de glucides aujourd'hui. 🍚`
    );

  }


  if (
    lower.includes("lipide") ||
    lower.includes("gras")
  ) {

    return (
      `Il te reste environ ` +
      `${round(
        fatRemaining,
        1
      )} g de lipides aujourd'hui. 🥑`
    );

  }


  if (
    lower.includes("calorie") ||
    lower.includes("kcal")
  ) {

    return (
      `Il te reste environ ` +
      `${formatNumber(
        remaining
      )} kcal sur ton objectif de ` +
      `${formatNumber(
        target
      )} kcal. 🔥`
    );

  }


  if (
    lower.includes("soir") ||
    lower.includes("manger")
  ) {

    if (
      typeof RECIPES === "undefined" ||
      !RECIPES.length
    ) {

      return (
        "Je n'ai pas encore de recettes disponibles."
      );

    }


    const recipe =
      RECIPES
        .slice()
        .sort(
          (a, b) =>
            Math.abs(
              remaining -
              a.kcal
            ) -
            Math.abs(
              remaining -
              b.kcal
            )
        )[0];


    return (
      `Je partirais sur ${recipe.name} : ` +
      `${recipe.kcal} kcal, ` +
      `${recipe.protein} g de protéines ` +
      `et ${recipe.carbs} g de glucides. 🍽️`
    );

  }


  if (
    lower.includes("économ") ||
    lower.includes("budget")
  ) {

    return (
      "Pour réduire le budget : base tes repas " +
      "sur riz, pâtes, œufs, thon, poulet, " +
      "légumineuses et légumes surgelés. 🛒"
    );

  }


  return (
    `Aujourd'hui : ` +
    `${formatNumber(totals.kcal)} kcal, ` +
    `${totals.protein} g protéines, ` +
    `${totals.carbs} g glucides et ` +
    `${totals.fat} g lipides.\n\n` +
    `Objectif : ` +
    `${formatNumber(target)} kcal. 💪`
  );

}


/* =========================================================
   SÉRIE
========================================================= */

function updateStreak() {

  const today =
    todayKey();


  if (
    state.streak.lastDate ===
    today
  ) {

    updateStreakDisplay();

    return;

  }


  if (
    !state.streak.lastDate
  ) {

    state.streak.count = 1;

  } else {

    const previous =
      new Date(
        state.streak.lastDate +
        "T00:00:00"
      );


    const current =
      new Date(
        today +
        "T00:00:00"
      );


    const difference =
      Math.round(
        (
          current -
          previous
        ) /
        (
          1000 *
          60 *
          60 *
          24
        )
      );


    if (
      difference === 1
    ) {

      state.streak.count += 1;

    } else if (
      difference > 1
    ) {

      state.streak.count = 1;

    }

  }


  state.streak.lastDate =
    today;


  saveState();

  updateStreakDisplay();

}


function updateStreakDisplay() {

  if ($("streakNumber")) {

    $("streakNumber").textContent =
      state.streak.count || 0;

  }

}


/* =========================================================
   DARK MODE
========================================================= */

function setupDarkMode() {

  applyDarkMode();


  $("darkModeButton")
    ?.addEventListener(
      "click",
      () => {

        state.darkMode =
          !state.darkMode;

        saveState();

        applyDarkMode();

      }
    );

}


function applyDarkMode() {

  document.body.classList.toggle(
    "dark",
    Boolean(
      state.darkMode
    )
  );

}


/* =========================================================
   MISE À JOUR GLOBALE
========================================================= */

function updateEverything() {

  const bmr =
    calculateBMR();

  const tdee =
    calculateTDEE();

  const target =
    calculateTargetCalories();

  const macros =
    calculateMacroTargets();


  if ($("currentWeight"))
    $("currentWeight").textContent =
      state.profile.weight || 0;


  if ($("maintenanceCalories"))
    $("maintenanceCalories").textContent =
      formatNumber(tdee);


  if ($("progressCalories"))
    $("progressCalories").textContent =
      formatNumber(target);


  if ($("progressProtein"))
    $("progressProtein").textContent =
      `${macros.protein} g`;


  if ($("profileBmr"))
    $("profileBmr").textContent =
      formatNumber(bmr);


  if ($("profileTdee"))
    $("profileTdee").textContent =
      formatNumber(tdee);


  if ($("profileTarget"))
    $("profileTarget").textContent =
      formatNumber(target);


  renderHome();

  renderJournalStats();

  renderJournal();

  renderRecipes();

  renderShopping();

  renderWeightChart();

  renderPantry();

  renderDays();

  renderSelectedDay();

  updateStreakDisplay();

}


/* =========================================================
   SERVICE WORKER
========================================================= */

function registerServiceWorker() {

  if (
    "serviceWorker" in navigator
  ) {

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register("sw.js")
          .catch(error => {

            console.log(
              "Service Worker non disponible :",
              error
            );

          });

      }
    );

  }

}
