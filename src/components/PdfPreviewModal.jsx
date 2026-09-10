import { useRef, useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ICONS, COLORS } from './BlockPickers';

export default function PdfPreviewModal({ isOpen, onClose, activeDays, schedule, targetedDay }) {
    if (!isOpen) return null;

    const printRef = useRef(null);
    const containerRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const availableWidth = containerRef.current.clientWidth - 32;
                const calculatedScale = Math.min(availableWidth / 1060, 0.85);
                setScale(calculatedScale > 0.25 ? calculatedScale : 0.25);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [isOpen]);

    const handleDownloadPdf = async () => {
        if (!printRef.current || isGenerating) return;
        setIsGenerating(true);

        try {
            const element = printRef.current;

            const imgData = await toPng(element, {
                quality: 0.98,
                pixelRatio: 2,
                backgroundColor: '#121214',
                cacheBust: true,
            });

            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;

            const pdfWidth = 297;
            const calculatedHeight = (elementHeight * pdfWidth) / elementWidth;

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [pdfWidth, Math.max(calculatedHeight, 210)],
            });

            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();

            pdf.setFillColor(18, 18, 20);
            pdf.rect(0, 0, pageW, pageH, 'F');
            pdf.addImage(imgData, 'PNG', 0, 0, pageW, calculatedHeight, undefined, 'FAST');

            const blob = pdf.output('blob');
            const blobUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = 'cronograma-semanal.pdf';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobUrl);

            onClose();
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const is7Days = activeDays.length === 7;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl bg-[#161618] border border-zinc-800 rounded-2xl flex flex-col max-h-[94vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            >
                <div className="flex items-center justify-between gap-3 px-3.5 sm:px-6 py-3 border-b border-zinc-800 bg-[#141416] shrink-0">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                                Visualização do PDF
                            </h3>
                            <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-[#d97757]/20 text-[#d97757] font-mono shrink-0">
                                A4 Paisagem
                            </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate hidden sm:block">
                            Confira como o cronograma ficará diagramado no documento
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#d97757] hover:bg-[#c66a4c] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Gerando...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Baixar PDF</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer shrink-0"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto p-3 sm:p-5 bg-zinc-950/80 flex items-start justify-center [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
                >
                    <div
                        style={{
                            width: `${1060 * scale}px`,
                            height: printRef.current ? `${printRef.current.offsetHeight * scale}px` : 'auto',
                        }}
                        className="relative shrink-0 overflow-hidden my-auto"
                    >
                        <div
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                            }}
                            className="absolute top-0 left-0"
                        >
                            <div
                                ref={printRef}
                                style={{ width: '1060px', minHeight: '750px' }}
                                className="bg-[#121214] text-zinc-100 p-8 flex flex-col justify-between border border-zinc-800/80 shadow-2xl rounded-2xl shrink-0 box-border select-none"
                            >
                                <div>
                                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-zinc-800">
                                        <div>
                                            <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                                                Cronograma Semanal de Rotina
                                                <span className="w-2 h-2 rounded-full bg-[#d97757]" />
                                            </h1>
                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                Planejamento semanal de tempo e atividades
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                                                Formato
                                            </span>
                                            <span className="text-xs font-semibold text-zinc-300">
                                                {is7Days ? 'Semana Completa (7 Dias)' : 'Dias Úteis (5 Dias)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Grade ajustada: items-start sem min-height fixo para não sobrar espaço vazio abaixo */}
                                    <div className={`grid gap-2.5 items-start ${is7Days ? 'grid-cols-7' : 'grid-cols-5'}`}>
                                        {activeDays.map((day) => {
                                            const blocks = schedule[day.key] || [];
                                            const isWeekend = day.key === 'sab' || day.key === 'dom';
                                            const isTarget = day.key === targetedDay;

                                            return (
                                                <div
                                                    key={day.key}
                                                    className={`rounded-xl border flex flex-col overflow-hidden h-fit self-start ${isTarget
                                                        ? 'border-[#d97757]/50 bg-zinc-900/60 shadow-sm ring-1 ring-[#d97757]/20'
                                                        : isWeekend
                                                            ? 'bg-[#161619] border-zinc-800/70'
                                                            : 'bg-zinc-900/50 border-zinc-800/90'
                                                        }`}
                                                >
                                                    <div className={`px-3 py-2 border-b bg-zinc-950/40 rounded-t-xl flex items-center justify-between shrink-0 ${isTarget ? 'border-[#d97757]/30' : 'border-zinc-800/80'
                                                        }`}>
                                                        <span className={`text-[11px] font-bold truncate ${isTarget
                                                            ? 'text-[#d97757]'
                                                            : isWeekend
                                                                ? 'text-[#d97757]/90'
                                                                : 'text-zinc-200'
                                                            }`}>
                                                            {day.label}
                                                        </span>
                                                        {blocks.length > 0 && (
                                                            <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800/90 px-1 py-0.2 rounded border border-zinc-700/40">
                                                                {blocks.length}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="p-1.5 flex flex-col gap-1.5">
                                                        {blocks.length === 0 ? (
                                                            <div className="py-4 flex items-center justify-center">
                                                                <span className="text-[10px] text-zinc-600 font-mono">
                                                                    Sem atividades
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            blocks.map((block) => {
                                                                const IconComp = ICONS[block.icon] || ICONS.Sparkles;
                                                                const theme = COLORS[block.color] || COLORS.orange;

                                                                return (
                                                                    <div
                                                                        key={block.id}
                                                                        className="relative p-2 rounded-lg border border-zinc-800 bg-zinc-900/90 flex flex-col justify-between min-h-[46px] overflow-hidden shrink-0"
                                                                    >
                                                                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                                            <IconComp strokeWidth={1.8} className={`w-4 h-4 ${theme.icon}`} />
                                                                        </div>

                                                                        <div className="flex items-center gap-1.5 relative z-10">
                                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dot}`} />
                                                                            <span className="text-[8.5px] font-mono text-zinc-400 font-medium">
                                                                                {block.start} - {block.end}
                                                                            </span>
                                                                        </div>

                                                                        <span className="text-[10px] font-medium leading-tight text-zinc-200 line-clamp-1 pr-5 relative z-10 mt-0.5">
                                                                            {block.title}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
                                    <span>Routine Planner</span>
                                    <span>github.com/jaozinpaulin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}