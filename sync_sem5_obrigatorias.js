require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- SYNC SEMESTRE 5 (LICENCIATURA) ---');

  const updates = [
    {
      code: '4300271', // Eletricidade e Magnetismo II
      upd: {
        excitation_level: 5,
        prerequisites: ['4300270'],
        course_map: { licenciatura: 'obrigatoria' }
      }
    },
    {
      code: '4300357', // Oscilações e Ondas
      upd: {
        excitation_level: 5,
        prerequisites: ['4300255'],
        course_map: { licenciatura: 'obrigatoria' }
      }
    },
    {
      code: '4300358', // Propostas e Projetos para o Ensino de Física e Ciências
      upd: {
        excitation_level: 5,
        prerequisites: ['4300356'],
        course_map: { licenciatura: 'obrigatoria' }
      }
    },
    {
      code: '4300373', // Laboratório de Eletromagnetismo
      upd: {
        excitation_level: 5,
        prerequisites: ['4300152', '4300270'],
        course_map: { licenciatura: 'obrigatoria' }
      }
    },
    {
      code: '4300390', // Práticas em Ensino de Física e Ciências
      upd: {
        excitation_level: 5,
        prerequisites: ['4300356'],
        course_map: { licenciatura: 'obrigatoria' }
      }
    }
  ];

  for (const item of updates) {
    const { error } = await supabase.from('learning_trails').update(item.upd).eq('course_code', item.code);
    if (error) {
      console.error(`Erro ao atualizar ${item.code}:`, error);
    } else {
      console.log(`✓ ${item.code} atualizada para o 5º semestre.`);
    }
  }

  console.log('Sincronização do 5º semestre concluída.');
}

run();
