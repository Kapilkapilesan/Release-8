'use client';

import { useState } from 'react';
import { CreditCard, ChevronDown, DollarSign, HandCoins, TrendingUp, LayoutList, Calendar } from 'lucide-react';
import { LoanFormData } from '@/types/loan.types';
import { LoanProduct } from '@/types/loan-product.types';
import { SRI_LANKAN_BANKS, BANK_VALIDATION_RULES } from '@/constants/loan.constants';
import { colors } from '@/themes/colors';

interface LoanDetailsProps {
    formData: LoanFormData;
    loanProducts: LoanProduct[];
    onFieldChange: (field: keyof LoanFormData, value: string) => void;
    customerActiveLoans?: number[];
    isEditMode?: boolean;
}

export const LoanDetails: React.FC<LoanDetailsProps> = ({ formData, loanProducts, onFieldChange, customerActiveLoans = [], isEditMode = false }) => {
    const selectedProduct = loanProducts.find(p => p.id === Number(formData.loanProduct));
    const isAlreadyTaken = customerActiveLoans.includes(Number(formData.loanProduct));

    const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
    const [accountMismatch, setAccountMismatch] = useState(false);

    const handleConfirmChange = (val: string) => {
        setConfirmAccountNumber(val);
        setAccountMismatch(val !== formData.accountNumber);
    };

    const getAccountValidationError = () => {
        if (!formData.bankName || !formData.accountNumber) return null;
        const rule = BANK_VALIDATION_RULES[formData.bankName] || BANK_VALIDATION_RULES['Default'];
        if (!rule.regex.test(formData.accountNumber)) {
            return rule.error;
        }
        return null;
    };

    const accountError = getAccountValidationError();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Loan Details</h2>
            </div>

            <div className="grid grid-cols-2 gap-8 bg-muted-bg/20 dark:bg-muted-bg/10 rounded-[2rem] border border-border-default p-8 transition-colors">
                <div className="col-span-2 space-y-3">
                    <label className="flex items-center gap-2.5 text-[11px] font-black text-text-muted uppercase tracking-[0.2em] px-1">
                        <CreditCard className="w-4 h-4 text-primary-500" />
                        Loan Product *
                    </label>
                    <div className="relative group/select">
                        <select
                            value={formData.loanProduct}
                            onChange={(e) => onFieldChange('loanProduct', e.target.value)}
                            className={`w-full pl-6 pr-12 py-4 bg-input border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-black tracking-tight appearance-none cursor-pointer uppercase ${formData.loanProduct ? 'border-primary-500/30 text-text-primary' : 'border-border-divider text-text-muted'}`}
                            style={{
                                '--tw-ring-color': `${colors.primary[500]}1A`
                            } as any}
                        >
                            <option value="" className="bg-card">Select a product</option>
                            {loanProducts.map((product) => (
                                <option key={product.id} value={product.id} className="bg-card">
                                    {product.product_name} {customerActiveLoans.includes(product.id) && !isEditMode ? '(ACTIVE)' : ''}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-text-muted group-focus-within/select:text-primary-500 transition-colors">
                            <ChevronDown className="w-5 h-5" />
                        </div>
                    </div>
                    {isAlreadyTaken && selectedProduct && !isEditMode && (
                        <div className="mt-4 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-pulse">
                            <div className="w-2 h-2 bg-rose-500 rounded-full" />
                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                Active {selectedProduct.product_name} loan detected
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2.5 text-[11px] font-black text-text-muted uppercase tracking-widest px-1">
                        <DollarSign className="w-3.5 h-3.5 text-primary-500" />
                        Requested Amount (LKR) *
                    </label>
                    <div className="space-y-2">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted/40 group-focus-within:text-primary-500 font-black text-sm transition-colors">LKR</div>
                            <input
                                type="number"
                                value={formData.requestedAmount}
                                onChange={(e) => onFieldChange('requestedAmount', e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-input border-2 border-border-divider/50 rounded-2xl focus:outline-none focus:ring-4 transition-all text-base font-black tracking-tight text-text-primary placeholder:text-text-muted/20"
                                style={{ '--tw-ring-color': `${colors.primary[500]}1A` } as any}
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-[10px] text-text-muted/60 mt-1 px-2 font-black uppercase tracking-widest italic opacity-40">
                            Limit: LKR {(selectedProduct?.loan_amount || 0).toLocaleString()} - {(selectedProduct?.loan_limited_amount || 500000).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2.5 text-[11px] font-black text-text-muted uppercase tracking-widest px-1">
                        <HandCoins className="w-3.5 h-3.5 text-emerald-500" />
                        Approved Amount *
                    </label>
                    <div className="space-y-2">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-text-muted/40 group-focus-within:text-emerald-500 font-black text-sm transition-colors">LKR</div>
                            <input
                                type="number"
                                value={formData.loanAmount}
                                onChange={(e) => onFieldChange('loanAmount', e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-input border-2 border-border-divider/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-base font-black tracking-tight text-text-primary placeholder:text-text-muted/20"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-[10px] text-text-muted/60 mt-1 px-2 font-black uppercase tracking-widest italic opacity-40">
                            Max Limit: LKR {(selectedProduct?.loan_limited_amount || 500000).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2.5 text-[11px] font-black text-text-muted uppercase tracking-widest px-1">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                        Interest Rate (%) *
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            value={formData.interestRate}
                            readOnly
                            className="w-full px-6 py-4 bg-muted-bg/40 border-2 border-border-divider/50 rounded-2xl text-base font-black text-text-muted/60 cursor-not-allowed shadow-inner"
                        />
                        <p className="text-[9px] mt-2 px-2 font-black uppercase tracking-widest italic text-primary-500 opacity-60">
                            {selectedProduct?.product_terms && selectedProduct.product_terms.length > 0 ? 'Linked to selected term' : 'Locked: Loan product default'}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2.5 text-[11px] font-black text-text-muted uppercase tracking-widest px-1">
                        <LayoutList className="w-3.5 h-3.5 text-primary-500" />
                        Rental Type *
                    </label>
                    <div className="relative group/select">
                        {selectedProduct?.product_terms && selectedProduct.product_terms.length > 0 ? (
                            <select
                                value={formData.interestRate}
                                onChange={(e) => {
                                    const rate = e.target.value;
                                    onFieldChange('interestRate', rate);
                                    // Hidden update: Map to a valid backend frequency
                                    if (selectedProduct?.term_type?.toLowerCase().includes('month')) {
                                        onFieldChange('rentalType', 'Monthly');
                                    } else {
                                        onFieldChange('rentalType', 'Weekly');
                                    }
                                }}
                                className={`w-full pl-6 pr-12 py-4 bg-input border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-black tracking-tight appearance-none cursor-pointer uppercase ${formData.rentalType ? 'border-primary-500/30 text-text-primary' : 'border-border-divider text-text-muted'}`}
                                style={{ '--tw-ring-color': `${colors.primary[500]}1A` } as any}
                            >
                                <option value="" className="bg-card">Select Term</option>
                                {selectedProduct.product_terms.map((term, idx) => (
                                    <option key={idx} value={term.interest_rate} className="bg-card">
                                        {term.term} {selectedProduct.term_type || 'Months'}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={formData.rentalType}
                                readOnly
                                className="w-full px-6 py-4 bg-muted-bg/40 border-2 border-border-divider/50 rounded-2xl text-base font-black text-text-muted/60 cursor-not-allowed shadow-inner"
                            />
                        )}
                        <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-text-muted/40 group-focus-within/select:text-primary-500 transition-colors">
                            <ChevronDown className="w-5 h-5" />
                        </div>
                    </div>
                    {selectedProduct?.product_terms && selectedProduct.product_terms.length > 0 && (
                        <p className="text-[9px] text-primary-500 mt-2 px-2 font-black uppercase tracking-widest italic opacity-60">
                            Select term to set interest rate
                        </p>
                    )}
                </div>

                <div className="col-span-2 md:col-span-1 space-y-3">
                    <label className="flex items-center gap-2.5 text-[11px] font-black text-text-muted uppercase tracking-widest px-1">
                        <Calendar className="w-3.5 h-3.5 text-primary-500" />
                        Tenure (Weeks) *
                    </label>
                    <div className="relative group/select">
                        <select
                            value={formData.tenure}
                            onChange={(e) => onFieldChange('tenure', e.target.value)}
                            className={`w-full pl-6 pr-12 py-4 bg-input border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-black tracking-tight appearance-none cursor-pointer uppercase ${formData.tenure ? 'border-primary-500/30 text-text-primary' : 'border-border-divider text-text-muted'}`}
                            style={{ '--tw-ring-color': `${colors.primary[500]}1A` } as any}
                        >
                            <option value="" className="bg-card">Select Tenure</option>
                            <option value="48" className="bg-card">48 Weeks</option>
                            <option value="72" className="bg-card">72 Weeks</option>
                        </select>
                        <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-text-muted/40 group-focus-within/select:text-primary-500 transition-colors">
                            <ChevronDown className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="col-span-2 flex items-center justify-center pt-8 border-t border-dashed border-border-divider/50">
                    <button
                        type="button"
                        onClick={() => {
                            const amount = Number(formData.loanAmount);
                            const interest = Number(formData.interestRate);
                            const tenure = Number(formData.tenure);
                            if (amount && interest && tenure) {
                                const total = amount + (amount * (interest / 100));
                                const rental = (total / tenure).toFixed(2);
                                onFieldChange('calculated_rental', rental);
                            }
                        }}
                        className={`group relative flex items-center gap-3 px-10 py-4 text-white rounded-[2rem] transition-all transform hover:-translate-y-1 active:scale-95 font-black uppercase tracking-[0.2em] text-[11px] overflow-hidden ${!formData.calculated_rental && formData.loanAmount && formData.tenure && formData.interestRate ? 'ring-4 ring-primary-500/20' : ''}`}
                        style={{ backgroundColor: colors.primary[600], boxShadow: `0 20px 40px -12px ${colors.primary[600]}66` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        <TrendingUp className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">
                            {formData.calculated_rental ? 'Recalculate Rental' : 'Calculate Rental'}
                        </span>
                    </button>
                </div>

                {formData.calculated_rental && (
                    <div className="col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div
                            className="p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group/rental transition-all hover:shadow-primary-500/20"
                            style={{ backgroundImage: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[800]})`, boxShadow: `0 30px 60px -12px ${colors.primary[600]}4D` } as any}
                        >
                            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl transition-transform duration-1000 group-hover/rental:scale-150" />
                            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl transition-transform duration-1000 group-hover/rental:scale-150" />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-3 ml-1">Weekly Rental</p>
                                    <h3 className="text-5xl font-black tabular-nums tracking-tighter">
                                        <span className="text-2xl opacity-60 mr-2">LKR</span>
                                        {Number(formData.calculated_rental).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40 italic">Calculated amount per week</p>
                                </div>
                                <div className="text-center md:text-right bg-black/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Total Payable</p>
                                    <p className="text-2xl font-black tabular-nums tracking-tight">
                                        LKR {(Number(formData.loanAmount) + (Number(formData.loanAmount) * (Number(formData.interestRate) / 100))).toLocaleString()}
                                    </p>
                                    <div className="h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                                        <div className="h-full bg-emerald-400 w-full animate-progress-dna shadow-[0_0_10px_#10b981]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-10 border-t border-border-divider/30">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                    <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Bank Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-8 bg-muted-bg/20 dark:bg-muted-bg/5 p-8 rounded-[2rem] border border-border-divider/50 shadow-inner">
                    <div className="col-span-2 md:col-span-1 space-y-3">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">
                            Bank Name *
                        </label>
                        <div className="relative group/select">
                            <select
                                value={formData.bankName}
                                onChange={(e) => onFieldChange('bankName', e.target.value)}
                                className="w-full pl-6 pr-12 py-4 bg-input border-2 border-border-divider/50 rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-black tracking-tight text-text-primary appearance-none cursor-pointer uppercase"
                                style={{ '--tw-ring-color': `${colors.primary[500]}1A` } as any}
                            >
                                <option value="" className="bg-card">Select Bank</option>
                                {SRI_LANKAN_BANKS.map((bank) => (
                                    <option key={bank} value={bank} className="bg-card">
                                        {bank}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-text-muted/40 group-focus-within/select:text-primary-500 transition-colors">
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 space-y-3">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">
                            Bank Branch *
                        </label>
                        <input
                            type="text"
                            value={formData.bankBranch || ''}
                            onChange={(e) => onFieldChange('bankBranch', e.target.value)}
                            className="w-full px-6 py-4 bg-input border-2 border-border-divider/50 rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-black tracking-tight text-text-primary placeholder:text-text-muted/20 uppercase"
                            placeholder="Enter Branch Name"
                            style={{ '--tw-ring-color': `${colors.primary[500]}1A` } as any}
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">
                            Account Number *
                        </label>
                        <input
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                onFieldChange('accountNumber', val);
                                if (confirmAccountNumber) setAccountMismatch(val !== confirmAccountNumber);
                            }}
                            onPaste={(e) => e.preventDefault()}
                            className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-black tracking-tight text-text-primary placeholder:text-text-muted/20 ${accountError ? 'border-rose-500/50 bg-rose-500/5' : 'bg-input border-border-divider/50'}`}
                            placeholder="Enter Account Number"
                            style={{ '--tw-ring-color': `${colors.primary[500]}1A` } as any}
                        />
                        {accountError && (
                            <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1.5 px-1">{accountError}</p>
                        )}
                    </div>
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">
                            Confirm Account Number *
                        </label>
                        <input
                            type="text"
                            value={confirmAccountNumber}
                            onChange={(e) => handleConfirmChange(e.target.value)}
                            onPaste={(e) => e.preventDefault()}
                            className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all text-sm font-black tracking-tight text-text-primary placeholder:text-text-muted/20 ${accountMismatch ? 'border-rose-500/50 bg-rose-500/5' : 'bg-input border-border-divider/50'}`}
                            placeholder="Confirm Account Number"
                            style={{ '--tw-ring-color': `${colors.primary[500]}1A` } as any}
                        />
                        {accountMismatch && (
                            <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1.5 px-1 animate-pulse">Account numbers do not match</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-10 border-t border-border-divider/30">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                    <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Fees & Charges</h3>
                </div>
                <div className="grid grid-cols-2 gap-8 bg-muted-bg/20 dark:bg-muted-bg/5 p-8 rounded-[2rem] border border-border-divider/50">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">
                            Processing Fee
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={Number(formData.processingFee).toLocaleString()}
                                readOnly
                                className="w-full px-6 py-4 bg-muted-bg/30 border-2 border-border-divider/50 rounded-2xl text-base font-black text-text-primary shadow-inner cursor-not-allowed"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-primary-500/10 text-primary-500 border border-primary-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                {Number(formData.tenure) === 48 ? '4%' : '6%'}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">
                            Documentation Fee (LKR)
                        </label>
                        <input
                            type="text"
                            value={formData.documentationFee}
                            readOnly
                            className="w-full px-6 py-4 bg-muted-bg/30 border-2 border-border-divider/50 rounded-2xl text-base font-black text-text-primary shadow-inner cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Reloan Summary Box */}
                {(formData.reloan_deduction_amount ?? 0) > 0 && (
                    <div className="mt-10 p-8 bg-amber-500/5 dark:bg-amber-500/10 border-2 border-amber-500/20 rounded-[2.5rem] relative overflow-hidden group/summary">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                            </div>
                            <h4 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] italic">Net Payout Summary</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center group/row">
                                <span className="text-[11px] font-black text-text-muted uppercase tracking-widest opacity-60">Loan Amount</span>
                                <span className="font-black text-text-primary text-sm tabular-nums tracking-tight transition-transform group-hover/row:translate-x-[-4px]">
                                    LKR {Number(formData.loanAmount).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group/row">
                                <span className="text-[11px] font-black text-rose-500/70 uppercase tracking-widest italic">Total Fees</span>
                                <span className="font-black text-rose-500 text-sm tabular-nums tracking-tight bg-rose-500/10 px-3 py-1 rounded-lg">
                                    - LKR {(Number(formData.processingFee) + Number(formData.documentationFee)).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center group/row">
                                <span className="text-[11px] font-black text-amber-500/70 uppercase tracking-widest italic">Reloan Deduction</span>
                                <span className="font-black text-amber-500 text-sm tabular-nums tracking-tight bg-amber-500/10 px-3 py-1 rounded-lg">
                                    - LKR {Number(formData.reloan_deduction_amount).toLocaleString()}
                                </span>
                            </div>

                            <div className="h-[2px] bg-border-divider/30 my-6 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Net Disbursable Cash</p>
                                    <p className="text-[9px] text-text-muted/40 font-black uppercase tracking-widest italic">Actual amount to be paid</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black tabular-nums tracking-tighter text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                        LKR {(Number(formData.loanAmount) - (Number(formData.processingFee) + Number(formData.documentationFee) + Number(formData.reloan_deduction_amount))).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-10 border-t border-border-divider/30">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                    <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Remarks</h3>
                </div>
                <div className="relative group/textarea">
                    <textarea
                        value={formData.remarks}
                        onChange={(e) => onFieldChange('remarks', e.target.value)}
                        rows={4}
                        className="w-full px-8 py-6 bg-input border-2 border-border-divider/50 rounded-[2rem] focus:outline-none focus:ring-4 transition-all resize-none text-base font-black tracking-tight text-text-primary placeholder:text-text-muted/20 uppercase"
                        style={{ '--tw-ring-color': `${colors.primary[500]}1A` } as any}
                        placeholder="Enter any additional remarks..."
                    />
                    <div className="absolute right-6 bottom-6 text-[10px] font-black text-text-muted/40 uppercase tracking-widest italic group-focus-within/textarea:text-primary-500 transition-colors">
                        Remarks (Optional)
                    </div>
                </div>
            </div>
        </div >
    );
};
