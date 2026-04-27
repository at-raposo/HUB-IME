require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- CLEANUP FINAL: LIBRAS & METODOLOGIA II ---');

  // 1. Remover Libras (EDF0665) e Língua de Sinais (MFT0964)
  const toDelete = ['EDF0665', 'MFT0964'];
  for (const code of toDelete) {
    const { error } = await supabase.from('learning_trails').delete().eq('course_code', code);
    if (error) {
      console.error(`Erro ao deletar ${code}:`, error);
    } else {
      console.log(`- ${code} removida com sucesso.`);
    }
  }

  // 2. Ajustar Metodologia II (EDM0426) -> Pré-requisito: Metodologia I (EDM0425)
  const { error: edmErr } = await supabase.from('learning_trails').update({
    prerequisites: ['EDM0425']
  }).eq('course_code', 'EDM0426');
  
  if (edmErr) {
    console.error('Erro ao atualizar EDM0426:', edmErr);
  } else {
    console.log('✓ EDM0426 vinculada ao pré-requisito EDM0425.');
  }

  console.log('Processo concluído.');
}

run();
