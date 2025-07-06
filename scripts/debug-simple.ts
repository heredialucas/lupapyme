import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function debugSimple() {
    try {
        console.log('🔍 Debuggeando directamente la base de datos...');

        // Obtener registros directamente
        const registros = await database.registro.findMany({
            where: { tenantId: 'tenant-a' }
        });

        console.log('📊 Registros encontrados:', registros.length);

        for (const registro of registros) {
            console.log('\n📋 Registro:');
            console.log('ID:', registro.id);
            console.log('Tenant:', registro.tenantId);
            console.log('Tipo:', registro.tipo);
            console.log('Data:', registro.data);
            console.log('Tipo de data:', Array.isArray(registro.data) ? 'Array' : 'Object');
        }

        // Obtener definición de modelo
        const modelDef = await database.modelDefinition.findFirst({
            where: { tenantId: 'tenant-a', tipo: 'productos' }
        });

        if (modelDef) {
            console.log('\n📋 Definición de modelo:');
            console.log('Campos:', modelDef.campos);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await database.$disconnect();
    }
}

debugSimple(); 