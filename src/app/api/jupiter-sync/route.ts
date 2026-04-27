import { NextRequest, NextResponse } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const maxDuration = 60;
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    let browser;
    try {
        const body = await req.json();
        const { nUsp, password } = body;

        if (!nUsp || !password) {
            return NextResponse.json({ success: false, error: 'Credenciais ausentes' }, { status: 400 });
        }

        const supabase = await createServerSupabase();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Usuário não autenticado no Hub' }, { status: 401 });
        }

        const isLocal = !process.env.VERCEL_ENV && process.env.NODE_ENV === 'development';
        const executablePath = isLocal
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : await chromium.executablePath();

        browser = await puppeteerCore.launch({
            // @ts-ignore
            args: isLocal ? ['--no-sandbox', '--disable-setuid-sandbox'] : chromium.args,
            // @ts-ignore
            defaultViewport: chromium.defaultViewport,
            executablePath: executablePath,
            // @ts-ignore
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        } as any);
        
        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
        );

        // 1. Go to Login page
        await page.goto('https://uspdigital.usp.br/jupiterweb/webLogin.jsp', { timeout: 30000 });

        // 2. Login
        await page.waitForSelector("input[name='codpes']");
        await page.type('input[name="codpes"]', nUsp);
        await page.type('input[name="senusu"]', password);
        
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.keyboard.press('Enter')
        ]);

        // Check for login error (if the login form is still there or an alert exists)
        const isLoginFailed = await page.evaluate(() => {
            return document.body.innerText.includes('Usuário e/ou senha inválido(s)') || 
                   document.body.innerText.includes('Incorreto');
        });

        if (isLoginFailed) {
            throw new Error('Credenciais do JupiterWeb inválidas.');
        }

        // 3. Navigate to Grade Horária
        await page.goto('https://uspdigital.usp.br/jupiterweb/gradeHoraria?codmnu=4759', { waitUntil: 'load', timeout: 30000 });

        // Wait for the select to appear
        await page.waitForSelector('select').catch(() => null);

        // 4. Select current semester and search
        await page.waitForSelector('select');
        const options = await page.evaluate(() => {
            const select = document.querySelector('select');
            if (!select) return [];
            return Array.from(select.querySelectorAll('option')).map(opt => opt.value);
        });

        if (options.length > 0) {
            options.sort();
            await page.select('select', options[options.length - 1]);
        }

        // Click Buscar and wait for the page to load, but use domcontentloaded to avoid hangs
        const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
        await page.click('input[type="button"][value="Buscar"]');
        await navPromise;

        // 5. Extract Grid Data
        // Wait up to 15 seconds for the grid to appear, as JupiterWeb can be slow
        async function scrapeGrade() {
            return await page.evaluate(() => {
                const events: Array<{ code: string, dayOfWeek: number, startTime: string, endTime: string }> = [];
                let rowIndex = 1;
                while (document.getElementById(rowIndex.toString())) {
                    const row = document.getElementById(rowIndex.toString());
                    if (!row) break;

                    const startCell = row.querySelector('td:nth-child(1)')?.textContent?.trim() || '08:00';
                    const endCell = row.querySelector('td:nth-child(2)')?.textContent?.trim() || '10:00';
                    
                    for (let i = 3; i <= 8; i++) {
                        const subjectRaw = row.querySelector(`td:nth-child(${i})`)?.textContent?.trim();
                        if (subjectRaw && subjectRaw.includes('-')) {
                            const code = subjectRaw.split('-')[0].trim();
                            events.push({
                                code,
                                dayOfWeek: i - 2, // 1 = Monday, ..., 6 = Saturday
                                startTime: startCell,
                                endTime: endCell
                            });
                        }
                    }
                    rowIndex++;
                }
                return events;
            });
        }

        let subjectsScraped = await scrapeGrade();

        // Fallback: If no subjects found in the last option, try the one before (last-1)
        if (subjectsScraped.length === 0 && options.length > 1) {
            await page.select('select', options[options.length - 2]);
            const navPromiseRetry = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
            const buscarBtnRetry = await page.$('input[type="button"][value="Buscar"]');
            if (buscarBtnRetry) {
                await buscarBtnRetry.click();
                await navPromiseRetry;
                await page.waitForSelector("tr[id='1']", { timeout: 10000 }).catch(() => null);
                subjectsScraped = await scrapeGrade();
            }
        }

        await browser.close();

        if (subjectsScraped.length === 0) {
            return NextResponse.json({ success: true, message: 'Nenhuma matéria identificada no JúpiterWeb neste semestre.', data: [] });
        }

        // 6. Fetch course names and prepare events
        const scrapedCodes = Array.from(new Set(subjectsScraped.map(s => s.code)));
        const courseNames = new Map<string, string>();
        
        await Promise.all(scrapedCodes.map(async (code) => {
            try {
                const res = await fetch(`https://uspdigital.usp.br/jupiterweb/obterDisciplina?sgldis=${code}`);
                const html = await res.text();
                const match = html.match(new RegExp(`Disciplina:\\s*${code}\\s*-\\s*([^<\\r\\n]+)`, 'i'));
                if (match && match[1]) {
                    courseNames.set(code, match[1].trim());
                } else {
                    courseNames.set(code, code);
                }
            } catch {
                courseNames.set(code, code);
            }
        }));

        const now = new Date();
        const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

        const DISCIPLINE_COLORS = ['#3B82F6', '#B91C1C', '#EAB308'];
        const getStableColor = (seed: string) => {
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                hash |= 0;
            }
            const colorIndex = Math.abs(hash) % DISCIPLINE_COLORS.length;
            return DISCIPLINE_COLORS[colorIndex];
        };

        const eventsToInsert = subjectsScraped.map(sub => {
            const eventDate = new Date(sunday);
            eventDate.setDate(sunday.getDate() + sub.dayOfWeek);
            
            const [startH, startM] = sub.startTime.split(':').map(Number);
            const [endH, endM] = sub.endTime.split(':').map(Number);
            
            const start = new Date(eventDate);
            start.setHours(startH, startM, 0, 0);
            
            const end = new Date(eventDate);
            end.setHours(endH, endM, 0, 0);
            
            const courseName = courseNames.get(sub.code) || sub.code;

            return {
                user_id: user.id,
                title: `${sub.code} - ${courseName}`,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                color: getStableColor(sub.code),
                type: 'aula',
                trail_id: null
            };
        });

        // 7. Clear previous official classes to avoid duplicates during re-sync
        await supabase
            .from('user_calendar_events')
            .delete()
            .eq('user_id', user.id)
            .eq('type', 'aula')
            .is('trail_id', null);

        // 8. Insert new events
        const { data: insertedEvents, error: insertError } = await supabase
            .from('user_calendar_events')
            .insert(eventsToInsert)
            .select();

        if (insertError) throw insertError;

        // 9. ALSO update user_custom_blocks so they appear in "Turmas disponíveis" list
        const uniqueCodes = [...new Set(subjectsScraped.map(s => s.code))];
        for (const code of uniqueCodes) {
            const courseName = courseNames.get(code) || code;
            const fullTitle = `${code} - ${courseName}`;
            
            const { data: existing } = await supabase
                .from('user_custom_blocks')
                .select('*')
                .eq('user_id', user.id)
                .eq('title', fullTitle)
                .single();

            if (!existing) {
                await supabase.from('user_custom_blocks').insert([{ 
                    user_id: user.id, 
                    title: fullTitle, 
                    duration: 2 // Default
                }]);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Sincronizadas ${insertedEvents?.length || 0} sessões de aula do JupiterWeb com sucesso! Sua grade foi atualizada automaticamente.`, 
            data: insertedEvents 
        });

    } catch (error: any) {
        if (browser) await browser.close();
        console.error('[Jupiter Sync Error]', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Erro ao comunicar com sistema da USP.' 
        }, { status: 500 });
    }
}
