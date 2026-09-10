import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Check, Copy, Pin } from 'lucide-react';
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
    isTargeted = false,
    onToggleTarget,
    onDropBlock,
    onReorderBlocks,
    onAddClick,
    onUpdateBlock,
    onDeleteBlock,
    onClearDay,
    onCopySchedule,
}) {
    const [isOver, setIsOver] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', start: '00:00', end: '00:00' });
    const [showCopyMenu, setShowCopyMenu] = useState(false);
    const [selectedTargets, setSelectedTargets] = useState([]);
    const [draggedCardIndex, setDraggedCardIndex] = useState(null);
    const [dropPosition, setDropPosition] = useState(null);

    const copyMenuRef = useRef(null);

    // Controle de arrasto seguro (Mouse e Touch unificados)
    const isDraggingRef = useRef(false);
    const dragSourceIndexRef = useRef(null);
    const holdTimeoutRef = useRef(null);
    const startPosRef = useRef({ x: 0, y: 0 });
    const currentDropTargetRef = useRef(null);

    // Fecha o menu de copiar ao clicar fora
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

    const handleStartEdit = (block) => {
        if (isDraggingRef.current) return;
        setEditingId(block.id);
        setEditForm({
            title: block.title,
            start: block.start || '00:00',
            end: block.end || '00:00',
        });
    };

    const handleSaveEdit = (blockId) => {
        if (onUpdateBlock) {
            onUpdateBlock(dayKey, blockId, {
                title: editForm.title.trim() || 'Sem título',
                start: normalizeTime(editForm.start, '00:00'),
                end: normalizeTime(editForm.end, '00:00'),
            });
        }
        setEditingId(null);
    };

    // Reordena a lista e atualiza o estado principal
    const applyReorder = (fromIndex, toIndex, place) => {
        if (fromIndex === null || toIndex === null || fromIndex === undefined || toIndex === undefined) return;
        if (fromIndex === toIndex && place === 'after') return;

        const updated = [...blocks];
        const [movedItem] = updated.splice(fromIndex, 1);

        let targetIndex = place === 'before' ? toIndex : toIndex + 1;
        if (fromIndex < targetIndex) {
            targetIndex -= 1;
        }

        updated.splice(targetIndex, 0, movedItem);

        if (onReorderBlocks) {
            onReorderBlocks(dayKey, updated);
        }
    };

    // Sistema de Arrastar e Soltar (Mouse / Touch)
    const handlePointerDown = (e, index) => {
        // Ignora se o clique foi em inputs ou botões
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }

        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

        startPosRef.current = { x: clientX, y: clientY };
        dragSourceIndexRef.current = index;
        isDraggingRef.current = false;
        currentDropTargetRef.current = null;

        const isTouch = Boolean(e.touches);
        const holdTime = isTouch ? 250 : 50;

        holdTimeoutRef.current = setTimeout(() => {
            isDraggingRef.current = true;
            setDraggedCardIndex(index);
        }, holdTime);

        const handlePointerMove = (moveEvent) => {
            const currentX = moveEvent.clientX || (moveEvent.touches ? moveEvent.touches[0].clientX : 0);
            const currentY = moveEvent.clientY || (moveEvent.touches ? moveEvent.touches[0].clientY : 0);

            const dx = Math.abs(currentX - startPosRef.current.x);
            const dy = Math.abs(currentY - startPosRef.current.y);

            if (!isDraggingRef.current && (dx > 8 || dy > 8)) {
                clearTimeout(holdTimeoutRef.current);
                return;
            }

            if (isDraggingRef.current) {
                if (moveEvent.cancelable) moveEvent.preventDefault();

                const targetElement = document.elementFromPoint(currentX, currentY);
                const cardElement = targetElement ? targetElement.closest('[data-card-index]') : null;

                if (cardElement) {
                    const targetIdx = Number(cardElement.getAttribute('data-card-index'));
                    const rect = cardElement.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    const place = currentY < midY ? 'before' : 'after';

                    const targetData = { index: targetIdx, place };
                    currentDropTargetRef.current = targetData;
                    setDropPosition(targetData);
                }
            }
        };

        const handlePointerUp = () => {
            clearTimeout(holdTimeoutRef.current);

            if (isDraggingRef.current && currentDropTargetRef.current !== null) {
                applyReorder(
                    dragSourceIndexRef.current,
                    currentDropTargetRef.current.index,
                    currentDropTargetRef.current.place
                );
            }

            isDraggingRef.current = false;
            setDraggedCardIndex(null);
            setDropPosition(null);
            currentDropTargetRef.current = null;

            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
            window.removeEventListener('touchmove', handlePointerMove);
            window.removeEventListener('touchend', handlePointerUp);
        };

        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);
        window.addEventListener('touchmove', handlePointerMove, { passive: false });
        window.addEventListener('touchend', handlePointerUp);
    };

    const toggleCopyTarget = (targetKey) => {
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

    const totalBlocks = Array.isArray(blocks) ? blocks.length : 0;

    return (
        <div className={`relative flex flex-col rounded-2xl border min-h-[440px] transition-colors duration-150 overflow-visible print:min-h-0 print:rounded-lg print:border-zinc-300 print:bg-[#fcfcfc] print:break-inside-avoid ${isTargeted
            ? 'border-[#d97757]/50 bg-zinc-900/40 ring-1 ring-[#d97757]/20 shadow-sm'
            : isWeekend
                ? 'bg-[#151518] border-zinc-800/70'
                : 'bg-zinc-900/40 border-zinc-800/70'
            }`}>

            {/* Fica em coluna (flex-col) apenas na faixa entre lg e xl, e em linha (flex-row) abaixo de lg e acima de xl */}
            <div className={`px-2.5 sm:px-4 py-2.5 sm:py-3 border-b flex flex-row lg:flex-col xl:flex-row items-center justify-between gap-1.5 rounded-t-2xl print:px-2 print:py-1.5 print:border-zinc-300 print:bg-zinc-100 ${isTargeted
                ? 'border-[#d97757]/30 bg-zinc-900/60'
                : isWeekend
                    ? 'border-zinc-800/70 bg-zinc-900/50'
                    : 'border-zinc-800/70 bg-zinc-950/40'
                }`}>

                <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                    <span className={`text-xs sm:text-sm font-semibold truncate print:text-[10px] print:font-bold print:text-zinc-900 ${isTargeted ? 'text-[#d97757]' : isWeekend ? 'text-[#d97757]/90' : 'text-zinc-200'
                        }`}>
                        {dayLabel}
                    </span>

                    {totalBlocks > 0 && (
                        <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 print:border-none print:bg-transparent print:text-[8px]">
                            {totalBlocks}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 print:hidden relative">
                    {totalBlocks > 0 && (
                        <button
                            type="button"
                            onClick={() => onClearDay && onClearDay(dayKey)}
                            title="Limpar dia"
                            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer ml-0.5 print:hidden"
                        >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onToggleTarget && onToggleTarget(dayKey)}
                        title={isTargeted ? 'Desafixar dia' : 'Fixar/destacar dia'}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${isTargeted ? 'text-[#d97757] bg-[#d97757]/15' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
                            }`}
                    >
                        <Pin className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isTargeted ? 'fill-current' : ''}`} />
                    </button>

                    <div className="relative" ref={copyMenuRef}>
                        <button
                            type="button"
                            onClick={() => setShowCopyMenu((prev) => !prev)}
                            title="Copiar rotina para outros dias"
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${showCopyMenu ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
                                }`}
                        >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
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
                                                onClick={() => toggleCopyTarget(d.key)}
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
                        className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 rounded-lg transition-colors cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-2 sm:p-2.5 flex flex-col gap-2 print:p-1 print:gap-1">
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
                    blocks.map((block, index) => {
                        const IconComp = (ICONS && ICONS[block.icon]) ? ICONS[block.icon] : (ICONS?.Sparkles || 'span');
                        const theme = (COLORS && COLORS[block.color]) ? COLORS[block.color] : (COLORS?.orange || {});
                        const isEditing = editingId === block.id;

                        const isBeingDragged = draggedCardIndex === index;
                        const isTargetCard = dropPosition?.index === index && !isBeingDragged;

                        const translateClass = isTargetCard
                            ? dropPosition.place === 'before'
                                ? 'translate-y-2 border-zinc-700 shadow-md'
                                : '-translate-y-2 border-zinc-700 shadow-md'
                            : 'translate-y-0';

                        // Renderiza o formulário de edição do bloco
                        if (isEditing) {
                            return (
                                <div
                                    key={block.id}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-3 rounded-xl border border-zinc-700 space-y-2.5 print:hidden bg-zinc-950 shadow-lg"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-100 outline-none focus:border-[#d97757]"
                                            placeholder="Nome da atividade"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onDeleteBlock && onDeleteBlock(dayKey, block.id)}
                                            title="Excluir"
                                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <input
                                                type="tel"
                                                maxLength={5}
                                                value={editForm.start}
                                                onChange={(e) => {
                                                    const masked = maskTimeInput(e.target.value);
                                                    setEditForm((prev) => ({ ...prev, start: masked }));
                                                }}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 text-xs font-mono text-center text-zinc-100 outline-none focus:border-[#d97757]"
                                                placeholder="00:00"
                                            />
                                            <span className="text-[10px] text-zinc-500 block text-center mt-0.5">Início</span>
                                        </div>

                                        <div>
                                            <input
                                                type="tel"
                                                maxLength={5}
                                                value={editForm.end}
                                                onChange={(e) => {
                                                    const masked = maskTimeInput(e.target.value);
                                                    setEditForm((prev) => ({ ...prev, end: masked }));
                                                }}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 text-xs font-mono text-center text-zinc-100 outline-none focus:border-[#d97757]"
                                                placeholder="00:00"
                                            />
                                            <span className="text-[10px] text-zinc-500 block text-center mt-0.5">Fim</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleSaveEdit(block.id)}
                                        className="w-full py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Concluir
                                    </button>
                                </div>
                            );
                        }

                        // Renderiza o Card normal com tamanhos compactos responsivos
                        return (
                            <div
                                key={block.id}
                                data-card-index={index}
                                onMouseDown={(e) => handlePointerDown(e, index)}
                                onTouchStart={(e) => handlePointerDown(e, index)}
                                onClick={() => handleStartEdit(block)}
                                className={`group relative min-h-[56px] sm:min-h-[62px] p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-150 ease-out cursor-grab active:cursor-grabbing select-none active:scale-[0.99] print:min-h-0 print:py-1 print:px-1.5 print:rounded-md print:border-zinc-300 print:bg-white print:break-inside-avoid ${translateClass} ${isBeingDragged ? 'opacity-30 scale-95 border-dashed border-[#d97757] shadow-xl bg-zinc-800' : ''
                                    }`}
                            >
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 group-hover:scale-105">
                                    <IconComp
                                        strokeWidth={1.8}
                                        className={`w-5 h-5 sm:w-6 sm:h-6 opacity-45 group-hover:opacity-75 transition-opacity print:w-3.5 print:h-3.5 print:opacity-40 ${theme.icon || 'text-zinc-400'}`}
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 relative z-10 pointer-events-none">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dot || 'bg-zinc-400'} print:hidden`} />
                                    <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 print:text-[7.5px] print:leading-none print:font-semibold print:text-zinc-500">
                                        {block.start} - {block.end}
                                    </span>
                                </div>

                                <span className="relative z-10 text-[11px] sm:text-xs font-medium leading-snug pr-6 line-clamp-2 text-zinc-100 print:text-[8.5px] print:leading-tight print:pr-4 print:text-zinc-900 print:line-clamp-1 pointer-events-none">
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