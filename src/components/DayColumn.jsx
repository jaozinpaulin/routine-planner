import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Check, Copy } from 'lucide-react';
import { ICONS, COLORS } from './BlockPickers';
import { maskTimeInput, normalizeTime } from '../utils/time';

const ALL_DAYS = [
    { key: 'seg', short: 'Seg' },
    { key: 'ter', short: 'Ter' },
    { key: 'qua', short: 'Qua' },
    { key: 'qui', short: 'Qui' },
    { key: 'sex', short: 'Sex' },
    { key: 'sab', short: 'Sab' },
    { key: 'dom', short: 'Dom' },
];

export default function DayColumn({
    dayKey,
    dayLabel,
    isWeekend = false,
    blocks = [],
    onDropBlock,
    onAddClick,
    onUpdateBlock,
    onDeleteBlock,
    onClearDay,
    onCopySchedule,
}) {
    const [isOver, setIsOver] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showCopyMenu, setShowCopyMenu] = useState(false);
    const [selectedTargets, setSelectedTargets] = useState([]);
    const copyMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (copyMenuRef.current && !copyMenuRef.current.contains(e.target)) {
                setShowCopyMenu(false);
            }
        };
        if (showCopyMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCopyMenu]);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        try {
            const item = JSON.parse(data);
            if (onDropBlock) onDropBlock(dayKey, item);
        } catch (err) {
            console.error('Erro drop:', err);
        }
    };

    const toggleTarget = (targetKey) => {
        setSelectedTargets((prev) =>
            prev.includes(targetKey) ? prev.filter((k) => k !== targetKey) : [...prev, targetKey]
        );
    };

    const handleConfirmCopy = () => {
        if (selectedTargets.length > 0 && onCopySchedule) {
            onCopySchedule(dayKey, selectedTargets);
        }
        setShowCopyMenu(false);
        setSelectedTargets([]);
    };

    const handleClear = () => {
        if (blocks.length === 0) return;
        if (onClearDay) {
            onClearDay(dayKey);
        }
    };

    const totalBlocks = Array.isArray(blocks) ? blocks.length : 0;

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col rounded-2xl border min-h-[440px] transition-all overflow-visible print:min-h-0 print:rounded-lg print:border-zinc-300 print:bg-[#fcfcfc] print:break-inside-avoid ${isOver
                ? 'bg-zinc-900/70 border-[#d97757]/60'
                : isWeekend
                    ? 'bg-[#151518] border-zinc-800/70'
                    : 'bg-zinc-900/40 border-zinc-800/70'
                }`}
        >
            {/* Header com contador limpo e preciso */}
            <div
                className={`px-4 py-3 border-b flex items-center justify-between rounded-t-2xl print:px-2 print:py-1.5 print:border-zinc-300 print:bg-zinc-100 ${isWeekend
                    ? 'border-zinc-800/70 bg-zinc-900/50'
                    : 'border-zinc-800/70 bg-zinc-950/40'
                    }`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm font-semibold truncate text-zinc-200 print:text-[10px] print:font-bold print:text-zinc-900">
                        {dayLabel}
                    </span>

                    {totalBlocks > 0 && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 print:border-none print:bg-transparent print:text-[8px]">
                            {totalBlocks}
                        </span>
                    )}

                    {totalBlocks > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            title="Limpar dia"
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer ml-0.5 print:hidden"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 print:hidden relative">
                    <div className="relative" ref={copyMenuRef}>
                        <button
                            type="button"
                            onClick={() => setShowCopyMenu((prev) => !prev)}
                            title="Copiar rotina para outros dias"
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${showCopyMenu
                                ? 'text-zinc-100 bg-zinc-800'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
                                }`}
                        >
                            <Copy className="w-4 h-4" />
                        </button>

                        {showCopyMenu && (
                            <div className="absolute right-0 top-10 z-50 w-48 p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl space-y-2">
                                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                    Copiar para
                                </span>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {ALL_DAYS.map((d) => {
                                        const isCurrent = d.key === dayKey;
                                        const isSelected = selectedTargets.includes(d.key);
                                        return (
                                            <button
                                                key={d.key}
                                                type="button"
                                                disabled={isCurrent}
                                                onClick={() => toggleTarget(d.key)}
                                                className={`py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${isCurrent
                                                    ? 'opacity-30 cursor-not-allowed bg-zinc-950 text-zinc-600'
                                                    : isSelected
                                                        ? 'bg-[#d97757] text-white font-bold'
                                                        : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800'
                                                    }`}
                                            >
                                                {d.short}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleConfirmCopy}
                                    disabled={selectedTargets.length === 0}
                                    className="w-full py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    Aplicar
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => onAddClick && onAddClick(dayKey)}
                        title="Adicionar atividade"
                        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 rounded-lg transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Lista de cards */}
            <div className="flex-1 p-3 sm:p-2.5 flex flex-col gap-2 print:p-1 print:gap-1">
                {totalBlocks === 0 ? (
                    <button
                        type="button"
                        onClick={() => onAddClick && onAddClick(dayKey)}
                        className="flex-1 min-h-[140px] flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors cursor-pointer print:hidden group"
                    >
                        <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300">
                            + Adicionar atividade
                        </span>
                    </button>
                ) : (
                    blocks.map((block) => {
                        const IconComp = (ICONS && ICONS[block.icon]) ? ICONS[block.icon] : (ICONS?.Sparkles || 'span');
                        const theme = (COLORS && COLORS[block.color]) ? COLORS[block.color] : (COLORS?.orange || {});
                        const isEditing = editingId === block.id;

                        if (isEditing) {
                            return (
                                <div
                                    key={block.id}
                                    className="p-3.5 sm:p-3 rounded-xl border border-zinc-700 space-y-3 print:hidden bg-zinc-950/95 shadow-lg"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <input
                                            type="text"
                                            value={block.title}
                                            onChange={(e) =>
                                                onUpdateBlock(dayKey, block.id, { title: e.target.value })
                                            }
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-medium text-zinc-100 outline-none focus:border-[#d97757]"
                                            placeholder="Nome da atividade"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onDeleteBlock(dayKey, block.id)}
                                            title="Excluir"
                                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={block.start}
                                                maxLength={5}
                                                onChange={(e) => {
                                                    const masked = maskTimeInput(e.target.value);
                                                    onUpdateBlock(dayKey, block.id, { start: masked });
                                                }}
                                                onBlur={(e) => {
                                                    const finalTime = normalizeTime(e.target.value, '08:00');
                                                    onUpdateBlock(dayKey, block.id, { start: finalTime });
                                                }}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 text-xs font-mono text-center text-zinc-100 outline-none focus:border-[#d97757]"
                                                placeholder="08:00"
                                            />
                                            <span className="text-[10px] text-zinc-500 text-center mt-1">Início</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={block.end}
                                                maxLength={5}
                                                onChange={(e) => {
                                                    const masked = maskTimeInput(e.target.value);
                                                    onUpdateBlock(dayKey, block.id, { end: masked });
                                                }}
                                                onBlur={(e) => {
                                                    const finalTime = normalizeTime(e.target.value, '09:00');
                                                    onUpdateBlock(dayKey, block.id, { end: finalTime });
                                                }}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 text-xs font-mono text-center text-zinc-100 outline-none focus:border-[#d97757]"
                                                placeholder="09:00"
                                            />
                                            <span className="text-[10px] text-zinc-500 text-center mt-1">Fim</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="w-full py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                                    >
                                        <Check className="w-4 h-4" />
                                        Concluir
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={block.id}
                                onClick={() => setEditingId(block.id)}
                                className="group relative min-h-[62px] p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer select-none active:scale-[0.99] print:min-h-0 print:py-1 print:px-1.5 print:rounded-md print:border-zinc-300 print:bg-white print:break-inside-avoid"
                            >
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:scale-105">
                                    <IconComp
                                        strokeWidth={1.75}
                                        className={`w-7 h-7 opacity-35 group-hover:opacity-60 transition-opacity print:w-3.5 print:h-3.5 print:opacity-40 ${theme.icon || 'text-zinc-400'}`}
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 relative z-10">
                                    <span className={`w-1.5 h-1.5 rounded-full ${theme.dot || 'bg-zinc-400'} print:hidden`} />
                                    <span className="text-[11px] sm:text-[10px] font-mono text-zinc-400 print:text-[7.5px] print:leading-none print:font-semibold print:text-zinc-500">
                                        {block.start} - {block.end}
                                    </span>
                                </div>

                                <span className="relative z-10 text-xs font-medium leading-snug pr-7 line-clamp-2 text-zinc-100 print:text-[8.5px] print:leading-tight print:pr-4 print:text-zinc-900 print:line-clamp-1">
                                    {block.title}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}