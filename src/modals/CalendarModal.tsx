import React from 'react';

type CalendarModalProps = {
    show: boolean;
    daysOfWeek: string[];
    getCalendarDays: () => { date: string, display: string, isCurrent: boolean }[];
    handleDateSelect: (date: string) => void;
    onClose: () => void;
};

const CalendarModal: React.FC<CalendarModalProps> = ({
    show, daysOfWeek, getCalendarDays, handleDateSelect, onClose
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-sm transform transition-all duration-300 ease-out scale-100">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 text-center">Select Date</h3>
                <div className="grid grid-cols-7 gap-1 text-center text-xs md:text-sm mb-4">
                    {daysOfWeek.map(day => (
                        <div key={day} className="font-medium text-gray-600">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm md:text-base">
                    {getCalendarDays().map(({ date, display, isCurrent }) => (
                        <button
                            key={date}
                            onClick={() => handleDateSelect(date)}
                            disabled={new Date(date) > new Date()}
                            className={`p-2 rounded-full transition-colors w-full aspect-square flex items-center justify-center
                                ${isCurrent ? 'bg-green-600 text-white font-bold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                ${new Date(date) > new Date() ? 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed' : ''}
                                focus:outline-none focus:ring-2 focus:ring-green-400`}
                        >
                            {display}
                        </button>
                    ))}
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;