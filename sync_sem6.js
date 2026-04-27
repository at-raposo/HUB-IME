require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- SINCRONIZAÇÃO 6º SEMESTRE (SYNC JUPITER) ---');

  const disciplines = [
    {
      course_code: '4300436',
      title: 'Efeitos Biológicos das Radiações Ionizantes e Não Ionizantes',
      excitation_level: 6,
      prerequisites: ['4300357', '4300271'],
      category: 'eletiva',
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: '4300491',
      title: 'Introdução à Pesquisa em Ensino de Física',
      excitation_level: 6,
      prerequisites: ['4300356'],
      category: 'eletiva',
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: '4302204',
      title: 'Física Matemática I',
      excitation_level: 6,
      prerequisites: ['MAT2352'],
      category: 'eletiva',
      course_map: { bacharelado: 'obrigatoria', licenciatura: 'eletiva', fisica_medica: 'obrigatoria' },
      category_map: { bacharelado: 'obrigatoria', licenciatura: 'eletiva', fisica_medica: 'obrigatoria' }
    },
    {
      course_code: '4302360',
      title: 'Aceleradores de Partículas: Fundamentos e Aplicações',
      excitation_level: 6,
      prerequisites: ['4300271'],
      category: 'eletiva',
      course_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      axis: 'lic'
    },
    {
      course_code: '4302401',
      title: 'Mecânica Estatística',
      excitation_level: 6,
      prerequisites: ['4300259', 'MAT2352'],
      category: 'eletiva',
      course_map: { bacharelado: 'obrigatoria', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      category_map: { bacharelado: 'obrigatoria', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: 'AGA0309',
      title: 'Mecânica Celeste',
      excitation_level: 6,
      prerequisites: ['MAT2352'],
      category: 'eletiva',
      course_map: { bacharelado: 'eletiva', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' },
      category_map: { bacharelado: 'eletiva', licenciatura: 'eletiva', fisica_medica: 'nao_se_aplica' }
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
      console.log(`Inserindo novo ${disc.course_code}: ${disc.title}`);
      await supabase.from('learning_trails').insert(disc);
    }
  }

  console.log('--- SINCRONIZAÇÃO 6º SEMESTRE CONCLUÍDA ---');
}

run();
