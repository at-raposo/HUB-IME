'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- CUSTOM BLOCKS ---

export async function getCustomBlocks() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { data, error } = await supabase
        .from('user_custom_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function addCustomBlock(title: string, duration: number) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { data, error } = await supabase
        .from('user_custom_blocks')
        .insert([{ user_id: user.id, title, duration }])
        .select()
        .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function deleteCustomBlock(id: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { error } = await supabase
        .from('user_custom_blocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// --- CALENDAR EVENTS ---

export async function getCalendarEvents() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { data, error } = await supabase
        .from('user_calendar_events')
        .select('*')
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    
    // Map database fields to FullCalendar format
    const events = data.map((item: any) => {
        let sourceType = item.type || 'aula';
        let sourceId = null;
        if (sourceType.includes(':')) {
            const parts = sourceType.split(':');
            sourceType = parts[0];
            sourceId = parts[1];
        }

        return {
            id: item.id,
            title: item.title,
            start: item.start_time,
            end: item.end_time,
            color: item.color,
            extendedProps: {
                trail_id: item.trail_id,
                type: sourceType,
                sourceId: sourceId
            }
        };
    });

    return { success: true, data: events };
}

export async function upsertCalendarEvent(event: any) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    let calculatedEndTime = event.end;
    if (!calculatedEndTime) {
        // If event.end is missing (common on first drop), use duration from extendedProps, or default to 2 hours
        const durationH = event.extendedProps?.duration ? parseFloat(event.extendedProps.duration) : 2;
        calculatedEndTime = new Date(new Date(event.start).getTime() + durationH * 60 * 60 * 1000).toISOString();
    }

    let finalType = event.extendedProps?.type || 'aula';
    // If it's a subject, encode the sourceId in the type column as a workaround for missing columns
    if (['aula', 'estudo'].includes(finalType) && event.extendedProps?.sourceId) {
        finalType = `${finalType}:${event.extendedProps.sourceId}`;
    }

    const payload = {
        user_id: user.id,
        title: event.title,
        start_time: event.start,
        end_time: calculatedEndTime,
        color: event.color,
        type: finalType,
        trail_id: event.extendedProps?.trail_id || null
    };

    if (event.id && !event.id.includes('.')) { // Simple check if it's a UUID or temp ID
        const { data, error } = await supabase
            .from('user_calendar_events')
            .upsert({ id: event.id, ...payload })
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } else {
        const { data, error } = await supabase
            .from('user_calendar_events')
            .insert([payload])
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    }
}

export async function deleteCalendarEvent(id: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { error } = await supabase
        .from('user_calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function resetUserAcademicData() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    try {
        // Fetch all events to filter in memory
        const { data: allEvents, error: fetchErr } = await supabase
            .from('user_calendar_events')
            .select('id, type, trail_id')
            .eq('user_id', user.id);
            
        if (fetchErr) throw fetchErr;

        // The ONLY events from the original Jupiter Web sync are those with exactly type === 'aula' and trail_id === null
        // Any other event (like 'estudo', 'bloco', 'custom', 'aula:XYZ', or dragged classes from radar) should be removed
        const idsToDelete = allEvents
            .filter(e => !(e.type === 'aula' && e.trail_id === null))
            .map(e => e.id);

        // Batch delete the non-original events
        if (idsToDelete.length > 0) {
            const { error: deleteErr } = await supabase
                .from('user_calendar_events')
                .delete()
                .eq('user_id', user.id)
                .in('id', idsToDelete);
                
            if (deleteErr) throw deleteErr;
        }

        // We do NOT delete user_custom_blocks because those are the subjects in the list
        // and the user wants to keep the "original" synced data.
        
        // Clear trail progress
        await supabase.from('user_trail_progress').delete().eq('user_id', user.id);
        
        // Clear completed trails
        await supabase.from('user_completed_trails').delete().eq('user_id', user.id);

        revalidatePath('/ferramentas');
        revalidatePath('/trilhas');
        return { success: true };
    } catch (error: any) {
        console.error('[Reset Error]', error);
        return { success: false, error: 'Falha ao resetar dados acadêmicos.' };
    }
}
export async function syncJupiterData(data: {
    subjects: any[];
    options: {
        [code: string]: {
            linkToCalendar: boolean;
            generateStudy: boolean;
            color: string;
            title: string;
        }
    }
}) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    try {
        const now = new Date();
        const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        
        const eventsToInsert: any[] = [];
        const processedCodes = new Set<string>();

        // Remove previous synced Jupiter blocks to avoid duplicates for the selected codes
        const codesToSync = Object.keys(data.options).filter(code => data.options[code].linkToCalendar);
        
        if (codesToSync.length > 0) {
            await supabase
                .from('user_calendar_events')
                .delete()
                .eq('user_id', user.id)
                .eq('type', 'aula')
                .is('trail_id', null)
                .filter('title', 'ilike', `%${codesToSync.join('%') || '___'}%`); // Simple filter by code
        }

        for (const sub of data.subjects) {
            const opt = data.options[sub.code];
            if (!opt || !opt.linkToCalendar) continue;

            const eventDate = new Date(sunday);
            eventDate.setDate(sunday.getDate() + sub.dayOfWeek);
            
            const [startH, startM] = sub.startTime.split(':').map(Number);
            const [endH, endM] = sub.endTime.split(':').map(Number);
            
            const start = new Date(eventDate);
            start.setHours(startH, startM, 0, 0);
            
            const end = new Date(eventDate);
            end.setHours(endH, endM, 0, 0);

            // 1. Add Class Event
            eventsToInsert.push({
                user_id: user.id,
                title: opt.title,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                color: opt.color,
                type: `aula:${sub.code}`,
                trail_id: null
            });

            // 2. Add Study Block if requested
            if (opt.generateStudy) {
                const durationMs = end.getTime() - start.getTime();
                const studyStart = new Date(end.getTime() + 1 * 60 * 60 * 1000); // 1h gap
                let studyEnd = new Date(studyStart.getTime() + durationMs);

                // Visibility Logic (8:00 - 23:00)
                const startHour = 8;
                const endsTooLate = studyEnd.getHours() >= 23 || (studyEnd.getHours() === 22 && studyEnd.getMinutes() > 30) || (studyEnd.getDate() !== studyStart.getDate());

                if (endsTooLate) {
                    studyStart.setDate(studyStart.getDate() + 1);
                    studyStart.setHours(startHour, 0, 0, 0);
                    studyEnd = new Date(studyStart.getTime() + durationMs);
                }

                eventsToInsert.push({
                    user_id: user.id,
                    title: `📚 Estudo: ${opt.title}`,
                    start_time: studyStart.toISOString(),
                    end_time: studyEnd.toISOString(),
                    color: opt.color,
                    type: `estudo:${sub.code}`,
                    trail_id: null
                });
            }
        }

        if (eventsToInsert.length > 0) {
            const { error } = await supabase.from('user_calendar_events').insert(eventsToInsert);
            if (error) throw error;
        }

        revalidatePath('/ferramentas');
        return { success: true };
    } catch (error: any) {
        console.error('[Sync Error]', error);
        return { success: false, error: error.message };
    }
}
