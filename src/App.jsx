import { useState } from 'react';
import Header from './components/Header';
import BlockPickers from './components/BlockPickers';
import DayColumn from './components/DayColumn';
import CreateBlockModal from './components/CreateBlockModal';

const DAYS_5 = [
  { key: 'seg', label: 'Segunda-feira' },
  { key: 'ter', label: 'Terça-feira' },
  { key: 'qua', label: 'Quarta-feira' },
  { key: 'qui', label: 'Quinta-feira' },
  { key: 'sex', label: 'Sexta-feira' },
];

const DAYS_7 = [
  ...DAYS_5,
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
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
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);

  const [modalState, setModalState] = useState({
    isOpen: false,
    dayKey: null,
    dayLabel: '',
  });

  const handlePrint = () => {
    window.print();
  };

  // soltar bloco rapido na coluna
  const handleDropBlock = (dayKey, item) => {
    const newBlock = {
      id: `${item.id}-${Date.now()}`,
      title: item.title,
      icon: item.icon,
      color: item.color,
      start: '08:00',
      end: '09:00',
    };

    setSchedule((prev) => ({
      ...prev,
      [dayKey]: [...prev[dayKey], newBlock],
    }));
  };

  // abrir modal no dia selecionado
  const handleAddClick = (dayKey) => {
    const day = activeDays.find((d) => d.key === dayKey);
    setModalState({
      isOpen: true,
      dayKey,
      dayLabel: day ? day.label : '',
    });
  };

  // salvar bloco do modal na coluna
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

  // edicao inline
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

  // copiar blocos d
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

  return (
    <div className="min-h-screen bg-[#141416] text-zinc-100 flex flex-col justify-between p-3 sm:p-5 lg:p-6 print:p-0 print:bg-[#f7f7f5] antialiased">
      <div className="w-full space-y-4 sm:space-y-5">
        <Header
          daysCount={daysCount}
          onDaysCountChange={setDaysCount}
          onPrint={handlePrint}
        />

        <BlockPickers />

        <div className="hidden print:block text-center py-2 mb-3 border-b border-zinc-300/80">
          <h2 className="text-sm font-bold tracking-tight uppercase text-zinc-800">
            Cronograma Semanal de Rotina
          </h2>
        </div>

        <main
          className={`flex overflow-x-auto pb-4 gap-2.5 sm:gap-3 scrollbar-none xl:grid xl:overflow-visible xl:pb-0 ${daysCount === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-7'
            } print:grid print:overflow-visible print:pb-0 print:gap-1.5 print:w-full ${daysCount === 5 ? 'print:grid-cols-5' : 'print:grid-cols-7'
            }`}
        >
          {activeDays.map((day) => (
            <div
              key={day.key}
              className="min-w-[210px] xl:min-w-0 flex-1 print:min-w-0 print:w-full"
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
          ))}
        </main>
      </div>

      <CreateBlockModal
        isOpen={modalState.isOpen}
        dayLabel={modalState.dayLabel}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveModalBlock}
      />

      <footer className="pt-8 pb-3 text-center print:hidden">
        <a
          href="https://github.com/jaozinpaulin"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-400/80 transition-colors"
        >
          <span>github.com/jaozinpaulin</span>
        </a>
      </footer>
    </div>
  );
}