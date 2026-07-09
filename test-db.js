require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, profiles(full_name, employee_id, avatar_url)')
    .eq('status', 'pending');
  console.log('Leave requests:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

run();
