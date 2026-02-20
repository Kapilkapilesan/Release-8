import React from 'react';
import { DollarSign, UserCheck, Users } from 'lucide-react';
import { SalaryStats } from '@/types/salary.types';
import { colors } from '@/themes/colors';

interface SalaryStatsCardProps {
    stats: SalaryStats;
}

export const SalaryStatsCard: React.FC<SalaryStatsCardProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-2xl border border-primary-500/20 bg-primary-500/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary-500/20">
                        <DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                        2026-01
                    </span>
                </div>
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Total Payroll</h3>
                <p className="text-2xl font-black text-text-primary mt-1">
                    Rs. {stats.totalPayroll.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-tight">{stats.processedCount} salaries processed</p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border-default/50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-muted-bg/50 rounded-xl border border-border-default/50">
                        <DollarSign className="w-6 h-6 text-text-muted" />
                    </div>
                </div>
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Average Salary</h3>
                <p className="text-2xl font-black text-text-primary mt-1">
                    Rs. {stats.averageSalary.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-tight">Per employee this month</p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border-default/50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-success-500/10 border border-success-500/20">
                        <UserCheck className="w-6 h-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div className="p-3 rounded-full bg-success-500/10 border border-success-500/10">
                        <Users className="w-4 h-4 text-success-600 dark:text-success-400" />
                    </div>
                </div>
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Active Headcount</h3>
                <p className="text-2xl font-black text-text-primary mt-1">
                    {stats.activeHeadcount}
                </p>
                <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-tight">{stats.eligibleForPayroll} Eligible for payroll</p>
            </div>
        </div>
    );
};
