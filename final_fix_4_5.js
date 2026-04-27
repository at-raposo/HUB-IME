require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- MEGA SYNC: 4º E 5º SEMESTRE + FIX MAPPING ---');

  // 1. Corrigir TODOS os registros para terem course_map (cópia de category_map se existir)
  // Como não posso renomear coluna via RPC facilmente aqui, vou fazer via script para os registros chave
  
  const targetCodes = ['4300225', '4300266', 'AGA0317', 'AGA0502', '4300351', 'QFL0605'];
  
  const disciplines = [
    {
      course_code: '4300225',
      title: 'Métodos da Física Teórica',
      excitation_level: 4,
      prerequisites: ['MAT1352'],
      category: 'eletiva', // Alterando para eletiva para bater com o filtro do print
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: '4300266',
      title: 'Partículas - a Dança da Matéria e dos Campos',
      excitation_level: 4,
      prerequisites: ['4300255'],
      category: 'eletiva',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: 'AGA0317',
      title: 'Experimentos de Astronomia',
      excitation_level: 4,
      prerequisites: ['AGA0215'],
      category: 'eletiva',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: 'AGA0502',
      title: 'Planetas e Sistemas Planetários',
      excitation_level: 4,
      prerequisites: ['4300153', 'MAT1352'],
      category: 'eletiva',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: '4300351',
      title: 'Física do Meio Ambiente',
      excitation_level: 5,
      category: 'eletiva',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: 'QFL0605',
      title: 'Química Geral',
      excitation_level: 5,
      category: 'eletiva',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    }
  ];

  for (const disc of disciplines) {
    const { data: existing } = await supabase
      .from('learning_trails')
      .select('id')
      .eq('course_code', disc.course_code)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`Atualizando ${disc.course_code}: ${disc.title}`);
      await supabase.from('learning_trails').update(disc).eq('id', existing[0].id);
    } else {
      console.log(`Inserindo ${disc.course_code}: ${disc.title}`);
      await supabase.from('learning_trails').insert(disc);
    }
  }

  console.log('✓ Sincronização concluída com categorias ajustadas para Eletiva.');
}

run();
