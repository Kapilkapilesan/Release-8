'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, UserCheck, Calendar } from 'lucide-react';
import { colors } from '@/themes/colors';
import { SummaryStats } from './types';

interface CollectionStatsProps {
    stats: SummaryStats;
    isLoading?: boolean;
}

export function CollectionStats({ stats, isLoading }: CollectionStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card rounded-2xl p-5 shadow-sm border border-border-default animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-muted-bg rounded-xl" />
                            <div className="h-4 bg-muted-bg rounded w-20" />
                        </div>
                        <div className="h-8 bg-muted-bg rounded w-28" />
                    </div>
                ))}
            </div>
        );
    }

    const isPositiveVariance = stats.totalVariance >= 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Total Expectation */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border-default/50 transition-all hover:shadow-xl group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${colors.primary[500]}1a`, color: colors.primary[600] }}>
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Total Expectation</p>
                        <p className="text-[10px] text-text-muted/60 font-bold whitespace-nowrap">Due + Arrears + Penalties</p>
                    </div>
                </div>
                <p className="text-xl font-black text-text-primary tracking-tight">LKR {stats.totalTarget.toLocaleString()}</p>
            </div>

            {/* Actual Collection */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border-default/50 transition-all hover:shadow-xl group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Actual Collection</p>
                        <p className="text-[10px] text-text-muted/60 font-bold whitespace-nowrap">Cash Received Today</p>
                    </div>
                </div>
                <p className="text-xl font-black text-emerald-500 tracking-tight">LKR {stats.totalCollected.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-muted-bg rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(stats.achievement, 100)}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500">{stats.achievement}%</span>
                </div>
            </div>

            {/* Collection Balance */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border-default/50 transition-all hover:shadow-xl group">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${isPositiveVariance ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        {isPositiveVariance ? (
                            <TrendingUp className="w-6 h-6" />
                        ) : (
                            <TrendingDown className="w-6 h-6" />
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Balance</p>
                        <p className="text-[10px] text-text-muted/60 font-bold whitespace-nowrap">Surplus / Shortfall</p>
                    </div>
                </div>
                <p className={`text-xl font-black tracking-tight ${isPositiveVariance ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPositiveVariance ? '+' : ''}{stats.totalVariance.toLocaleString()}
                </p>
            </div>

            {/* Scheduled Customers */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border-default/50 transition-all hover:shadow-xl group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Due Customers</p>
                        <p className="text-[10px] text-text-muted/60 font-bold whitespace-nowrap">Scheduled Today</p>
                    </div>
                </div>
                <p className="text-xl font-black text-text-primary tracking-tight">{stats.totalDueCustomers.toLocaleString()}</p>
            </div>

            {/* Paid Customers */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border-default/50 transition-all hover:shadow-xl group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Paid Today</p>
                        <p className="text-[10px] text-text-muted/60 font-bold whitespace-nowrap">Payments Made</p>
                    </div>
                </div>
                <p className="text-xl font-black text-text-primary tracking-tight">{stats.totalPaidCustomers.toLocaleString()}</p>
            </div>

            {/* Active Portfolio */}
            <div className="bg-card rounded-2xl p-5 shadow-sm border border-border-default/50 transition-all hover:shadow-xl group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Active Loans</p>
                        <p className="text-[10px] text-text-muted/60 font-bold whitespace-nowrap">Total Portfolio</p>
                    </div>
                </div>
                <p className="text-xl font-black text-text-primary tracking-tight">{stats.totalActiveCustomers.toLocaleString()}</p>
            </div>
        </div>
    );
}
