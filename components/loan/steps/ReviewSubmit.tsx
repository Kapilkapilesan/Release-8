'use client';

import React, { useState } from 'react';
import { CheckCircle, Eye, Maximize2, X, Download } from 'lucide-react';
import { LoanFormData, CustomerRecord } from '@/types/loan.types';
import { Staff } from '@/types/staff.types';
import { calculateTotalFees, calculateNetDisbursement, formatCurrency, getDocumentUrl } from '@/utils/loan.utils';
import { colors } from '@/themes/colors';
import { API_BASE_URL } from '@/services/api.config';

interface ReviewSubmitProps {
    formData: LoanFormData;
    selectedCustomerRecord?: CustomerRecord | null;
    staffs: Staff[];
    isEditMode?: boolean;
}

export const ReviewSubmit: React.FC<ReviewSubmitProps> = ({ formData, selectedCustomerRecord, staffs, isEditMode = false }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<string>('');

    React.useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const totalFees = calculateTotalFees(formData);
    const netDisbursement = calculateNetDisbursement(formData);

    const getStaffName = (id: string) => {
        const staff = staffs.find(s => s.staff_id === id);
        return staff ? staff.full_name : id || 'Not selected';
    };

    const openPreview = async (type: string, file: File | null, doc: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setPreviewType(type);
        } else if (doc) {
            try {
                const docId = doc.id;
                if (!docId) {
                    setPreviewUrl(getDocumentUrl(doc.url || doc.file_path));
                    setPreviewType(type);
                    return;
                }
                let endpoint = `${API_BASE_URL}/media/loan-documents/${docId}`;

                // If the document is imported from the customer profile, use the customer media endpoint
                if (doc.is_from_profile) {
                    const typeParam = type.toLowerCase().includes('nic') ? 'nic' : 'profile';
                    endpoint = `${API_BASE_URL}/media/customers/${formData.customer}?type=${typeParam}`;
                }

                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    // Fallback to old behavior if secure fetch fails
                    setPreviewUrl(getDocumentUrl(doc.url || doc.file_path));
                    setPreviewType(type);
                    return;
                }

                const blob = await response.blob();
                setPreviewUrl(URL.createObjectURL(blob));
                setPreviewType(type);
            } catch (error) {
                console.error('Error previewing document:', error);
                // Fallback to old behavior if ID is missing or fetch fails
                setPreviewUrl(getDocumentUrl(doc.url || doc.file_path));
                setPreviewType(type);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Review & Submit</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-muted-bg/20 dark:bg-muted-bg/5 border border-border-divider/50 rounded-[2rem] p-8 shadow-inner transition-colors">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        Customer Information
                    </h3>
                    <div className="space-y-4 text-sm font-black tracking-tight">
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Center</span>
                            <span className="text-text-primary">{formData.center || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Group</span>
                            <span className="text-text-primary">{formData.group || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">NIC</span>
                            <span className="text-text-primary">{formData.nic || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Customer</span>
                            <span className="text-text-primary">
                                {selectedCustomerRecord?.name || 'Not selected'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border-divider/30 pt-4 mt-4">
                            <span className="text-[11px] text-emerald-500/80 uppercase tracking-widest">Monthly Income</span>
                            <span className="text-emerald-500 font-black">LKR {Number(formData.monthly_income || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-rose-500/80 uppercase tracking-widest">Monthly Expenses</span>
                            <span className="text-rose-500 font-black">LKR {Number(formData.monthly_expenses || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-muted-bg/20 dark:bg-muted-bg/5 border border-border-divider/50 rounded-[2rem] p-8 shadow-inner transition-colors">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        Loan Details
                    </h3>
                    <div className="space-y-4 text-sm font-black tracking-tight">
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Requested Amount</span>
                            <span className="text-text-primary">
                                {formatCurrency(Number(formData.requestedAmount || 0))}
                            </span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Approved Amount</span>
                            <span className="text-text-primary">
                                {formatCurrency(Number(formData.loanAmount || 0))}
                            </span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Interest Rate</span>
                            <span className="text-text-primary">{formData.interestRate || '0'}%</span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Tenure</span>
                            <span className="text-text-primary">{formData.tenure || '0'} Weeks</span>
                        </div>
                        {formData.calculated_rental && (
                            <div className="flex justify-between items-center pt-4 border-t border-border-divider/30 mt-4 relative group/rental overflow-hidden rounded-2xl p-4 bg-primary-500/5">
                                <span className="text-[11px] font-black text-primary-500 uppercase tracking-widest">Weekly Rental</span>
                                <span className="text-lg font-black text-primary-500 tabular-nums">
                                    {formatCurrency(Number(formData.calculated_rental))}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-muted-bg/20 dark:bg-muted-bg/5 border border-border-divider/50 rounded-[2rem] p-8 shadow-inner transition-colors">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        Fees & Charges
                    </h3>
                    <div className="space-y-4 text-sm font-black tracking-tight">
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Processing Fee</span>
                            <span className="text-text-primary">
                                {formatCurrency(Number(formData.processingFee || 0))}
                            </span>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Documentation Fee</span>
                            <span className="text-text-primary">
                                {formatCurrency(Number(formData.documentationFee || 0))}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="rounded-[2.5rem] p-10 relative overflow-hidden group/summary shadow-2xl transition-all hover:shadow-primary-500/10"
                    style={{ backgroundImage: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover/summary:scale-150" />
                    <h3 className="text-[11px] font-black text-white/60 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Total Summary
                    </h3>
                    <div className="space-y-5 text-sm font-black text-white/90">
                        <div className="flex justify-between items-center opacity-70">
                            <span className="text-[10px] uppercase tracking-widest">Loan Amount</span>
                            <span className="tabular-nums">{formatCurrency(Number(formData.loanAmount || 0))}</span>
                        </div>
                        <div className="flex justify-between items-center opacity-70">
                            <span className="text-[10px] uppercase tracking-widest">Total Fees</span>
                            <span className="tabular-nums">- {formatCurrency(totalFees)}</span>
                        </div>
                        {Number(formData.reloan_deduction_amount ?? 0) > 0 && (
                            <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/10">
                                <span className="text-[10px] uppercase tracking-widest italic text-amber-300">Reloan Deduction</span>
                                <span className="tabular-nums text-amber-300">({formatCurrency(Number(formData.reloan_deduction_amount))})</span>
                            </div>
                        )}
                        <div className="pt-6 border-t border-white/20 mt-6 flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[11px] uppercase tracking-[0.2em] mb-1">Net Disbursable Cash</span>
                                <span className="text-4xl font-black tabular-nums tracking-tighter text-white drop-shadow-md">
                                    {formatCurrency(Number(formData.loanAmount) - totalFees - Number(formData.reloan_deduction_amount || 0))}
                                </span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                                <div className="h-full bg-emerald-400 w-full animate-progress-dna shadow-[0_0_10px_#10b981]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-muted-bg/20 dark:bg-muted-bg/5 border border-border-divider/50 rounded-[2rem] p-8 shadow-inner transition-colors col-span-2">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        Bank Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-black tracking-tight">
                        <div className="flex justify-between items-center group/item hover:bg-muted-bg/10 p-2 rounded-xl transition-colors">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Bank Name</span>
                            <span className="text-text-primary px-3 py-1 bg-card rounded-lg border border-border-divider/30">{formData.bankName || 'Not selected'}</span>
                        </div>
                        <div className="flex justify-between items-center group/item hover:bg-muted-bg/10 p-2 rounded-xl transition-colors">
                            <span className="text-[11px] text-text-muted/60 uppercase tracking-widest">Account Number</span>
                            <span className="text-text-primary font-mono bg-black/5 dark:bg-white/5 px-3 py-1 rounded-lg border border-border-divider/30">{formData.accountNumber || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-muted-bg/20 dark:bg-muted-bg/5 border border-border-divider/50 rounded-[2rem] p-8 shadow-inner transition-colors col-span-2">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        Guarantors & Witnesses
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm font-black tracking-tight">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-card rounded-2xl border border-border-divider/30">
                                <span className="text-[10px] text-text-muted/60 uppercase tracking-widest">Guarantor 01</span>
                                <span className="text-text-primary uppercase">{formData.guarantor1_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-card rounded-2xl border border-border-divider/30">
                                <span className="text-[10px] text-text-muted/60 uppercase tracking-widest">Guarantor 02</span>
                                <span className="text-text-primary uppercase">{formData.guarantor2_name || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-primary-500/5 rounded-2xl border border-primary-500/10">
                                <span className="text-[10px] text-primary-500 uppercase tracking-widest">Witness 01 (Staff)</span>
                                <span className="text-text-primary">{getStaffName(formData.witness1_id)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-primary-500/5 rounded-2xl border border-primary-500/10">
                                <span className="text-[10px] text-primary-500 uppercase tracking-widest">Witness 02 (Staff)</span>
                                <span className="text-text-primary">{getStaffName(formData.witness2_id)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-muted-bg/20 dark:bg-muted-bg/5 border border-border-divider/50 rounded-[2rem] p-8 shadow-inner transition-colors col-span-2">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        Joint Borrower Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm font-black tracking-tight">
                        <div className="p-5 bg-card rounded-2xl border border-border-divider/30 flex flex-col gap-1.5">
                            <span className="text-[9px] text-text-muted/60 uppercase tracking-widest font-black">Name</span>
                            <span className="text-text-primary text-sm uppercase">{formData.guardian_name || 'N/A'}</span>
                        </div>
                        <div className="p-5 bg-card rounded-2xl border border-border-divider/30 flex flex-col gap-1.5">
                            <span className="text-[9px] text-text-muted/60 uppercase tracking-widest font-black">Relationship</span>
                            <span className="text-text-primary text-sm">{formData.guardian_relationship || 'N/A'}</span>
                        </div>
                        <div className="p-5 bg-card rounded-2xl border border-border-divider/30 flex flex-col gap-1.5">
                            <span className="text-[9px] text-text-muted/60 uppercase tracking-widest font-black">NIC</span>
                            <span className="text-text-primary text-sm font-mono">{formData.guardian_nic || 'N/A'}</span>
                        </div>
                        <div className="p-5 bg-card rounded-2xl border border-border-divider/30 flex flex-col gap-1.5">
                            <span className="text-[9px] text-text-muted/60 uppercase tracking-widest font-black">Primary Phone</span>
                            <span className="text-text-primary text-sm font-mono">{formData.guardian_phone || 'N/A'}</span>
                        </div>
                        <div className="p-5 bg-card rounded-2xl border border-border-divider/30 flex flex-col gap-1.5">
                            <span className="text-[9px] text-text-muted/60 uppercase tracking-widest font-black">Secondary Phone</span>
                            <span className="text-text-primary text-sm font-mono">{formData.guardian_secondary_phone || 'N/A'}</span>
                        </div>
                        <div className="p-5 bg-card rounded-2xl border border-border-divider/30 flex flex-col gap-1.5 lg:col-span-1">
                            <span className="text-[9px] text-text-muted/60 uppercase tracking-widest font-black">Address</span>
                            <span className="text-text-primary text-xs uppercase leading-relaxed">{formData.guardian_address || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-muted-bg/20 dark:bg-muted-bg/5 border border-border-divider/50 rounded-[2rem] p-8 shadow-inner transition-colors col-span-2">
                    <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                        Uploaded Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Newly Uploaded Documents */}
                        {Object.entries(formData.documents || {}).map(([type, file]) => (
                            file && (
                                <button
                                    key={`new-${type}`}
                                    type="button"
                                    onClick={(e) => openPreview(type, file, null, e)}
                                    className="group flex items-center justify-between gap-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl transition-all active:scale-95"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                        <div className="flex flex-col items-start transition-transform group-hover:translate-x-1">
                                            <span className="text-[9px] text-emerald-500/60 font-black uppercase tracking-widest shrink-0">{type}</span>
                                            <span className="text-text-primary text-[11px] font-black truncate max-w-[120px]">{file.name}</span>
                                        </div>
                                    </div>
                                    <Eye className="w-4 h-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors shrink-0" />
                                </button>
                            )
                        ))}

                        {/* Existing Documents */}
                        {formData.existingDocuments?.map((doc: any) => (
                            <button
                                key={`existing-${doc.id}`}
                                type="button"
                                onClick={(e) => openPreview(doc.document_type || doc.type, null, doc, e)}
                                className="group flex items-center justify-between gap-4 bg-primary-500/5 hover:bg-primary-500/10 border border-primary-500/20 p-4 rounded-2xl transition-all active:scale-95"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                                    <div className="flex flex-col items-start transition-transform group-hover:translate-x-1">
                                        <span className="text-[9px] text-primary-500/60 font-black uppercase tracking-widest shrink-0">{doc.document_type || doc.type}</span>
                                        <span className="text-text-primary text-[11px] font-black truncate max-w-[120px]">{doc.file_name || 'View Document'}</span>
                                    </div>
                                </div>
                                <Eye className="w-4 h-4 text-primary-500/40 group-hover:text-primary-500 transition-colors shrink-0" />
                            </button>
                        ))}

                        {Object.values(formData.documents || {}).filter(f => !!f).length === 0 &&
                            (!formData.existingDocuments || formData.existingDocuments.length === 0) && (
                                <div className="text-[10px] text-text-muted/40 font-black uppercase tracking-[0.2em] italic col-span-full py-8 text-center bg-card rounded-[2rem] border border-dashed border-border-divider/50 flex flex-col items-center gap-3">
                                    <X className="w-6 h-6 opacity-20" />
                                    No documents attached to this application
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md animate-in fade-in duration-500"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div
                        className="relative max-w-6xl w-full max-h-[90vh] bg-card border border-border-divider/50 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col scale-in-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600" />

                        <div className="flex items-center justify-between px-8 py-6 border-b border-border-divider/30 bg-muted-bg/20">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
                                    <Maximize2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-primary uppercase tracking-[0.1em] leading-tight">{previewType}</h3>
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-40 mt-1">DOCUMENT PREVIEW</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewUrl}
                                    download
                                    target="_blank"
                                    className="h-12 px-6 bg-muted-bg/40 hover:bg-muted-bg border border-border-divider/50 rounded-2xl text-text-primary transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="w-12 h-12 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl transition-all active:scale-95"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto bg-black/20 flex items-center justify-center p-12 overflow-y-auto">
                            {previewUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full min-h-[70vh] rounded-[2rem] shadow-2xl border border-border-divider/30"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="relative group/preview-img">
                                    <div className="absolute -inset-4 bg-primary-500/10 blur-3xl opacity-0 group-hover/preview-img:opacity-100 transition-opacity duration-700" />
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="relative z-10 max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl transition-all duration-700 group-hover/preview-img:scale-[1.02]"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-5 bg-muted-bg/20 border-t border-border-divider/30 text-center">
                            <p className="text-[10px] text-text-muted/40 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Press ESC or click outside to close
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem] p-8 mt-4 relative overflow-hidden group/footer shadow-lg transition-all hover:shadow-emerald-500/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                <div className="flex gap-6 items-center relative z-10">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-inner group-hover/footer:scale-110 transition-transform">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-sm font-black text-emerald-500 uppercase tracking-widest leading-none">Ready to {isEditMode ? 'Resubmit' : 'Submit'}</p>
                        <p className="text-[10px] text-text-muted/60 font-black uppercase tracking-widest italic pt-1">
                            {isEditMode ? 'Resubmission' : 'Final Submission'}
                        </p>
                        <p className="text-[9px] text-text-muted/40 font-medium leading-relaxed mt-2 max-w-xl">
                            Please review all information carefully. Once {isEditMode ? 'resubmitted' : 'submitted'}, the loan application will be
                            sent for approval.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
