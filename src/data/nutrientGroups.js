export const NUTRIENT_GROUP = {
  AMINO_ACID: '아미노산',
  VITAMIN: '비타민',
  MINERAL: '미네랄',
};

export function nutrientGroupOf(foodNutrient) {
  return foodNutrient?.nutrients?.group_name ?? null;
}

export function isNutrientGroup(foodNutrient, groupName) {
  return nutrientGroupOf(foodNutrient) === groupName;
}
