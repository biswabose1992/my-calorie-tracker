import React from 'react';

import type { LoggedMeals } from '../types/types';

type CopyDayTemplateModalProps = {
    show: boolean;
    last7Days: string[];
    next7Days: string[];
    loggedMeals: LoggedMeals;
    copySourceDate: string | null;
    setCopySourceDate: (date: string) => void;
    copyTargetDate: string;
    setCopyTargetDate: (date: string) => void;
    getToday: () => string;
    copyDayError: string;
    handleCopyDayTemplate: () => void;
    onClose: () => void;
};

const CopyDayTemplateModal: React.FC<CopyDayTemplateModalProps> = ({
    show,
    last7Days,
    next7Days,
    loggedMeals,
    copySourceDate,
    setCopySourceDate,
    copyTargetDate,
    setCopyTargetDate,
    getToday,
    copyDayError,
    handleCopyDayTemplate,
    onClose,
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center">
                <h3 className="text-lg font-bold text-yellow-700 mb-2 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M8 17l4 4 4-4m-4-5v9" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x={3} y={3} width={18} height={13} rx={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copy Day Template
                </h3>
                <div className="w-full mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select day to copy from:</label>
                    <select
                        value={copySourceDate || ''}
                        onChange={e => setCopySourceDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                    >
                        <option value="" disabled>Select a day</option>
                        {last7Days
                            .filter(date => (loggedMeals[date] && loggedMeals[date].length > 0))
                            .map(date =>
                                <option key={date} value={date}>
                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </option>
                            )}
                    </select>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Copy to:</label>
                    <select
                        value={copyTargetDate}
                        onChange={e => setCopyTargetDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        {next7Days.map(date =>
                            <option key={date} value={date}>
                                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                {date === getToday() ? ' (Today)' : ''}
                            </option>
                        )}
                    </select>
                </div>
                {copyDayError && <div className="text-red-600 text-xs mb-2">{copyDayError}</div>}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={handleCopyDayTemplate}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >Copy</button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CopyDayTemplateModal;