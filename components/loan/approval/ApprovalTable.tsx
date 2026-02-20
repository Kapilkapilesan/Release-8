import { Eye, AlertCircle } from 'lucide-react';
import { colors } from '@/themes/colors';
import { LoanApprovalItem } from '@/types/loan-approval.types';

interface ApprovalTableProps {
    loans: LoanApprovalItem[];
    onView: (loan: LoanApprovalItem) => void;
}

export const ApprovalTable: React.FC<ApprovalTableProps> = ({ loans, onView }) => {
    const getTimeDifferenceInHours = (dateStr: string, timeStr: string): number => {
        const submittedDateTime = new Date(`${dateStr} ${timeStr}`);
        const now = new Date();
        const diffMs = now.getTime() - submittedDateTime.getTime();
        return diffMs / (1000 * 60 * 60);
    };

    const isOverdue = (dateStr: string, timeStr: string): boolean => {
        return getTimeDifferenceInHours(dateStr, timeStr) > 1;
    };

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border-default overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-table-header border-b border-border-divider">
                        <tr>
                            <th className="text-left px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">Serial</th>
                            <th className="text-left px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">Contract No</th>
                            <th className="text-left px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">Customer Name</th>
                            <th className="text-left px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">NIC</th>
                            <th className="text-right px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">Loan Amount</th>
                            <th className="text-left px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">Staff</th>
                            <th className="text-left px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">Submitted Date</th>
                            <th className="text-center px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">1st Approval</th>
                            <th className="text-center px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">2nd Approval</th>
                            <th className="text-center px-6 py-3 text-xs text-text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-divider">
                        {loans.map((loan) => {
                            const overdueWarning = isOverdue(loan.submittedDate, loan.submittedTime);
                            return (
                                <tr key={loan.id} className={`hover:bg-table-row-hover transition-colors ${overdueWarning ? 'bg-orange-50/10 dark:bg-orange-500/5' : ''}`}>
                                    <td className="px-6 py-4 text-sm text-text-primary font-medium">{loan.serialNo}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-text-primary font-bold">{loan.contractNo}</span>
                                            {overdueWarning && (
                                                <span title="Over 1 hour pending">
                                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-primary">{loan.customerName}</td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{loan.nic}</td>
                                    <td className="px-6 py-4 text-sm text-right text-text-primary font-semibold">LKR {loan.loanAmount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">{loan.staff}</td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                        <div>{loan.submittedDate}</div>
                                        <div className="text-xs text-text-muted">{loan.submittedTime}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {loan.firstApproval === 'Pending' && (
                                            <span className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold uppercase tracking-wider">Pending</span>
                                        )}
                                        {loan.firstApproval === 'Approved' && (
                                            <div className="text-xs">
                                                <div className="text-emerald-500 font-bold dark:text-emerald-400">Approved</div>
                                                <div className="text-text-primary font-medium">{loan.firstApprovalBy}</div>
                                                <div className="text-text-muted">{loan.firstApprovalDate}</div>
                                            </div>
                                        )}
                                        {loan.firstApproval === 'Sent Back' && (
                                            <div className="text-xs">
                                                <div className="text-rose-500 dark:text-rose-400 font-bold">Sent Back</div>
                                                <div className="text-text-muted">{loan.firstApprovalDate}</div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {loan.secondApproval === null && loan.loanAmount <= 200000 ? (
                                            <span className="text-xs text-text-muted">N/A</span>
                                        ) : loan.secondApproval === 'Pending' ? (
                                            <span
                                                className="px-2 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 rounded text-[10px] font-bold uppercase tracking-wider"
                                            >Pending</span>
                                        ) : loan.secondApproval === 'Approved' ? (
                                            <div className="text-xs">
                                                <div className="text-emerald-500 font-bold dark:text-emerald-400">Approved</div>
                                                <div className="text-text-primary font-medium">{loan.secondApprovalBy}</div>
                                                <div className="text-text-muted">{loan.secondApprovalDate}</div>
                                            </div>
                                        ) : loan.secondApproval === 'Sent Back' ? (
                                            <div className="text-xs">
                                                <div className="text-rose-500 dark:text-rose-400 font-bold">Sent Back</div>
                                                <div className="text-text-muted">{loan.secondApprovalDate}</div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onView(loan)}
                                            className="hover:opacity-80 transition-all transform hover:scale-110 p-1 rounded-lg text-primary-500 hover:bg-primary-500/10"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
