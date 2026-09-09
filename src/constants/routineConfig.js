export const DAYS_CONFIG = [
    { key: 'seg', label: 'Segunda-feira', short: 'Seg' },
    { key: 'ter', label: 'Terça-feira', short: 'Ter' },
    { key: 'qua', label: 'Quarta-feira', short: 'Qua' },
    { key: 'qui', label: 'Quinta-feira', short: 'Qui' },
    { key: 'sex', label: 'Sexta-feira', short: 'Sex' },
    { key: 'sab', label: 'Sábado', short: 'Sáb' },
    { key: 'dom', label: 'Domingo', short: 'Dom' },
];

export const CATEGORIES = {
    trajeto: {
        id: 'trajeto',
        label: 'Trajeto',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300',
    },
    curso: {
        id: 'curso',
        label: 'Curso',
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300',
    },
    refeicao: {
        id: 'refeicao',
        label: 'Alimentação',
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300',
    },
    trabalho: {
        id: 'trabalho',
        label: 'Empresa',
        bg: 'bg-sky-950/40',
        border: 'border-sky-500/30',
        badge: 'bg-sky-500/20 text-sky-300',
    },
    sono: {
        id: 'sono',
        label: 'Descanso',
        bg: 'bg-purple-950/40',
        border: 'border-purple-500/30',
        badge: 'bg-purple-500/20 text-purple-300',
    },
};

export const PRESET_PIECES = [
    {
        id: 'piece-trajeto',
        category: 'trajeto',
        title: '🚌 Ônibus / Trajeto',
        description: 'Deslocamento',
        start: '06:40',
        end: '07:30',
    },
    {
        id: 'piece-curso',
        category: 'curso',
        title: '📚 Curso Teórico',
        description: 'Aulas e capacitação',
        start: '08:00',
        end: '12:00',
    },
    {
        id: 'piece-refeicao',
        category: 'refeicao',
        title: '🍽️ Almoço',
        description: 'Intervalo para refeição',
        start: '12:00',
        end: '13:00',
    },
    {
        id: 'piece-trabalho',
        category: 'trabalho',
        title: '💼 Empresa / Prática',
        description: 'Atividades práticas no setor',
        start: '13:30',
        end: '17:30',
    },
    {
        id: 'piece-sono',
        category: 'sono',
        title: '😴 Descanso / Sono',
        description: 'Recuperação',
        start: '22:30',
        end: '06:30',
    },
];

export const INITIAL_SCHEDULE = {
    seg: [],
    ter: [],
    qua: [],
    qui: [],
    sex: [],
    sab: [],
    dom: [],
};