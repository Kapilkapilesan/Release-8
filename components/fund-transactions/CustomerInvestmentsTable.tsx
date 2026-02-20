'use client';

import React, { useState } from 'react';
import { Calendar, TrendingUp, Landmark, SearchCode, Printer, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import { Investment } from '../../types/investment.types';
import { InvestmentDetailModal } from '../investment/InvestmentDetailModal';
import { colors } from '@/themes/colors';
import { toast } from 'react-toastify';
import { investmentService } from '@/services/investment.service';
import { ReprintRequestModal } from '../investment/ReprintRequestModal';

interface Props {
    records: Investment[];
}

export function CustomerInvestmentsTable({ records }: Props) {
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState<number | null>(null);
    const [isReprintModalOpen, setIsReprintModalOpen] = useState(false);
    const [reprintTarget, setReprintTarget] = useState<Investment | null>(null);

    const handleRowClick = (investment: Investment) => {
        setSelectedInvestment(investment);
        setIsDetailOpen(true);
    };

    const handlePrint = async (e: React.MouseEvent, record: Investment) => {
        e.stopPropagation();

        if (record.print_count > 0 && !record.is_reprint_authorized) {
            if (record.reprint_requested) {
                toast.info('Reprint request is already pending administrator approval.');
                return;
            }

            setReprintTarget(record);
            setIsReprintModalOpen(true);
            return;
        }

        try {
            setIsPrinting(record.id);
            // We still call the service to increment the print tracking on the backend
            await investmentService.downloadReceipt(record.id);

            // However, since the document generation logic is "Coming Soon", 
            // we show a toast instead of attempting to download a placeholder PDF.
            toast.info('Investment Portfolio Document generation is coming soon!', {
                icon: <Printer className="text-primary-500" />
            });

            // Success state to refresh or update local UI if needed
            record.print_count += 1;
            record.is_reprint_authorized = false;
        } catch (error: any) {
            toast.error(error.message || 'Print failed');
        } finally {
            setIsPrinting(null);
        }
    };

    const handleReprintConfirm = async (reason: string) => {
        if (!reprintTarget) return;

        try {
            setIsPrinting(reprintTarget.id);
            await investmentService.requestReprint(reprintTarget.id, reason);
            toast.success('Reprint request submitted to Security Control.');

            // Update local state to show "Pending Approval" immediately
            reprintTarget.reprint_requested = true;
            reprintTarget.reprint_reason = reason;
        } catch (error: any) {
            toast.error(error.message || 'Request failed');
            throw error; // Re-throw for the modal to handle error state
        } finally {
            setIsPrinting(null);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
            case 'CLOSED': return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
            case 'MATURED': return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
            case 'RENEWED': return { bg: 'bg-primary-500/10', text: 'text-primary-500', border: 'border-primary-500/20' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-200' };
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Investment Identity</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Principal Investor</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Structure & Yield</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Balance</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap text-right">Lifecycle</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center whitespace-nowrap">Action Port</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {records.length > 0 ? records.map((record) => {
                            const status = getStatusStyle(record.status);
                            const isPrintLocked = record.print_count > 0 && !record.is_reprint_authorized;

                            return (
                                <tr
                                    key={record.id}
                                    onClick={() => handleRowClick(record)}
                                    className="group hover:bg-gray-50/50 transition-all duration-300 cursor-pointer"
                                >
                                    <td className="px-8 py-8">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                                <code className="text-[10px] font-black bg-primary-50 text-primary-600 px-3 py-1.5 rounded-xl border border-primary-100 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 shadow-sm uppercase">
                                                    {record.transaction_id}
                                                </code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.text.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor] animate-pulse`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${status.text}`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-gray-900 group-hover:theme-text-primary transition-colors uppercase tracking-tight leading-none mb-1.5">{record.customer?.full_name || 'N/A'}</p>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">ID: {record.customer?.customer_code}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black theme-text-primary uppercase tracking-widest group-hover:theme-text-primary-dark transition-colors">{record.snapshot_product_name}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                    {record.snapshot_payout_type === 'MONTHLY' ? record.snapshot_interest_rate_monthly : record.snapshot_interest_rate_maturity}%
                                                </div>
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-60">{record.snapshot_payout_type} Yield</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-right whitespace-nowrap">
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className="text-xl font-black text-gray-900 tracking-tighter transition-transform duration-500 group-hover:scale-105 origin-right">
                                                {Number(record.amount).toLocaleString()}
                                            </span>
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-60">LKR Principal</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8 text-right whitespace-nowrap">
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-primary-500" />
                                                <span className="text-[10px] font-black text-gray-700 uppercase">{record.start_date ? new Date(record.start_date).toLocaleDateString('en-GB') : 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-0.5 bg-rose-50 rounded-lg border border-rose-100 text-rose-500">
                                                <div className="w-1 h-1 rounded-full bg-rose-500" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">EXP: {record.maturity_date ? new Date(record.maturity_date).toLocaleDateString('en-GB') : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex justify-center">
                                            {record.status === 'ACTIVE' && (
                                                <button
                                                    onClick={(e) => handlePrint(e, record)}
                                                    disabled={isPrinting === record.id}
                                                    className={`group relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${isPrinting === record.id ? 'bg-gray-100 text-gray-400 cursor-wait' : isPrintLocked ? (record.reprint_requested ? 'bg-slate-500 text-white shadow-slate-500/20 hover:bg-slate-600' : 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600') : 'bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-700'}`}
                                                >
                                                    {isPrinting === record.id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : isPrintLocked ? (
                                                        record.reprint_requested ? <ShieldAlert className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <Printer className="w-3.5 h-3.5" />
                                                    )}
                                                    {isPrintLocked ? (record.reprint_requested ? 'Pending Approval' : 'Request to Reprint') : 'Print Document'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-32 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
                                            <Landmark className="w-8 h-8 text-gray-200" />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">No portfolios match search criteria</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-40">
                    Institutional Asset Portfolio • Verified High-Integrity Records
                </p>
            </div>

            <InvestmentDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                investment={selectedInvestment}
            />

            {reprintTarget && (
                <ReprintRequestModal
                    isOpen={isReprintModalOpen}
                    onClose={() => setIsReprintModalOpen(false)}
                    onConfirm={handleReprintConfirm}
                    investmentTitle={reprintTarget.customer?.full_name || 'Account Portfolio'}
                    investmentId={reprintTarget.transaction_id}
                />
            )}
        </div>
    );
}
