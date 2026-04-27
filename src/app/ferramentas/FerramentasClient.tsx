'use client';

import React, { useState, useEffect } from 'react';
import { fetchUserAcademicdata } from '@/app/actions/disciplines';
import { 
    X, Eye, Edit3, ChevronLeft, ChevronRight, Search, Plus, Trash2, Info, Loader2, BookOpen, 
    GraduationCap, CalendarDays, FileText, Table, Calendar, MessageSquareCode, Share2,
    RefreshCw, Undo2, Settings
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Draggable } from '@fullcalendar/interaction';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import * as CalendarActions from '@/app/actions/calendar';
import { resetUserAcademicData } from '@/app/actions/calendar';
import { FerramentasFeedbackCard } from './FerramentasFeedbackCard';
import { SubjectSelectorModal } from './SubjectSelectorModal';
import { JupiterSyncModal } from './JupiterSyncModal';

interface CalendarEvent {
    id: string;
    title: string;
    start: any;
    end: any;
    color?: string;
    extendedProps?: any;
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
}

const DISCIPLINE_COLORS = [
    { bg: '#3B82F6', border: '#2563EB', name: 'blue' },
    { bg: '#06B6D4', border: '#0891B2', name: 'cyan' },
    { bg: '#EAB308', border: '#CA8A04', name: 'yellow' },
    { bg: '#F97316', border: '#EA580C', name: 'orange' },
    { bg: '#EF4444', border: '#DC2626', name: 'red' },
];

const getStableColor = (id: string, title?: string) => {
    // Standardize seed: Always use the most unique ID available.
    // For academic: trial_id or code. For custom: block_id.
    const seed = id || title || 'default';
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const colorIndex = Math.abs(hash) % DISCIPLINE_COLORS.length;
    return DISCIPLINE_COLORS[colorIndex];
};

const fixEncoding = (text: string) => {
    if (!text) return '';
    try {
        // If the text looks like Mojibake (contains specific corrupted patterns)
        // we convert it back to bytes and decode as UTF-8
        if (text.includes('Ã')) {
            const bytes = new Uint8Array(text.split('').map(c => c.charCodeAt(0)));
            return new TextDecoder('utf-8').decode(bytes);
        }
        return text;
    } catch (e) {
        return text;
    }
};

const formatEventWithRecurrence = (e: any): CalendarEvent => {
    const isRecurring = e.extendedProps?.type === 'aula' || e.extendedProps?.type === 'estudo';
    const startDate = new Date(e.start);
    const endDate = e.end ? new Date(e.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    
    return {
        ...e,
        color: e.color || getStableColor(e.extendedProps?.sourceId || e.id, e.title).bg,
        ...(isRecurring ? {
            daysOfWeek: [startDate.getDay()],
            startTime: startDate.getHours().toString().padStart(2, '0') + ':' + startDate.getMinutes().toString().padStart(2, '0'),
            endTime: endDate.getHours().toString().padStart(2, '0') + ':' + endDate.getMinutes().toString().padStart(2, '0'),
        } : {})
    };
};

export default function FerramentasClient({ profile }: { profile: any }) {
    const [academicData, setAcademicData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [history, setHistory] = useState<CalendarEvent[][]>([]);
    const [customBlocks, setCustomBlocks] = useState<{id: string, title: string, duration: number}[]>([]);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isJupiterModalOpen, setIsJupiterModalOpen] = useState(false);
    const [newBlockName, setNewBlockName] = useState('');
    const [newBlockDuration, setNewBlockDuration] = useState(2);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [calendarStart, setCalendarStart] = useState('08:00');
    const [calendarEnd, setCalendarEnd] = useState('23:00');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [clipboard, setClipboard] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('edit');
    const [isMobile, setIsMobile] = useState(false);
    const [selectedBlockToAdd, setSelectedBlockToAdd] = useState<any>(null);
    const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const draggableRef = React.useRef<any>(null);
    const calendarRef = React.useRef<any>(null);
    const enrollmentListRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const origStart = calendarStart;
        const origEnd = calendarEnd;

        let minH = 24;
        let maxH = 0;
        
        events.forEach(e => {
            const startH = new Date(e.start).getHours();
            if (startH < minH) minH = startH;
            
            let endH = startH;
            if (e.end) {
                endH = new Date(e.end).getHours();
                const endM = new Date(e.end).getMinutes();
                if (endM > 0) endH++; 
            } else {
                endH = startH + 2; 
            }
            if (endH > maxH) maxH = endH;
        });

        if (events.length === 0) {
            minH = 8;
            maxH = 18;
        }

        const paddedMin = Math.max(0, minH - 1);
        const paddedMax = Math.min(24, maxH + 1);

        setCalendarStart(`${paddedMin.toString().padStart(2, '0')}:00`);
        setCalendarEnd(`${paddedMax.toString().padStart(2, '0')}:00`);
        setIsExportModalOpen(false);

        // Wait to render
        setTimeout(() => {
            window.print();
            // Restore original settings after print dialog closes
            setTimeout(() => {
                setCalendarStart(origStart);
                setCalendarEnd(origEnd);
            }, 1000);
        }, 800);
    };

    const saveToHistory = () => {
        setHistory(prev => [JSON.parse(JSON.stringify(events)), ...prev].slice(0, 10));
    };

    const handleUndo = async () => {
        if (history.length === 0) return;
        
        const prevState = history[0];
        const currentState = [...events];
        setHistory(prev => prev.slice(1));

        // Visual Undo
        setEvents(prevState);
        
        toast.promise(
            (async () => {
                const prevIds = new Set(prevState.map(e => e.id));
                const currentIds = new Set(currentState.map(e => e.id));

                const toReinsert = prevState.filter(e => !currentIds.has(e.id));
                const toDelete = currentState.filter(e => !prevIds.has(e.id));
                const toRevert = prevState.filter(pe => {
                    const ce = currentState.find(c => c.id === pe.id);
                    return ce && (ce.start !== pe.start || ce.end !== pe.end);
                });

                const syncPromises = [];
                for (const event of toReinsert) syncPromises.push(CalendarActions.upsertCalendarEvent(event));
                for (const event of toDelete) syncPromises.push(CalendarActions.deleteCalendarEvent(event.id));
                for (const event of toRevert) syncPromises.push(CalendarActions.upsertCalendarEvent(event));

                await Promise.all(syncPromises);
            })(),
            {
                loading: 'Desfazendo alteração...',
                success: 'Alteração desfeita!',
                error: 'Erro ao sincronizar no servidor'
            }
        );
    };

    useEffect(() => {
        const handleKeys = async (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

            // Delete / Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEventIds.length > 0) {
                saveToHistory();
                const toDelete = [...selectedEventIds];
                setEvents(prev => prev.filter(ev => !toDelete.includes(ev.id)));
                setSelectedEventIds([]);
                await Promise.all(toDelete.map(id => CalendarActions.deleteCalendarEvent(id)));
                toast.success(`${toDelete.length > 1 ? toDelete.length + ' eventos removidos' : 'Evento removido'}`);
                return;
            }

            // Ctrl + C (Copy)
            if (e.ctrlKey && e.key.toLowerCase() === 'c' && selectedEventIds.length > 0) {
                setClipboard([...selectedEventIds]);
                toast.success(`${selectedEventIds.length > 1 ? selectedEventIds.length + ' eventos copiados' : 'Evento copiado'}`);
                return;
            }

            // Ctrl + V (Paste)
            if (e.ctrlKey && e.key.toLowerCase() === 'v' && clipboard.length > 0) {
                saveToHistory();
                const toDuplicate = events.filter(ev => clipboard.includes(ev.id));
                if (toDuplicate.length === 0) return;

                const newEvents: CalendarEvent[] = toDuplicate.map(ev => ({
                    ...ev,
                    id: Math.random().toString(), // Temp ID
                    title: `${ev.title} (Cópia)`
                }));

                setEvents(prev => [...prev, ...newEvents]);
                
                toast.promise(
                    Promise.all(newEvents.map(async (ev) => {
                        const res = await CalendarActions.upsertCalendarEvent(ev);
                        if (res.success && res.data) {
                            setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, id: res.data.id } : e));
                        }
                    })),
                    {
                        loading: 'Duplicando eventos...',
                        success: 'Eventos duplicados!',
                        error: 'Erro ao duplicar'
                    }
                );
                return;
            }

            // Ctrl + Z (Undo)
            if (e.ctrlKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                handleUndo();
            }
        };

        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [selectedEventIds, events, clipboard, history]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleAddTurma = async (subject: any, turma: any) => {
        const DOW_MAP: Record<string, number> = {
            'dom': 0, 'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5, 'sab': 6, 'sáb': 6
        };
        const today = new Date();
        const currentDay = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);
        startOfWeek.setHours(0,0,0,0);

        const newEvents: CalendarEvent[] = [];
        let addedCount = 0;

        for (const h of turma.horarios) {
            const parts = h.toLowerCase().split(' ');
            if (parts.length >= 3) {
                const dayStr = parts[0];
                const startStr = parts[1];
                const endStr = parts[2];

                const dow = DOW_MAP[dayStr] ?? 1;
                const eventDate = new Date(startOfWeek);
                eventDate.setDate(startOfWeek.getDate() + dow);
                
                const startDateStr = `${eventDate.toISOString().split('T')[0]}T${startStr}:00`;
                const endDateStr = `${eventDate.toISOString().split('T')[0]}T${endStr}:00`;

                const seed = subject.codigo;
                let hash = 0;
                for (let i = 0; i < seed.length; i++) { hash = ((hash << 5) - hash) + seed.charCodeAt(i); hash |= 0; }
                const colors = ['#3B82F6', '#EF4444', '#EAB308'];
                const color = colors[Math.abs(hash) % colors.length];

                const tempId = Math.random().toString();
                const durationHours = (new Date(endDateStr).getTime() - new Date(startDateStr).getTime()) / 3600000;
                
                const baseEvent = {
                    id: tempId,
                    title: subject.nome || subject.codigo,
                    start: startDateStr,
                    end: endDateStr,
                    color: color,
                    extendedProps: { type: 'aula', sourceId: subject.codigo, duration: durationHours.toString() }
                };
                const event = formatEventWithRecurrence(baseEvent);
                newEvents.push(event);
                addedCount++;

                // Add 1:1 study block (8h-22h)
                const durationMs = new Date(endDateStr).getTime() - new Date(startDateStr).getTime();
                const { start: studyStart, end: studyEnd } = calculateStudyTime(endDateStr, durationMs);
                
                const studyEvent = {
                    id: Math.random().toString(),
                    title: `📚 Estudo: ${subject.nome || subject.codigo}`,
                    start: studyStart,
                    end: studyEnd,
                    color: '#10B981',
                    extendedProps: { type: 'estudo', sourceId: subject.codigo, duration: (durationMs / 3600000).toString() }
                };
                newEvents.push(studyEvent);
            }
        }

        if (addedCount === 0) {
            toast.error('Nenhum horário válido encontrado na turma.');
            return;
        }

        setEvents(prev => [...prev, ...newEvents]);
        setIsSubjectModalOpen(false);
        toast.success(`Turma ${turma.codigo} de ${subject.codigo} adicionada à grade!`);

        for (const event of newEvents) {
            const res = await CalendarActions.upsertCalendarEvent(event);
            if (res.success && res.data) {
                 setEvents(prev => prev.map(e => e.id === event.id ? { ...e, id: res.data.id } : e));
            }
        }
    };

    const handleRemoveTurma = async (subjectCode: string) => {
        const toDelete = events.filter(e => e.extendedProps?.sourceId === subjectCode);
        if (toDelete.length === 0) return;

        setEvents(prev => prev.filter(e => e.extendedProps?.sourceId !== subjectCode));
        toast.success(`${subjectCode} removida da grade.`);

        const promises = toDelete.map(e => CalendarActions.deleteCalendarEvent(e.id));
        await Promise.all(promises);
    };

    const handleDeleteEvent = async (eventId: string) => {
        setEvents(prev => prev.filter(e => e.id !== eventId));
        setSelectedEventIds(prev => prev.filter(id => id !== eventId));
        toast.success('Evento removido!');
        await CalendarActions.deleteCalendarEvent(eventId);
    };

    const toggleCursando = async (e: React.MouseEvent, trailId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUpdating) return;
        setIsUpdating(trailId);

        try {
            const { error } = await supabase.rpc('toggle_trail_status', {
                p_trail_id: trailId,
                p_status: 'cursando'
            });

            if (error) throw error;

            toast('Removida do radar atual', { icon: '📡' });
            
            // Update local state
            setAcademicData((prev: any) => ({
                ...prev,
                inProgress: prev.inProgress.filter((p: any) => p.trail_id !== trailId)
            }));
            
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar radar');
        } finally {
            setIsUpdating(null);
        }
    };

    const calculateStudyTime = (endDateStr: string, durationMs: number) => {
        const bufferOffset = 3600000; // 1 hour buffer
        const studyStart = new Date(new Date(endDateStr).getTime() + bufferOffset);
        let studyEnd = new Date(studyStart.getTime() + durationMs);

        const startHour = 8;
        // Move to next day 08:00 if the study block would end after 22:30
        // (Assuming the user's calendar view ends at 23:00)
        const endsTooLate = studyEnd.getHours() >= 23 || (studyEnd.getHours() === 22 && studyEnd.getMinutes() > 30) || (studyEnd.getDate() !== studyStart.getDate());

        if (endsTooLate) {
            // Move to next day 08:00
            studyStart.setDate(studyStart.getDate() + 1);
            studyStart.setHours(startHour, 0, 0, 0);
            studyEnd = new Date(studyStart.getTime() + durationMs);
        }

        return {
            start: studyStart.toISOString(),
            end: studyEnd.toISOString()
        };
    };

    const handleReset = async () => {
        if (!confirm('🚨 ATENÇÃO: Isso apagará permanentemente todos os seus eventos da grade e blocos customizados. Deseja continuar?')) {
            return;
        }
        saveToHistory();

        setIsResetting(true);
        try {
            const res = await resetUserAcademicData();
            if (res.success) {
                // Fetch fresh data instead of reloading
                const eventsRes = await CalendarActions.getCalendarEvents();
                if (eventsRes.success && eventsRes.data) {
                    setEvents(eventsRes.data.map(formatEventWithRecurrence));
                }
                
                toast.success('Grade resetada! Suas aulas oficiais foram mantidas.');
            } else {
                toast.error(res.error || 'Erro ao resetar dados.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro crítico ao resetar dados.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleAutoGenerateStudy = async () => {
        saveToHistory();
        setIsUpdating('auto-study');
        let generated = 0;
        const newEvents: CalendarEvent[] = [];

        for (const event of events) {
            if (event.extendedProps?.type === 'aula' || event.extendedProps?.type === 'custom') {
                const durationMs = new Date(event.end).getTime() - new Date(event.start).getTime();
                const { start: studyStart, end: studyEnd } = calculateStudyTime(event.end, durationMs);
                
                const cleanTitle = event.title.replace('🎓 Aula: ', '');
                const titleParts = cleanTitle.split(' - ');
                const subjectName = titleParts.length > 1 ? titleParts[1].trim() : titleParts[0].trim();
                const studyTitle = `📚 Estudo: ${subjectName}`;

                const alreadyExists = events.find(e => 
                    e.extendedProps?.type === 'estudo' && 
                    (event.extendedProps?.sourceId 
                        ? e.extendedProps?.sourceId === event.extendedProps?.sourceId 
                        : e.title === studyTitle) && 
                    Math.abs(new Date(e.start).getTime() - new Date(studyStart).getTime()) < 60000
                );

                if (!alreadyExists) {
                    const studyEvent: CalendarEvent = {
                        id: Math.random().toString(),
                        title: studyTitle,
                        start: studyStart,
                        end: studyEnd,
                        color: '#10B981',
                        extendedProps: { type: 'estudo', sourceId: event.extendedProps.sourceId, duration: (durationMs / 3600000).toString() }
                    };
                    newEvents.push(studyEvent);
                    generated++;
                }
            }
        }

        if (generated > 0) {
            setEvents(prev => [...prev, ...newEvents]);
            for (const sem of newEvents) {
                await CalendarActions.upsertCalendarEvent(sem);
            }
            const disciplinesNames = Array.from(new Set(newEvents.map(e => e.title.replace('📚 Estudo: ', ''))));
            toast.success(`${generated} blocos gerados para: ${disciplinesNames.join(', ')}`);
        } else {
            toast('Todos os blocos de estudo já estão na grade.', { icon: '✨' });
        }
        setIsUpdating(null);
    };


    const loadData = async () => {
        setIsLoading(true);
        const [academicRes, calendarRes, blocksRes] = await Promise.all([
            fetchUserAcademicdata(),
            CalendarActions.getCalendarEvents(),
            CalendarActions.getCustomBlocks()
        ]);

        if (academicRes.success) {
            setAcademicData(academicRes.data);
        }
        if (calendarRes.success) {
            const verifiedEvents = (calendarRes.data as any[]).map(formatEventWithRecurrence);
            setEvents(verifiedEvents);
        }
        if (blocksRes.success) {
            setCustomBlocks(blocksRes.data as any);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Setup Draggable for enrollment items
    useEffect(() => {
        const draggableEl = enrollmentListRef.current;
        if (draggableEl) {
            // Cleanup previous instance if any
            if (draggableRef.current) {
                draggableRef.current.destroy();
                draggableRef.current = null;
            }

            draggableRef.current = new Draggable(draggableEl, {
                itemSelector: '.draggable-item',
                eventData: function(eventEl: any) {
                    const title = eventEl.getAttribute('data-title');
                    const code = eventEl.getAttribute('data-code');
                    const id = eventEl.getAttribute('data-id');
                    const type = eventEl.getAttribute('data-type') || 'aula';
                    const durationVal = eventEl.getAttribute('data-duration') || '02:00';
                    
                    // CRITICAL: The seed must match the menu's seed exactly
                    const seed = id || code || 'fallback';
                    const colorData = getStableColor(seed, title);
                    
                    // Convert float duration to HH:mm:ss for FullCalendar
                    let formattedDuration = durationVal;
                    if (!durationVal.includes(':')) {
                        const numericDuration = parseFloat(durationVal);
                        const hours = Math.floor(numericDuration);
                        const minutes = Math.round((numericDuration - hours) * 60);
                        formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                    }
                    
                    return {
                        title: type === 'custom' ? title : `${type === 'estudo' ? '📚 Estudo' : '🎓 Aula'}: ${title}`,
                        duration: formattedDuration,
                        color: colorData.bg,
                        extendedProps: { code, type, sourceId: seed, trail_id: type !== 'custom' ? id : null, duration: durationVal }
                    };
                }
            });
        }
        return () => {
            if (draggableRef.current) {
                draggableRef.current.destroy();
                draggableRef.current = null;
            }
        };
    }, [isLoading, academicData, customBlocks, viewMode]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-8 animate-pulse p-6">
                {/* Stats Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-white/5 rounded-[32px]" />
                    ))}
                </div>
                
                {/* Actions Skeleton */}
                <div className="flex gap-3 py-4">
                    <div className="h-12 w-32 bg-gray-200 dark:bg-white/5 rounded-2xl" />
                    <div className="h-12 w-48 bg-gray-200 dark:bg-white/5 rounded-2xl" />
                    <div className="h-12 w-40 bg-gray-200 dark:bg-white/5 rounded-2xl" />
                </div>

                {/* Main Content Skeleton */}
                <div className="bg-gray-200 dark:bg-white/5 h-[600px] rounded-[40px]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 print:space-y-0 print:animate-none">
            <style jsx global>{`
                .fc { --fc-border-color: rgba(var(--brand-blue-rgb), 0.1); }
                .dark .fc { --fc-border-color: rgba(255, 255, 255, 0.03); }
                
                .fc-theme-standard .fc-scrollgrid { 
                    border: 0 !important; 
                }
                .fc-theme-standard td, .fc-theme-standard th {
                    border: 0 !important;
                }
                /* Re-enable major slot borders (solid) and minor (dashed via gradient) */
                .fc-timegrid-slots td {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
                }
                .fc-timegrid-slot-minor {
                    border-bottom: 0 !important;
                    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.15) 50%, transparent 50%) !important;
                    background-position: bottom !important;
                    background-size: 6px 1px !important;
                    background-repeat: repeat-x !important;
                }
                .fc-toolbar-chunk .fc-button {
                    border-radius: 9999px !important;
                    text-transform: lowercase !important;
                    font-weight: 800 !important;
                    padding: 8px 20px !important;
                    background-color: rgba(15, 71, 128, 0.1) !important;
                    border: 1px solid rgba(15, 71, 128, 0.2) !important;
                    color: #0F4780 !important;
                    margin: 0 6px !important;
                    transition: all 0.2s;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                .fc-toolbar-chunk .fc-button:hover, .fc-button-active {
                    background-color: #0F4780 !important;
                    color: white !important;
                }
                .fc-toolbar-title {
                    margin: 0 32px !important;
                    font-weight: 900 !important;
                    font-size: 1.25rem !important;
                }
                
                /* 🏆 Premium Dot Resizer: Only at the bottom */
                .fc-event-resizer {
                    width: 100% !important;
                    height: 12px !important;
                    background: transparent !important;
                    border: 0 !important;
                    box-shadow: none !important;
                    opacity: 1 !important;
                    right: 0 !important;
                    left: 0 !important;
                    bottom: -2px !important;
                    z-index: 50 !important;
                    cursor: ns-resize !important;
                }

                .fc-event-resizer-y-top {
                    display: none !important;
                }
                
                .fc-v-event {
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .fc-event-selected, .fc-event:active {
                    z-index: 100 !important;
                    transform: scale(1.02);
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                .fc .fc-timegrid-slot { height: 4em !important; }
                .fc-timegrid-slot-label { border-bottom: 0 !important; }
                
                .fc-v-event { 
                    border: 0 !important; 
                    border-radius: 12px !important; 
                    padding: 4px !important; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                    background-image: linear-gradient(135deg, rgba(255,255,255,0.2), transparent) !important;
                }
                .dark .fc-v-event {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
                    background-image: linear-gradient(135deg, rgba(255,255,255,0.1), transparent) !important;
                }

                .fc-v-event .fc-event-main { 
                    color: white !important; 
                    font-weight: 800 !important; 
                    font-size: 7px !important;
                    text-transform: uppercase;
                    line-height: 1.0;
                    letter-spacing: -0.02em;
                    padding: 2px 4px !important;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }
                
                .fc-timegrid-axis-cushion, .fc-timegrid-slot-label-cushion { 
                    color: rgba(0, 0, 0, 0.4) !important; 
                    font-weight: 900 !important; 
                    font-size: 9px !important; 
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em;
                }
                .dark .fc-timegrid-axis-cushion, .dark .fc-timegrid-slot-label-cushion {
                    color: rgba(255, 255, 255, 0.2) !important;
                }

                .fc-col-header-cell, .fc-timegrid-axis, .fc-scrollgrid, .fc-theme-standard th {
                    background-color: transparent !important;
                    background: transparent !important;
                    border: 0 !important;
                }
                .dark .fc-col-header-cell, .dark .fc-timegrid-axis, .dark .fc-scrollgrid, .dark .fc-theme-standard th {
                    background-color: transparent !important;
                    background: transparent !important;
                    border: 0 !important;
                }

                .fc-col-header-cell-cushion { 
                    font-weight: 900 !important; 
                    font-size: 11px !important; 
                    text-transform: uppercase !important; 
                    letter-spacing: 0.1em !important; 
                    padding: 16px 0 !important; 
                    text-decoration: none !important;
                }
                
                .fc-day-sun .fc-col-header-cell-cushion { color: #888 !important; }
                .fc-day-mon .fc-col-header-cell-cushion, .fc-day-thu .fc-col-header-cell-cushion { color: #3b82f6 !important; }
                .fc-day-tue .fc-col-header-cell-cushion, .fc-day-fri .fc-col-header-cell-cushion { color: #ef4444 !important; }
                .fc-day-wed .fc-col-header-cell-cushion, .fc-day-sat .fc-col-header-cell-cushion { color: #eab308 !important; }

                .fc-timegrid-col.fc-day-sun, .fc-timegrid-col.fc-day-mon, .fc-timegrid-col.fc-day-thu { background-color: rgba(59, 130, 246, 0.25) !important; }
                .fc-timegrid-col.fc-day-tue, .fc-timegrid-col.fc-day-fri { background-color: rgba(239, 68, 68, 0.25) !important; }
                .fc-timegrid-col.fc-day-wed, .fc-timegrid-col.fc-day-sat { background-color: rgba(234, 179, 8, 0.25) !important; }

                .dark .fc-timegrid-col.fc-day-sun, .dark .fc-timegrid-col.fc-day-mon, .dark .fc-timegrid-col.fc-day-thu { background-color: rgba(59, 130, 246, 0.1) !important; }
                .dark .fc-timegrid-col.fc-day-tue, .dark .fc-timegrid-col.fc-day-fri { background-color: rgba(239, 68, 68, 0.1) !important; }
                .dark .fc-timegrid-col.fc-day-wed, .dark .fc-timegrid-col.fc-day-sat { background-color: rgba(234, 179, 8, 0.1) !important; }

                .fc-timegrid-now-indicator-line { border-color: #3b82f6 !important; border-width: 2px !important; opacity: 0.5; }
                .fc-timegrid-now-indicator-arrow { border-left-color: #3b82f6 !important; border-right-color: #3b82f6 !important; }
                .fc-scrollgrid { border: 0 !important; }
                .fc-timegrid-col.fc-day-today { background: rgba(59, 130, 246, 0.05) !important; }

                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                    }
                    html, body {
                        width: 100% !important;
                        background: white !important; 
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    nav, aside, footer, header, .print\:hidden, .fc-header-toolbar, 
                    .bg-gradient-to-br, .enrollment-section, #enrollment-list-container,
                    .glass-card > div > div:first-child,
                    button {
                        display: none !important;
                    }
                    /* Remove limitations do Modal do Cronograma para não cortar nas bordas */
                    .fixed.inset-0.z-\[100\] { position: relative !important; inset: auto !important; }
                    .absolute.inset-0.bg-black\/80 { display: none !important; }
                    .relative.bg-\[\#1e1e1e\] { max-height: none !important; height: auto !important; overflow: visible !important; border: none !important; padding: 0 !important; box-shadow: none !important; margin: 0 !important; max-width: 100% !important; background: white !important; }
                    
                    .glass-card { background: white !important; border: 0 !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
                    .fc { background: white !important; height: auto !important; }
                    
                    /* Remove the forced white/gray backgrounds on events so their actual color shines through */
                    .fc-v-event { box-shadow: none !important; border: 1px solid rgba(0,0,0,0.1) !important; }
                    .fc-event-main { color: white !important; text-shadow: none !important; }
                    
                    .fc-col-header-cell-cushion, .fc-timegrid-axis-cushion, .fc-timegrid-slot-label-cushion { color: #333 !important; }
                    .main-content-layout { padding: 0 !important; margin: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important;}
                    .calendar-container { width: 100% !important; height: auto !important; overflow: visible !important; border: none !important; padding: 0 !important; background: white !important; zoom: 0.82; }
                    .fc-scroller { overflow: visible !important; height: auto !important; }
                    
                    #grade-horaria-actions { display: none !important; }
                }
            `}</style>

            <header className="flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
                <div className="space-y-2">
                    <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Grade <span className="text-brand-blue">Horária</span>
                    </h1>
                    <p className="text-gray-400 font-medium italic">Seu cockpit de navegação pelo IFUSP.</p>
                </div>

            </header>

            <FerramentasFeedbackCard className="block lg:hidden" />

            {/* Action Buttons - Premium Refined Layout */}
            <div id="grade-horaria-actions" className="flex flex-wrap items-center gap-3 py-4 border-t border-gray-100 dark:border-white/5">
                <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shadow-sm group"
                    title="Resetar todos os dados de estudos"
                >
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    <span className="inline">Resetar Grade</span>
                </button>
                <button
                    onClick={handleAutoGenerateStudy}
                    disabled={isUpdating === 'auto-study'}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-yellow hover:text-white transition-all disabled:opacity-50 shadow-sm group"
                    title="Gerar 1h de estudo para cada 1h de aula na grade"
                >
                    {isUpdating === 'auto-study' ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    <span className="inline">Gerar Estudos (1:1)</span>
                </button>
                <button
                    onClick={() => setIsJupiterModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all disabled:opacity-50 shadow-sm group"
                    title="Sincronizar com sistema USP"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="inline">Sincronizar Júpiter</span>
                </button>
            </div>


            <div className="bg-transparent min-h-[600px] rounded-[40px] overflow-hidden">
                <div className="p-8 h-full flex flex-col gap-12">
                    <div id="enrollment-drop-zone" className={`space-y-6 enrollment-section print:hidden transition-all duration-500 overflow-hidden ${viewMode === 'view' ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[2000px] opacity-100'}`}>
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-black uppercase text-brand-blue tracking-widest flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                Turmas disponíveis
                            </h4>
                            <div className="flex items-center gap-4">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hidden sm:block">
                                    Arraste os blocos abaixo para o cronograma
                                </p>
                                <button
                                    onClick={() => setIsSubjectModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#00A3FF]/10 text-[#00A3FF] border border-[#00A3FF]/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00A3FF] hover:text-white transition-all shrink-0"
                                >
                                    <Search className="w-3 h-3" />
                                    Buscar Turmas
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shrink-0"
                                >
                                    <Plus className="w-3 h-3" />
                                    Criar Bloco
                                </button>
                            </div>
                        </div>
                        
                        <div className="relative group/scroll">
                            <button
                                onClick={() => enrollmentListRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 p-2 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-brand-blue transition-opacity flex"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => enrollmentListRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 p-2 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-brand-blue transition-opacity flex"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <div id="enrollment-list" ref={enrollmentListRef} className="flex flex-row overflow-x-auto snap-x gap-4 pb-4 scrollbar-hide scroll-smooth relative px-8 sm:px-0">
                                {customBlocks.map((block) => {
                                    const colorData = getStableColor(block.id, block.title);
                                    return (
                                        <div key={block.id} className="space-y-2 snap-start">
                                            <div 
                                                onClick={() => {
                                                    if (isMobile) {
                                                        if (selectedBlockToAdd?.id === block.id) {
                                                            setSelectedBlockToAdd(null);
                                                        } else {
                                                            const colorData = getStableColor(block.id, block.title);
                                                            setSelectedBlockToAdd({
                                                                id: Math.random().toString(),
                                                                title: block.title,
                                                                type: 'custom',
                                                                color: colorData.bg,
                                                                extendedProps: { code: null, type: 'custom', sourceId: block.id, trail_id: null, duration: block.duration.toString() }
                                                            });
                                                        }
                                                    }
                                                }}
                                                data-title={block.title}
                                                data-type="custom"
                                                data-id={block.id}
                                                data-color={colorData.bg}
                                                data-duration={block.duration.toString()}
                                                className={`group draggable-item p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing shadow-lg relative print:hidden sm:min-w-0 min-w-[240px] ${selectedBlockToAdd?.extendedProps?.sourceId === block.id ? 'ring-2 ring-offset-2 ring-offset-black ring-white' : ''}`}
                                                style={{ 
                                                    borderLeft: `6px solid ${colorData.bg}`,
                                                    backgroundColor: `${colorData.bg}40`,
                                                    borderColor: `${colorData.bg}30`
                                                }}
                                            >
                                                <div className="text-[10px] font-black uppercase mb-1" style={{ color: colorData.bg }}>Customizado</div>
                                                <div className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1">{fixEncoding(block.title)}</div>
                                                <div className="mt-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                    Duração: {block.duration}h
                                                </div>

                                                {viewMode === 'edit' && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            const res = await CalendarActions.deleteCustomBlock(block.id);
                                                            if (res.success) {
                                                                setCustomBlocks(prev => prev.filter(b => b.id !== block.id));
                                                                toast.success('Bloco removido');
                                                            } else {
                                                                toast.error('Erro ao remover bloco');
                                                            }
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {academicData?.inProgress?.length > 0 ? (
                                    academicData.inProgress.map((p: any) => {
                                        const seed = p.trail_id || p.course_code || p.id;
                                        const colorData = getStableColor(seed, p.learning_trails?.title);
                                        return (
                                            <div key={p.id} className="space-y-2 snap-start">
                                                <div 
                                                    onClick={() => {
                                                        if (isMobile) {
                                                            if (selectedBlockToAdd?.extendedProps?.sourceId === seed && selectedBlockToAdd?.extendedProps?.type === 'aula') {
                                                                setSelectedBlockToAdd(null);
                                                            } else {
                                                                setSelectedBlockToAdd({
                                                                    id: Math.random().toString(),
                                                                    title: `🎓 Aula: ${p.learning_trails?.title}`,
                                                                    type: 'aula',
                                                                    color: colorData.bg,
                                                                    extendedProps: { code: p.course_code, type: 'aula', sourceId: seed, trail_id: seed, duration: "02:00" }
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    data-title={p.learning_trails?.title}
                                                    data-code={p.course_code}
                                                    data-type="aula"
                                                    data-id={seed}
                                                    data-duration="02:00"
                                                    className={`group draggable-item p-4 rounded-2xl border transition-all cursor-grab active:cursor-grabbing shadow-sm relative overflow-hidden print:hidden sm:min-w-0 min-w-[240px] ${selectedBlockToAdd?.extendedProps?.sourceId === seed && selectedBlockToAdd?.extendedProps?.type === 'aula' ? 'ring-2 ring-offset-2 ring-offset-black ring-white' : ''}`}
                                                    style={{ 
                                                        borderLeft: `6px solid ${colorData.bg}`,
                                                        backgroundColor: `${colorData.bg}40`,
                                                        borderColor: `${colorData.bg}30`
                                                    }}
                                                >
                                                    <div className="text-[10px] font-black uppercase mb-1" style={{ color: colorData.bg }}>{p.course_code || 'IFUSP'}</div>
                                                    <div className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1 group-hover:text-brand-blue transition-colors">
                                                        {fixEncoding(p.learning_trails?.title) || 'Disciplina'}
                                                    </div>
                                                    <div className="mt-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                        Bloco: Aula
                                                    </div>

                                                    <button
                                                        onClick={(e) => toggleCursando(e, p.trail_id)}
                                                        disabled={isUpdating === p.trail_id}
                                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                        title="Remover matrícula"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                                <div 
                                                    onClick={() => {
                                                        if (isMobile) {
                                                            if (selectedBlockToAdd?.extendedProps?.sourceId === seed && selectedBlockToAdd?.extendedProps?.type === 'estudo') {
                                                                setSelectedBlockToAdd(null);
                                                            } else {
                                                                setSelectedBlockToAdd({
                                                                    id: Math.random().toString(),
                                                                    title: `📚 Estudo: ${p.learning_trails?.title}`,
                                                                    type: 'estudo',
                                                                    color: colorData.bg,
                                                                    extendedProps: { code: p.course_code, type: 'estudo', sourceId: seed, trail_id: seed, duration: "02:00" }
                                                                });
                                                            }
                                                        }
                                                    }}
                                                    data-title={p.learning_trails?.title}
                                                    data-code={p.course_code}
                                                    data-type="estudo"
                                                    data-id={seed}
                                                    data-duration="02:00"
                                                    className={`draggable-item p-3 bg-gray-200 dark:bg-white/5 rounded-2xl border border-gray-300 dark:border-white/10 group hover:border-gray-400 dark:hover:border-white/30 transition-all cursor-grab active:cursor-grabbing shadow-sm print:hidden ${selectedBlockToAdd?.extendedProps?.sourceId === seed && selectedBlockToAdd?.extendedProps?.type === 'estudo' ? 'ring-2 ring-offset-2 ring-offset-black ring-white' : ''}`}
                                                >
                                                    <div className="text-[9px] font-bold text-gray-700 dark:text-gray-400 uppercase">
                                                        Bloco: Estudo
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex items-center justify-center p-12 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">Nenhuma matrícula identificada</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Cronograma Semanal</h3>
                            <div className="flex flex-col gap-2 items-end">
                                {/* Row 1: Excluir and Info */}
                                <div className="flex items-center gap-3">
                                    <div 
                                        id="calendar-trash"
                                        onClick={async () => {
                                            if (selectedEventIds.length > 0) {
                                                saveToHistory();
                                                const toDelete = [...selectedEventIds];
                                                setEvents(prev => prev.filter(e => !toDelete.includes(e.id)));
                                                setSelectedEventIds([]);
                                                await Promise.all(toDelete.map(id => CalendarActions.deleteCalendarEvent(id)));
                                                toast.success(`${toDelete.length > 1 ? toDelete.length + ' eventos removidos' : 'Evento removido'}`);
                                            } else if (isMobile) {
                                                toast.error('Selecione um bloco no calendário primeiro');
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl transition-all hover:bg-red-500 hover:text-white cursor-pointer ${viewMode === 'view' ? 'hidden' : ''}`}
                                        title="Arraste aqui para excluir, ou clique após selecionar o bloco"
                                    >
                                        <Trash2 className="w-4 h-4 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Excluir</span>
                                    </div>
                                    <button
                                        onClick={handleUndo}
                                        disabled={history.length === 0}
                                        className={`p-2.5 rounded-2xl bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 hover:bg-brand-yellow hover:text-black transition-all active:scale-95 disabled:opacity-30 ${viewMode === 'view' ? 'hidden' : ''}`}
                                        title="Desfazer última alteração"
                                    >
                                        <Undo2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsHelpModalOpen(true)}
                                        className="p-2.5 rounded-2xl bg-brand-blue/10 text-brand-blue border border-brand-blue/20 hover:bg-brand-blue/20 transition-all active:scale-95"
                                        title="Como usar o cronograma?"
                                    >
                                        <Info className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Row 2: Ver Cronograma and Exportar */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsSettingsOpen(true)}
                                        className="p-2.5 rounded-2xl bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red hover:text-white transition-all active:scale-95"
                                        title="Configurações de Horário"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode(prev => prev === 'view' ? 'edit' : 'view')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all border ${
                                            viewMode === 'view' 
                                                ? 'bg-brand-yellow text-black border-brand-yellow shadow-lg shadow-brand-yellow/20' 
                                                : 'bg-brand-yellow/10 dark:bg-brand-yellow/5 border-brand-yellow/20 dark:border-brand-yellow/10 text-brand-yellow hover:bg-brand-yellow hover:text-black'
                                        }`}
                                    >
                                        {viewMode === 'view' ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {isMobile ? 'Ver / Editar' : (viewMode === 'view' ? 'Editar Cronograma' : 'Ver Cronograma')}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setIsExportModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 dark:bg-brand-blue/5 border border-brand-blue/20 dark:border-brand-blue/10 text-brand-blue rounded-2xl transition-all hover:bg-brand-blue hover:text-white"
                                        title="Exportar Calendário"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Exportar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                
                        <div className={`bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden print:overflow-visible transition-all ${viewMode === 'view' ? 'bg-gray-50/50 dark:bg-[#121212] border-brand-blue/10' : 'print:border-none print:bg-white print:p-0 print:m-0'}`}>
                            {viewMode === 'view' ? (
                                <div className="relative group/view-scroll">
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('view-calendar-scroll');
                                            el?.scrollBy({ left: -300, behavior: 'smooth' });
                                        }}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 p-2 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-brand-blue transition-opacity flex"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('view-calendar-scroll');
                                            el?.scrollBy({ left: 300, behavior: 'smooth' });
                                        }}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 p-2 bg-white dark:bg-[#1a1a1a] rounded-full shadow-lg border border-gray-200 dark:border-gray-800 text-brand-blue transition-opacity flex"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                    <div id="view-calendar-scroll" className="flex flex-row gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x px-8 sm:px-0">
                                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, dayIdx) => {
                                            const dayEvents = events.filter(e => {
                                                const eventDate = new Date(e.start);
                                                // Support for recurring events (daysOfWeek) or exact date match (getDay)
                                                if (e.daysOfWeek && Array.isArray(e.daysOfWeek)) {
                                                    return e.daysOfWeek.includes(dayIdx);
                                                }
                                                return eventDate.getDay() === dayIdx;
                                            }).sort((a,b) => {
                                                const timeA = new Date(a.start).getHours() * 60 + new Date(a.start).getMinutes();
                                                const timeB = new Date(b.start).getHours() * 60 + new Date(b.start).getMinutes();
                                                return timeA - timeB;
                                            });
                                            const dayColor = dayIdx === 0 ? '#888' : (dayIdx % 3 === 1 ? '#0F4780' : (dayIdx % 3 === 2 ? '#F14343' : '#FFCC00'));
                                            
                                            return (
                                                <div key={dayName} className="flex flex-col gap-4 min-w-[280px] bg-gray-50/80 dark:bg-white/[0.03] rounded-[32px] p-5 border border-transparent dark:border-white/[0.05] snap-start">
                                                    <div className="flex items-center justify-between px-2">
                                                        <span className="text-xs font-black uppercase tracking-widest" style={{ color: dayColor }}>
                                                            {dayName}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 dark:text-white/20">
                                                            {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        {dayEvents.length > 0 ? dayEvents.map(e => (
                                                            <div 
                                                                key={e.id} 
                                                                className="p-4 rounded-[22px] border border-black/5 dark:border-white/10 shadow-lg flex flex-col gap-2 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.05] relative overflow-hidden"
                                                                style={{ 
                                                                    borderLeft: `4px solid ${e.color}`,
                                                                    backgroundColor: `${e.color}40`,
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-black bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full text-gray-700 dark:text-white/70">
                                                                        {new Date(e.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs font-bold leading-tight text-gray-900 dark:text-white mb-1">
                                                                    {e.title}
                                                                </div>
                                                            </div>
                                                        )) : (
                                                            <div className="h-32 flex items-center justify-center border-2 border-dashed border-black/[0.1] dark:border-white/[0.02] rounded-[28px]">
                                                                <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-white/5 tracking-widest">Livre</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <FullCalendar
                                    key={`${viewMode}-${isMobile ? 'mobile' : 'desktop'}`}
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
                                    headerToolbar={isMobile ? {
                                        left: 'prev,next',
                                        center: 'title',
                                        right: 'timeGridDay,timeGridWeek'
                                    } : false}
                                    dayHeaderFormat={{ weekday: 'long' }}
                                    slotMinTime={`${calendarStart}:00`}
                                    slotMaxTime={`${calendarEnd}:00`}
                                    slotDuration="00:30:00"
                                    slotLabelInterval="01:00"
                                    allDaySlot={false}
                                    height="auto"
                                    events={events}
                                    themeSystem="standard"
                                    locale="pt-br"
                                    editable={true}
                                    droppable={true}
                                    selectable={true}
                                    selectMirror={true}
                                    dayMaxEvents={true}
                                    nowIndicator={true}
                                    dateClick={async (info) => {
                                        if (isMobile && selectedBlockToAdd) {
                                            saveToHistory();
                                            const durationStr = selectedBlockToAdd.extendedProps.duration;
                                            let durationHours = 2;
                                            
                                            if (durationStr.includes(':')) {
                                                const parts = durationStr.split(':');
                                                durationHours = parseInt(parts[0]) + (parseInt(parts[1])/60);
                                            } else {
                                                durationHours = parseFloat(durationStr);
                                            }

                                            const tempId = Math.random().toString();
                                            const newEvent: CalendarEvent = {
                                                id: tempId,
                                                title: selectedBlockToAdd.title,
                                                start: info.dateStr,
                                                end: new Date(new Date(info.dateStr).getTime() + durationHours * 60 * 60 * 1000).toISOString(),
                                                color: selectedBlockToAdd.color,
                                                extendedProps: selectedBlockToAdd.extendedProps
                                            };
                                            
                                            setEvents((prev) => [...prev, newEvent]);
                                            setSelectedBlockToAdd(null);
                                            toast.success('Bloco adicionado!');

                                            const res = await CalendarActions.upsertCalendarEvent(newEvent);
                                            if (res.success && res.data) {
                                                setEvents(prev => prev.map(e => e.id === tempId ? { ...e, id: res.data.id } : e));
                                            } else {
                                                toast.error('Erro ao salvar no banco');
                                                setEvents(prev => prev.filter(e => e.id !== tempId));
                                            }
                                        } else if (selectedEventIds.length > 0) {
                                            saveToHistory();
                                            const eventToMove = events.find(e => e.id === selectedEventIds[0]);
                                            if (eventToMove) {
                                                const durationMs = new Date(eventToMove.end).getTime() - new Date(eventToMove.start).getTime();
                                                const newStart = info.dateStr;
                                                const newEnd = new Date(new Date(newStart).getTime() + durationMs).toISOString();
                                                
                                                const updatedEvent = { ...eventToMove, start: newStart, end: newEnd };
                                                setEvents(prev => prev.map(e => e.id === selectedEventIds[0] ? updatedEvent : e));
                                                setSelectedEventIds([]);
                                                toast.success('Horário Atualizado!');
                                                
                                                await CalendarActions.upsertCalendarEvent(updatedEvent);
                                            }
                                        }
                                    }}
                                    eventContent={(eventInfo) => {
                                        const isSelected = selectedEventIds.includes(eventInfo.event.id);
                                        const startStr = eventInfo.event.start?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                        const endStr = eventInfo.event.end?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                        
                                        return (
                                            <div className="flex flex-col h-full w-full p-2 relative group overflow-hidden">
                                                <div className="flex items-start justify-between gap-1 overflow-hidden">
                                                    <span className="text-[7.5px] font-black truncate leading-tight flex-1">
                                                        {eventInfo.event.title}
                                                    </span>
                                                    {isSelected && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteEvent(eventInfo.event.id);
                                                            }}
                                                            className="p-1 bg-brand-red hover:bg-red-600 rounded text-white transition-all shadow-lg active:scale-95"
                                                        >
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-0.5 text-[6.5px] font-bold opacity-80 flex items-center gap-1">
                                                    <span>{startStr}</span>
                                                    <span className="opacity-40">-</span>
                                                    <span>{endStr}</span>
                                                </div>
                                                
                                                {/* Single resize indicator "dot" */}
                                                <div className="mt-auto flex justify-center pb-0.5 pointer-events-none">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm" />
                                                </div>
                                            </div>
                                        );
                                    }}
                                    eventClick={(info) => {
                                        const eventId = info.event.id;
                                        const isCtrlPressed = info.jsEvent.ctrlKey || info.jsEvent.metaKey;

                                        if (isCtrlPressed) {
                                            setSelectedEventIds(prev => 
                                                prev.includes(eventId) 
                                                    ? prev.filter(id => id !== eventId) 
                                                    : [...prev, eventId]
                                            );
                                        } else {
                                            if (selectedEventIds.length === 1 && selectedEventIds[0] === eventId) {
                                                setSelectedEventIds([]);
                                            } else {
                                                setSelectedEventIds([eventId]);
                                                if (isMobile) {
                                                    toast('Bloco Selecionado! Toque na lixeira para excluir ou em outro horário para mover.', { icon: '👆', duration: 3000 });
                                                }
                                            }
                                        }
                                    }}
                                    eventClassNames={(arg) => {
                                        if (selectedEventIds.includes(arg.event.id)) {
                                            return ['ring-4', 'ring-white', 'ring-offset-2', 'ring-offset-black'];
                                        }
                                        return [];
                                    }}
                                    eventReceive={async (info: any) => {
                                        saveToHistory();
                                        const tempId = Math.random().toString();
                                        const baseEvent = {
                                            id: tempId,
                                            title: info.event.title,
                                            start: info.event.start,
                                            end: info.event.end,
                                            color: info.event.backgroundColor,
                                            extendedProps: info.event.extendedProps
                                        };
                                        const newEvent = formatEventWithRecurrence(baseEvent);
                                        
                                        setEvents((prev) => [...prev, newEvent]);
                                        info.event.remove();

                                        // Auto-generate 1:1 study block if it's a class (aula) or custom block
                                        if (newEvent.extendedProps?.type === 'aula' || newEvent.extendedProps?.type === 'custom') {
                                            const durationMs = new Date(newEvent.end).getTime() - new Date(newEvent.start).getTime();
                                            const { start: studyStart, end: studyEnd } = calculateStudyTime(newEvent.end, durationMs);
                                            
                                            const studyEvent: CalendarEvent = {
                                                id: Math.random().toString(),
                                                title: `📚 Estudo: ${newEvent.title.replace('🎓 Aula: ', '')}`,
                                                start: studyStart,
                                                end: studyEnd,
                                                color: '#10B981',
                                                extendedProps: { type: 'estudo', sourceId: newEvent.extendedProps.sourceId, duration: (durationMs / 3600000).toString() }
                                            };
                                            
                                            setEvents(prev => [...prev, studyEvent]);
                                            await CalendarActions.upsertCalendarEvent(studyEvent);
                                        }

                                        const res = await CalendarActions.upsertCalendarEvent(newEvent);
                                        if (res.success && res.data) {
                                            setEvents(prev => prev.map(e => e.id === tempId ? { ...e, id: res.data.id } : e));
                                        } else {
                                            toast.error('Erro ao salvar no banco');
                                            setEvents(prev => prev.filter(e => e.id !== tempId));
                                        }
                                    }}
                                    eventDrop={async (info: any) => {
                                        saveToHistory();
                                        const updatedEvent = {
                                            id: info.event.id,
                                            title: info.event.title,
                                            start: info.event.start,
                                            end: info.event.end,
                                            color: info.event.backgroundColor,
                                            extendedProps: info.event.extendedProps
                                        };
                                        setEvents((prev) => prev.map((e) => e.id === info.event.id ? updatedEvent : e));
                                        const res = await CalendarActions.upsertCalendarEvent(updatedEvent);
                                    }}
                                    eventResize={async (info: any) => {
                                        saveToHistory();
                                        const updatedEvent = {
                                            id: info.event.id,
                                            title: info.event.title,
                                            start: info.event.start,
                                            end: info.event.end,
                                            color: info.event.backgroundColor,
                                            extendedProps: info.event.extendedProps
                                        };
                                        setEvents((prev) => prev.map((e) => e.id === info.event.id ? updatedEvent : e));
                                        const res = await CalendarActions.upsertCalendarEvent(updatedEvent);
                                    }}
                                    eventDragStop={async (info: any) => {
                                        const x = info.jsEvent.clientX;
                                        const y = info.jsEvent.clientY;

                                        // Check if dropped on trash zone
                                        const trashEl = document.getElementById('calendar-trash');
                                        if (trashEl) {
                                            const rect = trashEl.getBoundingClientRect();
                                            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                                                const eventId = info.event.id;
                                                info.event.remove();
                                                setEvents(prev => prev.filter(e => e.id !== eventId));
                                                await CalendarActions.deleteCalendarEvent(eventId);
                                                toast.success('Evento removido');
                                                return;
                                            }
                                        }

                                        // Check if dropped on enrollment section (Suas Matrículas)
                                        const enrollEl = document.getElementById('enrollment-drop-zone');
                                        if (enrollEl) {
                                            const rect = enrollEl.getBoundingClientRect();
                                            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                                                const eventId = info.event.id;
                                                info.event.remove();
                                                setEvents(prev => prev.filter(e => e.id !== eventId));
                                                await CalendarActions.deleteCalendarEvent(eventId);
                                                toast.success('Bloco devolvido às matrículas');
                                                return;
                                            }
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <SubjectSelectorModal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                onAddTurma={handleAddTurma}
                onRemoveTurma={handleRemoveTurma}
                currentEvents={events}
            />

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative bg-[#1e1e1e] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-6">Novo Bloco</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Nome do Bloco</label>
                                <input 
                                    type="text" 
                                    value={newBlockName}
                                    onChange={(e) => setNewBlockName(e.target.value)}
                                    placeholder="Ex: Almoço, Estudo Individual..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-1">Duração (Horas)</label>
                                <input 
                                    type="number" 
                                    value={newBlockDuration}
                                    onChange={(e) => setNewBlockDuration(Number(e.target.value))}
                                    min="0.5"
                                    max="8"
                                    step="0.5"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-white/5 rounded-2xl font-bold text-xs uppercase text-gray-400">Cancelar</button>
                                <button 
                                    onClick={async () => {
                                        if (newBlockName) {
                                            const res = await CalendarActions.addCustomBlock(newBlockName, newBlockDuration);
                                            if (res.success && res.data) {
                                                setCustomBlocks(prev => [res.data, ...prev]);
                                                setNewBlockName('');
                                                setIsCreateModalOpen(false);
                                                toast.success('Bloco criado!');
                                            } else {
                                                toast.error('Erro ao salvar bloco.');
                                            }
                                        }
                                    }}
                                    className="flex-1 py-3 bg-brand-blue rounded-2xl font-bold text-xs uppercase text-white shadow-lg shadow-brand-blue/20"
                                >
                                    Criar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {isExportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)} />
                    <div className="relative bg-[#1e1e1e] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">Exportar</h3>
                        <p className="text-gray-400 text-xs mb-8">Escolha o formato para salvar seu cronograma.</p>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handlePrint} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group text-left">
                                <div className="size-10 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red"><FileText className="w-5 h-5" /></div>
                                <div><div className="text-sm font-bold text-white uppercase tracking-tight">Salvar como PDF</div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ideal para imprimir</div></div>
                            </button>
                            <button 
                                onClick={() => {
                                    const icsContent = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//IFUSP//Hub LabDiv//PT',...events.map(e => ['BEGIN:VEVENT',`SUMMARY:${e.title}`,`DTSTART:${new Date(e.start).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,`DTEND:${new Date(e.end || new Date(e.start).getTime() + 7200000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,'END:VEVENT'].join('\n')),'END:VCALENDAR'].join('\n');
                                    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'cronograma.ics');
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group text-left"
                            >
                                <div className="size-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue"><CalendarDays className="w-5 h-5" /></div>
                                <div><div className="text-sm font-bold text-white uppercase tracking-tight">Calendário (.ics)</div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Google Agenda / Outlook</div></div>
                            </button>
                            <button 
                                onClick={() => {
                                    const csvHeader = 'Titulo,Inicio,Fim\n';
                                    const csvRows = events.map(e => `"${e.title}","${e.start}","${e.end || ''}"`).join('\n');
                                    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8' });
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', 'cronograma.csv');
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group text-left"
                            >
                                <div className="size-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow"><Table className="w-5 h-5" /></div>
                                <div><div className="text-sm font-bold text-white uppercase tracking-tight">Arquivo CSV (.csv)</div><div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Exportar para Excel</div></div>
                            </button>
                        </div>
                        <button onClick={() => setIsExportModalOpen(false)} className="mt-6 w-full py-4 bg-white/5 rounded-2xl font-bold text-xs uppercase text-gray-500 hover:text-white transition-colors">Fechar</button>
                    </div>
                </div>
            )}

            {isHelpModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsHelpModalOpen(false)} />
                    <div className="relative bg-[#1e1e1e] border border-white/10 rounded-[40px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue border border-brand-blue/20">
                                <Info className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Como utilizar?</h3>
                        </div>

                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="mt-1 size-6 rounded-full bg-brand-blue/20 text-brand-blue font-black flex items-center justify-center text-xs shrink-0 border border-brand-blue/30">1</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">Adicionando Materiais</h4>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">Suas disciplinas cursadas nas <span className="text-white">Trilhas</span> já aparecem nos blocos superiores. Arraste-as (Desktop) ou clique e depois selecione o horário (Celular) no calendário.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 size-6 rounded-full bg-brand-yellow/20 text-brand-yellow font-black flex items-center justify-center text-xs shrink-0 border border-brand-yellow/30">2</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">Crie seus próprios Blocos</h4>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">Você pode criar blocos personalizados (Ex: "Pesquisa na Biblioteca", "Almoço") pelo botão "Criar Bloco" para completar sua grade.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 size-6 rounded-full bg-brand-red/20 text-brand-red font-black flex items-center justify-center text-xs shrink-0 border border-brand-red/30">3</div>
                                <div>
                                    <h4 className="font-bold text-white text-sm mb-1">Edição Rápida</h4>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">Para mover o horário de um bloco no celular, clique nele e em seguida clique no horário de destino. Para remover, clique no bloco e depois no ícone da lixeira vermelha.</p>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wider">Atalhos de Teclado</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-[10px] font-bold text-gray-500">Deletar Bloco</span>
                                    <kbd className="px-2 py-1 bg-white/10 rounded-md text-[9px] font-black text-white">DEL</kbd>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-[10px] font-bold text-gray-500">Duplicar (Copy)</span>
                                    <kbd className="px-2 py-1 bg-white/10 rounded-md text-[9px] font-black text-white">CTRL+C</kbd>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-[10px] font-bold text-gray-500">Duplicar (Paste)</span>
                                    <kbd className="px-2 py-1 bg-white/10 rounded-md text-[9px] font-black text-white">CTRL+V</kbd>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-[10px] font-bold text-gray-500">Desfazer (Undo)</span>
                                    <kbd className="px-2 py-1 bg-white/10 rounded-md text-[9px] font-black text-white">CTRL+Z</kbd>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setIsHelpModalOpen(false)} className="mt-10 w-full py-4 bg-white/5 rounded-2xl font-bold text-xs uppercase text-white hover:bg-brand-blue hover:text-white transition-colors border border-white/10">
                            Entendi!
                        </button>
                    </div>
                </div>
            )}

            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
                    <div className="relative bg-[#1e1e1e] border border-white/10 rounded-[40px] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red border border-brand-red/20">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Visualização</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Horário de Início</label>
                                <select 
                                    value={calendarStart}
                                    onChange={(e) => setCalendarStart(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                                >
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const h = i.toString().padStart(2, '0') + ':00';
                                        return <option key={h} value={h} className="bg-[#1e1e1e]">{h}</option>;
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Horário de Término</label>
                                <select 
                                    value={calendarEnd}
                                    onChange={(e) => setCalendarEnd(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-sm focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                                >
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const h = i.toString().padStart(2, '0') + ':00';
                                        return <option key={h} value={h} className="bg-[#1e1e1e]">{h}</option>;
                                    })}
                                </select>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsSettingsOpen(false)} 
                            className="mt-10 w-full py-4 bg-brand-red text-white rounded-2xl font-bold text-xs uppercase hover:scale-[1.02] transition-transform"
                        >
                            Salvar Configuração
                        </button>
                    </div>
                </div>
            )}
            <JupiterSyncModal 
                isOpen={isJupiterModalOpen} 
                onClose={() => setIsJupiterModalOpen(false)}
                onSuccess={() => {
                    saveToHistory();
                    loadData();
                    toast.success('Grade sincronizada! Você pode desfazer se necessário.');
                }}
            />
        </div>
    );
}
