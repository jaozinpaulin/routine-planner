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

    // Variáveis com estado em ref para o Touch não perder referências em render
    const longPressTimerRef = useRef(null);
    const isDraggingMobileRef = useRef(false);
    const dragSourceIndexRef = useRef(null);
    const dragTargetIndexRef = useRef(null);
    const dragTargetPlaceRef = useRef('after');
    const touchOriginRef = useRef({ x: 0, y: 0 });

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
        if (isDraggingMobileRef.current) return;
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

    const applyReorder = (fromIndex, toIndex, place) => {
        if (fromIndex === null || toIndex === null || fromIndex === undefined || toIndex === undefined) return;
        if (fromIndex === toIndex) return;

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

    // Drag Desktop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!isOver) setIsOver(true);
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsOver(false);
            setDropPosition(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        setDropPosition(null);

        const internalIndex = e.dataTransfer.getData('text/card-index');
        const sourceDay = e.dataTransfer.getData('text/day-key');

        if (internalIndex !== '' && sourceDay === dayKey) {
            setDraggedCardIndex(null);
            return;
        }

        const rawData = e.dataTransfer.getData('application/json');
        if (!rawData) return;

        try {
            const parsed = JSON.parse(rawData);
            const blockItem = parsed.item || parsed;
            if (onDropBlock) {
                onDropBlock(dayKey, blockItem);
            }
        } catch (err) {
            console.error('Erro drop coluna:', err);
        }
    };

    const handleCardDragStart = (e, index) => {
        e.stopPropagation();
        setDraggedCardIndex(index);
        e.dataTransfer.setData('text/card-index', String(index));
        e.dataTransfer.setData('text/day-key', dayKey);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleCardDragOver = (e, index) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const place = e.clientY < midY ? 'before' : 'after';

        if (!dropPosition || dropPosition.index !== index || dropPosition.place !== place) {
            setDropPosition({ index, place });
        }
    };

    const handleCardDrop = (e, targetIndex) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);

        const sourceIndexStr = e.dataTransfer.getData('text/card-index');
        const sourceDay = e.dataTransfer.getData('text/day-key');

        if (sourceIndexStr !== '' && sourceDay === dayKey) {
            const fromIndex = Number(sourceIndexStr);
            applyReorder(fromIndex, targetIndex, dropPosition?.place || 'after');
            setDraggedCardIndex(null);
            setDropPosition(null);
            return;
        }

        setDropPosition(null);
        handleDrop(e);
    };

    // Touch Mobile com Long-Press e Trava Precisa de Soltura
    const handleTouchStart = (e, index) => {
        const touch = e.touches[0];
        touchOriginRef.current = { x: touch.clientX, y: touch.clientY };
        dragSourceIndexRef.current = index;
        dragTargetIndexRef.current = index;
        dragTargetPlaceRef.current = 'after';
        isDraggingMobileRef.current = false;

        // Segurar por 220ms ativa o modo de reordenação
        longPressTimerRef.current = setTimeout(() => {
            isDraggingMobileRef.current = true;
            setDraggedCardIndex(index);
            if (window.navigator?.vibrate) {
                window.navigator.vibrate(40);
            }
        }, 220);
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];

        // Se moveu antes de 220ms, cancela: é scroll da tela do usuário
        if (!isDraggingMobileRef.current) {
            const dx = Math.abs(touch.clientX - touchOriginRef.current.x);
            const dy = Math.abs(touch.clientY - touchOriginRef.current.y);
            if (dx > 10 || dy > 10) {
                clearTimeout(longPressTimerRef.current);
            }
            return;
        }

        // Se está no modo arrasto, trava o scroll da página
        if (e.cancelable) {
            e.preventDefault();
        }

        // Identifica qual card está sob o dedo
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element) return;

        const cardElement = element.closest('[data-card-index]');
        if (cardElement) {
            const index = Number(cardElement.getAttribute('data-card-index'));
            const rect = cardElement.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            const place = touch.clientY < midY ? 'before' : 'after';

            dragTargetIndexRef.current = index;
            dragTargetPlaceRef.current = place;
            setDropPosition({ index, place });
        }
    };

    const handleTouchEnd = () => {
        clearTimeout(longPressTimerRef.current);

        if (isDraggingMobileRef.current) {
            const from = dragSourceIndexRef.current;
            const to = dragTargetIndexRef.current;
            const place = dragTargetPlaceRef.current;

            if (from !== null && to !== null) {
                applyReorder(from, to, place);
            }
        }

        // Pequeno atraso para evitar que o clique de soltar acione o modal
        setTimeout(() => {
            isDraggingMobileRef.current = false;
        }, 80);

        dragSourceIndexRef.current = null;
        dragTargetIndexRef.current = null;
        setDraggedCardIndex(null);
        setDropPosition(null);
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
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col rounded-2xl border min-h-[440px] transition-colors duration-150 overflow-visible print:min-h-0 print:rounded-lg print:border-zinc-300 print:bg-[#fcfcfc] print:break-inside-avoid ${isOver
                ? 'border-zinc-700/80 bg-zinc-800/25'
                : isTargeted
                    ? 'border-[#d97757]/50 bg-zinc-900/40 ring-1 ring-[#d97757]/20 shadow-sm'
                    : isWeekend
                        ? 'bg-[#151518] border-zinc-800/70'
                        : 'bg-zinc-900/40 border-zinc-800/70'
                }`}
        >
            {/* Header da coluna */}
            <div
                className={`px-4 py-3 border-b flex items-center justify-between rounded-t-2xl print:px-2 print:py-1.5 print:border-zinc-300 print:bg-zinc-100 ${isOver
                    ? 'border-zinc-700/70 bg-zinc-850/40'
                    : isTargeted
                        ? 'border-[#d97757]/30 bg-zinc-900/60'
                        : isWeekend
                            ? 'border-zinc-800/70 bg-zinc-900/50'
                            : 'border-zinc-800/70 bg-zinc-950/40'
                    }`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-sm font-semibold truncate print:text-[10px] print:font-bold print:text-zinc-900 ${isTargeted ? 'text-[#d97757]' : isWeekend ? 'text-[#d97757]/90' : 'text-zinc-200'
                        }`}>
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
                            onClick={() => onClearDay && onClearDay(dayKey)}
                            title="Limpar dia"
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer ml-0.5 print:hidden"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 print:hidden relative">
                    <button
                        type="button"
                        onClick={() => onToggleTarget && onToggleTarget(dayKey)}
                        title={isTargeted ? 'Desafixar dia' : 'Fixar/destacar dia'}
                        className={`p-2 rounded-lg cursor-pointer ${isTargeted ? 'text-[#d97757] bg-[#d97757]/15' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
                            }`}
                    >
                        <Pin className={`w-3.5 h-3.5 ${isTargeted ? 'fill-current' : ''}`} />
                    </button>

                    <div className="relative" ref={copyMenuRef}>
                        <button
                            type="button"
                            onClick={() => setShowCopyMenu((prev) => !prev)}
                            title="Copiar rotina para outros dias"
                            className={`p-2 rounded-lg cursor-pointer ${showCopyMenu ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70'
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
                                                onClick={() => toggleCopyTarget(d.key)}
                                                className={`py-1.5 text-xs font-mono rounded-lg cursor-pointer ${isCurrent
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
                                    className="w-full py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
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
                        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 rounded-lg cursor-pointer"
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
                        className="flex-1 min-h-[140px] flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer print:hidden group"
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

                        // Borda indicativa no card que vai receber o item
                        const borderIndicator = isTargetCard
                            ? dropPosition.place === 'before'
                                ? 'border-t-2 !border-t-[#d97757]'
                                : 'border-b-2 !border-b-[#d97757]'
                            : '';

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
                                            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer shrink-0"
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
                                        className="w-full py-1.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Concluir
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={block.id}
                                data-card-index={index}
                                draggable
                                onDragStart={(e) => handleCardDragStart(e, index)}
                                onDragOver={(e) => handleCardDragOver(e, index)}
                                onDrop={(e) => handleCardDrop(e, index)}
                                onDragEnd={() => {
                                    setDraggedCardIndex(null);
                                    setDropPosition(null);
                                }}
                                onTouchStart={(e) => handleTouchStart(e, index)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                onClick={() => handleStartEdit(block)}
                                className={`group relative min-h-[62px] p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 select-none print:min-h-0 print:py-1 print:px-1.5 print:rounded-md print:border-zinc-300 print:bg-white print:break-inside-avoid ${borderIndicator} ${isBeingDragged
                                    ? 'opacity-30 border-dashed border-[#d97757]'
                                    : 'hover:bg-zinc-900 hover:border-zinc-700'
                                    }`}
                            >
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <IconComp
                                        strokeWidth={1.8}
                                        className={`w-6 h-6 opacity-45 group-hover:opacity-75 print:w-3.5 print:h-3.5 print:opacity-40 ${theme.icon || 'text-zinc-400'}`}
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 relative z-10 pointer-events-none">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dot || 'bg-zinc-400'} print:hidden`} />
                                    <span className="text-[11px] sm:text-[10px] font-mono text-zinc-400 print:text-[7.5px] print:leading-none print:font-semibold print:text-zinc-500">
                                        {block.start} - {block.end}
                                    </span>
                                </div>

                                <span className="relative z-10 text-xs font-medium leading-snug pr-7 line-clamp-2 text-zinc-100 print:text-[8.5px] print:leading-tight print:pr-4 print:text-zinc-900 print:line-clamp-1 pointer-events-none">
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