import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase.from('admin_notifications').insert({
    title: 'Exemplo de Notificação Automática',
    message: 'Esta é uma notificação do sistema de teste.',
    target_type: 'automatic',
    status: 'sent',
    sent_at: new Date().toISOString(),
    recipients_count: 1
  });

  console.log("Error:", error);
  console.log("Inserted mock!");
}

check();
