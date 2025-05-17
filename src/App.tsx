import React, { useState, useEffect, Fragment, useRef } from 'react'; // Import hooks, Fragment, and useRef from React
import type { JSX } from 'react/jsx-dev-runtime';

// --- Import Type Definitions and Constants ---
// Assuming types are in a 'types.ts' file or similar
import type { FoodItem, LoggedFoodItem, MealType, LoggedMeals, ModalMessage } from './types'; // Assuming types are in a 'types.ts' file
// Import constants from constants/index.ts
import {
    MEAL_TYPES,
    DETAILED_FOOD_DATABASE,
    MEAL_SUGGESTIONS,
    TARGET_CALORIES,
    TARGET_PROTEIN,
    TARGET_CARBS,
    TARGET_FAT,
    TARGET_FIBRE,
} from './constants/index'; // Import constants from index.ts

 // Import utility functions from utils.ts
 import { getToday, formatDate, addDays } from './utils'; // Import utility functions

// Assuming searchFoodDatabase is also in utils.ts and handles suggestions when query is empty
// If searchFoodDatabase is defined differently in your utils.ts, you might need to adjust this import or the function call below.
import { searchFoodDatabase as searchFoodDatabaseUtil } from './utils';


// --- Import Components ---

import ProgressBar from './components/ProgressBar'; // Import ProgressBar component from components folder
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    PlusCircle,
    Trash2,
    Utensils,
    SearchIcon,
    LoaderIcon,
    EditIcon,
    CopyIcon,
    ChevronDown,
    ChevronUp,
    BarChartIcon,
    WeightIcon
} from './components/Icons'; // Import Icons from components folder

// --- Additional Type Definitions (if not in types.ts) ---
// If WeightLog is not in types.ts, define it here or move it to types.ts
type WeightLog = { date: string; weight: number };


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

    // New state for Copy Day Template Modal
    const [showCopyDayModal, setShowCopyDayModal] = useState<boolean>(false);
    const [copySourceDate, setCopySourceDate] = useState<string | null>(null);
    const [copyTargetDate, setCopyTargetDate] = useState<string>(getToday());
    const [copyDayError, setCopyDayError] = useState<string>('');

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

        console.log('Modal is open, running search effect.'); // Debugging log

        // Auto-focus the search input when adding a new item
        if (editingMealId === null && copyingMeal === null && searchInputRef.current) {
             searchInputRef.current.focus();
        }


        const query = searchTerm.trim();

        // Only perform search/suggestions if we are adding or copying (not editing)
        if (editingMealId === null) {
if (!query) {
    // If search term is empty, DO NOT show any search results (just suggestions in UI)
    setSearchResults([]);
    setIsLoadingSearch(false);
    setSelectedFoodForModal(null);
    // Clear custom fields when search term is empty
    setCustomFoodName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomFibre('');
    setCustomUnit('g');
    return;
}

             // If search term is not empty, perform standard search
             setIsLoadingSearch(true);
             console.log(`Search term is not empty, searching for: ${query}`); // Debugging log
             const handler = setTimeout(() => {
try {
    const results = searchFoodDatabaseUtil(query, DETAILED_FOOD_DATABASE);
    setSearchResults(results);
    setIsLoadingSearch(false);
    if (results.length === 0) {
        setSelectedFoodForModal(null);
        setCustomFoodName(query);
    } else {
        setCustomFoodName('');
        setCustomCalories('');
        setCustomProtein('');
        setCustomCarbs('');
        setCustomFat('');
        setCustomFibre('');
        setCustomUnit('g');
    }
} catch  {
    setIsLoadingSearch(false);
    setModalMessage({ text: 'Error during search.', type: 'error' });
}
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
             const protPerUnit = parseFloat(customProtein as string); // Cast customProtein as string
             const carbsPerUnit = parseFloat(customCarbs as string); // Cast customCarbs as string
             const fatPerUnit = parseFloat(customFat as string); // Cast customFat as string
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

    // Handler: Actually copy the template
    const handleCopyDayTemplate = () => {
        if (!copySourceDate || !copyTargetDate) {
            setCopyDayError('Please select a date.');
            return;
        }
        if (copySourceDate === copyTargetDate) {
            setCopyDayError('Cannot copy to the same day.');
            return;
        }
        // Copy all meals from source to target date (overwrite)
        const sourceMeals = loggedMeals[copySourceDate] || [];
        if (sourceMeals.length === 0) {
            setCopyDayError('No meals to copy from the selected day.');
            return;
        }
        // Assign new IDs to each meal for the target day
        const copiedMeals = sourceMeals.map(meal => ({
            ...meal,
            id: Date.now().toString() + Math.random().toString(36).slice(2, 8), // Unique ID
        }));
        setLoggedMeals(prev => ({
            ...prev,
            [copyTargetDate]: copiedMeals,
        }));
        setShowCopyDayModal(false);
    };


    // Function to handle opening the modal for adding
    const openAddModal = (mealType: MealType) => { // Accept mealType as argument
        console.log('openAddModal called for meal type:', mealType); // Debugging log
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
        setShowModal(true); // This should trigger the modal to show
        console.log('showModal set to true.'); // Debugging log
    };

    // Function to handle opening the modal for editing
    const openEditModal = (meal: LoggedFoodItem) => { // meal is a LoggedFoodItem
         console.log('openEditModal called for meal:', meal); // Debugging log
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
         console.log('showModal set to true for editing.'); // Debugging log
    };

    // Function to handle opening the modal for copying
    const openCopyModal = (meal: LoggedFoodItem) => { // meal is a LoggedFoodItem
        console.log('openCopyModal called for meal:', meal); // Debugging log
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
        console.log('showModal set to true for copying.'); // Debugging log
    };


    // Function to close the modal and reset states
    const closeModal = () => {
        console.log('closeModal called.'); // Debugging log
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
        console.log('Selected food from search:', food); // Debugging log
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
        console.log('Date selected from calendar:', date); // Debugging log
        setCurrentDate(date);
        setShowCalendarModal(false); // Close calendar modal after selection
    };

    // Helper: Get next 7 days (including today)
    const next7Days = Array.from({ length: 7 }, (_, i) => addDays(getToday(), i));

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

            // Container for top CTA buttons
            React.createElement('div', { className: 'w-full max-w-3xl flex justify-end items-center gap-2 mb-4' },
                // Weekly Average CTA - Icon only
                React.createElement('button', {
                    onClick: () => setShowWeeklyModal(true),
                    className: 'p-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50',
                    'aria-label': 'Show Weekly Calorie Average'
                },
                    React.createElement(BarChartIcon, { className: 'w-5 h-5' })
                ),
                // Weight Log CTA - Icon only
                React.createElement('button', {
                    onClick: () => setShowWeightModal(true),
                    className: 'p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
                    'aria-label': 'Log Weight & View Trend'
                },
                    React.createElement(WeightIcon, { className: 'w-5 h-5' })
                ),
                // Copy Day Template CTA - Icon only
                React.createElement('button', {
                    onClick: () => setShowCopyDayModal(true),
                    className: 'p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50',
                    'aria-label': 'Copy Day Template'
                },
                    React.createElement('svg', { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', strokeWidth: 2, viewBox: '0 0 24 24' },
                        React.createElement('path', { d: 'M8 17l4 4 4-4m-4-5v9', strokeLinecap: 'round', strokeLinejoin: 'round' }),
                        React.createElement('rect', { x: 3, y: 3, width: 18, height: 13, rx: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
                    )
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
                                React.createElement(
                                    React.Fragment,
                                    null,
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
            showModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm' },// Debugging log
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
                        !editingMealId && ( // Show this section if adding and search is active or suggestions are loaded
                             React.createElement('div', { className: 'mb-4' }, // Removed fixed height and overflow here, handled by parent
                                // MODIFIED: Removed dark mode text color
                                isLoadingSearch && React.createElement('div', { className: 'flex justify-center items-center p-4' }, React.createElement(LoaderIcon, { className: 'text-green-500 w-8 h-8 animate-spin' }), React.createElement('span', {className: 'ml-2 text-gray-600 text-sm transition-colors'}, 'Searching...')), // Responsive text size, Added transition
                                // MODIFIED: Removed dark mode text color
                                !isLoadingSearch && searchResults.length === 0 && searchTerm.trim() && React.createElement('p', { className: 'text-gray-500 p-2 text-center text-sm transition-colors' }, `No food items found for "${searchTerm}". Enter details below to add a custom item.`), // Responsive text size, Added transition
                                // MODIFIED: Removed dark mode text color
                                !isLoadingSearch && !searchTerm.trim() && !editingMealId && React.createElement(
                            React.Fragment,
                            null,
                            React.createElement('p', { className: 'text-gray-500 p-2 text-center text-sm transition-colors' }, `Suggested for ${selectedMealType}:`),
                            React.createElement('ul', { className: 'flex flex-wrap gap-2 justify-center mt-2' },
                                (MEAL_SUGGESTIONS[selectedMealType] || []).map(suggestion =>
                                    React.createElement('li', { key: suggestion },
                                        React.createElement('button', {
                                            type: 'button',
                                            className: 'px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-full text-xs font-medium transition-colors',
                                            onClick: () => setSearchTerm(suggestion)
                                        }, suggestion)
                                    )
                                )
                            )
                        ), // Message for suggestions, Responsive text size, Added transition
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
            ),

            // Copy Day Template Modal
            showCopyDayModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50' },
                React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center' },
                    React.createElement('h3', { className: 'text-lg font-bold text-yellow-700 mb-2 flex items-center gap-2' },
                        React.createElement('svg', { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, viewBox: '0 0 24 24' },
                            React.createElement('path', { d: 'M8 17l4 4 4-4m-4-5v9', strokeLinecap: 'round', strokeLinejoin: 'round' }),
                            React.createElement('rect', { x: 3, y: 3, width: 18, height: 13, rx: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
                        ),
                        'Copy Day Template'
                    ),
                    React.createElement('div', { className: 'w-full mb-4' },
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Select day to copy from:'),
                        React.createElement(
                            'select',
                            {
                                value: copySourceDate || '',
                                onChange: e => setCopySourceDate((e.target as HTMLSelectElement).value),
                                className: 'w-full p-2 border border-gray-300 rounded mb-2'
                            } as React.SelectHTMLAttributes<HTMLSelectElement>,
                            React.createElement('option', { value: '', disabled: true }, 'Select a day'),
                            last7Days
                                .filter(date => (loggedMeals[date] && loggedMeals[date].length > 0))
                                .map(date =>
                                    React.createElement('option', { key: date, value: date },
                                        new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                    )
                                )
                        ),
                        React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Copy to:'),
                        React.createElement(
                            'select',
                            {
                                value: copyTargetDate,
                                onChange: e => setCopyTargetDate((e.target as HTMLSelectElement).value),
                                className: 'w-full p-2 border border-gray-300 rounded'
                            } as React.SelectHTMLAttributes<HTMLSelectElement>,
                            next7Days.map(date =>
                                React.createElement('option', { key: date, value: date },
                                    new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                                    date === getToday() ? ' (Today)' : ''
                                )
                            )
                        )
                    ),
                    copyDayError && React.createElement('div', { className: 'text-red-600 text-xs mb-2' }, copyDayError),
                    React.createElement('div', { className: 'flex gap-2 mt-2' },
                        React.createElement('button', {
                            onClick: handleCopyDayTemplate,
                            className: 'flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400'
                        }, 'Copy'),
                        React.createElement('button', {
                            onClick: () => setShowCopyDayModal(false),
                            className: 'flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400'
                        }, 'Cancel')
                    )
                )
            )
        )
    );
}

export default App;