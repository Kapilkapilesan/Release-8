'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Search, Clock, CheckCircle, Users, LayoutDashboard, Database, Activity, Target } from 'lucide-react';
import { BranchPerformanceData, DateFilter, AttendanceFilter } from '@/types/dashboard.types';
import PendingRequestsTab from './tabs/PendingRequestsTab';
import ApprovalRequestsTab from '@/components/dashboard/tabs/ApprovalRequestsTab';
import StaffTab from '@/components/dashboard/tabs/StaffTab';
import StaffCollectionEfficiencyGauge from './charts/StaffCollectionEfficiencyGauge';
import { dashboardService } from '@/services/dashboard.service';
import { StaffCollectionEfficiency } from '@/types/dashboard.types';
import { authService } from '@/services/auth.service';
import BMSLoader from '@/components/common/BMSLoader';
import { colors } from '@/themes/colors';

interface BranchPerformanceViewProps {
    branchData: BranchPerformanceData;
    onBack: () => void;
    onRefresh: (filterType: DateFilter, date?: string, startDate?: string, endDate?: string) => void;
    hideBack?: boolean;
    hideHeader?: boolean;
}

type TabType = 'pending' | 'approved' | 'staff';

export default function BranchPerformanceView({
    branchData,
    onBack,
    onRefresh,
    hideBack = false,
    hideHeader = false
}: BranchPerformanceViewProps) {
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [dateFilter, setDateFilter] = useState<DateFilter>('day');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('all');
    const [efficiency, setEfficiency] = useState<StaffCollectionEfficiency | null>(null);
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [isLoadingEfficiency, setIsLoadingEfficiency] = useState(false);

    const isAdmin = authService.hasPermission('dashboard.view_all') || authService.hasPermission('admin_dashboard.view') || authService.hasPermission('data.view_all');
    const isManager = authService.hasPermission('dashboard.view') && !isAdmin;
    const isFieldOfficer = !isAdmin && !isManager;

    useEffect(() => {
        if (!isAdmin) {
            loadEfficiency();
        }
    }, [selectedStaffId]);

    const loadEfficiency = async () => {
        setIsLoadingEfficiency(true);
        try {
            const data = await dashboardService.getStaffCollectionEfficiency(selectedStaffId || undefined);
            setEfficiency(data);
        } catch (error) {
            console.error('Error loading staff efficiency:', error);
        } finally {
            setIsLoadingEfficiency(false);
        }
    };

    const staffList = branchData.staff_attendance.map(s => ({
        staff_id: s.staff_id,
        full_name: s.staff_name
    }));

    const handleDateFilterChange = (filter: DateFilter) => {
        setDateFilter(filter);
        let newDate = selectedDate;
        if (filter === 'day') {
            if (newDate.length === 4) newDate = `${newDate}-01-01`;
            else if (newDate.length === 7) newDate = `${newDate}-01`;
            setSelectedDate(newDate);
            onRefresh(filter, newDate);
        } else if (filter === 'month') {
            newDate = selectedDate.substring(0, 7);
            setSelectedDate(newDate);
            onRefresh(filter, newDate);
        } else if (filter === 'year') {
            newDate = selectedDate.substring(0, 4);
            setSelectedDate(newDate);
            onRefresh(filter, newDate);
        }
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        if (dateFilter === 'day') {
            onRefresh(dateFilter, date);
        } else if (dateFilter === 'month') {
            onRefresh(dateFilter, date.substring(0, 7));
        } else if (dateFilter === 'year') {
            onRefresh(dateFilter, date.substring(0, 4));
        }
    };

    const tabs = [
        { id: 'pending' as TabType, label: 'Pending Queue', icon: Clock, count: (branchData.pending_loan_requests?.length || 0) + (branchData.pending_center_requests?.length || 0) },
        { id: 'approved' as TabType, label: 'Approved Logs', icon: CheckCircle, count: (branchData.approved_loan_requests?.length || 0) },
        { id: 'staff' as TabType, label: (isFieldOfficer || !authService.hasPermission('staff.view')) ? 'Attendance' : 'Staff Registry', icon: Users, count: branchData.staff_attendance?.length || 0 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Premium Sub-Header */}
            {!hideHeader && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-border-default relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full" style={{ background: `linear-gradient(to bottom, ${colors.primary[500]}, ${colors.primary[700]})` }} />

                    <div className="flex items-center gap-5 relative z-10">
                        {!hideBack && (
                            <button
                                onClick={onBack}
                                className="w-11 h-11 flex items-center justify-center bg-input hover:bg-hover rounded-2xl border border-border-default shadow-sm transition-all duration-300 hover:shadow-md active:scale-95 group/back"
                            >
                                <ArrowLeft className="w-5 h-5 text-text-muted group-hover/back:text-primary-600 transition-colors" />
                            </button>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${colors.indigo[500]}, ${colors.indigo[600]})` }}>
                                <Database className="w-6 h-6" strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-primary tracking-tight uppercase leading-none">
                                    {branchData.branch_name}
                                </h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <Activity className="w-3 h-3 text-primary-500" />
                                        Performance Hub
                                    </span>
                                    <div className="w-1 h-3 rounded-full bg-border-divider" />
                                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{branchData.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 relative z-10">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em] mb-1">Assigned Management</p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-input/50 rounded-xl border border-border-default">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-text-primary uppercase tracking-tight">{branchData.manager_name}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Efficiency Layer */}
            {!isAdmin && (
                <div className="transition-all duration-700">
                    {isLoadingEfficiency ? (
                        <div className="bg-card rounded-[2.5rem] border border-border-default p-16 text-center shadow-xl min-h-[400px] flex items-center justify-center">
                            <BMSLoader message="Calculating Collection Efficiency..." size="small" />
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-8 duration-1000">
                            <StaffCollectionEfficiencyGauge
                                efficiency={efficiency}
                                staffList={staffList}
                                selectedStaffId={selectedStaffId}
                                onStaffChange={setSelectedStaffId}
                                isManager={isManager}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* High-Impact Filter Bar */}
            <div className="bg-card/90 backdrop-blur-xl rounded-[2.5rem] border border-border-default p-4 shadow-xl relative z-10">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-input/50 p-1.5 rounded-2xl border border-input backdrop-blur-sm">
                        {['day', 'month', 'year'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => handleDateFilterChange(filter as DateFilter)}
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${dateFilter === filter
                                    ? 'bg-card text-primary-600 shadow-lg scale-105'
                                    : 'text-text-muted hover:text-text-secondary'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type={dateFilter === 'day' ? 'date' : dateFilter === 'month' ? 'month' : 'number'}
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="pl-12 pr-6 py-3.5 bg-input border border-border-default rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none ring-4 ring-primary-500/0 focus:ring-primary-500/5 focus:border-primary-500/50 transition-all w-52 text-text-primary"
                        />
                    </div>

                    <div className="flex-1 min-w-[300px] relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search branch entity, staff, or request logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 bg-input border border-border-default rounded-2xl text-[11px] font-bold text-text-primary placeholder:text-text-muted outline-none ring-4 ring-primary-500/0 focus:ring-primary-500/5 focus:border-primary-500/50 shadow-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Registry Tabs Area */}
            <div className="bg-card rounded-[2.5rem] border border-border-default shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="flex items-center bg-input/30 px-6 pt-6 gap-2 border-b border-border-divider">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 pb-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${activeTab === tab.id
                                ? 'text-primary-600'
                                : 'text-text-muted hover:text-text-secondary'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-primary-500' : 'text-text-muted'}`} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`min-w-[18px] h-4.5 px-1.5 flex items-center justify-center rounded-md font-black text-[9px] transition-colors ${activeTab === tab.id ? 'bg-primary-100 text-primary-600 shadow-sm' : 'bg-input text-text-muted border border-border-default'}`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full shadow-[0_-2px_10px_rgba(124,58,237,0.4)] animate-in slide-in-from-bottom-2 duration-300" />
                            )}
                        </button>
                    ))}

                    {/* <div className="ml-auto mb-6 flex items-center gap-3 px-4 py-2 bg-input/50 rounded-xl border border-border-default">
                        <Target className="w-3.5 h-3.5 text-primary-400" />
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Registry Lock Active</span>
                    </div> */}
                </div>

                {/* Tab Content Layer */}
                <div className="flex-1 p-0 animate-in slide-in-from-right-4 duration-500">
                    {activeTab === 'pending' && (
                        <PendingRequestsTab
                            loanRequests={branchData.pending_loan_requests}
                            centerRequests={branchData.pending_center_requests}
                            promotionRequests={branchData.pending_promotion_requests}
                            incrementRequests={branchData.pending_increment_requests}
                            centerChangeRequests={branchData.pending_center_change_requests}
                            customerEditRequests={branchData.pending_customer_edit_requests}
                            leaveRequests={branchData.pending_leave_requests}
                            searchQuery={searchQuery}
                        />
                    )}

                    {activeTab === 'approved' && (
                        <ApprovalRequestsTab
                            loanRequests={branchData.approved_loan_requests}
                            centerRequests={branchData.approved_center_requests}
                            promotionRequests={branchData.approved_promotion_requests}
                            incrementRequests={branchData.approved_increment_requests}
                            centerChangeRequests={branchData.approved_center_change_requests}
                            customerEditRequests={branchData.approved_customer_edit_requests}
                            leaveRequests={branchData.approved_leave_requests}
                            searchQuery={searchQuery}
                        />
                    )}

                    {activeTab === 'staff' && (
                        <StaffTab
                            staffData={branchData.staff_attendance}
                            dateFilter={dateFilter}
                            searchQuery={searchQuery}
                            attendanceFilter={attendanceFilter}
                            onFilterChange={setAttendanceFilter}
                        />
                    )}
                </div>

                {/* Protocol Trace Footer */}
                <div className="px-8 py-4 bg-input/20 border-t border-border-divider flex items-center justify-between opacity-60">
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em]">
                        Institutional Trace v9.2 • Registry Integrity Verified
                    </p>
                    <div className="flex items-center gap-1.5 grayscale">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
