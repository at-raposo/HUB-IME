require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- SYNC SEMESTRES 8, 9, 10 ---');

  const updates = [
    {
      code: 'AGA0414', // Introdução à Cosmologia
      upd: {
        prerequisites: ['AGA0215', '4300371'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4302451', // Evolução dos Conceitos da Física
      upd: {
        prerequisites: ['4300405']
      }
    },
    {
      code: '4300454', // Tópicos de História da Física Moderna
      upd: {
        prerequisites: ['4300371'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300439', // Laboratório de Dosimetria das Radiações
      upd: {
        excitation_level: 10,
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4302313', // Física Experimental V
      upd: {
        excitation_level: 10,
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300410', // Óptica Não-Linear
      upd: {
        excitation_level: 10,
        course_map: { licenciatura: 'eletiva' }
      }
    }
  ];

  for (const item of updates) {
    const { error } = await supabase.from('learning_trails').update(item.upd).eq('course_code', item.code);
    if (error) {
      console.error(`Erro ao atualizar ${item.code}:`, error);
    } else {
      console.log(`✓ ${item.code} atualizada.`);
    }
  }

  console.log('Sincronização concluída.');
}

run();
