import { useRef, useState, useEffect } from 'react';
import { X, Download, Loader2, Sun, Moon, Image as ImageIcon, Monitor } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ICONS, COLORS } from './BlockPickers';

export default function PdfPreviewModal({ isOpen, onClose, activeDays, schedule, targetedDay }) {
    if (!isOpen) return null;

    const printRef = useRef(null);
    const containerRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingImg, setIsGeneratingImg] = useState(false);
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

            const imgWidth = element.offsetWidth;
            const imgHeight = element.offsetHeight;

            const pdfWidth = 297; // A4 Paisagem (mm)
            const pdfHeight = 210; // A4 Altura exata em mm

            const ratio = pdfWidth / imgWidth;
            const totalPdfHeight = imgHeight * ratio;

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            const pageBgColor = isLightMode ? [255, 255, 255] : [18, 18, 20];

            let heightLeft = totalPdfHeight;
            let position = 0;
            let pageNum = 1;

            // Adicionamos uma margem de segurança de corte para evitar fatiar em cima de bordas de cards
            const sliceHeight = pdfHeight;

            while (heightLeft > 0) {
                if (pageNum > 1) {
                    pdf.addPage();
                }

                pdf.setFillColor(pageBgColor[0], pageBgColor[1], pageBgColor[2]);
                pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

                // Desenha a imagem deslocada para a página atual
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');

                heightLeft -= sliceHeight;
                position -= sliceHeight;
                pageNum++;
            }

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

    const handleDownloadImage = async () => {
        if (!printRef.current || isGeneratingImg) return;
        setIsGeneratingImg(true);

        try {
            const element = printRef.current;
            const bgHex = isLightMode ? '#ffffff' : '#121214';

            const dataUrl = await toPng(element, {
                quality: 0.98,
                pixelRatio: 2,
                backgroundColor: bgHex,
                cacheBust: true,
            });

            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = isLightMode ? 'cronograma-semanal-l.png' : 'cronograma-semanal.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            onClose();
        } catch (error) {
            console.error('Erro ao gerar imagem:', error);
        } finally {
            setIsGeneratingImg(false);
        }
    };

    const is7Days = activeDays.length === 7;

    return (
        <div onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-sm">
            <div onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl bg-[#161618] border border-zinc-800 rounded-2xl flex flex-col max-h-[96vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-zinc-800 bg-[#141416] shrink-0">
                    <div className="min-w-0 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hidden sm:block">
                            <Monitor className="w-4 h-4 text-[#d97757]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                                    Visualização
                                </h3>
                                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-[#d97757]/20 text-[#d97757] font-mono shrink-0">
                                    Paisagem
                                </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 truncate hidden sm:block">
                                Confira a diagramação antes de exportar
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsLightMode((prev) => !prev)}
                            title={isLightMode ? 'Mudar para Tema Escuro' : 'Mudar para Tema Claro'}
                            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${isLightMode
                                ? 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-200'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-700/80 hover:bg-zinc-800 hover:text-zinc-100'
                                }`}>
                            {isLightMode ? (
                                <>
                                    <Moon className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                                    <span className="hidden md:inline">Modo Escuro</span>
                                </>
                            ) : (
                                <>
                                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    <span className="hidden md:inline">Modo Claro</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadImage}
                            disabled={isGeneratingImg}
                            title="Baixar como Imagem PNG"
                            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0">
                            {isGeneratingImg ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                    <span className="hidden sm:inline">Gerando...</span>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>PNG</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGenerating}
                            title="Baixar como Documento PDF"
                            className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#d97757] hover:bg-[#c66a4c] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                    <span className="hidden sm:inline">Gerando...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-3.5 h-3.5 shrink-0" />
                                    <span>PDF</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer shrink-0 ml-0.5"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                <div ref={containerRef}
                    className="flex-1 overflow-auto p-2 sm:p-5 bg-zinc-950/80 flex items-start justify-center [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800/80 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
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
                                style={{ width: '1060px', minHeight: 'auto' }}
                                className={`px-5  py-1 sm:py-1 flex flex-col justify-between shadow-2xl  shrink-0 box-border select-none transition-colors duration-200 ${isLightMode
                                    ? 'bg-white text-zinc-900 border border-zinc-200'
                                    : 'bg-[#121214] text-zinc-100 border border-zinc-800/80'
                                    }`}>
                                <div>
                                    <div className={`flex items-center justify-between pb-1 mb-3 border-b ${isLightMode ? 'border-zinc-200' : 'border-zinc-800'}`}>
                                        <div>
                                            <h1 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${isLightMode ? 'text-zinc-900' : 'text-zinc-100'}`}>
                                                Cronograma Semanal de Rotina
                                                <span className="w-2 h-2 rounded-full bg-[#d97757]" />
                                            </h1>
                                            <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                Planejamento semanal de tempo e atividades
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[9px] font-mono uppercase tracking-wider block ${isLightMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                Formato
                                            </span>
                                            <span className={`text-xs font-semibold ${isLightMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                                {is7Days ? 'Semana Completa (7 Dias)' : 'Dias Úteis (5 Dias)'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`grid gap-2 items-start ${is7Days ? 'grid-cols-7' : 'grid-cols-5'}`}>
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
                                                    <div className={`px-2.5 py-1.5 border-b rounded-t-xl flex items-center justify-between shrink-0 ${isLightMode
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
                                                            <span className={`text-[9px] font-mono ${isLightMode ? 'text-zinc-700' : 'text-zinc-400'}`}>
                                                                {blocks.length}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="p-1 flex flex-col gap-1">
                                                        {blocks.length === 0 ? (
                                                            <div className="py-3 flex items-center justify-center">
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
                                                                        className={`relative p-1.5 rounded-lg border flex flex-col justify-between min-h-[36px] overflow-hidden shrink-0 ${isLightMode
                                                                            ? 'bg-white border-zinc-200 shadow-2xs'
                                                                            : 'border-zinc-800 bg-zinc-900/90'
                                                                            }`}>
                                                                        <div className={`absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none ${isLightMode ? 'opacity-90' : 'opacity-80'}`}>
                                                                            <IconComp strokeWidth={1.8} className={`w-3.5 h-3.5 ${theme.icon}`} />
                                                                        </div>

                                                                        <div className="flex items-center gap-1 relative z-10">
                                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${theme.dot}`} />
                                                                            <span className={`text-[8px] font-mono font-medium ${isLightMode ? 'text-zinc-600 font-semibold' : 'text-zinc-400'}`}>
                                                                                {block.start} - {block.end}
                                                                            </span>
                                                                        </div>

                                                                        <span className={`text-[9px] font-medium leading-tight line-clamp-1 pr-4 relative z-10 mt-0.5 ${isLightMode ? 'text-zinc-900 font-bold' : 'text-zinc-200'}`}>
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

                                <div className={`pt-2.5 mt-2.5 border-t flex items-center justify-between text-[8px] shrink-0 ${isLightMode ? 'border-zinc-200/60 text-zinc-400/60' : 'border-zinc-800/60 text-zinc-500/60'}`}>
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