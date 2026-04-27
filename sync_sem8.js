require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- SYNC SEMESTRE 8 (LICENCIATURA) ---');

  // 1. Injeção de Matérias Faltantes
  const missing = [
    {
      course_code: '4300380',
      title: 'Ciência e Cultura',
      excitation_level: 8,
      prerequisites: [],
      category_map: { licenciatura: 'eletiva' },
      course_map: { licenciatura: 'eletiva' }
    }
  ];

  console.log('Injetando matérias faltantes...');
  for (const item of missing) {
    const { error } = await supabase.from('learning_trails').upsert(item, { onConflict: 'course_code' });
    if (error) console.error(`Erro ao injetar ${item.course_code}:`, error);
  }

  // 2. Atualizações de Disciplinas Existentes (Pré-requisitos e Semestre)
  const updates = [
    {
      code: '4302220', // Introdução ao Caos
      upd: {
        excitation_level: 8,
        prerequisites: ['4300372', 'MAC0115', '4300357'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300353', // Tópicos de História da Física Clássica
      upd: {
        excitation_level: 8,
        prerequisites: ['4300372'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300370', // Intro Fisica Nuclear (Moderna IIA)
      upd: {
        excitation_level: 8,
        prerequisites: ['4300371'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300378', // Intro Fisica Nuclear (Moderna IIA - Outra versao)
      upd: {
        excitation_level: 8,
        prerequisites: ['4300371'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300402', // Intro Fisica Estado Solido (Moderna IIB)
      upd: {
        excitation_level: 8,
        prerequisites: ['4300371'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300379', // Intro Fisica Estado Solido (Moderna IIB - Outra versao)
      upd: {
        excitation_level: 8,
        prerequisites: ['4300371'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300430', // Cosmologia Fisica
      upd: {
        title: 'Cosmologia da Física',
        excitation_level: 8,
        prerequisites: ['4300374'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300462', // Tecnologia de Ensino de Física II
      upd: {
        excitation_level: 8,
        prerequisites: ['4300461'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4300463', // Física Aplicada
      upd: {
        excitation_level: 8,
        prerequisites: ['4300371'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4302214', // Física Experimental IV
      upd: {
        excitation_level: 8,
        prerequisites: ['4300372'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4302303', // Eletromagnetismo I
      upd: {
        excitation_level: 8,
        prerequisites: ['4300372'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: '4302403', // Mecânica Quântica I
      upd: {
        excitation_level: 8,
        prerequisites: ['4300371'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: 'AGA0316', // Astrofísica de Altas Energias
      upd: {
        excitation_level: 8,
        prerequisites: ['4300371', 'AGA0215'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: 'FLF0472', // Filosofia da Física
      upd: {
        excitation_level: 8,
        prerequisites: ['4300270'],
        course_map: { licenciatura: 'eletiva' }
      }
    },
    {
      code: 'MAT0349', // História da Matemática I
      upd: {
        excitation_level: 8,
        prerequisites: ['MAT2352'],
        course_map: { licenciatura: 'eletiva' }
      }
    }
  ];

  console.log('Atualizando pré-requisitos e semestres...');
  for (const item of updates) {
    const { error } = await supabase.from('learning_trails').update(item.upd).eq('course_code', item.code);
    if (error) console.error(`Erro em ${item.code}:`, error);
    else console.log(`✓ ${item.code}`);
  }

  console.log('✓ Sincronização do 8º semestre concluída.');
}

run();
