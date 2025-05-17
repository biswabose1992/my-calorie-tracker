import React, { useState, useEffect, Fragment, useRef } from 'react'; // Import hooks, Fragment, and useRef from React
import type { JSX } from 'react/jsx-dev-runtime';

// --- Import Type Definitions and Constants ---
// Assuming types are in a 'types.ts' file or similar
import type { FoodItem, LoggedFoodItem, MealType, LoggedMeals, ModalMessage } from './types/types'; // Assuming types are in a 'types.ts' file
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
} from './constants/nutritionConstants'; // Import constants from index.ts

// Import utility functions from utils.ts
import { getToday, formatDate, addDays } from './utils/dateUtils'; // Import utility functions

// Assuming searchFoodDatabase is also in utils.ts and handles suggestions when query is empty
// If searchFoodDatabase is defined differently in your utils.ts, you might need to adjust this import or the function call below.
import { searchFoodDatabase as searchFoodDatabaseUtil } from './utils/dateUtils';


// --- Import Components ---

import ProgressBar from './components/ProgressBar'; // Import ProgressBar component from components folder
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    PlusCircle,
    Trash2,
    Utensils,
    EditIcon,
    CopyIcon,
    ChevronDown,
    ChevronUp,
    BarChartIcon,
    WeightIcon
} from './components/Icons'; // Import Icons from components folder
import WeeklyAverageModal from './modals/WeeklyAverageModal';
import CalendarModal from './modals/CalendarModal';
import WeightModal from './modals/WeightModal';
import FoodModal from './modals/FoodModal';
import CopyDayTemplateModal from './modals/CopyDayTemplateModal';

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
    const [weightDate, setWeightDate] = useState(getToday());
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

    // Ref for the scrollable weight graph container
    const weightGraphContainerRef = useRef<HTMLDivElement>(null);


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
        setWeightLogs(prev => {
            const filtered = prev.filter(log => log.date !== weightDate);
            return [...filtered, { date: weightDate, weight }];
        });
        setWeightInput('');
        setWeightError('');
        setShowWeightModal(false);
    };

    // Ensure weightData is sorted by date for correct graph plotting
    const last14Days = Array.from({ length: 14 }, (_, i) => addDays(getToday(), -13 + i));
    const weightData = last14Days.map(date => {
        const log = weightLogs.find(l => l.date === date);
        return { date, weight: log ? log.weight : null };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date ascending

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
                } catch {
                    setIsLoadingSearch(false);
                    setModalMessage({ text: 'Error during search.', type: 'error' });
                }
            }, 300); // Debounce delay

            // Cleanup function: This runs when the effect re-runs (due to searchTerm change)
            // or when the component unmounts. It clears the previous timeout.
            return () => clearTimeout(handler);
        }


    }, [searchTerm, showModal, editingMealId, selectedMealType, copyingMeal]); // Dependencies updated


    // Effect to scroll the weight graph to the current date when the modal opens
    useEffect(() => {
        if (showWeightModal && weightGraphContainerRef.current) {
            // Find the index of the current weightDate in the weightData array
            const currentIndex = weightData.findIndex(d => d.date === weightDate);
            if (currentIndex !== -1) {
                // Calculate the scroll position needed to center the current date
                // Assuming each date point takes up roughly equal horizontal space
                const totalWidth = 700; // The fixed width of the SVG
                const pointWidth = totalWidth / weightData.length;
                const centerPosition = (currentIndex * pointWidth) + (pointWidth / 2);

                // Calculate the scrollLeft value to bring the centerPosition into the middle of the container
                const containerWidth = weightGraphContainerRef.current.offsetWidth;
                const scrollLeft = centerPosition - (containerWidth / 2);

                // Scroll the container
                weightGraphContainerRef.current.scrollLeft = scrollLeft;
            }
        }
    }, [showWeightModal, weightDate, weightData]); // Dependencies: re-run when modal opens, weightDate changes, or weightData changes


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

        // --- FIX: Calculate per-unit values with full precision ---
        // Only calculate if quantity is greater than 0 to avoid division by zero
        const quantityLogged = meal.quantity > 0 ? meal.quantity : 1; // Use 1 to avoid division by zero if quantity is 0

        setCustomCalories(meal.calories / quantityLogged); // Store full precision
        setCustomProtein(meal.protein / quantityLogged); // Store full precision
        setCustomCarbs(meal.carbs / quantityLogged);   // Store full precision
        setCustomFat(meal.fat / quantityLogged);     // Store full precision
        setCustomFibre((meal.fibre || 0) / quantityLogged); // Store full precision, handle optional fibre


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
        // --- FIX: Calculate per-unit values with full precision when copying ---
        const quantityLogged = meal.quantity > 0 ? meal.quantity : 1; // Use 1 to avoid division by zero if quantity is 0

        setCustomCalories(meal.calories / quantityLogged); // Store full precision
        setCustomProtein(meal.protein / quantityLogged); // Store full precision
        setCustomCarbs(meal.carbs / quantityLogged);   // Store full precision
        setCustomFat(meal.fat / quantityLogged);     // Store full precision
        setCustomFibre((meal.fibre || 0) / quantityLogged); // Store full precision, handle optional fibre


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
        console.log(`changeDate called with offset: ${offset}. Current date: ${currentDate}. Calculated new date: ${newDate}. Today: ${today}. Seven days ago: ${sevenDaysAgo}`); // Debugging log
        // Prevent navigating beyond today or before the 7-day history window
        if (newDate > today || newDate < sevenDaysAgo) {
            console.log('Navigation blocked: new date is outside allowed range.'); // Debugging log
            // Optionally show a message or just do nothing
            return;
        }
        console.log('Setting current date to:', newDate); // Debugging log
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
                    'Daily Calorie & Nutrition Tracker'
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
                    onClick: () => {
                        setWeightDate(currentDate); // Set the weight date to the currently viewed date
                        setShowWeightModal(true);
                    },
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
                            disabled: new Date(currentDate) >= new Date(getToday()), // Disable if current date is today or in the future
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
                !isToday && React.createElement('div', { className: 'mb-6 text-center p-3 bg-blue-100 text-blue-700 rounded-md text-sm transition-colors' },
                    React.createElement('p', { className: 'text-sm' }, 'You are viewing a past date. You can log or edit food items for this day.')
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
                            React.createElement('button', {
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
            React.createElement(React.Fragment, null,
                React.createElement(CalendarModal, {
                    show: showCalendarModal,
                    daysOfWeek: daysOfWeek,
                    getCalendarDays: getCalendarDays,
                    handleDateSelect: handleDateSelect,
                    onClose: () => setShowCalendarModal(false)
                }),
                React.createElement(WeeklyAverageModal, {
                    show: showWeeklyModal,
                    weeklyAverage: weeklyAverage,
                    last7Days: last7Days,
                    weeklyCalories: weeklyCalories,
                    onClose: () => setShowWeeklyModal(false)
                })
            ),

            // Weight Modal
            React.createElement(WeightModal, {
                show: showWeightModal,
                weightDate: weightDate,
                setWeightDate: setWeightDate,
                weightInput: weightInput,
                setWeightInput: setWeightInput,
                weightError: weightError,
                handleLogWeight: handleLogWeight,
                onClose: () => { setShowWeightModal(false); setWeightInput(''); setWeightError(''); },
                weightData: weightData,
                minWeight: minWeight,
                maxWeight: maxWeight,
                weightGraphContainerRef: weightGraphContainerRef
            }),

            // Modal for Adding/Editing Food
            React.createElement(FoodModal, {
                show: showModal,
                getModalTitle: getModalTitle,
                modalMessage: modalMessage,
                selectedMealType: selectedMealType,
                setSelectedMealType: setSelectedMealType,
                MEAL_TYPES: MEAL_TYPES,
                editingMealId: editingMealId,
                searchTerm: searchTerm,
                setSearchTerm: setSearchTerm,
                searchInputRef: searchInputRef,
                isLoadingSearch: isLoadingSearch,
                searchResults: searchResults,
                handleSelectFoodFromSearch: handleSelectFoodFromSearch,
                selectedFoodForModal: selectedFoodForModal,
                showCustomFoodInputs: showCustomFoodInputs,
                customFoodName: customFoodName,
                setCustomFoodName: setCustomFoodName,
                customUnit: customUnit,
                setCustomUnit: setCustomUnit,
                customCalories: customCalories,
                setCustomCalories: setCustomCalories,
                customProtein: customProtein,
                setCustomProtein: setCustomProtein,
                customCarbs: customCarbs,
                setCustomCarbs: setCustomCarbs,
                customFat: customFat,
                setCustomFat: setCustomFat,
                customFibre: customFibre,
                setCustomFibre: setCustomFibre,
                quantity: quantity,
                setQuantity: setQuantity,
                getQuantityLabel: getQuantityLabel,
                calculatedNutrients: calculatedNutrients,
                handleSaveFoodEntry: handleSaveFoodEntry,
                closeModal: closeModal,
                MEAL_SUGGESTIONS: MEAL_SUGGESTIONS
            }),

            // Copy Day Template Modal
            React.createElement(CopyDayTemplateModal, {
                show: showCopyDayModal,
                last7Days: last7Days,
                next7Days: next7Days,
                loggedMeals: loggedMeals,
                copySourceDate: copySourceDate,
                setCopySourceDate: setCopySourceDate,
                copyTargetDate: copyTargetDate,
                setCopyTargetDate: setCopyTargetDate,
                getToday: getToday,
                copyDayError: copyDayError,
                handleCopyDayTemplate: handleCopyDayTemplate,
                onClose: () => setShowCopyDayModal(false)
            })
        )
    );
}

export default App;
