'use client'

import React from 'react';
import {
    Coins,
    TrendingUp,
    ArrowDownCircle,
    ArrowUpCircle,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { AdminDashboardStats } from '@/types/admin-dashboard.types';

interface AdminStatsCardsProps {
    stats: AdminDashboardStats;
}

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
    const cards = [
        {
            label: "Shareholders Capital",
            value: stats.shareholdersTotalPersistentCapital,
            icon: <ShieldCheck className="w-5 h-5" />,
            color: "blue",
            description: "Equity Investment Total"
        },
        {
            label: "Investment Total",
            value: stats.investmentTotal,
            icon: <Coins className="w-5 h-5" />,
            color: "indigo",
            description: "Portfolio Valuation"
        },
        {
            label: "Total Income",
            value: stats.totalIncome,
            icon: <ArrowUpCircle className="w-5 h-5" />,
            color: "emerald",
            description: "Gross Revenue Collected"
        },
        {
            label: "Total Expense",
            value: stats.totalExpense,
            icon: <ArrowDownCircle className="w-5 h-5" />,
            color: "rose",
            description: "Operating Outflow"
        },
        {
            label: "Net Flow",
            value: stats.netFlow,
            icon: <Activity className="w-5 h-5" />,
            color: "amber",
            description: "Net Profit Margin"
        },
        {
            label: "Fund Truncation",
            value: stats.totalFundTruncation,
            icon: <TrendingUp className="w-5 h-5" />,
            color: "violet",
            description: "Asset Tracking"
        }
    ];

    const getColorClasses = (color: string) => {
        const themes: Record<string, string> = {
            blue: "bg-blue-600 shadow-blue-200 dark:shadow-none",
            indigo: "bg-indigo-600 shadow-indigo-200 dark:shadow-none",
            emerald: "bg-emerald-600 shadow-emerald-200 dark:shadow-none",
            rose: "bg-rose-600 shadow-rose-200 dark:shadow-none",
            amber: "bg-amber-600 shadow-amber-200 dark:shadow-none",
            violet: "bg-violet-600 shadow-violet-200 dark:shadow-none"
        };
        return themes[color] || themes.blue;
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="group relative bg-card rounded-xl p-6 border border-border-default shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                >
                    {/* Background Shine */}
                    <div className="absolute inset-x-0 -top-full bottom-full bg-gradient-to-b from-white/20 to-transparent transition-all duration-700 group-hover:top-0" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className={`p-3 rounded-2xl w-fit mb-5 transition-transform duration-500 group-hover:scale-110 shadow-lg ${getColorClasses(card.color)}`}>
                            <div className="text-white">
                                {card.icon}
                            </div>
                        </div>

                        <div className="mt-auto">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 group-hover:text-text-secondary transition-colors">
                                {card.label}
                            </p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-bold text-text-muted">LKR</span>
                                <h3 className="text-xl font-black text-text-primary tracking-tighter">
                                    {(card.value / 1000000).toFixed(1)}M
                                </h3>
                            </div>
                            <p className="text-[9px] font-bold text-text-muted mt-2 italic flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-border-default" />
                                {card.description}
                            </p>
                        </div>
                    </div>

                    {/* Subtle corner accent */}
                    <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-5 transition-all duration-500 group-hover:scale-150 group-hover:opacity-10 ${getColorClasses(card.color).split(' ')[0]}`} />
                </div>
            ))}
        </div>
    );
}
