require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('--- INICIANDO SINCRONIZAÇÃO JUPITERWEB ---');

  const syncData = [
    {
      id: '1860fe76-50cb-4191-91b7-d2327d607782', // Atual EDF0292
      updated: {
        course_code: 'EDF0292',
        title: 'Psicologia Histórico-Cultural e Educação',
        category: 'eletiva'
      }
    },
    {
      id: '78428ef4-ad75-4003-b429-07ff52a3af87', // Atual EDF0296 (Constituição do Sujeito)
      updated: {
        course_code: 'EDF0294',
        title: 'Psicologia da educação: constituição do sujeito, desenvolvimento e aprendizagem na escola, cultura e sociedade',
        category: 'eletiva'
      }
    },
    {
      id: 'd74dda4f-4516-478c-8a27-1e52b81a1e7b', // Ex-EDF029X / Atual EDF029296
      updated: {
        course_code: 'EDF0296',
        title: 'Psicologia da Educação : Uma Abordagem Psicossocial do Cotidiano Escolar',
        category: 'eletiva'
      }
    },
    {
      id: '7078ae36-0b6b-4a22-9726-9d97ec076272', // Atual EDF0299 EDF0298
      updated: {
        course_code: 'EDF0298',
        title: 'Psicologia da Educação, Desenvolvimento e Práticas Escolares',
        category: 'eletiva'
      }
    }
  ];

  for (const item of syncData) {
    const { error } = await supabase
      .from('learning_trails')
      .update(item.updated)
      .eq('id', item.id);

    if (error) {
      console.error(`Erro ao sincronizar ${item.updated.course_code}:`, error);
    } else {
      console.log(`✓ Sincronizado: ${item.updated.course_code} - ${item.updated.title}`);
    }
  }

  // Limpeza: Remover a EDF0298 antiga (ID: 6996b305-4368-4878-a02c-993c25fa9bb6) que agora é redundante
  const { error: delError } = await supabase
    .from('learning_trails')
    .delete()
    .eq('id', '6996b305-4368-4878-a02c-993c25fa9bb6');

  if (delError) {
    console.error('Erro ao deletar disciplina redundante EDF0298:', delError);
  } else {
    console.log('✓ Disciplina redundante EDF0298 removida.');
  }

  console.log('--- SINCRONIZAÇÃO CONCLUÍDA ---');
}

run();
