'use client'

import React from 'react';
import { Calendar } from 'lucide-react';
import { colors } from '@/themes/colors';

interface MonthYearPickerProps {
    selectedMonth: number;
    selectedYear: number;
    onChange: (month: number, year: number) => void;
    className?: string;
}

export default function MonthYearPicker({
    selectedMonth,
    selectedYear,
    onChange,
    className = ''
}: MonthYearPickerProps) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

    return (
        <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm ${className}`}>
            <div className="flex items-center gap-2 pl-3 mr-2">
                <Calendar className="w-4 h-4" style={{ color: colors.primary[500] }} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Period Filter</span>
            </div>

            <div className="flex items-center gap-2">
                <select
                    value={selectedMonth}
                    onChange={(e) => onChange(e.target.value === 'all' ? 0 : parseInt(e.target.value), selectedYear)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-700 outline-none transition-all cursor-pointer"
                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary[500]}`}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                >
                    <option value="all">All Months</option>
                    {months.map((month, index) => (
                        <option key={month} value={index + 1}>
                            {month}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedYear}
                    onChange={(e) => onChange(selectedMonth, e.target.value === 'all' ? 0 : parseInt(e.target.value))}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-50 dark:bg-gray-900 border-none text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-gray-700 outline-none transition-all cursor-pointer"
                    onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${colors.primary[500]}`}
                    onBlur={(e) => e.target.style.boxShadow = ''}
                >
                    <option value="all">All Years</option>
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
