/**
 * ============================================================
 * FICHIER : services/supabaseClient.js
 * RÔLE : Gérer la connexion à Supabase et initialiser les tables.
 * EXPLICATION : Ce fichier :
 *   1. Crée un client Supabase avec la clé service_role
 *   2. Vérifie si les tables existent, et les crée si besoin
 *   3. Ajoute des données de démonstration
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
// Au début du fichier, après les imports
console.log('🔍 Vérification des variables d\'environnement :');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ définie' : '❌ manquante');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ définie' : '❌ manquante');
// Charger les variables d'environnement
dotenv.config();

// Récupérer les clés depuis le fichier .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Vérifier que les clés sont présentes
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env');
    process.exit(1);
}

// Créer le client Supabase avec la clé "service_role" (accès total)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Fonction pour initialiser les tables Supabase
 * Elle vérifie si les tables existent, les crée si besoin,
 * et ajoute des données de démonstration.
 */
export async function initSupabaseTables() {
    console.log('🌱 Vérification des tables Supabase...');

    // ----- 1. VÉRIFIER SI LA TABLE "users" EXISTE -----
    const { error: checkError } = await supabase.from('users').select('id').limit(1);

    // Si la table n'existe pas, on la crée via l'API REST de Supabase
    if (checkError && checkError.code === '42P01') {
        console.log('📦 Les tables n\'existent pas. Création en cours...');

        // Créer la table "users"
        await supabase.rpc('create_table_users', {});
        console.log('✅ Table "users" créée');

        // Créer la table "cotisations"
        await supabase.rpc('create_table_cotisations', {});
        console.log('✅ Table "cotisations" créée');

        // Créer la table "participants"
        await supabase.rpc('create_table_participants', {});
        console.log('✅ Table "participants" créée');

        // Créer la table "payments"
        await supabase.rpc('create_table_payments', {});
        console.log('✅ Table "payments" créée');

        // ----- 2. AJOUTER DES DONNÉES DE DÉMONSTRATION -----
        console.log('🌱 Ajout des données de test...');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Insérer un responsable
        const { data: responsable, error: rError } = await supabase
            .from('users')
            .insert({
                name: 'Mamadou Diallo',
                email: 'mamadou@exemple.com',
                password: hashedPassword,
                role: 'responsable'
            })
            .select()
            .single();

        if (rError) {
            console.error('❌ Erreur insertion responsable :', rError.message);
        }

        // Insérer un participant
        const { data: participant, error: pError } = await supabase
            .from('users')
            .insert({
                name: 'Aminata Koné',
                email: 'aminata@exemple.com',
                password: hashedPassword,
                role: 'participant'
            })
            .select()
            .single();

        if (pError) {
            console.error('❌ Erreur insertion participant :', pError.message);
        }

        if (responsable && participant) {
            // Créer une tontine
            const { data: cotisation, error: cError } = await supabase
                .from('cotisations')
                .insert({
                    responsable_id: responsable.id,
                    name: 'Tontine INSET Abidjan',
                    amount_per_person: 50000,
                    total_members: 30,
                    description: 'Tontine de la promotion 2024',
                    code_acces: 'TONTINE-INSET',
                    current_balance: 100000
                })
                .select()
                .single();

            if (cError) {
                console.error('❌ Erreur insertion tontine :', cError.message);
            }

            if (cotisation) {
                // Ajouter les participants
                await supabase.from('participants').insert([
                    {
                        cotisation_id: cotisation.id,
                        user_id: responsable.id,
                        amount_paid: 50000,
                        status: 'up_to_date'
                    },
                    {
                        cotisation_id: cotisation.id,
                        user_id: participant.id,
                        amount_paid: 50000,
                        status: 'up_to_date'
                    }
                ]);

                // Ajouter des paiements
                await supabase.from('payments').insert([
                    {
                        cotisation_id: cotisation.id,
                        user_id: responsable.id,
                        amount: 50000,
                        transaction_id: 'DEMO-001',
                        status: 'completed'
                    },
                    {
                        cotisation_id: cotisation.id,
                        user_id: participant.id,
                        amount: 50000,
                        transaction_id: 'DEMO-002',
                        status: 'completed'
                    }
                ]);

                console.log('✅ Données de test ajoutées avec succès.');
                console.log(`   👤 Responsable: mamadou@exemple.com / password123`);
                console.log(`   👤 Participant: aminata@exemple.com / password123`);
                console.log(`   🔑 Code tontine: TONTINE-INSET`);
            }
        }
    } else {
        console.log('✅ Les tables existent déjà.');
    }
}