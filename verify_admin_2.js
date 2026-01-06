const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqqaupbkamtfjweajkjo.supabase.co';
const serviceKey = 'sb_secret_p6lDeFMAC5UfOuPMM0bs-w_s8aBaAiP';

const supabase = createClient(supabaseUrl, serviceKey);

async function verifyAdminTruly() {
    console.log('Attempting to read protected table "profiles"...');
    // Previously this gave 404/Error with anon key
    const { data, error, status } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.log(`Failed to access profiles. Status: ${status}, Error: ${error.message}`);
        console.log('Conclusion: Key is LIKELY NOT a Service Role Key (or table really missing users/RLS active).');
    } else {
        console.log(`Success! Accessed profiles. Status: ${status}`);
        console.log('Conclusion: Key IS Service Role Key (RLS bypassed).');
    }
}

verifyAdminTruly();
