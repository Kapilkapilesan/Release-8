'use client';

import React from 'react';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { colors } from '@/themes/colors';

interface StepNavigationProps {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrevious: () => void;
    onSubmit?: () => void;
    isNextDisabled?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
    currentStep,
    totalSteps,
    onNext,
    onPrevious,
    onSubmit,
    isNextDisabled = false,
}) => {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="flex items-center justify-between bg-card/50 dark:bg-muted-bg/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-border-divider/30 shadow-2xl transition-all mt-8">
            <button
                onClick={onPrevious}
                disabled={isFirstStep}
                className="group flex items-center gap-3 px-8 py-3.5 bg-muted-bg/20 hover:bg-muted-bg border border-border-divider/50 rounded-2xl text-text-muted font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
            >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span>Previous</span>
            </button>

            <div className="hidden lg:flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.3em]">Execution Phase</span>
                </div>
                <div className="text-[14px] font-black text-primary-500 uppercase tracking-[0.4em] opacity-40">
                    S-0{currentStep} / S-0{totalSteps}
                </div>
            </div>

            {!isLastStep ? (
                <button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className="group flex items-center gap-3 px-10 py-3.5 text-white rounded-2xl transition-all disabled:bg-muted-bg/20 disabled:text-text-muted/30 disabled:border-transparent active:scale-95 shadow-2xl shadow-primary-500/20"
                    style={!isNextDisabled ? {
                        background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
                    } : {}}
                >
                    <span className="text-[11px] font-black uppercase tracking-widest">Execute Next</span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
            ) : (
                <button
                    onClick={onSubmit}
                    className="group flex items-center gap-3 px-10 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 border border-emerald-400/20"
                >
                    <CheckCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Final Commit</span>
                </button>
            )}
        </div>
    );
};
