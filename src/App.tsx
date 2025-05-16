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
            React.createElement('span', { className: 'text-sm font-medium text-gray-700 dark:text-gray-300' }, label), // Responsive text size, Dark mode text
            React.createElement('span', { className: `text-xs font-semibold ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}` }, // Responsive text size, Dark mode text
                `${current.toFixed(1)} of ${target.toFixed(1)} ${unit}` // Display current/target with one decimal
            )
        ),
        React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700' }, // Background bar, Dark mode background
            React.createElement('div', {
                className: `${colorClass} h-2.5 rounded-full transition-all duration-500 ease-in-out ${isExceeded ? 'bg-red-600 dark:bg-red-400' : ''}`, // Apply color class, transition, and red if exceeded
                style: { width: `${percentage}%` }
            })
        ),
        React.createElement('div', { className: 'text-right text-xs mt-1' },
            isExceeded
                ? React.createElement('span', { className: 'text-red-600 dark:text-red-400 font-medium' }, `Exceeds By: ${difference.toFixed(1)} ${unit}`) // Dark mode text
                : React.createElement('span', { className: 'text-gray-600 dark:text-gray-400' }, `Remaining: ${difference.toFixed(1)} ${unit}`) // Dark mode text
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
    const [isTotalsMinimized, setIsTotalsMinimized] = useState<boolean>(false); // State to manage minimize/maximize


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
                imageUrl: 'https://placehold.co/40x40/cccccc/333333?text=🍽️' // Default image for custom items
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


    // JSX structure using React.createElement (as in your original stub)
    return (
        // Outer container: Added mx-auto for horizontal centering on larger screens
        React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-green-100 to-blue-100 font-sans p-4 md:p-6 lg:p-8 flex flex-col items-center mx-auto' },
            // Header: Adjusted text size for mobile and desktop
            React.createElement('header', { className: 'w-full max-w-3xl mb-6 text-center' },
                React.createElement('h1', { className: 'text-3xl md:text-4xl font-bold text-green-700 flex items-center justify-center' }, // Responsive text size
                    React.createElement(Utensils, { className: 'mr-2 md:mr-3 w-8 h-8 md:w-10 md:h-10' }), // Responsive icon size
                    'Daily Calorie & Nutrient Tracker'
                )
            ),

            // Main content area: Centered with max-width
            React.createElement('main', { className: 'w-full max-w-3xl bg-white shadow-2xl rounded-xl p-4 md:p-6' }, // Responsive padding
                // Date Navigation & Daily Summary (Sticky Section)
                // Added 'sticky top-0 z-10 bg-gray-50 pb-4' for sticky behavior
                React.createElement('section', { className: 'mb-6 p-3 md:p-4 bg-gray-50 rounded-lg shadow sticky top-0 z-10 pb-4' }, // Responsive padding, added sticky styles and padding-bottom
                    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
                        React.createElement('button', {
                            onClick: () => changeDate(-1),
                            disabled: currentDate <= maxPastDate, // Disable if at the oldest date
                            className: 'p-2 md:p-3 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400' // Responsive padding
                            }, React.createElement(ChevronLeft)
                        ),
                        React.createElement('div', { className: 'text-center' },
                            React.createElement('h2', { className: 'text-lg md:text-xl font-semibold text-gray-700 flex items-center justify-center' }, // Responsive text size
                                React.createElement(CalendarDays, { className: 'mr-1 md:mr-2 w-5 h-5 md:w-6 md:h-6 text-green-600' }), // Responsive icon size
                                currentDate === getToday() ? 'Today' : new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                            ),
                            // Show "Go to Today" button only if not on today's date
                            !isToday && React.createElement('button', {
                                onClick: () => setCurrentDate(getToday()),
                                // MODIFIED: Added light background, dark text for both modes. Added padding & rounding.
                                className: 'text-xs md:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-100 dark:text-gray-700 dark:hover:bg-gray-200 font-medium mt-1 focus:outline-none px-3 py-1 rounded-md transition-colors'
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
                    React.createElement('div', { className: 'flex justify-between items-center mb-3 border-b pb-2' },
                         React.createElement('h3', { className: 'text-lg md:text-xl font-semibold text-gray-700' }, 'Daily Totals'),
                         React.createElement('button', {
                             onClick: () => setIsTotalsMinimized(!isTotalsMinimized), // Toggle minimize state
                             className: 'p-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400'
                         }, isTotalsMinimized ? React.createElement(ChevronDown) : React.createElement(ChevronUp)) // Show down arrow when minimized, up when expanded
                    ),
                    // Daily Totals Progress Bars: Conditionally render and use grid for 2 columns when not minimized
                    React.createElement('div', { className: `mt-4 ${!isTotalsMinimized ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}` }, // Added grid classes for 2 columns on medium screens and up
                         // Calories always visible
                         React.createElement(ProgressBar, { label: 'Calories', current: dailyTotals.calories, target: TARGET_CALORIES, unit: 'kcal', colorClass: 'bg-gray-600 dark:bg-gray-300' }), // Gray/Black for Calories
                         // Other macros visible only when not minimized
                         !isTotalsMinimized && React.createElement(Fragment, null,
                             React.createElement(ProgressBar, { label: 'Protein', current: dailyTotals.protein, target: TARGET_PROTEIN, unit: 'g', colorClass: 'bg-blue-600 dark:bg-blue-400' }), // Blue for Protein
                             React.createElement(ProgressBar, { label: 'Carbs', current: dailyTotals.carbs, target: TARGET_CARBS, unit: 'g', colorClass: 'bg-orange-600 dark:bg-orange-400' }), // Orange for Carbs
                             React.createElement(ProgressBar, { label: 'Fat', current: dailyTotals.fat, target: TARGET_FAT, unit: 'g', colorClass: 'bg-purple-600 dark:bg-purple-400' }), // Purple for Fat
                             React.createElement(ProgressBar, { label: 'Fibre', current: dailyTotals.fibre, target: TARGET_FIBRE, unit: 'g', colorClass: 'bg-pink-600 dark:bg-pink-400' }) // Pink for Fibre
                         )
                    )
                ),

                 // Message when viewing past dates
                !isToday && React.createElement('div', { className: 'mb-6 text-center p-3 bg-blue-100 text-blue-700 rounded-md text-sm' }, // Responsive text size
                    React.createElement('p', { className: 'text-sm' }, 'You are viewing a past date. Food items can only be logged for today.')
                ),


                // Meal Sections
                MEAL_TYPES.map(mealType => {
                    const itemsForMealType = mealsForCurrentDate.filter(meal => meal.mealType === mealType);
                    return React.createElement('section', { key: mealType, className: 'mb-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50' },
                        React.createElement('div', { className: 'flex justify-between items-center mb-3 border-b pb-2' }, // Flex container for title and button
                             React.createElement('h3', { className: 'text-lg md:text-xl font-semibold text-green-700' }, mealType), // Responsive text size
                             // Add Food button for each section (only for today)
                             isToday && React.createElement('button', {
                                onClick: () => openAddModal(mealType), // Pass mealType to the modal
                                className: 'p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-400'
                             }, React.createElement(PlusCircle, { className: 'w-5 h-5' }))
                        ),
                        itemsForMealType.length === 0
                            ? React.createElement('p', { className: 'text-gray-500 italic text-sm' }, `No ${mealType.toLowerCase()} items logged yet.`) // Responsive text size
                            : React.createElement('ul', { className: 'space-y-2' },
                                itemsForMealType.map(meal => (
                                    React.createElement('li', { key: meal.id, className: 'flex justify-between items-start p-3 bg-white rounded-md shadow-sm hover:shadow-md transition-shadow' },
                                        React.createElement('div', { className: 'flex items-center flex-grow' }, // Flex container for image and text
                                            // Food Image
                                            meal.imageUrl && React.createElement('img', {
                                                 src: meal.imageUrl,
                                                 alt: meal.foodName,
                                                 className: 'w-8 h-8 md:w-10 md:h-10 rounded-md object-cover mr-2 md:mr-3', // Responsive size and margin
                                                 onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/cccccc/333333?text=🍽️'; } // Fallback image on error
                                            }),
                                            React.createElement('div', { className: 'flex-grow' }, // Allow text to take remaining space
                                                React.createElement('span', { className: 'font-medium text-gray-800 text-sm md:text-base' }, `${meal.foodName}`), // Responsive text size
                                                // Display the quantity and the specific unit from the log entry
                                                React.createElement('span', { className: 'text-xs text-gray-500 ml-1 md:ml-2 block sm:inline' }, `(${meal.quantity} x ${meal.unit})`), // Responsive text size and margin
                                                React.createElement('div', { className: 'text-xs text-gray-600 mt-1' }, // Responsive text size
                                                    `Cals: ${meal.calories} | P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g | Fibre: ${meal.fibre || 0}g` // Display Fibre
                                                )
                                            )
                                        ),
                                        // Only allow editing and deleting food if viewing today's date
                                        isToday && React.createElement('div', { className: 'flex items-center space-x-1 md:space-x-2 ml-2 flex-shrink-0' }, // Responsive spacing
                                            // Copy Button
                                            React.createElement('button', {
                                                onClick: () => openCopyModal(meal), // Open modal for copying
                                                // MODIFIED: Added bg-transparent, adjusted text colors for light/dark modes
                                                className: 'bg-transparent text-green-600 dark:bg-transparent dark:text-green-500 hover:text-green-700 hover:bg-green-100 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-400'
                                                }, React.createElement(CopyIcon)
                                            ),
                                            // Edit Button
                                            React.createElement('button', {
                                                onClick: () => openEditModal(meal), // Open modal for editing
                                                // MODIFIED: Added bg-transparent, adjusted text colors for light/dark modes
                                                className: 'bg-transparent text-blue-600 dark:bg-transparent dark:text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400'
                                                }, React.createElement(EditIcon)
                                            ),
                                            // Delete Button
                                            React.createElement('button', {
                                                onClick: () => handleDeleteFood(meal.id),
                                                // MODIFIED: Added bg-transparent, adjusted text colors for light/dark modes
                                                className: 'bg-transparent text-red-600 dark:bg-transparent dark:text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400'
                                                }, React.createElement(Trash2)
                                            )
                                        )
                                    )
                                ))
                            )
                    );
                })
            ),

            // Modal for Adding/Editing Food
            showModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm' },
                // Modal content container: Added flex-col and h-full to manage vertical space
                React.createElement('div', { className: 'bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100 flex flex-col h-full max-h-[90vh]' }, // Adjusted max-h
                    // Modal Header: Adjusted text size
                    React.createElement('h2', { className: 'text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center flex-shrink-0' }, getModalTitle()), // Dynamic title

                    // Modal message area: Adjusted text size
                    modalMessage.text && React.createElement('div', {
                        className: `p-3 mb-4 rounded-md text-sm ${modalMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} flex-shrink-0` // flex-shrink-0
                    }, modalMessage.text),

                    // Modal Body: Added overflow-y-auto and flex-grow
                    React.createElement('div', { className: 'overflow-y-auto flex-grow pr-2' }, // Added pr-2 for scrollbar spacing
                        React.createElement('div', { className: 'mb-4' },
                            React.createElement('label', { htmlFor: 'mealType', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Meal Type'),
                            React.createElement('select', {
                                id: 'mealType', value: selectedMealType, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedMealType(e.target.value as MealType), // Cast value to MealType
                                className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                            }, MEAL_TYPES.map(type => React.createElement('option', { key: type, value: type }, type)))
                        ),

                        // Search or Custom Input section
                        !editingMealId ? ( // Show search only when adding or copying
                            React.createElement('div', { className: 'mb-4' },
                                React.createElement('label', { htmlFor: 'foodSearch', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Search Food or Enter Custom'),
                                React.createElement('div', { className: 'relative flex items-center' },
                                    React.createElement('input', {
                                        type: 'text', id: 'foodSearch', placeholder: 'Type to search or add custom...',
                                        value: searchTerm, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setSelectedFoodForModal(null); setQuantity(1); }, // Reset quantity when typing in search
                                        ref: searchInputRef, // Attach ref to the search input
                                        className: 'w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                                    }) as React.ReactElement, // Cast to React.ReactElement
                                    React.createElement('div', { className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' }, React.createElement(SearchIcon))
                                )
                            )
                        ) : null, // Hide search when editing

                        // Search Results / Loader / No Results / Suggestions (Show only when adding and search term is present or empty)
                        !editingMealId && (searchTerm.trim() || searchResults.length > 0 || isLoadingSearch) && ( // Show this section if adding and search is active or suggestions are loaded
                             React.createElement('div', { className: 'mb-4' }, // Removed fixed height and overflow here, handled by parent
                                isLoadingSearch && React.createElement('div', { className: 'flex justify-center items-center p-4' }, React.createElement(LoaderIcon, { className: 'text-green-500 w-8 h-8 animate-spin' }), React.createElement('span', {className: 'ml-2 text-gray-600 text-sm'}, 'Searching...')), // Responsive text size
                                !isLoadingSearch && searchResults.length === 0 && searchTerm.trim() && React.createElement('p', { className: 'text-gray-500 p-2 text-center text-sm' }, `No food items found for "${searchTerm}". Enter details below to add a custom item.`), // Responsive text size
                                !isLoadingSearch && searchResults.length === 0 && !searchTerm.trim() && React.createElement('p', { className: 'text-gray-500 p-2 text-center text-sm' }, `Suggested for ${selectedMealType}:`), // Message for suggestions, Responsive text size
                                 !isLoadingSearch && searchResults.length > 0 && React.createElement('ul', { className: 'space-y-1 border border-gray-200 rounded-md p-1 bg-gray-50' },
                                    searchResults.map(food => React.createElement('li', {
                                        key: food.name,
                                        onClick: () => handleSelectFoodFromSearch(food), // Use the new handler
                                        className: `p-2 hover:bg-green-100 rounded cursor-pointer ${selectedFoodForModal && selectedFoodForModal.name === food.name ? 'bg-green-200 ring-2 ring-green-500' : ''}`
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
                                                 React.createElement('strong', { className: 'text-sm md:text-base' }, food.name), // Responsive text size
                                                 React.createElement('span', {className: 'text-xs block text-gray-600'}, ` (per ${food.unit}) - ${food.calories} kcal, P:${food.protein}g, C:${food.carbs}g, F:${food.fat}g, Fibre:${food.fibre || 0}g`) // Display fibre in search results, Responsive text size
                                            )
                                         )
                                    ))
                                )
                            )
                        ),

                        // Display selected food details (from database - show only when adding and a food is selected)
                        !editingMealId && selectedFoodForModal && React.createElement('div', {className: 'mb-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center flex-shrink-0'}, // Added flex-shrink-0
                             // Food Image for selected item
                             selectedFoodForModal.imageUrl && React.createElement('img', {
                                  src: selectedFoodForModal.imageUrl,
                                  alt: selectedFoodForModal.name,
                                  className: 'w-10 h-10 rounded-md object-cover mr-3 flex-shrink-0', // flex-shrink-0
                                  onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/cccccc/333333?text=🍽️'; } // Fallback image on error
                             }),
                             React.createElement('div', { className: 'flex-grow' }, // Text container
                                 React.createElement('h4', {className: 'font-semibold text-green-700 text-sm md:text-base'}, 'Selected: ' + selectedFoodForModal.name), // Responsive text size
                                 React.createElement('p', {className: 'text-xs text-gray-600'}, `Per ${selectedFoodForModal.unit}: ${selectedFoodForModal.calories} kcal, P:${selectedFoodForModal.protein}g, C:${selectedFoodForModal.carbs}g, F:${selectedFoodForModal.fat}g, Fibre:${selectedFoodForModal.fibre || 0}g`) // Display fibre, Responsive text size
                             )
                        ),

                        // Custom Food Input Fields (Show if no database item is selected AND (there's a search term with no results OR we are editing OR we are copying a non-database item))
                        showCustomFoodInputs && (
                             React.createElement(Fragment, null,
                                !editingMealId && React.createElement('p', { className: 'text-gray-600 text-sm mb-3 flex-shrink-0' }, 'Enter custom food details:'), // Message only when adding custom, flex-shrink-0, Responsive text size
                                React.createElement('div', { className: 'mb-4 flex-shrink-0' }, // flex-shrink-0
                                    React.createElement('label', { htmlFor: 'customFoodName', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Food Name'), // Simplified label
                                    React.createElement('input', {
                                        type: 'text', id: 'customFoodName', placeholder: 'e.g., Homemade Lasagna',
                                        value: customFoodName, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomFoodName(e.target.value),
                                        className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                                    })
                                ),
                                 React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 flex-shrink-0' }, // Responsive grid columns
                                    React.createElement('div', {},
                                         React.createElement('label', { htmlFor: 'customUnit', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Unit'),
                                         React.createElement('input', {
                                            type: 'text', id: 'customUnit', placeholder: 'e.g., g, piece, cup', // Updated placeholder
                                            value: customUnit, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomUnit(e.target.value),
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                                        })
                                    ),
                                    React.createElement('div', {},
                                         React.createElement('label', { htmlFor: 'customCalories', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Calories (per unit)'),
                                         React.createElement('input', {
                                            type: 'number', id: 'customCalories', placeholder: 'e.g., 250',
                                            value: customCalories, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomCalories(e.target.value),
                                            min: '0', step: '0.1', // Allow decimals for calories per unit
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                                        })
                                    )
                                ) as React.ReactElement, // Cast to React.ReactElement
                                 React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 flex-shrink-0' }, // Responsive grid columns
                                    React.createElement('div', {},
                                         React.createElement('label', { htmlFor: 'customProtein', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Protein (g per unit)'), // Clarified label
                                         React.createElement('input', {
                                            type: 'number', id: 'customProtein', placeholder: 'e.g., 20',
                                            value: customProtein, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomProtein(e.target.value),
                                            min: '0', step: '0.1',
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                                        })
                                    ),
                                    React.createElement('div', {},
                                         React.createElement('label', { htmlFor: 'customCarbs', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Carbs (g per unit)'), // Clarified label
                                         React.createElement('input', {
                                            type: 'number', id: 'customCarbs', placeholder: 'e.g., 30',
                                            value: customCarbs, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomCarbs(e.target.value),
                                            min: '0', step: '0.1',
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                                        })
                                    ),
                                    React.createElement('div', {},
                                         React.createElement('label', { htmlFor: 'customFat', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Fat (g per unit)'), // Clarified label
                                         React.createElement('input', {
                                            type: 'number', id: 'customFat', placeholder: 'e.g., 15',
                                            value: customFat, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomFat(e.target.value),
                                            min: '0', step: '0.1',
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                                        })
                                    ),
                                     React.createElement('div', {}, // Fibre input field
                                         React.createElement('label', { htmlFor: 'customFibre', className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Fibre (g per unit)'), // Label for Fibre
                                         React.createElement('input', {
                                            type: 'number', id: 'customFibre', placeholder: 'e.g., 5',
                                            value: customFibre, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCustomFibre(e.target.value),
                                            min: '0', step: '0.1',
                                            className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base' // Responsive text size
                                        })
                                    )
                                ) as React.ReactElement // Cast to React.ReactElement
                             )
                        ),


                        React.createElement('div', { className: 'mb-4 flex-shrink-0' }, // Added margin-bottom to separate from calculated values, flex-shrink-0
                            React.createElement('label', { htmlFor: 'quantity', className: 'block text-sm font-medium text-gray-700 mb-1' }, getQuantityLabel()), // Dynamic quantity label
                            React.createElement('input', {
                                type: 'number', id: 'quantity', value: quantity, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value),
                                min: '0.1', step: '0.1', disabled: isLoadingSearch || (!selectedFoodForModal && !showCustomFoodInputs), // Disable if loading or no food/custom option is ready
                                className: 'w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 text-sm md:text-base' // Responsive text size
                            }) as React.ReactElement // Cast to React.ReactElement
                        ),

                        // Display calculated nutrients in real-time
                        (selectedFoodForModal || showCustomFoodInputs) && React.createElement('div', { className: 'mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-700 flex-shrink-0' }, // flex-shrink-0
                             React.createElement('h4', { className: 'font-semibold text-blue-700 mb-2 text-sm md:text-base' }, 'Calculated for this quantity:'), // Responsive text size
                             React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs md:text-sm' }, // Updated grid columns for better spacing, Responsive text size
                                 React.createElement('div', {}, React.createElement('p', { className: 'font-bold' }, `${calculatedNutrients.calories} kcal`), React.createElement('p', { className: 'text-xs text-gray-600' }, 'Cals')), // Responsive text size
                                 React.createElement('div', {}, React.createElement('p', { className: 'font-bold' }, `${calculatedNutrients.protein}g`), React.createElement('p', { className: 'text-xs text-gray-600' }, 'Protein')), // Responsive text size
                                 React.createElement('div', {}, React.createElement('p', { className: 'font-bold' }, `${calculatedNutrients.carbs}g`), React.createElement('p', { className: 'text-xs text-gray-600' }, 'Carbs')), // Responsive text size
                                 React.createElement('div', {}, React.createElement('p', { className: 'font-bold' }, `${calculatedNutrients.fat}g`), React.createElement('p', { className: 'text-xs text-gray-600' }, 'Fat')), // Responsive text size
                                 React.createElement('div', {}, React.createElement('p', { className: 'font-bold' }, `${calculatedNutrients.fibre}g`), React.createElement('p', { className: 'text-xs text-gray-600' }, 'Fibre')) // Display Fibre, Responsive text size
                             )
                        )
                    ),


                    // Modal action buttons (Footer)
                    React.createElement('div', { className: 'flex flex-col sm:flex-row gap-3 mt-auto flex-shrink-0 pt-4 border-t border-gray-200' }, // Added mt-auto, flex-shrink-0, pt-4, border-t
                        React.createElement('button', {
                            onClick: handleSaveFoodEntry, // Use the new save function
                            disabled: isLoadingSearch || parseFloat(quantity as string) <= 0 || isNaN(parseFloat(quantity as string)) || (!selectedFoodForModal && !showCustomFoodInputs) || (showCustomFoodInputs && (!customFoodName.trim() || !customUnit.trim() || isNaN(parseFloat(customCalories as string)) || isNaN(parseFloat(customProtein as string)) || isNaN(parseFloat(customCarbs as string)) || isNaN(parseFloat(customFat as string)) || isNaN(parseFloat(customFibre as string)) || parseFloat(customCalories as string) < 0 || parseFloat(customProtein as string) < 0 || parseFloat(customCarbs as string) < 0 || parseFloat(customFat as string) < 0 || parseFloat(customFibre as string) < 0)), // Complex disable logic including fibre
                            className: 'flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base' // Responsive text size
                            }, editingMealId ? 'Save Changes' : (copyingMeal ? 'Add Copied Food' : 'Add Food') // Dynamic button text
                        ),
                        React.createElement('button', {
                            onClick: closeModal, // Use the new closeModal function
                            className: 'flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 text-sm md:text-base' // Responsive text size
                            }, 'Cancel'
                        )
                    )
                )
            ),
            // Footer: Adjusted text size
            React.createElement('footer', { className: 'w-full max-w-3xl mt-8 text-center text-xs md:text-sm' }, // Responsive text size
                React.createElement('p', { className: 'text-gray-500' }, 'Nutrient data is for demonstration and may not be accurate. Always consult official sources or a nutritionist.')
            )
        )
    );
}

export default App; // Export the component as default

// If you are still encountering "Cannot find namespace 'JSX'" errors,
// you might need to install the React type definitions:
// npm install --save-dev @types/react @types/react-dom
