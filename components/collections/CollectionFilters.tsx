
import React from 'react';
import { colors } from '@/themes/colors';

interface BranchOption {
    id: number;
    branch_name: string;
}

interface CenterOption {
    id: number;
    center_name: string;
}

interface CollectionFiltersProps {
    branches: BranchOption[];
    centers: CenterOption[];
    selectedBranch: string;
    selectedCenter: string;
    onBranchChange: (branchId: string) => void;
    onCenterChange: (centerId: string) => void;
    selectedDate: string;
    onDateChange: (date: string) => void;
}

export function CollectionFilters({
    branches,
    centers,
    selectedBranch,
    selectedCenter,
    onBranchChange,
    onCenterChange,
    selectedDate,
    onDateChange
}: CollectionFiltersProps) {
    return (
        <div className="bg-card rounded-xl p-6 border border-border-default shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Select Branch *</label>
                    <select
                        value={selectedBranch}
                        onChange={(e) => onBranchChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-border-default rounded-xl focus:outline-none focus:ring-2 bg-input text-text-primary text-sm shadow-sm transition-all"
                        style={{ '--tw-ring-color': `${colors.primary[500]}25`, borderColor: colors.primary[500] } as any}
                    >
                        <option value="">Choose a branch</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Select Center</label>
                    <select
                        value={selectedCenter}
                        onChange={(e) => onCenterChange(e.target.value)}
                        disabled={!selectedBranch || centers.length === 0}
                        className="w-full px-4 py-2.5 border border-border-default rounded-xl focus:outline-none focus:ring-2 bg-input text-text-primary text-sm shadow-sm transition-all disabled:opacity-50 disabled:bg-muted-bg disabled:cursor-not-allowed"
                        style={{ '--tw-ring-color': `${colors.primary[500]}25`, borderColor: colors.primary[500] } as any}
                    >
                        <option value="">All Centers</option>
                        {centers.map((center) => (
                            <option key={center.id} value={center.id}>{center.center_name}</option>
                        ))}
                    </select>
                </div>
                {/* <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Collection Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-border-default rounded-xl focus:outline-none focus:ring-2 bg-input text-text-primary text-sm shadow-sm transition-all"
                        style={{ '--tw-ring-color': `${colors.primary[500]}25`, borderColor: colors.primary[500] } as any}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Time Window</label>
                    <input
                        type="time"
                        defaultValue="10:00"
                        className="w-full px-4 py-2.5 border border-border-default rounded-xl focus:outline-none focus:ring-2 bg-input text-text-primary text-sm shadow-sm transition-all"
                        style={{ '--tw-ring-color': `${colors.primary[500]}25`, borderColor: colors.primary[500] } as any}
                    />
                </div> */}
            </div>
        </div>
    );
}
