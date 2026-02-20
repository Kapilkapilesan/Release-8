'use client'

import React from 'react';
import { Sparkles, Calendar, Zap } from 'lucide-react';
import { colors } from '@/themes/colors';

interface AdminDashboardHeaderProps {
    userName: string;
}

export default function AdminDashboardHeader({ userName }: AdminDashboardHeaderProps) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="relative overflow-hidden bg-card rounded-[2rem] border border-border-default shadow-xl shadow-blue-500/5 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 mb-8">
            {/* Ambient Background Accents */}
            <div
                className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-[0.08]"
                style={{ backgroundColor: colors.primary[500] }}
            />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                {/* Greeting Section */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <div
                            style={{ backgroundColor: colors.primary[600] }}
                            className="px-3 py-1 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-default"
                        >
                            <Sparkles className="w-3 h-3 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Management Console</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500/50" />
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-none">Live Analytics</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">
                        Welcome back, <br className="sm:hidden" />
                        <span
                            className="text-transparent bg-clip-text"
                            style={{ backgroundImage: `linear-gradient(to right, ${colors.primary[600]}, ${colors.primary[400]}, #9333EA)` }}
                        >
                            {userName}
                        </span>
                    </h1>

                    <p className="mt-4 text-sm font-medium text-text-secondary max-w-xl leading-relaxed">
                        Your administrative dashboard is primed and synchronized. Reviewing system-wide financial health, collection efficiencies, and growth trajectories for <span className="font-bold" style={{ color: colors.primary[600] }}>BMS Capital</span>.
                    </p>
                </div>

                {/* Status Widgets */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-4 bg-muted-bg p-5 rounded-3xl border border-border-default transition-all hover:bg-card hover:shadow-xl hover:-translate-y-1">
                        <div className="p-3 bg-card rounded-2xl shadow-sm border border-border-default">
                            <Calendar className="w-6 h-6" style={{ color: colors.primary[600] }} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Current Session</p>
                            <p className="text-sm font-black text-text-primary">{today}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
