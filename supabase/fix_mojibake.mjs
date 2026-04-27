import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Run with --env-file=.env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function fixMojibake(text) {
    if (!text) return text;

    // Fallback: dicionário manual das corrupções comuns de UTF-8 em Latin-1 para português
    return text
        .replace(/Ã¡/g, 'á')
        .replace(/Ã¢/g, 'â')
        .replace(/Ã£/g, 'ã')
        .replace(/Ã¤/g, 'ä')
        .replace(/Ã©/g, 'é')
        .replace(/Ãª/g, 'ê')
        .replace(/Ã«/g, 'ë')
        .replace(/Ã­/g, 'í')
        .replace(/Ã®/g, 'î')
        .replace(/Ã¯/g, 'ï')
        .replace(/Ã³/g, 'ó')
        .replace(/Ã´/g, 'ô')
        .replace(/Ãµ/g, 'õ')
        .replace(/Ã¶/g, 'ö')
        .replace(/Ãº/g, 'ú')
        .replace(/Ã»/g, 'û')
        .replace(/Ã¼/g, 'ü')
        .replace(/Ã§/g, 'ç')
        .replace(/Ã±/g, 'ñ')
        .replace(/Ã /g, 'À')
        .replace(/Ã /g, 'Á')
        .replace(/Ã‚/g, 'Â')
        .replace(/Ãƒ/g, 'Ã')
        .replace(/Ã„/g, 'Ä')
        .replace(/ÃŠ/g, 'Ê')
        .replace(/Ã‹/g, 'Ë')
        .replace(/ÃŒ/g, 'Ì')
        .replace(/ÃŽ/g, 'Î')
        .replace(/Ã"/g, 'Ï')
        .replace(/Ã’/g, 'Ò')
        .replace(/Ã“/g, 'Ó')
        .replace(/Ã”/g, 'Ô')
        .replace(/Ã•/g, 'Õ')
        .replace(/Ã–/g, 'Ö')
        .replace(/Ã™/g, 'Ù')
        .replace(/Ãš/g, 'Ú')
        .replace(/Ã›/g, 'Û')
        .replace(/Ãœ/g, 'Ü')
        .replace(/Ã‡/g, 'Ç')
        .replace(/Ã‘/g, 'Ñ');
}

async function run() {
    console.log("Fetching trails...");
    const { data: trails, error } = await supabase.from('learning_trails').select('id, title, description, course_code');
    if (error) {
        console.error("Error fetching trails:", error);
        return;
    }

    let updatedCount = 0;

    for (const trail of trails) {
        const fixedTitle = fixMojibake(trail.title);
        const fixedDescription = fixMojibake(trail.description);

        if (fixedTitle !== trail.title || fixedDescription !== trail.description) {
            console.log(`Fixing: [${trail.course_code}] ${trail.title} -> ${fixedTitle}`);

            const { error: updateError } = await supabase
                .from('learning_trails')
                .update({ title: fixedTitle, description: fixedDescription })
                .eq('id', trail.id);

            if (updateError) {
                console.error(`Failed to update ${trail.id}:`, updateError);
            } else {
                updatedCount++;
            }
        }
    }

    // also check materials (submissions)
    console.log("Fetching submissions...");
    const { data: submissions, error: subErr } = await supabase.from('submissions').select('id, title, description');
    if (subErr) {
        console.error("Error fetching submissions:", subErr);
    } else if (submissions) {
        for (const sub of submissions) {
            const fixedTitle = fixMojibake(sub.title);
            const fixedDescription = fixMojibake(sub.description);

            if (fixedTitle !== sub.title || fixedDescription !== sub.description) {
                console.log(`Fixing Sub: ${sub.title} -> ${fixedTitle}`);

                const { error: updateError } = await supabase
                    .from('submissions')
                    .update({ title: fixedTitle, description: fixedDescription })
                    .eq('id', sub.id);

                if (updateError) {
                    console.error(`Failed to update submission ${sub.id}:`, updateError);
                } else {
                    updatedCount++;
                }
            }
        }
    }

    console.log(`Completed. Updated ${updatedCount} records.`);
}

run();
