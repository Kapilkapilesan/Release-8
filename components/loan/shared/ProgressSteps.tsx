'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { LoanStep } from '@/types/loan.types';
import { colors } from '@/themes/colors';

interface ProgressStepsProps {
    steps: LoanStep[];
    currentStep: number;
    onStepClick?: (stepNumber: number) => void;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep, onStepClick }) => {
    return (
        <div className="bg-card/50 dark:bg-muted-bg/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-border-divider/30 shadow-2xl transition-all hover:shadow-primary-500/5">
            <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
                {steps.map((step, index) => {
                    const isClickable = !!onStepClick;
                    const isActive = currentStep >= step.number;
                    const isCurrent = currentStep === step.number;
                    const isCompleted = currentStep > step.number;

                    return (
                        <React.Fragment key={step.number}>
                            <div
                                className={`flex items-center gap-5 transition-all duration-500 ${isClickable ? 'cursor-pointer' : ''} ${isCurrent ? 'scale-105' : 'opacity-80 hover:opacity-100'}`}
                                onClick={() => isClickable && onStepClick(step.number)}
                            >
                                <div
                                    className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${isActive
                                        ? 'text-white shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                                        : 'bg-muted-bg/50 dark:bg-white/5 text-text-muted border border-border-divider/30'
                                        } ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}`}
                                    style={isActive ? {
                                        background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
                                        boxShadow: isCurrent ? `0 15px 30px -10px ${colors.primary[600]}80` : `0 10px 20px -10px ${colors.primary[600]}60`,
                                    } : {}}
                                >
                                    {isCompleted ? (
                                        <CheckCircle className="w-7 h-7 animate-in zoom-in duration-500" />
                                    ) : (
                                        <div className={`transition-all duration-500 ${isCurrent ? 'scale-110' : ''}`}>
                                            {React.isValidElement(step.icon) ? (
                                                React.cloneElement(step.icon as React.ReactElement<any>, {
                                                    className: `w-6 h-6 ${isActive ? 'text-white' : 'text-text-muted/40'}`,
                                                    style: { color: 'inherit' }
                                                })
                                            ) : (
                                                step.icon
                                            )}
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card shadow-lg animate-pulse" />
                                    )}
                                </div>
                                <div className="hidden xl:flex flex-col gap-1">
                                    <p
                                        className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isCurrent ? 'text-primary-500' : 'text-text-primary'
                                            }`}
                                    >
                                        {step.title}
                                    </p>
                                    <p className="text-[9px] font-black transition-all duration-500 uppercase tracking-widest text-text-muted opacity-40 leading-none">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="flex-1 min-w-[30px] h-px relative overflow-hidden bg-border-divider/20 rounded-full">
                                    <div
                                        className="absolute inset-0 transition-all duration-1000 ease-in-out"
                                        style={{
                                            background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.primary[300]})`,
                                            width: isCompleted ? '100%' : '0%',
                                            boxShadow: isCompleted ? `0 0 10px ${colors.primary[500]}` : 'none'
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};
