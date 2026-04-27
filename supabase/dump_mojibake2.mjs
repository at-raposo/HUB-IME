import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: trails } = await supabase.from('learning_trails').select('id, title, course_code').limit(1000);

    const badNames = trails.filter(t => t.title && t.title.includes('Ã'));
    console.log(`Found ${badNames.length} titles with Ã characters.`);
    for (const t of badNames.slice(0, 10)) {
        console.log(`[${t.course_code}] ${t.title}`);
    }
}
run();
