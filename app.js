const DATA = window.BUDGETCOOK_DATA;

const defaultState = {
  profile: {
    firstName:"",
    age:"",
    sex:"male",
    height:"",
    weight:"",
    activity:"1.5",
    training:"0",
    goal:"cut",
    adjustment:"300",
    budget:"50"
  },

  consumed:[],
  pantry:[],
  weights:[],
  shoppingChecked:[],
  streak:0
};

let state = loadState();

function loadState(){

  try{

    const saved = localStorage.getItem("budgetcook_state");

    if(saved){

      return {
        ...defaultState,
        ...JSON.parse(saved)
      };

    }

  }catch(e){}

  return JSON.parse(JSON.stringify(defaultState));
}

function saveState(){

  localStorage.setItem(
    "budgetcook_state",
    JSON.stringify(state)
  );

}

function $(id){
  return document.getElementById(id);
}


/* ================= CALCUL NUTRITION ================= */

function calculateNutrition(){

  const p = state.profile;

  const age = Number(p.age);
  const height = Number(p.height);
  const weight = Number(p.weight);
  const activity = Number(p.activity);
  const adjustment = Number(p.adjustment) || 300;

  if(!age || !height || !weight){

    return {
      bmr:0,
      maintenance:0,
      target:0,
      protein:0,
      fat:0,
      carbs:0
    };

  }

  let bmr;

  if(p.sex === "female"){

    bmr =
      10 * weight +
      6.25 * height -
      5 * age -
      161;

  }else{

    bmr =
      10 * weight +
      6.25 * height -
      5 * age +
      5;

  }

  const maintenance = Math.round(bmr * activity);

  let target = maintenance;

  if(p.goal === "cut"){
    target = maintenance - adjustment;
  }

  if(p.goal === "bulk"){
    target = maintenance + adjustment;
  }

  /*
    On protège contre des objectifs trop bas.
    Le calcul reste volontairement conservateur.
  */

  target = Math.max(
    p.sex === "female" ? 1200 : 1500,
    target
  );

  target = Math.round(target);

  /*
    Protéines :
    environ 2 g/kg.
    Limité à 35% des calories pour éviter
    des résultats absurdes.
  */

  let protein = Math.round(weight * 2);

  protein = Math.min(
    protein,
    Math.floor((target * .35) / 4)
  );

  /*
    Lipides :
    environ 0,8 g/kg.
  */

  let fat = Math.round(weight * .8);

  fat = Math.min(
    fat,
    Math.floor((target * .35) / 9)
  );

  /*
    Glucides = calories restantes.
  */

  let remaining =
    target -
    protein * 4 -
    fat * 9;

  let carbs =
    Math.round(Math.max(0,remaining) / 4);

  return {
    bmr:Math.round(bmr),
    maintenance,
    target,
    protein,
    fat,
    carbs
  };

}


/* ================= NAVIGATION ================= */

function showPage(page){

  document
    .querySelectorAll(".page")
    .forEach(el => el.classList.remove("active"));

  const target = $("page-"+page);

  if(target){
    target.classList.add("active");
  }

  document
    .querySelectorAll(".nav-item")
    .forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.page === page
      );

    });

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


document.addEventListener("click", e => {

  const pageButton =
    e.target.closest("[data-page]");

  if(!pageButton) return;

  showPage(pageButton.dataset.page);

});


/* ================= PROFILE ================= */

function readProfile(){

  state.profile.firstName =
    $("firstName").value.trim();

  state.profile.age =
    $("age").value;

  state.profile.sex =
    $("sex").value;

  state.profile.height =
    $("height").value;

  state.profile.weight =
    $("weight").value;

  state.profile.activity =
    $("activity").value;

  state.profile.training =
    $("training").value;

  state.profile.goal =
    $("goal").value;

  state.profile.adjustment =
    $("adjustment").value;

  state.profile.budget =
    $("budget").value;

}


function fillProfile(){

  const p = state.profile;

  $("firstName").value = p.firstName || "";
  $("age").value = p.age || "";
  $("sex").value = p.sex || "male";
  $("height").value = p.height || "";
  $("weight").value = p.weight || "";
  $("activity").value = p.activity || "1.5";
  $("training").value = p.training || "";
  $("goal").value = p.goal || "cut";
  $("adjustment").value = p.adjustment || "300";
  $("budget").value = p.budget || "";

}


$("saveProfile").addEventListener("click",()=>{

  readProfile();
  saveState();
  updateAll();

  $("profileMessage").style.display="block";

  setTimeout(()=>{
    $("profileMessage").style.display="none";
  },1800);

});


/* ================= HOME ================= */

function updateHome(){

  const nutrition = calculateNutrition();

  const name =
    state.profile.firstName ||
    "👋";

  $("homeName").textContent = name;

  $("homeCalories").textContent =
    nutrition.target || "0";

  $("homeProtein").textContent =
    nutrition.protein + "g";

  $("homeCarbs").textContent =
    nutrition.carbs + "g";

  $("homeFat").textContent =
    nutrition.fat + "g";

  $("homeBudget").textContent =
    state.profile.budget || "0";

  $("consumedCalories").textContent =
    totalConsumed().calories;

  const remaining =
    Math.max(
      0,
      nutrition.target - totalConsumed().calories
    );

  $("remainingCalories").textContent =
    remaining;

  let progress = 0;

  if(nutrition.target){

    progress =
      Math.min(
        100,
        (totalConsumed().calories /
        nutrition.target) * 100
      );

  }

  $("calorieProgress").style.width =
    progress + "%";

  let goal = "Maintien";

  if(state.profile.goal === "cut"){
    goal = "Perte de gras";
  }

  if(state.profile.goal === "bulk"){
    goal = "Prise de muscle";
  }

  $("goalBadge").textContent = goal;

  $("streakNumber").textContent =
    state.streak +
    (state.streak === 1 ? " jour" : " jours");

  renderHomeMeals();

}


/* ================= JOURNAL ================= */

function totalConsumed(){

  return state.consumed.reduce(
    (total,item)=>{

      total.calories += Number(item.calories)||0;
      total.protein += Number(item.protein)||0;
      total.carbs += Number(item.carbs)||0;
      total.fat += Number(item.fat)||0;

      return total;

    },
    {
      calories:0,
      protein:0,
      carbs:0,
      fat:0
    }
  );

}


function renderJournal(){

  const totals = totalConsumed();
  const nutrition = calculateNutrition();

  $("journalCalories").textContent =
    Math.round(totals.calories);

  $("journalTarget").textContent =
    nutrition.target || 0;

  $("journalProtein").textContent =
    Math.round(totals.protein);

  const container = $("journalMeals");

  if(!state.consumed.length){

    container.innerHTML = `
      <div class="card empty">
        Aucun aliment enregistré aujourd'hui.<br>
        Ajoute ton premier aliment 👇
      </div>
    `;

    return;

  }

  container.innerHTML =
    state.consumed.map((item,index)=>`

      <div class="meal-card">

        <div class="meal-image">
          ${item.emoji || "🍽️"}
        </div>

        <div class="meal-card-content">

          <div class="meal-type">
            ${item.meal || "ALIMENT"}
          </div>

          <h3>${escapeHTML(item.name)}</h3>

          <div class="meal-meta">
            ${item.calories} kcal ·
            ${item.protein}g protéines
          </div>

        </div>

        <button
          class="meal-add"
          style="background:#ffe0db"
          onclick="removeConsumed(${index})">
          ×
        </button>

      </div>

    `).join("");

}


function removeConsumed(index){

  state.consumed.splice(index,1);

  saveState();
  updateAll();

}


$("clearDay").addEventListener("click",()=>{

  if(!state.consumed.length) return;

  state.consumed = [];

  saveState();
  updateAll();

});


/* ================= FOOD SEARCH ================= */

function openFoodModal(){

  $("foodModal").classList.add("open");

  $("foodSearch").value="";

  renderFoodResults("");

  setTimeout(()=>{
    $("foodSearch").focus();
  },100);

}


$("openFoodSearch").addEventListener(
  "click",
  openFoodModal
);


$("closeFoodModal").addEventListener(
  "click",
  ()=>{
    $("foodModal").classList.remove("open");
  }
);


$("foodModal").addEventListener("click",e=>{

  if(e.target === $("foodModal")){
    $("foodModal").classList.remove("open");
  }

});


$("foodSearch").addEventListener(
  "input",
  e=>{
    renderFoodResults(
      e.target.value
    );
  }
);


function renderFoodResults(search){

  const query =
    search.trim().toLowerCase();

  const results =
    DATA.foods.filter(food=>
      food.name
        .toLowerCase()
        .includes(query)
    );

  $("foodResults").innerHTML =
    results.map(food=>`

      <div class="food-result">

        <div>

          <b>
            ${food.emoji}
            ${escapeHTML(food.name)}
          </b>

          <small>
            ${food.cal} kcal ·
            ${food.protein}g protéines / 100g
          </small>

        </div>

        <button onclick="addFood(${food.id})">
          +
        </button>

      </div>

    `).join("");

}


function addFood(id){

  const food =
    DATA.foods.find(f=>f.id===id);

  if(!food) return;

  /*
    Pour la V1, une portion = 100 g.
    Le moteur de portions sera développé ensuite.
  */

  state.consumed.push({

    name:food.name,

    emoji:food.emoji,

    calories:food.cal,

    protein:food.protein,

    carbs:food.carbs,

    fat:food.fat,

    meal:"ALIMENT"

  });

  saveState();
  updateAll();

  $("foodModal").classList.remove("open");

}


/* ================= MEALS ================= */

function mealCard(meal){

  return `

    <div class="meal-card">

      <div class="meal-image">
        ${meal.emoji}
      </div>

      <div class="meal-card-content">

        <div class="meal-type">
          ${meal.type}
        </div>

        <h3>${escapeHTML(meal.name)}</h3>

        <div class="meal-meta">
          ${meal.calories} kcal ·
          ${meal.protein}g protéines
        </div>

        <div class="meal-price">
          ≈ ${Number(meal.price).toFixed(2)} €
        </div>

      </div>

      <button
        class="meal-add"
        onclick='addGeneratedMeal(${JSON.stringify(meal)})'>
        +
      </button>

    </div>

  `;

}


function renderHomeMeals(){

  $("homeMeals").innerHTML =
    DATA.meals
      .slice(0,3)
      .map(mealCard)
      .join("");

}


function renderGeneratedMeals(){

  $("generatedMeals").innerHTML =
    DATA.meals
      .map(mealCard)
      .join("");

}


$("generatePlan").addEventListener(
  "click",
  generatePlan
);


function generatePlan(){

  const nutrition =
    calculateNutrition();

  if(!nutrition.target){

    alert(
      "Configure ton profil avant de générer ton plan."
    );

    showPage("profile");

    return;

  }

  const count =
    DATA.meals.length;

  const factor =
    nutrition.target / 1920;

  const generated =
    DATA.meals.map(meal=>({

      ...meal,

      calories:
        Math.round(meal.calories * factor),

      protein:
        Math.round(meal.protein * factor),

      carbs:
        Math.round(meal.carbs * factor),

      fat:
        Math.round(meal.fat * factor)

    }));

  $("generatedMeals").innerHTML =
    generated.map(mealCard).join("");

}


function addGeneratedMeal(meal){

  state.consumed.push({

    name:meal.name,
    emoji:meal.emoji,
    calories:meal.calories,
    protein:meal.protein,
    carbs:meal.carbs || 0,
    fat:meal.fat || 0,
    meal:meal.type

  });

  saveState();
  updateAll();

}


/* ================= SHOPPING ================= */

function renderStores(){

  const sorted =
    [...DATA.stores]
      .sort((a,b)=>a.price-b.price);

  const best =
    sorted[0];

  $("stores").innerHTML =
    `<div class="card">
      <div class="best-store">
        🏆 ${best.name} est le moins cher sur ce panier.
      </div>

      ${sorted.map(store=>`

        <div class="store-row">

          <div>

            <div class="store-name">
              ${store.emoji} ${store.name}
            </div>

            <div class="store-desc">
              ${store.note}
            </div>

          </div>

          <div class="store-price">
            ${store.price.toFixed(2)} €
          </div>

        </div>

      `).join("")}

      <div class="empty">
        Prix de démonstration — à remplacer par des données réelles.
      </div>
    </div>`;

}


function renderShopping(){

  $("shoppingList").innerHTML =
    DATA.shopping.map((item,index)=>`

      <div class="shopping-item">

        <div class="shopping-left">

          <button
            class="check ${state.shoppingChecked.includes(index) ? "checked":""}"
            onclick="toggleShopping(${index})">

            ${state.shoppingChecked.includes(index) ? "✓":""}

          </button>

          <div>

            <div class="item-name">
              ${item.emoji} ${item.name}
            </div>

            <div class="item-qty">
              ${item.quantity}
            </div>

          </div>

        </div>

      </div>

    `).join("");

}


function toggleShopping(index){

  if(state.shoppingChecked.includes(index)){

    state.shoppingChecked =
      state.shoppingChecked.filter(
        i=>i!==index
      );

  }else{

    state.shoppingChecked.push(index);

  }

  saveState();
  renderShopping();

}


$("checkAll").addEventListener("click",()=>{

  state.shoppingChecked =
    DATA.shopping.map((_,i)=>i);

  saveState();
  renderShopping();

});


/* ================= PANTRY ================= */

function renderPantry(){

  const container =
    $("pantryList");

  if(!state.pantry.length){

    container.innerHTML =
      `<div class="empty">
        Ton garde-manger est vide.
      </div>`;

    return;

  }

  container.innerHTML =
    state.pantry.map((item,index)=>`

      <div class="pantry-item">

        <div>

          <div class="item-name">
            🧊 ${escapeHTML(item)}
          </div>

          <div class="item-qty">
            Disponible
          </div>

        </div>

        <button
          class="delete-button"
          onclick="removePantry(${index})">
          ×
        </button>

      </div>

    `).join("");

}


$("addPantry").addEventListener("click",()=>{

  const value =
    $("pantryInput").value.trim();

  if(!value) return;

  state.pantry.push(value);

  $("pantryInput").value="";

  saveState();
  renderPantry();

});


function removePantry(index){

  state.pantry.splice(index,1);

  saveState();
  renderPantry();

}


/* ================= PROGRESS ================= */

function renderProgress(){

  const nutrition =
    calculateNutrition();

  $("progressWeight").textContent =
    state.profile.weight || 0;

  $("progressTarget").textContent =
    nutrition.target || 0;

  $("progressProtein").textContent =
    nutrition.protein || 0;

  let goal = "—";

  if(state.profile.goal==="cut"){
    goal="Perte de gras";
  }

  if(state.profile.goal==="maintain"){
    goal="Maintien";
  }

  if(state.profile.goal==="bulk"){
    goal="Muscle";
  }

  $("progressGoal").textContent=goal;

  if(!state.weights.length){

    $("weightHistory").innerHTML =
      `<div class="empty">
        Aucun poids enregistré.
      </div>`;

    return;

  }

  $("weightHistory").innerHTML =
    [...state.weights]
      .reverse()
      .map(entry=>`

        <div class="shopping-item">

          <div>

            <div class="item-name">
              ${entry.weight} kg
            </div>

            <div class="item-qty">
              ${entry.date}
            </div>

          </div>

        </div>

      `)
      .join("");

}


$("addWeight").addEventListener("click",()=>{

  const value =
    Number($("weightInput").value);

  if(!value || value<20 || value>300){

    alert("Entre un poids valide.");

    return;

  }

  state.weights.push({

    weight:value,
    date:new Date().toLocaleDateString("fr-FR")

  });

  state.profile.weight=value;

  $("weightInput").value="";

  saveState();
  fillProfile();
  updateAll();

});


/* ================= COACH ================= */

function coachAnswer(text){

  const lower =
    text.toLowerCase();

  const nutrition =
    calculateNutrition();

  if(lower.includes("protéine")){

    return `
      Avec ton objectif actuel, vise environ
      <b>${nutrition.protein} g</b> de protéines par jour.
      Poulet, œufs, skyr, thon et lentilles sont de bonnes bases.
    `;

  }

  if(lower.includes("économ") || lower.includes("budget")){

    return `
      Pour réduire ton budget, privilégie les aliments
      économiques au kilo et riches en protéines.
      Le plus intéressant est surtout d'optimiser
      <b>le panier entier</b>, pas seulement un produit.
    `;

  }

  if(lower.includes("soir")){

    return `
      Je partirais sur des <b>pâtes au thon</b> avec
      des légumes. C'est simple, rassasiant et riche
      en protéines.
    `;

  }

  if(lower.includes("calorie")){

    const totals =
      totalConsumed();

    return `
      Tu as consommé environ
      <b>${Math.round(totals.calories)} kcal</b>.
      Il te reste environ
      <b>${Math.max(0,nutrition.target-totals.calories)} kcal</b>
      sur ton objectif actuel.
    `;

  }

  return `
    Je peux t'aider avec tes calories, tes macros,
    tes repas, ton budget ou tes courses.
    Demande-moi quelque chose de précis 😎
  `;

}


function sendChat(){

  const input =
    $("chatInput");

  const text =
    input.value.trim();

  if(!text) return;

  const chat =
    $("chatMessages");

  chat.innerHTML += `
    <div class="chat user">
      ${escapeHTML(text)}
    </div>
  `;

  const answer =
    coachAnswer(text);

  setTimeout(()=>{

    chat.innerHTML += `
      <div class="chat bot">
        🤖 ${answer}
      </div>
    `;

    chat.scrollTop =
      chat.scrollHeight;

  },180);

  input.value="";

}


$("sendChat").addEventListener(
  "click",
  sendChat
);


$("chatInput").addEventListener(
  "keydown",
  e=>{
    if(e.key==="Enter"){
      sendChat();
    }
  }
);


document.querySelectorAll("[data-question]")
.forEach(button=>{

  button.addEventListener("click",()=>{

    $("chatInput").value =
      button.dataset.question;

    sendChat();

  });

});


/* ================= UTIL ================= */

function escapeHTML(value){

  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


/* ================= UPDATE ================= */

function updateAll(){

  updateHome();
  renderJournal();
  renderGeneratedMeals();
  renderShopping();
  renderPantry();
  renderProgress();

  const n =
    calculateNutrition();

  $("maintenance").textContent =
    n.maintenance || 0;

  $("targetCalories").textContent =
    n.target || 0;

  $("targetProtein").textContent =
    n.protein || 0;

  $("targetCarbs").textContent =
    n.carbs || 0;

  $("targetFat").textContent =
    n.fat || 0;

}


/* ================= INIT ================= */

fillProfile();
updateAll();

if("serviceWorker" in navigator){

  window.addEventListener("load",()=>{

    navigator.serviceWorker
      .register("sw.js")
      .catch(()=>{});

  });

}
