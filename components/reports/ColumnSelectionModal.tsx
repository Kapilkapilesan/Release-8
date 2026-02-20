'use client';

import React from 'react';
import { X, Check, Download, Layers } from 'lucide-react';
import { ReportColumn } from '../../types/report.types';
import { colors } from '@/themes/colors';

interface ColumnSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    columns: ReportColumn[];
    selectedColumns: Set<string>;
    onToggleColumn: (key: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onExport: () => void;
    isExporting: boolean;
}

export function ColumnSelectionModal({
    isOpen,
    onClose,
    columns,
    selectedColumns,
    onToggleColumn,
    onSelectAll,
    onDeselectAll,
    onExport,
    isExporting
}: ColumnSelectionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
                {/* Header Section */}
                <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transform rotate-3"
                                style={{
                                    background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                                }}
                            >
                                <Layers className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Export Schema</h2>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">Select dimensions for extraction</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white hover:bg-gray-100 border border-gray-100 text-gray-400 hover:text-gray-900 rounded-xl transition-all active:scale-90"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick Selection Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onSelectAll}
                                className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                                Select All
                            </button>
                            <button
                                onClick={onDeselectAll}
                                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                {selectedColumns.size} Points Selected
                            </span>
                        </div>
                    </div>
                </div>

                {/* Column Grid */}
                <div className="p-6 overflow-y-auto max-h-[50vh] custom-scrollbar bg-white/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {columns.map((col) => {
                            const isSelected = selectedColumns.has(col.key);
                            return (
                                <button
                                    key={col.key}
                                    onClick={() => onToggleColumn(col.key)}
                                    className={`group flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${isSelected
                                        ? 'shadow-sm'
                                        : 'bg-white border-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-50/50'
                                        }`}
                                    style={isSelected ? { borderColor: colors.primary[400], backgroundColor: `${colors.primary[50]}80` } : {}}
                                >
                                    <span className={`text-[11px] font-black tracking-tight ${isSelected ? 'text-primary-700' : 'text-gray-500 group-hover:text-gray-900'}`}>{col.label}</span>
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isSelected
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-50 border border-gray-100'
                                        }`}
                                        style={isSelected ? { backgroundColor: colors.primary[600] } : {}}
                                    >
                                        {isSelected && <Check className="w-3 h-3 font-black" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur-md flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onExport}
                        disabled={selectedColumns.size === 0 || isExporting}
                        className="group relative flex items-center gap-2 px-8 py-3.5 rounded-xl transition-all duration-300 active:scale-95 overflow-hidden shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            background: `linear-gradient(135deg, ${colors.success[600]}, ${colors.success[700]})`,
                            boxShadow: `0 10px 20px -5px ${colors.success[600]}40`
                        }}
                    >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        {isExporting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 text-white transition-transform group-hover:-translate-y-0.5" />
                        )}
                        <span className="text-white font-black tracking-tight text-[11px] uppercase">
                            {isExporting ? 'Exporting...' : `Export Dataset`}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
