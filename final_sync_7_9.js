require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- SYNC SEMESTRES 7, 8 E 9 ---');

  // 1. Limpeza de Duplicatas (Sem submissões)
  const toDelete = [
    '487d2c8b-0e0b-4e85-a7eb-10caacc98dad', // Termodinâmica (4302308) - redundant
    '0397cfee-819a-4fbe-ae64-7b53575b1eee'  // Física do Corpo Humano (4300329) - redundant
  ];
  console.log('Removendo duplicatas...');
  await supabase.from('learning_trails').delete().in('id', toDelete);

  // 2. Atualizações 7º Semestre
  const updates7 = [
    {
      course_code: '4300308',
      title: 'Termodinâmica',
      excitation_level: 7,
      prerequisites: ['4300259', 'MAT2352'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4300325',
      title: 'Física do Corpo Humano',
      excitation_level: 7,
      prerequisites: ['4300159', '4300270', '4300357', 'MAT1352'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4300346',
      title: 'Física da Poluição do Ar',
      excitation_level: 7,
      prerequisites: ['4300271'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4300375',
      title: 'Detectores de Radiação',
      excitation_level: 7,
      prerequisites: ['4300271'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4300456',
      title: 'Produção de Material Didático',
      excitation_level: 7,
      prerequisites: ['4300356'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4300459',
      title: 'Tecnologias da Informação e Comunicação no Ensino de Física',
      excitation_level: 7,
      prerequisites: ['4300356'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4300461',
      title: 'Tecnologia de Ensino de Física I',
      excitation_level: 7,
      prerequisites: ['4300372'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4300462',
      title: 'Tecnologia de Ensino de Física II',
      excitation_level: 8, // User didn't specify, but II usually follows I
      prerequisites: ['4300372'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4300490',
      title: 'Monografia para Licenciatura em Física',
      excitation_level: 7,
      prerequisites: ['4300491'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4302305',
      title: 'Mecânica I',
      excitation_level: 7,
      prerequisites: ['4300357'],
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: 'MAP0214',
      title: 'Cálculo Numérico com Aplicações em Física',
      excitation_level: 7,
      prerequisites: ['MAT1352', 'MAC0115'],
      course_map: { licenciatura: 'eletiva' }
    }
  ];

  // 3. Atualizações 8º e 9º Semestre
  const updates8_9 = [
    {
      course_code: '4302403',
      title: 'Mecânica Quântica I',
      excitation_level: 8,
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4302303',
      title: 'Eletromagnetismo I',
      excitation_level: 8,
      course_map: { licenciatura: 'eletiva' }
    },
    {
      course_code: '4302451',
      title: 'Evolução dos Conceitos da Física',
      excitation_level: 9,
      course_map: { licenciatura: 'eletiva' }
    }
  ];

  const allUpdates = [...updates7, ...updates8_9];

  for (const disc of allUpdates) {
    console.log(`Atualizando ${disc.course_code}: ${disc.title}`);
    const { error } = await supabase
      .from('learning_trails')
      .update(disc)
      .eq('course_code', disc.course_code);
    if (error) console.error(`Erro em ${disc.course_code}:`, error);
  }

  console.log('✓ Sincronização Final concluída.');
}

run();
