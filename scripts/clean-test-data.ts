import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function cleanTestData() {
    console.log('🧹 Iniciando limpieza de datos de prueba...');

    try {
        // Eliminar registros de prueba
        console.log('📝 Eliminando registros de prueba...');
        const deletedRegistros = await database.registro.deleteMany({
            where: {
                tenantId: 'test-tenant-1'
            }
        });

        // Eliminar definiciones de modelo de prueba
        console.log('📋 Eliminando definiciones de modelo de prueba...');
        const deletedModelDefinitions = await database.modelDefinition.deleteMany({
            where: {
                tenantId: 'test-tenant-1'
            }
        });

        console.log('✅ Limpieza completada exitosamente!');
        console.log('📊 Resumen:');
        console.log(`- Registros eliminados: ${deletedRegistros.count}`);
        console.log(`- ModelDefinitions eliminados: ${deletedModelDefinitions.count}`);

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        throw error;
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar el script
cleanTestData()
    .then(() => {
        console.log('🎉 Limpieza completada exitosamente!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error en la limpieza:', error);
        process.exit(1);
    }); 