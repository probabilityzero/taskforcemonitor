import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qvwafnrtsiotsohreags.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2d2FmbnJ0c2lvdHNvaHJlYWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyOTk4MDcsImV4cCI6MjA1Mzg3NTgwN30.9eeANJnVNBOh6YC89gPWd4VZvhnBy1gt92EJaZwAlpU';

export const supabase = createClient(supabaseUrl, supabaseKey);
