const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqqaupbkamtfjweajkjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWF1cGJrYW10Zmp3ZWFqa2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc4MDgsImV4cCI6MjA4MzEwMzgwOH0.Poaanj0Xa3wDfDRe5Q1pZpdGtkR-hOMUZSrdm9dLfSE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable(tableName) {
    const { data, error, status } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        // 404 typically means table not found (Postgrest)
        // 401/403 means permission denied (so table likely exists but RLS blocks)
        // 42P01 is relation does not exist (if internal error exposed)
        console.log(`Table '${tableName}': Status ${status}, Error: ${error.code || error.message}`);
        return false;

    }
    console.log(`Table '${tableName}': Status ${status} (Accessible/Exists)`);
    return true;
}

async function main() {
    await checkTable('reading_progress');
    await checkTable('profiles');
    await checkTable('users');
    await checkTable('notes');
}

main();
