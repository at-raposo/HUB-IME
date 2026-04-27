import { NextRequest, NextResponse } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const maxDuration = 60; // Evita Timeout 504 na Vercel

export async function POST(req: NextRequest) {
    let browser;
    try {
        const body = await req.json();
        const { nUsp, password } = body;

        if (!nUsp || !password) {
            return NextResponse.json({ success: false, error: 'Credenciais ausentes' }, { status: 400 });
        }

        const log = (msg: string) => {
            if (process.env.NODE_ENV === 'development' || req.headers.get('x-debug-puppeteer') === 'true') {
                console.log(msg);
            }
        };

        const isLocal = !process.env.VERCEL_ENV && process.env.NODE_ENV === 'development';
        log(`[Puppeteer Sync] Starting browser automation... IsLocal: ${isLocal}`);

        // 1. Setup Puppeteer securely without 'puppeteer' standard library
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
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        // 2. Perform Login
        log('[Puppeteer Sync] Navigating to login...');
        await page.goto('https://uspdigital.usp.br/jupiterweb/webLogin.jsp', { waitUntil: 'networkidle2' });

        log('[Puppeteer Sync] Waiting for login fields...');
        await page.waitForSelector('input[name="codpes"]', { timeout: 10000 });
        await page.type('input[name="codpes"]', nUsp, { delay: 30 });
        await page.type('input[name="senusu"]', password, { delay: 30 });
        
        log('[Puppeteer Sync] Submitting credentials...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
            page.click('input[name="Submit"]')
        ]);

        const loginError = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            return bodyText.includes('Usuário e/ou senha inválido') || bodyText.toLowerCase().includes('inválido');
        });

        if (loginError) {
            log('[Puppeteer Sync] Login failed: Invalid credentials');
            await browser.close();
            return NextResponse.json({ success: false, error: 'Credenciais da USP inválidas.' }, { status: 401 });
        }

        // 3. Navigate to Evolution
        log('[Puppeteer Sync] Navigating to Evolution page...');
        await page.goto('https://uspdigital.usp.br/jupiterweb/evolucaoCurso?codmnu=4752', { waitUntil: 'networkidle2' });

        const isSelectionPage = await page.evaluate(() => {
            return !!document.getElementById('enviar') || !!document.getElementById('codpgm');
        });

        if (isSelectionPage) {
            log('[Puppeteer Sync] Course selection page detected (#enviar found).');
            const enviarBtn = await page.$('#enviar');
            
            if (enviarBtn) {
                log('[Puppeteer Sync] Clicking #enviar button...');
                await enviarBtn.click();
                
                log('[Puppeteer Sync] Waiting for evolution grid (#grade_curricular) to populate (8s)...');
                // Wait for the specific data attributes or bgcolor now used by Júpiter
                await page.waitForSelector('#grade_curricular [data-background-color], #grade_curricular [bgcolor]', { timeout: 30000 }).catch(() => {
                    log('[Puppeteer Sync] Warning: Timeout waiting for #grade_curricular elements.');
                });
            } else {
                log('[Puppeteer Sync] Warning: #enviar button not found despite detection.');
            }
        } else {
            log('[Puppeteer Sync] Selection fields not found. Checking for direct grid...');
            await page.waitForSelector('[data-background-color], [bgcolor]', { timeout: 10000 }).catch(() => {
                log('[Puppeteer Sync] No direct grid found with [data-background-color] or [bgcolor].');
            });
        }

        log('[Puppeteer Sync] Buffer wait 8s...');
        await new Promise(resolve => setTimeout(resolve, 8000)); 

        // 4. Extraction Logic (Multi-frame support)
        log('[Puppeteer Sync] Running extraction script (checking all frames)...');
        
        const extractFromFrame = async (frame: any) => {
            return await frame.evaluate(() => {
                const results = { concluidas: [] as string[], cursando: [] as string[] };
                const codeRegex = /\b([A-Z]{3,4}\d{4}|\d{7})\b/i;
                // Júpiter uses both data-background-color (modern) and bgcolor (legacy)
                const cells = document.querySelectorAll('[data-background-color], [bgcolor]');
                
                cells.forEach(el => {
                    const bgcolorAttr = el.getAttribute('bgcolor') || '';
                    const dataBgAttr = el.getAttribute('data-background-color') || '';
                    const bgcolor = (bgcolorAttr || dataBgAttr).toUpperCase().trim();
                    
                    const text = el.textContent?.trim() || '';
                    const match = text.match(codeRegex);
                    if (match) {
                        const code = match[1].toUpperCase();
                        // Completed: #00C000 (Green)
                        if (bgcolor.includes('00C000')) {
                            results.concluidas.push(code);
                        } 
                        // In Progress: #FFFF80 (Yellow)
                        else if (bgcolor.includes('FFFF80')) {
                            results.cursando.push(code);
                        }
                    }
                });
                return results;
            });
        };

        const totalResults = { concluidas: new Set<string>(), cursando: new Set<string>() };
        
        // Check main frame
        const mainRes = await extractFromFrame(page);
        mainRes.concluidas.forEach((c: string) => totalResults.concluidas.add(c));
        mainRes.cursando.forEach((c: string) => totalResults.cursando.add(c));

        // Check all iframes
        const frames = page.frames();
        log(`[Puppeteer Sync] Found ${frames.length} frames. Checking each...`);
        for (const frame of frames) {
            if (frame === page.mainFrame()) continue;
            try {
                const frameRes = await extractFromFrame(frame);
                frameRes.concluidas.forEach((c: string) => totalResults.concluidas.add(c));
                frameRes.cursando.forEach((c: string) => totalResults.cursando.add(c));
            } catch (e) {
                log(`[Puppeteer Sync] Error reading frame: ${e}`);
            }
        }

        const finalResult = {
            concluidas: Array.from(totalResults.concluidas),
            cursando: Array.from(totalResults.cursando)
        };

        log(`[Puppeteer Sync] Extraction complete: ${finalResult.concluidas.length} concluidas, ${finalResult.cursando.length} cursando`);

        await browser.close();
        return NextResponse.json({
            success: true,
            ...finalResult
        });

    } catch (error: any) {
        console.error('[Puppeteer Sync Error]:', error);

        if (browser) await browser.close();
        return NextResponse.json({ 
            success: false, 
            error: `Erro na sincronização: ${error.message}` 
        }, { status: 500 });
    }
}