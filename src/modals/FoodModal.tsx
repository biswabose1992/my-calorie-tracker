import React, { Fragment } from 'react';
import { SearchIcon, LoaderIcon } from '../components/Icons';
import type { MealType } from '../types/types';

type FoodModalProps = {
    show: boolean;
    getModalTitle: () => string;
    modalMessage: { text: string; type: string };
    selectedMealType: string;
    setSelectedMealType: (type: MealType) => void;
    MEAL_TYPES: string[];
    editingMealId: string | null;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    isLoadingSearch: boolean;
    searchResults: {
        name: string;
        unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fibre?: number;
        imageUrl?: string;
    }[];
    handleSelectFoodFromSearch: (food: {
        name: string;
        unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fibre?: number;
        imageUrl?: string;
    }) => void;
    selectedFoodForModal: {
        name: string;
        unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fibre?: number;
        imageUrl?: string;
    } | null;
    showCustomFoodInputs: boolean;
    customFoodName: string;
    setCustomFoodName: (val: string) => void;
    customUnit: string;
    setCustomUnit: (val: string) => void;
    customCalories: string | number;
    setCustomCalories: (val: string) => void;
    customProtein: string | number;
    setCustomProtein: (val: string) => void;
    customCarbs: string | number;
    setCustomCarbs: (val: string) => void;
    customFat: string | number;
    setCustomFat: (val: string) => void;
    customFibre: string | number;
    setCustomFibre: (val: string) => void;
    quantity: string | number;
    setQuantity: (val: string) => void;
    getQuantityLabel: () => string;
    calculatedNutrients: { calories: number; protein: number; carbs: number; fat: number; fibre: number };
    handleSaveFoodEntry: () => void;
    closeModal: () => void;
    MEAL_SUGGESTIONS: Record<string, string[]>;
};

const FoodModal: React.FC<FoodModalProps> = ({
    show,
    getModalTitle,
    modalMessage,
    selectedMealType,
    setSelectedMealType,
    MEAL_TYPES,
    editingMealId,
    searchTerm,
    setSearchTerm,
    searchInputRef,
    isLoadingSearch,
    searchResults,
    handleSelectFoodFromSearch,
    selectedFoodForModal,
    showCustomFoodInputs,
    customFoodName,
    setCustomFoodName,
    customUnit,
    setCustomUnit,
    customCalories,
    setCustomCalories,
    customProtein,
    setCustomProtein,
    customCarbs,
    setCustomCarbs,
    customFat,
    setCustomFat,
    customFibre,
    setCustomFibre,
    quantity,
    setQuantity,
    getQuantityLabel,
    calculatedNutrients,
    handleSaveFoodEntry,
    closeModal,
    MEAL_SUGGESTIONS,
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100 flex flex-col h-full max-h-[90vh]">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 text-center flex-shrink-0">{getModalTitle()}</h2>
                {modalMessage.text && (
                    <div className={`p-3 mb-4 rounded-md text-sm ${modalMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'} flex-shrink-0 transition-colors`}>
                        {modalMessage.text}
                    </div>
                )}
                <div className="overflow-y-auto flex-grow pr-2">
                    <div className="mb-4">
                        <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Meal Type</label>
                        <select
                            id="mealType"
                            value={selectedMealType}
                            onChange={e => setSelectedMealType(e.target.value as MealType)}
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                        >
                            {MEAL_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    {!editingMealId && (
                        <div className="mb-4">
                            <label htmlFor="foodSearch" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Search Food or Enter Custom</label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    id="foodSearch"
                                    placeholder="Type to search or add custom..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    ref={searchInputRef}
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors">
                                    <SearchIcon />
                                </div>
                            </div>
                        </div>
                    )}
                    {!editingMealId && (
                        <div className="mb-4">
                            {isLoadingSearch && (
                                <div className="flex justify-center items-center p-4">
                                    <LoaderIcon className="text-green-500 w-8 h-8 animate-spin" />
                                    <span className="ml-2 text-gray-600 text-sm transition-colors">Searching...</span>
                                </div>
                            )}
                            {!isLoadingSearch && searchResults.length === 0 && searchTerm.trim() && (
                                <p className="text-gray-500 p-2 text-center text-sm transition-colors">
                                    No food items found for "{searchTerm}". Enter details below to add a custom item.
                                </p>
                            )}
                            {!isLoadingSearch && !searchTerm.trim() && !editingMealId && (
                                <Fragment>
                                    <p className="text-gray-500 p-2 text-center text-sm transition-colors">
                                        Suggested for {selectedMealType}:
                                    </p>
                                    <ul className="flex flex-wrap gap-2 justify-center mt-2">
                                        {(MEAL_SUGGESTIONS[selectedMealType] || []).map(suggestion => (
                                            <li key={suggestion}>
                                                <button
                                                    type="button"
                                                    className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-full text-xs font-medium transition-colors"
                                                    onClick={() => setSearchTerm(suggestion)}
                                                >
                                                    {suggestion}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </Fragment>
                            )}
                            {!isLoadingSearch && searchResults.length > 0 && (
                                <ul className="space-y-1 border border-gray-200 rounded-md p-1 bg-gray-50 transition-colors">
                                    {searchResults.map(food => (
                                        <li
                                            key={food.name}
                                            onClick={() => handleSelectFoodFromSearch(food)}
                                            className={`p-2 hover:bg-green-100 rounded cursor-pointer ${selectedFoodForModal && selectedFoodForModal.name === food.name ? 'bg-green-200 ring-2 ring-green-500' : ''} transition-colors`}
                                        >
                                            <div className="flex items-center">
                                                {food.imageUrl && (
                                                    <img
                                                        src={food.imageUrl}
                                                        alt={food.name}
                                                        className="w-8 h-8 rounded-md object-cover mr-3 flex-shrink-0"
                                                        onError={e => (e.currentTarget.src = 'https://placehold.co/40x40/cccccc/333333?text=🍽️')}
                                                    />
                                                )}
                                                <div className="flex-grow">
                                                    <strong className="text-sm md:text-base text-gray-800 transition-colors">{food.name}</strong>
                                                    <span className="text-xs block text-gray-600 transition-colors">
                                                        (per {food.unit}) - {food.calories} kcal, P:{food.protein}g, C:{food.carbs}g, F:{food.fat}g, Fibre:{food.fibre || 0}g
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {!editingMealId && selectedFoodForModal && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center flex-shrink-0 transition-colors">
                            {selectedFoodForModal.imageUrl && (
                                <img
                                    src={selectedFoodForModal.imageUrl}
                                    alt={selectedFoodForModal.name}
                                    className="w-10 h-10 rounded-md object-cover mr-3 flex-shrink-0"
                                    onError={e => (e.currentTarget.src = 'https://placehold.co/40x40/cccccc/333333?text=🍽️')}
                                />
                            )}
                            <div className="flex-grow">
                                <h4 className="font-semibold text-green-700 mb-1 text-sm md:text-base transition-colors">
                                    Selected: {selectedFoodForModal.name}
                                </h4>
                                <p className="text-xs text-gray-600 transition-colors">
                                    Per {selectedFoodForModal.unit}: {selectedFoodForModal.calories} kcal, P:{selectedFoodForModal.protein}g, C:{selectedFoodForModal.carbs}g, F:{selectedFoodForModal.fat}g, Fibre:{selectedFoodForModal.fibre || 0}g
                                </p>
                            </div>
                        </div>
                    )}
                    {showCustomFoodInputs && (
                        <Fragment>
                            {!editingMealId && (
                                <p className="text-gray-600 text-sm mb-3 flex-shrink-0 transition-colors">
                                    Enter custom food details:
                                </p>
                            )}
                            <div className="mb-4 flex-shrink-0">
                                <label htmlFor="customFoodName" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Food Name</label>
                                <input
                                    type="text"
                                    id="customFoodName"
                                    placeholder="e.g., Homemade Lasagna"
                                    value={customFoodName}
                                    onChange={e => setCustomFoodName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 flex-shrink-0">
                                <div>
                                    <label htmlFor="customUnit" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Unit</label>
                                    <input
                                        type="text"
                                        id="customUnit"
                                        placeholder="e.g., g, piece, cup"
                                        value={customUnit}
                                        onChange={e => setCustomUnit(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="customCalories" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Calories (per unit)</label>
                                    <input
                                        type="number"
                                        id="customCalories"
                                        placeholder="e.g., 250"
                                        value={customCalories}
                                        onChange={e => setCustomCalories(e.target.value)}
                                        min="0"
                                        step="0.1"
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 flex-shrink-0">
                                <div>
                                    <label htmlFor="customProtein" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Protein (g per unit)</label>
                                    <input
                                        type="number"
                                        id="customProtein"
                                        placeholder="e.g., 20"
                                        value={customProtein}
                                        onChange={e => setCustomProtein(e.target.value)}
                                        min="0"
                                        step="0.1"
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="customCarbs" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Carbs (g per unit)</label>
                                    <input
                                        type="number"
                                        id="customCarbs"
                                        placeholder="e.g., 30"
                                        value={customCarbs}
                                        onChange={e => setCustomCarbs(e.target.value)}
                                        min="0"
                                        step="0.1"
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="customFat" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Fat (g per unit)</label>
                                    <input
                                        type="number"
                                        id="customFat"
                                        placeholder="e.g., 15"
                                        value={customFat}
                                        onChange={e => setCustomFat(e.target.value)}
                                        min="0"
                                        step="0.1"
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="customFibre" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">Fibre (g per unit)</label>
                                    <input
                                        type="number"
                                        id="customFibre"
                                        placeholder="e.g., 5"
                                        value={customFibre}
                                        onChange={e => setCustomFibre(e.target.value)}
                                        min="0"
                                        step="0.1"
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                                    />
                                </div>
                            </div>
                        </Fragment>
                    )}
                    <div className="mb-4">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1 transition-colors">{getQuantityLabel()}</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            min="0.1"
                            step="0.1"
                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                        />
                        <div className="mt-2 text-xs text-gray-600 transition-colors">
                            Calories: {calculatedNutrients.calories} kcal | Protein: {calculatedNutrients.protein}g | Carbs: {calculatedNutrients.carbs}g | Fat: {calculatedNutrients.fat}g | Fibre: {calculatedNutrients.fibre}g
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 flex-shrink-0">
                    <button
                        onClick={handleSaveFoodEntry}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        {editingMealId ? 'Save Changes' : 'Add Food'}
                    </button>
                    <button
                        onClick={closeModal}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodModal;