const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqqaupbkamtfjweajkjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWF1cGJrYW10Zmp3ZWFqa2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc4MDgsImV4cCI6MjA4MzEwMzgwOH0.Poaanj0Xa3wDfDRe5Q1pZpdGtkR-hOMUZSrdm9dLfSE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableDetails(tableName) {
    // Check count
    const { count, error, status } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

    if (error) {
        if (status === 404) {
            console.log(`[${tableName}] Status: ${status} (Not Found)`);
        } else {
            console.log(`[${tableName}] Status: ${status}, Error: ${error.message} (Exists but maybe restricted)`);
        }
    } else {
        console.log(`[${tableName}] Status: ${status} (Exists), Row Count: ${count}`);
    }
}

async function main() {
    console.log('Checking detected tables details...');
    await checkTableDetails('reading_progress');
    await checkTableDetails('users');

    // Double check conflicting reports
    await checkTableDetails('profiles');
}

main();
