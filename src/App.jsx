import { useState } from 'react';
import Header from './components/Header';
import BlockPickers from './components/BlockPickers';
import DayColumn from './components/DayColumn';
import CreateBlockModal from './components/CreateBlockModal';

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
  const [daysCount, setDaysCount] = useState(5);
  const activeDays = daysCount === 5 ? DAYS_5 : DAYS_7;
  const [mobileActiveDay, setMobileActiveDay] = useState('seg');
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);

  const [modalState, setModalState] = useState({
    isOpen: false,
    dayKey: null,
    dayLabel: '',
  });

  const handlePrint = () => {
    window.print();
  };

  // Drop desktop tradicional (arrastar direto para a coluna)
  const handleDropBlock = (dayKey, item) => {
    const newBlock = {
      id: `${item.id}-${Date.now()}`,
      title: item.title,
      icon: item.icon,
      color: item.color,
      start: item.start || '08:00',
      end: item.end || '09:00',
    };

    setSchedule((prev) => ({
      ...prev,
      [dayKey]: [...prev[dayKey], newBlock],
    }));
  };

  // Recebe o item configurado diretamente do card inline do BlockPickers
  const handleQuickAdd = (configuredItem) => {
    const targetDay = mobileActiveDay;
    handleDropBlock(targetDay, configuredItem);
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
    <div className="min-h-screen bg-[#141416] text-zinc-100 flex flex-col justify-between p-3 sm:p-5 lg:p-6 print:p-0 print:bg-white antialiased">
      <div className="w-full space-y-3 sm:space-y-5">
        <Header
          daysCount={daysCount}
          onDaysCountChange={(count) => {
            setDaysCount(count);
            if (count === 5 && (mobileActiveDay === 'sab' || mobileActiveDay === 'dom')) {
              setMobileActiveDay('seg');
            }
          }}
          onPrint={handlePrint}
        />

        <BlockPickers
          onSelectBlock={handleQuickAdd}
          activeDayLabel={currentDayInfo.label}
        />

        {/* Abas no Mobile */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl lg:hidden print:hidden overflow-x-auto">
          {activeDays.map((d) => {
            const isCurrent = d.key === mobileActiveDay;
            const count = (schedule[d.key] || []).length;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setMobileActiveDay(d.key)}
                className={`flex-1 min-w-[52px] py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${isCurrent
                  ? 'bg-[#d97757] text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 bg-transparent'
                  }`}
              >
                <span>{d.short}</span>
                {count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isCurrent ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden print:block text-center py-2 mb-2 border-b border-zinc-300">
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-800">
            Cronograma Semanal de Rotina
          </h2>
        </div>

        <main
          className={`w-full grid gap-2 sm:gap-3 
            ${daysCount === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-7'} 
            print:gap-1.5 ${daysCount === 5 ? 'print:grid-cols-5' : 'print:grid-cols-7'}
          `}
        >
          {activeDays.map((day) => {
            const isMobileHidden = day.key !== mobileActiveDay;

            return (
              <div
                key={day.key}
                className={`w-full ${isMobileHidden ? 'hidden lg:block print:block' : 'block'}`}
              >
                <DayColumn
                  dayKey={day.key}
                  dayLabel={day.label}
                  isWeekend={day.key === 'sab' || day.key === 'dom'}
                  blocks={schedule[day.key] || []}
                  onDropBlock={handleDropBlock}
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

      <CreateBlockModal
        isOpen={modalState.isOpen}
        dayLabel={modalState.dayLabel}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveModalBlock}
      />

      <footer className="pt-6 pb-2 text-center print:hidden">
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