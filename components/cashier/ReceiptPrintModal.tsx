'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Download } from 'lucide-react';
import { colors } from '@/themes/colors';

interface ReceiptPrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    receipt: any;
}

export function ReceiptPrintModal({ isOpen, onClose, receipt }: ReceiptPrintModalProps) {
    if (!isOpen || !receipt) return null;

    const date = new Date(receipt.created_at);
    const formattedDate = date.toLocaleDateString('en-GB');
    const formattedTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

    const handlePrint = () => {
        window.print();
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-receipt-container, #printable-receipt-container * {
                        visibility: visible;
                    }
                    #printable-receipt-container {
                        position: fixed;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background: white !important;
                        margin: 0 !important;
                        padding: 40px !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-xl no-print">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <Printer className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Receipt Preview</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Ready for printing</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all text-gray-400 group">
                        <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Scrollable Document Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-100/50 dark:bg-gray-900/50 custom-scrollbar flex justify-center">
                    <div
                        id="printable-receipt-container"
                        className="bg-white w-full max-w-[500px] p-10 shadow-xl relative min-h-[700px] text-[#1a1a1a]"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                        {/* Watermark Logo */}
                        <img
                            src="/bms-logo-verified.png"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] opacity-[0.05] pointer-events-none select-none z-0"
                            alt=""
                        />

                        <div className="relative z-10 w-full">
                            {/* Header Logo */}
                            <div className="text-center mb-8">
                                <img src="/bms-logo-verified.png" className="w-[280px] mx-auto" alt="BMS LOGO" />
                            </div>

                            <div className="border-t-[1.5px] border-dashed border-gray-300 my-6"></div>

                            {/* Info Section */}
                            <div className="space-y-2.5 text-sm">
                                <div className="flex">
                                    <div className="w-36 font-semibold text-gray-700">Receipt No</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold">{receipt.receipt_id}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-36 font-semibold text-gray-700">Receipt Date</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold">{formattedDate}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-36 font-semibold text-gray-700">Receipt Time</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold">{formattedTime}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-36 font-semibold text-gray-700">Branch Name</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold">{receipt.center?.branch?.branch_name || receipt.branch?.branch_name || 'Head Office'}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-36 font-semibold text-gray-700">Payment Type</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold">{receipt.receipt_type}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-36 font-semibold text-gray-700">Contract No</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold">{receipt.investment?.transaction_id || receipt.loan?.transaction_id || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex mt-8 text-[15px]">
                                <div className="w-36 font-semibold text-gray-700">From</div>
                                <div className="w-5">:</div>
                                <div className="font-extrabold uppercase tracking-tight">{receipt.customer?.full_name}</div>
                            </div>

                            <div className="mt-8 space-y-2.5 text-sm">
                                <div className="flex">
                                    <div className="w-36 font-semibold text-gray-700">Paid Amount</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold text-[16px]">LKR {Number(receipt.current_due_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className="flex">
                                    <div className="w-36 font-semibold text-gray-700">Payment Method</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold">Cash</div>
                                </div>

                                <div className="pt-8 flex">
                                    <div className="w-36 font-semibold text-gray-700">Cashier</div>
                                    <div className="w-5">:</div>
                                    <div className="font-extrabold">{receipt.staff?.full_name || receipt.staff?.name || 'Authorized Member'}</div>
                                </div>
                            </div>

                            <div className="border-t-[1.5px] border-dashed border-gray-300 my-8"></div>

                            <div className="flex justify-between items-end text-[11px] text-gray-500 leading-relaxed mb-6">
                                <div className="max-w-[300px]">
                                    City Office: No 06, 1st Floor Main Street Chankanai, Jaffna.<br />
                                    Tel : 021 222 35 56<br />
                                    website: www.bmscapital.lk<br />
                                    email: info@bmscapital.lk
                                </div>
                                <div className="text-[32px] font-serif text-gray-800 leading-none">
                                    {receipt.receipt_id}
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-[9px] font-medium text-gray-400 max-w-[450px] mx-auto leading-normal">
                                    BMS Capital Solutions (pvt) ltd, On this day has been incorporated as a Private Company With Limited Liability
                                    having complied with the requirements of the Companies Act No 7 of 2007<br />
                                    Given under my hand at Colombo, on this Twenty Fifth day of November Two Thousand Twenty Four
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4 no-print">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-inter"
                    >
                        Close Preview
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 font-inter"
                    >
                        <Printer size={18} />
                        Trigger Official Print
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
