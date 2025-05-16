import type { FoodItem } from '../types';

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function searchFoodDatabase(query: string, database: Record<string, FoodItem>): FoodItem[] {
  const lower = query.toLowerCase();
  return Object.values(database).filter(food =>
    food.name.toLowerCase().includes(lower)
  );
}