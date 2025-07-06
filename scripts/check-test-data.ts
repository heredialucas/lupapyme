import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function checkTestData() {
    console.log('🔍 Verificando datos de prueba...');

    try {
        // Verificar definiciones de modelo
        console.log('📋 Verificando ModelDefinitions...');
        const modelDefinitions = await database.modelDefinition.findMany({
            where: { tenantId: 'test-tenant-1' }
        });

        console.log(`📋 ModelDefinitions encontrados: ${modelDefinitions.length}`);

        for (const md of modelDefinitions) {
            console.log(`- ${md.tipo}: ${md.id}`);
            const campos = md.campos as any[];
            console.log(`  Campos: ${campos.length}`);
        }

        // Verificar registros
        console.log('\n📝 Verificando Registros...');
        const registros = await database.registro.findMany({
            where: { tenantId: 'test-tenant-1' }
        });

        console.log(`📝 Registros encontrados: ${registros.length}`);

        // Agrupar por tipo
        const registrosPorTipo = registros.reduce((acc: Record<string, any[]>, registro) => {
            if (!acc[registro.tipo]) {
                acc[registro.tipo] = [];
            }
            acc[registro.tipo].push(registro);
            return acc;
        }, {});

        for (const [tipo, registrosDelTipo] of Object.entries(registrosPorTipo)) {
            console.log(`- ${tipo}: ${registrosDelTipo.length} registros`);

            // Mostrar algunos ejemplos
            registrosDelTipo.slice(0, 2).forEach((registro, index) => {
                console.log(`  ${index + 1}. ${JSON.stringify(registro.data)}`);
            });
        }

        // Verificar todos los tenantIds únicos
        console.log('\n🏢 Verificando todos los tenantIds...');
        const allRegistros = await database.registro.findMany({
            select: { tenantId: true }
        });

        const uniqueTenantIds = [...new Set(allRegistros.map(r => r.tenantId))];
        console.log(`TenantIds únicos: ${uniqueTenantIds.join(', ')}`);

        const allModelDefinitions = await database.modelDefinition.findMany({
            select: { tenantId: true }
        });

        const uniqueModelTenantIds = [...new Set(allModelDefinitions.map(md => md.tenantId))];
        console.log(`ModelDefinition TenantIds únicos: ${uniqueModelTenantIds.join(', ')}`);

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        throw error;
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar el script
checkTestData()
    .then(() => {
        console.log('🎉 Verificación completada!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error en la verificación:', error);
        process.exit(1);
    }); 