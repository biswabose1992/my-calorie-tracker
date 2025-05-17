import React from 'react';
import { BarChartIcon } from '../components/Icons';

type WeeklyAverageModalProps = {
    show: boolean;
    weeklyAverage: number;
    last7Days: string[];
    weeklyCalories: number[];
    onClose: () => void;
};

const WeeklyAverageModal: React.FC<WeeklyAverageModalProps> = ({
    show,
    weeklyAverage,
    last7Days,
    weeklyCalories,
    onClose
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center">
                <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center gap-2">
                    <BarChartIcon className="w-6 h-6" />
                    Weekly Calorie Average
                </h3>
                <div className="text-4xl font-extrabold text-green-600 mb-2">
                    {Math.round(weeklyAverage)} kcal
                </div>
                <div className="w-full mt-2 mb-4">
                    <table className="w-full text-xs text-gray-700">
                        <tbody>
                            {last7Days.map((date, idx) => (
                                <tr key={date}>
                                    <td className="pr-2 py-1 text-left">
                                        {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="pl-2 py-1 font-semibold text-right">
                                        {weeklyCalories[idx]} kcal
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button
                    onClick={onClose}
                    className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default WeeklyAverageModal;