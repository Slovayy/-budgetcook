/* =========================================================
   MACROS — BUDGETCOOK V4
   CALCUL RIGOUREUX
========================================================= */

/*
  RÈGLES :

  PROTÉINES
  = 2 g par kg de poids corporel

  LIPIDES
  = 0,8 g par kg de poids corporel

  GLUCIDES
  = calories restantes après protéines + lipides

  CALORIES :
  protéines = 4 kcal/g
  glucides  = 4 kcal/g
  lipides   = 9 kcal/g
*/


function calculateMacroTargets() {

  const calories =
    calculateTargetCalories();

  const weight =
    Number(state.profile.weight) || 0;


  if (
    !calories ||
    !weight
  ) {

    return {
      protein: 0,
      carbs: 0,
      fat: 0
    };

  }


  /* =========================
     PROTÉINES
  ========================= */

  const protein =
    weight * 2;


  const proteinCalories =
    protein * 4;


  /* =========================
     LIPIDES
  ========================= */

  const fat =
    weight * 0.8;


  const fatCalories =
    fat * 9;


  /* =========================
     GLUCIDES
  ========================= */

  let remainingCalories =
    calories -
    proteinCalories -
    fatCalories;


  /*
    Sécurité :
    on empêche les glucides
    de devenir négatifs.
  */

  remainingCalories =
    Math.max(
      0,
      remainingCalories
    );


  const carbs =
    remainingCalories / 4;


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
