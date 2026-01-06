const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqqaupbkamtfjweajkjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWF1cGJrYW10Zmp3ZWFqa2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc4MDgsImV4cCI6MjA4MzEwMzgwOH0.Poaanj0Xa3wDfDRe5Q1pZpdGtkR-hOMUZSrdm9dLfSE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkActualColumns() {
    console.log('Fetching one user to see available columns...');
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]));
    } else {
        console.log('No users found to check columns.');
        // Try to select specific columns to see if they error out
        const columns = ['full_name', 'email', 'password_hash'];
        for (const col of columns) {
            const { error: colError } = await supabase.from('users').select(col).limit(1);
            if (colError) {
                console.log(`Column ${col} does NOT exist (or no access). Error: ${colError.message}`);
            } else {
                console.log(`Column ${col} EXISTS.`);
            }
        }
    }
}

checkActualColumns();
