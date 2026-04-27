require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('learning_trails')
    .select('id, course_code, title')
    .in('course_code', ['EDF029X', 'EDF029296', 'EDF0299']);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log('--- CURSOS EDF ---');
  console.log(data);
  
  const { data: data2 } = await supabase
    .from('learning_trails')
    .select('id, course_code, title, prerequisites')
    .ilike('title', '%Física Computacional II%');
    
  console.log('--- FÍSICA COMPUTACIONAL II ---');
  console.log(data2);
}

run();
