import type { FoodItem } from '../types/types';

export function formatDate(date: Date): string {
  // Use UTC methods to ensure consistency regardless of local time zone
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getToday(): string {
  // Get today's date in UTC and format it
  return formatDate(new Date());
}

export function addDays(dateString: string, days: number): string {
  // Parse the date string as UTC to avoid time zone issues
  const date = new Date(dateString + 'T00:00:00Z'); // Append 'Z' to indicate UTC

  // Get the current UTC date (day of the month)
  const currentUtcDay = date.getUTCDate();

  // Create a *new* Date object by setting the UTC date to the current day + the offset
  // JavaScript Date objects handle month/year rollovers automatically
  const newDate = new Date(date); // Clone the original date
  newDate.setUTCDate(currentUtcDay + days); // Add the days using UTC methods

  // Format the resulting date using UTC methods
  return formatDate(newDate);
}

export function searchFoodDatabase(query: string, database: Record<string, FoodItem>): FoodItem[] {
  const lower = query.toLowerCase();
  return Object.values(database).filter(food =>
    food.name.toLowerCase().includes(lower)
  );
}
