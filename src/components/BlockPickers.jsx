import { useState, useRef, useEffect } from 'react';
import {
    Bus, GraduationCap, Utensils, Briefcase, Moon, Dumbbell, BookOpen, Coffee, Gamepad2, Sparkles, Laptop, Bike, Music, Flame, Smile, Clock, Plus, X, Check,
} from 'lucide-react';
import { maskTimeInput, normalizeTime } from '../utils/time';

export const ICONS = {
    Bus, GraduationCap, BookOpen, Briefcase, Laptop, Utensils, Coffee, Dumbbell, Bike, Moon, Sparkles, Flame, Gamepad2, Music, Clock, Smile,
};

export const COLORS = {
    emerald: {
        dot: 'bg-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30 hover:border-emerald-500/50',
        icon: 'text-emerald-400',
        text: 'text-emerald-100',
        btn: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-500/40',
    },
    amber: {
        dot: 'bg-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30 hover:border-amber-500/50',
        icon: 'text-amber-400',
        text: 'text-amber-100',
        btn: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40',
    },
    orange: {
        dot: 'bg-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30 hover:border-orange-500/50',
        icon: 'text-orange-400',
        text: 'text-orange-100',
        btn: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border-orange-500/40',
    },
    teal: {
        dot: 'bg-teal-400',
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/30 hover:border-teal-500/50',
        icon: 'text-teal-400',
        text: 'text-teal-100',
        btn: 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border-teal-500/40',
    },
    cyan: {
        dot: 'bg-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30 hover:border-cyan-500/50',
        icon: 'text-cyan-400',
        text: 'text-cyan-100',
        btn: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-500/40',
    },
    indigo: {
        dot: 'bg-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30 hover:border-indigo-500/50',
        icon: 'text-indigo-400',
        text: 'text-indigo-100',
        btn: 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border-indigo-500/40',
    },
    violet: {
        dot: 'bg-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/30 hover:border-violet-500/50',
        icon: 'text-violet-400',
        text: 'text-violet-100',
        btn: 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 border-violet-500/40',
    },
    rose: {
        dot: 'bg-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30 hover:border-rose-500/50',
        icon: 'text-rose-400',
        text: 'text-rose-100',
        btn: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-500/40',
    },
};

const INITIAL_ITEMS = [
    { id: 'sono', title: 'Descanso / Sono', icon: 'Moon', color: 'violet' },
    { id: 'refeicao', title: 'Almoço / Janta', icon: 'Utensils', color: 'amber' },
    { id: 'trajeto', title: 'Trajeto / Ônibus', icon: 'Bus', color: 'emerald' },
    { id: 'aula', title: 'Aula / Faculdade', icon: 'GraduationCap', color: 'orange' },
    { id: 'trabalho', title: 'Trabalho / Empresa', icon: 'Briefcase', color: 'indigo' },
    { id: 'estudo', title: 'Estudo / Foco', icon: 'BookOpen', color: 'cyan' },
    { id: 'pausa', title: 'Pausa / Café', icon: 'Coffee', color: 'rose' },
    { id: 'treino', title: 'Treino / Academia', icon: 'Dumbbell', color: 'teal' },
    { id: 'tarefas', title: 'Organização / Casa', icon: 'Sparkles', color: 'amber' },
    { id: 'leitura', title: 'Leitura / Estudo', icon: 'Laptop', color: 'indigo' },
    { id: 'pedal', title: 'Caminhada / Pedal', icon: 'Bike', color: 'emerald' },
    { id: 'social', title: 'Social / Amigos', icon: 'Smile', color: 'orange' },
    { id: 'lazer', title: 'Lazer / Games', icon: 'Gamepad2', color: 'rose' },
    { id: 'musica', title: 'Relaxar / Música', icon: 'Music', color: 'violet' },
];

export default function BlockPickers({ onSelectBlock, activeDayLabel }) {
    const [editingItem, setEditingItem] = useState(null);
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('08:00');
    const [end, setEnd] = useState('09:00');
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setEditingItem(null);
            }
        };
        if (editingItem) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editingItem]);

    const handleCardClick = (item) => {
        setEditingItem(item);
        setTitle(item.title);
        setStart('08:00');
        setEnd('09:00');
    };

    const handleConfirm = (e) => {
        e.preventDefault();
        if (!title.trim() || !editingItem) return;

        onSelectBlock && onSelectBlock({
            ...editingItem,
            title: title.trim(),
            start: normalizeTime(start, '08:00'),
            end: normalizeTime(end, '09:00'),
        });

        setEditingItem(null);
    };

    const startDrag = (e, item) => {
        const theme = COLORS[item.color] || COLORS.orange;
        e.dataTransfer.setData('application/json', JSON.stringify({ ...item, theme }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const activeTheme = editingItem ? (COLORS[editingItem.color] || COLORS.orange) : COLORS.orange;
    const ActiveIcon = editingItem ? (ICONS[editingItem.icon] || ICONS.Sparkles) : null;

    return (
        <section className="bg-zinc-900/40 border border-zinc-800/70 p-3 sm:p-4 rounded-2xl mb-4 sm:mb-6 print:hidden relative">
            <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-xs font-semibold text-zinc-300">
                    Blocos rápidos
                </span>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                    Arraste ou clique para ajustar e adicionar {activeDayLabel ? `em ${activeDayLabel}` : ''}
                </span>
                <span className="text-[11px] text-orange-400/90 sm:hidden">
                    Toque para adicionar {activeDayLabel ? `em ${activeDayLabel}` : ''}
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {INITIAL_ITEMS.map((item) => {
                    const IconComp = ICONS[item.icon] || ICONS.Sparkles;
                    const theme = COLORS[item.color] || COLORS.orange;

                    return (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => startDrag(e, item)}
                            onClick={() => handleCardClick(item)}
                            className={`group relative p-2.5 flex items-center justify-between overflow-hidden rounded-xl border transition-all cursor-pointer active:scale-95 sm:hover:scale-[1.02] select-none ${theme.bg} ${theme.border}`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <IconComp
                                    strokeWidth={1.7}
                                    className={`w-4 h-4 shrink-0 ${theme.icon}`}
                                />
                                <span className={`text-[11px] font-semibold leading-tight truncate ${theme.text}`}>
                                    {item.title}
                                </span>
                            </div>

                            <Plus className="w-3.5 h-3.5 text-zinc-500 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                        </div>
                    );
                })}
            </div>

            {/* Card de Configuração Rápida */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs">
                    <div
                        ref={modalRef}
                        className="w-full sm:max-w-sm bg-[#161618] border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-xl border ${activeTheme.bg} ${activeTheme.border}`}>
                                    {ActiveIcon && <ActiveIcon className={`w-4 h-4 ${activeTheme.icon}`} />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider block">
                                        Adicionar Bloco {activeDayLabel ? `• ${activeDayLabel}` : ''}
                                    </span>
                                    <h4 className="text-sm font-bold text-zinc-100">
                                        Configurar Atividade
                                    </h4>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirm} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                                    Nome da Atividade
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-100 outline-none transition-colors"
                                    placeholder="Ex: Treino, Estudo..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1 text-center">
                                        Início
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={5}
                                        value={start}
                                        onChange={(e) => setStart(maskTimeInput(e.target.value))}
                                        onBlur={(e) => setStart(normalizeTime(e.target.value, '08:00'))}
                                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 rounded-xl py-2 text-sm font-mono text-center text-zinc-100 outline-none"
                                        placeholder="08:00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1 text-center">
                                        Fim
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={5}
                                        value={end}
                                        onChange={(e) => setEnd(maskTimeInput(e.target.value))}
                                        onBlur={(e) => setEnd(normalizeTime(e.target.value, '09:00'))}
                                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-orange-500/70 rounded-xl py-2 text-sm font-mono text-center text-zinc-100 outline-none"
                                        placeholder="09:00"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1.5">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    Adicionar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}