export const CATEGORIES = [
    'Todos',
    'hub-ime',
    'Mentorados HUB IME',
    'Laboratórios',
    'Pesquisadores',
    'Bastidores da Ciência',
    'Eventos',
    'Nossa História',
    'Uso Didático',
    'Convivência',
    'Central de Anotações',
    'Mural do Deu Ruim',
    'Outros'
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_STYLES: Record<string, {
    bg: string;
    hover: string;
    text: string;
    accent: string;
    filterActive: string;
    filterInactive: string;
    cardBadge: string;
}> = {
    'hub-ime': {
        bg: 'bg-brand-blue',
        hover: 'hover:bg-brand-darkBlue',
        text: 'text-white',
        accent: 'card-accent-blue',
        filterActive: 'bg-brand-blue hover:bg-brand-darkBlue border-transparent text-white shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 hover:text-brand-blue border-gray-200 dark:border-gray-700 hover:border-brand-blue',
        cardBadge: 'bg-brand-blue/90 text-white shadow-brand-blue/50'
    },
    'Mentorados HUB IME': {
        bg: 'bg-brand-yellow',
        hover: 'hover:opacity-90',
        text: 'text-black',
        accent: 'card-accent-yellow',
        filterActive: 'bg-brand-yellow hover:opacity-90 border-transparent text-black shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 dark:hover:bg-brand-yellow/20 hover:text-yellow-700 dark:hover:text-brand-yellow border-gray-200 dark:border-gray-700 hover:border-brand-yellow',
        cardBadge: 'bg-brand-yellow/90 text-black shadow-brand-yellow/50'
    },
    'Laboratórios': {
        bg: 'bg-brand-blue',
        hover: 'hover:bg-brand-darkBlue',
        text: 'text-white',
        accent: 'card-accent-blue',
        filterActive: 'bg-brand-blue hover:bg-brand-darkBlue border-transparent text-white shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 hover:text-brand-blue border-gray-200 dark:border-gray-700 hover:border-brand-blue',
        cardBadge: 'bg-brand-blue/90 text-white shadow-brand-blue/50'
    },
    'Pesquisadores': {
        bg: 'bg-brand-red',
        hover: 'hover:bg-red-600',
        text: 'text-white',
        accent: 'card-accent-red',
        filterActive: 'bg-brand-red hover:bg-red-600 border-transparent text-white shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-red/10 dark:hover:bg-brand-red/20 hover:text-brand-red border-gray-200 dark:border-gray-700 hover:border-brand-red',
        cardBadge: 'bg-brand-red/90 text-white shadow-brand-red/50'
    },
    'Bastidores da Ciência': {
        bg: 'bg-brand-yellow',
        hover: 'hover:opacity-90',
        text: 'text-black',
        accent: 'card-accent-yellow',
        filterActive: 'bg-brand-yellow hover:opacity-90 border-transparent text-black shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 dark:hover:bg-brand-yellow/20 hover:text-yellow-700 dark:hover:text-brand-yellow border-gray-200 dark:border-gray-700 hover:border-brand-yellow',
        cardBadge: 'bg-brand-yellow/90 text-black shadow-brand-yellow/50'
    },
    'Eventos': {
        bg: 'bg-brand-red',
        hover: 'hover:bg-red-600',
        text: 'text-white',
        accent: 'card-accent-red',
        filterActive: 'bg-brand-red hover:bg-red-600 border-transparent text-white shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-red/10 dark:hover:bg-brand-red/20 hover:text-brand-red border-gray-200 dark:border-gray-700 hover:border-brand-red',
        cardBadge: 'bg-brand-red/90 text-white shadow-brand-red/50'
    },
    'Nossa História': {
        bg: 'bg-brand-blue',
        hover: 'hover:bg-brand-darkBlue',
        text: 'text-white',
        accent: 'card-accent-blue',
        filterActive: 'bg-brand-blue hover:bg-brand-darkBlue border-transparent text-white shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 hover:text-brand-blue border-gray-200 dark:border-gray-700 hover:border-brand-blue',
        cardBadge: 'bg-brand-blue/90 text-white shadow-brand-blue/50'
    },
    'Uso Didático': {
        bg: 'bg-brand-yellow',
        hover: 'hover:opacity-90',
        text: 'text-black',
        accent: 'card-accent-yellow',
        filterActive: 'bg-brand-yellow hover:opacity-90 border-transparent text-black shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 dark:hover:bg-brand-yellow/20 hover:text-yellow-700 dark:hover:text-brand-yellow border-gray-200 dark:border-gray-700 hover:border-brand-yellow',
        cardBadge: 'bg-brand-yellow/90 text-black shadow-brand-yellow/50'
    },
    'Convivência': {
        bg: 'bg-brand-red',
        hover: 'hover:bg-red-600',
        text: 'text-white',
        accent: 'card-accent-red',
        filterActive: 'bg-brand-red hover:bg-red-600 border-transparent text-white shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-red/10 dark:hover:bg-brand-red/20 hover:text-brand-red border-gray-200 dark:border-gray-700 hover:border-brand-red',
        cardBadge: 'bg-brand-red/90 text-white shadow-brand-red/50'
    },
    'Central de Anotações': {
        bg: 'bg-brand-yellow',
        hover: 'hover:opacity-90',
        text: 'text-black',
        accent: 'card-accent-yellow',
        filterActive: 'bg-brand-yellow hover:opacity-90 border-transparent text-black shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-yellow/10 dark:hover:bg-brand-yellow/20 hover:text-yellow-700 dark:hover:text-brand-yellow border-gray-200 dark:border-gray-700 hover:border-brand-yellow',
        cardBadge: 'bg-brand-yellow/90 text-black shadow-brand-yellow/50'
    },
    'Mural do Deu Ruim': {
        bg: 'bg-brand-red',
        hover: 'hover:bg-red-600',
        text: 'text-white',
        accent: 'card-accent-red',
        filterActive: 'bg-brand-red hover:bg-red-600 border-transparent text-white shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-red/10 dark:hover:bg-brand-red/20 hover:text-brand-red border-gray-200 dark:border-gray-700 hover:border-brand-red',
        cardBadge: 'bg-brand-red/90 text-white shadow-brand-red/50'
    },
    'Outros': {
        bg: 'bg-gray-500',
        hover: 'hover:bg-gray-600',
        text: 'text-white',
        accent: 'card-accent-gray',
        filterActive: 'bg-gray-500 hover:bg-gray-600 border-transparent text-white shadow-md',
        filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-gray-700 hover:border-gray-400',
        cardBadge: 'bg-gray-500/90 text-white shadow-gray-500/50'
    }
};

export const DEFAULT_STYLE = {
    bg: 'bg-brand-blue',
    hover: 'hover:bg-brand-darkBlue',
    text: 'text-white',
    accent: 'border-t-4 border-t-gray-100 dark:border-t-gray-700',
    filterActive: 'bg-brand-blue hover:bg-brand-darkBlue border-transparent text-white shadow-md',
    filterInactive: 'bg-white dark:bg-form-dark text-gray-600 dark:text-gray-300 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 hover:text-brand-blue border-gray-200 dark:border-gray-700 hover:border-brand-blue',
    cardBadge: 'bg-brand-blue/90 text-white shadow-brand-blue/50'
};
