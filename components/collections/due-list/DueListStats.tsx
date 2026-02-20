'use client'

import React from 'react';
import { Calendar, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { colors } from '@/themes/colors';

export interface DueListSummary {
    todayDue: number;
    todayPaymentsCount: number;
    firstOfMonthDue: number;
    firstOfMonthCount: number;
    eighthOfMonthDue: number;
    eighthOfMonthCount: number;
    fifteenthOfMonthDue: number;
    fifteenthOfMonthCount: number;
}

interface DueListStatsProps {
    summary: DueListSummary;
    isLoading?: boolean;
}

export function DueListStats({ summary, isLoading }: DueListStatsProps) {
    const statCards = [
        {
            label: "Today's Due",
            amount: summary.todayDue,
            count: summary.todayPaymentsCount,
            icon: Calendar,
            bgColor: '', // Managed by style
            iconColor: '', // Managed by style
            gradientBg: '', // Managed by style
            isPrimary: true
        },
        {
            label: '1st of Month',
            amount: summary.firstOfMonthDue,
            count: summary.firstOfMonthCount,
            icon: FileText,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            gradientBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        },
        {
            label: '8th of Month',
            amount: summary.eighthOfMonthDue,
            count: summary.eighthOfMonthCount,
            icon: TrendingUp,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            gradientBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
        },
        {
            label: '15th of Month',
            amount: summary.fifteenthOfMonthDue,
            count: summary.fifteenthOfMonthCount,
            icon: DollarSign,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
            gradientBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-xl border border-border-default p-6 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-muted-bg rounded-lg" />
                        </div>
                        <div className="h-4 bg-muted-bg rounded w-24 mb-2" />
                        <div className="h-8 bg-muted-bg rounded w-32 mb-1" />
                        <div className="h-3 bg-muted-bg rounded w-20" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {statCards.map((card, index) => (
                <div
                    key={index}
                    className="bg-card rounded-xl border border-border-default p-6 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden relative"
                >
                    {/* Background decoration */}
                    <div
                        className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-110 ${card.bgColor}`}
                        style={(card as any).isPrimary ? { backgroundColor: colors.primary[100] } : {}}
                    />

                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${card.gradientBg}`}
                                style={(card as any).isPrimary ? { background: `linear-gradient(to bottom right, ${colors.primary[500]}, ${colors.primary[600]})` } : {}}
                            >
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                            {card.label}
                        </p>
                        <p className="text-2xl font-black text-text-primary">
                            LKR {card.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                            {card.count} payment{card.count !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
