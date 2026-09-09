import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Check, Pencil, Copy } from 'lucide-react';
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
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [showCopyMenu, setShowCopyMenu] = useState(false);
    const [selectedTargets, setSelectedTargets] = useState([]);
    const copyMenuRef = useRef(null);

    // Fecha o popover ao clicar fora
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

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col rounded-2xl border min-h-[460px] transition-all overflow-visible print:min-h-0 print:rounded-lg print:border-zinc-300 print:bg-[#fcfcfc] print:break-inside-avoid ${isOver
                ? 'bg-[#d97757]/5 border-[#d97757]/30'
                : isHighlighted
                    ? 'border-[#d97757]/80 bg-zinc-900/30'
                    : isWeekend
                        ? 'bg-[#121214]/40 border-[#27272a]/30 opacity-70 hover:opacity-100 hover:border-[#27272a]/60'
                        : 'bg-zinc-900/30 border-zinc-800/70 hover:border-zinc-700/60'
                }`}
        >
            {/* Cabeçalho da coluna */}
            <div
                className={`px-3.5 py-3 border-b flex items-center justify-between rounded-t-2xl print:px-2 print:py-1.5 print:border-zinc-300 print:bg-zinc-100 ${isWeekend
                    ? 'border-zinc-800 bg-zinc-900/70'
                    : 'border-zinc-800/80 bg-zinc-950/30'
                    }`}
            >
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span
                        className={`text-xs font-semibold truncate print:text-[10px] print:font-bold print:text-zinc-900 ${isHighlighted
                            ? 'text-[#d97757]'
                            : isWeekend
                                ? 'text-orange-300'
                                : 'text-zinc-200'
                            }`}
                    >
                        {dayLabel}
                    </span>
                    {blocks.length > 0 && (
                        <span className="text-[10px] font-mono text-zinc-500 print:text-[8px] print:text-zinc-500 shrink-0">
                            {blocks.length}
                        </span>
                    )}

                    {blocks.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClear}
                            title="Limpar dia"
                            className="p-1 text-red-500/50 hover:text-red-500/80 transition-colors cursor-pointer ml-0.5 print:hidden"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-0.5 print:hidden relative">
                    <button
                        type="button"
                        onClick={() => setIsHighlighted((prev) => !prev)}
                        title={isHighlighted ? 'Remover destaque' : 'Destacar coluna'}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${isHighlighted
                            ? 'text-[#d97757] bg-[#d97757]/15'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative" ref={copyMenuRef}>
                        <button
                            type="button"
                            onClick={() => setShowCopyMenu((prev) => !prev)}
                            title="Copiar rotina para outros dias"
                            className={`p-1 rounded-md transition-colors cursor-pointer ${showCopyMenu
                                ? 'text-zinc-100 bg-zinc-800'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                }`}
                        >
                            <Copy className="w-3.5 h-3.5" />
                        </button>

                        {showCopyMenu && (
                            <div className="absolute right-0 top-7 z-50 w-44 p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl space-y-2">
                                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                    Copiar para
                                </span>
                                <div className="grid grid-cols-4 gap-1">
                                    {ALL_DAYS.map((d) => {
                                        const isCurrent = d.key === dayKey;
                                        const isSelected = selectedTargets.includes(d.key);
                                        return (
                                            <button
                                                key={d.key}
                                                type="button"
                                                disabled={isCurrent}
                                                onClick={() => toggleTarget(d.key)}
                                                className={`py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${isCurrent
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
                                    className="w-full py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Aplicar
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => onAddClick && onAddClick(dayKey)}
                        title="Adicionar atividade"
                        className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Lista de cards */}
            <div className="flex-1 p-2.5 flex flex-col gap-2 print:p-1 print:gap-1">
                {blocks.length === 0 ? (
                    <button
                        type="button"
                        onClick={() => onAddClick && onAddClick(dayKey)}
                        className="flex-1 min-h-[140px] flex flex-col items-center justify-center border border-dashed border-zinc-800/60 hover:border-zinc-700 rounded-xl transition-colors cursor-pointer print:hidden group"
                    >
                        <span className="text-xs text-zinc-600 group-hover:text-zinc-400">
                            + Adicionar
                        </span>
                    </button>
                ) : (
                    blocks.map((block) => {
                        const IconComp = (ICONS && ICONS[block.icon]) ? ICONS[block.icon] : (ICONS?.Sparkles || 'span');
                        const theme = (COLORS && COLORS[block.color]) ? COLORS[block.color] : (COLORS?.orange || {});
                        const isEditing = editingId === block.id;

                        // Card em edição inline (oculto na impressão)
                        if (isEditing) {
                            return (
                                <div
                                    key={block.id}
                                    className="p-3 rounded-xl border border-zinc-700/80 space-y-2.5 print:hidden bg-zinc-950/90 shadow-md"
                                >
                                    <div className="flex items-center justify-between gap-1.5">
                                        <input
                                            type="text"
                                            value={block.title}
                                            onChange={(e) =>
                                                onUpdateBlock(dayKey, block.id, { title: e.target.value })
                                            }
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-100 outline-none focus:border-zinc-600"
                                            placeholder="Nome da atividade"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onDeleteBlock(dayKey, block.id)}
                                            title="Excluir"
                                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
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
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 text-xs font-mono text-center text-zinc-100 outline-none focus:border-zinc-600"
                                                placeholder="08:00"
                                            />
                                            <span className="text-[9px] text-zinc-500 text-center mt-0.5">Inicio</span>
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
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 text-xs font-mono text-center text-zinc-100 outline-none focus:border-zinc-600"
                                                placeholder="09:00"
                                            />
                                            <span className="text-[9px] text-zinc-500 text-center mt-0.5">Fim</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className={`w-full py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${theme.btn || 'bg-zinc-800 text-zinc-200'}`}
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Concluir
                                    </button>
                                </div>
                            );
                        }

                        // Card normal exibido na tela e compactado para PDF
                        return (
                            <div
                                key={block.id}
                                onClick={() => setEditingId(block.id)}
                                className={`group relative min-h-[64px] p-2.5 flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 hover:border-zinc-700/90 transition-all cursor-pointer select-none hover:scale-[1.01] 
                                print:min-h-0 print:py-1 print:px-1.5 print:rounded-md print:border-zinc-300 print:bg-white print:break-inside-avoid ${theme.bg || 'bg-zinc-900/30'}`}
                            >
                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:scale-105">
                                    <IconComp
                                        strokeWidth={1.5}
                                        className={`w-9 h-9 opacity-45 group-hover:opacity-65 transition-opacity print:w-3.5 print:h-3.5 print:opacity-40 ${theme.icon || 'text-zinc-400'}`}
                                    />
                                </div>

                                <span className="relative z-10 text-[10px] font-mono text-zinc-400 print:text-[7.5px] print:leading-none print:font-semibold print:text-zinc-500">
                                    {block.start} - {block.end}
                                </span>

                                <span className="relative z-10 text-xs font-semibold leading-tight pr-8 line-clamp-2 text-zinc-200/90 print:text-[8.5px] print:leading-tight print:pr-4 print:text-zinc-900 print:line-clamp-1">
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