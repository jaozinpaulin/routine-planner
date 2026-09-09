import { Download } from 'lucide-react';

export default function Header({ daysCount, onDaysCountChange, onPrint }) {
    return (
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1 border-b border-zinc-800/60 print:hidden">
            <div>
                <h1 className="text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                    Rotina Semanal
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d97757]" />
                </h1>
                <p className="text-xs text-zinc-400">
                    Organização diária de tarefas e hábitos
                </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
                    <button
                        type="button"
                        onClick={() => onDaysCountChange(5)}
                        className={`px-3 py-1 rounded-md font-medium transition-colors ${daysCount === 5
                            ? 'bg-zinc-800 text-zinc-100'
                            : 'text-zinc-400 hover:text-zinc-200'
                            }`}>
                        5 Dias
                    </button>
                    <button
                        type="button"
                        onClick={() => onDaysCountChange(7)}
                        className={`px-3 py-1 rounded-md font-medium transition-colors ${daysCount === 7
                            ? 'bg-zinc-800 text-zinc-100'
                            : 'text-zinc-400 hover:text-zinc-200'
                            }`}>
                        7 Dias
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onPrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#d97757] hover:bg-[#c66a4c] text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                </button>
            </div>
        </header>
    );
}