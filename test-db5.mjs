import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) acc[key] = rest.join('=');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).single();
  const res = await supabase.from('audit_logs').insert({
    target_type: 'report',
    target_id: admin.id, // reuse id to not fail uuid constraint
    employee_id: admin.id,
    changed_by: admin.id,
    previous_value: {},
    new_value: { format: 'PDF', type: 'daily' },
    reason: 'Exported report'
  });
  console.log('Insert:', res.error?.message || 'OK');
}

run();
