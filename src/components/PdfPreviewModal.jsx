import { useRef, useState, useEffect } from 'react';
import { X, Download, Loader2, Sun, Moon } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ICONS, COLORS } from './BlockPickers';

export default function PdfPreviewModal({ isOpen, onClose, activeDays, schedule, targetedDay }) {
    if (!isOpen) return null;

    const printRef = useRef(null);
    const containerRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [scale, setScale] = useState(1);
    const [isLightMode, setIsLightMode] = useState(false);

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
            const bgHex = isLightMode ? '#ffffff' : '#121214';

            const imgData = await toPng(element, {
                quality: 0.98,
                pixelRatio: 2,
                backgroundColor: bgHex,
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

            pdf.setFillColor(isLightMode ? 255 : 18, isLightMode ? 255 : 18, isLightMode ? 255 : 20);
            pdf.rect(0, 0, pageW, pageH, 'F');
            pdf.addImage(imgData, 'PNG', 0, 0, pageW, calculatedHeight, undefined, 'FAST');

            const blob = pdf.output('blob');
            const blobUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download = isLightMode ? 'cronograma-semanal-l.pdf' : 'cronograma-semanal.pdf';
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
        <div onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl bg-[#161618] border border-zinc-800 rounded-2xl flex flex-col max-h-[94vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsLightMode((prev) => !prev)}
                            title={isLightMode ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${isLightMode
                                ? 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-200 shadow-xs'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-700/80 hover:bg-zinc-800 hover:text-zinc-100'
                                }`}>
                            {isLightMode ? (
                                <>
                                    <Moon className="w-3.5 h-3.5 text-zinc-700" />
                                    <span className="hidden sm:inline">Modo Escuro</span>
                                </>
                            ) : (
                                <>
                                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="hidden sm:inline">Modo Claro</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#d97757] hover:bg-[#c66a4c] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0">
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

                <div ref={containerRef}
                    className="flex-1 overflow-auto p-3 sm:p-5 bg-zinc-950/80 flex items-start justify-center [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                    <div
                        style={{
                            width: `${1060 * scale}px`,
                            height: printRef.current ? `${printRef.current.offsetHeight * scale}px` : 'auto',
                        }}
                        className="relative shrink-0 overflow-hidden my-auto">
                        <div
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                            }}
                            className="absolute top-0 left-0">
                            <div
                                ref={printRef}
                                style={{ width: '1060px', minHeight: '750px' }}
                                className={`p-8 flex flex-col justify-between shadow-2xl rounded-2xl shrink-0 box-border select-none transition-colors duration-200 ${isLightMode
                                    ? 'bg-white text-zinc-900 border border-zinc-200'
                                    : 'bg-[#121214] text-zinc-100 border border-zinc-800/80'
                                    }`}>
                                <div>
                                    <div className={`flex items-center justify-between pb-3.5 mb-4 border-b ${isLightMode ? 'border-zinc-200' : 'border-zinc-800'}`}>
                                        <div>
                                            <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isLightMode ? 'text-zinc-900' : 'text-zinc-100'}`}>
                                                Cronograma Semanal de Rotina
                                                <span className="w-2 h-2 rounded-full bg-[#d97757]" />
                                            </h1>
                                            <p className={`text-xs mt-0.5 ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                Planejamento semanal de tempo e atividades
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] font-mono uppercase tracking-wider block ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                Formato
                                            </span>
                                            <span className={`text-xs font-semibold ${isLightMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                                {is7Days ? 'Semana Completa (7 Dias)' : 'Dias Úteis (5 Dias)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Grade de colunas */}
                                    <div className={`grid gap-2.5 items-start ${is7Days ? 'grid-cols-7' : 'grid-cols-5'}`}>
                                        {activeDays.map((day) => {
                                            const blocks = schedule[day.key] || [];
                                            const isWeekend = day.key === 'sab' || day.key === 'dom';
                                            const isTarget = day.key === targetedDay;

                                            return (
                                                <div
                                                    key={day.key}
                                                    className={`rounded-xl border flex flex-col overflow-hidden h-fit self-start ${isTarget
                                                        ? isLightMode
                                                            ? 'border-zinc-900 bg-zinc-100/80 ring-1 ring-zinc-900/20 shadow-xs'
                                                            : 'border-[#d97757]/50 bg-zinc-900/60 shadow-sm ring-1 ring-[#d97757]/20'
                                                        : isWeekend
                                                            ? isLightMode
                                                                ? 'bg-zinc-50 border-zinc-200'
                                                                : 'bg-[#161619] border-zinc-800/70'
                                                            : isLightMode
                                                                ? 'bg-white border-zinc-200 shadow-xs'
                                                                : 'bg-zinc-900/50 border-zinc-800/90'
                                                        }`}>
                                                    <div className={`px-3 py-2 border-b rounded-t-xl flex items-center justify-between shrink-0 ${isLightMode
                                                        ? isTarget ? 'bg-zinc-200/80 border-zinc-300' : 'bg-zinc-100/80 border-zinc-200'
                                                        : isTarget ? 'bg-zinc-900/80 border-[#d97757]/30' : 'bg-zinc-950/40 border-zinc-800/80'
                                                        }`}>
                                                        <span className={`text-[11px] font-bold truncate ${isTarget
                                                            ? isLightMode ? 'text-zinc-900 font-extrabold' : 'text-[#d97757]'
                                                            : isWeekend
                                                                ? 'text-[#d97757]/90'
                                                                : isLightMode ? 'text-zinc-800' : 'text-zinc-200'
                                                            }`}>
                                                            {day.label}
                                                        </span>
                                                        {blocks.length > 0 && (
                                                            <span className={`text-[9px] font-mono ${isLightMode
                                                                ? 'text-zinc-700'
                                                                : 'text-zinc-400'
                                                                }`}>
                                                                {blocks.length}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="p-1.5 flex flex-col gap-1.5">
                                                        {blocks.length === 0 ? (
                                                            <div className="py-4 flex items-center justify-center">
                                                                <span className={`text-[10px] font-mono ${isLightMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
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
                                                                        className={`relative p-2 rounded-lg border flex flex-col justify-between min-h-[46px] overflow-hidden shrink-0 ${isLightMode
                                                                            ? 'bg-white border-zinc-200 shadow-2xs'
                                                                            : 'border-zinc-800 bg-zinc-900/90'
                                                                            }`}>
                                                                        <div className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLightMode ? 'opacity-90' : 'opacity-80'
                                                                            }`}>
                                                                            <IconComp strokeWidth={1.8} className={`w-4 h-4 ${theme.icon}`} />
                                                                        </div>

                                                                        <div className="flex items-center gap-1.5 relative z-10">
                                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dot}`} />
                                                                            <span className={`text-[8.5px] font-mono font-medium ${isLightMode ? 'text-zinc-600 font-semibold' : 'text-zinc-400'}`}>
                                                                                {block.start} - {block.end}
                                                                            </span>
                                                                        </div>

                                                                        <span className={`text-[10px] font-medium leading-tight line-clamp-1 pr-5 relative z-10 mt-0.5 ${isLightMode ? 'text-zinc-900 font-bold' : 'text-zinc-200'
                                                                            }`}>
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

                                <div className={`pt-4 mt-4 border-t flex items-center justify-between text-[10px] shrink-0 ${isLightMode ? 'border-zinc-200 text-zinc-400' : 'border-zinc-800/80 text-zinc-500'
                                    }`}>
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