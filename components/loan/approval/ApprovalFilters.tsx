import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { colors } from '@/themes/colors';

interface ApprovalFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onStatusChange: (value: string) => void;
}

export const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
    searchTerm,
    onSearchChange,
    filterStatus,
    onStatusChange
}) => {
    return (
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border-default mb-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-5">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by contract no, customer name, or NIC..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-muted-bg border-2 border-transparent focus:bg-card focus:border-primary-500/30 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-medium text-text-primary placeholder:text-text-muted"
                    />
                </div>

                {/* Status Filter */}
                <div className="md:w-64 relative group/select">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Filter className="w-4 h-4 text-primary-500 transition-colors" />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className={`w-full pl-11 pr-10 py-3 bg-card border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-semibold appearance-none cursor-pointer focus:border-primary-500/30 transition-all ${filterStatus !== 'all' ? 'text-primary-600 dark:text-primary-400 font-bold border-primary-500/20' : 'border-border-divider text-text-secondary'}`}
                    >
                        <option value="all">All Pending</option>
                        <option value="Pending 1st">Pending 1st Approval</option>
                        <option value="Pending 2nd">Pending 2nd Approval</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};
