import { useState, useEffect } from 'react';
import Header from './components/Header';
import BlockPickers from './components/BlockPickers';
import DayColumn from './components/DayColumn';
import CreateBlockModal from './components/CreateBlockModal';
import PdfPreviewModal from './components/PdfPreviewModal';

const DAYS_5 = [
  { key: 'seg', label: 'Segunda-feira', short: 'Seg' },
  { key: 'ter', label: 'Terça-feira', short: 'Ter' },
  { key: 'qua', label: 'Quarta-feira', short: 'Qua' },
  { key: 'qui', label: 'Quinta-feira', short: 'Qui' },
  { key: 'sex', label: 'Sexta-feira', short: 'Sex' },
];

const DAYS_7 = [
  ...DAYS_5,
  { key: 'sab', label: 'Sábado', short: 'Sáb' },
  { key: 'dom', label: 'Domingo', short: 'Dom' },
];

const INITIAL_SCHEDULE = {
  seg: [],
  ter: [],
  qua: [],
  qui: [],
  sex: [],
  sab: [],
  dom: [],
};

export default function App() {
  const [daysCount, setDaysCount] = useState(() => {
    const saved = localStorage.getItem('routine_days_count');
    return saved ? Number(saved) : 5;
  });

  const activeDays = daysCount === 5 ? DAYS_5 : DAYS_7;
  const [mobileActiveDay, setMobileActiveDay] = useState('seg');
  const [targetedDay, setTargetedDay] = useState(() => {
    return localStorage.getItem('routine_targeted_day') || null;
  });

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('routine_schedule_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Erro ao ler localStorage:', err);
      }
    }
    return INITIAL_SCHEDULE;
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    dayKey: null,
    dayLabel: '',
  });

  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('routine_schedule_data', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('routine_days_count', String(daysCount));
  }, [daysCount]);

  useEffect(() => {
    if (targetedDay) {
      localStorage.setItem('routine_targeted_day', targetedDay);
    } else {
      localStorage.removeItem('routine_targeted_day');
    }
  }, [targetedDay]);

  const handleOpenPdfPreview = () => {
    setIsPdfPreviewOpen(true);
  };

  const handleDropBlock = (dayKey, item) => {
    const newBlock = {
      id: `${item.id}-${Date.now()}`,
      title: item.title,
      icon: item.icon,
      color: item.color,
      start: item.start || '00:00',
      end: item.end || '00:00',
    };

    setSchedule((prev) => ({
      ...prev,
      [dayKey]: [...prev[dayKey], newBlock],
    }));
  };

  const handleReorderBlocks = (dayKey, reorderedBlocks) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: reorderedBlocks,
    }));
  };

  const handleQuickAdd = (configuredItem) => {
    const targetDay = mobileActiveDay;
    handleDropBlock(targetDay, configuredItem);
  };

  const handleToggleTarget = (dayKey) => {
    setTargetedDay((prev) => (prev === dayKey ? null : dayKey));
  };

  const handleAddClick = (dayKey) => {
    const day = activeDays.find((d) => d.key === dayKey);
    setModalState({
      isOpen: true,
      dayKey,
      dayLabel: day ? day.label : '',
    });
  };

  const handleSaveModalBlock = (newBlockData) => {
    if (!modalState.dayKey) return;

    const newBlock = {
      ...newBlockData,
      id: `manual-${Date.now()}`,
    };

    setSchedule((prev) => ({
      ...prev,
      [modalState.dayKey]: [...prev[modalState.dayKey], newBlock],
    }));
  };

  const handleUpdateBlock = (dayKey, blockId, updatedFields) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: prev[dayKey].map((b) =>
        b.id === blockId ? { ...b, ...updatedFields } : b
      ),
    }));
  };

  const handleDeleteBlock = (dayKey, blockId) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: prev[dayKey].filter((b) => b.id !== blockId),
    }));
  };

  const handleClearDay = (dayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: [],
    }));
  };

  const handleCopySchedule = (sourceDayKey, targetDayKeys) => {
    const sourceBlocks = schedule[sourceDayKey] || [];
    if (sourceBlocks.length === 0) return;

    setSchedule((prev) => {
      const updated = { ...prev };
      targetDayKeys.forEach((targetKey) => {
        updated[targetKey] = sourceBlocks.map((block) => ({
          ...block,
          id: `${block.id.split('-')[0]}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        }));
      });
      return updated;
    });
  };

  const currentDayInfo = activeDays.find((d) => d.key === mobileActiveDay) || activeDays[0];

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-zinc-100 flex flex-col justify-between p-3 sm:p-5 lg:p-6 antialiased">
      <div className="w-full space-y-3 sm:space-y-5">
        <Header
          daysCount={daysCount}
          onDaysCountChange={(count) => {
            setDaysCount(count);
            if (count === 5 && (mobileActiveDay === 'sab' || mobileActiveDay === 'dom')) {
              setMobileActiveDay('seg');
            }
          }}
          onPrint={handleOpenPdfPreview}
        />

        <BlockPickers
          onSelectBlock={handleQuickAdd}
          activeDayKey={mobileActiveDay}
          onSelectDay={setMobileActiveDay}
          activeDayLabel={currentDayInfo.label}
          daysCount={daysCount}
        />

        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl lg:hidden overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {activeDays.map((d) => {
            const isCurrent = d.key === mobileActiveDay;
            const count = (schedule[d.key] || []).length;
            const isTarget = d.key === targetedDay;

            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setMobileActiveDay(d.key)}
                className={`flex-1 min-w-[48px] py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${isCurrent
                  ? 'bg-[#d97757] text-white shadow-xs font-semibold'
                  : isTarget
                    ? ' text-[#d97757] bg-zinc-900/90 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
                  }`}
              >
                <span>{d.short}</span>
              </button>
            );
          })}
        </div>

        {/* Grade principal */}
        <main
          className={`w-full grid gap-2.5 sm:gap-3 ${daysCount === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-7'
            }`}
        >
          {activeDays.map((day) => {
            const isMobileHidden = day.key !== mobileActiveDay;

            return (
              <div
                key={day.key}
                className={`w-full ${isMobileHidden ? 'hidden lg:block' : 'block'}`}
              >
                <DayColumn
                  dayKey={day.key}
                  dayLabel={day.label}
                  isWeekend={day.key === 'sab' || day.key === 'dom'}
                  blocks={schedule[day.key] || []}
                  isTargeted={day.key === targetedDay}
                  onToggleTarget={handleToggleTarget}
                  onDropBlock={handleDropBlock}
                  onReorderBlocks={handleReorderBlocks}
                  onAddClick={handleAddClick}
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onClearDay={handleClearDay}
                  onCopySchedule={handleCopySchedule}
                />
              </div>
            );
          })}
        </main>
      </div>

      <PdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        activeDays={activeDays}
        schedule={schedule}
        targetedDay={targetedDay}
      />

      <CreateBlockModal
        isOpen={modalState.isOpen}
        dayLabel={modalState.dayLabel}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveModalBlock}
      />

      <footer className="pt-6 pb-4 sm:pb-2 text-center">
        <a
          href="https://github.com/jaozinpaulin"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          <span>github.com/jaozinpaulin</span>
        </a>
      </footer>
    </div>
  );
}