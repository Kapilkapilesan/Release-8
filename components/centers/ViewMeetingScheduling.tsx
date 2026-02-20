'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, MapPin, User, Users, X, Plus, Eye } from 'lucide-react';
import { Center, TemporaryAssignment } from '../../types/center.types';
import { centerService } from '../../services/center.service';
import { branchService } from '../../services/branch.service';
import { API_BASE_URL, getHeaders } from '../../services/api.config';
import { Branch } from '../../types/branch.types';
import { Staff } from '../../types/staff.types';
import { AssignCustomersModal } from './AssignCustomersModal';
import { colors } from '@/themes/colors';
import BMSLoader from '../common/BMSLoader';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function ViewMeetingScheduling() {
    const [centers, setCenters] = useState<Center[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [temporaryAssignments, setTemporaryAssignments] = useState<TemporaryAssignment[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('temporaryAssignments');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [assignmentForm, setAssignmentForm] = useState({
        temporaryUser: '',
        date: '',
        reason: ''
    });

    const [branches, setBranches] = useState<Branch[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);

    // Assign Customers Modal State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assigningCenter, setAssigningCenter] = useState<Center | null>(null);

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        loadCenters();
    }, []);

    const loadCenters = async () => {
        try {
            setIsLoading(true);
            const [centersData, branchesData, fieldOfficersResponse] = await Promise.all([
                centerService.getCentersList(),
                branchService.getBranchesAll(),
                fetch(`${API_BASE_URL}/staffs/by-role/field_officer`, {
                    headers: getHeaders(),
                    credentials: 'include'
                }).then(res => res.ok ? res.json() : { data: [] })
            ]);

            setCenters(centersData || []);
            setBranches(branchesData || []);

            // Log for debugging (though USER won't see it directly, it ensures we follow CenterForm pattern)
            if (fieldOfficersResponse?.data && Array.isArray(fieldOfficersResponse.data)) {
                setStaffList(fieldOfficersResponse.data);
            } else if (Array.isArray(fieldOfficersResponse)) {
                setStaffList(fieldOfficersResponse);
            } else {
                setStaffList([]);
            }
        } catch (err: any) {
            console.error("Error loading meeting scheduling data:", err);
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCenters = centers.filter(center => {
        if (center.status === 'rejected') return false;
        if (selectedBranch && String(center.branch_id) !== String(selectedBranch)) return false;
        if (selectedUser && String(center.staff_id) !== String(selectedUser)) return false;
        return true;
    });

    const handleCardClick = (center: Center) => {
        setSelectedCenter(center);
        setAssignmentForm({
            temporaryUser: '',
            date: new Date().toISOString().split('T')[0],
            reason: ''
        });
        setShowModal(true);
    };

    const executeAssignment = () => {
        if (!selectedCenter || !assignmentForm.temporaryUser) return;

        const newAssignment: TemporaryAssignment = {
            centerId: selectedCenter.id,
            originalUser: selectedCenter.staff_id,
            temporaryUser: assignmentForm.temporaryUser,
            date: assignmentForm.date,
            reason: assignmentForm.reason
        };

        // Filter out existing assignment for the same center and date to prevent duplicates
        const filteredAssignments = temporaryAssignments.filter(
            a => !(a.centerId === selectedCenter.id && a.date === assignmentForm.date)
        );

        const updatedAssignments = [...filteredAssignments, newAssignment];
        setTemporaryAssignments(updatedAssignments);
        localStorage.setItem('temporaryAssignments', JSON.stringify(updatedAssignments));
        setShowModal(false);
    };

    const handleSaveAssignment = () => {
        if (selectedCenter && assignmentForm.temporaryUser) {
            // Check if assignment already exists
            const existingAssignment = temporaryAssignments.find(
                a => a.centerId === selectedCenter.id && a.date === assignmentForm.date
            );

            if (existingAssignment) {
                setConfirmDialog({
                    isOpen: true,
                    title: 'Overwrite Assignment?',
                    message: 'A temporary user is already assigned to this center on this date. Do you want to overwrite it?',
                    onConfirm: executeAssignment
                });
                return;
            }

            executeAssignment();
        }
    };

    const handleAssignCustomers = (e: React.MouseEvent, center: Center) => {
        e.stopPropagation(); // Don't trigger card click (temporary assignment)
        setAssigningCenter(center);
        setIsAssignModalOpen(true);
    };

    const handleAssignSuccess = () => {
        loadCenters();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-6rem)]">
                <BMSLoader message="Loading Centers..." size="medium" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
                <p>{error}</p>
                <button
                    onClick={loadCenters}
                    style={{ backgroundColor: colors.primary[600] }}
                    className="mt-4 px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium text-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">View Meeting Scheduling</h1>
                <p className="text-sm text-text-muted mt-1">Manage temporary user assignments for center meetings</p>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-lg border border-border-default p-4 transition-colors">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Branch</label>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full px-3 py-2 border border-border-default bg-input text-text-primary rounded-lg outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': colors.primary[500] } as any}
                        >
                            <option value="">All Branches</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.branch_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-text-secondary mb-2">User</label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full px-3 py-2 border border-border-default bg-input text-text-primary rounded-lg outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': colors.primary[500] } as any}
                        >
                            <option value="">All Users</option>
                            {staffList.map(staff => (
                                <option key={staff.staff_id} value={staff.staff_id}>{staff.full_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Centers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCenters.map((center) => (
                    <div
                        key={center.id}
                        onClick={() => handleCardClick(center)}
                        className="bg-card rounded-lg border border-border-default p-6 hover:shadow-lg transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${colors.primary[600]}15` }}
                            >
                                <Users className="w-6 h-6" style={{ color: colors.primary[600] }} />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-muted-bg text-text-muted group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                    <Eye className="w-4 h-4" />
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${center.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {center.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold text-text-primary">{center.center_name}</h3>
                                <p className="text-sm text-text-muted">{center.CSU_id}</p>
                            </div>

                            <div className="mt-4 border-t border-border-divider pt-3">
                                <h4 className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Schedule</h4>
                                <div className="space-y-1.5">
                                    {center.open_days?.slice(0, 3).map((schedule, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                                                <span>{schedule.day}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <Clock className="w-3.5 h-3.5 text-text-muted" />
                                                <span>{schedule.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(center.open_days?.length || 0) > 3 && (
                                        <p className="text-xs text-center text-text-muted italic pt-1 mt-1">
                                            +{(center.open_days?.length || 0) - 3} more schedules
                                        </p>
                                    )}
                                    {(!center.open_days || center.open_days.length === 0) && (
                                        <p className="text-sm text-text-muted italic">No schedule set</p>
                                    )}
                                </div>
                            </div>

                            {/* <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{center.branch_id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4" />
                                <span>{center.staff_id}</span>
                            </div>
                        </div> */}

                            <div className="pt-2 border-t border-border-divider">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-lg font-semibold text-text-primary">{center.groups_count ?? center.group_count ?? 0}</p>
                                        <p className="text-xs text-text-muted">Groups</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-text-primary">{center.customers_count ?? center.totalMembers ?? 0}</p>
                                        <p className="text-xs text-text-muted">Members</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-text-primary">{center.loans_count ?? center.totalLoans ?? 0}</p>
                                        <p className="text-xs text-text-muted">Loans</p>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && selectedCenter && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl max-w-md w-full shadow-2xl border border-border-default transform transition-all">
                        <div className="p-6 border-b border-border-divider">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-text-primary">Temporary User Assignment</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-hover rounded transition-colors"
                                >
                                    <X className="w-5 h-5 text-text-muted" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-app-background rounded-lg p-4 space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Center Name</label>
                                    <p className="text-sm font-semibold text-text-primary">{selectedCenter.center_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Center Time</label>
                                    <p className="text-sm font-semibold text-text-primary">
                                        {selectedCenter.open_days?.map(d => `${d.time} (${d.day})`).join(', ') || 'No schedule'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Center User</label>
                                    <p className="text-sm font-semibold text-text-primary">{selectedCenter.staff_id}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Center Location</label>
                                    <p className="text-sm font-semibold text-text-primary">{selectedCenter.address}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Temporary User *</label>
                                    <select
                                        value={assignmentForm.temporaryUser}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, temporaryUser: e.target.value })}
                                        className="w-full px-3 py-2 border border-border-default bg-input text-text-primary rounded-lg outline-none focus:ring-2 transition-all"
                                        style={{ '--tw-ring-color': colors.primary[500] } as any}
                                        required
                                    >
                                        <option value="">Select User</option>
                                        {staffList.map((staff) => (
                                            <option key={staff.staff_id} value={staff.full_name}>
                                                {staff.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={assignmentForm.date}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-border-default bg-input text-text-primary rounded-lg outline-none focus:ring-2 transition-all"
                                        style={{ '--tw-ring-color': colors.primary[500] } as any}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Reason</label>
                                    <textarea
                                        value={assignmentForm.reason}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, reason: e.target.value })}
                                        rows={3}
                                        placeholder="Reason for temporary assignment..."
                                        className="w-full px-3 py-2 border border-border-default bg-input text-text-primary rounded-lg outline-none focus:ring-2 transition-all resize-none"
                                        style={{ '--tw-ring-color': colors.primary[500] } as any}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-border-divider flex gap-3 justify-end bg-muted-bg/30">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-border-default bg-card text-text-secondary rounded-lg hover:bg-hover transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAssignment}
                                disabled={!assignmentForm.temporaryUser || !assignmentForm.date}
                                style={{ backgroundColor: colors.primary[600] }}
                                className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                            >
                                Assign User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Temporary Assignments Summary */}
            {temporaryAssignments.length > 0 && (
                <div className="bg-card rounded-lg border border-border-default p-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Temporary Assignments</h3>
                    <div className="space-y-3">
                        {temporaryAssignments.slice(-5).map((assignment, index) => {
                            const center = centers.find(c => c.id === assignment.centerId);
                            return (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted-bg rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{center?.center_name}</p>
                                        <p className="text-xs text-text-muted">
                                            {assignment.originalUser} → {assignment.temporaryUser} on {assignment.date}
                                        </p>
                                    </div>
                                    <span className="text-xs text-text-muted">{assignment.reason}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Assign Customers Modal */}
            {assigningCenter && (
                <AssignCustomersModal
                    isOpen={isAssignModalOpen}
                    center={assigningCenter}
                    onClose={() => {
                        setIsAssignModalOpen(false);
                        setAssigningCenter(null);
                    }}
                    onAssignSuccess={handleAssignSuccess}
                />
            )}
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText="Overwrite"
                cancelText="Cancel"
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                variant="warning"
            />
        </div>
    );
}
