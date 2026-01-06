const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqqaupbkamtfjweajkjo.supabase.co';
// The user provided secret
const serviceKey = 'sb_secret_p6lDeFMAC5UfOuPMM0bs-w_s8aBaAiP';

// Initialize with the provided key check if it works
const supabase = createClient(supabaseUrl, serviceKey);

async function verifyAndList() {
    console.log('Verifying key format...');
    if (!serviceKey.startsWith('eyJ')) {
        console.log('Warning: Key does not start with "eyJ". It may not be a valid JWT.');
    }

    console.log('Attempting admin connection...');
    // Try to list tables from information_schema to verify admin access
    // Regular users usually can't read information_schema freely or we use a rpc if available.
    // Easiest check: try to fetch rows from 'users' table ignoring RLS (which service role bypasses)

    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
        console.log('Connection Failed / Authentication Error:');
        console.log(error.message);
    } else {
        console.log('Success! Admin access verified.');
    }
}

verifyAndList();
