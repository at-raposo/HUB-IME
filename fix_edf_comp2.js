require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- INICIANDO CORREÇÕES ---');

  // 1. Atualizar Intro Física Comp II
  const { data: comp2 } = await supabase
    .from('learning_trails')
    .select('id')
    .ilike('title', '%Introdução à Física Computacional II%')
    .single();

  if (comp2) {
    const pReqs = ['MAT1352', '4300153', '4300218'];
    const { error: e1 } = await supabase.from('learning_trails').update({ prerequisites: pReqs }).eq('id', comp2.id);
    if(e1) console.error('Erro Intro Comp II:', e1);
    else console.log('✓ Introdução à Física Computacional II: Pré-reqs atualizados:', pReqs);
  } else {
    console.log('X Introdução à Física Computacional II não encontrada');
  }

  // Swap de Códigos EDF
  // EDF029296 -> EDF029294
  const { data: edf296 } = await supabase.from('learning_trails').select('id, title').eq('course_code', 'EDF029296').maybeSingle();
  if (edf296) {
    const { error: e2 } = await supabase.from('learning_trails').update({ course_code: 'EDF029294' }).eq('id', edf296.id);
    if(e2) console.error('Erro EDF029296 -> 294:', e2);
    else console.log(`✓ ${edf296.title} código alterado de EDF029296 para EDF029294`);
  }

  // EDF029X -> EDF029296
  const { data: edf029x } = await supabase.from('learning_trails').select('id, title').eq('course_code', 'EDF029X').maybeSingle();
  if (edf029x) {
    const { error: e3 } = await supabase.from('learning_trails').update({ course_code: 'EDF029296' }).eq('id', edf029x.id);
    if(e3) console.error('Erro EDF029X -> 296:', e3);
    else console.log(`✓ ${edf029x.title} código alterado de EDF029X para EDF029296`);
  }

  // EDF0299 -> EDF0299 EDF0298
  const { data: edf0299 } = await supabase.from('learning_trails').select('id, title').eq('course_code', 'EDF0299').maybeSingle();
  if (edf0299) {
    const { error: e4 } = await supabase.from('learning_trails').update({ course_code: 'EDF0299 EDF0298' }).eq('id', edf0299.id);
    if(e4) console.error('Erro EDF0299:', e4);
    else console.log(`✓ ${edf0299.title} código alterado de EDF0299 para EDF0299 EDF0298`);
  }
}

run();
