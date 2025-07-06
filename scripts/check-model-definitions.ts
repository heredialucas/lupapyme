import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function checkModelDefinitions() {
    console.log('📋 Verificando todas las definiciones de modelo...');

    try {
        const modelDefinitions = await database.modelDefinition.findMany({
            orderBy: { createdAt: 'desc' }
        });

        console.log(`📊 ModelDefinitions encontrados: ${modelDefinitions.length}\n`);

        if (modelDefinitions.length === 0) {
            console.log('❌ No hay definiciones de modelo en la base de datos');
            return;
        }

        console.log('📋 Definiciones de modelo disponibles:');
        console.log('='.repeat(80));

        modelDefinitions.forEach((md, index) => {
            console.log(`${index + 1}. ID: ${md.id}`);
            console.log(`   TenantId: ${md.tenantId}`);
            console.log(`   Tipo: ${md.tipo}`);
            console.log(`   Campos: ${(md.campos as any[]).length}`);

            const campos = md.campos as any[];
            console.log('   Detalle de campos:');
            campos.forEach((campo, campoIndex) => {
                console.log(`     ${campoIndex + 1}. ${campo.label || campo.name} (${campo.name}) - Tipo: ${campo.type || campo.tipo}`);
            });
            console.log('');
        });

        // Verificar por tenant específico
        console.log('🔍 Verificando por tenantId específico:');
        console.log('='.repeat(80));

        const tenants = [...new Set(modelDefinitions.map(md => md.tenantId))];

        for (const tenantId of tenants) {
            const tenantModels = modelDefinitions.filter(md => md.tenantId === tenantId);
            console.log(`\n📋 TenantId: ${tenantId}`);
            console.log(`   ModelDefinitions: ${tenantModels.length}`);

            tenantModels.forEach(md => {
                console.log(`   - ${md.tipo} (${(md.campos as any[]).length} campos)`);
            });
        }

        console.log('\n💡 Para solucionar el problema:');
        console.log('1. El servicio está buscando por tipo "orders" por defecto');
        console.log('2. Pero tus datos están guardados con tipo "productos"');
        console.log('3. Necesitas cambiar el tipo en el servicio o crear una definición con tipo "orders"');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        throw error;
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar el script
checkModelDefinitions()
    .then(() => {
        console.log('🎉 Verificación completada!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error en la verificación:', error);
        process.exit(1);
    }); 