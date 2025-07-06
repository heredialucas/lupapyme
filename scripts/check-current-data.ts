import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function checkCurrentData() {
    try {
        console.log('🔍 Verificando estado actual de los datos...');

        // Obtener todos los registros
        const registros = await database.registro.findMany();
        console.log(`📊 Total de registros: ${registros.length}`);

        for (const registro of registros) {
            console.log(`\n📋 Registro ID: ${registro.id}`);
            console.log(`   Tenant: ${registro.tenantId}`);
            console.log(`   Tipo: ${registro.tipo}`);
            console.log(`   Data:`, registro.data);
            console.log(`   Tipo de data: ${Array.isArray(registro.data) ? 'Array' : 'Object'}`);
        }

        // Verificar definiciones de modelo
        const modelDefinitions = await database.modelDefinition.findMany();
        console.log(`\n📋 Total de definiciones de modelo: ${modelDefinitions.length}`);

        for (const modelDef of modelDefinitions) {
            console.log(`\n📋 Modelo ID: ${modelDef.id}`);
            console.log(`   Tenant: ${modelDef.tenantId}`);
            console.log(`   Tipo: ${modelDef.tipo}`);
            console.log(`   Campos:`, modelDef.campos);
        }

    } catch (error) {
        console.error('❌ Error verificando datos:', error);
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar la verificación
checkCurrentData(); 