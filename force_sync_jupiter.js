require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- INICIANDO SINCRONIZAÇÃO FORÇADA (SYNC JUPITER) ---');

  const disciplines = [
    {
      course_code: '4300225',
      title: 'Métodos da Física Teórica',
      excitation_level: 4,
      prerequisites: ['MAT1352'],
      category: 'obrigatoria',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'obrigatoria', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: '4300266',
      title: 'Partículas - a Dança da Matéria e dos Campos',
      excitation_level: 4,
      prerequisites: ['4300255'],
      category: 'obrigatoria',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'obrigatoria', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: 'AGA0317',
      title: 'Experimentos de Astronomia',
      excitation_level: 4,
      prerequisites: ['AGA0215'],
      category: 'obrigatoria',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'obrigatoria', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: 'AGA0502',
      title: 'Planetas e Sistemas Planetários',
      excitation_level: 4,
      prerequisites: ['4300153', 'MAT1352'],
      category: 'obrigatoria',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'obrigatoria', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: '4302311',
      title: 'Eletromagnetismo I',
      excitation_level: 8,
      category: 'obrigatoria',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'obrigatoria', fisica_medica: 'nao_se_aplica' }
    },
    {
      course_code: '4302451',
      title: 'Evolução dos Conceitos da Física',
      excitation_level: 9,
      category: 'obrigatoria',
      category_map: { bacharelado: 'nao_se_aplica', licenciatura: 'obrigatoria', fisica_medica: 'nao_se_aplica' }
    }
  ];

  for (const disc of disciplines) {
    // Tenta encontrar por código ou por título similar
    const { data: existing } = await supabase
      .from('learning_trails')
      .select('id')
      .or(`course_code.eq.${disc.course_code},title.ilike.%${disc.title}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`Atualizando: ${disc.course_code} (${disc.title})`);
      await supabase.from('learning_trails').update(disc).eq('id', existing[0].id);
    } else {
      console.log(`Inserindo novo: ${disc.course_code} (${disc.title})`);
      await supabase.from('learning_trails').insert(disc);
    }
  }

  // Limpeza do 5º Semestre: Garantir que apenas Meio Ambiente e Química estejam no nível 5
  console.log('Limpando 5º semestre...');
  const { data: level5s } = await supabase
    .from('learning_trails')
    .select('id, course_code, title')
    .eq('excitation_level', 5);

  for (const item of level5s) {
    if (item.course_code !== '4300351' && item.course_code !== 'QFL0605') {
       console.log(`Removendo ${item.title} do Nível 5`);
       // Move para o 7º ou remove o nível se não soubermos
       await supabase.from('learning_trails').update({ excitation_level: 7 }).eq('id', item.id);
    }
  }

  console.log('--- SINCRONIZAÇÃO FORÇADA CONCLUÍDA ---');
}

run();
