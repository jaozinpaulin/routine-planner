import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ICONS, COLORS } from './BlockPickers';
import { maskTimeInput, normalizeTime } from '../utils/time';

export default function CreateBlockModal({ isOpen, onClose, onSave, dayLabel }) {
    if (!isOpen) return null;

    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('BookOpen');
    const [color, setColor] = useState('orange');
    const [start, setStart] = useState('00:00');
    const [end, setEnd] = useState('00:00');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title: title.trim(),
            icon,
            color,
            start: normalizeTime(start, '00:00'),
            end: normalizeTime(end, '00:00'),
        });

        setTitle('');
        setIcon('BookOpen');
        setColor('orange');
        setStart('00:00');
        setEnd('00:00');
        onClose();
    };

    const PreviewIcon = ICONS[icon] || ICONS.Sparkles;
    const previewTheme = COLORS[color] || COLORS.orange;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs print:hidden overflow-y-auto"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md bg-[#121214] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-3 max-h-[92dvh] overflow-y-auto my-auto"
            >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 shrink-0">
                    <div>
                        <span className="text-[10px] font-semibold text-[#d97757] uppercase tracking-wider block">
                            Nova Atividade
                        </span>
                        <h3 className="text-base font-bold text-zinc-100">
                            {dayLabel ? `Criar para ${dayLabel}` : 'Criar Bloco'}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Card de Preview */}
                <div className="relative min-h-[54px] p-2.5 flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shrink-0">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <PreviewIcon
                            strokeWidth={1.75}
                            className={`w-6 h-6 ${previewTheme.icon}`}
                        />
                    </div>
                    <div className="flex items-center gap-1.5 relative z-10">
                        <span className={`w-2 h-2 rounded-full ${previewTheme.dot}`} />
                        <span className="text-[11px] font-mono text-zinc-400">
                            {start || '00:00'} - {end || '00:00'}
                        </span>
                    </div>
                    <span className="relative z-10 text-xs font-semibold pr-10 truncate text-zinc-100">
                        {title.trim() || 'Nome da atividade'}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 pt-0.5">
                    <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Nome da atividade
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Treino, Faculdade, Leitura..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl px-3.5 py-2 text-sm text-zinc-100 outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div>
                            <label className="block text-xs font-medium text-zinc-300 mb-1 text-center">
                                Início
                            </label>
                            <input
                                type="tel"
                                maxLength={5}
                                placeholder="00:00"
                                value={start}
                                onChange={(e) => setStart(maskTimeInput(e.target.value))}
                                onBlur={(e) => setStart(normalizeTime(e.target.value, '00:00'))}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl px-3 py-2 text-sm font-mono text-center text-zinc-100 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-300 mb-1 text-center">
                                Fim
                            </label>
                            <input
                                type="tel"
                                maxLength={5}
                                placeholder="00:00"
                                value={end}
                                onChange={(e) => setEnd(maskTimeInput(e.target.value))}
                                onBlur={(e) => setEnd(normalizeTime(e.target.value, '00:00'))}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl px-3 py-2 text-sm font-mono text-center text-zinc-100 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Ícone
                        </label>
                        <div className="grid grid-cols-8 gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-xl max-h-20 overflow-y-auto scrollbar-none">
                            {Object.entries(ICONS).map(([key, IconC]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setIcon(key)}
                                    className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${icon === key
                                        ? 'bg-zinc-800 text-[#d97757] ring-1 ring-[#d97757]/60'
                                        : 'text-zinc-500 hover:text-zinc-200'
                                        }`}
                                >
                                    <IconC strokeWidth={2} className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                            Cor
                        </label>
                        <div className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                            {Object.entries(COLORS).map(([key, val]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setColor(key)}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${val.dot} ${color === key
                                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-950'
                                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                                        }`}
                                >
                                    {color === key && <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-[#d97757] hover:bg-[#c66a4c] text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer flex items-center gap-1.5"
                        >
                            <Check className="w-4 h-4" />
                            Salvar Atividade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}