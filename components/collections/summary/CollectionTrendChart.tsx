import { colors } from '@/themes/colors';
import { TrendingUp } from 'lucide-react';

export function CollectionTrendChart() {
    return (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border-default">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-black text-text-primary tracking-tight">Collection Trend</h3>
                    <p className="text-xs text-text-muted font-medium mt-0.5">Historical visualization of collections over time</p>
                </div>
                <span className="px-3 py-1 bg-muted-bg border border-border-default rounded-lg text-xs font-bold text-text-muted">Last 7 Days</span>
            </div>

            <div className="h-64 flex items-center justify-center bg-muted-bg/30 rounded-2xl border-2 border-dashed border-border-default transition-all hover:bg-muted-bg/50">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3" style={{ backgroundColor: `${colors.primary[500]}1a`, color: colors.primary[600], border: `1px solid ${colors.primary[600]}30` }}>
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <p className="text-text-primary font-black uppercase tracking-widest text-sm">Trend Visualization</p>
                    <p className="text-text-muted text-xs font-bold mt-2 uppercase tracking-tight">
                        Historical data mapping will appear here
                    </p>
                </div>
            </div>
        </div>
    );
}
