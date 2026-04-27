require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- SYNC FINAL 7º SEMESTRE (LICENCIATURA) ---');

  // 1. Injeção de Projetos - ATPA (4300415)
  const atpa = {
    course_code: '4300415',
    title: 'Projetos - ATPA',
    excitation_level: 7,
    prerequisites: [],
    category_map: { licenciatura: 'eletiva' },
    course_map: { licenciatura: 'eletiva' }
  };

  console.log('Injetando/Atualizando ATPA...');
  const { error: atpaErr } = await supabase.from('learning_trails').upsert(atpa, { onConflict: 'course_code' });
  if (atpaErr) console.error('Erro no ATPA:', atpaErr);

  // 2. Ajuste Metodologia do Ensino de Física I (EDM0425)
  console.log('Ajustando Metodologia I...');
  const { error: edmErr } = await supabase.from('learning_trails').update({
    excitation_level: 7,
    prerequisites: [],
    course_map: { licenciatura: 'obrigatoria' }
  }).eq('course_code', 'EDM0425');
  if (edmErr) console.error('Erro no EDM0425:', edmErr);

  // 3. Ajuste Língua de Sinais (MFT0964)
  console.log('Ajustando Língua de Sinais...');
  const { error: librErr } = await supabase.from('learning_trails').update({
    title: 'Língua de Sinais para Profissionais da Saúde',
    excitation_level: 7,
    prerequisites: ['4300390'],
    course_map: { licenciatura: 'eletiva' }
  }).eq('course_code', 'MFT0964');
  if (librErr) console.error('Erro no MFT0964:', librErr);

  console.log('✓ Sincronização final do 7º semestre concluída.');
}

run();
