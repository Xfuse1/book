const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqqaupbkamtfjweajkjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWF1cGJrYW10Zmp3ZWFqa2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc4MDgsImV4cCI6MjA4MzEwMzgwOH0.Poaanj0Xa3wDfDRe5Q1pZpdGtkR-hOMUZSrdm9dLfSE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('email, full_name, verification_code');

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    console.log('Current Users in DB:');
    data.forEach(u => {
        console.log(`- ${u.email} (${u.full_name}): Code = ${u.verification_code || 'None'}`);
    });
}

checkUsers();
