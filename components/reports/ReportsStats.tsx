'use client';

import React from 'react';
import { FileText, Download, BarChart3, Calendar } from 'lucide-react';
import { ReportStats } from '../../types/report.types';
import { colors } from '@/themes/colors';

interface ReportsStatsProps {
    stats: ReportStats | null;
    isLoading: boolean;
}

export function ReportsStats({ stats, isLoading }: ReportsStatsProps) {
    const statCards = [
        {
            label: 'Total Reports',
            value: stats?.total_reports ?? 0,
            icon: FileText,
            color: colors.primary[600],
            bgColor: colors.primary[50],
            shadow: colors.primary[600]
        },
        {
            label: 'Downloads Month',
            value: stats?.downloads_this_month ?? 0,
            icon: Download,
            color: colors.success[600],
            bgColor: colors.success[50],
            shadow: colors.success[600]
        },
        {
            label: 'Scheduled Tasks',
            value: stats?.scheduled_reports ?? 0,
            icon: BarChart3,
            color: colors.indigo[600],
            bgColor: colors.indigo[50],
            shadow: colors.indigo[600]
        },
        {
            label: 'Last Generated',
            value: stats?.last_generated ?? 'Never',
            icon: Calendar,
            color: colors.warning[600],
            bgColor: colors.warning[50],
            shadow: colors.warning[600],
            isText: true
        }
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white/80 rounded-2xl p-5 shadow-lg shadow-gray-200/40 border border-white animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                            <div className="flex-1">
                                <div className="h-2.5 bg-gray-100 rounded w-16 mb-2"></div>
                                <div className="h-6 bg-gray-200 rounded w-12"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="group bg-white/80 backdrop-blur-md p-5 rounded-[1.5rem] border border-white shadow-lg shadow-gray-200/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 shadow-sm"
                                style={{
                                    backgroundColor: card.bgColor,
                                }}
                            >
                                <Icon className="w-6 h-6" style={{ color: card.color }} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 opacity-60">{card.label}</p>
                                <p className={`font-black text-gray-900 tracking-tight ${card.isText ? 'text-sm' : 'text-2xl'}`}>
                                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
