import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { ICONS, COLORS } from './BlockPickers';
import { maskTimeInput, normalizeTime } from '../utils/time';

export default function CreateBlockModal({ isOpen, onClose, onSave, dayLabel }) {
    if (!isOpen) return null;

    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState('BookOpen');
    const [color, setColor] = useState('orange');
    const [start, setStart] = useState('08:00');
    const [end, setEnd] = useState('09:00');

    // salva e fecha
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title: title.trim(),
            icon,
            color,
            start: normalizeTime(start, '08:00'),
            end: normalizeTime(end, '09:00'),
        });

        setTitle('');
        setIcon('BookOpen');
        setColor('orange');
        setStart('08:00');
        setEnd('09:00');
        onClose();
    };

    const PreviewIcon = ICONS[icon] || ICONS.Sparkles;
    const previewTheme = COLORS[color] || COLORS.orange;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:hidden"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#161618] border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4"
            >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div>
                        <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider block">
                            Nova Atividade
                        </span>
                        <h3 className="text-base font-bold text-zinc-100">
                            {dayLabel ? dayLabel : 'Criar Bloco'}
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

                {/* preview corrigido com background e borda suave */}
                <div
                    className={`relative min-h-[74px] p-3 flex flex-col justify-between overflow-hidden rounded-xl border transition-all ${previewTheme.bg} ${previewTheme.border}`}
                >
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <PreviewIcon
                            strokeWidth={1.5}
                            className={`w-10 h-10 ${previewTheme.icon}`}
                        />
                    </div>
                    <span className="relative z-10 text-[10px] font-mono text-zinc-400">
                        {start || '08:00'} - {end || '09:00'}
                    </span>
                    <span className={`relative z-10 text-xs font-semibold pr-10 truncate ${previewTheme.text}`}>
                        {title.trim() || 'Nome da atividade'}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                            Nome da atividade
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Aula de Banco de Dados, Almoco..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                Inicio
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={5}
                                placeholder="08:00"
                                value={start}
                                onChange={(e) => setStart(maskTimeInput(e.target.value))}
                                onBlur={(e) => setStart(normalizeTime(e.target.value, '08:00'))}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 rounded-xl px-3 py-2 text-sm font-mono text-center text-zinc-100 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                Fim
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={5}
                                placeholder="09:00"
                                value={end}
                                onChange={(e) => setEnd(maskTimeInput(e.target.value))}
                                onBlur={(e) => setEnd(normalizeTime(e.target.value, '09:00'))}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 rounded-xl px-3 py-2 text-sm font-mono text-center text-zinc-100 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                            Icone
                        </label>
                        <div className="grid grid-cols-8 gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-xl max-h-24 overflow-y-auto scrollbar-none">
                            {Object.entries(ICONS).map(([key, IconC]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setIcon(key)}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${icon === key
                                        ? 'bg-zinc-800 text-orange-400 ring-1 ring-orange-500/40'
                                        : 'text-zinc-500 hover:text-zinc-200'
                                        }`}
                                >
                                    <IconC className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                            Cor do tema
                        </label>
                        <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                            {Object.entries(COLORS).map(([key, val]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setColor(key)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${val.dot} ${color === key
                                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-zinc-950'
                                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                                        }`}
                                >
                                    {color === key && <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-md active:scale-95 cursor-pointer"
                        >
                            Salvar Atividade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}