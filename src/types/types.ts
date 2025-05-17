export interface FoodItem {
  name: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre?: number;
  imageUrl?: string;
}

export interface LoggedFoodItem {
    id: string;
    mealType: MealType;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number;
    imageUrl?: string;
}

export type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export interface LoggedMeals {
    [date: string]: LoggedFoodItem[];
}

export interface ModalMessage {
    text: string;
    type: 'error' | 'info' | '';
}

export type WeightLog = { date: string; weight: number };