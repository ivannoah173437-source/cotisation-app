// test-supabase.js
import { createClient } from '@supabase/supabase-js';

// Les variables en dur pour le test
const supabaseUrl = 'https://iltuewyhxlggqjdzrqmi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdHVld3loeGxnZ3FqZHpycW1pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQzNzU2NCwiZXhwIjoyMDk5MDEzNTY0fQ.iiUipJ5bugO_AhMnqlU0xPFAHwNdD0xM98-mMT12p1U';

// Créer le client
const supabase = createClient(supabaseUrl, supabaseKey);

// Tester la connexion
try {
    const { data, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.log('❌ Erreur Supabase:', error.message);
        console.log('Détails:', error);
    } else {
        console.log('✅ Succès ! Données:', data);
    }
} catch (err) {
    console.log('❌ Erreur générale:', err.message);
}