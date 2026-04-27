import { NextRequest, NextResponse } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const maxDuration = 60;
import { createServerSupabase } from '@/lib/supabase/server';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
    let browser;
    try {
        const body = await req.json();
        const { nUsp, password } = body;

        if (!nUsp || !password) {
            return NextResponse.json({ success: false, error: 'Credenciais ausentes' }, { status: 400 });
        }

        const supabaseAdmin = createAdminSupabase();

        const isLocal = !process.env.VERCEL_ENV && process.env.NODE_ENV === 'development';
        const executablePath = isLocal
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : await chromium.executablePath();

        browser = await puppeteerCore.launch({
            // @ts-ignore
            args: isLocal 
                ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] 
                : chromium.args,
            // @ts-ignore
            defaultViewport: chromium.defaultViewport || { width: 1280, height: 800 },
            executablePath: executablePath,
            // @ts-ignore
            headless: isLocal ? true : chromium.headless,
            ignoreHTTPSErrors: true,
        } as any);
        
        const page = await browser.newPage();

        // [TURBO] Intercept and block unnecessary resources to speed up load times
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'
        );

        // 1. Go to Login page
        await page.goto('https://uspdigital.usp.br/jupiterweb/webLogin.jsp', { 
            waitUntil: 'domcontentloaded', 
            timeout: 20000 
        });

        // 2. Login
        await page.waitForSelector("input[name='codpes']");
        await page.type('input[name="codpes"]', nUsp);
        await page.type('input[name="senusu"]', password);
        
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            page.keyboard.press('Enter')
        ]);

        // Check for login error
        const isLoginFailed = await page.evaluate(() => {
            return document.body.innerText.includes('Usuário e/ou senha inválido(s)') || 
                   document.body.innerText.includes('Incorreto');
        });

        if (isLoginFailed) {
            throw new Error('Credenciais da USP inválidas. Verifique seu Nº USP e Senha.');
        }

        // 3. User is logged in. Get personal data: Course, Institute, Email, Year
        const userInfoJupiterLink = `https://uspdigital.usp.br/jupiterweb/uspDadosPessoaisMostrar?codmnu=4543`;
        await page.goto(userInfoJupiterLink, { waitUntil: 'domcontentloaded', timeout: 15000 });

        const userData = await page.evaluate(() => {
            const allFontsTexts = Array.from(document.querySelectorAll('font')).map((el) => el.textContent || '');
            const all77WidthFontTexts = Array.from(document.querySelectorAll("td[width='77%'] font")).map((el) => el.textContent || '');
            
            const name = all77WidthFontTexts[1] || 'Estudante USP';
            
            // Extracts course - searching dynamically because Jupiter layout changes
            const courseElement = document.querySelector('#curso');
            let jupiterWebCourse = '';
            if (courseElement) {
                const brokeCourseText = courseElement.textContent?.split(' - ') || [];
                for (const text of brokeCourseText) {
                    if (isNaN(Number(text))) {
                        jupiterWebCourse = text.trim();
                        break;
                    }
                }
            } else {
                // Fallback for course
                jupiterWebCourse = 'Curso USP';
            }

            const instituteElement = document.querySelector('#unidade');
            const jupiterWebInstitute = instituteElement?.textContent?.split(' - ')[1]?.trim() || '';

            const emails = allFontsTexts.filter((text) => text.includes('@'));
            const email = emails.find((e) => e.includes('usp.br')) || emails[0] || '';

            return { name, jupiterWebCourse, jupiterWebInstitute, email };
        });

        const emailToUse = userData.email || `${nUsp}@usp.br`;
        const generatedPassword = `${nUsp}LabDiv2024!`; // Fixed deterministic secure string since they use Júpiter to login

        // 4. Navigate to Grade Horária to sync schedule
        await page.goto('https://uspdigital.usp.br/jupiterweb/gradeHoraria?codmnu=4759', { 
            waitUntil: 'domcontentloaded', 
            timeout: 20000 
        });

        await page.waitForSelector('select').catch(() => null);
        const options = await page.evaluate(() => {
            const select = document.querySelector('select');
            if (!select) return [];
            return Array.from(select.querySelectorAll('option')).map(opt => (opt as HTMLOptionElement).value);
        });

        if (options.length > 0) {
            options.sort();
            await page.select('select', options[options.length - 1]);
        }

        const buscarBtn = await page.$('input[type="button"][value="Buscar"]');

        async function scrapeGrade() {
            return await page.evaluate(() => {
                const events: Array<{ code: string, dayOfWeek: number, startTime: string, endTime: string }> = [];
                const codeRegex = /([A-Z]{2,4}\d{4})|(\d{7})/;
                const rows = Array.from(document.querySelectorAll('tr'));
                
                rows.forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td'));
                    if (cells.length < 3) return; // Need at least start, end, and one day
                    
                    const startText = cells[0].textContent?.trim() || '';
                    const endText = cells[1].textContent?.trim() || '';
                    
                    // Filter for rows that look like schedule times (HH:MM)
                    if (!/^\d{2}:\d{2}$/.test(startText)) return;
                    
                    // Columns 2 to 8 are days of the week (Seg-Dom)
                    for (let i = 2; i < cells.length; i++) {
                        const cellText = cells[i].textContent?.trim();
                        if (cellText) {
                            const match = cellText.match(codeRegex);
                            if (match) {
                                events.push({
                                    code: match[0],
                                    dayOfWeek: i - 1, // 2 -> 1 (Seg), ..., 8 -> 7 (Dom)
                                    startTime: startText,
                                    endTime: endText
                                });
                            }
                        }
                    }
                });
                return events;
            });
        }

        let allSubjectsScraped: any[] = [];
        
        // Iterar por TODOS os complementos disponíveis (Unidades/Matrículas)
        for (const optValue of options) {
            await page.select('select', optValue);
            const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null);
            const finalBtn = await page.$('input[type="button"][value="Buscar"]');
            if (finalBtn) {
                await finalBtn.click();
                await navPromise;
                const subjects = await scrapeGrade();
                allSubjectsScraped = [...allSubjectsScraped, ...subjects];
            }
        }

        const subjectsScraped = allSubjectsScraped;

        await browser.close();

        // 5. Create or Authenticate User via Supabase Admin
        // Check if user exists first to decide whether to create
        const { data: existingUserObj, error: existingError } = await supabaseAdmin.auth.admin.listUsers();
        let userAuthInfo = existingUserObj?.users.find(u => u.email === emailToUse);

        if (!userAuthInfo) {
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: emailToUse,
                password: generatedPassword,
                email_confirm: true,
                user_metadata: {
                    nUsp: nUsp,
                    name: userData.name,
                    course: userData.jupiterWebCourse,
                    institute: userData.jupiterWebInstitute,
                    full_name: userData.name,
                    is_usp: true
                }
            });

            if (createError && !createError.message.includes('already exists')) {
                throw createError;
            }
            userAuthInfo = newUser?.user || undefined;
        } else {
            // User exists (maybe from Google OAuth). We must set their password so signInWithPassword works.
            await supabaseAdmin.auth.admin.updateUserById(userAuthInfo.id, {
                password: generatedPassword,
                user_metadata: {
                    ...userAuthInfo.user_metadata,
                    nUsp: nUsp,
                    course: userData.jupiterWebCourse,
                    institute: userData.jupiterWebInstitute,
                    is_usp: true
                }
            });
        }

        // 6. Sign In the user directly (This generates Next.js cookies containing their session)
        const supabase = await createServerSupabase();
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: emailToUse,
            password: generatedPassword,
        });

        if (authError) {
            throw new Error(`Erro ao gerar sessão local: ${authError.message}`);
        }

        const user = authData.user;

        // 7. Process scraped subjects and fetch names
        const scrapedCodes = Array.from(new Set(subjectsScraped.map(s => s.code)));
        const courseNames = new Map<string, string>();
        
        await Promise.all(scrapedCodes.map(async (code) => {
            try {
                const res = await fetch(`https://uspdigital.usp.br/jupiterweb/obterDisciplina?sgldis=${code}`);
                const buffer = await res.arrayBuffer();
                const decoder = new TextDecoder('iso-8859-1');
                const html = decoder.decode(buffer);
                
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

        const numSynced = subjectsScraped.length > 0 ? scrapedCodes.length : 0;

        // [PERSISTENCE] Save to Cache in Profiles
        if (numSynced > 0) {
            try {
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        jupiter_subjects_cache: {
                            subjects: subjectsScraped,
                            courseNames: Object.fromEntries(courseNames)
                        },
                        last_jupiter_sync: new Date().toISOString()
                    })
                    .eq('id', user.id);
            } catch (cacheError) {
                console.error('Failed to save Jupiter cache (schema might be outdated):', cacheError);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Autenticado com sucesso! Foram encontradas ${numSynced} disciplinas na sua grade oficial.`, 
            subjects: subjectsScraped,
            courseNames: Object.fromEntries(courseNames),
            user: {
                id: user.id,
                email: emailToUse,
                course: userData.jupiterWebCourse
            }
        });

    } catch (error: any) {
        if (browser) await browser.close();
        console.error('[Jupiter Auth Error]', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Erro ao comunicar com sistema da USP.' 
        }, { status: 500 });
    }
}
