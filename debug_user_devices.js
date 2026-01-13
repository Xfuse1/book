
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqqaupbkamtfjweajkjo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWF1cGJrYW10Zmp3ZWFqa2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc4MDgsImV4cCI6MjA4MzEwMzgwOH0.Poaanj0Xa3wDfDRe5Q1pZpdGtkR-hOMUZSrdm9dLfSE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserDevices(email) {
    console.log(`Checking devices for: ${email}`);

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

    if (userError || !user) {
        console.error('User not found:', userError);
        return;
    }

    console.log(`User ID: ${user.id}`);

    const { data: devices, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id);

    if (deviceError) {
        console.error('Error fetching devices:', deviceError);
        return;
    }

    console.log('Registered Devices:', JSON.stringify(devices, null, 2));
}

checkUserDevices('roaagamal457@gmail.com');
