import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Fetching user...');
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', '%Joao Paulo%');

    if (pError || !profiles || profiles.length === 0) {
        console.error('Could not find Joao Paulo');
        return;
    }

    const joaoId = profiles[0].id;
    console.log('Found Joao:', joaoId);

    const { data, error } = await supabase
        .from('research_adoptions')
        .update({ status: 'pending' })
        .eq('student_id', joaoId)
        .select();

    console.log('Update result:', data, error);
}

main();
