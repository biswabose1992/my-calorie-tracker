import React, { useState, useEffect, Fragment, useRef } from 'react'; // Import hooks, Fragment, and useRef from React
import type { JSX } from 'react/jsx-dev-runtime';

// --- Type Definitions ---
interface FoodItem {
  name: string;
  unit: string; // e.g., '100g', 'scoop', 'piece', 'ml'
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre?: number; // Fibre is optional in the database, but we'll include it in logged items
  imageUrl?: string; // imageUrl is optional
}

interface LoggedFoodItem {
    id: string; // Unique ID for each logged entry
    mealType: MealType;
    foodName: string; // Name of the food item
    quantity: number; // The actual quantity logged by the user
    unit: string; // The unit used for the logged quantity
    // The nutrient values here are the *calculated totals* for the logged quantity
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number; // Ensure fibre is always a number (defaulting to 0 if missing)
    imageUrl?: string; // imageUrl is optional
}

type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

interface LoggedMeals {
    [date: string]: LoggedFoodItem[]; // Key is date string (YYYY-MM-DD), value is array of logged items
}

interface ModalMessage {
    text: string;
    type: 'error' | 'info' | ''; // Message type for styling
}

type WeightLog = { date: string; weight: number };

// --- Icon Components (SVG) ---
// Using inline SVG components directly in the JSX for simplicity
const ChevronLeft = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>;
const CalendarDays = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const PlusCircle = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const Trash2 = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Utensils = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>;
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const LoaderIcon = (props: React.SVGProps<SVGSVGElement>) => <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite"/></path></svg>;
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
// Added icons for minimize/maximize
const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 12 15 18 9"></polyline></svg>;
const ChevronUp = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="18 15 12 9 6 15"></polyline></svg>;
// Added icon for weekly average CTA
const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <rect x="3" y="12" width="4" height="8" rx="1" className="fill-green-200" />
    <rect x="9" y="8" width="4" height="12" rx="1" className="fill-green-400" />
    <rect x="15" y="4" width="4" height="16" rx="1" className="fill-green-600" />
  </svg>
);
// Added icon for weight tracking CTA
const WeightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <rect x="3" y="6" width="18" height="14" rx="3" className="fill-blue-100" />
    <circle cx="12" cy="13" r="4" className="fill-blue-400" />
    <rect x="10.5" y="9" width="3" height="6" rx="1.5" className="fill-blue-600" />
  </svg>
);


// --- Detailed Food Database (Simulates an API source) ---
// NOTE: Food items include raw ingredients per 100g, plus a few specific processed/cooked items.
// Values are based on provided images and estimates, and can vary. Fibre added.
// Added imageUrls (using placeholders for demonstration)
// REMOVED: Peanut Butter (raw), Almonds (raw), Spinach (raw)
const DETAILED_FOOD_DATABASE: { [key: string]: FoodItem } = {
  'Apple (raw)': { name: 'Apple (raw)', unit: '100g', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fibre: 2.4, imageUrl: 'https://placehold.co/40x40/a8f3b0/065f46?text=🍎' },
  'Banana (raw)': { name: 'Banana (raw)', unit: '100g', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fibre: 2.6, imageUrl: 'https://placehold.co/40x40/fff3a8/a16207?text=🍌' }, // Keeping previous value as image was generic
  'Orange (raw)': { name: 'Orange (raw)', unit: '100g', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fibre: 2.4, imageUrl: 'https://placehold.co/40x40/ffedd5/c2410c?text=🍊' },
  'Grapes (raw)': { name: 'Grapes (raw)', unit: '100g', calories: 69, protein: 0.6, carbs: 18.1, fat: 0.2, fibre: 0.9, imageUrl: 'https://placehold.co/40x40/d8b4fe/581c87?text=🍇' },
  'Strawberries (raw)': { name: 'Strawberries (raw)', unit: '100g', calories: 33, protein: 0.7, carbs: 7.7, fat: 0.3, fibre: 2, imageUrl: 'https://placehold.co/40x40/fecaca/9f1239?text=🍓' },
  'Broccoli (raw)': { name: 'Broccoli (raw)', unit: '100g', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fibre: 2.6, imageUrl: 'https://placehold.co/40x40/d9f991/3f6212?text=🥦' },
  'Carrot (raw)': { name: 'Carrot (raw)', unit: '100g', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fibre: 2.8, imageUrl: 'https://placehold.co/40x40/fed7aa/ea580c?text=🥕' },
  'Milk (whole, raw)': { name: 'Milk (whole, raw)', unit: '100g', calories: 61, protein: 3.3, carbs: 4.7, fat: 3.3, fibre: 0, imageUrl: 'https://placehold.co/40x40/bfdbfe/172554?text=🥛' }, // Using g for consistency, ~100ml
  'Yogurt (plain, Greek, raw)': { name: 'Yogurt (plain, Greek, raw)', unit: '100g', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fibre: 0, imageUrl: 'https://placehold.co/40x40/bfdbfe/172554?text=🥣' }, // Assuming "raw" refers to before adding fruit/sugar, using 100g
  'Egg (raw)': { name: 'Egg (raw)', unit: '100g', calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6, fibre: 0, imageUrl: 'https://placehold.co/40x40/fef9c3/b45309?text=🥚' }, // Approx 2 large eggs
  'Tofu (firm, raw)': { name: 'Tofu (firm, raw)', unit: '100g', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fibre: 0.3, imageUrl: 'https://placehold.co/40x40/d1d5db/4b5563?text=⬜' },
  'Olive Oil (raw)': { name: 'Olive Oil (raw)', unit: '100g', calories: 884, protein: 0, carbs: 0, fat: 100, fibre: 0, imageUrl: 'https://placehold.co/40x40/d9f991/3f6212?text=🍾' }, // 100g oil = ~109ml
  'Avocado (raw)': { name: 'Avocado (raw)', unit: '100g', calories: 160, protein: 2, carbs: 9, fat: 14.7, fibre: 6.7, imageUrl: 'https://placehold.co/40x40/d9f991/3f6212?text=🥑' },
  'Lentils (dry, raw)': { name: 'Lentils (dry, raw)', unit: '100g', calories: 352, protein: 24.6, carbs: 63.4, fat: 1.1, fibre: 15.6, imageUrl: 'https://placehold.co/40x40/fecaca/9f1239?text=🍲' }, // Note: Lentils are typically cooked

  // --- Added and Updated Food Items (Based on Images) ---
  // Myprotein Impact Whey Protein (Updated from image: 1 scoop | 130 kcal, P: 25g, C: 3g, F: 2g)
  'Myprotein Impact Whey Protein (1 scoop)': { name: 'Myprotein Impact Whey Protein (1 scoop)', unit: 'scoop', calories: 130, protein: 25, carbs: 3, fat: 2, fibre: 0.3, imageUrl: 'https://placehold.co/40x40/bfdbfe/172554?text=🥛' }, // Added estimated fibre
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

// --- Meal Types (Order updated: Snacks after Lunch) ---
const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

// --- Meal Specific Suggestions Mapping ---
// Map meal types to a list of food names to suggest initially
// Updated to remove the removed items
const MEAL_SUGGESTIONS: { [key in MealType]: string[] } = {
    'Breakfast': ['Myprotein Impact Whey Protein (1 scoop)', 'Apple (raw)', 'Banana (raw)', 'Curd', 'Yogurt (plain, Greek, raw)', 'Oats (raw)', 'Multivitamin', 'Omega 3'], // Removed Almonds
    'Lunch': ['White Rice (raw)', 'Chicken Breast (raw)', 'Indian Dal Fry (cooked)', 'Carrot (raw)', 'Broccoli (raw)', 'Lentils (dry, raw)', 'Curd', 'Ghee/Butter/Coconut Oil Blend'], // Removed Spinach
    'Snacks': ['Myprotein Impact Whey Protein (1 scoop)', 'Apple (raw)', 'Banana (raw)', 'Mejdool Dates (raw)', 'Yogurt (plain, Greek, raw)', 'Curd'], // Removed Almonds
    'Dinner': ['White Rice (raw)', 'Chicken Breast (raw)', 'Indian Dal Fry (cooked)', 'Carrot (raw)', 'Broccoli (raw)', 'Lentils (dry, raw)', 'Curd', 'Ghee/Butter/Coconut Oil Blend'], // Removed Spinach
};


// --- Utility Functions ---
const formatDate = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
};
const getToday = (): string => formatDate(new Date());
const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr + 'T00:00:00'); // Ensure date is treated as UTC to avoid timezone issues
    date.setDate(date.getDate() + days);
    return formatDate(date);
};

// --- Simulated API for food search ---
// Updated to provide meal-specific suggestions if query is empty
const searchFoodDatabase = (query: string, mealType: MealType | null = null): Promise<FoodItem[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!query.trim() && mealType && MEAL_SUGGESTIONS[mealType]) {
                // If query is empty and mealType is provided, return meal-specific suggestions
                const suggestions = MEAL_SUGGESTIONS[mealType]
                    .map(foodName => DETAILED_FOOD_DATABASE[foodName])
                    .filter(food => food !== undefined) as FoodItem[]; // Cast to FoodItem[]
                resolve(suggestions);
                return;
            }

            if (!query.trim()) {
                 // If query is empty and no mealType suggestions, return empty
                 resolve([]);
                 return;
            }


            const lowerCaseQuery = query.toLowerCase();
            const results = Object.values(DETAILED_FOOD_DATABASE).filter(food =>
                food.name.toLowerCase().includes(lowerCaseQuery)
            );
            resolve(results.slice(0, 10)); // Limit results
        }, 300); // Debounce delay
    });
};

// --- Progress Bar Component ---
interface ProgressBarProps {
    label: string;
    current: number;
    target: number;
    unit: string;
    colorClass: string; // Tailwind color class for the bar fill
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, target, unit, colorClass }) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : (current > 0 ? 100 : 0); // Cap visual progress at 100%
    const isExceeded = target > 0 && current > target;
    const difference = isExceeded ? current - target : target - current;

    return React.createElement('div', { className: 'mb-3 last:mb-0' }, // Add margin bottom, remove from last item
        React.createElement('div', { className: 'flex justify-between items-center mb-1' },
            // MODIFIED: Removed dark mode text color class
            React.createElement('span', { className: 'text-sm font-medium text-gray-700' }, label), // Responsive text size
            // MODIFIED: Removed dark mode text color class
            React.createElement('span', { className: `text-xs font-semibold ${isExceeded ? 'text-red-600' : 'text-gray-600'}` }, // Responsive text size
                `${current.toFixed(1)} of ${target.toFixed(1)} ${unit}` // Display current/target with one decimal
            )
        ),
        React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2.5' }, // Background bar
            React.createElement('div', {
                className: `${colorClass} h-2.5 rounded-full transition-all duration-500 ease-in-out ${isExceeded ? 'bg-red-600' : ''}`, // Apply color class, transition, and red if exceeded
                style: { width: `${percentage}%` }
            })
        ),
        React.createElement('div', { className: 'text-right text-xs mt-1' },
            isExceeded
                ? React.createElement('span', { className: 'text-red-600 font-medium' }, `Exceeds By: ${difference.toFixed(1)} ${unit}`) // Dark mode text
                // MODIFIED: Removed dark mode text color class
                : React.createElement('span', { className: 'text-gray-600' }, `Remaining: ${difference.toFixed(1)} ${unit}`) // Very Light Gray Dark mode text
        )
    );
};


// --- Main App Component ---
function App(): JSX.Element {
    const [currentDate, setCurrentDate] = useState<string>(getToday());
    const [loggedMeals, setLoggedMeals] = useState<LoggedMeals>(() => {
        // Initialize state from localStorage on component mount
        const storedMeals = JSON.parse(localStorage.getItem('calorieAppMeals_v2') || '{}') as LoggedMeals;
        // Clean up old data on load (keeping last 7 days including today)
        const cleanedMeals: LoggedMeals = {};
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // Keep today and the 6 previous days

        Object.keys(storedMeals).forEach(dateKey => {
            const mealDate = new Date(dateKey + 'T00:00:00'); // Treat stored date as UTC
             // Check if the date is within the last 7 days (inclusive of today)
            if (mealDate >= sevenDaysAgo && mealDate <= today) {
                cleanedMeals[dateKey] = storedMeals[dateKey];
            }
        });
        return cleanedMeals;
    });

    const [selectedMealType, setSelectedMealType] = useState<MealType>(MEAL_TYPES[0]);
    const [quantity, setQuantity] = useState<number | string>(1); // Allow string for input field value
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingMealId, setEditingMealId] = useState<string | null>(null); // State to track which meal is being edited
    const [copyingMeal, setCopyingMeal] = useState<LoggedFoodItem | null>(null); // State to track the meal being copied
    const [isTotalsMinimized, setIsTotalsMinimized] = useState<boolean>(true); // State to manage minimize/maximize

    // New state for calendar modal visibility
    const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

    // Weekly Average Modal State
    const [showWeeklyModal, setShowWeeklyModal] = useState(false);

    // Weight Tracking Modal State
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('calorieAppWeightLogs_v1') || '[]');
        } catch {
            return [];
        }
    });
    const [weightInput, setWeightInput] = useState<string>('');
    const [weightError, setWeightError] = useState<string>('');

    // Modal specific states
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null); // Used for database items
    const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<ModalMessage>({ text: '', type: '' });

    // State for custom food input (used for both adding and editing custom items)
    const [customFoodName, setCustomFoodName] = useState<string>('');
    const [customUnit, setCustomUnit] = useState<string>('g'); // Default unit for custom food is now 'g'
    const [customCalories, setCustomCalories] = useState<number | string>(''); // Allow string for input field value
    const [customProtein, setCustomProtein] = useState<number | string>(''); // Allow string for input field value
    const [customCarbs, setCustomCarbs] = useState<number | string>(''); // Allow string for input field value
    const [customFat, setCustomFat] = useState<number | string>(''); // Allow string for input field value
    const [customFibre, setCustomFibre] = useState<number | string>(''); // State for custom fibre, allow string for input field value

    // Ref for the search input for auto-focus
    const searchInputRef = useRef<HTMLInputElement>(null);

    // --- Target Macro/Calorie Values (Example values, you can make these configurable) ---
    const TARGET_CALORIES = 2200;
    const TARGET_PROTEIN = 137.5;
    const TARGET_CARBS = 330;
    const TARGET_FAT = 36.7;
    const TARGET_FIBRE = 30; // Example target for fibre

    // --- Calculate Weekly Calorie Average ---
    const today = getToday();
    const last7Days = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));
    const weeklyCalories = last7Days.map(date =>
      (loggedMeals[date]?.reduce((sum, meal) => sum + meal.calories, 0)) || 0
    );
    const weeklyAverage = weeklyCalories.reduce((a, b) => a + b, 0) / 7;

    // --- Weight Tracking Logic ---
    useEffect(() => {
        localStorage.setItem('calorieAppWeightLogs_v1', JSON.stringify(weightLogs));
    }, [weightLogs]);

    const handleLogWeight = () => {
        const weight = parseFloat(weightInput);
        if (isNaN(weight) || weight <= 0) {
            setWeightError('Please enter a valid weight.');
            return;
        }
        const today = getToday();
        setWeightLogs(prev => {
            const filtered = prev.filter(log => log.date !== today);
            return [...filtered, { date: today, weight }];
        });
        setWeightInput('');
        setWeightError('');
        setShowWeightModal(false);
    };

    const last14Days = Array.from({ length: 14 }, (_, i) => addDays(getToday(), -13 + i));
    const weightData = last14Days.map(date => {
        const log = weightLogs.find(l => l.date === date);
        return { date, weight: log ? log.weight : null };
    });

    const weightsOnly = weightData.filter(d => d.weight !== null).map(d => d.weight as number);
    const minWeight = weightsOnly.length ? Math.min(...weightsOnly) : 0;
    const maxWeight = weightsOnly.length ? Math.max(...weightsOnly) : 100;

    // Effect to save meals to localStorage whenever loggedMeals changes
    useEffect(() => {
        localStorage.setItem('calorieAppMeals_v2', JSON.stringify(loggedMeals));
    }, [loggedMeals]); // Dependency array ensures this runs only when loggedMeals changes

    // Effect for handling search, suggestions, and auto-focus when the modal is open
    useEffect(() => {
        // Only run this effect if the modal is open
        if (!showModal) {
            return;
        }

        // Auto-focus the search input when adding a new item
        if (editingMealId === null && copyingMeal === null && searchInputRef.current) {
             searchInputRef.current.focus();
        }


        const query = searchTerm.trim();

        // Only perform search/suggestions if we are adding or copying (not editing)
        if (editingMealId === null) {
             if (!query) {
                 // If search term is empty, load meal-specific suggestions
                 setIsLoadingSearch(true);
                  // Pass the selectedMealType to get relevant suggestions
                 searchFoodDatabase('', selectedMealType).then(results => {
                      setSearchResults(results);
                      setIsLoadingSearch(false);
                 });
                 setSelectedFoodForModal(null); // Clear selected food when search term is empty
                 // Clear custom fields when search term is empty
                 setCustomFoodName('');
                 setCustomCalories('');
                 setCustomProtein('');
                 setCustomCarbs('');
                 setCustomFat('');
                 setCustomFibre('');
                 setCustomUnit('g'); // Reset custom unit to 'g'
                 return;
             }

             // If search term is not empty, perform standard search
             setIsLoadingSearch(true);
             const handler = setTimeout(() => {
                 searchFoodDatabase(query).then(results => {
                     setSearchResults(results);
                     setIsLoadingSearch(false);
                     // If search results are empty after typing, clear selected food
                     if (results.length === 0) {
                         setSelectedFoodForModal(null);
                         // Auto-fill custom food name if no results
                         setCustomFoodName(query);
                     } else {
                          // Clear custom fields if search results are found
                          setCustomFoodName('');
                          setCustomCalories('');
                          setCustomProtein('');
                          setCustomCarbs('');
                          setCustomFat('');
                          setCustomFibre('');
                          setCustomUnit('g'); // Reset custom unit to 'g'
                     }
                 });
             }, 300); // Debounce delay

             // Cleanup function: This runs when the effect re-runs (due to searchTerm change)
             // or when the component unmounts. It clears the previous timeout.
             return () => clearTimeout(handler);
        }


    }, [searchTerm, showModal, editingMealId, selectedMealType, copyingMeal]); // Dependencies updated


    // Function to handle saving (both adding and editing)
    const handleSaveFoodEntry = () => {
        setModalMessage({ text: '', type: '' }); // Clear previous messages

        let foodEntryToSave: LoggedFoodItem | null = null;

        // Determine if we are saving a database item or a custom item
        if (selectedFoodForModal && editingMealId === null) { // Adding a new database item (including copied items)
             const q = parseFloat(quantity as string); // Cast quantity to string for parseFloat
             if (q <= 0 || isNaN(q)) {
                 setModalMessage({ text: "Please enter a valid positive number for quantity.", type: 'error' });
                 return;
            }

             // Calculate nutrients based on the quantity and the food's unit
             let calculatedCals, calculatedProt, calculatedCarbs, calculatedFat, calculatedFibre;
             let displayUnit;

             if (selectedFoodForModal.unit === '100g') {
                 // If unit is 100g, quantity is in grams
                 calculatedCals = selectedFoodForModal.calories * (q / 100);
                 calculatedProt = selectedFoodForModal.protein * (q / 100);
                 calculatedCarbs = selectedFoodForModal.carbs * (q / 100);
                 calculatedFat = selectedFoodForModal.fat * (q / 100);
                 calculatedFibre = (selectedFoodForModal.fibre || 0) * (q / 100);
                 displayUnit = 'g'; // Display unit as 'g'
             } else {
                 // If unit is not 100g (e.g., scoop, piece, ml), quantity is in that unit
                 calculatedCals = selectedFoodForModal.calories * q;
                 calculatedProt = selectedFoodForModal.protein * q;
                 calculatedCarbs = selectedFoodForModal.carbs * q;
                 calculatedFat = selectedFoodForModal.fat * q;
                 calculatedFibre = (selectedFoodForModal.fibre || 0) * q;
                 displayUnit = selectedFoodForModal.unit; // Display unit as the original unit
             }


             foodEntryToSave = {
                 id: Date.now().toString(), // Generate a new ID for new entries (including copied)
                 mealType: selectedMealType,
                 foodName: selectedFoodForModal.name,
                 quantity: q,
                 unit: displayUnit, // Use the determined display unit
                 calories: Math.round(calculatedCals),
                 protein: Math.round(calculatedProt * 10) / 10,
                 carbs: Math.round(calculatedCarbs * 10) / 10,
                 fat: Math.round(calculatedFat * 10) / 10,
                 fibre: Math.round(calculatedFibre * 10) / 10, // Include fibre
                 imageUrl: selectedFoodForModal.imageUrl // Include image URL
             };
        } else if (editingMealId) { // Editing an existing item
             const existingEntry = loggedMeals[currentDate]?.find(meal => meal.id === editingMealId);
             if (!existingEntry) {
                 setModalMessage({ text: "Error: Could not find item to edit.", type: 'error' });
                 return;
             }

             const q = parseFloat(quantity as string); // Cast quantity to string
             const calsPerUnit = parseFloat(customCalories as string); // Cast customCalories to string
             const protPerUnit = parseFloat(customProtein as string); // Cast customProtein to string
             const carbsPerUnit = parseFloat(customCarbs as string); // Cast customCarbs to string
             const fatPerUnit = parseFloat(customFat as string); // Cast customFat to string
             const fibrePerUnit = parseFloat(customFibre as string); // Get custom fibre, cast to string

             // Validation for editing
             if (q <= 0 || isNaN(q) || !customFoodName.trim() || !customUnit.trim() ||
                 isNaN(calsPerUnit) || calsPerUnit < 0 || isNaN(protPerUnit) || protPerUnit < 0 || isNaN(carbsPerUnit) || carbsPerUnit < 0 || isNaN(fatPerUnit) || fatPerUnit < 0 || isNaN(fibrePerUnit) || fibrePerUnit < 0) { // Validate fibre
                  setModalMessage({ text: "Please fill in all fields with valid positive numbers (calories, protein, carbs, fat, fibre can be 0).", type: 'error' }); // Updated message
                  return;
             }

             // Create the updated entry object, ensuring all LoggedFoodItem properties are present
             foodEntryToSave = {
                 ...existingEntry, // Start with existing properties
                 mealType: selectedMealType, // Override mealType
                 foodName: customFoodName.trim(), // Override foodName
                 quantity: q, // Override quantity
                 unit: customUnit.trim(), // Override unit
                 calories: Math.round(calsPerUnit * q), // Calculate and override calories
                 protein: Math.round(protPerUnit * q * 10) / 10, // Calculate and override protein
                 carbs: Math.round(carbsPerUnit * q * 10) / 10, // Calculate and override carbs
                 fat: Math.round(fatPerUnit * q * 10) / 10, // Calculate and override fat
                 fibre: Math.round(fibrePerUnit * q * 10) / 10, // Calculate and override fibre
                 // imageUrl is kept from existingEntry if present
             };
        }
        else { // Adding a new custom item
            const calsPerUnit = parseFloat(customCalories as string); // Cast to string
            const protPerUnit = parseFloat(customProtein as string); // Cast to string
            const carbsPerUnit = parseFloat(customCarbs as string); // Cast to string
            const fatPerUnit = parseFloat(customFat as string); // Cast to string
            const fibrePerUnit = parseFloat(customFibre as string); // Get custom fibre, cast to string
            const q = parseFloat(quantity as string); // Cast to string

            // Validation for adding custom food
            if (!customFoodName.trim() || !customUnit.trim() || q <= 0 || isNaN(q) ||
                isNaN(calsPerUnit) || calsPerUnit < 0 || isNaN(protPerUnit) || protPerUnit < 0 || isNaN(carbsPerUnit) || carbsPerUnit < 0 || isNaN(fatPerUnit) || fatPerUnit < 0 || isNaN(fibrePerUnit) || fibrePerUnit < 0) { // Validate fibre
                 setModalMessage({ text: "Please fill in all custom food details with valid positive numbers (calories, protein, carbs, fat, fibre can be 0).", type: 'error' }); // Updated message
                 return;
            }

            foodEntryToSave = {
                id: Date.now().toString(), // Simple unique ID
                mealType: selectedMealType,
                foodName: customFoodName.trim(),
                quantity: q,
                unit: customUnit.trim(),
                calories: Math.round(calsPerUnit * q),
                protein: Math.round(protPerUnit * q * 10) / 10,
                carbs: Math.round(carbsPerUnit * q * 10) / 10,
                fat: Math.round(fatPerUnit * q * 10) / 10,
                fibre: Math.round(fibrePerUnit * q * 10) / 10, // Include fibre
                imageUrl: 'https://placehold.co/40x40/cccccc/333333?text=�️' // Default image for custom items
            };
        }

        // Update the logged meals state
        setLoggedMeals(prevMeals => {
            const mealsForDate = prevMeals[currentDate] ? [...prevMeals[currentDate]] : [];
            if (editingMealId) {
                 // Find and replace the item being edited
                 const index = mealsForDate.findIndex(meal => meal.id === editingMealId);
                 if (index !== -1 && foodEntryToSave) { // Ensure foodEntryToSave is not null
                     mealsForDate[index] = foodEntryToSave;
                 }
            } else {
                 // Add a new item
                 if (foodEntryToSave) { // Ensure foodEntryToSave is not null
                    mealsForDate.push(foodEntryToSave);
                 }
            }
            return { ...prevMeals, [currentDate]: mealsForDate };
        });

        // Close modal and reset modal states
        closeModal(); // Use the new closeModal function
    };

    const handleDeleteFood = (mealId: string) => { // mealId is a string
        // Update state using functional update
        setLoggedMeals(prevMeals => {
            const updatedMealsForDate = (prevMeals[currentDate] || []).filter(meal => meal.id !== mealId);
            // If the last item for a date is deleted, remove the date key from the object
            if (updatedMealsForDate.length === 0 && prevMeals[currentDate]) {
                // Use object destructuring to remove the key without an unused variable
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [currentDate]: _removed, ...restOfMeals } = prevMeals;
                return restOfMeals;
            }
            // Otherwise, update the array for the current date
            return { ...prevMeals, [currentDate]: updatedMealsForDate };
        });
    };

    // Function to handle opening the modal for adding
    const openAddModal = (mealType: MealType) => { // Accept mealType as argument
        // Reset modal states before opening for adding
        setSelectedMealType(mealType); // Set the selected meal type
        setSearchTerm(''); // Start with an empty search term to trigger suggestions
        setSearchResults([]); // Clear previous search results
        setSelectedFoodForModal(null);
        setQuantity(1); // Default quantity when opening modal
        setModalMessage({ text: '', type: '' });
        setEditingMealId(null); // Ensure editing state is off
        setCopyingMeal(null); // Ensure copying state is off
        // Reset custom food states
        setCustomFoodName('');
        setCustomCalories('');
        setCustomProtein('');
        setCustomCarbs('');
        setCustomFat('');
        setCustomFibre(''); // Reset custom fibre
        setCustomUnit('g'); // Reset custom unit to 'g'
        setShowModal(true);
    };

    // Function to handle opening the modal for editing
    const openEditModal = (meal: LoggedFoodItem) => { // meal is a LoggedFoodItem
         // Set modal states based on the meal being edited
         setSelectedMealType(meal.mealType);
         setQuantity(meal.quantity); // Quantity is the logged quantity
         setEditingMealId(meal.id); // Set the ID of the item being edited
         setCopyingMeal(null); // Ensure copying state is off
         setModalMessage({ text: '', type: '' });
         setSearchTerm(''); // Clear search term initially in edit mode
         setSearchResults([]); // Clear search results initially

         // Populate custom food states for editing (calculate per-unit values from logged totals)
         setCustomFoodName(meal.foodName);
         setCustomUnit(meal.unit); // Use the unit from the logged entry
         // Calculate per-unit values for display in custom fields
         setCustomCalories(meal.quantity > 0 ? (meal.calories / meal.quantity).toFixed(1) : '0');
         setCustomProtein(meal.quantity > 0 ? (meal.protein / meal.quantity).toFixed(1) : '0');
         setCustomCarbs(meal.quantity > 0 ? (meal.carbs / meal.quantity).toFixed(1) : '0');
         setCustomFat(meal.quantity > 0 ? (meal.fat / meal.quantity).toFixed(1) : '0');
         setCustomFibre(meal.quantity > 0 ? (meal.fibre / meal.quantity).toFixed(1) : '0'); // Populate custom fibre

         // In edit mode, we are always treating the input as custom, so no need to pre-select from database
         setSelectedFoodForModal(null);

         setShowModal(true);
    };

    // Function to handle opening the modal for copying
    const openCopyModal = (meal: LoggedFoodItem) => { // meal is a LoggedFoodItem
        // Set modal states based on the meal being copied
        setSelectedMealType(meal.mealType); // Start with the original meal type, user can change
        setQuantity(meal.quantity); // Start with the original quantity
        setEditingMealId(null); // This is crucial: we are adding a NEW item, not editing
        setCopyingMeal(meal); // Store the meal being copied
        setModalMessage({ text: '', type: '' });
        setSearchTerm(meal.foodName); // Pre-fill search with the food name
        setSearchResults([]); // Clear search results initially

        // For copying, we pre-fill the custom fields with the copied item's details
        setCustomFoodName(meal.foodName);
        setCustomUnit(meal.unit);
        // Calculate per-unit values for display in custom fields (same logic as edit)
        setCustomCalories(meal.quantity > 0 ? (meal.calories / meal.quantity).toFixed(1) : '0');
        setCustomProtein(meal.quantity > 0 ? (meal.protein / meal.quantity).toFixed(1) : '0');
        setCustomCarbs(meal.quantity > 0 ? (meal.carbs / meal.quantity).toFixed(1) : '0');
        setCustomFat(meal.quantity > 0 ? (meal.fat / meal.quantity).toFixed(1) : '0');
        setCustomFibre(meal.quantity > 0 ? (meal.fibre / meal.quantity).toFixed(1) : '0');

        // If the copied item is in the database, pre-select it in the modal
        const dbFood = DETAILED_FOOD_DATABASE[meal.foodName];
        if (dbFood) {
             setSelectedFoodForModal(dbFood);
             // Note: When copying a database item, the custom fields will be populated,
             // but the save logic will prioritize the selectedFoodForModal if it exists.
             // This allows the user to potentially switch to a custom edit if needed.
        } else {
             setSelectedFoodForModal(null);
        }


        setShowModal(true);
    };


    // Function to close the modal and reset states
    const closeModal = () => {
        setShowModal(false);
        setSearchTerm('');
        setSearchResults([]);
        setSelectedFoodForModal(null);
        setQuantity(1); // Reset quantity to 1 when closing modal
        setModalMessage({ text: '', type: '' });
        setEditingMealId(null); // Reset editing state
        setCopyingMeal(null); // Reset copying state
        // Reset custom food states
        setCustomFoodName('');
        setCustomCalories('');
        setCustomProtein('');
        setCustomCarbs('');
        setCustomFat('');
        setCustomFibre(''); // Reset custom fibre
        setCustomUnit('g'); // Reset custom unit to 'g'
    };


    // Get meals for the currently selected date
    const mealsForCurrentDate = loggedMeals[currentDate] || [];

    // Calculate daily totals
    const dailyTotals = mealsForCurrentDate.reduce((acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        acc.fibre += meal.fibre || 0; // Add fibre, default to 0 if not present
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 }); // Initialize fibre total

    // Function to change the displayed date
    const changeDate = (offset: number) => { // offset is a number
        const newDate = addDays(currentDate, offset);
        const today = getToday();
        const sevenDaysAgo = addDays(today, -6);

        // Prevent navigating beyond today or before the 7-day history window
        if (newDate > today || newDate < sevenDaysAgo) {
             // Optionally show a message or just do nothing
             return;
        }

        setCurrentDate(newDate);
    };

    const isToday = currentDate === getToday();
    const maxPastDate = addDays(getToday(), -6); // The oldest date allowed in history

    // Determine if custom food inputs should be shown in the modal
    // Show if no database item is selected AND (there's a search term with no results OR we are editing OR we are copying a non-database item)
    const showCustomFoodInputs = (!selectedFoodForModal && searchTerm.trim() && searchResults.length === 0 && !isLoadingSearch) || editingMealId !== null || (copyingMeal !== null && !DETAILED_FOOD_DATABASE[copyingMeal.foodName]);


    // Calculate nutrients based on current modal inputs for real-time display
    const calculatedNutrients = (() => {
        const q = parseFloat(quantity as string); // Cast quantity to string
        if (isNaN(q) || q <= 0) {
            return { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
        }

        if (selectedFoodForModal && editingMealId === null) { // Calculate from selected database item when adding or copying a database item
             // Adjust calculation based on the food's unit
            if (selectedFoodForModal.unit === '100g') {
                 // If unit is 100g, quantity is in grams
                 return {
                     calories: Math.round(selectedFoodForModal.calories * (q / 100)),
                     protein: Math.round(selectedFoodForModal.protein * (q / 100) * 10) / 10,
                     carbs: Math.round(selectedFoodForModal.carbs * (q / 100) * 10) / 10,
                     fat: Math.round(selectedFoodForModal.fat * (q / 100) * 10) / 10,
                     fibre: Math.round((selectedFoodForModal.fibre || 0) * (q / 100) * 10) / 10,
                 };
            } else {
                 // If unit is not 100g, quantity is in that unit
                 return {
                     calories: Math.round(selectedFoodForModal.calories * q),
                     protein: Math.round(selectedFoodForModal.protein * q * 10) / 10,
                     carbs: Math.round(selectedFoodForModal.carbs * q * 10) / 10,
                     fat: Math.round(selectedFoodForModal.fat * q * 10) / 10,
                     fibre: Math.round((selectedFoodForModal.fibre || 0) * q * 10) / 10,
                 };
            }

        } else if (showCustomFoodInputs) { // Calculate from custom inputs
            const calsPerUnit = parseFloat(customCalories as string); // Cast to string
            const protPerUnit = parseFloat(customProtein as string); // Cast to string
            const carbsPerUnit = parseFloat(customCarbs as string); // Cast to string
            const fatPerUnit = parseFloat(customFat as string); // Cast to string
            const fibrePerUnit = parseFloat(customFibre as string); // Get custom fibre per unit, cast to string

            if (isNaN(calsPerUnit) || calsPerUnit < 0 || isNaN(protPerUnit) || protPerUnit < 0 || isNaN(carbsPerUnit) || carbsPerUnit < 0 || isNaN(fatPerUnit) || fatPerUnit < 0 || isNaN(fibrePerUnit) || fibrePerUnit < 0) {
                 return { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 }; // Return zeros if custom inputs are invalid
            }

            return {
                 calories: Math.round(calsPerUnit * q),
                 protein: Math.round(protPerUnit * q * 10) / 10,
                 carbs: Math.round(carbsPerUnit * q * 10) / 10,
                 fat: Math.round(fatPerUnit * q * 10) / 10,
                 fibre: Math.round(fibrePerUnit * q * 10) / 10, // Calculate from custom fibre per unit
            };
        }
         return { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 }; // Default
    })();


    // Get the quantity label based on the selected food or custom input
    const getQuantityLabel = (): string => {
        if (selectedFoodForModal && editingMealId === null) { // When adding or copying a database item
            return selectedFoodForModal.unit === '100g' ? 'Quantity (in grams)' : `Quantity (in ${selectedFoodForModal.unit})`;
        } else if (showCustomFoodInputs) { // When editing or adding/copying a custom item
            return `Quantity (in ${customUnit || 'units'})`;
        }
        return 'Quantity';
    };

    // Get the modal title based on the state
    const getModalTitle = (): string => {
        if (editingMealId) {
            return 'Edit Food Item';
        } else if (copyingMeal) {
            return 'Copy Food Item';
        } else {
            return 'Log a New Food Item';
        }
    };


    // Function to handle selecting a food item from search results
    const handleSelectFoodFromSearch = (food: FoodItem) => {
        setSelectedFoodForModal(food);
        setSearchTerm(food.name);
        setSearchResults([]); // Clear results after selection

        // Set default quantity based on food type
        if (food.name === 'Multivitamin' || food.name === 'Omega 3' || food.name === 'Myprotein Impact Whey Protein (1 scoop)') {
            setQuantity(1); // Set quantity to 1 for supplements
        } else {
            setQuantity(100); // Set quantity to 100 for other food items
        }
    };

    // --- Calendar Logic ---
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Function to get days for the calendar view (last 7 days including today)
    const getCalendarDays = (): { date: string, display: string, isCurrent: boolean, isPast: boolean }[] => {
        const today = new Date();
        const days = [];
        for (let i = 6; i >= 0; i--) { // Iterate back 6 days from today
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = formatDate(date);
            days.push({
                date: dateString,
                display: date.getDate().toString(), // Display just the day number
                isCurrent: dateString === currentDate,
                isPast: dateString < getToday()
            });
        }
        return days;
    };

    // Function to handle date selection from the calendar
    const handleDateSelect = (date: string) => {
        setCurrentDate(date);
        setShowCalendarModal(false); // Close calendar modal after selection
    };


    // JSX structure using React.createElement (as in your original stub)
    return (
        // Outer container: Added mx-auto for horizontal centering on larger screens
        // MODIFIED: Removed dark mode gradient class
        React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-green-100 to-blue-100 font-sans p-4 md:p-6 lg:p-8 flex flex-col items-center mx-auto transition-colors duration-500' }, // Added transition
            // Header: Adjusted text size for mobile and desktop
            React.createElement('header', { className: 'w-full max-w-3xl mb-6 text-center' },
                // MODIFIED: Removed dark mode text color class
                React.createElement('h1', { className: 'text-3xl md:text-4xl font-bold text-green-700 flex items-center justify-center transition-colors' }, // Responsive text size, Added transition
                    React.createElement(Utensils, { className: 'mr-2 md:mr-3 w-8 h-8 md:w-10 md:h-10' }), // Responsive icon size
                    'Daily Calorie & Nutrient Tracker'
                )
            ),

            // Main content area: Centered with max-width
            // MODIFIED: Removed dark mode background class
            React.createElement('main', { className: 'w-full max-w-3xl bg-white shadow-2xl rounded-xl p-4 md:p-6 transition-colors' }, // Responsive padding, Added transition
                // Date Navigation & Daily Summary (Sticky Section)
                // Added 'sticky top-0 z-10 bg-gray-50 pb-4' for sticky behavior
                // MODIFIED: Removed dark mode background class
                React.createElement('section', { className: 'mb-6 p-3 md:p-4 bg-gray-50 rounded-lg shadow sticky top-0 z-10 pb-4 transition-colors' }, // Responsive padding, added sticky styles and padding-bottom, Added transition
                    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
                        React.createElement('button', {
                            onClick: () => changeDate(-1),
                            disabled: currentDate <= maxPastDate, // Disable if at the oldest date
                            className: 'p-2 md:p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400' // Responsive padding
                            }, React.createElement(ChevronLeft)
                        ),
                        // Make the date display clickable to open calendar modal
                        React.createElement('button', {
                             onClick: () => setShowCalendarModal(true), // Open calendar modal on click
                             className: 'text-center focus:outline-none' // Make it look like text but clickable
                        },
                            // MODIFIED: Removed dark mode text and hover colors
                            React.createElement('h2', { className: 'text-lg md:text-xl font-semibold text-gray-700 flex items-center justify-center cursor-pointer hover:text-green-600 transition-colors' }, // Responsive text size, added cursor and hover, Added transition
                                // MODIFIED: Removed dark mode icon color
                                React.createElement(CalendarDays, { className: 'mr-1 md:mr-2 w-5 h-5 md:w-6 md:h-6 text-green-600' }), // Responsive icon size
                                currentDate === getToday() ? 'Today' : new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                            ),
                            // Show "Go to Today" button only if not on today's date
                            !isToday && React.createElement('span', {
                                // MODIFIED: Removed dark mode colors
                                className: 'text-xs md:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium mt-1 focus:outline-none px-3 py-1 rounded-md transition-colors inline-block' // Added inline-block
                            }, 'Go to Today')
                        ),
                        React.createElement('button', {
                            onClick: () => changeDate(1),
                            disabled: isToday, // Disable if on today's date
                            className: 'p-2 md:p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400' // Responsive padding
                            }, React.createElement(ChevronRight)
                        )
                    ),
                    // Daily Totals Header with Minimize/Maximize Button
                    // MODIFIED: Removed dark mode border color
                    React.createElement('div', { className: 'flex justify-between items-center mb-3 border-b border-gray-200 pb-2 transition-colors' }, // Added transition
                         // MODIFIED: Removed dark mode text color
                         React.createElement('h3', { className: 'text-lg md:text-xl font-semibold text-gray-700 transition-colors' }, 'Daily Totals'), // Added transition
                         // MODIFIED: Removed dark mode colors
                         React.createElement('button', {
                             onClick: () => setIsTotalsMinimized(!isTotalsMinimized), // Toggle minimize state
                             className: 'p-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400'
                         }, isTotalsMinimized ? React.createElement(ChevronDown) : React.createElement(ChevronUp)) // Show down arrow when minimized, up when expanded
                    ),
                    // Daily Totals Progress Bars: Conditionally render and use grid for 2 columns when not minimized
                    React.createElement('div', { className: `mt-4 ${!isTotalsMinimized ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}` }, // Added grid classes for 2 columns on medium screens and up
                         // Calories always visible
                         // MODIFIED: Removed dark mode color class
                         React.createElement(ProgressBar, { label: 'Calories', current: dailyTotals.calories, target: TARGET_CALORIES, unit: 'kcal', colorClass: 'bg-gray-600' }), // Gray/Black for Calories
                         // Other macros visible only when not minimized
                         !isTotalsMinimized && React.createElement(Fragment, null,
                             // MODIFIED: Removed dark mode color class
                             React.createElement(ProgressBar, { label: 'Protein', current: dailyTotals.protein, target: TARGET_PROTEIN, unit: 'g', colorClass: 'bg-blue-600' }), // Blue for Protein
                             // MODIFIED: Removed dark mode color class
                             React.createElement(ProgressBar, { label: 'Carbs', current: dailyTotals.carbs, target: TARGET_CARBS, unit: 'g', colorClass: 'bg-orange-600' }), // Orange for Carbs
                             // MODIFIED: Removed dark mode color class
                             React.createElement(ProgressBar, { label: 'Fat', current: dailyTotals.fat, target: TARGET_FAT, unit: 'g', colorClass: 'bg-purple-600' }), // Purple for Fat
                             // MODIFIED: Removed dark mode color class
                             React.createElement(ProgressBar, { label: 'Fibre', current: dailyTotals.fibre, target: TARGET_FIBRE, unit: 'g', colorClass: 'bg-pink-600' }) // Pink for Fibre
                         )
                    )
                ),

                 // Message when viewing past dates
                // MODIFIED: Removed dark mode colors
                !isToday && React.createElement('div', { className: 'mb-6 text-center p-3 bg-blue-100 text-blue-700 rounded-md text-sm transition-colors' }, // Responsive text size, Added transition
                    React.createElement('p', { className: 'text-sm' }, 'You are viewing a past date. Food items can only be logged for today.')
                ),

                // Weekly Average CTA
                React.createElement('div', { className: 'w-full max-w-3xl flex justify-end mb-4' },
                    React.createElement('button', {
                        onClick: () => setShowWeeklyModal(true),
                        className: 'flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
                    },
                        React.createElement(BarChartIcon, { className: 'w-5 h-5' }),
                        'Show Weekly Calorie Average'
                    )
                ),

                // Weight Log CTA
                React.createElement('div', { className: 'w-full max-w-3xl flex justify-end mb-2' },
                    React.createElement('button', {
                        onClick: () => setShowWeightModal(true),
                        className: 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                    },
                        React.createElement(WeightIcon, { className: 'w-5 h-5' }),
                        'Log Weight & View Trend'
                    )
                ),

                // Meal Sections
                MEAL_TYPES.map(mealType => {
                    const itemsForMealType = mealsForCurrentDate.filter(meal => meal.mealType === mealType);
                    // MODIFIED: Removed dark mode border and background
                    return React.createElement('section', { key: mealType, className: 'mb-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 transition-colors' }, // Added transition
                        // MODIFIED: Removed dark mode border
                        React.createElement('div', { className: 'flex justify-between items-center mb-3 border-b border-gray-200 pb-2 transition-colors' }, // Flex container for title and button, Added transition
                             // MODIFIED: Removed dark mode text color
                             React.createElement('h3', { className: 'text-lg md:text-xl font-semibold text-green-700 transition-colors' }, mealType), // Responsive text size, Added transition
                             // Add Food button for each section (only for today)
                             isToday && React.createElement('button', {
                                onClick: () => openAddModal(mealType), // Pass mealType to the modal
                                className: 'p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400'
                             }, React.createElement(PlusCircle, { className: 'w-5 h-5' }))
                        ),
                        itemsForMealType.length === 0
                            // MODIFIED: Removed dark mode text color
                            ? React.createElement('p', { className: 'text-gray-500 italic text-sm transition-colors' }, `No ${mealType.toLowerCase()} items logged yet.`) // Responsive text size, Added transition
                            : React.createElement('ul', { className: 'space-y-2' },
                                itemsForMealType.map(meal => (
                                    // MODIFIED: Removed dark mode background
                                    React.createElement('li', { key: meal.id, className: 'flex justify-between items-start p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow transition-colors' }, // Added transition
                                        React.createElement('div', { className: 'flex items-center flex-grow' }, // Flex container for image and text
                                            // Food Image
                                            meal.imageUrl && React.createElement('img', {
                                                 src: meal.imageUrl,
                                                 alt: meal.foodName,
                                                 className: 'w-8 h-8 md:w-10 md:h-10 rounded-md object-cover mr-2 md:mr-3', // Responsive size and margin
                                                 onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/cccccc/333333?text=🍽️'; } // Fallback image on error
                                            }),
                                            React.createElement('div', { className: 'flex-grow' }, // Allow text to take remaining space
                                                // MODIFIED: Removed dark mode text color
                                                React.createElement('span', { className: 'font-medium text-gray-800 text-sm md:text-base transition-colors' }, `${meal.foodName}`), // Responsive text size, Added transition
                                                // Display the quantity and the specific unit from the log entry
                                                // MODIFIED: Removed dark mode text color
                                                React.createElement('span', { className: 'text-xs text-gray-500 ml-1 md:ml-2 block sm:inline transition-colors' }, `(${meal.quantity} x ${meal.unit})`), // Responsive text size and margin, Added transition
                                                // MODIFIED: Removed dark mode text color
                                                React.createElement('div', { className: 'text-xs text-gray-600 mt-1 transition-colors' }, // Responsive text size, Added transition
                                                    `Cals: ${meal.calories} | P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g | Fibre: ${meal.fibre || 0}g` // Display Fibre
                                                )
                                            )
                                        ),
                                        // Allow editing and deleting food for any date
                                        React.createElement('div', { className: 'flex items-center space-x-1 md:space-x-2 ml-2 flex-shrink-0' }, // Responsive spacing
                                            // Copy Button
                                            // MODIFIED: Removed dark mode colors
                                            React.createElement('button', {
                                                onClick: () => openCopyModal(meal), // Open modal for copying
                                                className: 'bg-transparent text-green-600 hover:text-green-700 hover:bg-green-100 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-400'
                                                }, React.createElement(CopyIcon)
                                            ),
                                            // Edit Button
                                            // MODIFIED: Removed dark mode colors
                                            React.createElement('button', {
                                                onClick: () => openEditModal(meal), // Open modal for editing
                                                className: 'bg-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400'
                                                }, React.createElement(EditIcon)
                                            ),
                                            // Delete Button
                                            // MODIFIED: Removed dark mode colors
                                            React.createElement('button', {
                                                onClick: () => handleDeleteFood(meal.id),
                                                className: 'bg-transparent text-red-600 hover:text-red-700 hover:bg-red-100 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400'
                                                }, React.createElement(Trash2)
                                            )
                                        )
                                    )
                                ))
                            )
                    );
                })
            ),

            // Calendar Modal
            showCalendarModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm' },
                 // MODIFIED: Removed dark mode background
                 React.createElement('div', { className: 'bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-out scale-100' },
                     // MODIFIED: Removed dark mode text color
                     React.createElement('h3', { className: 'text-lg md:text-xl font-semibold text-gray-800 mb-4 text-center' }, 'Select Date'), // Added dark mode text color
                     React.createElement('div', { className: 'grid grid-cols-7 gap-1 text-center text-xs md:text-sm mb-4' }, // Responsive text size
                         // MODIFIED: Removed dark mode text color
                         daysOfWeek.map(day => React.createElement('div', { key: day, className: 'font-medium text-gray-600' }, day))
                     ),
                     React.createElement('div', { className: 'grid grid-cols-7 gap-1 text-center text-sm md:text-base' }, // Responsive text size
                         getCalendarDays().map(({ date, display, isCurrent, isPast }) =>
                             // MODIFIED: Removed dark mode colors
                             React.createElement('button', {
                                 key: date,
                                 onClick: () => handleDateSelect(date),
                                 disabled: !isPast && date !== getToday(), // Disable future dates (beyond today)
                                 className: `p-2 rounded-full transition-colors w-full aspect-square flex items-center justify-center
                                            ${isCurrent ? 'bg-green-600 text-white font-bold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                            ${!isPast && date !== getToday() ? 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed' : ''}
                                            focus:outline-none focus:ring-2 focus:ring-green-400`
                             }, display)
                         )
                     ),
                     React.createElement('div', { className: 'mt-6 text-right' },
                         // MODIFIED: Removed dark mode colors
                         React.createElement('button', {
                             onClick: () => setShowCalendarModal(false),
                             className: 'bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base' // Responsive text size
                         }, 'Close')
                     )
                 )
            ),

            // Weekly Average Modal
            showWeeklyModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50' },
                React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center' },
                    React.createElement('h3', { className: 'text-lg font-bold text-green-700 mb-2 flex items-center gap-2' },
                        React.createElement(BarChartIcon, { className: 'w-6 h-6' }),
                        'Weekly Calorie Average'
                    ),
                    React.createElement('div', { className: 'text-4xl font-extrabold text-green-600 mb-2' },
                        Math.round(weeklyAverage), ' kcal'
                    ),
                    React.createElement('div', { className: 'w-full mt-2 mb-4' },
                        React.createElement('table', { className: 'w-full text-xs text-gray-700' },
                            React.createElement('tbody', null,
                                last7Days.map((date, idx) =>
                                    React.createElement('tr', { key: date },
                                        React.createElement('td', { className: 'pr-2 py-1 text-right' },
                                            new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                        ),
                                        React.createElement('td', { className: 'pl-2 py-1 font-semibold text-right' },
                                            weeklyCalories[idx], ' kcal'
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    React.createElement('button', {
                        onClick: () => setShowWeeklyModal(false),
                        className: 'mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm'
                    }, 'Close')
                )
            ),

            // Weight Modal
            showWeightModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50' },
                React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl p-6 w-full max-w-md flex flex-col items-center' },
                    React.createElement('h3', { className: 'text-lg font-bold text-blue-700 mb-2 flex items-center gap-2' },
                        React.createElement(WeightIcon, { className: 'w-6 h-6' }),
                        'Log Today\'s Weight'
                    ),
                    React.createElement('input', {
                        type: 'number',
                        value: weightInput,
                        onChange: e => setWeightInput(e.target.value),
                        placeholder: 'Enter weight (kg)',
                        min: '0',
                        step: '0.1',
                        className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base mb-2'
                    }),
                    weightError && React.createElement('div', { className: 'text-red-600 text-xs mb-2' }, weightError),
                    React.createElement('div', { className: 'flex gap-2 mt-2 mb-4' },
                        React.createElement('button', {
                            onClick: handleLogWeight,
                            className: 'flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                        }, 'Save'),
                        React.createElement('button', {
                            onClick: () => { setShowWeightModal(false); setWeightInput(''); setWeightError(''); },
                            className: 'flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400'
                        }, 'Close')
                    ),
                    // Weight Graph inside the modal
                    React.createElement('div', { className: 'w-full' },
                        React.createElement('h4', { className: 'text-base font-semibold text-blue-700 mb-2 text-center' }, 'Weight Trend (Last 14 Days)'),
                        React.createElement('div', { className: 'w-full h-40 md:h-48 flex items-end' },
                            React.createElement('svg', {
                                width: '100%',
                                height: '100%',
                                viewBox: '0 0 350 120',
                                className: 'w-full h-full'
                            },
                                weightData.map((d, i) =>
                                    React.createElement('text', {
                                        key: d.date,
                                        x: 25 + (i * 25),
                                        y: 115,
                                        fontSize: 8,
                                        fill: '#64748b',
                                        textAnchor: 'middle'
                                    }, new Date(d.date + 'T00:00:00').getDate())
                                ),
                                [minWeight, maxWeight].map((w, i) =>
                                    React.createElement(React.Fragment, { key: i },
                                        React.createElement('line', {
                                            x1: 20, x2: 340, y1: 10 + (100 * (1 - (w - minWeight) / ((maxWeight - minWeight) || 1))), y2: 10 + (100 * (1 - (w - minWeight) / ((maxWeight - minWeight) || 1))),
                                            stroke: '#e5e7eb', strokeWidth: 1
                                        }),
                                        React.createElement('text', {
                                            x: 10, y: 14 + (100 * (1 - (w - minWeight) / ((maxWeight - minWeight) || 1))),
                                            fontSize: 8, fill: '#64748b', textAnchor: 'end'
                                        }, w)
                                    )
                                ),
                                React.createElement('polyline', {
                                    fill: 'none',
                                    stroke: '#2563eb',
                                    strokeWidth: 2,
                                    points: weightData.map((d, i) => {
                                        if (d.weight === null) return '';
                                        const x = 25 + (i * 25);
                                        const y = 10 + (100 * (1 - ((d.weight - minWeight) / ((maxWeight - minWeight) || 1))));
                                        return `${x},${y}`;
                                    }).filter(Boolean).join(' ')
                                }),
                                weightData.map((d, i) =>
                                    d.weight !== null && React.createElement('circle', {
                                        key: d.date,
                                        cx: 25 + (i * 25),
                                        cy: 10 + (100 * (1 - ((d.weight - minWeight) / ((maxWeight - minWeight) || 1)))),
                                        r: 3,
                                        fill: '#2563eb',
                                        stroke: '#fff',
                                        strokeWidth: 1
                                    })
                                )
                            )
                        ),
                        React.createElement('div', { className: 'text-xs text-gray-500 mt-2 text-center' },
                            'Tip: Log your weight daily to see your trend. Only the last 14 days are shown.'
                        )
                    )
                )
            ),

            // Modal for Adding/Editing Food
            showModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm' },
                // Modal content container: Added flex-col and h-full to manage vertical space
                // MODIFIED: Removed dark mode background
                React.createElement('div', { className: 'bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100 flex flex-col h-full max-h-[90vh]' }, // Adjusted max-h
                    // Modal Header: Adjusted text size
                    // MODIFIED: Removed dark mode text color
                    React.createElement('h2', { className: 'text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center flex-shrink-0' }, getModalTitle()), // Dynamic title

                    // Modal message area: Adjusted text size
                    // MODIFIED: Removed dark mode colors
                    modalMessage.text && React.createElement('div', {
                        className: `p-3 mb-4 rounded-md text-sm ${modalMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} flex-shrink-0 transition-colors` // flex-shrink-0, Added transition
                    }, modalMessage.text),

                    // Modal Body: Added overflow-y-auto and flex-grow
                    React.createElement('div', { className: 'overflow-y-auto flex-grow pr-2' }, // Added pr-2 for scrollbar spacing
                        React.createElement('div', { className: 'mb-4' },
                            // MODIFIED: Removed dark mode text color
                            React.createElement('label', { htmlFor: 'mealType', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Meal Type'), // Added transition
                            // MODIFIED: Removed dark mode colors
                            React.createElement('select', {
                                id: 'mealType', value: selectedMealType, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMealType(e.target.value as MealType), // Cast value to MealType
                                className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                            }, MEAL_TYPES.map(type => React.createElement('option', { key: type, value: type }, type)))
                        ),

                        // Search or Custom Input section
                        !editingMealId ? ( // Show search only when adding or copying
                            React.createElement('div', { className: 'mb-4' },
                                // MODIFIED: Removed dark mode text color
                                React.createElement('label', { htmlFor: 'foodSearch', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Search Food or Enter Custom'), // Added transition
                                React.createElement('div', { className: 'relative flex items-center' },
                                    // MODIFIED: Removed dark mode colors
                                    React.createElement('input', {
                                        type: 'text', id: 'foodSearch', placeholder: 'Type to search or add custom...',
                                        value: searchTerm, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setSelectedFoodForModal(null); setQuantity(1); }, // Reset quantity when typing in search
                                        ref: searchInputRef, // Attach ref to the search input
                                        className: 'w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                                    }) as React.ReactElement, // Cast to React.ReactElement
                                    // MODIFIED: Removed dark mode text color
                                    React.createElement('div', { className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors' }, React.createElement(SearchIcon)) // Added transition
                                )
                            )
                        ) : null, // Hide search when editing

                        // Search Results / Loader / No Results / Suggestions (Show only when adding and search term is present or empty)
                        !editingMealId && (searchTerm.trim() || searchResults.length > 0 || isLoadingSearch) && ( // Show this section if adding and search is active or suggestions are loaded
                             React.createElement('div', { className: 'mb-4' }, // Removed fixed height and overflow here, handled by parent
                                // MODIFIED: Removed dark mode text color
                                isLoadingSearch && React.createElement('div', { className: 'flex justify-center items-center p-4' }, React.createElement(LoaderIcon, { className: 'text-green-500 w-8 h-8 animate-spin' }), React.createElement('span', {className: 'ml-2 text-gray-600 text-sm transition-colors'}, 'Searching...')), // Responsive text size, Added transition
                                // MODIFIED: Removed dark mode text color
                                !isLoadingSearch && searchResults.length === 0 && searchTerm.trim() && React.createElement('p', { className: 'text-gray-500 p-2 text-center text-sm transition-colors' }, `No food items found for "${searchTerm}". Enter details below to add a custom item.`), // Responsive text size, Added transition
                                // MODIFIED: Removed dark mode text color
                                !isLoadingSearch && searchResults.length === 0 && !searchTerm.trim() && React.createElement('p', { className: 'text-gray-500 p-2 text-center text-sm transition-colors' }, `Suggested for ${selectedMealType}:`), // Message for suggestions, Responsive text size, Added transition
                                 // MODIFIED: Removed dark mode border and background
                                 !isLoadingSearch && searchResults.length > 0 && React.createElement('ul', { className: 'space-y-1 border border-gray-200 rounded-md p-1 bg-gray-50 transition-colors' }, // Added transition
                                    searchResults.map(food => React.createElement('li', {
                                        key: food.name,
                                        onClick: () => handleSelectFoodFromSearch(food), // Use the new handler
                                        // MODIFIED: Removed dark mode colors
                                        className: `p-2 hover:bg-green-100 rounded cursor-pointer ${selectedFoodForModal && selectedFoodForModal.name === food.name ? 'bg-green-200 ring-2 ring-green-500' : ''} transition-colors` // Added transition
                                        },
                                         React.createElement('div', { className: 'flex items-center' }, // Flex container for image and text
                                            // Food Image in search results
                                            food.imageUrl && React.createElement('img', {
                                                 src: food.imageUrl,
                                                 alt: food.name,
                                                 className: 'w-8 h-8 rounded-md object-cover mr-3 flex-shrink-0', // flex-shrink-0 to prevent image shrinking
                                                 onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/cccccc/333333?text=🍽️'; } // Fallback image on error
                                            }),
                                            React.createElement('div', { className: 'flex-grow' }, // Text container to take available space
                                                 // MODIFIED: Removed dark mode text color
                                                 React.createElement('strong', { className: 'text-sm md:text-base text-gray-800 transition-colors' }, food.name), // Responsive text size, Added transition
                                                 // MODIFIED: Removed dark mode text color
                                                 React.createElement('span', {className: 'text-xs block text-gray-600 transition-colors'}, ` (per ${food.unit}) - ${food.calories} kcal, P:${food.protein}g, C:${food.carbs}g, F:${food.fat}g, Fibre:${food.fibre || 0}g`) // Display fibre in search results, Responsive text size, Added transition
                                            )
                                         )
                                    ))
                                )
                            )
                        ),

                        // Display selected food details (from database - show only when adding and a food is selected)
                        // MODIFIED: Removed dark mode colors
                        !editingMealId && selectedFoodForModal && React.createElement('div', {className: 'mb-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center flex-shrink-0 transition-colors'}, // Added flex-shrink-0, Added transition
                             // Food Image for selected item
                             selectedFoodForModal.imageUrl && React.createElement('img', {
                                  src: selectedFoodForModal.imageUrl,
                                  alt: selectedFoodForModal.name,
                                  className: 'w-10 h-10 rounded-md object-cover mr-3 flex-shrink-0', // flex-shrink-0
                                  onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/cccccc/333333?text=🍽️'; } // Fallback image on error
                             }),
                             React.createElement('div', { className: 'flex-grow' }, // Text container
                                 // MODIFIED: Removed dark mode text color
                                 React.createElement('h4', {className: 'font-semibold text-green-700 mb-1 text-sm md:text-base transition-colors'}, 'Selected: ' + selectedFoodForModal.name), // Responsive text size, Added transition
                                 // MODIFIED: Removed dark mode text color
                                 React.createElement('p', {className: 'text-xs text-gray-600 transition-colors'}, `Per ${selectedFoodForModal.unit}: ${selectedFoodForModal.calories} kcal, P:${selectedFoodForModal.protein}g, C:${selectedFoodForModal.carbs}g, F:${selectedFoodForModal.fat}g, Fibre:${selectedFoodForModal.fibre || 0}g`) // Display fibre, Responsive text size, Added transition
                             )
                        ),

                        // Custom Food Input Fields (Show if no database item is selected AND (there's a search term with no results OR we are editing OR we are copying a non-database item))
                        showCustomFoodInputs && (
                             React.createElement(Fragment, null,
                                // MODIFIED: Removed dark mode text color
                                !editingMealId && React.createElement('p', { className: 'text-gray-600 text-sm mb-3 flex-shrink-0 transition-colors' }, 'Enter custom food details:'), // Message only when adding custom, flex-shrink-0, Responsive text size, Added transition
                                React.createElement('div', { className: 'mb-4 flex-shrink-0' }, // flex-shrink-0
                                    // MODIFIED: Removed dark mode text color
                                    React.createElement('label', { htmlFor: 'customFoodName', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Food Name'), // Simplified label, Added transition
                                    // MODIFIED: Removed dark mode colors
                                    React.createElement('input', {
                                        type: 'text', id: 'customFoodName', placeholder: 'e.g., Homemade Lasagna',
                                        value: customFoodName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomFoodName(e.target.value),
                                        className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                                    })
                                ),
                                 React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 flex-shrink-0' }, // Responsive grid columns
                                    React.createElement('div', {},
                                         // MODIFIED: Removed dark mode text color
                                         React.createElement('label', { htmlFor: 'customUnit', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Unit'), // Added transition
                                         // MODIFIED: Removed dark mode colors
                                         React.createElement('input', {
                                            type: 'text', id: 'customUnit', placeholder: 'e.g., g, piece, cup', // Updated placeholder
                                            value: customUnit, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomUnit(e.target.value),
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                                        })
                                    ),
                                    React.createElement('div', {},
                                         // MODIFIED: Removed dark mode text color
                                         React.createElement('label', { htmlFor: 'customCalories', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Calories (per unit)'), // Added transition
                                         // MODIFIED: Removed dark mode colors
                                         React.createElement('input', {
                                            type: 'number', id: 'customCalories', placeholder: 'e.g., 250',
                                            value: customCalories, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomCalories(e.target.value),
                                            min: '0', step: '0.1', // Allow decimals for calories per unit
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                                        })
                                    )
                                ) as React.ReactElement, // Cast to React.ReactElement
                                 React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 flex-shrink-0' }, // Responsive grid columns
                                    React.createElement('div', {},
                                         // MODIFIED: Removed dark mode text color
                                         React.createElement('label', { htmlFor: 'customProtein', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Protein (g per unit)'), // Clarified label, Added transition
                                         // MODIFIED: Removed dark mode colors
                                         React.createElement('input', {
                                            type: 'number', id: 'customProtein', placeholder: 'e.g., 20',
                                            value: customProtein, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomProtein(e.target.value),
                                            min: '0', step: '0.1',
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                                        })
                                    ),
                                    React.createElement('div', {},
                                         // MODIFIED: Removed dark mode text color
                                         React.createElement('label', { htmlFor: 'customCarbs', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Carbs (g per unit)'), // Clarified label, Added transition
                                         // MODIFIED: Removed dark mode colors
                                         React.createElement('input', {
                                            type: 'number', id: 'customCarbs', placeholder: 'e.g., 30',
                                            value: customCarbs, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomCarbs(e.target.value),
                                            min: '0', step: '0.1',
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                                        })
                                    ),
                                    React.createElement('div', {},
                                         // MODIFIED: Removed dark mode text color
                                         React.createElement('label', { htmlFor: 'customFat', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Fat (g per unit)'), // Clarified label, Added transition
                                         // MODIFIED: Removed dark mode colors
                                         React.createElement('input', {
                                            type: 'number', id: 'customFat', placeholder: 'e.g., 15',
                                            value: customFat, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomFat(e.target.value),
                                            min: '0', step: '0.1',
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                                        })
                                    ),
                                    React.createElement('div', {}, // Fibre input field
                                         // MODIFIED: Removed dark mode text color
                                         React.createElement('label', { htmlFor: 'customFibre', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, 'Fibre (g per unit)'), // Label for Fibre, Added transition
                                         // MODIFIED: Removed dark mode colors
                                         React.createElement('input', {
                                            type: 'number', id: 'customFibre', placeholder: 'e.g., 5',
                                            value: customFibre, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomFibre(e.target.value),
                                            min: '0', step: '0.1',
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size, Added transition
                                        })
                                    )
                                )
                            )
                        ),

                        // Quantity input and calculated nutrients (always shown)
                        React.createElement('div', { className: 'mb-4' },
                            React.createElement('label', { htmlFor: 'quantity', className: 'block text-sm font-medium text-gray-700 mb-1 transition-colors' }, getQuantityLabel()),
                            React.createElement('input', {
                                type: 'number',
                                id: 'quantity',
                                value: quantity,
                                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value),
                                min: '0.1',
                                step: '0.1',
                                className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base'
                            }),
                            React.createElement('div', { className: 'mt-2 text-xs text-gray-600 transition-colors' },
                                `Calories: ${calculatedNutrients.calories} kcal | Protein: ${calculatedNutrients.protein}g | Carbs: ${calculatedNutrients.carbs}g | Fat: ${calculatedNutrients.fat}g | Fibre: ${calculatedNutrients.fibre}g`
                            )
                        )
                    ),

                    // Modal Footer: Save/Cancel buttons
                    React.createElement('div', { className: 'flex gap-2 mt-4 flex-shrink-0' },
                        React.createElement('button', {
                            onClick: handleSaveFoodEntry,
                            className: 'flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50'
                        }, editingMealId ? 'Save Changes' : 'Add Food'),
                        React.createElement('button', {
                            onClick: closeModal,
                            className: 'flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400'
                        }, 'Cancel')
                    )
                )
            )
        )
    );
}

export default App;