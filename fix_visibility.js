require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- FIX VISIBILIDADE 7º SEMESTRE (LICENCIATURA) ---');

  const fixes = [
    {
      code: '4300415', // Projetos - ATPA
      upd: {
        category_map: { bacharelado: 'eletiva', licenciatura: 'obrigatoria', fisica_medica: 'eletiva' },
        course_map: { licenciatura: 'obrigatoria' }
      }
    },
    {
      code: 'MFT0964', // Língua de Sinais
      upd: {
        category_map: { bacharelado: 'eletiva', licenciatura: 'obrigatoria', fisica_medica: 'eletiva' },
        course_map: { licenciatura: 'obrigatoria' }
      }
    }
  ];

  for (const item of fixes) {
    const { error } = await supabase.from('learning_trails').update(item.upd).eq('course_code', item.code);
    if (error) {
      console.error(`Erro ao atualizar ${item.code}:`, error);
    } else {
      console.log(`✓ ${item.code} agora é OBRIGATÓRIA na Licenciatura.`);
    }
  }

  console.log('Correção final concluída.');
}

run();
