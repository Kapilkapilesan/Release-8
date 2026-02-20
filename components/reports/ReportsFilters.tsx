'use client';

import React, { useState } from 'react';
import { Filter, X, Plus, Search, Tag } from 'lucide-react';
import { ReportColumn, ReportFilter } from '../../types/report.types';
import { colors } from '@/themes/colors';

interface ReportsFiltersProps {
    columns: ReportColumn[];
    activeFilters: ReportFilter[];
    onAddFilter: (filter: ReportFilter) => void;
    onRemoveFilter: (index: number) => void;
    onClearAllFilters: () => void;
    totalRecords: number;
    filteredRecords: number;
}

export function ReportsFilters({
    columns,
    activeFilters,
    onAddFilter,
    onRemoveFilter,
    onClearAllFilters,
    totalRecords,
    filteredRecords
}: ReportsFiltersProps) {
    const [selectedColumn, setSelectedColumn] = useState('');
    const [filterValue, setFilterValue] = useState('');

    const handleAddFilter = () => {
        if (selectedColumn && filterValue.trim()) {
            onAddFilter({
                column: selectedColumn,
                value: filterValue.trim()
            });
            setSelectedColumn('');
            setFilterValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddFilter();
        }
    };

    const getColumnLabel = (key: string) => {
        const col = columns.find(c => c.key === key);
        return col ? col.label : key;
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                <div className="flex items-center gap-2 min-w-fit">
                    <Filter className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Filters:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Column selector */}
                    <div className="relative group min-w-[180px]">
                        <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border-white border rounded-xl text-[11px] font-black shadow-sm cursor-pointer focus:outline-none focus:ring-4 transition-all uppercase tracking-wider text-gray-700 hover:border-gray-100"
                            style={{
                                // @ts-ignore
                                '--tw-ring-color': `${colors.primary[600]}1a`
                            } as any}
                        >
                            <option value="">Category...</option>
                            {columns.map((col) => (
                                <option key={col.key} value={col.key}>
                                    {col.label}
                                </option>
                            ))}
                        </select>
                        <Tag className="w-3 h-3 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Filter value input */}
                    <div className="relative flex-1 min-w-[240px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                        <input
                            type="text"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={selectedColumn ? `Filter value...` : 'Select category first'}
                            disabled={!selectedColumn}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border-white border rounded-xl text-xs font-bold shadow-sm focus:outline-none focus:ring-4 transition-all disabled:opacity-50 disabled:bg-gray-50/50 disabled:cursor-not-allowed text-gray-700"
                            style={{
                                // @ts-ignore
                                '--tw-ring-color': `${colors.primary[600]}1a`,
                            } as any}
                        />
                        {filterValue && (
                            <button
                                onClick={() => setFilterValue('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Add filter button */}
                    <button
                        onClick={handleAddFilter}
                        disabled={!selectedColumn || !filterValue.trim()}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 border-gray-900 border rounded-xl text-white font-black shadow-md transition-all active:scale-95 text-[10px] uppercase tracking-widest hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Filter</span>
                    </button>
                </div>

                {/* Records count badge */}
                <div className="ml-auto text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Showing <span className="text-gray-900">{filteredRecords}</span> / {totalRecords} Records
                </div>
            </div>

            {/* Active filters display */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                    {activeFilters.map((filter, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm animate-in zoom-in-95 duration-200"
                        >
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none shrink-0">{getColumnLabel(filter.column)}:</span>
                            <span className="text-[11px] font-black text-gray-800">"{filter.value}"</span>
                            <button
                                onClick={() => onRemoveFilter(index)}
                                className="p-0.5 hover:bg-rose-50 rounded text-gray-300 hover:text-rose-500 transition-all ml-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={onClearAllFilters}
                        className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 px-3 py-1.5 transition-colors"
                    >
                        Reset All
                    </button>
                </div>
            )}
        </div>
    );
}
