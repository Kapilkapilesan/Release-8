'use client';

import React from 'react';
import { ReportRow, ReportColumn } from '../../types/report.types';
import BMSLoader from '@/components/common/BMSLoader';
import { colors } from '@/themes/colors';
import { Database, LayoutGrid } from 'lucide-react';

interface ReportsTableProps {
    data: ReportRow[];
    columns: ReportColumn[];
    selectedRows: Set<string>;
    onSelectRow: (id: string) => void;
    onSelectAll: () => void;
    isLoading: boolean;
}

export function ReportsTable({
    data,
    columns,
    selectedRows,
    onSelectRow,
    onSelectAll,
    isLoading
}: ReportsTableProps) {
    const allSelected = data.length > 0 && data.every(row => selectedRows.has(row.id));
    const someSelected = data.some(row => selectedRows.has(row.id)) && !allSelected;

    const formatValue = (value: any, key: string): string => {
        if (value === null || value === undefined) return '-';

        // Format currency values
        if (['loan_amount', 'rental', 'bank_transfer_amount', 'full_balance', 'arrears', 'payment_balance', 'last_payment_amount', 'monthly_collect_amount', 'total_collect_amount'].includes(key)) {
            return typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 0 }) : value;
        }

        return String(value);
    };

    if (isLoading) {
        return (
            <div className="bg-white py-32 flex flex-col items-center justify-center text-center">
                <BMSLoader message="Compiling Dataset..." size="small" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white py-32 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 animate-pulse">
                    <Database className="w-10 h-10 text-gray-200" />
                </div>
                <div className="space-y-1">
                    <p className="font-black text-gray-900 tracking-widest uppercase text-xs">No Results</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-50">Adjust filters to see data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-max border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-50/50">
                            {/* Checkbox column */}
                            <th className="sticky left-0 z-30 bg-gray-50/80 backdrop-blur-md px-4 py-3 text-left border-b border-gray-100">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={input => {
                                            if (input) {
                                                input.indeterminate = someSelected;
                                            }
                                        }}
                                        onChange={onSelectAll}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded cursor-pointer transition-all focus:ring-4 focus:ring-primary-500/10"
                                        style={{ accentColor: colors.primary[600] }}
                                    />
                                </div>
                            </th>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left border-b border-gray-100 bg-gray-50/50"
                                    style={{ minWidth: col.width || 120 }}
                                >
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        {col.label}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row) => {
                            const isSelected = selectedRows.has(row.id);
                            return (
                                <tr
                                    key={row.id}
                                    className={`group transition-all duration-200 hover:bg-gray-50/50 ${isSelected ? 'bg-primary-50/20' : ''}`}
                                    style={isSelected ? { backgroundColor: `${colors.primary[50]}30` } : {}}
                                >
                                    {/* Checkbox column */}
                                    <td className={`sticky left-0 z-20 px-4 py-2.5 transition-colors border-b border-gray-50 ${isSelected ? 'bg-white' : 'bg-white group-hover:bg-gray-50/50'}`}>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onSelectRow(row.id)}
                                                className="w-4 h-4 text-primary-600 border-gray-300 rounded cursor-pointer transition-all focus:ring-4 focus:ring-primary-500/10"
                                                style={{ accentColor: colors.primary[600] }}
                                            />
                                        </div>
                                    </td>
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-4 py-2.5 border-b border-gray-50"
                                        >
                                            <span className={`text-[12px] font-bold tracking-tight whitespace-nowrap ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                                                {formatValue((row as any)[col.key], col.key)}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50/30 flex items-center justify-between border-t border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-gray-100">
                        <LayoutGrid className="w-3 h-3 text-indigo-500" />
                        <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">
                            {selectedRows.size > 0
                                ? `${selectedRows.size} Selected`
                                : `${data.length} Total Records`
                            }
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
