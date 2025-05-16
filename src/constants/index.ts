import type { FoodItem, MealType } from '../types';

export const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export const TARGET_CALORIES = 2200;
export const TARGET_PROTEIN = 137.5;
export const TARGET_CARBS = 330;
export const TARGET_FAT = 36.7;
export const TARGET_FIBRE = 30;

// --- Detailed Food Database (Simulates an API source) ---
// NOTE: Food items include raw ingredients per 100g, plus a few specific processed/cooked items.
// Values are based on provided images and estimates, and can vary. Fibre added.
// Added imageUrls (using placeholders for demonstration)
// REMOVED: Peanut Butter (raw), Almonds (raw), Spinach (raw)
export const DETAILED_FOOD_DATABASE: { [key: string]: FoodItem } = {
  'Apple (raw)': { name: 'Apple (raw)', unit: '100g', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fibre: 2.4, imageUrl: 'https://placehold.co/40x40/a8f3b0/065f46?text=🍎' },
  'Banana (raw)': { name: 'Banana (raw)', unit: '100g', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fibre: 2.6, imageUrl: 'https://placehold.co/40x40/fff3a8/a16207?text=🍌' }, // Keeping previous value as image was generic
  'Orange (raw)': { name: 'Orange (raw)', unit: '100g', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fibre: 2.4, imageUrl: 'https://placehold.co/40x40/ffedd5/c2410c?text=🍊' },
  'Grapes (raw)': { name: 'Grapes (raw)', unit: '100g', calories: 69, protein: 0.6, carbs: 18.1, fat: 0.2, fibre: 0.9, imageUrl: 'https://placehold.co/40x40/d8b4fe/581c87?text=🍇' },
  'Strawberries (raw)': { name: 'Strawberries (raw)', unit: '100g', calories: 33, protein: 0.7, carbs: 7.7, fat: 0.3, fibre: 2, imageUrl: 'https://placehold.co/40x40/fecaca/9f1239?text=🍓' },
  'Carrot (raw)': { name: 'Carrot (raw)', unit: '100g', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fibre: 2.8, imageUrl: 'https://placehold.co/40x40/fed7aa/ea580c?text=🥕' },
  'Milk (whole, raw)': { name: 'Milk (whole, raw)', unit: '100g', calories: 61, protein: 3.3, carbs: 4.7, fat: 3.3, fibre: 0, imageUrl: 'https://placehold.co/40x40/bfdbfe/172554?text=🥛' }, // Using g for consistency, ~100ml
  'Egg (raw)': { name: 'Egg (raw)', unit: '100g', calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fibre: 0, imageUrl: 'https://placehold.co/40x40/fef9c3/b45309?text=🥚' }, // Approx 2 large eggs
  'Olive Oil (raw)': { name: 'Olive Oil (raw)', unit: '100g', calories: 884, protein: 0, carbs: 0, fat: 100, fibre: 0, imageUrl: 'https://placehold.co/40x40/d9f991/3f6212?text=🍾' }, // 100g oil = ~109ml
  'Avocado (raw)': { name: 'Avocado (raw)', unit: '100g', calories: 160, protein: 2, carbs: 9, fat: 14.7, fibre: 6.7, imageUrl: 'https://placehold.co/40x40/d9f991/3f6212?text=🥑' },
  'Lentils (dry, raw)': { name: 'Lentils (dry, raw)', unit: '100g', calories: 352, protein: 24.6, carbs: 63.4, fat: 1.1, fibre: 15.6, imageUrl: 'https://placehold.co/40x40/fecaca/9f1239?text=🍲' }, // Note: Lentils are typically cooked

  // --- Added and Updated Food Items (Based on Images) ---
  // Myprotein Impact Whey Protein (Updated from image: 1 scoop | 130 kcal, P: 25g, C: 3g, F: 2g)
  'Myprotein Impact Whey Protein (1 scoop)': { name: 'Myprotein Impact Whey Protein (1 scoop)', unit: 'scoop', calories: 130, protein: 25, carbs: 3, fat: 2, fibre: 0.3, imageUrl: 'https://placehold.co/40x40/bfdbfe/172554?text=🥛' }, // Added estimated fibre
  'Lean cookie' : { name: 'Lean cookie', unit: 'piece', calories: 190, protein: 25, carbs: 14, fat: 3.6, fibre: 1.5, imageUrl: 'https://placehold.co/40x40/fef9c3/b45309?text=🍪' }, // From image
  // Chicken Breast (raw) (Updated from image: 150 gm | 192 kcal, P:39g, C:0g, F:3g -> per 100g)
  'Chicken Breast (raw)': { name: 'Chicken Breast (raw)', unit: '100g', calories: 128, protein: 26, carbs: 0, fat: 2, fibre: 0, imageUrl: 'https://placehold.co/40x40/fecaca/9f1239?text=🍗' },
  // White Rice (raw) (Updated from image: "rice/poha/oats..." 50 gm | 168 kcal, P:4g, C:38g, F:0g -> per 100g)
   'White Rice (raw)': { name: 'White Rice (raw)', unit: '100g', calories: 336, protein: 8, carbs: 76, fat: 0, fibre: 1, imageUrl: 'https://placehold.co/40x40/d1d5db/4b5563?text=🍚' }, // Added estimated fibre
  // Indian Dal Fry (cooked) (Updated from image: 150 gm | 150 kcal, P: 7.5g, C: 21g, F: 4.5g -> per 100g)
  'Indian Dal Fry (cooked)': { name: 'Indian Dal Fry (cooked)', unit: '100g', calories: 100, protein: 5, carbs: 14, fat: 3, fibre: 3, imageUrl: 'https://placehold.co/40x40/fef9c3/b45309?text=🍲' }, // Converted and added estimated fibre
  // Mejdool Dates (raw) (Matches previous values)
  'Mejdool Dates (raw)': { name: 'Mejdool Dates (raw)', unit: '100g', calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fibre: 6.7, imageUrl: 'https://placehold.co/40x40/fecaca/9f1239?text=🌰' },
  // Curd (Updated from image: 100 gm | 62 kcal, P: 4g, C: 4.4g, F: 3.1g)
  'Curd': { name: 'Curd', unit: '100g', calories: 62, protein: 4, carbs: 4.4, fat: 3.1, fibre: 0, imageUrl: 'https://placehold.co/40x40/bfdbfe/172554?text=🥣' },
  // Oats (raw) (Updated from image: "rice/poha/oats..." 50 gm | 168 kcal, P:4g, C:38g, F:0g -> per 100g, changed to raw)
   'Oats (raw)': { name: 'Oats (raw)', unit: '100g', calories: 336, protein: 8, carbs: 76, fat: 0, fibre: 10, imageUrl: 'https://placehold.co/40x40/fef9c3/b45309?text=🥣' }, // Added estimated fibre for raw oats
   // New items from images
   'Omega 3': { name: 'Omega 3', unit: 'softgel', calories: 9, protein: 0, carbs: 0, fat: 1, fibre: 0, imageUrl: 'https://placehold.co/40x40/a8f3b0/065f46?text=💊' }, // From image
   'Multivitamin': { name: 'Multivitamin', unit: 'piece', calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, imageUrl: 'https://placehold.co/40x40/a8f3b0/065f46?text=💊' }, // From image
   'Ghee/Butter/Coconut Oil Blend': { name: 'Ghee/Butter/Coconut Oil Blend', unit: '5ml', calories: 45, protein: 0, carbs: 0, fat: 5, fibre: 0, imageUrl: 'https://placehold.co/40x40/fef9c3/b45309?text=🧈' }, // From image
};

 // --- Meal Specific Suggestions Mapping ---
// Map meal types to a list of food names to suggest initially
// Updated to remove the removed items
export const MEAL_SUGGESTIONS: { [key in MealType]: string[] } = {
    'Breakfast': ['Myprotein Impact Whey Protein (1 scoop)', 'Apple (raw)', 'Banana (raw)', 'Curd',  'Multivitamin', 'Omega 3'], // Removed Almonds
    'Lunch': ['White Rice (raw)', 'Chicken Breast (raw)', 'Indian Dal Fry (cooked)', 'Carrot (raw)', 'Curd', 'Ghee/Butter/Coconut Oil Blend'], // Removed Spinach
    'Snacks': ['Myprotein Impact Whey Protein (1 scoop)', 'Apple (raw)', 'Banana (raw)', 'Mejdool Dates (raw)', 'Lean cookie'], // Removed Almonds
    'Dinner': ['White Rice (raw)', 'Chicken Breast (raw)', 'Indian Dal Fry (cooked)', 'Carrot (raw)',  'Curd', 'Ghee/Butter/Coconut Oil Blend', 'Mejdool Dates (raw)'], // Removed Spinach
};