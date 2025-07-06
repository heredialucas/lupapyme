#!/usr/bin/env node

import { database } from '../packages/database/index.js';

async function checkDatabase() {
    console.log('🔍 Verificando conexión a la base de datos...\n');

    try {
        // Verificar si DATABASE_URL está configurada
        if (!process.env.DATABASE_URL) {
            console.log('❌ DATABASE_URL no está configurada');
            console.log('📝 Solución: Configura la variable DATABASE_URL en tu archivo .env');
            return;
        }

        console.log('✅ DATABASE_URL configurada');
        console.log(`📍 URL: ${process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);

        // Intentar una consulta simple
        if (database.registro) {
            const count = await database.registro.count();
            console.log('✅ Conexión exitosa a la base de datos');
            console.log(`📊 Total de registros: ${count}`);
        } else {
            console.log('⚠️  Base de datos no disponible (usando proxy)');
            console.log('📝 Esto puede indicar:');
            console.log('   - La base de datos de Supabase está pausada');
            console.log('   - Las credenciales han expirado');
            console.log('   - Problemas de conectividad');
        }

    } catch (error) {
        console.log('❌ Error conectando a la base de datos:');
        console.log(error);
        console.log('\n🔧 Soluciones posibles:');
        console.log('1. Verifica que tu proyecto de Supabase esté activo');
        console.log('2. Reactiva la base de datos si está pausada');
        console.log('3. Obtén nuevas credenciales de conexión');
        console.log('4. Verifica tu conexión a internet');
    }
}

checkDatabase().catch(console.error); 