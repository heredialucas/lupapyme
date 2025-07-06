import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function showMapping() {
    console.log('🔗 Mostrando mapeo de datos...');

    try {
        const modelDefinitions = await database.modelDefinition.findMany({
            where: { tenantId: 'test-tenant-1' }
        });

        const registros = await database.registro.findMany({
            where: { tenantId: 'test-tenant-1' }
        });

        console.log(`📋 ModelDefinitions encontrados: ${modelDefinitions.length}`);
        console.log(`📝 Registros encontrados: ${registros.length}\n`);

        // Mostrar mapeo para cada tipo
        for (const modelDef of modelDefinitions) {
            console.log(`📊 Mapeo para tipo: ${modelDef.tipo}`);
            console.log('='.repeat(50));

            const campos = modelDef.campos as any[];
            const registrosDelTipo = registros.filter(r => r.tipo === modelDef.tipo);

            console.log('Columnas definidas:');
            campos.forEach((campo, index) => {
                console.log(`  ${index + 1}. ${campo.label} (${campo.name}) - Tipo: ${campo.type} - Requerido: ${campo.required}`);
            });

            console.log('\nDatos de ejemplo:');
            registrosDelTipo.slice(0, 2).forEach((registro, regIndex) => {
                const valores = registro.data as any[];
                console.log(`\n  Registro ${regIndex + 1}:`);
                campos.forEach((campo, index) => {
                    console.log(`    ${campo.label}: ${valores[index]}`);
                });
            });

            console.log('\n');
        }

        // Mostrar ejemplo completo de un registro
        console.log('📋 Ejemplo completo de mapeo:');
        console.log('='.repeat(50));

        const productosModel = modelDefinitions.find(md => md.tipo === 'productos');
        const productosRegistro = registros.find(r => r.tipo === 'productos');

        if (productosModel && productosRegistro) {
            const campos = productosModel.campos as any[];
            const valores = productosRegistro.data as any[];

            console.log('ModelDefinition (productos):');
            console.log(JSON.stringify(productosModel.campos, null, 2));

            console.log('\nRegistro (productos):');
            console.log(JSON.stringify(productosRegistro.data, null, 2));

            console.log('\nMapeo directo:');
            campos.forEach((campo, index) => {
                console.log(`  ${campo.label} (${campo.name}) = ${valores[index]}`);
            });
        }

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        throw error;
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar el script
showMapping()
    .then(() => {
        console.log('🎉 Mapeo mostrado exitosamente!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error al mostrar mapeo:', error);
        process.exit(1);
    }); 