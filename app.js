/* =========================================================
   BUDGETCOOK V4
   APP.JS — BLOC 1
   Base de l'application
========================================================= */

"use strict";

/* =========================================================
   CONFIGURATION
========================================================= */

const APP_NAME = "BudgetCook";
const APP_VERSION = "V4";

const STORAGE_KEY = "budgetcook_v4_state";

/* =========================================================
   UTILITAIRES
========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function byId(id) {
  return document.getElementById(id);
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function round(value, decimals = 0) {
  const factor = Math.pow(10, decimals);

  return Math.round(value * factor) / factor;
}

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(
    safeNumber(value)
  );
}

function formatEuro(value) {
  return `${formatNumber(value, 2)} €`;
}

function formatKcal(value) {
  return `${formatNumber(value)} kcal`;
}

function formatGrams(value) {
  return `${formatNumber(value)} g`;
}

function todayKey() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

/* =========================================================
   ÉTAT INITIAL
========================================================= */

const DEFAULT_STATE = {

  profile: {

    name: "",

    age: 20,

    sex: "male",

    height: 179,

    weight: 88,

    bodyFat: 30,

    chest: 0,

    waist: 0,

    hip: 0,

    leftArm: 0,

    rightArm: 0,

    leftThigh: 0,

    rightThigh: 0,

    neck: 0,

    trainingDays: 5,

    activity: 1.55,

    goal: "recomp",

    targetWeight: 80,

    targetBodyFat: 15,

    deficit: 300,

    surplus: 250,

    proteinPerKg: 2,

    fatPerKg: 0.8,

    budget: 50,

    store: "",

    preferences: {

      autoGenerate: false,

      budgetOptimization: true,

      highProtein: true

    }

  },

  dailyTargets: {

    calories: 0,

    protein: 0,

    carbs: 0,

    fat: 0

  },

  journal: {},

  planner: {},

  shopping: [],

  pantry: [],

  recipes: [],

  progress: [],

  achievements: [],

  water: {},

  streak: 0,

  lastActiveDate: null,

  favorites: [],

  settings: {

    premium: false

  }

};

/* =========================================================
   CLONAGE DE L'ÉTAT
========================================================= */

function cloneDefaultState() {

  return JSON.parse(
    JSON.stringify(
      DEFAULT_STATE
    )
  );

}

/* =========================================================
   CHARGEMENT LOCAL STORAGE
========================================================= */

function loadState() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {

      return cloneDefaultState();

    }

    const parsed =
      JSON.parse(saved);

    return mergeState(
      cloneDefaultState(),
      parsed
    );

  } catch (error) {

    console.error(
      "BudgetCook : impossible de charger les données.",
      error
    );

    return cloneDefaultState();

  }

}

/* =========================================================
   FUSION DES DONNÉES
========================================================= */

function mergeState(base, saved) {

  if (
    !saved ||
    typeof saved !== "object"
  ) {

    return base;

  }

  const result = {
    ...base,
    ...saved
  };

  result.profile = {
    ...base.profile,
    ...(saved.profile || {})
  };

  result.profile.preferences = {
    ...base.profile.preferences,
    ...(
      saved.profile?.preferences || {}
    )
  };

  result.dailyTargets = {
    ...base.dailyTargets,
    ...(saved.dailyTargets || {})
  };

  if (
    !result.journal ||
    typeof result.journal !== "object"
  ) {

    result.journal = {};

  }

  if (
    !result.planner ||
    typeof result.planner !== "object"
  ) {

    result.planner = {};

  }

  if (
    !Array.isArray(result.shopping)
  ) {

    result.shopping = [];

  }

  if (
    !Array.isArray(result.pantry)
  ) {

    result.pantry = [];

  }

  if (
    !Array.isArray(result.recipes)
  ) {

    result.recipes = [];

  }

  if (
    !Array.isArray(result.progress)
  ) {

    result.progress = [];

  }

  if (
    !Array.isArray(result.achievements)
  ) {

    result.achievements = [];

  }

  if (
    !Array.isArray(result.favorites)
  ) {

    result.favorites = [];

  }

  return result;

}

/* =========================================================
   ÉTAT GLOBAL
========================================================= */

let state = loadState();

/* =========================================================
   SAUVEGARDE
========================================================= */

function saveState() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

  } catch (error) {

    console.error(
      "BudgetCook : impossible de sauvegarder.",
      error
    );

    showToast(
      "Impossible de sauvegarder les données.",
      "error"
    );

  }

}

/* =========================================================
   RESET COMPLET
========================================================= */

function resetApplicationData() {

  const confirmed =
    window.confirm(
      "Supprimer toutes les données BudgetCook ? Cette action est irréversible."
    );

  if (!confirmed) {

    return;

  }

  state =
    cloneDefaultState();

  saveState();

  renderApplication();

  showToast(
    "Données supprimées.",
    "success"
  );

}

/* =========================================================
   TOAST
========================================================= */

function showToast(
  message,
  type = "info"
) {

  const container =
    byId("toastContainer");

  if (!container) {

    return;

  }

  const toast =
    document.createElement("div");

  toast.className =
    `toast toast-${type}`;

  toast.textContent =
    message;

  container.appendChild(
    toast
  );

  requestAnimationFrame(() => {

    toast.classList.add(
      "show"
    );

  });

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

    setTimeout(() => {

      toast.remove();

    }, 300);

  }, 3000);

}

/* =========================================================
   MODALE
========================================================= */

function openModal(content) {

  const overlay =
    byId("modalOverlay");

  const modalContent =
    byId("modalContent");

  if (
    !overlay ||
    !modalContent
  ) {

    return;

  }

  modalContent.innerHTML =
    content;

  overlay.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "modal-open"
  );

}

function closeModal() {

  const overlay =
    byId("modalOverlay");

  if (!overlay) {

    return;

  }

  overlay.classList.add(
    "hidden"
  );

  document.body.classList.remove(
    "modal-open"
  );

}

function setupModal() {

  const closeButton =
    byId("modalCloseButton");

  const overlay =
    byId("modalOverlay");

  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeModal
    );

  }

  if (overlay) {

    overlay.addEventListener(
      "click",
      event => {

        if (
          event.target === overlay
        ) {

          closeModal();

        }

      }
    );

  }

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

}

/* =========================================================
   NAVIGATION
========================================================= */

let currentPage = "home";

function navigateTo(page) {

  if (!page) {

    return;

  }

  const pages =
    $$(".page");

  pages.forEach(section => {

    section.classList.toggle(
      "active",
      section.id ===
        `page-${page}`
    );

  });

  const navItems =
    $$(
      ".nav-item, .mobile-nav-item"
    );

  navItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.page === page
    );

  });

  currentPage =
    page;

  if (
    typeof renderPage ===
    "function"
  ) {

    renderPage(page);

  }

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

          const page =
            button.dataset.page;

          navigateTo(page);

        }
      );

    });

}

/* =========================================================
   MENU MOBILE
========================================================= */

function setupMobileMenu() {

  const button =
    byId("mobileMenuButton");

  const sidebar =
    $(".sidebar");

  if (
    !button ||
    !sidebar
  ) {

    return;

  }

  button.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "mobile-open"
      );

    }
  );

  $$(".sidebar [data-page]")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          sidebar.classList.remove(
            "mobile-open"
          );

        }
      );

    });

}

/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupNavigation();

    setupMobileMenu();

    setupModal();

    renderApplication();

  }
);

/* =========================================================
   BUDGETCOOK V4
   APP.JS — BLOC 2
   CALCULS NUTRITIONNELS
========================================================= */

/* =========================================================
   BMR — MIFFLIN-ST JEOR
========================================================= */

function calculateBMR(profile = state.profile) {

  const age =
    safeNumber(profile.age);

  const weight =
    safeNumber(profile.weight);

  const height =
    safeNumber(profile.height);

  if (
    age <= 0 ||
    weight <= 0 ||
    height <= 0
  ) {

    return 0;

  }

  let bmr;

  if (
    profile.sex === "female"
  ) {

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

  return Math.round(bmr);

}


/* =========================================================
   FACTEUR D'ACTIVITÉ
========================================================= */

function getActivityFactor(
  profile = state.profile
) {

  const activity =
    safeNumber(
      profile.activity,
      1.55
    );

  const allowed = [
    1.2,
    1.375,
    1.55,
    1.725,
    1.9
  ];

  if (
    allowed.includes(activity)
  ) {

    return activity;

  }

  return 1.55;

}


/* =========================================================
   TDEE
========================================================= */

function calculateTDEE(
  profile = state.profile
) {

  const bmr =
    calculateBMR(profile);

  if (!bmr) {

    return 0;

  }

  const activityFactor =
    getActivityFactor(profile);

  return Math.round(
    bmr * activityFactor
  );

}


/* =========================================================
   OBJECTIF CALORIQUE
========================================================= */

function calculateTargetCalories(
  profile = state.profile
) {

  const tdee =
    calculateTDEE(profile);

  if (!tdee) {

    return 0;

  }

  const goal =
    profile.goal || "maintain";

  let calories =
    tdee;

  switch (goal) {

    case "cut":

      calories =
        tdee -
        Math.abs(
          safeNumber(
            profile.deficit,
            300
          )
        );

      break;


    case "recomp":

      /*
       * Pour une recomposition,
       * on utilise généralement un
       * léger déficit plutôt qu'un
       * gros déficit.
       */

      calories =
        tdee -
        Math.abs(
          safeNumber(
            profile.deficit,
            200
          )
        );

      break;


    case "bulk":

      calories =
        tdee +
        Math.abs(
          safeNumber(
            profile.surplus,
            250
          )
        );

      break;


    case "maintain":

    default:

      calories =
        tdee;

      break;

  }

  /*
   * Sécurité :
   * on évite un objectif calorique
   * complètement incohérent.
   */

  const minimumCalories =
    profile.sex === "female"
      ? 1200
      : 1500;

  calories =
    Math.max(
      calories,
      minimumCalories
    );

  return Math.round(
    calories
  );

}


/* =========================================================
   PROTÉINES
========================================================= */

function calculateProteinTarget(
  profile = state.profile
) {

  const weight =
    safeNumber(
      profile.weight
    );

  if (weight <= 0) {

    return 0;

  }

  let proteinPerKg;

  /*
   * Les besoins sont adaptés
   * à l'objectif.
   */

  switch (
    profile.goal
  ) {

    case "cut":

      proteinPerKg =
        2.0;

      break;


    case "recomp":

      proteinPerKg =
        2.0;

      break;


    case "bulk":

      proteinPerKg =
        1.8;

      break;


    case "maintain":

      proteinPerKg =
        1.6;

      break;


    default:

      proteinPerKg =
        1.8;

  }

  /*
   * Si l'utilisateur a défini
   * une valeur personnalisée,
   * on l'utilise.
   */

  if (
    Number.isFinite(
      Number(
        profile.proteinPerKg
      )
    ) &&
    profile.proteinPerKg > 0
  ) {

    proteinPerKg =
      profile.proteinPerKg;

  }

  return Math.round(
    weight *
    proteinPerKg
  );

}


/* =========================================================
   LIPIDES
========================================================= */

function calculateFatTarget(
  profile = state.profile
) {

  const weight =
    safeNumber(
      profile.weight
    );

  if (weight <= 0) {

    return 0;

  }

  let fatPerKg;

  switch (
    profile.goal
  ) {

    case "cut":

      fatPerKg =
        0.8;

      break;


    case "recomp":

      fatPerKg =
        0.8;

      break;


    case "bulk":

      fatPerKg =
        0.9;

      break;


    case "maintain":

      fatPerKg =
        0.8;

      break;


    default:

      fatPerKg =
        0.8;

  }

  /*
   * Valeur personnalisée
   * si l'utilisateur en a
   * renseigné une.
   */

  if (
    Number.isFinite(
      Number(
        profile.fatPerKg
      )
    ) &&
    profile.fatPerKg > 0
  ) {

    fatPerKg =
      profile.fatPerKg;

  }

  return Math.round(
    weight *
    fatPerKg
  );

}


/* =========================================================
   GLUCIDES
========================================================= */

function calculateCarbTarget(
  calories,
  protein,
  fat
) {

  calories =
    safeNumber(
      calories
    );

  protein =
    safeNumber(
      protein
    );

  fat =
    safeNumber(
      fat
    );

  /*
   * Protéines :
   * 4 kcal / gramme
   */

  const proteinCalories =
    protein * 4;


  /*
   * Lipides :
   * 9 kcal / gramme
   */

  const fatCalories =
    fat * 9;


  /*
   * Les glucides prennent
   * UNIQUEMENT les calories
   * restantes.
   */

  const remainingCalories =
    calories -
    proteinCalories -
    fatCalories;


  /*
   * Glucides :
   * 4 kcal / gramme
   */

  const carbs =
    remainingCalories / 4;


  /*
   * Si protéines + lipides
   * dépassent les calories,
   * on ne renvoie pas une
   * valeur négative.
   */

  return Math.max(
    0,
    Math.round(carbs)
  );

}


/* =========================================================
   CALCUL COMPLET DES MACROS
========================================================= */

function calculateMacros(
  profile = state.profile
) {

  const calories =
    calculateTargetCalories(
      profile
    );

  const protein =
    calculateProteinTarget(
      profile
    );

  const fat =
    calculateFatTarget(
      profile
    );

  const carbs =
    calculateCarbTarget(
      calories,
      protein,
      fat
    );

  return {

    calories,

    protein,

    fat,

    carbs

  };

}


/* =========================================================
   CIBLE NUTRITIONNELLE COMPLÈTE
========================================================= */

function getDailyTargets(
  profile = state.profile
) {

  const macros =
    calculateMacros(
      profile
    );

  return {

    calories:
      macros.calories,

    protein:
      macros.protein,

    carbs:
      macros.carbs,

    fat:
      macros.fat

  };

}


/* =========================================================
   CALORIES D'UN ALIMENT
========================================================= */

function calculateFoodCalories(
  food
) {

  if (!food) {

    return 0;

  }

  /*
   * Si l'aliment contient
   * directement les calories.
   */

  if (
    Number.isFinite(
      Number(food.calories)
    )
  ) {

    return Number(
      food.calories
    );

  }

  const protein =
    safeNumber(
      food.protein
    );

  const carbs =
    safeNumber(
      food.carbs
    );

  const fat =
    safeNumber(
      food.fat
    );

  return Math.round(
    protein * 4 +
    carbs * 4 +
    fat * 9
  );

}


/* =========================================================
   MACROS D'UN ALIMENT
========================================================= */

function calculateFoodMacros(
  food,
  quantity = 100
) {

  if (!food) {

    return {

      calories: 0,

      protein: 0,

      carbs: 0,

      fat: 0

    };

  }

  const grams =
    safeNumber(
      quantity,
      100
    );

  const multiplier =
    grams / 100;

  return {

    calories:
      Math.round(
        safeNumber(
          food.calories
        ) *
        multiplier
      ),

    protein:
      round(
        safeNumber(
          food.protein
        ) *
        multiplier,
        1
      ),

    carbs:
      round(
        safeNumber(
          food.carbs
        ) *
        multiplier,
        1
      ),

    fat:
      round(
        safeNumber(
          food.fat
        ) *
        multiplier,
        1
      )

  };

}


/* =========================================================
   MACROS D'UNE LISTE D'ALIMENTS
========================================================= */

function sumMacros(
  items = []
) {

  const result = {

    calories: 0,

    protein: 0,

    carbs: 0,

    fat: 0

  };

  if (
    !Array.isArray(items)
  ) {

    return result;

  }

  items.forEach(item => {

    result.calories +=
      safeNumber(
        item.calories
      );

    result.protein +=
      safeNumber(
        item.protein
      );

    result.carbs +=
      safeNumber(
        item.carbs
      );

    result.fat +=
      safeNumber(
        item.fat
      );

  });

  result.calories =
    Math.round(
      result.calories
    );

  result.protein =
    round(
      result.protein,
      1
    );

  result.carbs =
    round(
      result.carbs,
      1
    );

  result.fat =
    round(
      result.fat,
      1
    );

  return result;

}


/* =========================================================
   POURCENTAGE DE PROGRESSION
========================================================= */

function progressPercent(
  consumed,
  target
) {

  consumed =
    safeNumber(
      consumed
    );

  target =
    safeNumber(
      target
    );

  if (target <= 0) {

    return 0;

  }

  return clamp(
    Math.round(
      (
        consumed /
        target
      ) * 100
    ),
    0,
    100
  );

}


/* =========================================================
   CALORIES RESTANTES
========================================================= */

function caloriesRemaining(
  consumed,
  target
) {

  return Math.max(
    0,
    Math.round(
      safeNumber(target) -
      safeNumber(consumed)
    )
  );

}


/* =========================================================
   APPORT TOTAL JOURNALIER
========================================================= */

function getTodayJournalItems() {

  const date =
    todayKey();

  const journal =
    state.journal[date];

  if (
    !journal ||
    !Array.isArray(
      journal.items
    )
  ) {

    return [];

  }

  return journal.items;

}


/* =========================================================
   TOTAL JOURNAL DU JOUR
========================================================= */

function getTodayTotals() {

  const items =
    getTodayJournalItems();

  return sumMacros(
    items
  );

}


/* =========================================================
   MISE À JOUR DES CIBLES
========================================================= */

function updateDailyTargets() {

  state.dailyTargets =
    getDailyTargets(
      state.profile
    );

  saveState();

}


/* =========================================================
   APERÇU DU PROFIL
========================================================= */

function calculateProfilePreview() {

  /*
   * On lit directement
   * les champs du HTML.
   */

  const profile =
    getProfileFromDOM();

  const targets =
    getDailyTargets(
      profile
    );

  const calories =
    byId(
      "profileCalculatedCalories"
    );

  const protein =
    byId(
      "profileCalculatedProtein"
    );

  const fat =
    byId(
      "profileCalculatedFat"
    );

  const carbs =
    byId(
      "profileCalculatedCarbs"
    );

  const calculatedCarbs =
    byId(
      "calculatedCarbs"
    );

  if (calories) {

    calories.textContent =
      `${formatNumber(
        targets.calories
      )} kcal`;

  }

  if (protein) {

    protein.textContent =
      `${formatNumber(
        targets.protein
      )} g`;

  }

  if (fat) {

    fat.textContent =
      `${formatNumber(
        targets.fat
      )} g`;

  }

  if (carbs) {

    carbs.textContent =
      `${formatNumber(
        targets.carbs
      )} g`;

  }

  if (
    calculatedCarbs
  ) {

    calculatedCarbs.textContent =
      `${formatNumber(
        targets.carbs
      )} g`;

  }

  return targets;

}


/* =========================================================
   ÉCOUTE DES CHANGEMENTS DU PROFIL
========================================================= */

function setupNutritionInputs() {

  const selectors = [

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

  ];

  selectors.forEach(
    selector => {

      const input =
        $(selector);

      if (!input) {

        return;

      }

      input.addEventListener(
        "input",
        calculateProfilePreview
      );

      input.addEventListener(
        "change",
        calculateProfilePreview
      );

    }
  );


  $$(
    'input[name="profileGoal"]'
  ).forEach(
    input => {

      input.addEventListener(
        "change",
        calculateProfilePreview
      );

    }
  );

}


/* =========================================================
   VALIDATION DES MACROS
========================================================= */

function validateMacroTargets(
  targets
) {

  if (!targets) {

    return false;

  }

  if (
    targets.calories <= 0
  ) {

    return false;

  }

  if (
    targets.protein < 0 ||
    targets.fat < 0 ||
    targets.carbs < 0
  ) {

    return false;

  }

  return true;

}


/* =========================================================
   INITIALISATION DES CALCULS
========================================================= */

function initializeNutrition() {

  state.dailyTargets =
    getDailyTargets(
      state.profile
    );

  saveState();

}

/* =========================================================
   BUDGETCOOK V4
   APP.JS — BLOC 3
   PROFIL + PRÉFÉRENCES
========================================================= */

/* =========================================================
   LECTURE D'UNE VALEUR DU FORMULAIRE
========================================================= */

function readInputValue(
  id,
  fallback = ""
) {

  const element =
    byId(id);

  if (!element) {

    return fallback;

  }

  if (
    element.type === "checkbox"
  ) {

    return element.checked;

  }

  return element.value;

}


/* =========================================================
   LECTURE D'UN NOMBRE
========================================================= */

function readInputNumber(
  id,
  fallback = 0
) {

  const value =
    readInputValue(
      id,
      ""
    );

  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {

    return fallback;

  }

  const number =
    parseFloat(value);

  return Number.isFinite(number)
    ? number
    : fallback;

}


/* =========================================================
   LECTURE DU PROFIL DEPUIS LE HTML
========================================================= */

function getProfileFromDOM() {

  const profile = {
    ...state.profile
  };


  /* -------------------------------------------------------
     INFORMATIONS PERSONNELLES
  ------------------------------------------------------- */

  profile.name =
    readInputValue(
      "profileName",
      profile.name || ""
    );

  profile.age =
    readInputNumber(
      "profileAge",
      profile.age || 0
    );

  profile.sex =
    readInputValue(
      "profileSex",
      profile.sex || "male"
    );

  profile.height =
    readInputNumber(
      "profileHeight",
      profile.height || 0
    );

  profile.weight =
    readInputNumber(
      "profileWeight",
      profile.weight || 0
    );

  profile.bodyFat =
    readInputNumber(
      "profileBodyFat",
      profile.bodyFat || 0
    );


  /* -------------------------------------------------------
     MENSURATIONS
  ------------------------------------------------------- */

  profile.chest =
    readInputNumber(
      "profileChest",
      profile.chest || 0
    );

  profile.waist =
    readInputNumber(
      "profileWaist",
      profile.waist || 0
    );

  profile.hip =
    readInputNumber(
      "profileHips",
      profile.hip || 0
    );

  profile.leftArm =
    readInputNumber(
      "profileArm",
      profile.leftArm || 0
    );

  profile.rightArm =
    profile.leftArm;

  profile.leftThigh =
    readInputNumber(
      "profileThigh",
      profile.leftThigh || 0
    );

  profile.rightThigh =
    profile.leftThigh;

  profile.neck =
    readInputNumber(
      "profileNeck",
      profile.neck || 0
    );


  /* -------------------------------------------------------
     ACTIVITÉ
  ------------------------------------------------------- */

  profile.trainingDays =
    readInputNumber(
      "profileTraining",
      profile.trainingDays || 0
    );

  const activity =
    readInputValue(
      "profileActivity",
      "moderate"
    );

  const activityFactors = {

    sedentary: 1.2,

    light: 1.375,

    moderate: 1.55,

    active: 1.725,

    very_active: 1.9

  };

  profile.activity =
    activityFactors[
      activity
    ] || 1.55;


  /* -------------------------------------------------------
     OBJECTIF
  ------------------------------------------------------- */

  const selectedGoal =
    document.querySelector(
      'input[name="profileGoal"]:checked'
    );

  if (selectedGoal) {

    profile.goal =
      selectedGoal.value;

  }


  profile.targetWeight =
    readInputNumber(
      "profileTargetWeight",
      profile.targetWeight || 0
    );

  profile.targetBodyFat =
    readInputNumber(
      "profileTargetBodyFat",
      profile.targetBodyFat || 0
    );

  profile.deficit =
    readInputNumber(
      "profileDeficit",
      profile.deficit || 300
    );


  /* -------------------------------------------------------
     PARAMÈTRES MACROS
  ------------------------------------------------------- */

  const proteinInput =
    byId(
      "proteinTarget"
    );

  if (
    proteinInput &&
    proteinInput.value !== ""
  ) {

    const protein =
      parseFloat(
        proteinInput.value
      );

    if (
      Number.isFinite(protein) &&
      profile.weight > 0
    ) {

      profile.proteinPerKg =
        protein /
        profile.weight;

    }

  }


  const fatInput =
    byId(
      "fatTarget"
    );

  if (
    fatInput &&
    fatInput.value !== ""
  ) {

    const fat =
      parseFloat(
        fatInput.value
      );

    if (
      Number.isFinite(fat) &&
      profile.weight > 0
    ) {

      profile.fatPerKg =
        fat /
        profile.weight;

    }

  }


  /* -------------------------------------------------------
     BUDGET
  ------------------------------------------------------- */

  profile.budget =
    readInputNumber(
      "profileBudget",
      profile.budget || 50
    );

  profile.store =
    readInputValue(
      "profileStore",
      profile.store || ""
    );


  /* -------------------------------------------------------
     PRÉFÉRENCES
  ------------------------------------------------------- */

  profile.preferences = {

    autoGenerate:
      Boolean(
        readInputValue(
          "preferenceAutoGenerate",
          profile.preferences?.autoGenerate ||
            false
        )
      ),

    budgetOptimization:
      Boolean(
        readInputValue(
          "preferenceBudgetOptimization",
          profile.preferences?.budgetOptimization ??
            true
        )
      ),

    highProtein:
      Boolean(
        readInputValue(
          "preferenceHighProtein",
          profile.preferences?.highProtein ??
            true
        )
      )

  };


  return profile;

}


/* =========================================================
   REMPLISSAGE DU PROFIL DANS LE HTML
========================================================= */

function renderProfile() {

  const profile =
    state.profile;


  const setValue = (
    id,
    value
  ) => {

    const element =
      byId(id);

    if (!element) {

      return;

    }

    element.value =
      value ?? "";

  };


  /* -------------------------------------------------------
     INFORMATIONS PERSONNELLES
  ------------------------------------------------------- */

  setValue(
    "profileName",
    profile.name
  );

  setValue(
    "profileAge",
    profile.age
  );

  setValue(
    "profileSex",
    profile.sex
  );

  setValue(
    "profileHeight",
    profile.height
  );

  setValue(
    "profileWeight",
    profile.weight
  );

  setValue(
    "profileBodyFat",
    profile.bodyFat
  );


  /* -------------------------------------------------------
     MENSURATIONS
  ------------------------------------------------------- */

  setValue(
    "profileChest",
    profile.chest
  );

  setValue(
    "profileWaist",
    profile.waist
  );

  setValue(
    "profileHips",
    profile.hip
  );

  setValue(
    "profileArm",
    profile.leftArm
  );

  setValue(
    "profileThigh",
    profile.leftThigh
  );

  setValue(
    "profileNeck",
    profile.neck
  );


  /* -------------------------------------------------------
     ACTIVITÉ
  ------------------------------------------------------- */

  setValue(
    "profileTraining",
    profile.trainingDays
  );


  const activityMap = {

    1.2:
      "sedentary",

    1.375:
      "light",

    1.55:
      "moderate",

    1.725:
      "active",

    1.9:
      "very_active"

  };

  setValue(
    "profileActivity",
    activityMap[
      profile.activity
    ] || "moderate"
  );


  /* -------------------------------------------------------
     OBJECTIF
  ------------------------------------------------------- */

  $$(
    'input[name="profileGoal"]'
  ).forEach(
    radio => {

      radio.checked =
        radio.value ===
        profile.goal;

    }
  );


  setValue(
    "profileTargetWeight",
    profile.targetWeight
  );

  setValue(
    "profileTargetBodyFat",
    profile.targetBodyFat
  );

  setValue(
    "profileDeficit",
    profile.deficit
  );


  /* -------------------------------------------------------
     MACROS
  ------------------------------------------------------- */

  const targets =
    getDailyTargets(
      profile
    );


  const proteinInput =
    byId(
      "proteinTarget"
    );

  if (proteinInput) {

    proteinInput.value =
      Math.round(
        targets.protein
      );

  }


  const fatInput =
    byId(
      "fatTarget"
    );

  if (fatInput) {

    fatInput.value =
      Math.round(
        targets.fat
      );

  }


  /* -------------------------------------------------------
     BUDGET
  ------------------------------------------------------- */

  setValue(
    "profileBudget",
    profile.budget
  );

  setValue(
    "profileStore",
    profile.store
  );


  /* -------------------------------------------------------
     PRÉFÉRENCES
  ------------------------------------------------------- */

  const autoGenerate =
    byId(
      "preferenceAutoGenerate"
    );

  if (autoGenerate) {

    autoGenerate.checked =
      Boolean(
        profile.preferences
          ?.autoGenerate
      );

  }


  const budgetOptimization =
    byId(
      "preferenceBudgetOptimization"
    );

  if (budgetOptimization) {

    budgetOptimization.checked =
      profile.preferences
        ?.budgetOptimization !==
        false;

  }


  const highProtein =
    byId(
      "preferenceHighProtein"
    );

  if (highProtein) {

    highProtein.checked =
      profile.preferences
        ?.highProtein !==
        false;

  }


  calculateProfilePreview();

}


/* =========================================================
   ENREGISTREMENT DU PROFIL
========================================================= */

function saveProfile() {

  const newProfile =
    getProfileFromDOM();


  /* -------------------------------------------------------
     VALIDATION
  ------------------------------------------------------- */

  if (
    !newProfile.age ||
    newProfile.age < 1 ||
    newProfile.age > 120
  ) {

    showToast(
      "Entre un âge valide.",
      "error"
    );

    return false;

  }


  if (
    !newProfile.height ||
    newProfile.height < 100 ||
    newProfile.height > 250
  ) {

    showToast(
      "Entre une taille valide.",
      "error"
    );

    return false;

  }


  if (
    !newProfile.weight ||
    newProfile.weight < 20 ||
    newProfile.weight > 300
  ) {

    showToast(
      "Entre un poids valide.",
      "error"
    );

    return false;

  }


  /* -------------------------------------------------------
     SAUVEGARDE
  ------------------------------------------------------- */

  state.profile =
    newProfile;


  state.dailyTargets =
    getDailyTargets(
      state.profile
    );


  /* -------------------------------------------------------
     AJOUT AUTOMATIQUE D'UNE
     MESURE DE POIDS
  ------------------------------------------------------- */

  if (
    state.profile.weight > 0
  ) {

    const today =
      todayKey();

    const alreadyExists =
      state.progress.some(
        entry =>
          entry.date === today
      );

    if (
      !alreadyExists
    ) {

      state.progress.push({

        id:
          uid("progress"),

        date:
          today,

        weight:
          state.profile.weight,

        bodyFat:
          state.profile.bodyFat || null,

        waist:
          state.profile.waist || null,

        chest:
          state.profile.chest || null,

        hips:
          state.profile.hip || null,

        arm:
          state.profile.leftArm || null,

        thigh:
          state.profile.leftThigh || null,

        neck:
          state.profile.neck || null

      });

    }

  }


  saveState();


  /* -------------------------------------------------------
     MISE À JOUR DE L'INTERFACE
  ------------------------------------------------------- */

  renderApplication();


  showToast(
    "Profil enregistré avec succès.",
    "success"
  );


  return true;

}


/* =========================================================
   INITIALISATION DU PROFIL
========================================================= */

function setupProfile() {

  const saveButton =
    byId(
      "saveProfileButton"
    );

  if (saveButton) {

    saveButton.addEventListener(
      "click",
      saveProfile
    );

  }


  setupNutritionInputs();


  const preferenceIds = [

    "preferenceAutoGenerate",

    "preferenceBudgetOptimization",

    "preferenceHighProtein"

  ];


  preferenceIds.forEach(
    id => {

      const element =
        byId(id);

      if (!element) {

        return;

      }

      element.addEventListener(
        "change",
        () => {

          const profile =
            getProfileFromDOM();

          state.profile =
            profile;

          saveState();

        }
      );

    }
  );

}


/* =========================================================
   CALCULS AFFICHÉS DANS LE PROFIL
========================================================= */

function renderProfileCalculations() {

  const profile =
    state.profile;

  const targets =
    getDailyTargets(
      profile
    );


  const elements = {

    calories:
      byId(
        "profileCalculatedCalories"
      ),

    protein:
      byId(
        "profileCalculatedProtein"
      ),

    fat:
      byId(
        "profileCalculatedFat"
      ),

    carbs:
      byId(
        "profileCalculatedCarbs"
      ),

    calculatedCarbs:
      byId(
        "calculatedCarbs"
      )

  };


  if (
    elements.calories
  ) {

    elements.calories.textContent =
      `${formatNumber(
        targets.calories
      )} kcal`;

  }


  if (
    elements.protein
  ) {

    elements.protein.textContent =
      `${formatNumber(
        targets.protein
      )} g`;

  }


  if (
    elements.fat
  ) {

    elements.fat.textContent =
      `${formatNumber(
        targets.fat
      )} g`;

  }


  if (
    elements.carbs
  ) {

    elements.carbs.textContent =
      `${formatNumber(
        targets.carbs
      )} g`;

  }


  if (
    elements.calculatedCarbs
  ) {

    elements.calculatedCarbs.textContent =
      `${formatNumber(
        targets.carbs
      )} g`;

  }

}


/* =========================================================
   RÉINITIALISATION DES CHAMPS PROFIL
========================================================= */

function resetProfileForm() {

  renderProfile();

  calculateProfilePreview();

}


/* =========================================================
   EXPORT DU PROFIL
========================================================= */

function exportProfileData() {

  const data = {

    profile:
      state.profile,

    dailyTargets:
      state.dailyTargets,

    exportedAt:
      new Date().toISOString()

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
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
    "budgetcook-profil.json";

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );

}


/* =========================================================
   IMPORT D'UN PROFIL
========================================================= */

function importProfileData(
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

        const data =
          JSON.parse(
            event.target.result
          );


        if (
          !data.profile
        ) {

          throw new Error(
            "Profil invalide."
          );

        }


        state.profile =
          mergeState(
            cloneDefaultState(),
            {
              profile:
                data.profile
            }
          ).profile;


        state.dailyTargets =
          getDailyTargets(
            state.profile
          );


        saveState();

        renderApplication();


        showToast(
          "Profil importé.",
          "success"
        );


      } catch (error) {

        console.error(
          error
        );

        showToast(
          "Le fichier de profil est invalide.",
          "error"
        );

      }

    };


  reader.readAsText(
    file
  );

}

/* =========================================================
   BUDGETCOOK V4
   APP.JS — BLOC 4
   JOURNAL + ALIMENTS
========================================================= */

/* =========================================================
   STRUCTURE D'UNE JOURNÉE
========================================================= */

function getEmptyJournalDay() {

  return {

    date: todayKey(),

    items: []

  };

}


/* =========================================================
   RÉCUPÉRER LE JOURNAL DU JOUR
========================================================= */

function getTodayJournal() {

  const date =
    todayKey();

  if (
    !state.journal[date]
  ) {

    state.journal[date] =
      getEmptyJournalDay();

    state.journal[date].date =
      date;

  }

  return state.journal[date];

}


/* =========================================================
   RÉCUPÉRER LES ALIMENTS DU JOUR
========================================================= */

function getJournalItems(
  date = todayKey()
) {

  if (
    !state.journal[date]
  ) {

    return [];

  }

  if (
    !Array.isArray(
      state.journal[date].items
    )
  ) {

    state.journal[date].items =
      [];

  }

  return state.journal[date].items;

}


/* =========================================================
   ALIMENT PAR DÉFAUT
========================================================= */

function normalizeFood(
  food
) {

  if (!food) {

    return {

      name: "Aliment",

      calories: 0,

      protein: 0,

      carbs: 0,

      fat: 0

    };

  }


  return {

    id:
      food.id ||
      uid("food"),

    name:
      food.name ||
      "Aliment",

    calories:
      safeNumber(
        food.calories
      ),

    protein:
      safeNumber(
        food.protein
      ),

    carbs:
      safeNumber(
        food.carbs
      ),

    fat:
      safeNumber(
        food.fat
      ),

    quantity:
      safeNumber(
        food.quantity,
        100
      ),

    unit:
      food.unit ||
      "g"

  };

}


/* =========================================================
   AJOUTER UN ALIMENT AU JOURNAL
========================================================= */

function addFoodToJournal(
  food,
  meal = "lunch",
  quantity = 100
) {

  if (!food) {

    return null;

  }


  const journal =
    getTodayJournal();


  const normalized =
    normalizeFood(
      food
    );


  normalized.quantity =
    safeNumber(
      quantity,
      100
    );


  normalized.meal =
    meal;


  /*
   * Les valeurs nutritionnelles
   * présentes dans la base sont
   * considérées comme étant
   * pour 100 g.
   */

  const multiplier =
    normalized.quantity /
    100;


  normalized.totalCalories =
    Math.round(
      normalized.calories *
      multiplier
    );


  normalized.totalProtein =
    round(
      normalized.protein *
      multiplier,
      1
    );


  normalized.totalCarbs =
    round(
      normalized.carbs *
      multiplier,
      1
    );


  normalized.totalFat =
    round(
      normalized.fat *
      multiplier,
      1
    );


  /*
   * On conserve aussi les
   * valeurs de référence.
   */

  normalized.baseCalories =
    normalized.calories;

  normalized.baseProtein =
    normalized.protein;

  normalized.baseCarbs =
    normalized.carbs;

  normalized.baseFat =
    normalized.fat;


  journal.items.push(
    normalized
  );


  saveState();


  updateStreak();


  renderApplication();


  showToast(
    `${normalized.name} ajouté au journal.`,
    "success"
  );


  return normalized;

}


/* =========================================================
   CALCULER LES VALEURS D'UN ALIMENT
   SELON SA QUANTITÉ
========================================================= */

function recalculateJournalItem(
  item
) {

  if (!item) {

    return null;

  }


  const quantity =
    safeNumber(
      item.quantity,
      100
    );


  const multiplier =
    quantity / 100;


  const baseCalories =
    safeNumber(
      item.baseCalories,
      item.calories
    );


  const baseProtein =
    safeNumber(
      item.baseProtein,
      item.protein
    );


  const baseCarbs =
    safeNumber(
      item.baseCarbs,
      item.carbs
    );


  const baseFat =
    safeNumber(
      item.baseFat,
      item.fat
    );


  item.totalCalories =
    Math.round(
      baseCalories *
      multiplier
    );


  item.totalProtein =
    round(
      baseProtein *
      multiplier,
      1
    );


  item.totalCarbs =
    round(
      baseCarbs *
      multiplier,
      1
    );


  item.totalFat =
    round(
      baseFat *
      multiplier,
      1
    );


  return item;

}


/* =========================================================
   MODIFIER LA QUANTITÉ
========================================================= */

function updateJournalItemQuantity(
  itemId,
  quantity
) {

  const items =
    getJournalItems();


  const item =
    items.find(
      entry =>
        entry.id ===
        itemId
    );


  if (!item) {

    return;

  }


  const newQuantity =
    safeNumber(
      quantity,
      0
    );


  if (
    newQuantity <= 0
  ) {

    removeJournalItem(
      itemId
    );

    return;

  }


  item.quantity =
    newQuantity;


  recalculateJournalItem(
    item
  );


  saveState();

  renderApplication();

}


/* =========================================================
   SUPPRIMER UN ALIMENT
========================================================= */

function removeJournalItem(
  itemId
) {

  const journal =
    getTodayJournal();


  const index =
    journal.items.findIndex(
      item =>
        item.id ===
        itemId
    );


  if (
    index === -1
  ) {

    return;

  }


  const item =
    journal.items[index];


  journal.items.splice(
    index,
    1
  );


  saveState();


  renderApplication();


  showToast(
    `${item.name} supprimé.`,
    "success"
  );

}


/* =========================================================
   TOTALS D'UN REPAS
========================================================= */

function getMealTotals(
  meal
) {

  const items =
    getTodayJournalItemsByMeal(
      meal
    );


  return {

    calories:
      items.reduce(
        (
          total,
          item
        ) =>
          total +
          safeNumber(
            item.totalCalories
          ),
        0
      ),

    protein:
      items.reduce(
        (
          total,
          item
        ) =>
          total +
          safeNumber(
            item.totalProtein
          ),
        0
      ),

    carbs:
      items.reduce(
        (
          total,
          item
        ) =>
          total +
          safeNumber(
            item.totalCarbs
          ),
        0
      ),

    fat:
      items.reduce(
        (
          total,
          item
        ) =>
          total +
          safeNumber(
            item.totalFat
          ),
        0
      )

  };

}


/* =========================================================
   ALIMENTS D'UN REPAS
========================================================= */

function getTodayJournalItemsByMeal(
  meal
) {

  return getJournalItems()
    .filter(
      item =>
        item.meal ===
        meal
    );

}


/* =========================================================
   TOTALS COMPLETS DU JOUR
========================================================= */

function calculateTodayNutrition() {

  const items =
    getJournalItems();


  const result = {

    calories: 0,

    protein: 0,

    carbs: 0,

    fat: 0

  };


  items.forEach(
    item => {

      recalculateJournalItem(
        item
      );


      result.calories +=
        safeNumber(
          item.totalCalories
        );


      result.protein +=
        safeNumber(
          item.totalProtein
        );


      result.carbs +=
        safeNumber(
          item.totalCarbs
        );


      result.fat +=
        safeNumber(
          item.totalFat
        );

    }
  );


  result.calories =
    Math.round(
      result.calories
    );


  result.protein =
    round(
      result.protein,
      1
    );


  result.carbs =
    round(
      result.carbs,
      1
    );


  result.fat =
    round(
      result.fat,
      1
    );


  return result;

}


/* =========================================================
   MODALE AJOUT D'ALIMENT
========================================================= */

function openAddFoodModal(
  meal = "lunch"
) {

  const foods =
    getAvailableFoods();


  openModal(`

    <div class="modal-header">

      <p class="eyebrow">
        JOURNAL
      </p>

      <h2>
        Ajouter un aliment
      </h2>

      <p>
        Choisis un aliment puis indique la quantité.
      </p>

    </div>


    <div class="form-group">

      <label for="modalFoodSearch">
        Rechercher
      </label>

      <input
        id="modalFoodSearch"
        class="search-input"
        type="search"
        placeholder="Ex : poulet, riz, œuf..."
      >

    </div>


    <div class="form-group">

      <label for="modalFoodSelect">
        Aliment
      </label>

      <select
        id="modalFoodSelect"
        class="select-input"
      >

        ${foods
          .map(
            food => `

              <option
                value="${escapeHtmlAttribute(
                  food.id
                )}"
              >
                ${escapeHtml(
                  food.name
                )}
              </option>

            `
          )
          .join("")}

      </select>

    </div>


    <div class="form-group">

      <label for="modalFoodQuantity">
        Quantité
      </label>

      <div class="input-with-unit">

        <input
          id="modalFoodQuantity"
          type="number"
          min="1"
          step="1"
          value="100"
        >

        <span>
          g
        </span>

      </div>

    </div>


    <div class="form-group">

      <label for="modalFoodMeal">
        Repas
      </label>

      <select
        id="modalFoodMeal"
        class="select-input"
      >

        <option
          value="breakfast"
          ${meal === "breakfast" ? "selected" : ""}
        >
          🌅 Petit-déjeuner
        </option>

        <option
          value="lunch"
          ${meal === "lunch" ? "selected" : ""}
        >
          ☀️ Déjeuner
        </option>

        <option
          value="snack"
          ${meal === "snack" ? "selected" : ""}
        >
          🍎 Collation
        </option>

        <option
          value="dinner"
          ${meal === "dinner" ? "selected" : ""}
        >
          🌙 Dîner
        </option>

      </select>

    </div>


    <div
      id="foodPreview"
      class="food-preview"
    ></div>


    <div class="modal-actions">

      <button
        type="button"
        class="secondary-button"
        id="cancelFoodButton"
      >
        Annuler
      </button>

      <button
        type="button"
        class="primary-button"
        id="confirmFoodButton"
      >
        Ajouter
      </button>

    </div>

  `);


  const select =
    byId(
      "modalFoodSelect"
    );


  const quantityInput =
    byId(
      "modalFoodQuantity"
    );


  const preview =
    byId(
      "foodPreview"
    );


  const search =
    byId(
      "modalFoodSearch"
    );


  function updatePreview() {

    if (
      !select ||
      !preview
    ) {

      return;

    }


    const food =
      foods.find(
        item =>
          String(item.id) ===
          String(
            select.value
          )
      );


    if (!food) {

      preview.innerHTML =
        "";

      return;

    }


    const quantity =
      safeNumber(
        quantityInput?.value,
        100
      );


    const macros =
      calculateFoodMacros(
        food,
        quantity
      );


    preview.innerHTML = `

      <div class="macro-grid">

        <div class="macro-card">

          <span>
            🔥 Calories
          </span>

          <strong>
            ${macros.calories} kcal
          </strong>

        </div>

        <div class="macro-card">

          <span>
            💪 Protéines
          </span>

          <strong>
            ${macros.protein} g
          </strong>

        </div>

        <div class="macro-card">

          <span>
            🍚 Glucides
          </span>

          <strong>
            ${macros.carbs} g
          </strong>

        </div>

        <div class="macro-card">

          <span>
            🥑 Lipides
          </span>

          <strong>
            ${macros.fat} g
          </strong>

        </div>

      </div>

    `;

  }


  if (select) {

    select.addEventListener(
      "change",
      updatePreview
    );

  }


  if (quantityInput) {

    quantityInput.addEventListener(
      "input",
      updatePreview
    );

  }


  if (search) {

    search.addEventListener(
      "input",
      () => {

        const query =
          search.value
            .trim()
            .toLowerCase();


        Array.from(
          select.options
        ).forEach(
          option => {

            const text =
              option.textContent
                .toLowerCase();


            option.hidden =
              query.length > 0 &&
              !text.includes(
                query
              );

          }
        );

      }
    );

  }


  const cancel =
    byId(
      "cancelFoodButton"
    );


  if (cancel) {

    cancel.addEventListener(
      "click",
      closeModal
    );

  }


  const confirm =
    byId(
      "confirmFoodButton"
    );


  if (confirm) {

    confirm.addEventListener(
      "click",
      () => {

        const food =
          foods.find(
            item =>
              String(item.id) ===
              String(
                select.value
              )
          );


        const quantity =
          safeNumber(
            quantityInput.value,
            100
          );


        const selectedMeal =
          byId(
            "modalFoodMeal"
          )?.value ||
          meal;


        if (!food) {

          showToast(
            "Choisis un aliment.",
            "error"
          );

          return;

        }


        if (
          quantity <= 0
        ) {

          showToast(
            "La quantité doit être supérieure à 0.",
            "error"
          );

          return;

        }


        addFoodToJournal(
          food,
          selectedMeal,
          quantity
        );


        closeModal();

      }
    );

  }


  updatePreview();

}


/* =========================================================
   BASE D'ALIMENTS
========================================================= */

function getAvailableFoods() {

  const fromData =
    Array.isArray(
      window.FOODS
    )
      ? window.FOODS
      : [];


  const fromFoods =
    Array.isArray(
      window.foods
    )
      ? window.foods
      : [];


  let foods = [
    ...fromData,
    ...fromFoods
  ];


  /*
   * Si data.js utilise un autre
   * nom de variable, on utilise
   * une base minimale afin que
   * le bouton fonctionne quand
   * même.
   */

  if (
    foods.length === 0
  ) {

    foods = [

      {
        id: "chicken",
        name: "Poulet",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6
      },

      {
        id: "rice",
        name: "Riz cuit",
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fat: 0.3
      },

      {
        id: "egg",
        name: "Œuf",
        calories: 155,
        protein: 13,
        carbs: 1.1,
        fat: 11
      },

      {
        id: "tuna",
        name: "Thon au naturel",
        calories: 116,
        protein: 26,
        carbs: 0,
        fat: 1
      },

      {
        id: "pasta",
        name: "Pâtes cuites",
        calories: 158,
        protein: 5.8,
        carbs: 30.9,
        fat: 0.9
      },

      {
        id: "oats",
        name: "Flocons d'avoine",
        calories: 389,
        protein: 16.9,
        carbs: 66.3,
        fat: 6.9
      },

      {
        id: "banana",
        name: "Banane",
        calories: 89,
        protein: 1.1,
        carbs: 22.8,
        fat: 0.3
      },

      {
        id: "apple",
        name: "Pomme",
        calories: 52,
        protein: 0.3,
        carbs: 13.8,
        fat: 0.2
      },

      {
        id: "potato",
        name: "Pomme de terre",
        calories: 77,
        protein: 2,
        carbs: 17,
        fat: 0.1
      },

      {
        id: "bread",
        name: "Pain",
        calories: 265,
        protein: 9,
        carbs: 49,
        fat: 3.2
      },

      {
        id: "yogurt",
        name: "Yaourt nature",
        calories: 61,
        protein: 3.5,
        carbs: 4.7,
        fat: 3.3
      },

      {
        id: "milk",
        name: "Lait",
        calories: 61,
        protein: 3.2,
        carbs: 4.8,
        fat: 3.3
      }

    ];

  }


  /*
   * Normalisation des données
   * provenant de data.js.
   */

  return foods.map(
    (food, index) => {

      const normalized = {

        ...food,

        id:
          food.id ||
          `food_${index}`,

        name:
          food.name ||
          food.label ||
          "Aliment",

        calories:
          safeNumber(
            food.calories ??
            food.kcal ??
            0
          ),

        protein:
          safeNumber(
            food.protein ??
            food.proteins ??
            0
          ),

        carbs:
          safeNumber(
            food.carbs ??
            food.carbohydrates ??
            food.glucides ??
            0
          ),

        fat:
          safeNumber(
            food.fat ??
            food.fats ??
            food.lipids ??
            0
          )

      };


      return normalized;

    }
  );

}


/* =========================================================
   HTML SÉCURISÉ
========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeHtmlAttribute(
  value
) {

  return escapeHtml(
    value
  );

}


/* =========================================================
   AFFICHAGE D'UN ALIMENT DU JOURNAL
========================================================= */

function renderJournalItem(
  item
) {

  recalculateJournalItem(
    item
  );


  return `

    <div
      class="journal-item"
      data-item-id="${escapeHtmlAttribute(
        item.id
      )}"
    >

      <div class="journal-item-main">

        <div>

          <strong>
            ${escapeHtml(
              item.name
            )}
          </strong>

          <small>
            ${formatNumber(
              item.quantity
            )} g
          </small>

        </div>

      </div>


      <div class="journal-item-macros">

        <span>
          ${item.totalCalories} kcal
        </span>

        <span>
          P ${item.totalProtein} g
        </span>

        <span>
          G ${item.totalCarbs} g
        </span>

        <span>
          L ${item.totalFat} g
        </span>

      </div>


      <div class="journal-item-actions">

        <button
          type="button"
          class="icon-button journal-edit-button"
          data-action="edit-journal-item"
          data-id="${escapeHtmlAttribute(
            item.id
          )}"
          aria-label="Modifier"
        >
          ✏️
        </button>

        <button
          type="button"
          class="icon-button journal-delete-button"
          data-action="delete-journal-item"
          data-id="${escapeHtmlAttribute(
            item.id
          )}"
          aria-label="Supprimer"
        >
          🗑️
        </button>

      </div>

    </div>

  `;

}


/* =========================================================
   AFFICHAGE D'UNE SECTION REPAS
========================================================= */

function renderMealItems(
  meal
) {

  const container =
    byId(
      `${meal}Items`
    );


  if (!container) {

    return;

  }


  const items =
    getTodayJournalItemsByMeal(
      meal
    );


  if (
    items.length === 0
  ) {

    container.innerHTML = `

      <div class="meal-empty">
        Aucun aliment ajouté.
      </div>

    `;

    return;

  }


  container.innerHTML =
    items
      .map(
        renderJournalItem
      )
      .join("");

}


/* =========================================================
   RENDU DU JOURNAL
========================================================= */

function renderJournal() {

  const totals =
    calculateTodayNutrition();


  const targets =
    state.dailyTargets;


  const elements = {

    calories:
      byId(
        "journalCalories"
      ),

    caloriesTarget:
      byId(
        "journalCaloriesTarget"
      ),

    protein:
      byId(
        "journalProtein"
      ),

    proteinTarget:
      byId(
        "journalProteinTarget"
      ),

    carbs:
      byId(
        "journalCarbs"
      ),

    carbsTarget:
      byId(
        "journalCarbsTarget"
      ),

    fat:
      byId(
        "journalFat"
      ),

    fatTarget:
      byId(
        "journalFatTarget"
      )

  };


  if (
    elements.calories
  ) {

    elements.calories.textContent =
      formatNumber(
        totals.calories
      );

  }


  if (
    elements.caloriesTarget
  ) {

    elements.caloriesTarget.textContent =
      formatNumber(
        targets.calories
      );

  }


  if (
    elements.protein
  ) {

    elements.protein.textContent =
      formatNumber(
        totals.protein,
        1
      );

  }


  if (
    elements.proteinTarget
  ) {

    elements.proteinTarget.textContent =
      formatNumber(
        targets.protein
      );

  }


  if (
    elements.carbs
  ) {

    elements.carbs.textContent =
      formatNumber(
        totals.carbs,
        1
      );

  }


  if (
    elements.carbsTarget
  ) {

    elements.carbsTarget.textContent =
      formatNumber(
        targets.carbs
      );

  }


  if (
    elements.fat
  ) {

    elements.fat.textContent =
      formatNumber(
        totals.fat,
        1
      );

  }


  if (
    elements.fatTarget
  ) {

    elements.fatTarget.textContent =
      formatNumber(
        targets.fat
      );

  }


  const meals = [

    "breakfast",

    "lunch",

    "snack",

    "dinner"

  ];


  meals.forEach(
    meal => {

      renderMealItems(
        meal
      );


      const mealTotals =
        getMealTotals(
          meal
        );


      const caloriesElement =
        byId(
          `${meal}Calories`
        );


      if (
        caloriesElement
      ) {

        caloriesElement.textContent =
          `${formatNumber(
            mealTotals.calories
          )} kcal`;

      }

    }
  );


  setupJournalItemActions();

}


/* =========================================================
   MODIFIER UN ALIMENT
========================================================= */

function editJournalItem(
  itemId
) {

  const item =
    getJournalItems()
      .find(
        entry =>
          entry.id ===
          itemId
      );


  if (!item) {

    return;

  }


  openModal(`

    <div class="modal-header">

      <p class="eyebrow">
        JOURNAL
      </p>

      <h2>
        Modifier ${escapeHtml(
          item.name
        )}
      </h2>

    </div>


    <div class="form-group">

      <label for="editFoodQuantity">
        Quantité
      </label>

      <div class="input-with-unit">

        <input
          id="editFoodQuantity"
          type="number"
          min="1"
          step="1"
          value="${item.quantity}"
        >

        <span>
          g
        </span>

      </div>

    </div>


    <div class="modal-actions">

      <button
        type="button"
        class="secondary-button"
        id="cancelEditFood"
      >
        Annuler
      </button>

      <button
        type="button"
        class="primary-button"
        id="saveEditFood"
      >
        Enregistrer
      </button>

    </div>

  `);


  byId(
    "cancelEditFood"
  )?.addEventListener(
    "click",
    closeModal
  );


  byId(
    "saveEditFood"
  )?.addEventListener(
    "click",
    () => {

      const quantity =
        safeNumber(
          byId(
            "editFoodQuantity"
          )?.value,
          0
        );


      if (
        quantity <= 0
      ) {

        showToast(
          "Quantité invalide.",
          "error"
        );

        return;

      }


      updateJournalItemQuantity(
        itemId,
        quantity
      );


      closeModal();

    }
  );

}


/* =========================================================
   ACTIONS DES ALIMENTS
========================================================= */

function setupJournalItemActions() {

  $$(
    '[data-action="edit-journal-item"]'
  ).forEach(
    button => {

      button.onclick =
        () => {

          editJournalItem(
            button.dataset.id
          );

        };

    }
  );


  $$(
    '[data-action="delete-journal-item"]'
  ).forEach(
    button => {

      button.onclick =
        () => {

          const confirmed =
            window.confirm(
              "Supprimer cet aliment du journal ?"
            );


          if (
            confirmed
          ) {

            removeJournalItem(
              button.dataset.id
            );

          }

        };

    }
  );

}


/* =========================================================
   BOUTONS DU JOURNAL
========================================================= */

function setupJournal() {

  const mainAdd =
    byId(
      "journalAddButton"
    );


  if (mainAdd) {

    mainAdd.addEventListener(
      "click",
      () => {

        openAddFoodModal(
          "lunch"
        );

      }
    );

  }


  $$(
    ".add-small-button"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          openAddFoodModal(
            button.dataset.meal ||
            "lunch"
          );

        }
      );

    }
  );


  const homeAdd =
    byId(
      "addMealButton"
    );


  if (homeAdd) {

    homeAdd.addEventListener(
      "click",
      () => {

        openAddFoodModal(
          "lunch"
        );

      }
    );

  }


  const quickAdd =
    byId(
      "quickAddButton"
    );


  if (quickAdd) {

    quickAdd.addEventListener(
      "click",
      () => {

        openAddFoodModal(
          "lunch"
        );

      }
    );

  }

}

/* =========================================================
   BLOC 5 — JOURNAL / REPAS / CALCULS QUOTIDIENS
========================================================= */

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* ---------------------------------------------------------
   JOURNAL DU JOUR
--------------------------------------------------------- */

function getTodayJournal() {
  const key = getTodayKey();

  if (!Array.isArray(state.journal)) {
    state.journal = [];
  }

  let journal = state.journal.find(item => item.date === key);

  if (!journal) {
    journal = {
      date: key,
      meals: {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: []
      }
    };

    state.journal.push(journal);
    saveState();
  }

  if (!journal.meals) {
    journal.meals = {};
  }

  journal.meals.breakfast ??= [];
  journal.meals.lunch ??= [];
  journal.meals.snack ??= [];
  journal.meals.dinner ??= [];

  return journal;
}


/* ---------------------------------------------------------
   NORMALISATION ALIMENT
--------------------------------------------------------- */

function normalizeFood(food, quantity = 100) {

  const q = Number(quantity) || 100;
  const factor = q / 100;

  return {
    id: food.id || generateId("food"),
    name: food.name || food.title || "Aliment",
    quantity: q,

    calories: roundNumber(
      Number(food.calories || food.kcal || 0) * factor
    ),

    protein: roundNumber(
      Number(food.protein || food.proteins || 0) * factor
    ),

    carbs: roundNumber(
      Number(food.carbs || food.carbohydrates || 0) * factor
    ),

    fat: roundNumber(
      Number(food.fat || food.fats || 0) * factor
    ),

    price: roundNumber(
      Number(food.price || 0) * factor
    ),

    category: food.category || "Autre",

    originalPer100: {
      calories: Number(food.calories || food.kcal || 0),
      protein: Number(food.protein || food.proteins || 0),
      carbs: Number(food.carbs || food.carbohydrates || 0),
      fat: Number(food.fat || food.fats || 0),
      price: Number(food.price || 0)
    }
  };
}


/* ---------------------------------------------------------
   AJOUTER UN ALIMENT AU JOURNAL
--------------------------------------------------------- */

function addFoodToJournal(food, meal = "lunch", quantity = 100) {

  const validMeals = [
    "breakfast",
    "lunch",
    "snack",
    "dinner"
  ];

  if (!validMeals.includes(meal)) {
    meal = "lunch";
  }

  const journal = getTodayJournal();

  const item = normalizeFood(food, quantity);

  journal.meals[meal].push(item);

  saveState();
  updateAllUI();

  showToast(
    `${item.name} ajouté au ${getMealLabel(meal)}`
  );
}


/* ---------------------------------------------------------
   SUPPRIMER UN ALIMENT
--------------------------------------------------------- */

function removeFoodFromJournal(meal, itemId) {

  const journal = getTodayJournal();

  if (!journal.meals[meal]) {
    return;
  }

  const index = journal.meals[meal].findIndex(
    item => item.id === itemId
  );

  if (index === -1) {
    return;
  }

  const removed = journal.meals[meal][index];

  journal.meals[meal].splice(index, 1);

  saveState();
  updateAllUI();

  showToast(`${removed.name} supprimé`);
}


/* ---------------------------------------------------------
   MODIFIER LA QUANTITÉ
--------------------------------------------------------- */

function updateFoodQuantity(meal, itemId, quantity) {

  const journal = getTodayJournal();

  if (!journal.meals[meal]) {
    return;
  }

  const item = journal.meals[meal].find(
    food => food.id === itemId
  );

  if (!item) {
    return;
  }

  const newQuantity = Math.max(
    1,
    Number(quantity) || 1
  );

  const original = item.originalPer100 || {};

  const factor = newQuantity / 100;

  item.quantity = newQuantity;

  item.calories = roundNumber(
    Number(original.calories || 0) * factor
  );

  item.protein = roundNumber(
    Number(original.protein || 0) * factor
  );

  item.carbs = roundNumber(
    Number(original.carbs || 0) * factor
  );

  item.fat = roundNumber(
    Number(original.fat || 0) * factor
  );

  item.price = roundNumber(
    Number(original.price || 0) * factor
  );

  saveState();
  updateAllUI();
}


/* ---------------------------------------------------------
   TOTALS D'UN REPAS
--------------------------------------------------------- */

function calculateMealTotals(mealItems = []) {

  return mealItems.reduce(
    (total, item) => {

      total.calories += Number(item.calories || 0);
      total.protein += Number(item.protein || 0);
      total.carbs += Number(item.carbs || 0);
      total.fat += Number(item.fat || 0);
      total.price += Number(item.price || 0);

      return total;

    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      price: 0
    }
  );
}


/* ---------------------------------------------------------
   TOTALS DU JOUR
--------------------------------------------------------- */

function calculateTodayTotals() {

  const journal = getTodayJournal();

  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    price: 0
  };

  Object.values(journal.meals).forEach(mealItems => {

    const mealTotals = calculateMealTotals(mealItems);

    totals.calories += mealTotals.calories;
    totals.protein += mealTotals.protein;
    totals.carbs += mealTotals.carbs;
    totals.fat += mealTotals.fat;
    totals.price += mealTotals.price;

  });

  return {
    calories: roundNumber(totals.calories),
    protein: roundNumber(totals.protein),
    carbs: roundNumber(totals.carbs),
    fat: roundNumber(totals.fat),
    price: roundNumber(totals.price)
  };
}


/* ---------------------------------------------------------
   MISE À JOUR DU JOURNAL
--------------------------------------------------------- */

function updateJournalUI() {

  const journal = getTodayJournal();

  const totals = calculateTodayTotals();

  const targets = getNutritionTargets();


  /* -----------------------------
     RÉSUMÉ
  ----------------------------- */

  setText(
    "journalCalories",
    formatNumber(totals.calories)
  );

  setText(
    "journalCaloriesTarget",
    formatNumber(targets.calories)
  );

  setText(
    "journalProtein",
    formatNumber(totals.protein)
  );

  setText(
    "journalProteinTarget",
    formatNumber(targets.protein)
  );

  setText(
    "journalCarbs",
    formatNumber(totals.carbs)
  );

  setText(
    "journalCarbsTarget",
    formatNumber(targets.carbs)
  );

  setText(
    "journalFat",
    formatNumber(totals.fat)
  );

  setText(
    "journalFatTarget",
    formatNumber(targets.fat)
  );


  /* -----------------------------
     CHAQUE REPAS
  ----------------------------- */

  renderMealItems(
    "breakfast",
    journal.meals.breakfast
  );

  renderMealItems(
    "lunch",
    journal.meals.lunch
  );

  renderMealItems(
    "snack",
    journal.meals.snack
  );

  renderMealItems(
    "dinner",
    journal.meals.dinner
  );


  /* -----------------------------
     CALORIES PAR REPAS
  ----------------------------- */

  updateMealCalories(
    "breakfast",
    journal.meals.breakfast
  );

  updateMealCalories(
    "lunch",
    journal.meals.lunch
  );

  updateMealCalories(
    "snack",
    journal.meals.snack
  );

  updateMealCalories(
    "dinner",
    journal.meals.dinner
  );
}


/* ---------------------------------------------------------
   RENDU DES ALIMENTS
--------------------------------------------------------- */

function renderMealItems(meal, items) {

  const container = document.getElementById(
    `${meal}Items`
  );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!items || items.length === 0) {

    container.innerHTML = `
      <div class="meal-empty">
        Aucun aliment ajouté
      </div>
    `;

    return;
  }


  items.forEach(item => {

    const element = document.createElement("div");

    element.className = "meal-item";

    element.innerHTML = `
      <div class="meal-item-main">

        <div class="meal-item-icon">
          🍽️
        </div>

        <div class="meal-item-info">

          <strong>
            ${escapeHTML(item.name)}
          </strong>

          <span>
            ${formatNumber(item.quantity)} g
          </span>

        </div>

      </div>

      <div class="meal-item-macros">

        <span>
          ${formatNumber(item.calories)} kcal
        </span>

        <small>
          P ${formatNumber(item.protein)}g
        </small>

        <small>
          G ${formatNumber(item.carbs)}g
        </small>

        <small>
          L ${formatNumber(item.fat)}g
        </small>

      </div>

      <div class="meal-item-actions">

        <button
          class="icon-button-small"
          data-action="edit-food"
          data-meal="${meal}"
          data-id="${item.id}"
          title="Modifier"
        >
          ✏️
        </button>

        <button
          class="icon-button-small danger"
          data-action="remove-food"
          data-meal="${meal}"
          data-id="${item.id}"
          title="Supprimer"
        >
          🗑️
        </button>

      </div>
    `;

    container.appendChild(element);

  });
}


/* ---------------------------------------------------------
   CALORIES D'UN REPAS
--------------------------------------------------------- */

function updateMealCalories(meal, items) {

  const element = document.getElementById(
    `${meal}Calories`
  );

  if (!element) {
    return;
  }

  const totals = calculateMealTotals(items);

  element.textContent =
    `${formatNumber(totals.calories)} kcal`;
}


/* ---------------------------------------------------------
   LABEL DES REPAS
--------------------------------------------------------- */

function getMealLabel(meal) {

  const labels = {
    breakfast: "petit-déjeuner",
    lunch: "déjeuner",
    snack: "collation",
    dinner: "dîner"
  };

  return labels[meal] || "repas";
}


/* ---------------------------------------------------------
   MODALE — CHOIX ALIMENT
--------------------------------------------------------- */

function openFoodPicker(meal = "lunch") {

  openModal(`
    <div class="modal-header-content">

      <span class="eyebrow">
        AJOUTER UN ALIMENT
      </span>

      <h2>
        Ajouter au ${getMealLabel(meal)}
      </h2>

      <p>
        Choisis un aliment puis indique la quantité.
      </p>

    </div>

    <div class="food-picker-search">

      <input
        id="foodPickerSearch"
        class="search-input"
        type="search"
        placeholder="🔎 Rechercher un aliment..."
        autocomplete="off"
      >

    </div>

    <div
      id="foodPickerResults"
      class="food-picker-results"
    ></div>
  `);

  renderFoodPickerResults(meal);

  const search = document.getElementById(
    "foodPickerSearch"
  );

  if (search) {

    search.addEventListener(
      "input",
      () => renderFoodPickerResults(meal)
    );

    setTimeout(() => search.focus(), 50);
  }
}


/* ---------------------------------------------------------
   RÉSULTATS ALIMENTS
--------------------------------------------------------- */

function renderFoodPickerResults(meal) {

  const container = document.getElementById(
    "foodPickerResults"
  );

  if (!container) {
    return;
  }

  const searchInput = document.getElementById(
    "foodPickerSearch"
  );

  const query = (
    searchInput?.value || ""
  ).trim().toLowerCase();


  const foods = getAvailableFoods();

  const filtered = foods
    .filter(food => {

      if (!query) {
        return true;
      }

      return String(food.name || "")
        .toLowerCase()
        .includes(query);

    })
    .slice(0, 30);


  if (filtered.length === 0) {

    container.innerHTML = `
      <div class="empty-state compact">

        <div class="empty-icon">
          🔎
        </div>

        <h3>
          Aucun aliment trouvé
        </h3>

        <p>
          Essaie une autre recherche.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML = filtered.map(food => `

    <button
      class="food-picker-item"
      data-food-id="${food.id}"
      data-meal="${meal}"
    >

      <div class="food-picker-icon">
        ${food.emoji || "🍽️"}
      </div>

      <div class="food-picker-info">

        <strong>
          ${escapeHTML(food.name)}
        </strong>

        <span>
          ${formatNumber(food.calories || 0)} kcal
          ·
          P ${formatNumber(food.protein || 0)}g
          ·
          G ${formatNumber(food.carbs || 0)}g
          ·
          L ${formatNumber(food.fat || 0)}g
        </span>

      </div>

      <span class="food-picker-arrow">
        →
      </span>

    </button>

  `).join("");
}


/* ---------------------------------------------------------
   QUANTITÉ ALIMENT
--------------------------------------------------------- */

function openFoodQuantityModal(food, meal) {

  openModal(`
    <div class="modal-header-content">

      <span class="eyebrow">
        ${getMealLabel(meal).toUpperCase()}
      </span>

      <h2>
        ${escapeHTML(food.name)}
      </h2>

      <p>
        Indique la quantité que tu veux ajouter.
      </p>

    </div>

    <div class="quantity-form">

      <label for="foodQuantity">
        Quantité
      </label>

      <div class="input-with-unit">

        <input
          id="foodQuantity"
          type="number"
          min="1"
          step="1"
          value="100"
        >

        <span>
          g
        </span>

      </div>

    </div>

    <div
      id="quantityPreview"
      class="macro-calculation-box"
    ></div>

    <div class="modal-actions">

      <button
        class="secondary-button"
        id="cancelQuantityButton"
      >
        Annuler
      </button>

      <button
        class="primary-button"
        id="confirmQuantityButton"
      >
        Ajouter
      </button>

    </div>
  `);


  const quantityInput = document.getElementById(
    "foodQuantity"
  );

  const preview = document.getElementById(
    "quantityPreview"
  );


  function updatePreview() {

    const quantity =
      Math.max(
        1,
        Number(quantityInput?.value) || 100
      );

    const normalized =
      normalizeFood(food, quantity);

    if (!preview) {
      return;
    }

    preview.innerHTML = `

      <div>
        <span>Calories</span>
        <strong>
          ${formatNumber(normalized.calories)} kcal
        </strong>
      </div>

      <div>
        <span>Protéines</span>
        <strong>
          ${formatNumber(normalized.protein)} g
        </strong>
      </div>

      <div>
        <span>Glucides</span>
        <strong>
          ${formatNumber(normalized.carbs)} g
        </strong>
      </div>

      <div>
        <span>Lipides</span>
        <strong>
          ${formatNumber(normalized.fat)} g
        </strong>
      </div>

    `;
  }


  quantityInput?.addEventListener(
    "input",
    updatePreview
  );


  document
    .getElementById("cancelQuantityButton")
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById("confirmQuantityButton")
    ?.addEventListener(
      "click",
      () => {

        const quantity =
          Math.max(
            1,
            Number(quantityInput?.value) || 100
          );

        addFoodToJournal(
          food,
          meal,
          quantity
        );

        closeModal();
      }
    );


  updatePreview();

  setTimeout(() => {
    quantityInput?.focus();
    quantityInput?.select();
  }, 50);
}


/* ---------------------------------------------------------
   MODIFIER UN ALIMENT
--------------------------------------------------------- */

function openEditFoodModal(meal, itemId) {

  const journal = getTodayJournal();

  const item = journal.meals[meal]?.find(
    food => food.id === itemId
  );

  if (!item) {
    return;
  }

  openModal(`
    <div class="modal-header-content">

      <span class="eyebrow">
        MODIFIER
      </span>

      <h2>
        ${escapeHTML(item.name)}
      </h2>

      <p>
        Modifie la quantité de cet aliment.
      </p>

    </div>

    <div class="quantity-form">

      <label for="editFoodQuantity">
        Quantité
      </label>

      <div class="input-with-unit">

        <input
          id="editFoodQuantity"
          type="number"
          min="1"
          step="1"
          value="${Number(item.quantity) || 100}"
        >

        <span>
          g
        </span>

      </div>

    </div>

    <div
      id="editQuantityPreview"
      class="macro-calculation-box"
    ></div>

    <div class="modal-actions">

      <button
        class="secondary-button"
        id="cancelEditFoodButton"
      >
        Annuler
      </button>

      <button
        class="primary-button"
        id="saveEditFoodButton"
      >
        Enregistrer
      </button>

    </div>
  `);


  const input = document.getElementById(
    "editFoodQuantity"
  );

  const preview = document.getElementById(
    "editQuantityPreview"
  );


  function updateEditPreview() {

    const quantity =
      Math.max(
        1,
        Number(input?.value) || 100
      );

    const original =
      item.originalPer100 || {};

    const factor =
      quantity / 100;

    const calories =
      Number(original.calories || 0) * factor;

    const protein =
      Number(original.protein || 0) * factor;

    const carbs =
      Number(original.carbs || 0) * factor;

    const fat =
      Number(original.fat || 0) * factor;


    if (!preview) {
      return;
    }

    preview.innerHTML = `

      <div>
        <span>Calories</span>
        <strong>
          ${formatNumber(calories)} kcal
        </strong>
      </div>

      <div>
        <span>Protéines</span>
        <strong>
          ${formatNumber(protein)} g
        </strong>
      </div>

      <div>
        <span>Glucides</span>
        <strong>
          ${formatNumber(carbs)} g
        </strong>
      </div>

      <div>
        <span>Lipides</span>
        <strong>
          ${formatNumber(fat)} g
        </strong>
      </div>

    `;
  }


  input?.addEventListener(
    "input",
    updateEditPreview
  );


  document
    .getElementById("cancelEditFoodButton")
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById("saveEditFoodButton")
    ?.addEventListener(
      "click",
      () => {

        const quantity =
          Math.max(
            1,
            Number(input?.value) || 100
          );

        updateFoodQuantity(
          meal,
          itemId,
          quantity
        );

        closeModal();
      }
    );


  updateEditPreview();

  setTimeout(() => {
    input?.focus();
    input?.select();
  }, 50);
}


/* ---------------------------------------------------------
   ALIMENTS DISPONIBLES
--------------------------------------------------------- */

function getAvailableFoods() {

  const sources = [];

  if (Array.isArray(window.foods)) {
    sources.push(...window.foods);
  }

  if (Array.isArray(window.FOODS)) {
    sources.push(...window.FOODS);
  }

  if (Array.isArray(window.foodDatabase)) {
    sources.push(...window.foodDatabase);
  }

  if (Array.isArray(window.foodsDatabase)) {
    sources.push(...window.foodsDatabase);
  }

  if (typeof DATA !== "undefined") {

    if (Array.isArray(DATA.foods)) {
      sources.push(...DATA.foods);
    }

  }


  const unique = new Map();

  sources.forEach(food => {

    if (!food) {
      return;
    }

    const id =
      food.id ||
      slugify(food.name || food.title || generateId("food"));

    if (!unique.has(id)) {

      unique.set(
        id,
        {
          ...food,
          id
        }
      );

    }

  });


  return Array.from(unique.values());
}


/* ---------------------------------------------------------
   GÉNÉRATION DE LA JOURNÉE
--------------------------------------------------------- */

function generateTodayPlan() {

  const targets = getNutritionTargets();

  const foods = getAvailableFoods();

  if (!foods.length) {

    showToast(
      "Aucun aliment disponible pour générer la journée."
    );

    return;
  }


  const highProtein =
    foods.filter(
      food =>
        Number(food.protein || 0) >= 15
    );


  const candidates =
    highProtein.length
      ? highProtein
      : foods;


  const selected = [];


  for (let i = 0; i < 12; i++) {

    const food =
      candidates[
        Math.floor(
          Math.random() * candidates.length
        )
      ];

    if (food) {
      selected.push(food);
    }

  }


  const journal = getTodayJournal();

  journal.meals = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  };


  const mealNames = [
    "breakfast",
    "lunch",
    "snack",
    "dinner"
  ];


  let calorieTotal = 0;


  selected.forEach((food, index) => {

    const meal =
      mealNames[index % mealNames.length];

    let quantity = 100;


    if (food.calories) {

      const desired =
        targets.calories /
        Math.max(
          1,
          selected.length
        );

      quantity =
        Math.round(
          (desired /
            Number(food.calories)) *
            100
        );

      quantity =
        Math.max(
          20,
          Math.min(
            500,
            quantity
          )
        );
    }


    const item =
      normalizeFood(
        food,
        quantity
      );

    journal.meals[meal].push(item);

    calorieTotal +=
      Number(item.calories || 0);
  });


  saveState();
  updateAllUI();

  showToast(
    `Journée générée — ${formatNumber(calorieTotal)} kcal`
  );

}


/* ---------------------------------------------------------
   FIN DU BLOC 5
--------------------------------------------------------- */

/* =========================================================
   BLOC 6 — RECETTES / CRÉATION / RECHERCHE / FILTRES
========================================================= */


/* ---------------------------------------------------------
   RÉCUPÉRER LES RECETTES
--------------------------------------------------------- */

function getRecipes() {

  if (!Array.isArray(state.recipes)) {
    state.recipes = [];
  }

  /*
   * On ajoute les recettes présentes dans data.js
   * uniquement si elles n'existent pas déjà dans le state.
   */

  const sources = [];

  if (Array.isArray(window.recipes)) {
    sources.push(...window.recipes);
  }

  if (Array.isArray(window.RECIPES)) {
    sources.push(...window.RECIPES);
  }

  if (typeof DATA !== "undefined") {

    if (Array.isArray(DATA.recipes)) {
      sources.push(...DATA.recipes);
    }

  }

  sources.forEach(recipe => {

    if (!recipe) {
      return;
    }

    const id =
      recipe.id ||
      slugify(
        recipe.name ||
        recipe.title ||
        generateId("recipe")
      );

    const exists =
      state.recipes.some(
        existing => existing.id === id
      );

    if (!exists) {

      state.recipes.push({
        id,
        name:
          recipe.name ||
          recipe.title ||
          "Recette",

        description:
          recipe.description || "",

        category:
          recipe.category || "Autre",

        goal:
          recipe.goal || "all",

        calories:
          Number(recipe.calories || 0),

        protein:
          Number(
            recipe.protein ||
            recipe.proteins ||
            0
          ),

        carbs:
          Number(
            recipe.carbs ||
            recipe.carbohydrates ||
            0
          ),

        fat:
          Number(
            recipe.fat ||
            recipe.fats ||
            0
          ),

        price:
          Number(recipe.price || 0),

        servings:
          Number(recipe.servings || 1),

        prepTime:
          Number(
            recipe.prepTime ||
            recipe.time ||
            0
          ),

        image:
          recipe.image || "",

        emoji:
          recipe.emoji || "🍽️",

        ingredients:
          Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : [],

        instructions:
          Array.isArray(recipe.instructions)
            ? recipe.instructions
            : [],

        createdBy:
          recipe.createdBy || "BudgetCook"
      });

    }

  });

  return state.recipes;
}


/* ---------------------------------------------------------
   AFFICHER LES RECETTES
--------------------------------------------------------- */

function renderRecipes() {

  const container =
    document.getElementById("recipesGrid");

  if (!container) {
    return;
  }

  const recipes = getRecipes();

  const search =
    (
      document.getElementById("recipeSearch")
        ?.value || ""
    )
      .trim()
      .toLowerCase();

  const goal =
    document.getElementById(
      "recipeGoalFilter"
    )?.value || "all";


  let filtered = recipes.filter(recipe => {

    const name =
      String(recipe.name || "")
        .toLowerCase();

    const description =
      String(recipe.description || "")
        .toLowerCase();

    const matchesSearch =
      !search ||
      name.includes(search) ||
      description.includes(search);

    const matchesGoal =
      goal === "all" ||
      recipe.goal === goal ||
      (
        goal === "high-protein" &&
        Number(recipe.protein || 0) >= 30
      ) ||
      (
        goal === "low-calorie" &&
        Number(recipe.calories || 0) <= 500
      ) ||
      (
        goal === "budget" &&
        Number(recipe.price || 0) <= 3
      );

    return (
      matchesSearch &&
      matchesGoal
    );

  });


  if (!filtered.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          🍳
        </div>

        <h3>
          Aucune recette trouvée
        </h3>

        <p>
          Essaie une autre recherche ou crée ta propre recette.
        </p>

        <button
          class="primary-button"
          id="emptyCreateRecipeButton"
        >
          + Créer une recette
        </button>

      </div>
    `;

    document
      .getElementById("emptyCreateRecipeButton")
      ?.addEventListener(
        "click",
        openCreateRecipeModal
      );

    return;
  }


  container.innerHTML =
    filtered
      .map(recipe => renderRecipeCard(recipe))
      .join("");
}


/* ---------------------------------------------------------
   CARTE RECETTE
--------------------------------------------------------- */

function renderRecipeCard(recipe) {

  const calories =
    Number(recipe.calories || 0);

  const protein =
    Number(recipe.protein || 0);

  const carbs =
    Number(recipe.carbs || 0);

  const fat =
    Number(recipe.fat || 0);

  const price =
    Number(recipe.price || 0);


  const goalLabel =
    getRecipeGoalLabel(recipe.goal);


  return `
    <article
      class="recipe-card"
      data-recipe-id="${recipe.id}"
    >

      <div class="recipe-card-image">

        ${
          recipe.image
            ? `
              <img
                src="${escapeHTML(recipe.image)}"
                alt="${escapeHTML(recipe.name)}"
                loading="lazy"
              >
            `
            : `
              <span class="recipe-placeholder">
                ${recipe.emoji || "🍽️"}
              </span>
            `
        }

        <span class="recipe-goal-badge">
          ${escapeHTML(goalLabel)}
        </span>

      </div>


      <div class="recipe-card-content">

        <h3>
          ${escapeHTML(recipe.name)}
        </h3>

        <p>
          ${escapeHTML(
            recipe.description ||
            "Une recette adaptée à ton objectif."
          )}
        </p>


        <div class="recipe-macros">

          <span>
            🔥 ${formatNumber(calories)} kcal
          </span>

          <span>
            💪 ${formatNumber(protein)} g P
          </span>

          <span>
            🍚 ${formatNumber(carbs)} g G
          </span>

          <span>
            🥑 ${formatNumber(fat)} g L
          </span>

        </div>


        <div class="recipe-card-footer">

          <span class="recipe-price">
            💰 ${formatCurrency(price)}
          </span>

          <span class="recipe-time">
            ⏱️ ${formatNumber(recipe.prepTime || 0)} min
          </span>

        </div>


        <div class="recipe-card-actions">

          <button
            class="secondary-button"
            data-action="view-recipe"
            data-id="${recipe.id}"
          >
            Voir
          </button>

          <button
            class="primary-button"
            data-action="add-recipe"
            data-id="${recipe.id}"
          >
            Ajouter
          </button>

        </div>

      </div>

    </article>
  `;
}


/* ---------------------------------------------------------
   LABEL OBJECTIF
--------------------------------------------------------- */

function getRecipeGoalLabel(goal) {

  const labels = {

    "high-protein":
      "Riche en protéines",

    "low-calorie":
      "Faible en calories",

    "budget":
      "Petit budget",

    "cut":
      "Perte de graisse",

    "recomp":
      "Recomposition",

    "maintain":
      "Maintien",

    "bulk":
      "Prise de masse",

    "all":
      "Tous objectifs"

  };

  return labels[goal] || "Tous objectifs";
}


/* ---------------------------------------------------------
   MODALE DÉTAILS RECETTE
--------------------------------------------------------- */

function openRecipeDetails(recipeId) {

  const recipe =
    getRecipes().find(
      item => item.id === recipeId
    );

  if (!recipe) {
    showToast("Recette introuvable");
    return;
  }


  const ingredients =
    Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : [];


  const instructions =
    Array.isArray(recipe.instructions)
      ? recipe.instructions
      : [];


  openModal(`

    <div class="recipe-detail">

      <div class="recipe-detail-header">

        <div class="recipe-detail-icon">
          ${recipe.emoji || "🍽️"}
        </div>

        <div>

          <span class="eyebrow">
            RECETTE
          </span>

          <h2>
            ${escapeHTML(recipe.name)}
          </h2>

          <p>
            ${escapeHTML(
              recipe.description || ""
            )}
          </p>

        </div>

      </div>


      <div class="recipe-detail-stats">

        <div>
          <span>Calories</span>
          <strong>
            ${formatNumber(recipe.calories || 0)} kcal
          </strong>
        </div>

        <div>
          <span>Protéines</span>
          <strong>
            ${formatNumber(recipe.protein || 0)} g
          </strong>
        </div>

        <div>
          <span>Glucides</span>
          <strong>
            ${formatNumber(recipe.carbs || 0)} g
          </strong>
        </div>

        <div>
          <span>Lipides</span>
          <strong>
            ${formatNumber(recipe.fat || 0)} g
          </strong>
        </div>

        <div>
          <span>Prix</span>
          <strong>
            ${formatCurrency(recipe.price || 0)}
          </strong>
        </div>

      </div>


      <div class="recipe-detail-section">

        <h3>
          🥕 Ingrédients
        </h3>

        ${
          ingredients.length
            ? `
              <ul class="ingredient-list">

                ${ingredients
                  .map(
                    ingredient => `
                      <li>
                        ${
                          typeof ingredient === "string"
                            ? escapeHTML(ingredient)
                            : `
                              <span>
                                ${escapeHTML(
                                  ingredient.name || "Aliment"
                                )}
                              </span>

                              <strong>
                                ${
                                  ingredient.quantity
                                    ? `${ingredient.quantity} ${ingredient.unit || "g"}`
                                    : ""
                                }
                              </strong>
                            `
                        }
                      </li>
                    `
                  )
                  .join("")}

              </ul>
            `
            : `
              <p class="muted">
                Aucun ingrédient renseigné.
              </p>
            `
        }

      </div>


      <div class="recipe-detail-section">

        <h3>
          👨‍🍳 Préparation
        </h3>

        ${
          instructions.length
            ? `
              <ol class="instruction-list">

                ${instructions
                  .map(
                    instruction => `
                      <li>
                        ${escapeHTML(
                          typeof instruction === "string"
                            ? instruction
                            : instruction.text || ""
                        )}
                      </li>
                    `
                  )
                  .join("")}

              </ol>
            `
            : `
              <p class="muted">
                Aucune instruction renseignée.
              </p>
            `
        }

      </div>


      <div class="modal-actions">

        <button
          class="secondary-button"
          id="recipeDetailCloseButton"
        >
          Fermer
        </button>

        <button
          class="primary-button"
          id="recipeDetailAddButton"
        >
          + Ajouter au journal
        </button>

      </div>

    </div>

  `);


  document
    .getElementById(
      "recipeDetailCloseButton"
    )
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById(
      "recipeDetailAddButton"
    )
    ?.addEventListener(
      "click",
      () => {

        openRecipeAddModal(recipe);

      }
    );
}


/* ---------------------------------------------------------
   AJOUTER UNE RECETTE AU JOURNAL
--------------------------------------------------------- */

function openRecipeAddModal(recipe) {

  openModal(`

    <div class="modal-header-content">

      <span class="eyebrow">
        AJOUTER UNE RECETTE
      </span>

      <h2>
        ${escapeHTML(recipe.name)}
      </h2>

      <p>
        Choisis le repas auquel tu veux l'ajouter.
      </p>

    </div>


    <div class="form-group">

      <label for="recipeMealSelect">
        Repas
      </label>

      <select id="recipeMealSelect">

        <option value="breakfast">
          🌅 Petit-déjeuner
        </option>

        <option value="lunch" selected>
          ☀️ Déjeuner
        </option>

        <option value="snack">
          🍎 Collation
        </option>

        <option value="dinner">
          🌙 Dîner
        </option>

      </select>

    </div>


    <div class="recipe-add-preview">

      <div>
        <span>Calories</span>
        <strong>
          ${formatNumber(recipe.calories || 0)} kcal
        </strong>
      </div>

      <div>
        <span>Protéines</span>
        <strong>
          ${formatNumber(recipe.protein || 0)} g
        </strong>
      </div>

      <div>
        <span>Glucides</span>
        <strong>
          ${formatNumber(recipe.carbs || 0)} g
        </strong>
      </div>

      <div>
        <span>Lipides</span>
        <strong>
          ${formatNumber(recipe.fat || 0)} g
        </strong>
      </div>

    </div>


    <div class="modal-actions">

      <button
        class="secondary-button"
        id="cancelRecipeAddButton"
      >
        Annuler
      </button>

      <button
        class="primary-button"
        id="confirmRecipeAddButton"
      >
        Ajouter
      </button>

    </div>

  `);


  document
    .getElementById(
      "cancelRecipeAddButton"
    )
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById(
      "confirmRecipeAddButton"
    )
    ?.addEventListener(
      "click",
      () => {

        const meal =
          document.getElementById(
            "recipeMealSelect"
          )?.value || "lunch";


        const journal =
          getTodayJournal();


        const item = {

          id:
            generateId("recipe"),

          name:
            recipe.name,

          quantity:
            1,

          calories:
            Number(recipe.calories || 0),

          protein:
            Number(recipe.protein || 0),

          carbs:
            Number(recipe.carbs || 0),

          fat:
            Number(recipe.fat || 0),

          price:
            Number(recipe.price || 0),

          category:
            "Recette",

          recipeId:
            recipe.id,

          originalPer100: {

            calories:
              Number(recipe.calories || 0),

            protein:
              Number(recipe.protein || 0),

            carbs:
              Number(recipe.carbs || 0),

            fat:
              Number(recipe.fat || 0),

            price:
              Number(recipe.price || 0)

          }

        };


        journal.meals[meal].push(item);

        saveState();
        updateAllUI();

        closeModal();

        showToast(
          `${recipe.name} ajouté au ${getMealLabel(meal)}`
        );

      }
    );
}


/* ---------------------------------------------------------
   CRÉER UNE RECETTE
--------------------------------------------------------- */

function openCreateRecipeModal() {

  openModal(`

    <div class="modal-header-content">

      <span class="eyebrow">
        NOUVELLE RECETTE
      </span>

      <h2>
        Créer une recette
      </h2>

      <p>
        Crée une recette personnalisée avec ses macros et son prix.
      </p>

    </div>


    <div class="form-grid">

      <div class="form-group">

        <label for="newRecipeName">
          Nom
        </label>

        <input
          id="newRecipeName"
          type="text"
          placeholder="Ex : Poulet riz légumes"
        >

      </div>


      <div class="form-group">

        <label for="newRecipeCalories">
          Calories
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeCalories"
            type="number"
            min="0"
            step="1"
            value="0"
          >

          <span>
            kcal
          </span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeProtein">
          Protéines
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeProtein"
            type="number"
            min="0"
            step="0.1"
            value="0"
          >

          <span>
            g
          </span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeCarbs">
          Glucides
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeCarbs"
            type="number"
            min="0"
            step="0.1"
            value="0"
          >

          <span>
            g
          </span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeFat">
          Lipides
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeFat"
            type="number"
            min="0"
            step="0.1"
            value="0"
          >

          <span>
            g
          </span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipePrice">
          Prix
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipePrice"
            type="number"
            min="0"
            step="0.01"
            value="0"
          >

          <span>
            €
          </span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeTime">
          Temps de préparation
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeTime"
            type="number"
            min="0"
            step="1"
            value="15"
          >

          <span>
            min
          </span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeGoal">
          Objectif
        </label>

        <select id="newRecipeGoal">

          <option value="all">
            Tous objectifs
          </option>

          <option value="high-protein">
            Riche en protéines
          </option>

          <option value="low-calorie">
            Faible en calories
          </option>

          <option value="budget">
            Petit budget
          </option>

          <option value="cut">
            Perte de graisse
          </option>

          <option value="recomp">
            Recomposition
          </option>

          <option value="maintain">
            Maintien
          </option>

          <option value="bulk">
            Prise de masse
          </option>

        </select>

      </div>

    </div>


    <div class="form-group">

      <label for="newRecipeDescription">
        Description
      </label>

      <textarea
        id="newRecipeDescription"
        rows="3"
        placeholder="Décris rapidement ta recette..."
      ></textarea>

    </div>


    <div class="modal-actions">

      <button
        class="secondary-button"
        id="cancelCreateRecipeButton"
      >
        Annuler
      </button>

      <button
        class="primary-button"
        id="saveNewRecipeButton"
      >
        Créer la recette
      </button>

    </div>

  `);


  document
    .getElementById(
      "cancelCreateRecipeButton"
    )
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById(
      "saveNewRecipeButton"
    )
    ?.addEventListener(
      "click",
      saveNewRecipe
    );


  setTimeout(() => {

    document
      .getElementById(
        "newRecipeName"
      )
      ?.focus();

  }, 50);
}


/* ---------------------------------------------------------
   SAUVEGARDER UNE RECETTE
--------------------------------------------------------- */

function saveNewRecipe() {

  const name =
    document
      .getElementById("newRecipeName")
      ?.value
      .trim();


  if (!name) {

    showToast(
      "Donne un nom à ta recette."
    );

    return;
  }


  const recipe = {

    id:
      generateId("recipe"),

    name,

    description:
      document
        .getElementById("newRecipeDescription")
        ?.value
        .trim() || "",

    calories:
      Number(
        document
          .getElementById("newRecipeCalories")
          ?.value || 0
      ),

    protein:
      Number(
        document
          .getElementById("newRecipeProtein")
          ?.value || 0
      ),

    carbs:
      Number(
        document
          .getElementById("newRecipeCarbs")
          ?.value || 0
      ),

    fat:
      Number(
        document
          .getElementById("newRecipeFat")
          ?.value || 0
      ),

    price:
      Number(
        document
          .getElementById("newRecipePrice")
          ?.value || 0
      ),

    prepTime:
      Number(
        document
          .getElementById("newRecipeTime")
          ?.value || 0
      ),

    goal:
      document
        .getElementById("newRecipeGoal")
        ?.value || "all",

    servings:
      1,

    emoji:
      "🍽️",

    ingredients:
      [],

    instructions:
      [],

    createdBy:
      "user"

  };


  if (!Array.isArray(state.recipes)) {
    state.recipes = [];
  }


  state.recipes.push(recipe);

  saveState();

  renderRecipes();

  closeModal();

  showToast(
    "Recette créée avec succès 🎉"
  );
}


/* ---------------------------------------------------------
   RECHERCHE RECETTES
--------------------------------------------------------- */

function setupRecipeFilters() {

  document
    .getElementById("recipeSearch")
    ?.addEventListener(
      "input",
      renderRecipes
    );


  document
    .getElementById("recipeGoalFilter")
    ?.addEventListener(
      "change",
      renderRecipes
    );
}


/* ---------------------------------------------------------
   GESTION DES CLICS SUR LES RECETTES
--------------------------------------------------------- */

function handleRecipeAction(event) {

  const button =
    event.target.closest(
      "[data-action]"
    );

  if (!button) {
    return;
  }


  const action =
    button.dataset.action;

  const recipeId =
    button.dataset.id;


  if (!recipeId) {
    return;
  }


  if (action === "view-recipe") {

    openRecipeDetails(
      recipeId
    );

    return;
  }


  if (action === "add-recipe") {

    const recipe =
      getRecipes().find(
        item => item.id === recipeId
      );

    if (recipe) {
      openRecipeAddModal(recipe);
    }

    return;
  }

}


/* ---------------------------------------------------------
   INITIALISATION RECETTES
--------------------------------------------------------- */

function initializeRecipes() {

  getRecipes();

  setupRecipeFilters();

  const grid =
    document.getElementById(
      "recipesGrid"
    );

  if (grid) {

    grid.addEventListener(
      "click",
      handleRecipeAction
    );

  }

  renderRecipes();
}


/* =========================================================
   FIN DU BLOC 6
========================================================= */


/* =========================================================
   BLOC 7 — PLANNING / GÉNÉRATION DE LA SEMAINE
========================================================= */


/* ---------------------------------------------------------
   OUTILS PLANNING
--------------------------------------------------------- */

function getWeekStart(date = new Date()) {

  const d = new Date(date);

  d.setHours(0, 0, 0, 0);

  const day = d.getDay();

  /*
   * JS :
   * dimanche = 0
   * lundi = 1
   */

  const diff =
    day === 0
      ? -6
      : 1 - day;

  d.setDate(
    d.getDate() + diff
  );

  return d;
}


function formatDateKey(date) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatShortDate(date) {

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit"
    }
  );
}


function getDayName(date) {

  return date.toLocaleDateString(
    "fr-FR",
    {
      weekday: "long"
    }
  );
}


function capitalizeFirstLetter(value) {

  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


/* ---------------------------------------------------------
   STRUCTURE DU PLANNING
--------------------------------------------------------- */

function getPlanner() {

  if (!Array.isArray(state.planner)) {
    state.planner = [];
  }

  return state.planner;
}


function getPlannerDay(dateKey) {

  const planner =
    getPlanner();

  let day =
    planner.find(
      item =>
        item.date === dateKey
    );


  if (!day) {

    day = {

      date:
        dateKey,

      meals: {

        breakfast: null,

        lunch: null,

        snack: null,

        dinner: null

      }

    };

    planner.push(day);

  }


  day.meals ??= {};

  day.meals.breakfast ??= null;
  day.meals.lunch ??= null;
  day.meals.snack ??= null;
  day.meals.dinner ??= null;


  return day;
}


/* ---------------------------------------------------------
   NETTOYER L'ANCIEN PLANNING
--------------------------------------------------------- */

function clearPlanner() {

  state.planner = [];

  saveState();

  renderPlanner();

  updatePlannerSummary();

  showToast(
    "Planning réinitialisé"
  );
}


/* ---------------------------------------------------------
   RECETTES ADAPTÉES AU PROFIL
--------------------------------------------------------- */

function getRecipesForGoal() {

  const recipes =
    getRecipes();

  const profile =
    state.profile || {};

  const goal =
    profile.goal || "recomp";


  let filtered =
    recipes.filter(
      recipe =>
        recipe.goal === goal ||
        recipe.goal === "all"
    );


  /*
   * Si aucune recette ne correspond
   * exactement à l'objectif,
   * on utilise toutes les recettes.
   */

  if (!filtered.length) {
    filtered = recipes;
  }


  return filtered;
}


/* ---------------------------------------------------------
   SCORE D'UNE RECETTE
--------------------------------------------------------- */

function scoreRecipeForTarget(
  recipe,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat
) {

  const calories =
    Number(recipe.calories || 0);

  const protein =
    Number(recipe.protein || 0);

  const carbs =
    Number(recipe.carbs || 0);

  const fat =
    Number(recipe.fat || 0);


  /*
   * On évite les recettes totalement vides.
   */

  if (
    calories <= 0 &&
    protein <= 0 &&
    carbs <= 0 &&
    fat <= 0
  ) {

    return -Infinity;

  }


  const calorieDifference =
    Math.abs(
      calories -
      targetCalories
    );


  const proteinDifference =
    Math.abs(
      protein -
      targetProtein
    );


  const carbsDifference =
    Math.abs(
      carbs -
      targetCarbs
    );


  const fatDifference =
    Math.abs(
      fat -
      targetFat
    );


  /*
   * Score pondéré.
   * Les protéines ont davantage de poids.
   */

  let score = 0;


  score -=
    calorieDifference * 0.5;


  score -=
    proteinDifference * 2;


  score -=
    carbsDifference * 0.25;


  score -=
    fatDifference * 0.35;


  /*
   * Petit bonus pour les recettes
   * économiques.
   */

  const price =
    Number(recipe.price || 0);

  if (price <= 3) {
    score += 10;
  }


  /*
   * Bonus protéines.
   */

  if (protein >= 30) {
    score += 15;
  }


  return score;
}


/* ---------------------------------------------------------
   CHOISIR UNE RECETTE
--------------------------------------------------------- */

function chooseBestRecipe(
  recipes,
  targetCalories,
  targetProtein,
  targetCarbs,
  targetFat,
  usedIds = []
) {

  if (!recipes.length) {
    return null;
  }


  const candidates =
    recipes.filter(
      recipe =>
        !usedIds.includes(
          recipe.id
        )
    );


  const pool =
    candidates.length
      ? candidates
      : recipes;


  let bestRecipe = null;
  let bestScore = -Infinity;


  pool.forEach(recipe => {

    const score =
      scoreRecipeForTarget(
        recipe,
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat
      );


    if (score > bestScore) {

      bestScore = score;

      bestRecipe = recipe;

    }

  });


  return bestRecipe;
}


/* ---------------------------------------------------------
   CRÉER UNE JOURNÉE
--------------------------------------------------------- */

function generatePlannerDay(
  dateKey,
  recipes,
  targets
) {

  const day =
    getPlannerDay(
      dateKey
    );


  const mealDistribution = {

    breakfast: 0.25,

    lunch: 0.35,

    snack: 0.10,

    dinner: 0.30

  };


  const usedIds = [];


  Object.entries(
    mealDistribution
  ).forEach(
    (
      [
        meal,
        percentage
      ]
    ) => {

      const recipe =
        chooseBestRecipe(
          recipes,

          targets.calories *
            percentage,

          targets.protein *
            percentage,

          targets.carbs *
            percentage,

          targets.fat *
            percentage,

          usedIds
        );


      if (!recipe) {
        return;
      }


      day.meals[meal] = {

        id:
          generateId(
            "plan"
          ),

        recipeId:
          recipe.id,

        name:
          recipe.name,

        calories:
          Number(
            recipe.calories || 0
          ),

        protein:
          Number(
            recipe.protein || 0
          ),

        carbs:
          Number(
            recipe.carbs || 0
          ),

        fat:
          Number(
            recipe.fat || 0
          ),

        price:
          Number(
            recipe.price || 0
          )

      };


      usedIds.push(
        recipe.id
      );

    }
  );


  return day;
}


/* ---------------------------------------------------------
   GÉNÉRER LA SEMAINE
--------------------------------------------------------- */

function generateWeekPlan() {

  const recipes =
    getRecipesForGoal();


  if (!recipes.length) {

    showToast(
      "Ajoute d'abord des recettes."
    );

    return;

  }


  const targets =
    getNutritionTargets();


  const weekStart =
    getWeekStart();


  /*
   * On conserve l'ancien planning
   * uniquement pour les jours qui ne
   * sont pas concernés.
   */

  const existing =
    getPlanner();


  const generated = [];


  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const date =
      new Date(
        weekStart
      );

    date.setDate(
      weekStart.getDate() + i
    );


    const dateKey =
      formatDateKey(
        date
      );


    const day =
      generatePlannerDay(
        dateKey,
        recipes,
        targets
      );


    generated.push(
      day
    );

  }


  /*
   * Remplacement uniquement
   * des 7 jours générés.
   */

  const generatedKeys =
    generated.map(
      day => day.date
    );


  state.planner =
    existing.filter(
      day =>
        !generatedKeys.includes(
          day.date
        )
    );


  state.planner.push(
    ...generated
  );


  state.planner.sort(
    (a, b) =>
      a.date.localeCompare(
        b.date
      )
  );


  saveState();

  renderPlanner();

  updatePlannerSummary();

  showToast(
    "Ta semaine a été générée ✨"
  );

}


/* ---------------------------------------------------------
   RENDRE LE PLANNING
--------------------------------------------------------- */

function renderPlanner() {

  const container =
    document.getElementById(
      "weekPlanner"
    );


  if (!container) {
    return;
  }


  const weekStart =
    getWeekStart();


  const planner =
    getPlanner();


  const targets =
    getNutritionTargets();


  const days = [];


  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const date =
      new Date(
        weekStart
      );


    date.setDate(
      weekStart.getDate() + i
    );


    const dateKey =
      formatDateKey(
        date
      );


    const plannedDay =
      planner.find(
        item =>
          item.date === dateKey
      );


    days.push({

      date,

      dateKey,

      plannedDay

    });

  }


  container.innerHTML =
    days
      .map(
        day =>
          renderPlannerDay(
            day,
            targets
          )
      )
      .join("");


  /*
   * Gestion des boutons
   */

  container
    .querySelectorAll(
      "[data-action='planner-add']"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const dateKey =
            button.dataset.date;

          openPlannerMealModal(
            dateKey
          );

        }
      );

    });


  container
    .querySelectorAll(
      "[data-action='planner-remove']"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const dateKey =
            button.dataset.date;

          const meal =
            button.dataset.meal;

          removePlannerMeal(
            dateKey,
            meal
          );

        }
      );

    });


  container
    .querySelectorAll(
      "[data-action='planner-add-journal']"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const dateKey =
            button.dataset.date;

          const meal =
            button.dataset.meal;

          addPlannerMealToJournal(
            dateKey,
            meal
          );

        }
      );

    });

}


/* ---------------------------------------------------------
   RENDRE UN JOUR
--------------------------------------------------------- */

function renderPlannerDay(
  day,
  targets
) {

  const planned =
    day.plannedDay;


  const meals =
    planned?.meals || {};


  const mealKeys = [

    "breakfast",

    "lunch",

    "snack",

    "dinner"

  ];


  const dayTotals =
    calculatePlannerDayTotals(
      planned
    );


  const dayName =
    capitalizeFirstLetter(
      getDayName(
        day.date
      )
    );


  const isToday =
    day.dateKey ===
    getTodayKey();


  return `

    <div
      class="planner-day ${
        isToday
          ? "today"
          : ""
      }"
      data-date="${day.dateKey}"
    >

      <div class="planner-day-header">

        <div>

          <span class="planner-day-name">
            ${dayName}
          </span>

          <strong>
            ${formatShortDate(day.date)}
          </strong>

        </div>

        ${
          isToday
            ? `
              <span class="planner-today-badge">
                Aujourd'hui
              </span>
            `
            : ""
        }

      </div>


      <div class="planner-day-summary">

        <span>
          🔥 ${formatNumber(dayTotals.calories)} kcal
        </span>

        <span>
          💪 ${formatNumber(dayTotals.protein)} g P
        </span>

        <span>
          💰 ${formatCurrency(dayTotals.price)}
        </span>

      </div>


      <div class="planner-meals">

        ${mealKeys
          .map(
            meal =>
              renderPlannerMeal(
                day.dateKey,
                meal,
                meals[meal]
              )
          )
          .join("")}

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   RENDRE UN REPAS DU PLANNING
--------------------------------------------------------- */

function renderPlannerMeal(
  dateKey,
  meal,
  item
) {

  const label =
    getMealLabel(
      meal
    );


  if (!item) {

    return `

      <div class="planner-meal empty">

        <div class="planner-meal-title">

          <span>
            ${getMealEmoji(meal)}
          </span>

          <strong>
            ${capitalizeFirstLetter(label)}
          </strong>

        </div>

        <button
          class="add-small-button"
          data-action="planner-add"
          data-date="${dateKey}"
        >
          +
        </button>

      </div>

    `;

  }


  return `

    <div class="planner-meal">

      <div class="planner-meal-title">

        <span>
          ${getMealEmoji(meal)}
        </span>

        <strong>
          ${capitalizeFirstLetter(label)}
        </strong>

      </div>


      <div class="planner-meal-content">

        <strong>
          ${escapeHTML(item.name)}
        </strong>

        <span>
          ${formatNumber(item.calories)} kcal
          ·
          P ${formatNumber(item.protein)}g
        </span>

      </div>


      <div class="planner-meal-actions">

        <button
          class="icon-button-small"
          data-action="planner-add-journal"
          data-date="${dateKey}"
          data-meal="${meal}"
          title="Ajouter au journal"
        >
          📖
        </button>

        <button
          class="icon-button-small danger"
          data-action="planner-remove"
          data-date="${dateKey}"
          data-meal="${meal}"
          title="Supprimer"
        >
          ×
        </button>

      </div>

    </div>

  `;
}


/* ---------------------------------------------------------
   EMOJI REPAS
--------------------------------------------------------- */

function getMealEmoji(meal) {

  const emojis = {

    breakfast: "🌅",

    lunch: "☀️",

    snack: "🍎",

    dinner: "🌙"

  };


  return (
    emojis[meal] ||
    "🍽️"
  );

}


/* ---------------------------------------------------------
   TOTALS D'UNE JOURNÉE PLANIFIÉE
--------------------------------------------------------- */

function calculatePlannerDayTotals(
  day
) {

  const totals = {

    calories: 0,

    protein: 0,

    carbs: 0,

    fat: 0,

    price: 0

  };


  if (!day?.meals) {
    return totals;
  }


  Object.values(
    day.meals
  ).forEach(meal => {

    if (!meal) {
      return;
    }


    totals.calories +=
      Number(
        meal.calories || 0
      );

    totals.protein +=
      Number(
        meal.protein || 0
      );

    totals.carbs +=
      Number(
        meal.carbs || 0
      );

    totals.fat +=
      Number(
        meal.fat || 0
      );

    totals.price +=
      Number(
        meal.price || 0
      );

  });


  return {

    calories:
      roundNumber(
        totals.calories
      ),

    protein:
      roundNumber(
        totals.protein
      ),

    carbs:
      roundNumber(
        totals.carbs
      ),

    fat:
      roundNumber(
        totals.fat
      ),

    price:
      roundNumber(
        totals.price
      )

  };

}


/* ---------------------------------------------------------
   SUPPRIMER UN REPAS DU PLANNING
--------------------------------------------------------- */

function removePlannerMeal(
  dateKey,
  meal
) {

  const day =
    getPlannerDay(
      dateKey
    );


  if (!day.meals[meal]) {
    return;
  }


  const name =
    day.meals[meal].name;


  day.meals[meal] =
    null;


  saveState();

  renderPlanner();

  updatePlannerSummary();


  showToast(
    `${name} retiré du planning`
  );

}


/* ---------------------------------------------------------
   MODALE AJOUT REPAS AU PLANNING
--------------------------------------------------------- */

function openPlannerMealModal(
  dateKey
) {

  const recipes =
    getRecipesForGoal();


  if (!recipes.length) {

    showToast(
      "Aucune recette disponible."
    );

    return;

  }


  openModal(`

    <div class="modal-header-content">

      <span class="eyebrow">
        PLANNING
      </span>

      <h2>
        Ajouter un repas
      </h2>

      <p>
        Choisis le repas à ajouter à cette journée.
      </p>

    </div>


    <div class="form-group">

      <label for="plannerMealSelect">
        Type de repas
      </label>

      <select
        id="plannerMealSelect"
      >

        <option value="breakfast">
          🌅 Petit-déjeuner
        </option>

        <option value="lunch">
          ☀️ Déjeuner
        </option>

        <option value="snack">
          🍎 Collation
        </option>

        <option value="dinner">
          🌙 Dîner
        </option>

      </select>

    </div>


    <div class="form-group">

      <label for="plannerRecipeSelect">
        Recette
      </label>

      <select
        id="plannerRecipeSelect"
      >

        ${recipes
          .map(
            recipe => `
              <option
                value="${recipe.id}"
              >
                ${escapeHTML(recipe.name)}
              </option>
            `
          )
          .join("")}

      </select>

    </div>


    <div
      id="plannerRecipePreview"
      class="recipe-add-preview"
    ></div>


    <div class="modal-actions">

      <button
        class="secondary-button"
        id="cancelPlannerMealButton"
      >
        Annuler
      </button>

      <button
        class="primary-button"
        id="confirmPlannerMealButton"
      >
        Ajouter
      </button>

    </div>

  `);


  const recipeSelect =
    document.getElementById(
      "plannerRecipeSelect"
    );


  const preview =
    document.getElementById(
      "plannerRecipePreview"
    );


  function updatePreview() {

    const recipe =
      recipes.find(
        item =>
          item.id ===
          recipeSelect?.value
      );


    if (!recipe || !preview) {
      return;
    }


    preview.innerHTML = `

      <div>
        <span>Calories</span>
        <strong>
          ${formatNumber(recipe.calories)} kcal
        </strong>
      </div>

      <div>
        <span>Protéines</span>
        <strong>
          ${formatNumber(recipe.protein)} g
        </strong>
      </div>

      <div>
        <span>Glucides</span>
        <strong>
          ${formatNumber(recipe.carbs)} g
        </strong>
      </div>

      <div>
        <span>Lipides</span>
        <strong>
          ${formatNumber(recipe.fat)} g
        </strong>
      </div>

    `;

  }


  recipeSelect?.addEventListener(
    "change",
    updatePreview
  );


  document
    .getElementById(
      "cancelPlannerMealButton"
    )
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById(
      "confirmPlannerMealButton"
    )
    ?.addEventListener(
      "click",
      () => {

        const meal =
          document.getElementById(
            "plannerMealSelect"
          )?.value || "lunch";


        const recipe =
          recipes.find(
            item =>
              item.id ===
              recipeSelect?.value
          );


        if (!recipe) {

          showToast(
            "Sélectionne une recette."
          );

          return;

        }


        const day =
          getPlannerDay(
            dateKey
          );


        day.meals[meal] = {

          id:
            generateId(
              "plan"
            ),

          recipeId:
            recipe.id,

          name:
            recipe.name,

          calories:
            Number(
              recipe.calories || 0
            ),

          protein:
            Number(
              recipe.protein || 0
            ),

          carbs:
            Number(
              recipe.carbs || 0
            ),

          fat:
            Number(
              recipe.fat || 0
            ),

          price:
            Number(
              recipe.price || 0
            )

        };


        saveState();

        renderPlanner();

        updatePlannerSummary();

        closeModal();


        showToast(
          "Repas ajouté au planning"
        );

      }
    );


  updatePreview();

}


/* ---------------------------------------------------------
   AJOUTER REPAS PLANIFIÉ AU JOURNAL
--------------------------------------------------------- */

function addPlannerMealToJournal(
  dateKey,
  meal
) {

  const day =
    getPlannerDay(
      dateKey
    );


  const planned =
    day.meals?.[meal];


  if (!planned) {

    showToast(
      "Aucun repas prévu."
    );

    return;

  }


  /*
   * Le journal est actuellement
   * journalisé pour aujourd'hui.
   *
   * Pour un autre jour, on crée
   * directement l'entrée correspondante.
   */

  if (!Array.isArray(state.journal)) {
    state.journal = [];
  }


  let journal =
    state.journal.find(
      item =>
        item.date ===
        dateKey
    );


  if (!journal) {

    journal = {

      date:
        dateKey,

      meals: {

        breakfast: [],

        lunch: [],

        snack: [],

        dinner: []

      }

    };

    state.journal.push(
      journal
    );

  }


  journal.meals[meal] ??= [];


  journal.meals[meal].push({

    id:
      generateId(
        "journal"
      ),

    name:
      planned.name,

    quantity:
      1,

    calories:
      Number(
        planned.calories || 0
      ),

    protein:
      Number(
        planned.protein || 0
      ),

    carbs:
      Number(
        planned.carbs || 0
      ),

    fat:
      Number(
        planned.fat || 0
      ),

    price:
      Number(
        planned.price || 0
      ),

    recipeId:
      planned.recipeId,

    originalPer100: {

      calories:
        Number(
          planned.calories || 0
        ),

      protein:
        Number(
          planned.protein || 0
        ),

      carbs:
        Number(
          planned.carbs || 0
        ),

      fat:
        Number(
          planned.fat || 0
        ),

      price:
        Number(
          planned.price || 0
        )

    }

  });


  saveState();

  updateAllUI();


  showToast(
    `${planned.name} ajouté au journal`
  );

}


/* ---------------------------------------------------------
   RÉSUMÉ DE LA SEMAINE
--------------------------------------------------------- */

function updatePlannerSummary() {

  const planner =
    getPlanner();


  const weekStart =
    getWeekStart();


  const weekKeys = [];


  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const date =
      new Date(
        weekStart
      );


    date.setDate(
      weekStart.getDate() + i
    );


    weekKeys.push(
      formatDateKey(
        date
      )
    );

  }


  const days =
    planner.filter(
      day =>
        weekKeys.includes(
          day.date
        )
    );


  const totals = {

    calories: 0,

    protein: 0,

    price: 0

  };


  days.forEach(day => {

    const dayTotals =
      calculatePlannerDayTotals(
        day
      );


    totals.calories +=
      dayTotals.calories;

    totals.protein +=
      dayTotals.protein;

    totals.price +=
      dayTotals.price;

  });


  const count =
    Math.max(
      1,
      days.length
    );


  setText(
    "plannerAverageCalories",
    `${formatNumber(
      totals.calories / count
    )} kcal`
  );


  setText(
    "plannerAverageProtein",
    `${formatNumber(
      totals.protein / count
    )} g`
  );


  setText(
    "plannerBudget",
    formatCurrency(
      totals.price
    )
  );

}


/* ---------------------------------------------------------
   INITIALISATION PLANNING
--------------------------------------------------------- */

function initializePlanner() {

  getPlanner();

  renderPlanner();

  updatePlannerSummary();


  document
    .getElementById(
      "generateWeekButton"
    )
    ?.addEventListener(
      "click",
      generateWeekPlan
    );


  document
    .getElementById(
      "clearPlannerButton"
    )
    ?.addEventListener(
      "click",
      () => {

        const confirmed =
          window.confirm(
            "Réinitialiser le planning de la semaine ?"
          );


        if (confirmed) {
          clearPlanner();
        }

      }
    );

}


/* =========================================================
   FIN DU BLOC 7
========================================================= */


/* =========================================================
   BLOC 8 — RENDU DU JOURNAL
========================================================= */

function renderJournal() {
  const targets = getDailyTargets(state.profile);
  const totals = calculateDayNutrition(getCurrentDay());

  setText(
    "#journalCalories",
    Math.round(totals.kcal)
  );

  setText(
    "#journalCaloriesTarget",
    Math.round(targets.calories)
  );

  setText(
    "#journalProtein",
    round(totals.protein)
  );

  setText(
    "#journalProteinTarget",
    round(targets.protein)
  );

  setText(
    "#journalCarbs",
    round(totals.carbs)
  );

  setText(
    "#journalCarbsTarget",
    round(targets.carbs)
  );

  setText(
    "#journalFat",
    round(totals.fat)
  );

  setText(
    "#journalFatTarget",
    round(targets.fat)
  );

  renderMealSection(
    "breakfast",
    "#breakfastItems",
    "#breakfastCalories"
  );

  renderMealSection(
    "lunch",
    "#lunchItems",
    "#lunchCalories"
  );

  renderMealSection(
    "snack",
    "#snackItems",
    "#snackCalories"
  );

  renderMealSection(
    "dinner",
    "#dinnerItems",
    "#dinnerCalories"
  );
}


/* =========================================================
   RENDU D'UN REPAS
========================================================= */

function renderMealSection(
  mealType,
  containerSelector,
  calorieSelector
) {
  const container =
    $(containerSelector);

  if (!container) {
    return;
  }

  const items =
    Array.isArray(state.meals?.[mealType])
      ? state.meals[mealType]
      : [];

  const nutrition =
    calculateMealNutrition(items);

  setText(
    calorieSelector,
    `${Math.round(nutrition.kcal)} kcal`
  );

  if (!items.length) {
    container.innerHTML = `
      <div class="meal-empty">
        <span>Aucun aliment ajouté</span>
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
          return `
            <div class="meal-item">
              <div class="meal-item-info">
                <strong>Aliment supprimé</strong>
              </div>

              <button
                class="delete-item-button"
                data-delete-meal="${mealType}"
                data-index="${index}"
                type="button"
              >
                🗑️
              </button>
            </div>
          `;
        }

        const grams =
          Number(item.grams) || 0;

        const nutrition =
          calculateFoodNutrition(
            item.food,
            grams
          );

        return `
          <div
            class="meal-item"
            data-meal="${mealType}"
            data-index="${index}"
          >

            <div class="meal-item-icon">
              ${escapeHTML(food.icon || "🍽️")}
            </div>

            <div class="meal-item-info">

              <strong>
                ${escapeHTML(food.name)}
              </strong>

              <span>
                ${formatNumber(grams, 0)} g
              </span>

            </div>

            <div class="meal-item-macros">

              <strong>
                ${Math.round(nutrition.kcal)} kcal
              </strong>

              <small>
                P ${round(nutrition.protein)}g
                ·
                G ${round(nutrition.carbs)}g
                ·
                L ${round(nutrition.fat)}g
              </small>

            </div>

            <button
              class="edit-item-button"
              data-edit-meal="${mealType}"
              data-index="${index}"
              type="button"
              aria-label="Modifier"
            >
              ✏️
            </button>

            <button
              class="delete-item-button"
              data-delete-meal="${mealType}"
              data-index="${index}"
              type="button"
              aria-label="Supprimer"
            >
              🗑️
            </button>

          </div>
        `;
      }
    ).join("");

  container
    .querySelectorAll(
      "[data-delete-meal]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const meal =
            button.dataset.deleteMeal;

          const index =
            Number(
              button.dataset.index
            );

          deleteMealItem(
            meal,
            index
          );
        }
      );

    });

  container
    .querySelectorAll(
      "[data-edit-meal]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const meal =
            button.dataset.editMeal;

          const index =
            Number(
              button.dataset.index
            );

          editMealItem(
            meal,
            index
          );
        }
      );

    });
}


/* =========================================================
   AJOUT D'UN ALIMENT
========================================================= */

function openFoodModal(
  mealType = "lunch"
) {

  const foods =
    Array.isArray(
      typeof FOODS !== "undefined"
        ? FOODS
        : []
    )
      ? FOODS
      : [];

  if (!foods.length) {
    notify(
      "Aucun aliment disponible."
    );
    return;
  }

  openModal(`
    <div class="modal-header-content">

      <p class="eyebrow">
        AJOUTER UN ALIMENT
      </p>

      <h2>
        Ajouter à ton repas
      </h2>

      <p>
        Choisis un aliment puis indique la quantité.
      </p>

    </div>

    <div class="form-group">

      <label for="modalFoodSelect">
        Aliment
      </label>

      <select
        id="modalFoodSelect"
        class="select-input"
      >

        ${foods.map(food => `
          <option value="${escapeHTML(food.id)}">
            ${escapeHTML(food.name)}
          </option>
        `).join("")}

      </select>

    </div>

    <div class="form-group">

      <label for="modalFoodGrams">
        Quantité
      </label>

      <div class="input-with-unit">

        <input
          id="modalFoodGrams"
          type="number"
          min="1"
          step="1"
          value="100"
        >

        <span>
          g
        </span>

      </div>

    </div>

    <div
      id="modalFoodPreview"
      class="food-preview"
    ></div>

    <div class="modal-actions">

      <button
        class="secondary-button"
        id="cancelFoodButton"
        type="button"
      >
        Annuler
      </button>

      <button
        class="primary-button"
        id="confirmFoodButton"
        type="button"
      >
        Ajouter
      </button>

    </div>
  `);

  const select =
    $("#modalFoodSelect");

  const gramsInput =
    $("#modalFoodGrams");

  const preview =
    $("#modalFoodPreview");

  function updatePreview() {

    const food =
      getFood(select.value);

    const grams =
      Number(
        gramsInput.value
      ) || 0;

    if (!food) {
      preview.innerHTML = "";
      return;
    }

    const nutrition =
      calculateFoodNutrition(
        food.id,
        grams
      );

    preview.innerHTML = `
      <div class="food-preview-inner">

        <strong>
          ${escapeHTML(food.name)}
        </strong>

        <div class="food-preview-macros">

          <span>
            🔥 ${Math.round(nutrition.kcal)} kcal
          </span>

          <span>
            💪 ${round(nutrition.protein)} g P
          </span>

          <span>
            🍚 ${round(nutrition.carbs)} g G
          </span>

          <span>
            🥑 ${round(nutrition.fat)} g L
          </span>

        </div>

      </div>
    `;
  }

  select.addEventListener(
    "change",
    updatePreview
  );

  gramsInput.addEventListener(
    "input",
    updatePreview
  );

  $("#cancelFoodButton")
    ?.addEventListener(
      "click",
      closeModal
    );

  $("#confirmFoodButton")
    ?.addEventListener(
      "click",
      () => {

        const foodId =
          select.value;

        const grams =
          Number(
            gramsInput.value
          );

        if (!foodId) {
          notify(
            "Choisis un aliment."
          );
          return;
        }

        if (
          !Number.isFinite(grams) ||
          grams <= 0
        ) {
          notify(
            "Indique une quantité valide."
          );
          return;
        }

        if (
          !state.meals[mealType]
        ) {
          state.meals[mealType] = [];
        }

        state.meals[mealType].push({
          id:
            Date.now().toString(),
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
    );

  updatePreview();
}


/* =========================================================
   MODIFIER UN ALIMENT
========================================================= */

function editMealItem(
  mealType,
  index
) {

  const items =
    state.meals?.[mealType];

  if (
    !Array.isArray(items) ||
    !items[index]
  ) {
    return;
  }

  const item =
    items[index];

  const food =
    getFood(item.food);

  if (!food) {
    notify(
      "Cet aliment n'existe plus."
    );
    return;
  }

  openModal(`
    <div class="modal-header-content">

      <p class="eyebrow">
        MODIFIER
      </p>

      <h2>
        ${escapeHTML(food.name)}
      </h2>

      <p>
        Modifie directement la quantité.
      </p>

    </div>

    <div class="form-group">

      <label for="editFoodGrams">
        Quantité
      </label>

      <div class="input-with-unit">

        <input
          id="editFoodGrams"
          type="number"
          min="1"
          step="1"
          value="${Number(item.grams) || 100}"
        >

        <span>
          g
        </span>

      </div>

    </div>

    <div
      id="editFoodPreview"
      class="food-preview"
    ></div>

    <div class="modal-actions">

      <button
        class="secondary-button"
        id="cancelEditFoodButton"
        type="button"
      >
        Annuler
      </button>

      <button
        class="primary-button"
        id="saveEditFoodButton"
        type="button"
      >
        Enregistrer
      </button>

    </div>
  `);

  const gramsInput =
    $("#editFoodGrams");

  const preview =
    $("#editFoodPreview");

  function updateEditPreview() {

    const grams =
      Number(
        gramsInput.value
      ) || 0;

    const nutrition =
      calculateFoodNutrition(
        food.id,
        grams
      );

    preview.innerHTML = `
      <div class="food-preview-inner">

        <strong>
          ${escapeHTML(food.name)}
        </strong>

        <div class="food-preview-macros">

          <span>
            🔥 ${Math.round(nutrition.kcal)} kcal
          </span>

          <span>
            💪 ${round(nutrition.protein)} g P
          </span>

          <span>
            🍚 ${round(nutrition.carbs)} g G
          </span>

          <span>
            🥑 ${round(nutrition.fat)} g L
          </span>

        </div>

      </div>
    `;
  }

  gramsInput.addEventListener(
    "input",
    updateEditPreview
  );

  $("#cancelEditFoodButton")
    ?.addEventListener(
      "click",
      closeModal
    );

  $("#saveEditFoodButton")
    ?.addEventListener(
      "click",
      () => {

        const grams =
          Number(
            gramsInput.value
          );

        if (
          !Number.isFinite(grams) ||
          grams <= 0
        ) {
          notify(
            "Quantité invalide."
          );
          return;
        }

        state.meals[
          mealType
        ][index].grams =
          grams;

        saveState();

        closeModal();

        renderAll();

        notify(
          "Quantité modifiée ✅"
        );
      }
    );

  updateEditPreview();
}


/* =========================================================
   SUPPRIMER UN ALIMENT
========================================================= */

function deleteMealItem(
  mealType,
  index
) {

  if (
    !state.meals?.[mealType]
  ) {
    return;
  }

  if (
    index < 0 ||
    index >=
      state.meals[mealType].length
  ) {
    return;
  }

  state.meals[
    mealType
  ].splice(
    index,
    1
  );

  saveState();

  renderAll();

  notify(
    "Aliment supprimé 🗑️"
  );
}


/* =========================================================
   RACCOURCIS AJOUT REPAS
========================================================= */

function addMeal(
  mealType = "lunch"
) {
  openFoodModal(
    mealType
  );
}

/* =========================================================
   BLOC 9 — RECETTES + GÉNÉRATION DE JOURNÉE
========================================================= */

function renderRecipes() {
  const container = $("#recipesGrid");

  if (!container) {
    return;
  }

  if (
    typeof RECIPES === "undefined" ||
    !Array.isArray(RECIPES)
  ) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍳</div>
        <h3>Aucune recette disponible</h3>
        <p>Les recettes pourront être ajoutées prochainement.</p>
      </div>
    `;
    return;
  }

  const search =
    ($("#recipeSearch")?.value || "")
      .trim()
      .toLowerCase();

  const goal =
    $("#recipeGoalFilter")?.value || "all";

  let recipes = [...RECIPES];

  if (search) {
    recipes = recipes.filter(recipe =>
      String(recipe.name || "")
        .toLowerCase()
        .includes(search)
    );
  }

  if (goal !== "all") {
    recipes = recipes.filter(recipe => {

      const nutrition =
        calculateRecipeNutrition(recipe.id);

      if (goal === "high-protein") {
        return nutrition.protein >= 30;
      }

      if (goal === "low-calorie") {
        return nutrition.kcal <= 500;
      }

      if (goal === "budget") {
        return Number(recipe.price || 0) <= 3;
      }

      return true;
    });
  }

  if (!recipes.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔎</div>
        <h3>Aucune recette trouvée</h3>
        <p>Essaie une autre recherche ou un autre filtre.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = recipes
    .map(recipe => {

      const nutrition =
        calculateRecipeNutrition(recipe.id);

      const favorite =
        Array.isArray(state.favorites) &&
        state.favorites.includes(recipe.id);

      return `
        <article class="recipe-card">

          <div class="recipe-image">
            ${escapeHTML(
              recipe.emoji ||
              recipe.icon ||
              "🍽️"
            )}
          </div>

          <div class="recipe-content">

            <div class="recipe-card-top">

              <div>

                <h3>
                  ${escapeHTML(
                    recipe.name ||
                    "Recette"
                  )}
                </h3>

                ${
                  recipe.description
                    ? `
                      <p>
                        ${escapeHTML(
                          recipe.description
                        )}
                      </p>
                    `
                    : ""
                }

              </div>

              <button
                type="button"
                class="favorite-button"
                data-recipe-favorite="${escapeHTML(
                  recipe.id
                )}"
                aria-label="Favori"
              >
                ${favorite ? "❤️" : "🤍"}
              </button>

            </div>

            <div class="recipe-macros">

              <span>
                🔥 ${Math.round(
                  nutrition.kcal
                )} kcal
              </span>

              <span>
                💪 ${round(
                  nutrition.protein
                )} g
              </span>

              <span>
                🍚 ${round(
                  nutrition.carbs
                )} g
              </span>

              <span>
                🥑 ${round(
                  nutrition.fat
                )} g
              </span>

            </div>

            <div class="recipe-actions">

              <button
                type="button"
                class="secondary-button"
                data-add-recipe="${escapeHTML(
                  recipe.id
                )}"
                data-meal="lunch"
              >
                + Déjeuner
              </button>

              <button
                type="button"
                class="primary-button"
                data-add-recipe="${escapeHTML(
                  recipe.id
                )}"
                data-meal="dinner"
              >
                + Dîner
              </button>

            </div>

          </div>

        </article>
      `;
    })
    .join("");

  container
    .querySelectorAll(
      "[data-recipe-favorite]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          toggleFavorite(
            button.dataset.recipeFavorite
          );

        }
      );

    });

  container
    .querySelectorAll(
      "[data-add-recipe]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          addRecipeToCurrentMeal(
            button.dataset.addRecipe,
            button.dataset.meal || "lunch"
          );

        }
      );

    });
}


/* =========================================================
   AJOUTER UNE RECETTE AU JOUR
========================================================= */

function addRecipeToCurrentMeal(
  recipeId,
  meal = "lunch"
) {

  const recipe =
    getRecipe(recipeId);

  if (!recipe) {
    notify(
      "Recette introuvable ❌"
    );
    return;
  }

  if (!state.meals[meal]) {
    state.meals[meal] = [];
  }

  const ingredients =
    Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : [];

  if (!ingredients.length) {
    notify(
      "Cette recette ne contient aucun ingrédient."
    );
    return;
  }

  ingredients.forEach(
    ingredient => {

      if (!ingredient) {
        return;
      }

      const foodId =
        ingredient.food ||
        ingredient.foodId;

      const grams =
        Number(
          ingredient.grams ||
          ingredient.quantity ||
          0
        );

      if (
        foodId &&
        grams > 0
      ) {

        state.meals[meal].push({
          id:
            `meal-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`,

          food:
            foodId,

          grams:
            grams
        });

      }

    }
  );

  saveState();

  renderJournal();
  renderDashboard();

  notify(
    `${recipe.name} ajouté à ${
      meal === "lunch"
        ? "ton déjeuner"
        : meal === "dinner"
        ? "ton dîner"
        : "ton repas"
    } ✅`
  );
}


/* =========================================================
   FAVORIS
========================================================= */

function toggleFavorite(
  recipeId
) {

  if (
    !Array.isArray(
      state.favorites
    )
  ) {
    state.favorites = [];
  }

  const index =
    state.favorites.indexOf(
      recipeId
    );

  if (index >= 0) {

    state.favorites.splice(
      index,
      1
    );

    notify(
      "Recette retirée des favoris."
    );

  } else {

    state.favorites.push(
      recipeId
    );

    notify(
      "Recette ajoutée aux favoris ❤️"
    );

  }

  saveState();

  renderRecipes();
}


/* =========================================================
   GÉNÉRATION AUTOMATIQUE DE LA JOURNÉE
========================================================= */

function generateDay() {

  if (
    typeof FOODS === "undefined" ||
    !Array.isArray(FOODS) ||
    !FOODS.length
  ) {
    notify(
      "Aucun aliment disponible ❌"
    );
    return;
  }

  const targets =
    getDailyTargets(
      state.profile
    );

  const findFood = (
    ...possibleIds
  ) => {

    for (
      const id of possibleIds
    ) {

      const food =
        getFood(id);

      if (food) {
        return food.id;
      }

    }

    return null;
  };


  const breakfast = [];
  const lunch = [];
  const snack = [];
  const dinner = [];


  const oats =
    findFood(
      "oats",
      "avoine",
      "oatmeal"
    );

  const milk =
    findFood(
      "milk",
      "lait"
    );

  const yogurt =
    findFood(
      "greek_yogurt",
      "yogurt",
      "yaourt",
      "skyr"
    );

  const banana =
    findFood(
      "banana",
      "banane"
    );

  const chicken =
    findFood(
      "chicken",
      "chicken_breast",
      "poulet"
    );

  const rice =
    findFood(
      "rice",
      "riz"
    );

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

  const eggs =
    findFood(
      "eggs",
      "egg",
      "oeufs",
      "œufs"
    );


  /* -------------------------------------------------------
     PETIT-DÉJEUNER
  ------------------------------------------------------- */

  if (oats) {

    breakfast.push({
      id:
        `generated-${Date.now()}-1`,

      food:
        oats,

      grams:
        60
    });

  }

  if (milk) {

    breakfast.push({
      id:
        `generated-${Date.now()}-2`,

      food:
        milk,

      grams:
        250
    });

  }

  if (yogurt) {

    breakfast.push({
      id:
        `generated-${Date.now()}-3`,

      food:
        yogurt,

      grams:
        150
    });

  }

  if (banana) {

    breakfast.push({
      id:
        `generated-${Date.now()}-4`,

      food:
        banana,

      grams:
        100
    });

  }


  /* -------------------------------------------------------
     DÉJEUNER
  ------------------------------------------------------- */

  if (chicken) {

    lunch.push({
      id:
        `generated-${Date.now()}-5`,

      food:
        chicken,

      grams:
        180
    });

  }

  if (rice) {

    lunch.push({
      id:
        `generated-${Date.now()}-6`,

      food:
        rice,

      grams:
        250
    });

  }

  if (broccoli) {

    lunch.push({
      id:
        `generated-${Date.now()}-7`,

      food:
        broccoli,

      grams:
        150
    });

  }


  /* -------------------------------------------------------
     COLLATION
  ------------------------------------------------------- */

  if (yogurt) {

    snack.push({
      id:
        `generated-${Date.now()}-8`,

      food:
        yogurt,

      grams:
        200
    });

  }

  if (banana) {

    snack.push({
      id:
        `generated-${Date.now()}-9`,

      food:
        banana,

      grams:
        100
    });

  }


  /* -------------------------------------------------------
     DÎNER
  ------------------------------------------------------- */

  if (tuna) {

    dinner.push({
      id:
        `generated-${Date.now()}-10`,

      food:
        tuna,

      grams:
        150
    });

  }

  if (pasta) {

    dinner.push({
      id:
        `generated-${Date.now()}-11`,

      food:
        pasta,

      grams:
        220
    });

  }

  if (broccoli) {

    dinner.push({
      id:
        `generated-${Date.now()}-12`,

      food:
        broccoli,

      grams:
        150
    });

  }


  /* -------------------------------------------------------
     SI LE POULET EXISTE, ON PEUT AJOUTER DES PROTÉINES
  ------------------------------------------------------- */

  state.meals = {
    breakfast,
    lunch,
    snack,
    dinner
  };


  let totals =
    calculateDayNutrition(
      state.meals
    );


  if (
    chicken &&
    totals.protein <
      targets.protein
  ) {

    const chickenFood =
      getFood(chicken);

    if (
      chickenFood &&
      Number(
        chickenFood.protein
      ) > 0
    ) {

      const missingProtein =
        targets.protein -
        totals.protein;

      const additionalGrams =
        Math.ceil(
          (
            missingProtein /
            Number(
              chickenFood.protein
            )
          ) *
          100
        );

      if (
        additionalGrams > 0
      ) {

        state.meals.dinner.push({
          id:
            `generated-${Date.now()}-13`,

          food:
            chicken,

          grams:
            additionalGrams
        });

      }

    }

  }


  saveState();

  renderJournal();
  renderDashboard();

  notify(
    `Journée générée pour ${
      Math.round(
        targets.calories
      )
    } kcal 🍽️`
  );
}


/* =========================================================
   RÉINITIALISER LA JOURNÉE
========================================================= */

function clearCurrentDay(
  showNotification = true
) {

  state.meals = {
    breakfast: [],
    lunch: [],
    snack: [],
    dinner: []
  };

  saveState();

  renderJournal();
  renderDashboard();

  if (showNotification) {

    notify(
      "Journée réinitialisée 🗑️"
    );

  }
}

/* =========================================================
   BLOC 10 — PLANNING HEBDOMADAIRE
========================================================= */

function generateWeek() {

  if (
    typeof RECIPES === "undefined" ||
    !Array.isArray(RECIPES) ||
    !RECIPES.length
  ) {
    notify("Aucune recette disponible ❌");
    return;
  }

  const targets = getDailyTargets(state.profile);

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];

  const week = {};

  days.forEach((day, index) => {

    const dayRecipes = [];

    const shuffled = [...RECIPES]
      .sort(() => Math.random() - 0.5);

    const selected =
      shuffled.slice(
        0,
        Math.min(4, shuffled.length)
      );

    selected.forEach((recipe, recipeIndex) => {

      if (!recipe) return;

      dayRecipes.push({
        id:
          `planner-${Date.now()}-${index}-${recipeIndex}`,

        recipeId:
          recipe.id,

        meal:
          recipeIndex === 0
            ? "breakfast"
            : recipeIndex === 1
            ? "lunch"
            : recipeIndex === 2
            ? "snack"
            : "dinner"
      });

    });

    week[day] = dayRecipes;

  });

  state.planner = week;

  saveState();

  renderPlanner();

  notify(
    `Planning généré autour de ${
      Math.round(targets.calories)
    } kcal/jour 📅`
  );
}


/* =========================================================
   RENDU DU PLANNING
========================================================= */

function renderPlanner() {

  const container =
    $("#weekPlanner");

  if (!container) {
    return;
  }

  const days = [
    ["monday", "Lundi"],
    ["tuesday", "Mardi"],
    ["wednesday", "Mercredi"],
    ["thursday", "Jeudi"],
    ["friday", "Vendredi"],
    ["saturday", "Samedi"],
    ["sunday", "Dimanche"]
  ];

  if (!state.planner) {
    state.planner = {};
  }

  container.innerHTML =
    days
      .map(([key, label]) => {

        const entries =
          Array.isArray(
            state.planner[key]
          )
            ? state.planner[key]
            : [];

        const calories =
          entries.reduce(
            (total, entry) => {

              const nutrition =
                calculateRecipeNutrition(
                  entry.recipeId
                );

              return (
                total +
                Number(
                  nutrition.kcal || 0
                )
              );

            },
            0
          );

        const protein =
          entries.reduce(
            (total, entry) => {

              const nutrition =
                calculateRecipeNutrition(
                  entry.recipeId
                );

              return (
                total +
                Number(
                  nutrition.protein || 0
                )
              );

            },
            0
          );

        return `
          <div
            class="planner-day"
            data-planner-day="${key}"
          >

            <div class="planner-day-header">

              <div>

                <h3>
                  ${label}
                </h3>

                <span>
                  ${Math.round(calories)} kcal
                  · ${round(protein)} g protéines
                </span>

              </div>

              <button
                type="button"
                class="add-small-button"
                data-planner-add="${key}"
              >
                +
              </button>

            </div>

            <div class="planner-day-meals">

              ${
                entries.length
                  ? entries
                      .map(entry => {

                        const recipe =
                          getRecipe(
                            entry.recipeId
                          );

                        if (!recipe) {
                          return "";
                        }

                        return `
                          <div
                            class="planner-meal"
                          >

                            <span class="planner-meal-icon">
                              ${
                                escapeHTML(
                                  recipe.emoji ||
                                  "🍽️"
                                )
                              }
                            </span>

                            <div class="planner-meal-info">

                              <strong>
                                ${
                                  escapeHTML(
                                    recipe.name ||
                                    "Recette"
                                  )
                                }
                              </strong>

                              <small>
                                ${
                                  mealLabel(
                                    entry.meal
                                  )
                                }
                              </small>

                            </div>

                            <button
                              type="button"
                              class="icon-button planner-remove-button"
                              data-planner-remove="${key}"
                              data-planner-entry="${entry.id}"
                            >
                              ×
                            </button>

                          </div>
                        `;

                      })
                      .join("")
                  : `
                    <div class="planner-empty">
                      Aucun repas prévu
                    </div>
                  `
              }

            </div>

          </div>
        `;

      })
      .join("");


  container
    .querySelectorAll(
      "[data-planner-remove]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          removePlannerEntry(
            button.dataset.plannerRemove,
            button.dataset.plannerEntry
          );

        }
      );

    });


  container
    .querySelectorAll(
      "[data-planner-add]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openPlannerRecipeModal(
            button.dataset.plannerAdd
          );

        }
      );

    });


  updatePlannerSummary();
}


/* =========================================================
   LIBELLÉ DU REPAS
========================================================= */

function mealLabel(
  meal
) {

  const labels = {
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    snack: "Collation",
    dinner: "Dîner"
  };

  return (
    labels[meal] ||
    "Repas"
  );
}


/* =========================================================
   SUPPRIMER UN REPAS DU PLANNING
========================================================= */

function removePlannerEntry(
  day,
  entryId
) {

  if (
    !state.planner ||
    !Array.isArray(
      state.planner[day]
    )
  ) {
    return;
  }

  state.planner[day] =
    state.planner[day].filter(
      entry =>
        entry.id !== entryId
    );

  saveState();

  renderPlanner();

  notify(
    "Repas supprimé du planning."
  );
}


/* =========================================================
   AJOUT MANUEL D'UNE RECETTE AU PLANNING
========================================================= */

function addRecipeToPlanner(
  day,
  recipeId,
  meal = "lunch"
) {

  const recipe =
    getRecipe(recipeId);

  if (!recipe) {
    notify(
      "Recette introuvable ❌"
    );
    return;
  }

  if (!state.planner) {
    state.planner = {};
  }

  if (
    !Array.isArray(
      state.planner[day]
    )
  ) {
    state.planner[day] = [];
  }

  state.planner[day].push({

    id:
      `planner-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    recipeId:
      recipe.id,

    meal:
      meal

  });

  saveState();

  renderPlanner();

  notify(
    `${recipe.name} ajouté au planning ✅`
  );
}


/* =========================================================
   MODAL D'AJOUT AU PLANNING
========================================================= */

function openPlannerRecipeModal(
  day
) {

  if (
    typeof RECIPES === "undefined" ||
    !Array.isArray(RECIPES)
  ) {
    return;
  }

  const content = `
    <div class="modal-header">

      <div>

        <span class="eyebrow">
          PLANNING
        </span>

        <h2>
          Ajouter une recette
        </h2>

      </div>

    </div>

    <div class="form-group">

      <label for="plannerRecipeSelect">
        Recette
      </label>

      <select
        id="plannerRecipeSelect"
        class="select-input"
      >

        ${
          RECIPES
            .map(recipe => `
              <option
                value="${escapeHTML(
                  recipe.id
                )}"
              >
                ${
                  escapeHTML(
                    recipe.name ||
                    "Recette"
                  )
                }
              </option>
            `)
            .join("")
        }

      </select>

    </div>

    <div class="form-group">

      <label for="plannerMealSelect">
        Repas
      </label>

      <select
        id="plannerMealSelect"
        class="select-input"
      >

        <option value="breakfast">
          🌅 Petit-déjeuner
        </option>

        <option value="lunch">
          ☀️ Déjeuner
        </option>

        <option value="snack">
          🍎 Collation
        </option>

        <option value="dinner">
          🌙 Dîner
        </option>

      </select>

    </div>

    <button
      type="button"
      class="primary-button full-width"
      id="confirmPlannerRecipeButton"
    >
      Ajouter au planning
    </button>
  `;

  openModal(content);

  const confirm =
    $("#confirmPlannerRecipeButton");

  if (!confirm) {
    return;
  }

  confirm.addEventListener(
    "click",
    () => {

      const recipeId =
        $("#plannerRecipeSelect")
          ?.value;

      const meal =
        $("#plannerMealSelect")
          ?.value || "lunch";

      if (!recipeId) {
        notify(
          "Sélectionne une recette."
        );
        return;
      }

      addRecipeToPlanner(
        day,
        recipeId,
        meal
      );

      closeModal();

    }
  );
}


/* =========================================================
   RÉINITIALISER LE PLANNING
========================================================= */

function clearPlanner() {

  const confirmed =
    window.confirm(
      "Voulez-vous vraiment réinitialiser le planning de la semaine ?"
    );

  if (!confirmed) {
    return;
  }

  state.planner = {};

  saveState();

  renderPlanner();

  notify(
    "Planning réinitialisé 🗑️"
  );
}


/* =========================================================
   RÉSUMÉ DU PLANNING
========================================================= */

function updatePlannerSummary() {

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ];

  let totalCalories = 0;
  let totalProtein = 0;
  let totalBudget = 0;
  let dayCount = 0;

  days.forEach(day => {

    const entries =
      Array.isArray(
        state.planner?.[day]
      )
        ? state.planner[day]
        : [];

    if (entries.length) {
      dayCount++;
    }

    entries.forEach(entry => {

      const nutrition =
        calculateRecipeNutrition(
          entry.recipeId
        );

      totalCalories +=
        Number(
          nutrition.kcal || 0
        );

      totalProtein +=
        Number(
          nutrition.protein || 0
        );

      const recipe =
        getRecipe(
          entry.recipeId
        );

      if (recipe) {

        totalBudget +=
          Number(
            recipe.price || 0
          );

      }

    });

  });

  const divisor =
    dayCount || 1;

  setText(
    "#plannerAverageCalories",
    `${Math.round(
      totalCalories / divisor
    )} kcal`
  );

  setText(
    "#plannerAverageProtein",
    `${round(
      totalProtein / divisor
    )} g`
  );

  setText(
    "#plannerBudget",
    `${totalBudget.toFixed(2)} €`
  );
}

/* =========================================================
   BLOC 11 — LISTE DE COURSES + BUDGET
========================================================= */

function renderShopping() {

  const container =
    $("#shoppingList");

  if (!container) {
    return;
  }

  if (!Array.isArray(state.shopping)) {
    state.shopping = [];
  }

  if (!state.shopping.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          🛒
        </div>

        <h3>
          Ta liste est vide
        </h3>

        <p>
          Génère tes courses depuis ton planning
          ou ajoute un article manuellement.
        </p>

      </div>
    `;

  } else {

    container.innerHTML =
      state.shopping
        .map((item, index) => {

          const checked =
            Boolean(item.checked);

          return `
            <div
              class="shopping-item ${
                checked
                  ? "checked"
                  : ""
              }"
              data-shopping-index="${index}"
            >

              <label class="shopping-item-check">

                <input
                  type="checkbox"
                  data-shopping-check="${index}"
                  ${
                    checked
                      ? "checked"
                      : ""
                  }
                >

                <span class="shopping-custom-check">
                  ✓
                </span>

              </label>

              <div class="shopping-item-info">

                <strong>
                  ${escapeHTML(
                    item.name ||
                    "Article"
                  )}
                </strong>

                <span>
                  ${
                    item.quantity
                      ? escapeHTML(
                          String(
                            item.quantity
                          )
                        )
                      : ""
                  }

                  ${
                    item.category
                      ? ` · ${escapeHTML(
                          item.category
                        )}`
                      : ""
                  }
                </span>

              </div>

              <strong class="shopping-item-price">
                ${
                  Number(
                    item.price || 0
                  ).toFixed(2)
                } €
              </strong>

              <button
                type="button"
                class="icon-button"
                data-shopping-delete="${index}"
                aria-label="Supprimer"
              >
                🗑️
              </button>

            </div>
          `;

        })
        .join("");

  }


  container
    .querySelectorAll(
      "[data-shopping-check]"
    )
    .forEach(input => {

      input.addEventListener(
        "change",
        () => {

          const index =
            Number(
              input.dataset.shoppingCheck
            );

          if (
            !state.shopping[index]
          ) {
            return;
          }

          state.shopping[index]
            .checked =
            input.checked;

          saveState();

          renderShopping();
          updateShoppingSummary();

        }
      );

    });


  container
    .querySelectorAll(
      "[data-shopping-delete]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.shoppingDelete
            );

          removeShoppingItem(
            index
          );

        }
      );

    });


  updateShoppingSummary();
  renderShoppingCategories();
}


/* =========================================================
   GÉNÉRER LES COURSES DEPUIS LE PLANNING
========================================================= */

function generateShoppingList() {

  if (!state.planner) {
    notify(
      "Ton planning est vide ❌"
    );
    return;
  }

  const ingredientMap = {};


  const addIngredient = (
    foodId,
    grams
  ) => {

    if (!foodId || !grams) {
      return;
    }

    const food =
      getFood(foodId);

    if (!food) {
      return;
    }

    const key =
      String(food.id);

    if (!ingredientMap[key]) {

      ingredientMap[key] = {

        foodId:
          food.id,

        name:
          food.name ||
          food.label ||
          "Aliment",

        grams:
          0,

        category:
          food.category ||
          "Autres",

        price:
          Number(
            food.price ||
            food.pricePer100 ||
            0
          )

      };

    }

    ingredientMap[key].grams +=
      Number(grams);

  };


  Object.values(
    state.planner
  ).forEach(day => {

    if (!Array.isArray(day)) {
      return;
    }

    day.forEach(entry => {

      const recipe =
        getRecipe(
          entry.recipeId
        );

      if (!recipe) {
        return;
      }

      if (
        !Array.isArray(
          recipe.ingredients
        )
      ) {
        return;
      }

      recipe.ingredients.forEach(
        ingredient => {

          if (!ingredient) {
            return;
          }

          const foodId =
            ingredient.food ||
            ingredient.foodId;

          const grams =
            Number(
              ingredient.grams ||
              ingredient.quantity ||
              0
            );

          addIngredient(
            foodId,
            grams
          );

        }
      );

    });

  });


  const generated =
    Object.values(
      ingredientMap
    )
      .map(item => {

        const grams =
          Math.round(
            item.grams
          );

        const pricePer100 =
          Number(
            item.price || 0
          );

        const estimatedPrice =
          (
            grams /
            100 *
            pricePer100
          );

        return {

          id:
            `shopping-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`,

          foodId:
            item.foodId,

          name:
            item.name,

          quantity:
            `${grams} g`,

          grams:
            grams,

          category:
            item.category,

          price:
            estimatedPrice,

          checked:
            false

        };

      });


  if (!generated.length) {

    notify(
      "Aucun ingrédient trouvé dans ton planning."
    );

    return;
  }


  state.shopping =
    generated;

  saveState();

  renderShopping();

  notify(
    `${generated.length} articles ajoutés aux courses 🛒`
  );
}


/* =========================================================
   AJOUTER UN ARTICLE MANUELLEMENT
========================================================= */

function addShoppingItem(
  item
) {

  if (!item) {
    return;
  }

  if (!Array.isArray(state.shopping)) {
    state.shopping = [];
  }

  state.shopping.push({

    id:
      `shopping-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    name:
      item.name ||
      "Article",

    quantity:
      item.quantity ||
      "",

    grams:
      Number(
        item.grams || 0
      ),

    category:
      item.category ||
      "Autres",

    price:
      Number(
        item.price || 0
      ),

    checked:
      false

  });

  saveState();

  renderShopping();

  notify(
    "Article ajouté à la liste ✅"
  );
}


/* =========================================================
   MODAL AJOUT ARTICLE
========================================================= */

function openAddShoppingModal() {

  const content = `

    <div class="modal-header">

      <div>

        <span class="eyebrow">
          COURSES
        </span>

        <h2>
          Ajouter un article
        </h2>

      </div>

    </div>

    <div class="form-group">

      <label for="shoppingItemName">
        Article
      </label>

      <input
        id="shoppingItemName"
        type="text"
        placeholder="Ex : Poulet"
      >

    </div>

    <div class="form-group">

      <label for="shoppingItemQuantity">
        Quantité
      </label>

      <input
        id="shoppingItemQuantity"
        type="text"
        placeholder="Ex : 1 kg"
      >

    </div>

    <div class="form-group">

      <label for="shoppingItemCategory">
        Catégorie
      </label>

      <select
        id="shoppingItemCategory"
        class="select-input"
      >

        <option value="Protéines">
          🥩 Protéines
        </option>

        <option value="Féculents">
          🍚 Féculents
        </option>

        <option value="Fruits">
          🍎 Fruits
        </option>

        <option value="Légumes">
          🥦 Légumes
        </option>

        <option value="Produits laitiers">
          🥛 Produits laitiers
        </option>

        <option value="Épicerie">
          🥫 Épicerie
        </option>

        <option value="Boissons">
          🥤 Boissons
        </option>

        <option value="Autres">
          📦 Autres
        </option>

      </select>

    </div>

    <div class="form-group">

      <label for="shoppingItemPrice">
        Prix estimé
      </label>

      <div class="input-with-unit">

        <input
          id="shoppingItemPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
        >

        <span>
          €
        </span>

      </div>

    </div>

    <button
      type="button"
      class="primary-button full-width"
      id="confirmShoppingItemButton"
    >
      Ajouter
    </button>

  `;

  openModal(content);

  const button =
    $("#confirmShoppingItemButton");

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    () => {

      const name =
        $("#shoppingItemName")
          ?.value
          .trim();

      const quantity =
        $("#shoppingItemQuantity")
          ?.value
          .trim();

      const category =
        $("#shoppingItemCategory")
          ?.value ||
          "Autres";

      const price =
        Number(
          $("#shoppingItemPrice")
            ?.value || 0
        );


      if (!name) {

        notify(
          "Indique le nom de l'article."
        );

        return;
      }


      addShoppingItem({

        name,
        quantity,
        category,
        price

      });

      closeModal();

    }
  );
}


/* =========================================================
   SUPPRIMER UN ARTICLE
========================================================= */

function removeShoppingItem(
  index
) {

  if (
    !Array.isArray(
      state.shopping
    )
  ) {
    return;
  }

  if (
    index < 0 ||
    index >=
      state.shopping.length
  ) {
    return;
  }

  state.shopping.splice(
    index,
    1
  );

  saveState();

  renderShopping();

  notify(
    "Article supprimé 🗑️"
  );
}


/* =========================================================
   VIDER LA LISTE
========================================================= */

function clearShoppingList() {

  if (
    !Array.isArray(
      state.shopping
    ) ||
    !state.shopping.length
  ) {

    notify(
      "La liste est déjà vide."
    );

    return;
  }


  const confirmed =
    window.confirm(
      "Voulez-vous vraiment vider toute la liste de courses ?"
    );

  if (!confirmed) {
    return;
  }


  state.shopping = [];

  saveState();

  renderShopping();

  notify(
    "Liste de courses vidée 🗑️"
  );
}


/* =========================================================
   CALCUL DU BUDGET COURSES
========================================================= */

function updateShoppingSummary() {

  const items =
    Array.isArray(
      state.shopping
    )
      ? state.shopping
      : [];


  const total =
    items.reduce(
      (
        sum,
        item
      ) => {

        return (
          sum +
          Number(
            item.price || 0
          )
        );

      },
      0
    );


  const budget =
    Number(
      state.profile?.budget ||
      0
    );


  const difference =
    budget -
    total;


  setText(
    "#shoppingBudget",
    `${total.toFixed(2)} €`
  );


  setText(
    "#shoppingBudgetLimit",
    `${budget.toFixed(2)} €`
  );


  setText(
    "#shoppingBudgetDifference",
    `${difference.toFixed(2)} €`
  );


  const differenceElement =
    $("#shoppingBudgetDifference");


  if (differenceElement) {

    differenceElement.classList.toggle(
      "negative",
      difference < 0
    );

    differenceElement.classList.toggle(
      "positive",
      difference >= 0
    );

  }


  setText(
    "#homeBudget",
    `${total.toFixed(2)} €`
  );
}


/* =========================================================
   CATÉGORIES DE COURSES
========================================================= */

function renderShoppingCategories() {

  const container =
    $("#shoppingCategorySummary");

  if (!container) {
    return;
  }

  const items =
    Array.isArray(
      state.shopping
    )
      ? state.shopping
      : [];


  if (!items.length) {

    container.innerHTML = `
      <div class="empty-state">
        <p>
          Aucune catégorie.
        </p>
      </div>
    `;

    return;
  }


  const categories = {};


  items.forEach(item => {

    const category =
      item.category ||
      "Autres";

    if (!categories[category]) {

      categories[category] = {
        count: 0,
        price: 0
      };

    }

    categories[category].count++;

    categories[category].price +=
      Number(
        item.price || 0
      );

  });


  container.innerHTML =
    Object.entries(
      categories
    )
      .map(
        ([
          category,
          data
        ]) => `

          <div class="shopping-category">

            <div>

              <strong>
                ${escapeHTML(
                  category
                )}
              </strong>

              <span>
                ${data.count}
                article${
                  data.count > 1
                    ? "s"
                    : ""
                }
              </span>

            </div>

            <strong>
              ${data.price.toFixed(2)} €
            </strong>

          </div>

        `
      )
      .join("");
}


/* =========================================================
   EXPORTER LA LISTE DE COURSES
========================================================= */

function exportShoppingList() {

  const items =
    Array.isArray(
      state.shopping
    )
      ? state.shopping
      : [];


  if (!items.length) {

    notify(
      "Ta liste de courses est vide."
    );

    return;
  }


  const text =
    [
      "🛒 LISTE DE COURSES BUDGETCOOK",
      "",
      ...items.map(item =>
        `${item.checked ? "✓" : "☐"} ${
          item.name
        }${
          item.quantity
            ? ` — ${item.quantity}`
            : ""
        }${
          Number(item.price || 0) > 0
            ? ` — ${Number(
                item.price
              ).toFixed(2)} €`
            : ""
        }`
      ),
      "",
      `TOTAL : ${
        items
          .reduce(
            (
              total,
              item
            ) =>
              total +
              Number(
                item.price || 0
              ),
            0
          )
          .toFixed(2)
      } €`
    ]
      .join("\n");


  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(text)
      .then(() => {

        notify(
          "Liste copiée dans le presse-papiers 📋"
        );

      })
      .catch(() => {

        fallbackCopyText(text);

      });

  } else {

    fallbackCopyText(text);

  }
}


/* =========================================================
   COPIE COMPATIBLE MOBILE
========================================================= */

function fallbackCopyText(
  text
) {

  const textarea =
    document.createElement(
      "textarea"
    );

  textarea.value =
    text;

  textarea.style.position =
    "fixed";

  textarea.style.opacity =
    "0";

  document.body.appendChild(
    textarea
  );

  textarea.focus();
  textarea.select();

  try {

    document.execCommand(
      "copy"
    );

    notify(
      "Liste copiée 📋"
    );

  } catch (error) {

    notify(
      "Impossible de copier la liste."
    );

  }

  textarea.remove();
}

/* =========================================================
   BLOC 12 — PROGRESSION + MENSURATIONS + RÉCOMPENSES
========================================================= */

function renderProgress() {

  const profile =
    state.profile || {};

  const history =
    Array.isArray(
      state.progressHistory
    )
      ? state.progressHistory
      : [];

  const latest =
    history.length
      ? history[history.length - 1]
      : null;


  const currentWeight =
    Number(
      profile.weight ||
      latest?.weight ||
      0
    );

  const bodyFat =
    Number(
      profile.bodyFat ||
      latest?.bodyFat ||
      0
    );

  const waist =
    Number(
      profile.waist ||
      latest?.waist ||
      0
    );


  setText(
    "#progressCurrentWeight",
    currentWeight
      ? `${currentWeight} kg`
      : "-- kg"
  );


  setText(
    "#progressBodyFat",
    bodyFat
      ? `${bodyFat} %`
      : "-- %"
  );


  setText(
    "#progressWaist",
    waist
      ? `${waist} cm`
      : "-- cm"
  );


  setText(
    "#progressGoal",
    getGoalLabel(
      profile.goal
    )
  );


  setText(
    "#progressBodyFatGoal",
    profile.targetBodyFat
      ? `${profile.targetBodyFat} %`
      : "--"
  );


  setText(
    "#progressWaistGoal",
    profile.targetWaist
      ? `${profile.targetWaist} cm`
      : "--"
  );


  updateWeightChange();

  renderMeasurements();

  renderWeightChart();

  renderAchievements();
}


/* =========================================================
   AJOUTER UNE MESURE
========================================================= */

function addProgressMeasurement(
  measurement
) {

  if (!measurement) {
    return;
  }

  if (
    !Array.isArray(
      state.progressHistory
    )
  ) {
    state.progressHistory = [];
  }


  const entry = {

    id:
      `progress-${Date.now()}`,

    date:
      measurement.date ||
      new Date()
        .toISOString()
        .slice(0, 10),

    weight:
      Number(
        measurement.weight || 0
      ),

    bodyFat:
      Number(
        measurement.bodyFat || 0
      ),

    waist:
      Number(
        measurement.waist || 0
      ),

    chest:
      Number(
        measurement.chest || 0
      ),

    hips:
      Number(
        measurement.hips || 0
      ),

    arm:
      Number(
        measurement.arm || 0
      ),

    thigh:
      Number(
        measurement.thigh || 0
      ),

    neck:
      Number(
        measurement.neck || 0
      )

  };


  state.progressHistory.push(
    entry
  );


  state.progressHistory.sort(
    (a, b) =>
      new Date(a.date) -
      new Date(b.date)
  );


  /* Met à jour le profil */

  if (entry.weight > 0) {

    state.profile.weight =
      entry.weight;

  }

  if (entry.bodyFat > 0) {

    state.profile.bodyFat =
      entry.bodyFat;

  }

  if (entry.waist > 0) {

    state.profile.waist =
      entry.waist;

  }

  if (entry.chest > 0) {

    state.profile.chest =
      entry.chest;

  }

  if (entry.hips > 0) {

    state.profile.hips =
      entry.hips;

  }

  if (entry.arm > 0) {

    state.profile.arm =
      entry.arm;

  }

  if (entry.thigh > 0) {

    state.profile.thigh =
      entry.thigh;

  }

  if (entry.neck > 0) {

    state.profile.neck =
      entry.neck;

  }


  saveState();

  renderProgress();

  renderDashboard();

  notify(
    "Nouvelle mesure enregistrée 📈"
  );
}


/* =========================================================
   MODAL NOUVELLE MESURE
========================================================= */

function openProgressModal() {

  const profile =
    state.profile || {};


  const content = `

    <div class="modal-header">

      <div>

        <span class="eyebrow">
          PROGRESSION
        </span>

        <h2>
          Nouvelle mesure
        </h2>

      </div>

    </div>


    <div class="form-grid">

      <div class="form-group">

        <label for="progressDate">
          Date
        </label>

        <input
          id="progressDate"
          type="date"
          value="${
            new Date()
              .toISOString()
              .slice(0, 10)
          }"
        >

      </div>


      <div class="form-group">

        <label for="progressWeightInput">
          Poids
        </label>

        <div class="input-with-unit">

          <input
            id="progressWeightInput"
            type="number"
            step="0.1"
            value="${
              profile.weight || ""
            }"
          >

          <span>kg</span>

        </div>

      </div>


      <div class="form-group">

        <label for="progressBodyFatInput">
          Masse grasse
        </label>

        <div class="input-with-unit">

          <input
            id="progressBodyFatInput"
            type="number"
            step="0.1"
            value="${
              profile.bodyFat || ""
            }"
          >

          <span>%</span>

        </div>

      </div>


      <div class="form-group">

        <label for="progressWaistInput">
          Tour de taille
        </label>

        <div class="input-with-unit">

          <input
            id="progressWaistInput"
            type="number"
            step="0.1"
            value="${
              profile.waist || ""
            }"
          >

          <span>cm</span>

        </div>

      </div>


      <div class="form-group">

        <label for="progressChestInput">
          Tour de poitrine
        </label>

        <div class="input-with-unit">

          <input
            id="progressChestInput"
            type="number"
            step="0.1"
            value="${
              profile.chest || ""
            }"
          >

          <span>cm</span>

        </div>

      </div>


      <div class="form-group">

        <label for="progressHipsInput">
          Tour de hanches
        </label>

        <div class="input-with-unit">

          <input
            id="progressHipsInput"
            type="number"
            step="0.1"
            value="${
              profile.hips || ""
            }"
          >

          <span>cm</span>

        </div>

      </div>


      <div class="form-group">

        <label for="progressArmInput">
          Tour de bras
        </label>

        <div class="input-with-unit">

          <input
            id="progressArmInput"
            type="number"
            step="0.1"
            value="${
              profile.arm || ""
            }"
          >

          <span>cm</span>

        </div>

      </div>


      <div class="form-group">

        <label for="progressThighInput">
          Tour de cuisse
        </label>

        <div class="input-with-unit">

          <input
            id="progressThighInput"
            type="number"
            step="0.1"
            value="${
              profile.thigh || ""
            }"
          >

          <span>cm</span>

        </div>

      </div>


      <div class="form-group">

        <label for="progressNeckInput">
          Tour de cou
        </label>

        <div class="input-with-unit">

          <input
            id="progressNeckInput"
            type="number"
            step="0.1"
            value="${
              profile.neck || ""
            }"
          >

          <span>cm</span>

        </div>

      </div>

    </div>


    <button
      type="button"
      class="primary-button full-width"
      id="confirmProgressButton"
    >
      Enregistrer la mesure
    </button>

  `;


  openModal(content);


  const button =
    $("#confirmProgressButton");


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      const measurement = {

        date:
          $("#progressDate")
            ?.value,

        weight:
          Number(
            $("#progressWeightInput")
              ?.value || 0
          ),

        bodyFat:
          Number(
            $("#progressBodyFatInput")
              ?.value || 0
          ),

        waist:
          Number(
            $("#progressWaistInput")
              ?.value || 0
          ),

        chest:
          Number(
            $("#progressChestInput")
              ?.value || 0
          ),

        hips:
          Number(
            $("#progressHipsInput")
              ?.value || 0
          ),

        arm:
          Number(
            $("#progressArmInput")
              ?.value || 0
          ),

        thigh:
          Number(
            $("#progressThighInput")
              ?.value || 0
          ),

        neck:
          Number(
            $("#progressNeckInput")
              ?.value || 0
          )

      };


      if (
        !measurement.weight &&
        !measurement.bodyFat &&
        !measurement.waist
      ) {

        notify(
          "Ajoute au moins une mesure."
        );

        return;
      }


      addProgressMeasurement(
        measurement
      );

      closeModal();

    }
  );
}


/* =========================================================
   VARIATION DU POIDS
========================================================= */

function updateWeightChange() {

  const history =
    Array.isArray(
      state.progressHistory
    )
      ? state.progressHistory
      : [];


  const element =
    $("#progressWeightChange");


  if (!element) {
    return;
  }


  if (history.length < 2) {

    element.textContent =
      "Pas encore assez de données";

    return;
  }


  const previous =
    Number(
      history[
        history.length - 2
      ].weight || 0
    );


  const current =
    Number(
      history[
        history.length - 1
      ].weight || 0
    );


  if (
    !previous ||
    !current
  ) {

    element.textContent =
      "--";

    return;
  }


  const difference =
    current -
    previous;


  const sign =
    difference > 0
      ? "+"
      : "";


  element.textContent =
    `${sign}${difference.toFixed(
      1
    )} kg depuis la dernière mesure`;


  element.classList.toggle(
    "positive",
    difference < 0
  );

  element.classList.toggle(
    "negative",
    difference > 0
  );
}


/* =========================================================
   MENSURATIONS
========================================================= */

function renderMeasurements() {

  const profile =
    state.profile || {};


  setText(
    "#measurementWeight",
    profile.weight
      ? `${profile.weight} kg`
      : "-- kg"
  );

  setText(
    "#measurementHeight",
    profile.height
      ? `${profile.height} cm`
      : "-- cm"
  );

  setText(
    "#measurementChest",
    profile.chest
      ? `${profile.chest} cm`
      : "-- cm"
  );

  setText(
    "#measurementWaist",
    profile.waist
      ? `${profile.waist} cm`
      : "-- cm"
  );

  setText(
    "#measurementHips",
    profile.hips
      ? `${profile.hips} cm`
      : "-- cm"
  );

  setText(
    "#measurementArm",
    profile.arm
      ? `${profile.arm} cm`
      : "-- cm"
  );

  setText(
    "#measurementThigh",
    profile.thigh
      ? `${profile.thigh} cm`
      : "-- cm"
  );

  setText(
    "#measurementNeck",
    profile.neck
      ? `${profile.neck} cm`
      : "-- cm"
  );

  setText(
    "#measurementBodyFat",
    profile.bodyFat
      ? `${profile.bodyFat} %`
      : "-- %"
  );
}


/* =========================================================
   GRAPHIQUE DE POIDS
========================================================= */

function renderWeightChart() {

  const container =
    $("#weightChart");

  if (!container) {
    return;
  }


  const history =
    Array.isArray(
      state.progressHistory
    )
      ? state.progressHistory
      : [];


  const range =
    $("#progressChartRange")
      ?.value || "30";


  let filtered =
    [...history];


  if (range !== "all") {

    const days =
      Number(range);

    const limit =
      Date.now() -
      days *
      24 *
      60 *
      60 *
      1000;


    filtered =
      filtered.filter(
        item =>
          new Date(
            item.date
          ).getTime() >=
          limit
      );

  }


  filtered =
    filtered.filter(
      item =>
        Number(
          item.weight
        ) > 0
    );


  if (!filtered.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          📈
        </div>

        <h3>
          Pas encore de données
        </h3>

        <p>
          Ajoute une mesure pour commencer
          ton suivi.
        </p>

      </div>
    `;

    return;
  }


  const weights =
    filtered.map(
      item =>
        Number(
          item.weight
        )
    );


  const min =
    Math.min(...weights);

  const max =
    Math.max(...weights);


  const width = 700;
  const height = 260;

  const padding = 40;


  const usableWidth =
    width -
    padding * 2;

  const usableHeight =
    height -
    padding * 2;


  const rangeWeight =
    Math.max(
      max - min,
      1
    );


  const points =
    filtered.map(
      (item, index) => {

        const x =
          padding +
          (
            index /
            Math.max(
              filtered.length - 1,
              1
            )
          ) *
          usableWidth;


        const y =
          height -
          padding -
          (
            (
              Number(
                item.weight
              ) -
              min
            ) /
            rangeWeight
          ) *
          usableHeight;


        return {
          x,
          y,
          weight:
            Number(
              item.weight
            ),
          date:
            item.date
        };

      }
    );


  const path =
    points
      .map(
        (
          point,
          index
        ) =>
          `${
            index === 0
              ? "M"
              : "L"
          } ${
            point.x
          } ${
            point.y
          }`
      )
      .join(" ");


  container.innerHTML = `

    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="none"
      class="weight-chart-svg"
      role="img"
      aria-label="Évolution du poids"
    >

      <line
        x1="${padding}"
        y1="${padding}"
        x2="${padding}"
        y2="${
          height - padding
        }"
        class="chart-axis"
      />

      <line
        x1="${padding}"
        y1="${
          height - padding
        }"
        x2="${
          width - padding
        }"
        y2="${
          height - padding
        }"
        class="chart-axis"
      />

      <path
        d="${path}"
        class="chart-line"
        fill="none"
      />

      ${
        points
          .map(
            point => `
              <circle
                cx="${point.x}"
                cy="${point.y}"
                r="4"
                class="chart-point"
              >
                <title>
                  ${
                    point.weight
                  } kg — ${
                    point.date
                  }
                </title>
              </circle>
            `
          )
          .join("")
      }

      <text
        x="${padding}"
        y="20"
        class="chart-label"
      >
        ${max.toFixed(1)} kg
      </text>

      <text
        x="${padding}"
        y="${
          height - 10
        }"
        class="chart-label"
      >
        ${min.toFixed(1)} kg
      </text>

    </svg>
  `;
}


/* =========================================================
   RÉCOMPENSES
========================================================= */

function renderAchievements() {

  const container =
    $("#achievementsGrid");

  if (!container) {
    return;
  }


  const history =
    Array.isArray(
      state.progressHistory
    )
      ? state.progressHistory
      : [];


  const streak =
    Number(
      state.streak || 0
    );


  const mealsCount =
    getTotalMealsCount();


  const achievements = [

    {
      icon: "🔥",
      title: "Première série",
      description:
        "Commencer une série de jours suivis.",
      unlocked:
        streak >= 1
    },

    {
      icon: "📅",
      title: "7 jours",
      description:
        "Suivre ton alimentation pendant 7 jours.",
      unlocked:
        streak >= 7
    },

    {
      icon: "💪",
      title: "100 repas",
      description:
        "Enregistrer 100 repas.",
      unlocked:
        mealsCount >= 100
    },

    {
      icon: "⚖️",
      title: "Premier suivi",
      description:
        "Ajouter ta première mesure.",
      unlocked:
        history.length >= 1
    },

    {
      icon: "📈",
      title: "10 mesures",
      description:
        "Enregistrer 10 mesures de progression.",
      unlocked:
        history.length >= 10
    },

    {
      icon: "🎯",
      title: "Objectif défini",
      description:
        "Définir un objectif dans ton profil.",
      unlocked:
        Boolean(
          state.profile?.goal
        )
    }

  ];


  container.innerHTML =
    achievements
      .map(
        achievement => `

          <div
            class="achievement-card ${
              achievement.unlocked
                ? "unlocked"
                : "locked"
            }"
          >

            <div class="achievement-icon">
              ${
                achievement.unlocked
                  ? achievement.icon
                  : "🔒"
              }
            </div>

            <div>

              <strong>
                ${
                  escapeHTML(
                    achievement.title
                  )
                }
              </strong>

              <p>
                ${
                  escapeHTML(
                    achievement.description
                  )
                }
              </p>

            </div>

          </div>

        `
      )
      .join("");
}


/* =========================================================
   NOMBRE TOTAL DE REPAS
========================================================= */

function getTotalMealsCount() {

  const meals =
    state.meals || {};


  return [
    "breakfast",
    "lunch",
    "snack",
    "dinner"
  ]
    .reduce(
      (
        total,
        meal
      ) => {

        return (
          total +
          (
            Array.isArray(
              meals[meal]
            )
              ? meals[meal].length
              : 0
          )
        );

      },
      0
    );
}


/* =========================================================
   LABEL OBJECTIF
========================================================= */

function getGoalLabel(
  goal
) {

  const labels = {

    cut:
      "Perte de graisse",

    recomp:
      "Recomposition",

    maintain:
      "Maintien",

    bulk:
      "Prise de masse"

  };


  return (
    labels[goal] ||
    "--"
  );
}

/* =========================================================
   BLOC 13 — ÉVÉNEMENTS PROGRESSION
========================================================= */

function initProgressEvents() {

  /* -------------------------------------------------------
     Bouton "Nouvelle mesure"
  ------------------------------------------------------- */

  const addProgressButton =
    $("#addProgressButton");

  if (addProgressButton) {

    addProgressButton.addEventListener(
      "click",
      () => {

        openProgressModal();

      }
    );

  }


  /* -------------------------------------------------------
     Sélecteur du graphique
  ------------------------------------------------------- */

  const chartRange =
    $("#progressChartRange");

  if (chartRange) {

    chartRange.addEventListener(
      "change",
      () => {

        renderWeightChart();

      }
    );

  }


  /* -------------------------------------------------------
     Bouton "Modifier" les mensurations
  ------------------------------------------------------- */

  const editMeasurementsButton =
    $("#editMeasurementsButton");

  if (editMeasurementsButton) {

    editMeasurementsButton.addEventListener(
      "click",
      () => {

        navigateToPage(
          "profile"
        );

      }
    );

  }

}


/* =========================================================
   INITIALISATION PROGRESSION
========================================================= */

function initProgressPage() {

  renderProgress();

  initProgressEvents();

}


/* =========================================================
   RECHARGEMENT PROGRESSION
========================================================= */

function refreshProgressPage() {

  renderProgress();

}


/* =========================================================
   SUPPRESSION D'UNE MESURE
========================================================= */

function deleteProgressMeasurement(
  id
) {

  if (
    !Array.isArray(
      state.progressHistory
    )
  ) {
    return;
  }


  const index =
    state.progressHistory.findIndex(
      item =>
        item.id === id
    );


  if (index === -1) {
    return;
  }


  state.progressHistory.splice(
    index,
    1
  );


  saveState();

  renderProgress();

  notify(
    "Mesure supprimée."
  );

}


/* =========================================================
   DERNIÈRE MESURE
========================================================= */

function getLatestProgressMeasurement() {

  if (
    !Array.isArray(
      state.progressHistory
    ) ||
    !state.progressHistory.length
  ) {

    return null;

  }


  return [
    ...state.progressHistory
  ]
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    )[0];

}


/* =========================================================
   PREMIÈRE MESURE
========================================================= */

function getFirstProgressMeasurement() {

  if (
    !Array.isArray(
      state.progressHistory
    ) ||
    !state.progressHistory.length
  ) {

    return null;

  }


  return [
    ...state.progressHistory
  ]
    .sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    )[0];

}


/* =========================================================
   ÉVOLUTION TOTALE DU POIDS
========================================================= */

function getTotalWeightChange() {

  const first =
    getFirstProgressMeasurement();

  const latest =
    getLatestProgressMeasurement();


  if (
    !first ||
    !latest ||
    !first.weight ||
    !latest.weight
  ) {

    return 0;

  }


  return (
    Number(latest.weight) -
    Number(first.weight)
  );

}


/* =========================================================
   ÉVOLUTION DE LA MASSE GRASSE
========================================================= */

function getTotalBodyFatChange() {

  const first =
    getFirstProgressMeasurement();

  const latest =
    getLatestProgressMeasurement();


  if (
    !first ||
    !latest ||
    !first.bodyFat ||
    !latest.bodyFat
  ) {

    return 0;

  }


  return (
    Number(latest.bodyFat) -
    Number(first.bodyFat)
  );

}


/* =========================================================
   RÉSUMÉ PROGRESSION
========================================================= */

function getProgressSummary() {

  const first =
    getFirstProgressMeasurement();

  const latest =
    getLatestProgressMeasurement();


  return {

    measurements:
      Array.isArray(
        state.progressHistory
      )
        ? state.progressHistory.length
        : 0,

    firstWeight:
      first?.weight || 0,

    currentWeight:
      latest?.weight || 0,

    weightChange:
      getTotalWeightChange(),

    firstBodyFat:
      first?.bodyFat || 0,

    currentBodyFat:
      latest?.bodyFat || 0,

    bodyFatChange:
      getTotalBodyFatChange()

  };

}


/* =========================================================
   MISE À JOUR AUTOMATIQUE DU PROFIL APRÈS MESURE
========================================================= */

function syncLatestProgressToProfile() {

  const latest =
    getLatestProgressMeasurement();


  if (!latest) {
    return;
  }


  if (!state.profile) {
    state.profile = {};
  }


  const fields = [
    "weight",
    "bodyFat",
    "waist",
    "chest",
    "hips",
    "arm",
    "thigh",
    "neck"
  ];


  fields.forEach(
    field => {

      if (
        latest[field] !== undefined &&
        latest[field] !== null &&
        latest[field] !== ""
      ) {

        state.profile[field] =
          latest[field];

      }

    }
  );


  saveState();

}


/* =========================================================
   FORMATTAGE DATE
========================================================= */

function formatProgressDate(
  date
) {

  if (!date) {
    return "--";
  }


  const parsed =
    new Date(date);


  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {

    return "--";

  }


  return parsed.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


/* =========================================================
   FORMATAGE VARIATION
========================================================= */

function formatWeightVariation(
  value
) {

  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return "--";

  }


  if (number === 0) {

    return "0 kg";

  }


  return (
    number > 0
      ? "+"
      : ""
  ) +
    number.toFixed(1) +
    " kg";

}


/* =========================================================
   CLASSE DE VARIATION
========================================================= */

function getVariationClass(
  value,
  inverse = false
) {

  const number =
    Number(value);


  if (
    !Number.isFinite(number) ||
    number === 0
  ) {

    return "";

  }


  const positive =
    number > 0;


  if (inverse) {

    return positive
      ? "negative"
      : "positive";

  }


  return positive
    ? "positive"
    : "negative";

}


/* =========================================================
   RAFRAÎCHISSEMENT GLOBAL APRÈS UNE MESURE
========================================================= */

function refreshAfterProgressUpdate() {

  syncLatestProgressToProfile();

  renderProgress();

  if (
    typeof renderDashboard ===
    "function"
  ) {

    renderDashboard();

  }

  if (
    typeof renderProfile ===
    "function"
  ) {

    renderProfile();

  }

  if (
    typeof updateNutritionTargets ===
    "function"
  ) {

    updateNutritionTargets();

  }

}


/* =========================================================
   INITIALISATION SÉCURISÉE
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      initProgressPage();

    }
  );

} else {

  initProgressPage();

}


/* =========================================================
   BLOC 14 — RECETTES
========================================================= */

function initRecipes() {

  if (!Array.isArray(state.recipes)) {
    state.recipes = [];
  }

  renderRecipes();

  const searchInput = $("#recipeSearch");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderRecipes();
    });
  }

  const goalFilter = $("#recipeGoalFilter");

  if (goalFilter) {
    goalFilter.addEventListener("change", () => {
      renderRecipes();
    });
  }

  const createButton = $("#createRecipeButton");

  if (createButton) {
    createButton.addEventListener("click", () => {
      openRecipeModal();
    });
  }
}


/* =========================================================
   RECETTES PAR DÉFAUT
========================================================= */

function getDefaultRecipes() {

  return [

    {
      id: "recipe-chicken-rice",
      name: "Poulet & riz",
      category: "Déjeuner",
      goal: "high-protein",
      calories: 620,
      protein: 52,
      carbs: 72,
      fat: 12,
      cost: 2.40,
      ingredients: [
        {
          name: "Poulet",
          quantity: 180,
          unit: "g"
        },
        {
          name: "Riz",
          quantity: 100,
          unit: "g"
        },
        {
          name: "Légumes",
          quantity: 200,
          unit: "g"
        },
        {
          name: "Huile d'olive",
          quantity: 10,
          unit: "g"
        }
      ]
    },

    {
      id: "recipe-tuna-pasta",
      name: "Pâtes au thon",
      category: "Déjeuner",
      goal: "budget",
      calories: 590,
      protein: 42,
      carbs: 78,
      fat: 10,
      cost: 1.80,
      ingredients: [
        {
          name: "Pâtes",
          quantity: 100,
          unit: "g"
        },
        {
          name: "Thon",
          quantity: 120,
          unit: "g"
        },
        {
          name: "Tomate",
          quantity: 150,
          unit: "g"
        }
      ]
    },

    {
      id: "recipe-omelette",
      name: "Omelette protéinée",
      category: "Petit-déjeuner",
      goal: "high-protein",
      calories: 430,
      protein: 38,
      carbs: 18,
      fat: 22,
      cost: 1.60,
      ingredients: [
        {
          name: "Œufs",
          quantity: 3,
          unit: "pièce"
        },
        {
          name: "Blancs d'œufs",
          quantity: 150,
          unit: "g"
        },
        {
          name: "Pain complet",
          quantity: 60,
          unit: "g"
        }
      ]
    },

    {
      id: "recipe-yogurt",
      name: "Skyr fruits rouges",
      category: "Collation",
      goal: "low-calorie",
      calories: 260,
      protein: 25,
      carbs: 28,
      fat: 3,
      cost: 1.50,
      ingredients: [
        {
          name: "Skyr",
          quantity: 250,
          unit: "g"
        },
        {
          name: "Fruits rouges",
          quantity: 100,
          unit: "g"
        }
      ]
    },

    {
      id: "recipe-potato-beef",
      name: "Bœuf & pommes de terre",
      category: "Dîner",
      goal: "high-protein",
      calories: 650,
      protein: 48,
      carbs: 58,
      fat: 22,
      cost: 3.20,
      ingredients: [
        {
          name: "Bœuf haché 5%",
          quantity: 180,
          unit: "g"
        },
        {
          name: "Pommes de terre",
          quantity: 300,
          unit: "g"
        },
        {
          name: "Haricots verts",
          quantity: 150,
          unit: "g"
        }
      ]
    }

  ];

}


/* =========================================================
   INITIALISATION DES RECETTES
========================================================= */

function ensureRecipes() {

  if (!Array.isArray(state.recipes)) {
    state.recipes = [];
  }

  if (state.recipes.length === 0) {

    state.recipes =
      getDefaultRecipes();

    saveState();

  }

}


/* =========================================================
   AFFICHAGE DES RECETTES
========================================================= */

function renderRecipes() {

  ensureRecipes();

  const container =
    $("#recipesGrid");

  if (!container) {
    return;
  }

  const search =
    (
      $("#recipeSearch")
        ?.value || ""
    )
      .trim()
      .toLowerCase();

  const filter =
    $("#recipeGoalFilter")
      ?.value || "all";


  let recipes =
    [...state.recipes];


  /* Recherche */

  if (search) {

    recipes =
      recipes.filter(
        recipe => {

          const name =
            String(
              recipe.name || ""
            ).toLowerCase();

          const category =
            String(
              recipe.category || ""
            ).toLowerCase();

          const ingredients =
            Array.isArray(
              recipe.ingredients
            )
              ? recipe.ingredients
                  .map(
                    item =>
                      item.name || ""
                  )
                  .join(" ")
                  .toLowerCase()
              : "";

          return (
            name.includes(search) ||
            category.includes(search) ||
            ingredients.includes(search)
          );

        }
      );

  }


  /* Filtre */

  if (
    filter &&
    filter !== "all"
  ) {

    recipes =
      recipes.filter(
        recipe =>
          recipe.goal === filter
      );

  }


  if (!recipes.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          🍳
        </div>

        <h3>
          Aucune recette trouvée
        </h3>

        <p>
          Essaie une autre recherche
          ou crée ta propre recette.
        </p>

        <button
          type="button"
          class="primary-button"
          id="emptyCreateRecipeButton"
        >
          + Créer une recette
        </button>

      </div>

    `;


    const button =
      $("#emptyCreateRecipeButton");

    if (button) {

      button.addEventListener(
        "click",
        () => {
          openRecipeModal();
        }
      );

    }

    return;
  }


  container.innerHTML =
    recipes
      .map(
        recipe =>
          createRecipeCard(
            recipe
          )
      )
      .join("");


  attachRecipeCardEvents();

}


/* =========================================================
   CARTE RECETTE
========================================================= */

function createRecipeCard(
  recipe
) {

  const goalLabel =
    getRecipeGoalLabel(
      recipe.goal
    );


  return `

    <article
      class="recipe-card"
      data-recipe-id="${
        escapeHTML(
          String(
            recipe.id
          )
        )
      }"
    >

      <div class="recipe-card-top">

        <span class="recipe-category">
          ${
            escapeHTML(
              recipe.category ||
              "Recette"
            )
          }
        </span>

        <button
          type="button"
          class="recipe-menu-button"
          data-action="delete-recipe"
          data-recipe-id="${
            escapeHTML(
              String(
                recipe.id
              )
            )
          }"
          aria-label="Supprimer"
        >
          ⋮
        </button>

      </div>


      <div class="recipe-icon">
        🍽️
      </div>


      <h3>
        ${
          escapeHTML(
            recipe.name ||
            "Sans nom"
          )
        }
      </h3>


      <span class="recipe-goal">
        ${
          escapeHTML(
            goalLabel
          )
        }
      </span>


      <div class="recipe-macros">

        <div>
          <strong>
            ${
              Number(
                recipe.calories || 0
              )
            }
          </strong>
          <span>kcal</span>
        </div>

        <div>
          <strong>
            ${
              Number(
                recipe.protein || 0
              )
            }g
          </strong>
          <span>prot.</span>
        </div>

        <div>
          <strong>
            ${
              Number(
                recipe.carbs || 0
              )
            }g
          </strong>
          <span>gluc.</span>
        </div>

        <div>
          <strong>
            ${
              Number(
                recipe.fat || 0
              )
            }g
          </strong>
          <span>lip.</span>
        </div>

      </div>


      <div class="recipe-card-footer">

        <span>
          💰 ${
            Number(
              recipe.cost || 0
            ).toFixed(2)
          } €
        </span>

        <button
          type="button"
          class="secondary-button recipe-view-button"
          data-recipe-id="${
            escapeHTML(
              String(
                recipe.id
              )
            )
          }"
        >
          Voir la recette
        </button>

      </div>

    </article>

  `;

}


/* =========================================================
   LABEL OBJECTIF RECETTE
========================================================= */

function getRecipeGoalLabel(
  goal
) {

  const labels = {

    "high-protein":
      "💪 Riche en protéines",

    "low-calorie":
      "🔥 Faible en calories",

    budget:
      "💰 Petit budget"

  };


  return (
    labels[goal] ||
    "🍽️ Équilibrée"
  );

}


/* =========================================================
   ÉVÉNEMENTS CARTES RECETTES
========================================================= */

function attachRecipeCardEvents() {

  document
    .querySelectorAll(
      ".recipe-view-button"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.recipeId;

            openRecipeDetails(
              id
            );

          }
        );

      }
    );


  document
    .querySelectorAll(
      '[data-action="delete-recipe"]'
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          event => {

            event.stopPropagation();

            const id =
              button.dataset.recipeId;

            deleteRecipe(
              id
            );

          }
        );

      }
    );

}


/* =========================================================
   DÉTAIL D'UNE RECETTE
========================================================= */

function openRecipeDetails(
  id
) {

  const recipe =
    state.recipes.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!recipe) {

    notify(
      "Recette introuvable."
    );

    return;

  }


  const ingredients =
    Array.isArray(
      recipe.ingredients
    )
      ? recipe.ingredients
      : [];


  const content = `

    <div class="modal-header">

      <div>

        <span class="eyebrow">
          RECETTE
        </span>

        <h2>
          ${
            escapeHTML(
              recipe.name
            )
          }
        </h2>

      </div>

    </div>


    <div class="recipe-detail-stats">

      <div>
        <strong>
          ${recipe.calories || 0}
        </strong>
        <span>kcal</span>
      </div>

      <div>
        <strong>
          ${recipe.protein || 0}g
        </strong>
        <span>protéines</span>
      </div>

      <div>
        <strong>
          ${recipe.carbs || 0}g
        </strong>
        <span>glucides</span>
      </div>

      <div>
        <strong>
          ${recipe.fat || 0}g
        </strong>
        <span>lipides</span>
      </div>

    </div>


    <h3>
      🛒 Ingrédients
    </h3>


    <div class="recipe-ingredients">

      ${
        ingredients.length
          ? ingredients
              .map(
                ingredient => `

                  <div class="ingredient-row">

                    <span>
                      ${
                        escapeHTML(
                          ingredient.name ||
                          ""
                        )
                      }
                    </span>

                    <strong>
                      ${
                        ingredient.quantity ||
                        0
                      }
                      ${
                        escapeHTML(
                          ingredient.unit ||
                          "g"
                        )
                      }
                    </strong>

                  </div>

                `
              )
              .join("")
          : `
            <p>
              Aucun ingrédient renseigné.
            </p>
          `
      }

    </div>


    <div class="recipe-detail-footer">

      <span>
        💰 Coût estimé :
        ${
          Number(
            recipe.cost || 0
          ).toFixed(2)
        } €
      </span>

      <button
        type="button"
        class="primary-button"
        id="addRecipeToJournalButton"
      >
        Ajouter au journal
      </button>

    </div>

  `;


  openModal(content);


  const addButton =
    $("#addRecipeToJournalButton");


  if (addButton) {

    addButton.addEventListener(
      "click",
      () => {

        addRecipeToJournal(
          recipe
        );

        closeModal();

      }
    );

  }

}


/* =========================================================
   AJOUTER UNE RECETTE AU JOURNAL
========================================================= */

function addRecipeToJournal(
  recipe
) {

  const meal =
    getCurrentMealPeriod();


  if (!state.meals) {
    state.meals = {};
  }


  if (
    !Array.isArray(
      state.meals[meal]
    )
  ) {

    state.meals[meal] = [];

  }


  const item = {

    id:
      `meal-${Date.now()}`,

    type:
      "recipe",

    recipeId:
      recipe.id,

    name:
      recipe.name,

    calories:
      Number(
        recipe.calories || 0
      ),

    protein:
      Number(
        recipe.protein || 0
      ),

    carbs:
      Number(
        recipe.carbs || 0
      ),

    fat:
      Number(
        recipe.fat || 0
      ),

    quantity:
      1

  };


  state.meals[meal].push(
    item
  );


  saveState();


  if (
    typeof renderJournal ===
    "function"
  ) {

    renderJournal();

  }


  if (
    typeof renderDashboard ===
    "function"
  ) {

    renderDashboard();

  }


  notify(
    `${recipe.name} ajouté au journal 🍽️`
  );

}


/* =========================================================
   PÉRIODE DU REPAS
========================================================= */

function getCurrentMealPeriod() {

  const hour =
    new Date().getHours();


  if (hour < 11) {
    return "breakfast";
  }

  if (hour < 15) {
    return "lunch";
  }

  if (hour < 18) {
    return "snack";
  }

  return "dinner";

}


/* =========================================================
   CRÉATION D'UNE RECETTE
========================================================= */

function openRecipeModal() {

  const content = `

    <div class="modal-header">

      <div>

        <span class="eyebrow">
          NOUVELLE RECETTE
        </span>

        <h2>
          Créer une recette
        </h2>

      </div>

    </div>


    <div class="form-grid">

      <div class="form-group">

        <label for="newRecipeName">
          Nom
        </label>

        <input
          id="newRecipeName"
          type="text"
          placeholder="Ex : Poulet curry"
        >

      </div>


      <div class="form-group">

        <label for="newRecipeCategory">
          Catégorie
        </label>

        <select id="newRecipeCategory">

          <option value="Petit-déjeuner">
            Petit-déjeuner
          </option>

          <option value="Déjeuner">
            Déjeuner
          </option>

          <option value="Collation">
            Collation
          </option>

          <option value="Dîner">
            Dîner
          </option>

        </select>

      </div>


      <div class="form-group">

        <label for="newRecipeGoal">
          Objectif
        </label>

        <select id="newRecipeGoal">

          <option value="high-protein">
            Riche en protéines
          </option>

          <option value="low-calorie">
            Faible en calories
          </option>

          <option value="budget">
            Petit budget
          </option>

          <option value="balanced">
            Équilibrée
          </option>

        </select>

      </div>


      <div class="form-group">

        <label for="newRecipeCalories">
          Calories
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeCalories"
            type="number"
            min="0"
            step="1"
            value="0"
          >

          <span>kcal</span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeProtein">
          Protéines
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeProtein"
            type="number"
            min="0"
            step="0.1"
            value="0"
          >

          <span>g</span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeCarbs">
          Glucides
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeCarbs"
            type="number"
            min="0"
            step="0.1"
            value="0"
          >

          <span>g</span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeFat">
          Lipides
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeFat"
            type="number"
            min="0"
            step="0.1"
            value="0"
          >

          <span>g</span>

        </div>

      </div>


      <div class="form-group">

        <label for="newRecipeCost">
          Coût estimé
        </label>

        <div class="input-with-unit">

          <input
            id="newRecipeCost"
            type="number"
            min="0"
            step="0.01"
            value="0"
          >

          <span>€</span>

        </div>

      </div>

    </div>


    <button
      type="button"
      class="primary-button full-width"
      id="saveNewRecipeButton"
    >
      Créer la recette
    </button>

  `;


  openModal(content);


  const saveButton =
    $("#saveNewRecipeButton");


  if (!saveButton) {
    return;
  }


  saveButton.addEventListener(
    "click",
    () => {

      const name =
        $("#newRecipeName")
          ?.value
          .trim();


      if (!name) {

        notify(
          "Donne un nom à ta recette."
        );

        return;

      }


      const recipe = {

        id:
          `recipe-${Date.now()}`,

        name,

        category:
          $("#newRecipeCategory")
            ?.value ||
          "Déjeuner",

        goal:
          $("#newRecipeGoal")
            ?.value ||
          "balanced",

        calories:
          Number(
            $("#newRecipeCalories")
              ?.value || 0
          ),

        protein:
          Number(
            $("#newRecipeProtein")
              ?.value || 0
          ),

        carbs:
          Number(
            $("#newRecipeCarbs")
              ?.value || 0
          ),

        fat:
          Number(
            $("#newRecipeFat")
              ?.value || 0
          ),

        cost:
          Number(
            $("#newRecipeCost")
              ?.value || 0
          ),

        ingredients: []

      };


      state.recipes.push(
        recipe
      );


      saveState();

      renderRecipes();

      closeModal();


      notify(
        "Recette créée avec succès 🍳"
      );

    }
  );

}


/* =========================================================
   SUPPRIMER UNE RECETTE
========================================================= */

function deleteRecipe(
  id
) {

  const recipe =
    state.recipes.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!recipe) {
    return;
  }


  const confirmed =
    window.confirm(
      `Supprimer "${recipe.name}" ?`
    );


  if (!confirmed) {
    return;
  }


  state.recipes =
    state.recipes.filter(
      item =>
        String(item.id) !==
        String(id)
    );


  saveState();

  renderRecipes();


  notify(
    "Recette supprimée."
  );

}


/* =========================================================
   INITIALISATION
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      initRecipes();

    }
  );

} else {

  initRecipes();

}

/* =========================================================
   BLOC 15 — JOURNAL
========================================================= */

function ensureMeals() {

  if (!state.meals || typeof state.meals !== "object") {
    state.meals = {};
  }

  const mealTypes = [
    "breakfast",
    "lunch",
    "snack",
    "dinner"
  ];

  mealTypes.forEach(meal => {

    if (!Array.isArray(state.meals[meal])) {
      state.meals[meal] = [];
    }

  });

}


/* =========================================================
   NORMALISATION D'UN ALIMENT
========================================================= */

function normalizeMealItem(item) {

  if (!item || typeof item !== "object") {
    return null;
  }

  const food = getFood(item.food);

  if (!food) {
    return null;
  }

  const grams = Math.max(
    0,
    Number(item.grams) || 0
  );

  const nutrition =
    calculateFoodNutrition(
      food.id,
      grams
    );

  return {

    id:
      item.id ||
      `meal-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    food:
      food.id,

    grams,

    name:
      food.name ||
      "Aliment",

    kcal:
      nutrition.kcal,

    protein:
      nutrition.protein,

    carbs:
      nutrition.carbs,

    fat:
      nutrition.fat

  };

}


/* =========================================================
   AJOUTER UN ALIMENT
========================================================= */

function addFoodToMeal(
  foodId,
  grams = 100,
  mealType = null
) {

  ensureMeals();

  const food =
    getFood(foodId);

  if (!food) {

    notify(
      "Aliment introuvable."
    );

    return false;

  }

  const meal =
    mealType ||
    getCurrentMealPeriod();

  if (!state.meals[meal]) {
    state.meals[meal] = [];
  }

  const item = {

    id:
      `meal-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    food:
      food.id,

    grams:
      Math.max(
        1,
        Number(grams) || 100
      )

  };

  state.meals[meal].push(item);

  saveState();

  renderJournal();
  renderDashboard();

  notify(
    `${food.name} ajouté au journal 🍽️`
  );

  return true;

}


/* =========================================================
   SUPPRIMER UN ALIMENT
========================================================= */

function removeFoodFromMeal(
  mealType,
  itemId
) {

  ensureMeals();

  if (!Array.isArray(state.meals[mealType])) {
    return;
  }

  const before =
    state.meals[mealType].length;

  state.meals[mealType] =
    state.meals[mealType].filter(
      item =>
        String(item.id) !==
        String(itemId)
    );

  if (
    state.meals[mealType].length !==
    before
  ) {

    saveState();

    renderJournal();
    renderDashboard();

    notify(
      "Aliment supprimé."
    );

  }

}


/* =========================================================
   MODIFIER LES GRAMMES
========================================================= */

function updateMealItemGrams(
  mealType,
  itemId,
  grams
) {

  ensureMeals();

  const meal =
    state.meals[mealType];

  if (!Array.isArray(meal)) {
    return;
  }

  const item =
    meal.find(
      entry =>
        String(entry.id) ===
        String(itemId)
    );

  if (!item) {
    return;
  }

  const value =
    Number(grams);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {

    notify(
      "La quantité doit être supérieure à 0 g."
    );

    renderJournal();

    return;

  }

  item.grams =
    Math.round(
      value * 10
    ) / 10;

  saveState();

  renderJournal();
  renderDashboard();

}


/* =========================================================
   CALCUL D'UNE SECTION DU JOURNAL
========================================================= */

function getMealNutrition(
  mealType
) {

  ensureMeals();

  const items =
    state.meals[mealType];

  if (!Array.isArray(items)) {

    return {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };

  }

  return calculateMealNutrition(
    items
  );

}


/* =========================================================
   AFFICHAGE D'UNE SECTION DE REPAS
========================================================= */

function renderMealSection(
  mealType
) {

  const container =
    $(`#${mealType}Items`);

  if (!container) {
    return;
  }

  ensureMeals();

  const items =
    state.meals[mealType] || [];


  if (!items.length) {

    container.innerHTML = `

      <div class="meal-empty">

        <span>
          Aucun aliment
        </span>

        <button
          type="button"
          class="text-button journal-inline-add"
          data-meal="${mealType}"
        >
          + Ajouter
        </button>

      </div>

    `;

    return;

  }


  container.innerHTML =
    items
      .map(
        item =>
          createMealItemHTML(
            item,
            mealType
          )
      )
      .join("");


  attachMealItemEvents(
    container,
    mealType
  );

}


/* =========================================================
   HTML D'UN ALIMENT DU JOURNAL
========================================================= */

function createMealItemHTML(
  item,
  mealType
) {

  const food =
    getFood(item.food);

  if (!food) {
    return "";
  }

  const grams =
    Math.max(
      0,
      Number(item.grams) || 0
    );

  const nutrition =
    calculateFoodNutrition(
      food.id,
      grams
    );


  return `

    <div
      class="meal-item"
      data-item-id="${
        escapeHTML(
          String(item.id)
        )
      }"
    >

      <div class="meal-item-info">

        <div class="meal-item-icon">
          🍽️
        </div>

        <div>

          <strong>
            ${
              escapeHTML(
                food.name ||
                "Aliment"
              )
            }
          </strong>

          <span>
            ${
              Math.round(
                nutrition.kcal
              )
            } kcal
          </span>

        </div>

      </div>


      <div class="meal-item-macros">

        <span>
          P ${
            round(
              nutrition.protein
            )
          }g
        </span>

        <span>
          G ${
            round(
              nutrition.carbs
            )
          }g
        </span>

        <span>
          L ${
            round(
              nutrition.fat
            )
          }g
        </span>

      </div>


      <div class="meal-item-actions">

        <div class="grams-control">

          <button
            type="button"
            class="grams-minus"
            data-action="minus"
          >
            −
          </button>

          <input
            type="number"
            min="1"
            step="1"
            value="${grams}"
            class="grams-input"
            data-action="grams"
          >

          <span>g</span>

          <button
            type="button"
            class="grams-plus"
            data-action="plus"
          >
            +
          </button>

        </div>


        <button
          type="button"
          class="delete-meal-item"
          data-action="delete"
          aria-label="Supprimer"
        >
          🗑️
        </button>

      </div>

    </div>

  `;

}


/* =========================================================
   ÉVÉNEMENTS DES ALIMENTS
========================================================= */

function attachMealItemEvents(
  container,
  mealType
) {

  container
    .querySelectorAll(
      ".meal-item"
    )
    .forEach(itemElement => {

      const itemId =
        itemElement.dataset.itemId;

      const item =
        state.meals[mealType]
          ?.find(
            entry =>
              String(entry.id) ===
              String(itemId)
          );

      if (!item) {
        return;
      }


      /* PLUS */

      const plusButton =
        itemElement.querySelector(
          '[data-action="plus"]'
        );

      if (plusButton) {

        plusButton.addEventListener(
          "click",
          () => {

            const current =
              Number(item.grams) || 0;

            updateMealItemGrams(
              mealType,
              itemId,
              current + 10
            );

          }
        );

      }


      /* MOINS */

      const minusButton =
        itemElement.querySelector(
          '[data-action="minus"]'
        );

      if (minusButton) {

        minusButton.addEventListener(
          "click",
          () => {

            const current =
              Number(item.grams) || 0;

            const next =
              Math.max(
                1,
                current - 10
              );

            updateMealItemGrams(
              mealType,
              itemId,
              next
            );

          }
        );

      }


      /* INPUT GRAMMES */

      const gramsInput =
        itemElement.querySelector(
          '[data-action="grams"]'
        );

      if (gramsInput) {

        gramsInput.addEventListener(
          "change",
          () => {

            updateMealItemGrams(
              mealType,
              itemId,
              gramsInput.value
            );

          }
        );

        gramsInput.addEventListener(
          "keydown",
          event => {

            if (
              event.key ===
              "Enter"
            ) {

              event.preventDefault();

              gramsInput.blur();

            }

          }
        );

      }


      /* SUPPRESSION */

      const deleteButton =
        itemElement.querySelector(
          '[data-action="delete"]'
        );

      if (deleteButton) {

        deleteButton.addEventListener(
          "click",
          () => {

            removeFoodFromMeal(
              mealType,
              itemId
            );

          }
        );

      }

    });


  container
    .querySelectorAll(
      ".journal-inline-add"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openFoodPicker(
            button.dataset.meal
          );

        }
      );

    });

}


/* =========================================================
   JOURNAL COMPLET
========================================================= */

function renderJournal() {

  ensureMeals();

  const targets =
    getDailyTargets(
      state.profile
    );

  const totals =
    calculateDayNutrition(
      state.meals
    );


  /* Résumé */

  setText(
    "#journalCalories",
    Math.round(
      totals.kcal
    )
  );

  setText(
    "#journalCaloriesTarget",
    Math.round(
      targets.calories
    )
  );

  setText(
    "#journalProtein",
    round(
      totals.protein
    )
  );

  setText(
    "#journalProteinTarget",
    round(
      targets.protein
    )
  );

  setText(
    "#journalCarbs",
    round(
      totals.carbs
    )
  );

  setText(
    "#journalCarbsTarget",
    round(
      targets.carbs
    )
  );

  setText(
    "#journalFat",
    round(
      totals.fat
    )
  );

  setText(
    "#journalFatTarget",
    round(
      targets.fat
    )
  );


  /* Repas */

  renderMealSection(
    "breakfast"
  );

  renderMealSection(
    "lunch"
  );

  renderMealSection(
    "snack"
  );

  renderMealSection(
    "dinner"
  );


  /* Calories par repas */

  const mealTypes = [
    "breakfast",
    "lunch",
    "snack",
    "dinner"
  ];


  mealTypes.forEach(
    meal => {

      const nutrition =
        getMealNutrition(
          meal
        );

      setText(
        `#${meal}Calories`,
        `${Math.round(
          nutrition.kcal
        )} kcal`
      );

    }
  );


  updateJournalProgress();

}


/* =========================================================
   BARRES DE PROGRESSION JOURNAL
========================================================= */

function updateJournalProgress() {

  const targets =
    getDailyTargets(
      state.profile
    );

  const totals =
    calculateDayNutrition(
      state.meals
    );


  const caloriePercent =
    targets.calories > 0
      ? clamp(
          (
            totals.kcal /
            targets.calories
          ) * 100,
          0,
          100
        )
      : 0;


  const proteinPercent =
    targets.protein > 0
      ? clamp(
          (
            totals.protein /
            targets.protein
          ) * 100,
          0,
          100
        )
      : 0;


  const carbsPercent =
    targets.carbs > 0
      ? clamp(
          (
            totals.carbs /
            targets.carbs
          ) * 100,
          0,
          100
        )
      : 0;


  const fatPercent =
    targets.fat > 0
      ? clamp(
          (
            totals.fat /
            targets.fat
          ) * 100,
          0,
          100
        )
      : 0;


  const calorieBar =
    $("#journalCaloriesProgress");

  if (calorieBar) {
    calorieBar.style.width =
      `${caloriePercent}%`;
  }


  const proteinBar =
    $("#journalProteinProgress");

  if (proteinBar) {
    proteinBar.style.width =
      `${proteinPercent}%`;
  }


  const carbsBar =
    $("#journalCarbsProgress");

  if (carbsBar) {
    carbsBar.style.width =
      `${carbsPercent}%`;
  }


  const fatBar =
    $("#journalFatProgress");

  if (fatBar) {
    fatBar.style.width =
      `${fatPercent}%`;
  }

}


/* =========================================================
   INITIALISATION JOURNAL
========================================================= */

function initJournal() {

  ensureMeals();

  renderJournal();


  $$(
    ".add-small-button"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        openFoodPicker(
          button.dataset.meal
        );

      }
    );

  });


  const addButton =
    $("#journalAddButton");

  if (addButton) {

    addButton.addEventListener(
      "click",
      () => {

        openFoodPicker(
          getCurrentMealPeriod()
        );

      }
    );

  }


  const addMealButton =
    $("#addMealButton");

  if (addMealButton) {

    addMealButton.addEventListener(
      "click",
      () => {

        openFoodPicker(
          getCurrentMealPeriod()
        );

      }
    );

  }

}

/* =========================================================
   BLOC 16 — SÉLECTEUR D'ALIMENTS
========================================================= */

function openFoodPicker(mealType = null) {

  const selectedMeal =
    mealType || getCurrentMealPeriod();

  const foods =
    getAllFoods();

  if (!Array.isArray(foods) || foods.length === 0) {

    notify(
      "Aucun aliment disponible."
    );

    return;

  }


  const content = `

    <div class="modal-header">

      <div>

        <span class="eyebrow">
          JOURNAL
        </span>

        <h2>
          Ajouter un aliment
        </h2>

        <p>
          Choisis un aliment puis indique la quantité.
        </p>

      </div>

    </div>


    <div class="food-picker">

      <div class="form-group">

        <label for="foodPickerSearch">
          Rechercher
        </label>

        <input
          id="foodPickerSearch"
          class="search-input"
          type="search"
          placeholder="🔎 Poulet, riz, thon..."
          autocomplete="off"
        >

      </div>


      <div class="form-group">

        <label for="foodPickerMeal">
          Repas
        </label>

        <select id="foodPickerMeal">

          <option
            value="breakfast"
            ${selectedMeal === "breakfast" ? "selected" : ""}
          >
            🌅 Petit-déjeuner
          </option>

          <option
            value="lunch"
            ${selectedMeal === "lunch" ? "selected" : ""}
          >
            ☀️ Déjeuner
          </option>

          <option
            value="snack"
            ${selectedMeal === "snack" ? "selected" : ""}
          >
            🍎 Collation
          </option>

          <option
            value="dinner"
            ${selectedMeal === "dinner" ? "selected" : ""}
          >
            🌙 Dîner
          </option>

        </select>

      </div>


      <div
        id="foodPickerList"
        class="food-picker-list"
      ></div>

    </div>

  `;


  openModal(content);


  const searchInput =
    $("#foodPickerSearch");

  const list =
    $("#foodPickerList");


  function renderPickerList() {

    if (!list) {
      return;
    }

    const search =
      (
        searchInput?.value ||
        ""
      )
        .trim()
        .toLowerCase();


    const filtered =
      foods.filter(food => {

        const name =
          String(
            food.name || ""
          ).toLowerCase();

        const category =
          String(
            food.category || ""
          ).toLowerCase();

        return (
          !search ||
          name.includes(search) ||
          category.includes(search)
        );

      });


    if (!filtered.length) {

      list.innerHTML = `

        <div class="empty-state">

          <div class="empty-icon">
            🔎
          </div>

          <h3>
            Aucun aliment trouvé
          </h3>

          <p>
            Essaie un autre terme.
          </p>

        </div>

      `;

      return;

    }


    list.innerHTML =
      filtered
        .map(
          food =>
            createFoodPickerItem(
              food
            )
        )
        .join("");


    list
      .querySelectorAll(
        "[data-food-id]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const foodId =
              button.dataset.foodId;

            openFoodQuantityModal(
              foodId,
              $("#foodPickerMeal")?.value ||
                selectedMeal
            );

          }
        );

      });

  }


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      renderPickerList
    );

  }


  renderPickerList();

}


/* =========================================================
   CARTE ALIMENT DU SÉLECTEUR
========================================================= */

function createFoodPickerItem(
  food
) {

  const nutrition =
    calculateFoodNutrition(
      food.id,
      100
    );


  return `

    <button
      type="button"
      class="food-picker-item"
      data-food-id="${
        escapeHTML(
          String(food.id)
        )
      }"
    >

      <div class="food-picker-icon">
        🍽️
      </div>


      <div class="food-picker-info">

        <strong>
          ${
            escapeHTML(
              food.name ||
              "Aliment"
            )
          }
        </strong>

        <span>
          ${Math.round(nutrition.kcal)} kcal
          · P ${round(nutrition.protein)}g
          · G ${round(nutrition.carbs)}g
          · L ${round(nutrition.fat)}g
          / 100 g
        </span>

      </div>


      <span class="food-picker-arrow">
        →
      </span>

    </button>

  `;

}


/* =========================================================
   QUANTITÉ DE L'ALIMENT
========================================================= */

function openFoodQuantityModal(
  foodId,
  mealType
) {

  const food =
    getFood(foodId);

  if (!food) {

    notify(
      "Aliment introuvable."
    );

    return;

  }


  const defaultGrams =
    getDefaultFoodQuantity(
      food
    );


  const content = `

    <div class="modal-header">

      <div>

        <span class="eyebrow">
          AJOUTER AU JOURNAL
        </span>

        <h2>
          ${
            escapeHTML(
              food.name
            )
          }
        </h2>

      </div>

    </div>


    <div class="food-quantity-preview">

      <div class="food-preview-icon">
        🍽️
      </div>

      <div>

        <strong>
          Valeurs pour 100 g
        </strong>

        <p>
          ${Math.round(
            calculateFoodNutrition(
              food.id,
              100
            ).kcal
          )} kcal
          ·
          P ${round(
            calculateFoodNutrition(
              food.id,
              100
            ).protein
          )} g
          ·
          G ${round(
            calculateFoodNutrition(
              food.id,
              100
            ).carbs
          )} g
          ·
          L ${round(
            calculateFoodNutrition(
              food.id,
              100
            ).fat
          )} g
        </p>

      </div>

    </div>


    <div class="form-group">

      <label for="foodQuantityInput">
        Quantité
      </label>

      <div class="input-with-unit">

        <input
          id="foodQuantityInput"
          type="number"
          min="1"
          step="1"
          value="${defaultGrams}"
          inputmode="decimal"
        >

        <span>
          g
        </span>

      </div>

    </div>


    <div
      id="foodQuantityPreview"
      class="macro-calculation-box"
    ></div>


    <button
      type="button"
      class="primary-button full-width"
      id="confirmFoodQuantityButton"
    >
      Ajouter au journal
    </button>

  `;


  openModal(content);


  const input =
    $("#foodQuantityInput");

  const preview =
    $("#foodQuantityPreview");


  function updatePreview() {

    if (!input || !preview) {
      return;
    }

    const grams =
      Math.max(
        1,
        Number(input.value) || 0
      );


    const nutrition =
      calculateFoodNutrition(
        food.id,
        grams
      );


    preview.innerHTML = `

      <div>

        <span>
          Calories
        </span>

        <strong>
          ${Math.round(
            nutrition.kcal
          )} kcal
        </strong>

      </div>

      <div>

        <span>
          Protéines
        </span>

        <strong>
          ${round(
            nutrition.protein
          )} g
        </strong>

      </div>

      <div>

        <span>
          Glucides
        </span>

        <strong>
          ${round(
            nutrition.carbs
          )} g
        </strong>

      </div>

      <div>

        <span>
          Lipides
        </span>

        <strong>
          ${round(
            nutrition.fat
          )} g
        </strong>

      </div>

    `;

  }


  if (input) {

    input.addEventListener(
      "input",
      updatePreview
    );

  }


  updatePreview();


  const confirmButton =
    $("#confirmFoodQuantityButton");


  if (confirmButton) {

    confirmButton.addEventListener(
      "click",
      () => {

        const grams =
          Number(
            input?.value || 0
          );


        if (
          !Number.isFinite(grams) ||
          grams <= 0
        ) {

          notify(
            "Entre une quantité valide."
          );

          return;

        }


        addFoodToMeal(
          food.id,
          grams,
          mealType
        );


        closeModal();

      }
    );

  }

}


/* =========================================================
   QUANTITÉ PAR DÉFAUT
========================================================= */

function getDefaultFoodQuantity(
  food
) {

  if (!food) {
    return 100;
  }


  const category =
    String(
      food.category || ""
    ).toLowerCase();


  if (
    category.includes(
      "boisson"
    )
  ) {

    return 250;

  }


  if (
    category.includes(
      "fruit"
    )
  ) {

    return 150;

  }


  if (
    category.includes(
      "viande"
    ) ||
    category.includes(
      "poisson"
    )
  ) {

    return 150;

  }


  return 100;

}


/* =========================================================
   INITIALISATION DU JOURNAL
========================================================= */

ensureMeals();

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      initJournal();

    }
  );

} else {

  initJournal();

}

/* =========================================================
   BLOC 17 — GÉNÉRATION AUTOMATIQUE DE LA JOURNÉE
========================================================= */

function generateDay() {

  ensureMeals();

  const targets =
    getDailyTargets(
      state.profile
    );


  if (
    !targets ||
    !targets.calories ||
    targets.calories <= 0
  ) {

    notify(
      "Complète ton profil pour calculer ton objectif calorique."
    );

    navigateToPage("profile");

    return;

  }


  const foods =
    getAllFoods();


  if (
    !Array.isArray(foods) ||
    foods.length === 0
  ) {

    notify(
      "Aucun aliment disponible pour générer ta journée."
    );

    return;

  }


  /*
   * On repart d'une journée vide.
   */

  state.meals = {

    breakfast: [],

    lunch: [],

    snack: [],

    dinner: []

  };


  /*
   * Répartition approximative des calories.
   *
   * Les valeurs sont des cibles de répartition,
   * pas des modifications de l'objectif calorique.
   */

  const mealTargets = {

    breakfast:
      targets.calories * 0.25,

    lunch:
      targets.calories * 0.35,

    snack:
      targets.calories * 0.10,

    dinner:
      targets.calories * 0.30

  };


  /*
   * Sélection des aliments.
   */

  const proteinFoods =
    getFoodsForGeneration(
      foods,
      "protein"
    );

  const carbFoods =
    getFoodsForGeneration(
      foods,
      "carbs"
    );

  const vegetableFoods =
    getFoodsForGeneration(
      foods,
      "vegetable"
    );

  const fatFoods =
    getFoodsForGeneration(
      foods,
      "fat"
    );


  /*
   * Si certaines catégories sont absentes,
   * on utilise toute la base alimentaire.
   */

  const proteinPool =
    proteinFoods.length
      ? proteinFoods
      : foods;

  const carbPool =
    carbFoods.length
      ? carbFoods
      : foods;

  const vegetablePool =
    vegetableFoods.length
      ? vegetableFoods
      : foods;

  const fatPool =
    fatFoods.length
      ? fatFoods
      : foods;


  /*
   * Petit-déjeuner
   */

  generateMealFromPools(
    "breakfast",
    mealTargets.breakfast,
    proteinPool,
    carbPool,
    vegetablePool,
    fatPool,
    {
      proteinRatio: 0.35,
      carbsRatio: 0.45,
      fatRatio: 0.20
    }
  );


  /*
   * Déjeuner
   */

  generateMealFromPools(
    "lunch",
    mealTargets.lunch,
    proteinPool,
    carbPool,
    vegetablePool,
    fatPool,
    {
      proteinRatio: 0.40,
      carbsRatio: 0.40,
      fatRatio: 0.20
    }
  );


  /*
   * Collation
   */

  generateSnack(
    "snack",
    mealTargets.snack,
    proteinPool,
    carbPool
  );


  /*
   * Dîner
   */

  generateMealFromPools(
    "dinner",
    mealTargets.dinner,
    proteinPool,
    carbPool,
    vegetablePool,
    fatPool,
    {
      proteinRatio: 0.40,
      carbsRatio: 0.40,
      fatRatio: 0.20
    }
  );


  saveState();

  renderJournal();
  renderDashboard();


  notify(
    "Ta journée a été générée ✨"
  );

}


/* =========================================================
   FILTRAGE DES ALIMENTS POUR LA GÉNÉRATION
========================================================= */

function getFoodsForGeneration(
  foods,
  type
) {

  if (!Array.isArray(foods)) {
    return [];
  }


  return foods.filter(
    food => {

      const category =
        String(
          food.category || ""
        ).toLowerCase();


      const name =
        String(
          food.name || ""
        ).toLowerCase();


      const nutrition =
        calculateFoodNutrition(
          food.id,
          100
        );


      if (
        type === "protein"
      ) {

        return (
          nutrition.protein >= 12 ||
          category.includes("viande") ||
          category.includes("poisson") ||
          category.includes("œuf") ||
          category.includes("oeuf") ||
          category.includes("lait") ||
          category.includes("skyr") ||
          name.includes("poulet") ||
          name.includes("thon") ||
          name.includes("saumon") ||
          name.includes("œuf") ||
          name.includes("oeuf")
        );

      }


      if (
        type === "carbs"
      ) {

        return (
          nutrition.carbs >= 15 ||
          category.includes("féculent") ||
          category.includes("céréale") ||
          category.includes("cereal") ||
          category.includes("fruit") ||
          name.includes("riz") ||
          name.includes("pâte") ||
          name.includes("pain") ||
          name.includes("avoine") ||
          name.includes("pomme")
        );

      }


      if (
        type === "vegetable"
      ) {

        return (
          category.includes("légume") ||
          category.includes("legume") ||
          name.includes("brocoli") ||
          name.includes("courgette") ||
          name.includes("haricot") ||
          name.includes("carotte") ||
          name.includes("tomate") ||
          name.includes("salade")
        );

      }


      if (
        type === "fat"
      ) {

        return (
          nutrition.fat >= 8 ||
          name.includes("huile") ||
          name.includes("avocat") ||
          name.includes("amande") ||
          name.includes("noix") ||
          name.includes("cacahuète")
        );

      }


      return true;

    }
  );

}


/* =========================================================
   CHOISIR UN ALIMENT ALÉATOIREMENT
========================================================= */

function pickRandomFood(
  foods
) {

  if (
    !Array.isArray(foods) ||
    foods.length === 0
  ) {

    return null;

  }


  return foods[
    Math.floor(
      Math.random() *
      foods.length
    )
  ];

}


/* =========================================================
   AJOUTER UNE QUANTITÉ
========================================================= */

function addGeneratedFood(
  mealType,
  food,
  grams
) {

  if (!food) {
    return;
  }


  if (!state.meals[mealType]) {
    state.meals[mealType] = [];
  }


  state.meals[mealType].push({

    id:
      `generated-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,

    food:
      food.id,

    grams:
      Math.max(
        1,
        Math.round(
          grams
        )
      )

  });

}


/* =========================================================
   GÉNÉRER UN REPAS
========================================================= */

function generateMealFromPools(
  mealType,
  calorieTarget,
  proteinPool,
  carbPool,
  vegetablePool,
  fatPool,
  ratios
) {

  if (
    !calorieTarget ||
    calorieTarget <= 0
  ) {

    return;

  }


  const proteinFood =
    pickRandomFood(
      proteinPool
    );

  const carbFood =
    pickRandomFood(
      carbPool
    );

  const vegetableFood =
    pickRandomFood(
      vegetablePool
    );

  const fatFood =
    pickRandomFood(
      fatPool
    );


  /*
   * Quantités de départ.
   *
   * Elles seront ensuite ajustées
   * pour se rapprocher de la cible calorique.
   */

  if (proteinFood) {

    addGeneratedFood(
      mealType,
      proteinFood,
      150
    );

  }


  if (carbFood) {

    addGeneratedFood(
      mealType,
      carbFood,
      100
    );

  }


  if (vegetableFood) {

    addGeneratedFood(
      mealType,
      vegetableFood,
      150
    );

  }


  if (
    fatFood &&
    fatFood.id !== proteinFood?.id &&
    fatFood.id !== carbFood?.id
  ) {

    addGeneratedFood(
      mealType,
      fatFood,
      10
    );

  }


  /*
   * Ajustement calorique.
   */

  adjustGeneratedMealCalories(
    mealType,
    calorieTarget
  );

}


/* =========================================================
   GÉNÉRER UNE COLLATION
========================================================= */

function generateSnack(
  mealType,
  calorieTarget,
  proteinPool,
  carbPool
) {

  const proteinFood =
    pickRandomFood(
      proteinPool
    );

  const carbFood =
    pickRandomFood(
      carbPool
    );


  if (proteinFood) {

    addGeneratedFood(
      mealType,
      proteinFood,
      150
    );

  }


  if (
    carbFood &&
    carbFood.id !== proteinFood?.id
  ) {

    addGeneratedFood(
      mealType,
      carbFood,
      100
    );

  }


  adjustGeneratedMealCalories(
    mealType,
    calorieTarget
  );

}


/* =========================================================
   AJUSTEMENT DES CALORIES D'UN REPAS
========================================================= */

function adjustGeneratedMealCalories(
  mealType,
  targetCalories
) {

  const meal =
    state.meals[mealType];

  if (
    !Array.isArray(meal) ||
    meal.length === 0
  ) {

    return;

  }


  let nutrition =
    calculateMealNutrition(
      meal
    );


  /*
   * On ajuste principalement le premier aliment
   * pour éviter de créer une quantité absurde
   * sur plusieurs aliments.
   */

  const firstItem =
    meal[0];


  const firstFood =
    getFood(
      firstItem.food
    );


  if (!firstFood) {
    return;
  }


  const firstNutrition =
    calculateFoodNutrition(
      firstFood.id,
      100
    );


  if (
    !firstNutrition ||
    firstNutrition.kcal <= 0
  ) {

    return;

  }


  const difference =
    targetCalories -
    nutrition.kcal;


  /*
   * Ajustement maximum pour éviter
   * des portions irréalistes.
   */

  const adjustment =
    (
      difference /
      firstNutrition.kcal
    ) * 100;


  const nextGrams =
    clamp(
      Number(firstItem.grams) +
      adjustment,
      50,
      350
    );


  firstItem.grams =
    Math.round(
      nextGrams
    );


  /*
   * Deuxième petit ajustement si nécessaire.
   */

  nutrition =
    calculateMealNutrition(
      meal
    );


  if (
    Math.abs(
      nutrition.kcal -
      targetCalories
    ) > 100
  ) {

    const lastItem =
      meal[meal.length - 1];

    const lastFood =
      getFood(
        lastItem.food
      );


    if (lastFood) {

      const lastNutrition =
        calculateFoodNutrition(
          lastFood.id,
          100
        );


      if (
        lastNutrition.kcal > 0
      ) {

        const diff =
          targetCalories -
          nutrition.kcal;


        const extra =
          (
            diff /
            lastNutrition.kcal
          ) * 100;


        lastItem.grams =
          Math.round(
            clamp(
              Number(lastItem.grams) +
              extra,
              10,
              300
            )
          );

      }

    }

  }

}


/* =========================================================
   BOUTON GÉNÉRER MA JOURNÉE
========================================================= */

function initDayGeneration() {

  const generateButton =
    $("#generateDayButton");

  if (generateButton) {

    generateButton.addEventListener(
      "click",
      () => {

        generateDay();

      }
    );

  }


  const emptyGenerateButton =
    $("#emptyGenerateButton");

  if (emptyGenerateButton) {

    emptyGenerateButton.addEventListener(
      "click",
      () => {

        generateDay();

      }
    );

  }

}


/* =========================================================
   INITIALISATION
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      initDayGeneration();

    }
  );

} else {

  initDayGeneration();

}

/* =========================================================
   BLOC 18 — RECETTES
========================================================= */

function getAllRecipes() {

  if (!Array.isArray(state.recipes)) {
    state.recipes = [];
  }

  return state.recipes;

}


/* =========================================================
   CRÉER UNE RECETTE
========================================================= */

function createRecipe() {

  const content = `

    <div class="modal-header">

      <div>

        <span class="eyebrow">
          RECETTES
        </span>

        <h2>
          Créer une recette
        </h2>

        <p>
          Crée ta propre recette et calcule automatiquement
          ses calories et ses macros.
        </p>

      </div>

    </div>


    <div class="form-group">

      <label for="recipeNameInput">
        Nom de la recette
      </label>

      <input
        id="recipeNameInput"
        type="text"
        placeholder="Ex : Pâtes au poulet"
      >

    </div>


    <div class="form-group">

      <label for="recipeDescriptionInput">
        Description
      </label>

      <textarea
        id="recipeDescriptionInput"
        rows="3"
        placeholder="Décris rapidement ta recette..."
      ></textarea>

    </div>


    <div class="form-group">

      <label for="recipeGoalInput">
        Objectif
      </label>

      <select id="recipeGoalInput">

        <option value="high-protein">
          💪 Riche en protéines
        </option>

        <option value="low-calorie">
          🔥 Faible en calories
        </option>

        <option value="budget">
          💰 Petit budget
        </option>

        <option value="balanced">
          ⚖️ Équilibrée
        </option>

      </select>

    </div>


    <div class="recipe-ingredients-builder">

      <div class="section-title-row">

        <div>

          <h3>
            Ingrédients
          </h3>

          <p>
            Ajoute les aliments et leurs quantités.
          </p>

        </div>

        <button
          type="button"
          class="secondary-button"
          id="addRecipeIngredientButton"
        >
          + Aliment
        </button>

      </div>


      <div
        id="recipeIngredientsBuilder"
        class="recipe-ingredients-builder-list"
      ></div>

    </div>


    <div
      id="recipeCreationNutrition"
      class="macro-calculation-box"
    >

      <div>

        <span>
          Calories
        </span>

        <strong>
          0 kcal
        </strong>

      </div>

      <div>

        <span>
          Protéines
        </span>

        <strong>
          0 g
        </strong>

      </div>

      <div>

        <span>
          Glucides
        </span>

        <strong>
          0 g
        </strong>

      </div>

      <div>

        <span>
          Lipides
        </span>

        <strong>
          0 g
        </strong>

      </div>

    </div>


    <button
      type="button"
      class="primary-button full-width"
      id="saveRecipeButton"
    >
      💾 Enregistrer la recette
    </button>

  `;


  openModal(content);


  const builder =
    $("#recipeIngredientsBuilder");

  let ingredients = [];


  function renderIngredients() {

    if (!builder) {
      return;
    }


    if (!ingredients.length) {

      builder.innerHTML = `

        <div class="empty-state">

          <div class="empty-icon">
            🥕
          </div>

          <h3>
            Aucun ingrédient
          </h3>

          <p>
            Ajoute ton premier aliment.
          </p>

        </div>

      `;

      updateRecipeCreationNutrition();

      return;

    }


    builder.innerHTML =
      ingredients
        .map(
          (ingredient, index) => {

            const food =
              getFood(
                ingredient.food
              );


            if (!food) {
              return "";
            }


            return `

              <div
                class="recipe-builder-item"
                data-index="${index}"
              >

                <div class="recipe-builder-info">

                  <strong>
                    ${
                      escapeHTML(
                        food.name
                      )
                    }
                  </strong>

                  <span>
                    ${
                      Math.round(
                        calculateFoodNutrition(
                          food.id,
                          ingredient.grams
                        ).kcal
                      )
                    } kcal
                  </span>

                </div>


                <div class="recipe-builder-controls">

                  <div class="input-with-unit">

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value="${ingredient.grams}"
                      data-ingredient-grams="${index}"
                    >

                    <span>
                      g
                    </span>

                  </div>


                  <button
                    type="button"
                    class="icon-button"
                    data-remove-ingredient="${index}"
                    aria-label="Supprimer"
                  >
                    🗑️
                  </button>

                </div>

              </div>

            `;

          }
        )
        .join("");


    builder
      .querySelectorAll(
        "[data-ingredient-grams]"
      )
      .forEach(input => {

        input.addEventListener(
          "input",
          () => {

            const index =
              Number(
                input.dataset.ingredientGrams
              );


            ingredients[index].grams =
              Math.max(
                1,
                Number(input.value) || 1
              );


            updateRecipeCreationNutrition();

          }
        );

      });


    builder
      .querySelectorAll(
        "[data-remove-ingredient]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const index =
              Number(
                button.dataset.removeIngredient
              );


            ingredients.splice(
              index,
              1
            );


            renderIngredients();

          }
        );

      });


    updateRecipeCreationNutrition();

  }


  function updateRecipeCreationNutrition() {

    const nutritionElement =
      $("#recipeCreationNutrition");


    if (!nutritionElement) {
      return;
    }


    let total = {

      kcal: 0,

      protein: 0,

      carbs: 0,

      fat: 0

    };


    ingredients.forEach(
      ingredient => {

        const nutrition =
          calculateFoodNutrition(
            ingredient.food,
            ingredient.grams
          );


        total.kcal +=
          nutrition.kcal;

        total.protein +=
          nutrition.protein;

        total.carbs +=
          nutrition.carbs;

        total.fat +=
          nutrition.fat;

      }
    );


    nutritionElement.innerHTML = `

      <div>

        <span>
          Calories
        </span>

        <strong>
          ${Math.round(total.kcal)} kcal
        </strong>

      </div>

      <div>

        <span>
          Protéines
        </span>

        <strong>
          ${round(total.protein)} g
        </strong>

      </div>

      <div>

        <span>
          Glucides
        </span>

        <strong>
          ${round(total.carbs)} g
        </strong>

      </div>

      <div>

        <span>
          Lipides
        </span>

        <strong>
          ${round(total.fat)} g
        </strong>

      </div>

    `;

  }


  const addIngredientButton =
    $("#addRecipeIngredientButton");


  if (addIngredientButton) {

    addIngredientButton.addEventListener(
      "click",
      () => {

        openRecipeIngredientPicker(
          food => {

            if (!food) {
              return;
            }


            ingredients.push({

              food:
                food.id,

              grams:
                100

            });


            renderIngredients();

          }
        );

      }
    );

  }


  const saveButton =
    $("#saveRecipeButton");


  if (saveButton) {

    saveButton.addEventListener(
      "click",
      () => {

        const name =
          (
            $("#recipeNameInput")?.value ||
            ""
          ).trim();


        if (!name) {

          notify(
            "Donne un nom à ta recette."
          );

          return;

        }


        if (!ingredients.length) {

          notify(
            "Ajoute au moins un ingrédient."
          );

          return;

        }


        const recipe = {

          id:
            `recipe-${Date.now()}`,

          name,

          description:
            (
              $("#recipeDescriptionInput")
                ?.value ||
              ""
            ).trim(),

          goal:
            $("#recipeGoalInput")
              ?.value ||
            "balanced",

          ingredients:
            ingredients.map(
              ingredient => ({
                food:
                  ingredient.food,

                grams:
                  ingredient.grams

              })
            ),

          createdAt:
            new Date().toISOString()

        };


        state.recipes.push(
          recipe
        );


        saveState();

        closeModal();

        renderRecipes();

        notify(
          "Recette enregistrée 🍳"
        );

      }
    );

  }


  renderIngredients();

}


/* =========================================================
   SÉLECTEUR D'INGRÉDIENT POUR RECETTE
========================================================= */

function openRecipeIngredientPicker(
  callback
) {

  const foods =
    getAllFoods();


  const content = `

    <div class="modal-header">

      <div>

        <span class="eyebrow">
          RECETTE
        </span>

        <h2>
          Ajouter un ingrédient
        </h2>

      </div>

    </div>


    <div class="form-group">

      <input
        id="recipeFoodSearch"
        class="search-input"
        type="search"
        placeholder="🔎 Rechercher un aliment..."
      >

    </div>


    <div
      id="recipeFoodPickerList"
      class="food-picker-list"
    ></div>

  `;


  openModal(content);


  const search =
    $("#recipeFoodSearch");

  const list =
    $("#recipeFoodPickerList");


  function renderList() {

    const query =
      (
        search?.value ||
        ""
      )
        .toLowerCase()
        .trim();


    const filtered =
      foods.filter(
        food => {

          const name =
            String(
              food.name || ""
            ).toLowerCase();


          return (
            !query ||
            name.includes(query)
          );

        }
      );


    list.innerHTML =
      filtered
        .map(
          food => `

            <button
              type="button"
              class="food-picker-item"
              data-recipe-food="${escapeHTML(
                String(food.id)
              )}"
            >

              <div class="food-picker-icon">
                🍽️
              </div>

              <div class="food-picker-info">

                <strong>
                  ${escapeHTML(food.name)}
                </strong>

                <span>
                  ${
                    Math.round(
                      calculateFoodNutrition(
                        food.id,
                        100
                      ).kcal
                    )
                  } kcal / 100 g
                </span>

              </div>

              <span>
                →
              </span>

            </button>

          `
        )
        .join("");


    list
      .querySelectorAll(
        "[data-recipe-food]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const food =
              getFood(
                button.dataset.recipeFood
              );


            closeModal();


            if (typeof callback === "function") {

              callback(
                food
              );

            }

          }
        );

      });

  }


  if (search) {

    search.addEventListener(
      "input",
      renderList
    );

  }


  renderList();

}


/* =========================================================
   CALCUL NUTRITION D'UNE RECETTE
========================================================= */

function calculateRecipeNutrition(
  recipe
) {

  const total = {

    kcal: 0,

    protein: 0,

    carbs: 0,

    fat: 0

  };


  if (
    !recipe ||
    !Array.isArray(
      recipe.ingredients
    )
  ) {

    return total;

  }


  recipe.ingredients.forEach(
    ingredient => {

      const nutrition =
        calculateFoodNutrition(
          ingredient.food,
          ingredient.grams
        );


      total.kcal +=
        nutrition.kcal;

      total.protein +=
        nutrition.protein;

      total.carbs +=
        nutrition.carbs;

      total.fat +=
        nutrition.fat;

    }
  );


  return total;

}


/* =========================================================
   RENDU DES RECETTES
========================================================= */

function renderRecipes() {

  const grid =
    $("#recipesGrid");


  if (!grid) {
    return;
  }


  const recipes =
    getAllRecipes();


  const search =
    (
      $("#recipeSearch")
        ?.value ||
      ""
    )
      .toLowerCase()
      .trim();


  const goal =
    $("#recipeGoalFilter")
      ?.value ||
    "all";


  const filtered =
    recipes.filter(
      recipe => {

        const name =
          String(
            recipe.name || ""
          ).toLowerCase();


        const description =
          String(
            recipe.description || ""
          ).toLowerCase();


        const matchesSearch =
          !search ||
          name.includes(search) ||
          description.includes(search);


        const matchesGoal =
          goal === "all" ||
          recipe.goal === goal;


        return (
          matchesSearch &&
          matchesGoal
        );

      }
    );


  if (!filtered.length) {

    grid.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          🍳
        </div>

        <h3>
          Aucune recette
        </h3>

        <p>
          Crée ta première recette personnalisée.
        </p>

        <button
          type="button"
          class="primary-button"
          id="emptyCreateRecipeButton"
        >
          + Créer une recette
        </button>

      </div>

    `;


    $("#emptyCreateRecipeButton")
      ?.addEventListener(
        "click",
        createRecipe
      );


    return;

  }


  grid.innerHTML =
    filtered
      .map(
        recipe =>
          createRecipeCard(
            recipe
          )
      )
      .join("");


  grid
    .querySelectorAll(
      "[data-open-recipe]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openRecipeDetails(
            button.dataset.openRecipe
          );

        }
      );

    });


}


/* =========================================================
   CARTE RECETTE
========================================================= */

function createRecipeCard(
  recipe
) {

  const nutrition =
    calculateRecipeNutrition(
      recipe
    );


  return `

    <button
      type="button"
      class="recipe-card"
      data-open-recipe="${escapeHTML(
        String(recipe.id)
      )}"
    >

      <div class="recipe-card-image">
        🍽️
      </div>

      <div class="recipe-card-content">

        <span class="eyebrow">
          ${
            escapeHTML(
              recipe.goal ||
              "RECETTE"
            )
          }
        </span>

        <h3>
          ${escapeHTML(
            recipe.name
          )}
        </h3>

        <p>
          ${
            escapeHTML(
              recipe.description ||
              "Recette personnalisée"
            )
          }
        </p>

        <div class="recipe-card-macros">

          <span>
            ${Math.round(nutrition.kcal)} kcal
          </span>

          <span>
            P ${round(nutrition.protein)}g
          </span>

          <span>
            G ${round(nutrition.carbs)}g
          </span>

          <span>
            L ${round(nutrition.fat)}g
          </span>

        </div>

      </div>

    </button>

  `;

}


/* =========================================================
   DÉTAILS D'UNE RECETTE
========================================================= */

function openRecipeDetails(
  recipeId
) {

  const recipe =
    getAllRecipes()
      .find(
        item =>
          String(item.id) ===
          String(recipeId)
      );


  if (!recipe) {

    notify(
      "Recette introuvable."
    );

    return;

  }


  const nutrition =
    calculateRecipeNutrition(
      recipe
    );


  const ingredients =
    recipe.ingredients
      .map(
        ingredient => {

          const food =
            getFood(
              ingredient.food
            );


          if (!food) {
            return "";
          }


          return `

            <div class="recipe-detail-ingredient">

              <span>
                ${escapeHTML(food.name)}
              </span>

              <strong>
                ${ingredient.grams} g
              </strong>

            </div>

          `;

        }
      )
      .join("");


  openModal(`

    <div class="modal-header">

      <span class="eyebrow">
        RECETTE
      </span>

      <h2>
        ${escapeHTML(recipe.name)}
      </h2>

      <p>
        ${escapeHTML(
          recipe.description ||
          ""
        )}
      </p>

    </div>


    <div class="macro-calculation-box">

      <div>

        <span>
          Calories
        </span>

        <strong>
          ${Math.round(nutrition.kcal)} kcal
        </strong>

      </div>

      <div>

        <span>
          Protéines
        </span>

        <strong>
          ${round(nutrition.protein)} g
        </strong>

      </div>

      <div>

        <span>
          Glucides
        </span>

        <strong>
          ${round(nutrition.carbs)} g
        </strong>

      </div>

      <div>

        <span>
          Lipides
        </span>

        <strong>
          ${round(nutrition.fat)} g
        </strong>

      </div>

    </div>


    <div class="recipe-detail-list">

      <h3>
        Ingrédients
      </h3>

      ${ingredients}

    </div>


    <button
      type="button"
      class="primary-button full-width"
      id="addRecipeToJournalButton"
    >
      + Ajouter au journal
    </button>

  `);


  $("#addRecipeToJournalButton")
    ?.addEventListener(
      "click",
      () => {

        openRecipeMealPicker(
          recipe
        );

      }
    );

}


/* =========================================================
   AJOUTER UNE RECETTE AU JOURNAL
========================================================= */

function openRecipeMealPicker(
  recipe
) {

  openModal(`

    <div class="modal-header">

      <span class="eyebrow">
        JOURNAL
      </span>

      <h2>
        Ajouter la recette
      </h2>

      <p>
        Dans quel repas veux-tu l'ajouter ?
      </p>

    </div>


    <div class="form-group">

      <label for="recipeMealSelect">
        Repas
      </label>

      <select id="recipeMealSelect">

        <option value="breakfast">
          🌅 Petit-déjeuner
        </option>

        <option value="lunch">
          ☀️ Déjeuner
        </option>

        <option value="snack">
          🍎 Collation
        </option>

        <option value="dinner">
          🌙 Dîner
        </option>

      </select>

    </div>


    <button
      type="button"
      class="primary-button full-width"
      id="confirmRecipeMealButton"
    >
      Ajouter
    </button>

  `);


  $("#confirmRecipeMealButton")
    ?.addEventListener(
      "click",
      () => {

        const meal =
          $("#recipeMealSelect")
            ?.value ||
          "dinner";


        recipe.ingredients.forEach(
          ingredient => {

            addFoodToMeal(
              ingredient.food,
              ingredient.grams,
              meal
            );

          }
        );


        closeModal();

        renderJournal();

        renderDashboard();

        notify(
          "Recette ajoutée au journal 🍽️"
        );

      }
    );

}


/* =========================================================
   INITIALISATION RECETTES
========================================================= */

function initRecipes() {

  $("#createRecipeButton")
    ?.addEventListener(
      "click",
      createRecipe
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


  renderRecipes();

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initRecipes
  );

} else {

  initRecipes();

}

/* =========================================================
   BLOC 19 — PLANNING HEBDOMADAIRE
========================================================= */

const PLANNER_DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"
];


/* =========================================================
   INITIALISER LE PLANNING
========================================================= */

function ensurePlanner() {

  if (!Array.isArray(state.planner)) {

    state.planner = PLANNER_DAYS.map(
      (day, index) => ({

        day,
        dayIndex: index,

        meals: {

          breakfast: [],
          lunch: [],
          snack: [],
          dinner: []

        }

      })
    );

  }


  while (
    state.planner.length <
    PLANNER_DAYS.length
  ) {

    const index =
      state.planner.length;


    state.planner.push({

      day:
        PLANNER_DAYS[index],

      dayIndex:
        index,

      meals: {

        breakfast: [],
        lunch: [],
        snack: [],
        dinner: []

      }

    });

  }

}


/* =========================================================
   OBTENIR LE JOUR DU PLANNING
========================================================= */

function getPlannerDay(
  index
) {

  ensurePlanner();

  return state.planner[index];

}


/* =========================================================
   CALCUL NUTRITION D'UN JOUR
========================================================= */

function calculatePlannerDayNutrition(
  day
) {

  const total = {

    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0

  };


  if (
    !day ||
    !day.meals
  ) {

    return total;

  }


  Object.values(
    day.meals
  ).forEach(
    meal => {

      if (
        !Array.isArray(meal)
      ) {

        return;

      }


      meal.forEach(
        item => {

          const nutrition =
            calculateFoodNutrition(
              item.food,
              item.grams
            );


          total.kcal +=
            nutrition.kcal;

          total.protein +=
            nutrition.protein;

          total.carbs +=
            nutrition.carbs;

          total.fat +=
            nutrition.fat;

        }
      );

    }
  );


  return total;

}


/* =========================================================
   CALCUL NUTRITION DE LA SEMAINE
========================================================= */

function calculatePlannerWeekNutrition() {

  ensurePlanner();


  const total = {

    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0

  };


  state.planner.forEach(
    day => {

      const nutrition =
        calculatePlannerDayNutrition(
          day
        );


      total.kcal +=
        nutrition.kcal;

      total.protein +=
        nutrition.protein;

      total.carbs +=
        nutrition.carbs;

      total.fat +=
        nutrition.fat;

    }
  );


  return total;

}


/* =========================================================
   AFFICHER LE PLANNING
========================================================= */

function renderPlanner() {

  ensurePlanner();


  const container =
    $("#weekPlanner");


  if (!container) {

    return;

  }


  container.innerHTML =
    state.planner
      .map(
        (day, index) =>
          createPlannerDayCard(
            day,
            index
          )
      )
      .join("");


  container
    .querySelectorAll(
      "[data-planner-add]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const dayIndex =
              Number(
                button.dataset.plannerDay
              );


            const meal =
              button.dataset.plannerAdd;


            openPlannerFoodPicker(
              dayIndex,
              meal
            );

          }
        );

      }
    );


  container
    .querySelectorAll(
      "[data-planner-remove]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const dayIndex =
              Number(
                button.dataset.plannerDay
              );


            const meal =
              button.dataset.plannerMeal;


            const itemIndex =
              Number(
                button.dataset.plannerRemove
              );


            removePlannerFood(
              dayIndex,
              meal,
              itemIndex
            );

          }
        );

      }
    );


  updatePlannerSummary();

}


/* =========================================================
   CARTE D'UN JOUR
========================================================= */

function createPlannerDayCard(
  day,
  dayIndex
) {

  const nutrition =
    calculatePlannerDayNutrition(
      day
    );


  const mealNames = {

    breakfast:
      "🌅 Petit-déjeuner",

    lunch:
      "☀️ Déjeuner",

    snack:
      "🍎 Collation",

    dinner:
      "🌙 Dîner"

  };


  const mealHTML =
    Object.keys(
      mealNames
    )
      .map(
        mealType => {

          const items =
            Array.isArray(
              day.meals?.[mealType]
            )
              ? day.meals[mealType]
              : [];


          const itemsHTML =
            items
              .map(
                (item, itemIndex) => {

                  const food =
                    getFood(
                      item.food
                    );


                  if (!food) {

                    return "";

                  }


                  const itemNutrition =
                    calculateFoodNutrition(
                      food.id,
                      item.grams
                    );


                  return `

                    <div
                      class="planner-food-item"
                    >

                      <div>

                        <strong>
                          ${escapeHTML(
                            food.name
                          )}
                        </strong>

                        <span>
                          ${item.grams} g
                          ·
                          ${Math.round(
                            itemNutrition.kcal
                          )} kcal
                        </span>

                      </div>


                      <button
                        type="button"
                        class="icon-button"
                        data-planner-remove="${itemIndex}"
                        data-planner-day="${dayIndex}"
                        data-planner-meal="${mealType}"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>

                    </div>

                  `;

                }
              )
              .join("");


          return `

            <div
              class="planner-meal"
            >

              <div
                class="planner-meal-header"
              >

                <strong>
                  ${mealNames[mealType]}
                </strong>

                <button
                  type="button"
                  class="add-small-button"
                  data-planner-add="${mealType}"
                  data-planner-day="${dayIndex}"
                >
                  +
                </button>

              </div>


              <div
                class="planner-meal-items"
              >

                ${
                  itemsHTML ||
                  `
                    <span class="planner-empty">
                      Aucun aliment
                    </span>
                  `
                }

              </div>

            </div>

          `;

        }
      )
      .join("");


  return `

    <article
      class="planner-day-card"
    >

      <div
        class="planner-day-header"
      >

        <div>

          <span class="eyebrow">
            JOUR ${dayIndex + 1}
          </span>

          <h3>
            ${day.day}
          </h3>

        </div>


        <div
          class="planner-day-calories"
        >

          <strong>
            ${Math.round(
              nutrition.kcal
            )} kcal
          </strong>

          <span>
            P ${round(
              nutrition.protein
            )} g
          </span>

        </div>

      </div>


      <div
        class="planner-meals"
      >

        ${mealHTML}

      </div>

    </article>

  `;

}


/* =========================================================
   AJOUTER UN ALIMENT AU PLANNING
========================================================= */

function addFoodToPlanner(
  dayIndex,
  mealType,
  foodId,
  grams
) {

  ensurePlanner();


  const day =
    state.planner[dayIndex];


  if (!day) {

    return;

  }


  if (
    !Array.isArray(
      day.meals[mealType]
    )
  ) {

    day.meals[mealType] = [];

  }


  day.meals[mealType].push({

    id:
      `planner-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

    food:
      foodId,

    grams:
      Math.max(
        1,
        Number(grams) || 100
      )

  });


  saveState();

  renderPlanner();

}


/* =========================================================
   SUPPRIMER UN ALIMENT DU PLANNING
========================================================= */

function removePlannerFood(
  dayIndex,
  mealType,
  itemIndex
) {

  ensurePlanner();


  const day =
    state.planner[dayIndex];


  if (!day) {

    return;

  }


  if (
    !Array.isArray(
      day.meals[mealType]
    )
  ) {

    return;

  }


  day.meals[mealType].splice(
    itemIndex,
    1
  );


  saveState();

  renderPlanner();

  notify(
    "Aliment retiré du planning."
  );

}


/* =========================================================
   SÉLECTEUR D'ALIMENT DU PLANNING
========================================================= */

function openPlannerFoodPicker(
  dayIndex,
  mealType
) {

  const foods =
    getAllFoods();


  const content = `

    <div class="modal-header">

      <span class="eyebrow">
        PLANNING
      </span>

      <h2>
        Ajouter un aliment
      </h2>

      <p>
        Ajoute un aliment à ton repas.
      </p>

    </div>


    <div class="form-group">

      <label>
        Rechercher
      </label>

      <input
        id="plannerFoodSearch"
        class="search-input"
        type="search"
        placeholder="🔎 Rechercher..."
      >

    </div>


    <div
      id="plannerFoodList"
      class="food-picker-list"
    ></div>

  `;


  openModal(content);


  const search =
    $("#plannerFoodSearch");

  const list =
    $("#plannerFoodList");


  function renderFoodList() {

    const query =
      (
        search?.value ||
        ""
      )
        .toLowerCase()
        .trim();


    const filtered =
      foods.filter(
        food => {

          const name =
            String(
              food.name || ""
            ).toLowerCase();


          return (
            !query ||
            name.includes(query)
          );

        }
      );


    list.innerHTML =
      filtered
        .map(
          food => `

            <button
              type="button"
              class="food-picker-item"
              data-planner-food="${escapeHTML(
                String(food.id)
              )}"
            >

              <div class="food-picker-icon">
                🍽️
              </div>

              <div class="food-picker-info">

                <strong>
                  ${escapeHTML(
                    food.name
                  )}
                </strong>

                <span>
                  ${Math.round(
                    calculateFoodNutrition(
                      food.id,
                      100
                    ).kcal
                  )} kcal / 100 g
                </span>

              </div>

              <span>
                →
              </span>

            </button>

          `
        )
        .join("");


    list
      .querySelectorAll(
        "[data-planner-food]"
      )
      .forEach(
        button => {

          button.addEventListener(
            "click",
            () => {

              const foodId =
                button.dataset.plannerFood;


              openPlannerQuantityModal(
                dayIndex,
                mealType,
                foodId
              );

            }
          );

        }
      );

  }


  search?.addEventListener(
    "input",
    renderFoodList
  );


  renderFoodList();

}


/* =========================================================
   QUANTITÉ POUR LE PLANNING
========================================================= */

function openPlannerQuantityModal(
  dayIndex,
  mealType,
  foodId
) {

  const food =
    getFood(
      foodId
    );


  if (!food) {

    return;

  }


  openModal(`

    <div class="modal-header">

      <span class="eyebrow">
        PLANNING
      </span>

      <h2>
        ${escapeHTML(food.name)}
      </h2>

    </div>


    <div class="form-group">

      <label for="plannerQuantity">
        Quantité
      </label>

      <div class="input-with-unit">

        <input
          id="plannerQuantity"
          type="number"
          min="1"
          value="100"
          step="1"
        >

        <span>
          g
        </span>

      </div>

    </div>


    <div
      id="plannerNutritionPreview"
      class="macro-calculation-box"
    ></div>


    <button
      type="button"
      id="confirmPlannerFood"
      class="primary-button full-width"
    >
      Ajouter au planning
    </button>

  `);


  const input =
    $("#plannerQuantity");

  const preview =
    $("#plannerNutritionPreview");


  function updatePreview() {

    const grams =
      Math.max(
        1,
        Number(input?.value) || 1
      );


    const nutrition =
      calculateFoodNutrition(
        food.id,
        grams
      );


    preview.innerHTML = `

      <div>

        <span>
          Calories
        </span>

        <strong>
          ${Math.round(
            nutrition.kcal
          )} kcal
        </strong>

      </div>

      <div>

        <span>
          Protéines
        </span>

        <strong>
          ${round(
            nutrition.protein
          )} g
        </strong>

      </div>

      <div>

        <span>
          Glucides
        </span>

        <strong>
          ${round(
            nutrition.carbs
          )} g
        </strong>

      </div>

      <div>

        <span>
          Lipides
        </span>

        <strong>
          ${round(
            nutrition.fat
          )} g
        </strong>

      </div>

    `;

  }


  input?.addEventListener(
    "input",
    updatePreview
  );


  updatePreview();


  $("#confirmPlannerFood")
    ?.addEventListener(
      "click",
      () => {

        const grams =
          Math.max(
            1,
            Number(input?.value) || 1
          );


        addFoodToPlanner(
          dayIndex,
          mealType,
          food.id,
          grams
        );


        closeModal();

        notify(
          "Aliment ajouté au planning 📅"
        );

      }
    );

}


/* =========================================================
   GÉNÉRER AUTOMATIQUEMENT LA SEMAINE
========================================================= */

function generateWeek() {

  ensurePlanner();


  const targets =
    getDailyTargets(
      state.profile
    );


  if (
    !targets ||
    !targets.calories ||
    targets.calories <= 0
  ) {

    notify(
      "Complète ton profil avant de générer la semaine."
    );

    navigateToPage(
      "profile"
    );

    return;

  }


  const foods =
    getAllFoods();


  if (
    !foods.length
  ) {

    notify(
      "Aucun aliment disponible."
    );

    return;

  }


  state.planner =
    PLANNER_DAYS.map(
      (day, index) => ({

        day,

        dayIndex:
          index,

        meals: {

          breakfast: [],
          lunch: [],
          snack: [],
          dinner: []

        }

      })
    );


  /*
   * Pour éviter d'avoir exactement
   * les mêmes repas 7 jours de suite,
   * on mélange légèrement la base.
   */

  const shuffled =
    [...foods].sort(
      () =>
        Math.random() - 0.5
    );


  const proteinPool =
    getFoodsForGeneration(
      shuffled,
      "protein"
    );


  const carbPool =
    getFoodsForGeneration(
      shuffled,
      "carbs"
    );


  const vegetablePool =
    getFoodsForGeneration(
      shuffled,
      "vegetable"
    );


  const fatPool =
    getFoodsForGeneration(
      shuffled,
      "fat"
    );


  for (
    let dayIndex = 0;
    dayIndex < 7;
    dayIndex++
  ) {

    const day =
      state.planner[dayIndex];


    const calorieTargets = {

      breakfast:
        targets.calories * 0.25,

      lunch:
        targets.calories * 0.35,

      snack:
        targets.calories * 0.10,

      dinner:
        targets.calories * 0.30

    };


    generatePlannerMeal(
      day,
      "breakfast",
      calorieTargets.breakfast,
      proteinPool.length
        ? proteinPool
        : shuffled,
      carbPool.length
        ? carbPool
        : shuffled
    );


    generatePlannerMeal(
      day,
      "lunch",
      calorieTargets.lunch,
      proteinPool.length
        ? proteinPool
        : shuffled,
      carbPool.length
        ? carbPool
        : shuffled
    );


    generatePlannerMeal(
      day,
      "snack",
      calorieTargets.snack,
      proteinPool.length
        ? proteinPool
        : shuffled,
      carbPool.length
        ? carbPool
        : shuffled
    );


    generatePlannerMeal(
      day,
      "dinner",
      calorieTargets.dinner,
      proteinPool.length
        ? proteinPool
        : shuffled,
      carbPool.length
        ? carbPool
        : shuffled
    );

  }


  saveState();

  renderPlanner();

  notify(
    "Ta semaine a été générée ✨"
  );

}


/* =========================================================
   GÉNÉRER UN REPAS DU PLANNING
========================================================= */

function generatePlannerMeal(
  day,
  mealType,
  calorieTarget,
  proteinPool,
  carbPool
) {

  if (
    !day ||
    calorieTarget <= 0
  ) {

    return;

  }


  const protein =
    pickRandomFood(
      proteinPool
    );


  const carb =
    pickRandomFood(
      carbPool
    );


  if (protein) {

    day.meals[
      mealType
    ].push({

      id:
        `planner-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      food:
        protein.id,

      grams:
        mealType === "snack"
          ? 120
          : 150

    });

  }


  if (
    carb &&
    carb.id !== protein?.id
  ) {

    day.meals[
      mealType
    ].push({

      id:
        `planner-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

      food:
        carb.id,

      grams:
        mealType === "snack"
          ? 80
          : 120

    });

  }


  /*
   * Ajustement calorique simple.
   */

  const nutrition =
    calculatePlannerDayNutrition(
      day
    );


  /*
   * Le repas est volontairement conservateur :
   * on ne crée pas de portions énormes.
   */

}


/* =========================================================
   RÉINITIALISER LE PLANNING
========================================================= */

function clearPlanner() {

  ensurePlanner();


  const confirmed =
    window.confirm(
      "Réinitialiser complètement le planning de la semaine ?"
    );


  if (!confirmed) {

    return;

  }


  state.planner =
    PLANNER_DAYS.map(
      (day, index) => ({

        day,

        dayIndex:
          index,

        meals: {

          breakfast: [],
          lunch: [],
          snack: [],
          dinner: []

        }

      })
    );


  saveState();

  renderPlanner();

  notify(
    "Planning réinitialisé."
  );

}


/* =========================================================
   RÉSUMÉ DU PLANNING
========================================================= */

function updatePlannerSummary() {

  ensurePlanner();


  const total =
    calculatePlannerWeekNutrition();


  const averageCalories =
    total.kcal / 7;


  const averageProtein =
    total.protein / 7;


  const budget =
    estimatePlannerBudget();


  const caloriesElement =
    $("#plannerAverageCalories");


  const proteinElement =
    $("#plannerAverageProtein");


  const budgetElement =
    $("#plannerBudget");


  if (caloriesElement) {

    caloriesElement.textContent =
      `${Math.round(
        averageCalories
      )} kcal`;

  }


  if (proteinElement) {

    proteinElement.textContent =
      `${Math.round(
        averageProtein
      )} g`;

  }


  if (budgetElement) {

    budgetElement.textContent =
      `${budget.toFixed(2)} €`;

  }

}


/* =========================================================
   ESTIMATION DU BUDGET
========================================================= */

function estimatePlannerBudget() {

  ensurePlanner();


  let total = 0;


  state.planner.forEach(
    day => {

      Object.values(
        day.meals
      ).forEach(
        meal => {

          if (
            !Array.isArray(meal)
          ) {

            return;

          }


          meal.forEach(
            item => {

              const food =
                getFood(
                  item.food
                );


              if (!food) {

                return;

              }


              const price =
                Number(
                  food.price ||
                  food.cost ||
                  0
                );


              if (
                price > 0
              ) {

                total +=
                  (
                    item.grams /
                    100
                  ) *
                  price;

              }

            }
          );

        }
      );

    }
  );


  return total;

}


/* =========================================================
   INITIALISATION DU PLANNING
========================================================= */

function initPlanner() {

  ensurePlanner();


  $("#generateWeekButton")
    ?.addEventListener(
      "click",
      generateWeek
    );


  $("#clearPlannerButton")
    ?.addEventListener(
      "click",
      clearPlanner
    );


  renderPlanner();

}


/* =========================================================
   INITIALISATION
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initPlanner
  );

} else {

  initPlanner();

}

