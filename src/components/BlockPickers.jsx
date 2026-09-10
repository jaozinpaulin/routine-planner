import { useState, useRef, useEffect } from 'react';
import {
    Bus, GraduationCap, Utensils, Briefcase, Moon, Dumbbell, BookOpen, Coffee, Gamepad2, Sparkles, Laptop, Bike, Music, Flame, Smile, Clock, Plus, X, Check,
} from 'lucide-react';
import { maskTimeInput, normalizeTime } from '../utils/time';

export const ICONS = {
    Bus, GraduationCap, BookOpen, Briefcase, Laptop, Utensils, Coffee, Dumbbell, Bike, Moon, Sparkles, Flame, Gamepad2, Music, Clock, Smile,
};

export const COLORS = {
    emerald: { dot: 'bg-emerald-500', bg: 'bg-zinc-900/80 hover:bg-zinc-900', border: 'border-zinc-800/80 hover:border-zinc-700', icon: 'text-emerald-500' },
    amber: { dot: 'bg-amber-500', bg: 'bg-zinc-900/80 hover:bg-zinc-900', border: 'border-zinc-800/80 hover:border-zinc-700', icon: 'text-amber-500' },
    orange: { dot: 'bg-[#d97757]', bg: 'bg-zinc-900/80 hover:bg-zinc-900', border: 'border-zinc-800/80 hover:border-zinc-700', icon: 'text-[#d97757]' },
    teal: { dot: 'bg-teal-500', bg: 'bg-zinc-900/80 hover:bg-zinc-900', border: 'border-zinc-800/80 hover:border-zinc-700', icon: 'text-teal-500' },
    cyan: { dot: 'bg-cyan-500', bg: 'bg-zinc-900/80 hover:bg-zinc-900', border: 'border-zinc-800/80 hover:border-zinc-700', icon: 'text-cyan-500' },
    indigo: { dot: 'bg-indigo-500', bg: 'bg-zinc-900/80 hover:bg-zinc-900', border: 'border-zinc-800/80 hover:border-zinc-700', icon: 'text-indigo-500' },
    violet: { dot: 'bg-violet-500', bg: 'bg-zinc-900/80 hover:bg-zinc-900', border: 'border-zinc-800/80 hover:border-zinc-700', icon: 'text-violet-500' },
    rose: { dot: 'bg-rose-500', bg: 'bg-zinc-900/80 hover:bg-zinc-900', border: 'border-zinc-800/80 hover:border-zinc-700', icon: 'text-rose-500' },
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

const DAYS_LIST = [
    { key: 'seg', label: 'Segunda' },
    { key: 'ter', label: 'Terça' },
    { key: 'qua', label: 'Quarta' },
    { key: 'qui', label: 'Quinta' },
    { key: 'sex', label: 'Sexta' },
    { key: 'sab', label: 'Sábado' },
    { key: 'dom', label: 'Domingo' },
];

export default function BlockPickers({ onSelectBlock, activeDayKey, onSelectDay, activeDayLabel, daysCount = 5 }) {
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

    const activeTheme = editingItem ? (COLORS[editingItem.color] || COLORS.orange) : COLORS.orange;
    const ActiveIcon = editingItem ? (ICONS[editingItem.icon] || ICONS.Sparkles) : null;
    const availableDays = daysCount === 5 ? DAYS_LIST.slice(0, 5) : DAYS_LIST;

    return (
        <section className="bg-zinc-900/40 border border-zinc-800/60 p-3 sm:p-4 rounded-2xl mb-4 sm:mb-6 print:hidden relative space-y-3">
            {onSelectDay && (
                <div className="hidden lg:flex items-center justify-between gap-2 overflow-x-auto pb-2 border-b border-zinc-800/60 scrollbar-none">
                    <span className="text-xs font-medium text-zinc-400 shrink-0">
                        Dia selecionado para adição:
                    </span>
                    <div className="flex items-center gap-1.5">
                        {availableDays.map((d) => {
                            const isSelected = activeDayKey === d.key;
                            return (
                                <button
                                    key={d.key}
                                    type="button"
                                    onClick={() => onSelectDay(d.key)}
                                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer shrink-0 ${isSelected
                                        ? 'bg-[#d97757] text-white shadow-sm font-semibold'
                                        : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300'
                                        }`}
                                >
                                    {d.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-zinc-300">
                    Blocos rápidos (Toque para adicionar)
                </span>
                <span className="hidden lg:block text-xs text-zinc-400">
                    Alvo: <strong className="text-[#d97757]">{activeDayLabel || 'Selecionado'}</strong>
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {INITIAL_ITEMS.map((item) => {
                    const IconComp = ICONS[item.icon] || ICONS.Sparkles;
                    const theme = COLORS[item.color] || COLORS.orange;

                    return (
                        <div
                            key={item.id}
                            onClick={() => handleCardClick(item)}
                            className={`group relative p-2.5 sm:p-3 flex items-center justify-between overflow-hidden rounded-xl border transition-all cursor-pointer active:scale-98 select-none ${theme.bg} ${theme.border}`}
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

                            <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0 ml-1" />
                        </div>
                    );
                })}
            </div>


            {editingItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto"
                    onFocus={(e) => e.stopPropagation()}
                >
                    <div ref={modalRef}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm bg-[#121214] border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-3.5 my-auto transform-gpu max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                                    {ActiveIcon && <ActiveIcon strokeWidth={2} className={`w-4 h-4 ${activeTheme.icon}`} />}
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
                                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirm} className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                                    Nome da Atividade
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl px-3.5 py-2 text-sm text-zinc-100 outline-none transition-colors"
                                    placeholder="Ex: Treino, Estudo..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 text-center">
                                        Início
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={5}
                                        value={start}
                                        onChange={(e) => setStart(maskTimeInput(e.target.value))}
                                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl py-2 text-base font-mono text-center text-zinc-100 outline-none"
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
                                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#d97757] rounded-xl py-2 text-base font-mono text-center text-zinc-100 outline-none"
                                        placeholder="00:00"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-[#d97757] hover:bg-[#c66a4c] active:scale-98 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
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