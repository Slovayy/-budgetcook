/* =========================================================
   BUDGETCOOK V4 — APP.JS
========================================================= */

const STORAGE_KEY = "budgetcook_v4";


/* =========================================================
   ÉTAT DE L'APPLICATION
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
      }

    };

  } catch (error) {

    console.error("Erreur chargement :", error);

    return structuredClone(defaultState);

  }

}


function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}


/* =========================================================
   UTILITAIRES
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function round(number, decimals = 0) {

  const factor = Math.pow(10, decimals);

  return Math.round(number * factor) / factor;

}


function formatNumber(number) {

  return Math.round(number).toLocaleString("fr-FR");

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
   CALCULS NUTRITIONNELS
========================================================= */

function calculateFood(food, grams) {

  const ratio = Number(grams) / 100;

  return {

    kcal: food.kcal * ratio,

    protein: food.protein * ratio,

    carbs: food.carbs * ratio,

    fat: food.fat * ratio

  };

}


function calculateDailyTotals() {

  const totals = {

    kcal: 0,

    protein: 0,

    carbs: 0,

    fat: 0

  };


  state.journal.forEach(item => {

    totals.kcal += Number(item.kcal) || 0;

    totals.protein += Number(item.protein) || 0;

    totals.carbs += Number(item.carbs) || 0;

    totals.fat += Number(item.fat) || 0;

  });


  return {

    kcal: round(totals.kcal),

    protein: round(totals.protein, 1),

    carbs: round(totals.carbs, 1),

    fat: round(totals.fat, 1)

  };

}


/* =========================================================
   CALORIES OBJECTIF
========================================================= */

function calculateBMR() {

  const p = state.profile;

  const weight = Number(p.weight) || 0;

  const height = Number(p.height) || 0;

  const age = Number(p.age) || 0;


  if (!weight || !height || !age) {

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

  const bmr = calculateBMR();

  const activity = Number(state.profile.activity) || 1.2;

  return round(bmr * activity);

}


function calculateTargetCalories() {

  const tdee = calculateTDEE();

  const adjustment =
    Number(state.profile.adjustment) || 0;


  if (state.profile.goal === "bulk") {

    return Math.round(tdee + adjustment);

  }


  if (state.profile.goal === "maintain") {

    return Math.round(tdee);

  }


  return Math.max(
    1200,
    Math.round(tdee - adjustment)
  );

}


function calculateProteinTarget() {

  const weight =
    Number(state.profile.weight) || 0;


  if (!weight) return 0;


  if (state.profile.goal === "bulk") {

    return round(weight * 2, 1);

  }


  return round(weight * 1.8, 1);

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

  document
    .querySelectorAll("[data-page]")
    .forEach(button => {

      button.addEventListener("click", () => {

        const pageId =
          button.dataset.page;

        openPage(pageId);

      });

    });


  $("profileButton")
    ?.addEventListener("click", () => {

      openPage("profilePage");

    });

}


function openPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });


  const target = $(pageId);

  if (target) {

    target.classList.add("active");

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
    ?.addEventListener("click", saveProfile);

}


function loadProfileInputs() {

  const p = state.profile;


  if ($("profileName"))
    $("profileName").value = p.name || "";


  if ($("profileAge"))
    $("profileAge").value = p.age || "";


  if ($("profileSex"))
    $("profileSex").value = p.sex || "male";


  if ($("profileHeight"))
    $("profileHeight").value = p.height || "";


  if ($("profileWeight"))
    $("profileWeight").value = p.weight || "";


  if ($("profileActivity"))
    $("profileActivity").value = p.activity || 1.5;


  if ($("profileTraining"))
    $("profileTraining").value = p.training || 0;


  if ($("profileGoal"))
    $("profileGoal").value = p.goal || "cut";


  if ($("profileAdjustment"))
    $("profileAdjustment").value =
      p.adjustment || 300;


  if ($("profileBudget"))
    $("profileBudget").value =
      p.budget || 50;

}


function saveProfile() {

  state.profile.name =
    $("profileName").value.trim();


  state.profile.age =
    Number($("profileAge").value) || 0;


  state.profile.sex =
    $("profileSex").value;


  state.profile.height =
    Number($("profileHeight").value) || 0;


  state.profile.weight =
    Number($("profileWeight").value) || 0;


  state.profile.activity =
    Number($("profileActivity").value) || 1.2;


  state.profile.training =
    Number($("profileTraining").value) || 0;


  state.profile.goal =
    $("profileGoal").value;


  state.profile.adjustment =
    Number($("profileAdjustment").value) || 0;


  state.profile.budget =
    Number($("profileBudget").value) || 0;


  saveState();

  updateEverything();

  showToast("Profil enregistré ✅");

}


/* =========================================================
   JOURNAL / ALIMENTS
========================================================= */

function setupFoodModal() {

  $("addFoodButton")
    ?.addEventListener("click", openFoodModal);


  $("closeFoodModal")
    ?.addEventListener("click", closeFoodModal);


  $("foodModal")
    ?.addEventListener("click", event => {

      if (event.target.id === "foodModal") {

        closeFoodModal();

      }

    });


  $("foodSearch")
    ?.addEventListener("input", event => {

      renderFoodResults(event.target.value);

    });

}


function openFoodModal() {

  $("foodModal").classList.add("open");

  $("foodSearch").value = "";

  renderFoodResults("");

  setTimeout(() => {

    $("foodSearch").focus();

  }, 100);

}


function closeFoodModal() {

  $("foodModal").classList.remove("open");

}


function renderFoodResults(search = "") {

  const container = $("foodResults");

  if (!container) return;


  const term =
    search.trim().toLowerCase();


  const results = FOODS.filter(food => {

    return food.name
      .toLowerCase()
      .includes(term);

  });


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

    row.className = "food-result";


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
      .addEventListener("click", () => {

        askFoodGrams(food);

      });


    container.appendChild(row);

  });

}


function askFoodGrams(food) {

  const grams = prompt(
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

    showToast("Grammage invalide ❌");

    return;

  }


  addFoodToJournal(
    food,
    numericGrams
  );

}


function addFoodToJournal(food, grams) {

  const nutrition =
    calculateFood(food, grams);


  state.journal.push({

    id:
      Date.now() +
      Math.random(),

    foodId: food.id,

    name: food.name,

    emoji: food.emoji,

    grams,

    kcal: nutrition.kcal,

    protein: nutrition.protein,

    carbs: nutrition.carbs,

    fat: nutrition.fat,

    date: todayKey()

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
   AFFICHAGE JOURNAL
========================================================= */

function renderJournal() {

  const container = $("journalList");

  if (!container) return;


  container.innerHTML = "";


  if (!state.journal.length) {

    container.innerHTML = `

      <div class="card">

        <span class="empty-text">
          Aucun aliment enregistré aujourd'hui.
        </span>

      </div>

    `;

    return;

  }


  state.journal.forEach(item => {

    const row =
      document.createElement("div");

    row.className = "meal";


    row.innerHTML = `

      <div class="meal-icon">
        ${item.emoji}
      </div>

      <div class="meal-content">

        <div class="meal-type">
          ALIMENT
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
      .addEventListener("click", () => {

        deleteJournalItem(item.id);

      });


    container.appendChild(row);

  });

}


function deleteJournalItem(id) {

  state.journal =
    state.journal.filter(
      item => item.id != id
    );


  saveState();

  updateEverything();

  showToast("Aliment supprimé");

}


function clearJournal() {

  if (!state.journal.length) return;


  const confirmed =
    confirm(
      "Supprimer tous les aliments du jour ?"
    );


  if (!confirmed) return;


  state.journal = [];

  saveState();

  updateEverything();

  showToast("Journal vidé");

}


/* =========================================================
   ACCUEIL
========================================================= */

function renderHome() {

  const totals =
    calculateDailyTotals();


  const target =
    calculateTargetCalories();


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
          (totals.kcal / target) * 100
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
      `${totals.protein} g`;


  if ($("homeCarbs"))
    $("homeCarbs").textContent =
      `${totals.carbs} g`;


  if ($("homeFat"))
    $("homeFat").textContent =
      `${totals.fat} g`;


  if ($("streakNumber"))
    $("streakNumber").textContent =
      state.streak.count;


  renderHomeMeals();

}


function renderHomeMeals() {

  const container = $("homeMeals");

  if (!container) return;


  container.innerHTML = "";


  const recent =
    state.journal.slice(-4);


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

    row.className = "meal";


    row.innerHTML = `

      <div class="meal-icon">
        ${item.emoji}
      </div>

      <div class="meal-content">

        <div class="meal-name">
          ${item.name}
        </div>

        <div class="meal-meta">
          ${item.grams} g •
          ${formatNumber(item.kcal)} kcal
        </div>

      </div>

    `;


    container.appendChild(row);

  });

}


/* =========================================================
   JOURNAL STATS
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

  const container = $("recipeList");

  if (!container) return;


  container.innerHTML = "";


  RECIPES.forEach(recipe => {

    const row =
      document.createElement("div");

    row.className = "meal";


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
          ${recipe.protein} g protéines
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
      .addEventListener("click", () => {

        addRecipeToJournal(recipe);

      });


    container.appendChild(row);

  });

}


function addRecipeToJournal(recipe) {

  const multiplier =
    prompt(
      `Portion de "${recipe.name}" ?\n\n1 = portion normale\n0.5 = demi-portion\n1.5 = une portion et demie`
    );


  if (multiplier === null) return;


  const factor =
    Number(
      String(multiplier)
        .replace(",", ".")
    );


  if (!factor || factor <= 0) {

    showToast("Portion invalide ❌");

    return;

  }


  recipe.ingredients.forEach(ingredient => {

    const food =
      FOODS.find(
        f => f.id === ingredient.food
      );


    if (!food) return;


    const grams =
      ingredient.grams * factor;


    const nutrition =
      calculateFood(food, grams);


    state.journal.push({

      id:
        Date.now() +
        Math.random(),

      foodId: food.id,

      name: food.name,

      emoji: food.emoji,

      grams,

      kcal: nutrition.kcal,

      protein: nutrition.protein,

      carbs: nutrition.carbs,

      fat: nutrition.fat,

      date: todayKey(),

      recipe: recipe.name

    });

  });


  updateStreak();

  saveState();

  updateEverything();

  showToast(
    `${recipe.name} ajouté 🍽️`
  );

}


function suggestSmartMeal() {

  const target =
    calculateTargetCalories();


  const totals =
    calculateDailyTotals();


  const remaining =
    target - totals.kcal;


  let best = RECIPES[0];

  let bestDifference =
    Infinity;


  RECIPES.forEach(recipe => {

    const difference =
      Math.abs(
        remaining - recipe.kcal
      );


    if (
      difference < bestDifference
    ) {

      best = recipe;

      bestDifference = difference;

    }

  });


  const yes =
    confirm(
      `Je te propose : ${best.name}\n\n` +
      `${best.kcal} kcal • ` +
      `${best.protein} g protéines\n\n` +
      `Ajouter cette recette ?`
    );


  if (yes) {

    addRecipeToJournal(best);

  }

}


/* =========================================================
   PLANNING 7 JOURS
========================================================= */

function setupPlanner() {

  renderDays();

  generatePlannerIfNeeded();

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

  DAYS.forEach((day, index) => {

    if (
      !state.planner[index]
    ) {

      const first =
        RECIPES[
          index % RECIPES.length
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

  });

}


function renderDays() {

  const container =
    $("daysContainer");

  if (!container) return;


  container.innerHTML = "";


  DAYS.forEach((day, index) => {

    const button =
      document.createElement("button");

    button.className =
      "day-button";


    if (index === selectedDay) {

      button.classList.add("active");

    }


    button.textContent = day;


    button.addEventListener(
      "click",
      () => {

        selectedDay = index;

        renderDays();

        renderSelectedDay();

      }
    );


    container.appendChild(button);

  });

}


function renderSelectedDay() {

  const title =
    $("selectedDayTitle");

  const container =
    $("dayMeals");


  if (!title || !container) return;


  title.textContent =
    DAYS[selectedDay];


  container.innerHTML = "";


  const meals =
    state.planner[selectedDay] || [];


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
   LISTE DE COURSES
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


  container.innerHTML = "";


  let total = 0;


  SHOPPING_ITEMS.forEach(item => {

    total += Number(item.price);


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
            checked ? "checked" : ""
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
        ${item.price.toFixed(2)} €
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

  const allChecked =
    SHOPPING_ITEMS.every(
      item =>
        state.shopping[item.id]
    );


  SHOPPING_ITEMS.forEach(item => {

    state.shopping[item.id] =
      !allChecked;

  });


  saveState();

  renderShopping();

}


/* =========================================================
   SUIVI DU POIDS
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


  const weight =
    Number(
      String(input.value)
        .replace(",", ".")
    );


  if (!weight || weight < 30 || weight > 300) {

    showToast("Poids invalide ❌");

    return;

  }


  state.weights.push({

    date: todayKey(),

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
      item => item.weight
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


    if (max !== min) {

      height =
        25 +
        (
          (item.weight - min) /
          (max - min)
        ) * 65;

    }


    bar.style.height =
      `${height}%`;


    bar.innerHTML = `
      <span>
        ${item.weight}
      </span>
    `;


    container.appendChild(bar);

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

        if (event.key === "Enter") {

          addPantryItem();

        }

      }
    );


  renderPantry();

}


function addPantryItem() {

  const input =
    $("pantryInput");


  const value =
    input.value.trim();


  if (!value) return;


  state.pantry.push({

    id:
      Date.now() +
      Math.random(),

    name: value

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

        if (event.key === "Enter") {

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

          $("coachInput").value =
            button.textContent.trim();

          sendCoachMessage();

        }
      );

    });

}


function sendCoachMessage() {

  const input =
    $("coachInput");


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
      generateCoachResponse(message),
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


  const div =
    document.createElement("div");


  div.className =
    `coach-message ${
      user ? "user" : ""
    }`;


  div.textContent =
    message;


  container.appendChild(div);


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


  const proteinTarget =
    calculateProteinTarget();


  const remaining =
    Math.max(
      0,
      target - totals.kcal
    );


  const proteinRemaining =
    Math.max(
      0,
      proteinTarget - totals.protein
    );


  if (
    lower.includes("protéine") ||
    lower.includes("protein")
  ) {

    return (
      `Il te reste environ ` +
      `${round(proteinRemaining, 1)} g ` +
      `de protéines aujourd'hui. 💪`
    );

  }


  if (
    lower.includes("calorie") ||
    lower.includes("kcal")
  ) {

    return (
      `Il te reste environ ` +
      `${formatNumber(remaining)} kcal ` +
      `sur ton objectif de ` +
      `${formatNumber(target)} kcal. 🔥`
    );

  }


  if (
    lower.includes("soir") ||
    lower.includes("manger")
  ) {

    const recipe =
      RECIPES
        .slice()
        .sort(
          (a, b) =>
            Math.abs(
              remaining - a.kcal
            ) -
            Math.abs(
              remaining - b.kcal
            )
        )[0];


    return (
      `Je partirais sur ${recipe.name} : ` +
      `${recipe.kcal} kcal et ` +
      `${recipe.protein} g de protéines. 🍽️`
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
    `${totals.protein} g de protéines. ` +
    `Objectif : ${formatNumber(target)} kcal. 💪`
  );

}


/* =========================================================
   SÉRIE
========================================================= */

function updateStreak() {

  const today =
    todayKey();


  if (
    state.streak.lastDate === today
  ) {

    return;

  }


  if (!state.streak.lastDate) {

    state.streak.count = 1;

  } else {

    const previous =
      new Date(
        state.streak.lastDate
      );


    const current =
      new Date(today);


    const difference =
      Math.round(
        (
          current - previous
        ) /
        (1000 * 60 * 60 * 24)
      );


    if (difference === 1) {

      state.streak.count += 1;

    } else if (difference > 1) {

      state.streak.count = 1;

    }

  }


  state.streak.lastDate =
    today;

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
    Boolean(state.darkMode)
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


  const protein =
    calculateProteinTarget();


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
      `${protein} g`;


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

  renderSelectedDay();

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
