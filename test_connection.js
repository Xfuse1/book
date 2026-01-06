const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pqqaupbkamtfjweajkjo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWF1cGJrYW10Zmp3ZWFqa2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1Mjc4MDgsImV4cCI6MjA4MzEwMzgwOH0.Poaanj0Xa3wDfDRe5Q1pZpdGtkR-hOMUZSrdm9dLfSE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing connection to:', supabaseUrl);
    try {
        // Try to access a public table or just verify initialization
        // We'll try to fetch 0 rows from a potentially non-existent table just to see if we reach the server
        // Or 'reading_progress' which was mentioned in history
        const { data, error, status } = await supabase.from('reading_progress').select('*').limit(1);

        if (error) {
            console.log('Result: Connected but received error (expected if RLS or table missing):');
            console.log('Error Code:', error.code);
            console.log('Error Message:', error.message);
            // network failing would usually throw or return unique error
        } else {
            console.log('Result: Connection Successful and Query OK');
            console.log('Status:', status);
        }
    } catch (err) {
        console.error('Result: Connection Failed (Exception)');
        console.error(err);
    }
}

testConnection();
