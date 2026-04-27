require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('learning_trails')
    .select('id, course_code, title, category')
    .or('title.ilike.%Psicologia%,course_code.ilike.%EDF%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  let output = '--- ESTADO ATUAL NO BANCO --- \n';
  data.forEach(item => {
    const line = `ID: ${item.id} | Código: ${item.course_code} | Título: ${item.title} | Categoria: ${item.category}`;
    output += line + '\n';
  });
  require('fs').writeFileSync('edf_discovery.txt', output);
  console.log('File edf_discovery.txt written.');
}

run();
