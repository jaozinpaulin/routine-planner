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
        dot: 'bg-emerald-500',
        bg: 'bg-zinc-900/80 hover:bg-zinc-900',
        border: 'border-zinc-800/80 hover:border-zinc-700',
        icon: 'text-emerald-500',
        text: 'text-zinc-200',
        btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
    },
    amber: {
        dot: 'bg-amber-500',
        bg: 'bg-zinc-900/80 hover:bg-zinc-900',
        border: 'border-zinc-800/80 hover:border-zinc-700',
        icon: 'text-amber-500',
        text: 'text-zinc-200',
        btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
    },
    orange: {
        dot: 'bg-[#d97757]',
        bg: 'bg-zinc-900/80 hover:bg-zinc-900',
        border: 'border-zinc-800/80 hover:border-zinc-700',
        icon: 'text-[#d97757]',
        text: 'text-zinc-200',
        btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
    },
    teal: {
        dot: 'bg-teal-500',
        bg: 'bg-zinc-900/80 hover:bg-zinc-900',
        border: 'border-zinc-800/80 hover:border-zinc-700',
        icon: 'text-teal-500',
        text: 'text-zinc-200',
        btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
    },
    cyan: {
        dot: 'bg-cyan-500',
        bg: 'bg-zinc-900/80 hover:bg-zinc-900',
        border: 'border-zinc-800/80 hover:border-zinc-700',
        icon: 'text-cyan-500',
        text: 'text-zinc-200',
        btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
    },
    indigo: {
        dot: 'bg-indigo-500',
        bg: 'bg-zinc-900/80 hover:bg-zinc-900',
        border: 'border-zinc-800/80 hover:border-zinc-700',
        icon: 'text-indigo-500',
        text: 'text-zinc-200',
        btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
    },
    violet: {
        dot: 'bg-violet-500',
        bg: 'bg-zinc-900/80 hover:bg-zinc-900',
        border: 'border-zinc-800/80 hover:border-zinc-700',
        icon: 'text-violet-500',
        text: 'text-zinc-200',
        btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
    },
    rose: {
        dot: 'bg-rose-500',
        bg: 'bg-zinc-900/80 hover:bg-zinc-900',
        border: 'border-zinc-800/80 hover:border-zinc-700',
        icon: 'text-rose-500',
        text: 'text-zinc-200',
        btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700',
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
    const [start, setStart] = useState('00:00');
    const [end, setEnd] = useState('00:00');
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
        setStart('00:00');
        setEnd('00:00');
    };

    const handleConfirm = (e) => {
        e.preventDefault();
        if (!title.trim() || !editingItem) return;

        onSelectBlock && onSelectBlock({
            ...editingItem,
            title: title.trim(),
            start: normalizeTime(start, '00:00'),
            end: normalizeTime(end, '00:00'),
        });

        setEditingItem(null);
    };

    const startDrag = (e, item) => {
        const theme = COLORS[item.color] || COLORS.orange;
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'picker-block', item: { ...item, start: '00:00', end: '00:00', theme } }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const activeTheme = editingItem ? (COLORS[editingItem.color] || COLORS.orange) : COLORS.orange;
    const ActiveIcon = editingItem ? (ICONS[editingItem.icon] || ICONS.Sparkles) : null;

    return (
        <section className="bg-zinc-900/40 border border-zinc-800/60 p-3 sm:p-4 rounded-2xl mb-4 sm:mb-6 print:hidden relative">
            <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-zinc-300">
                    Blocos rápidos
                </span>
                <span className="text-[11px] text-zinc-400">
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
                            className={`group relative p-2.5 sm:p-3 flex items-center justify-between overflow-hidden rounded-xl border transition-colors cursor-pointer select-none ${theme.bg}${theme.border}`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <IconComp
                                    strokeWidth={1.8}
                                    className={`w-4 h-4 shrink-0 ${theme.icon}`}
                                />
                                <span className="text-xs font-medium leading-tight truncate text-zinc-200 group-hover:text-white">
                                    {item.title}
                                </span>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0 ml-1" />
                        </div>
                    );
                })}
            </div>

            {/* Modal com posição fixa no terço superior para evitar trepidação com o teclado virtual */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex justify-center p-4">
                    <div
                        ref={modalRef}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed top-[12%] sm:top-1/2 sm:-translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-[#141416] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                                    {ActiveIcon && <ActiveIcon strokeWidth={1.8} className={`w-4 h-4 ${activeTheme.icon}`} />}
                                </div>
                                <div>
                                    <span className="text-[10px] font-semibold text-[#d97757] uppercase tracking-wider block">
                                        Novo Bloco {activeDayLabel ? `• ${activeDayLabel}` : ''}
                                    </span>
                                    <h4 className="text-sm font-semibold text-zinc-100">
                                        Definir Atividade
                                    </h4>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirm} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                                    Nome da Atividade
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 outline-none"
                                    placeholder="Ex: Treino, Estudo..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 text-center">
                                        Início
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={5}
                                        value={start}
                                        onChange={(e) => setStart(maskTimeInput(e.target.value))}
                                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl py-2.5 text-base font-mono text-center text-zinc-100 outline-none"
                                        placeholder="00:00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 text-center">
                                        Fim
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={5}
                                        value={end}
                                        onChange={(e) => setEnd(maskTimeInput(e.target.value))}
                                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl py-2.5 text-base font-mono text-center text-zinc-100 outline-none"
                                        placeholder="00:00"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 py-2.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-xl cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-[#d97757] hover:bg-[#c66a4c] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                    <Check className="w-4 h-4" />
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