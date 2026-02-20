'use client';

import React, { useEffect, useState } from 'react';
import {
    X,
    Building2,
    TrendingUp,
    TrendingDown,
    Calendar,
    UserCheck,
    Users,
    Search,
    Loader2,
    Info
} from 'lucide-react';
import { collectionSummaryService } from '@/services/collectionSummary.service';
import { BranchCollection } from './types';

interface BranchDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchId: string;
    branchName: string;
    date: string;
    viewType: 'daily' | 'weekly' | 'monthly';
}

import { colors } from '@/themes/colors';

export function BranchDetailsModal({
    isOpen,
    onClose,
    branchId,
    branchName,
    date,
    viewType
}: BranchDetailsModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [centerData, setCenterData] = useState<BranchCollection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen && branchId) {
            fetchDetails();
        }
    }, [isOpen, branchId, date, viewType]);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const response = await collectionSummaryService.getBranchDetails(branchId, date, viewType);
            // Map the API backend keys to our frontend interface
            const mappedData = response.data.map((item: any) => ({
                branch: item.center_name, // Mapping center_name to branch label for the component
                branchId: item.center_id.toString(),
                target: item.target,
                collected: item.collected,
                variance: item.variance,
                total_active_customers: item.total_active_customers,
                due_customers: item.due_customers,
                paid_customers: item.paid_customers,
                achievement: item.achievement
            }));
            setCenterData(mappedData);
        } catch (error) {
            console.error('Failed to fetch details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredData = centerData.filter(center =>
        center.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border-default rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-table-header border-b border-border-default p-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${colors.primary[500]}1a`, color: colors.primary[600], border: `1px solid ${colors.primary[600]}30` }}>
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary tracking-tight">{branchName} — Center Breakdown</h3>
                                <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-wider">
                                    Individual performance for all centers • {viewType.toUpperCase()} ({date})
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-muted hover:text-text-primary hover:bg-muted-bg rounded-xl transition-all active:scale-95"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Filters/Search */}
                <div className="px-6 py-4 border-b border-border-divider flex flex-col sm:flex-row gap-4 justify-between items-center bg-card">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary-500" />
                        <input
                            type="text"
                            placeholder="Find center..."
                            className="w-full pl-10 pr-4 py-2 bg-input border border-border-default rounded-xl focus:outline-none focus:ring-2 text-sm text-text-primary transition-all shadow-sm"
                            style={{ '--tw-ring-color': `${colors.primary[500]}25`, borderColor: colors.primary[500] } as any}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 text-primary-500 border border-primary-500/20 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm">
                        <Info className="w-4 h-4" />
                        Showing {filteredData.length} Centers
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-muted-bg/20">
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center justify-center shadow-lg">
                                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                            </div>
                            <p className="text-text-muted animate-pulse font-black uppercase tracking-widest text-xs">Loading center data...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 bg-muted-bg/30 border-2 border-dashed border-border-default rounded-2xl">
                            <div className="w-16 h-16 bg-muted-bg/50 rounded-2xl flex items-center justify-center shadow-inner">
                                <Search className="w-8 h-8 text-text-muted" />
                            </div>
                            <p className="text-text-muted font-black uppercase tracking-widest text-sm">No centers found matching your search</p>
                        </div>
                    ) : (
                        <div className="bg-card border border-border-default rounded-2xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-table-header border-b border-border-default">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Center Name</th>
                                            <th className="text-right px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Expectation</th>
                                            <th className="text-right px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Collected</th>
                                            <th className="text-right px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Balance</th>
                                            <th className="text-center px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Due</th>
                                            <th className="text-center px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Paid</th>
                                            <th className="text-center px-4 py-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-divider">
                                        {filteredData.map((center, index) => {
                                            const isPositive = center.variance >= 0;
                                            return (
                                                <tr key={index} className="hover:bg-table-row-hover transition-colors group">
                                                    <td className="px-6 py-4 text-sm font-black text-text-primary group-hover:text-primary-500 transition-colors uppercase tracking-tight">{center.branch}</td>
                                                    <td className="px-4 py-4 text-sm text-right text-text-primary font-mono font-black">
                                                        {center.target.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-right text-emerald-500 font-mono font-black">
                                                        {center.collected.toLocaleString()}
                                                    </td>
                                                    <td className={`px-4 py-4 text-sm text-right font-black font-mono ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {isPositive ? '+' : ''}{center.variance.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-center text-amber-500 font-black font-mono">
                                                        {center.due_customers}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-center text-indigo-500 font-black font-mono">
                                                        {center.paid_customers}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${center.achievement >= 100 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                                {center.achievement}%
                                                            </span>
                                                            <div className="w-16 h-1.5 bg-muted-bg rounded-full overflow-hidden shadow-inner">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-1000 ${center.achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                                    style={{ width: `${Math.min(center.achievement, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-table-header border-t border-border-default p-6 flex justify-end shadow-inner">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-card border border-border-default text-text-primary rounded-xl text-sm font-black uppercase tracking-widest hover:bg-muted-bg hover:border-text-muted/30 transition-all shadow-lg active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}
