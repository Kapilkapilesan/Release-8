import React from 'react';
import { Users, UserCheck, Shield } from 'lucide-react';
import { colors } from '@/themes/colors';
import { StaffStats } from '../../types/staff.types';

interface StaffStatsProps {
    stats: StaffStats;
}

export function StaffStatsCard({ stats }: StaffStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border-default p-6 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary-500/10 text-primary-500 group-hover:scale-110 transition-transform"
                    >
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Total Users</p>
                <p className="text-3xl font-black text-text-primary tracking-tight">{stats.totalUsers}</p>
            </div>

            <div className="bg-card rounded-xl border border-border-default p-6 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-success-500/10 text-success-500 group-hover:scale-110 transition-transform"
                    >
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-success-600 bg-success-500/10 px-2 py-1 rounded-lg">
                        {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(0) : 0}% Active
                    </span>
                </div>
                <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Active Users</p>
                <p className="text-3xl font-black text-text-primary tracking-tight">{stats.activeUsers}</p>
            </div>

            <div className="bg-card rounded-xl border border-border-default p-6 hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-500 group-hover:scale-110 transition-transform"
                    >
                        <Shield className="w-6 h-6" />
                    </div>
                </div>
                <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">User Roles</p>
                <p className="text-3xl font-black text-text-primary tracking-tight">{stats.totalRoles}</p>
            </div>
        </div>
    );
}
