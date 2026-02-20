'use client'
import React from 'react';
import { Building2, TrendingUp, Users } from 'lucide-react';
import { BranchStats as BranchStatsType } from '../../types/branch.types';
import { colors } from '../../themes/colors';

interface BranchStatsProps {
    stats: BranchStatsType;
}

export function BranchStats({ stats }: BranchStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Branches */}
            <div className="bg-card rounded-[2rem] border border-border-default/50 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors" />
                <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-xl group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-60">Total Branches</p>
                <p className="text-4xl font-black text-text-primary tracking-tight">{stats.totalBranches}</p>
            </div>

            {/* Active Branches */}
            <div className="bg-card rounded-[2rem] border border-border-default/50 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-xl group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="text-[10px] font-black text-emerald-600 tracking-widest">
                            {stats.totalBranches > 0 ? ((stats.activeBranches / stats.totalBranches) * 100).toFixed(0) : 0}%
                        </span>
                    </div>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-60">Active Branches</p>
                <p className="text-4xl font-black text-text-primary tracking-tight">{stats.activeBranches}</p>
            </div>

            {/* Total Customers */}
            <div className="bg-card rounded-[2rem] border border-border-default/50 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
                <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500 shadow-xl group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-60">Total Customers</p>
                <p className="text-4xl font-black text-text-primary tracking-tight">{stats.totalCustomers}</p>
            </div>

            {/* Total Loans */}
            <div className="bg-card rounded-[2rem] border border-border-default/50 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
                <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-xl group-hover:scale-110 transition-transform">
                        <Building2 className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-60">Total Loans</p>
                <p className="text-4xl font-black text-text-primary tracking-tight">{stats.totalLoans}</p>
            </div>
        </div>
    );
}
