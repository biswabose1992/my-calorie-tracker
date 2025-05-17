import React from 'react';
import type { RefObject } from 'react';
import { WeightIcon } from '../components/Icons';

type WeightData = { date: string; weight: number | null };

type WeightModalProps = {
    show: boolean;
    weightDate: string;
    setWeightDate: (date: string) => void;
    weightInput: string;
    setWeightInput: (val: string) => void;
    weightError: string;
    handleLogWeight: () => void;
    onClose: () => void;
    weightData: WeightData[];
    minWeight: number;
    maxWeight: number;
    weightGraphContainerRef: RefObject<HTMLDivElement | null>;
};

const WeightModal: React.FC<WeightModalProps> = ({
    show,
    weightDate,
    setWeightDate,
    weightInput,
    setWeightInput,
    weightError,
    handleLogWeight,
    onClose,
    weightData,
    minWeight,
    maxWeight,
    weightGraphContainerRef
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md flex flex-col items-center">
                <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                    <WeightIcon className="w-6 h-6" />
                    Log Weight & View Trend
                </h3>
                <div className="w-full mb-4">
                    <label htmlFor="weightDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date:
                    </label>
                    <input
                        type="date"
                        id="weightDate"
                        value={weightDate}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={e => setWeightDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                    />
                </div>
                <input
                    type="number"
                    value={weightInput}
                    onChange={e => setWeightInput(e.target.value)}
                    placeholder="Enter weight (kg)"
                    min="0"
                    step="0.1"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base mb-2"
                />
                {weightError && (
                    <div className="text-red-600 text-xs mb-2">{weightError}</div>
                )}
                <div className="flex gap-2 mt-2 mb-6 justify-center">
                    <button
                        onClick={handleLogWeight}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                    >
                        Save Weight
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                    >
                        Close
                    </button>
                </div>
                <div className="w-full bg-purple-100 p-4 rounded-lg shadow-inner overflow-x-auto" ref={weightGraphContainerRef}>
                    <h4 className="text-base font-semibold text-purple-800 mb-4 text-center">
                        Weight Trend (Last 14 Days)
                    </h4>
                    <div className="w-full h-48 md:h-56 flex items-end relative">
                        <svg
                            width="700"
                            height="150"
                            viewBox="0 0 700 150"
                            preserveAspectRatio="none"
                            className="h-full absolute inset-0"
                        >
                            {/* Y-axis grid lines and labels */}
                            {Array.from({ length: 4 }).map((_, i, arr) => {
                                const weightValue = minWeight + (i / (arr.length - 1)) * (maxWeight - minWeight);
                                const yPosition = 10 + (100 * (1 - (weightValue - minWeight) / ((maxWeight - minWeight) || 1)));
                                return (
                                    <React.Fragment key={`y-axis-${i}`}>
                                        <line
                                            x1={30}
                                            x2={670}
                                            y1={yPosition}
                                            y2={yPosition}
                                            stroke="#dadae0"
                                            strokeWidth={0.5}
                                        />
                                        <text
                                            x={25}
                                            y={yPosition + 3}
                                            fontSize={8}
                                            fill="#64748b"
                                            textAnchor="end"
                                        >
                                            {weightValue.toFixed(1)}
                                        </text>
                                    </React.Fragment>
                                );
                            })}
                            {/* X-axis labels (days) */}
                            {weightData.map((d, i) => {
                                const xPosition = 30 + (i * (640 / (weightData.length - 1 || 1)));
                                return (
                                    <text
                                        key={d.date}
                                        x={xPosition}
                                        y={145}
                                        fontSize={10}
                                        fill="#4b5563"
                                        textAnchor="middle"
                                    >
                                        {new Date(d.date + 'T00:00:00').getDate()}
                                    </text>
                                );
                            })}
                            {/* Weight line */}
                            <polyline
                                fill="none"
                                stroke="#6d28d9"
                                strokeWidth={2.5}
                                points={weightData.map((d, i) => {
                                    if (d.weight === null) return '';
                                    const x = 30 + (i * (640 / (weightData.length - 1 || 1)));
                                    const y = 10 + (100 * (1 - ((d.weight - minWeight) / ((maxWeight - minWeight) || 1))));
                                    return `${x},${y}`;
                                }).filter(Boolean).join(' ')}
                            />
                            {/* Data points (circles) */}
                            {weightData.map((d, i) =>
                                d.weight !== null && (
                                    <circle
                                        key={d.date}
                                        cx={30 + (i * (640 / (weightData.length - 1 || 1)))}
                                        cy={10 + (100 * (1 - ((d.weight - minWeight) / ((maxWeight - minWeight) || 1))))}
                                        r={4}
                                        fill="#8b5cf6"
                                        stroke="#ffffff"
                                        strokeWidth={1.5}
                                    />
                                )
                            )}
                        </svg>
                    </div>
                    <div className="text-xs text-gray-500 mt-4 text-center">
                        Tip: Log your weight daily to see your trend. Only the last 14 days are shown.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeightModal;