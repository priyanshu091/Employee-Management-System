import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) acc[key] = rest.join('=');
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, profile:profiles!leave_requests_employee_id_fkey(full_name, employee_id, avatar_url)')
    .eq('status', 'pending');
  console.log('Leave requests:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

run();
