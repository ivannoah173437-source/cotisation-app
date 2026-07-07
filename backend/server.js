/**
 * ============================================================
 * FICHIER : server.js
 * RÔLE : Point d'entrée du serveur backend.
 * ============================================================
 */

// ----- 1. IMPORTS DES BIBLIOTHÈQUES -----
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ----- 2. CHARGER LES VARIABLES D'ENVIRONNEMENT (FORCÉ) -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Afficher le chemin pour déboguer
console.log('📁 Chemin du fichier .env :', resolve(__dirname, '.env'));

// Forcer le chargement du .env
const result = dotenv.config({ path: resolve(__dirname, '.env') });

if (result.error) {
    console.error('❌ Erreur lors du chargement du .env :', result.error);
} else {
    console.log('✅ Fichier .env chargé avec succès !');
}

// ----- 3. IMPORTS SUPABASE -----
import { supabase, initSupabaseTables } from './services/supabaseClient.js';

// ----- 4. VÉRIFIER LES VARIABLES -----
console.log('🔍 Vérification des variables d\'environnement :');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ définie' : '❌ manquante');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ définie' : '❌ manquante');

// ----- 5. CRÉER L'APPLICATION EXPRESS -----
const app = express();
const PORT = process.env.PORT || 5000;

// ----- 6. CONFIGURER LES MIDDLEWARES -----
app.use(cors());
app.use(express.json());

// ----- 7. INITIALISER SUPABASE -----
console.log('🔄 Connexion à Supabase...');
try {
    await initSupabaseTables();
    console.log('✅ Supabase prêt !');
} catch (error) {
    console.error('❌ Erreur :', error.message);
    process.exit(1);
}

// ----- 8. ROUTES DE TEST -----
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: '🚀 Le serveur backend tourne parfaitement !',
        timestamp: new Date().toISOString(),
        version: '0.1.0'
    });
});

app.get('/api/test-users', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            success: true,
            count: data.length,
            users: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/test-cotisations', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cotisations')
            .select(`
                *,
                responsable:users(name, email)
            `);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({
            success: true,
            count: data.length,
            cotisations: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour tester la connexion à Supabase
app.get('/api/test-supabase', async (req, res) => {
    try {
        // Test simple : compter les utilisateurs
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (error) {
            return res.json({ 
                success: false, 
                error: error.message,
                details: error 
            });
        }

        res.json({
            success: true,
            message: 'Connexion à Supabase OK !',
            userCount: count
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});
// ----- 9. DÉMARRER LE SERVEUR -----
app.listen(PORT, () => {
    console.log('========================================');
    console.log('✅ Serveur backend démarré avec succès !');
    console.log('========================================');
    console.log(`📍 Adresse : http://localhost:${PORT}`);
    console.log(`🧪 Test santé : http://localhost:${PORT}/api/health`);
    console.log(`👤 Voir utilisateurs : http://localhost:${PORT}/api/test-users`);
    console.log(`📊 Voir tontines : http://localhost:${PORT}/api/test-cotisations`);
    console.log('========================================');
});