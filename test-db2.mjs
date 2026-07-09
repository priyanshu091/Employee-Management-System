import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) acc[key] = rest.join('=');
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const r1 = await supabase.from('wfh_requests').select('*, profiles(id)').limit(1);
  console.log('WFH:', r1.error?.message || 'OK');
  const r2 = await supabase.from('correction_requests').select('*, profiles(id)').limit(1);
  console.log('Correction:', r2.error?.message || 'OK');
}

run();
