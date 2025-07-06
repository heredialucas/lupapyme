import { getRegistrosByTenant } from '../packages/data-services/src/index.js';

async function debugRegistros() {
    try {
        console.log('🔍 Debuggeando servicio de registros...');

        const result = await getRegistrosByTenant(
            'tenant-a', // tenantId
            { page: 1, pageSize: 10 }, // pagination
            {}, // filters
            null // sorting
        );

        console.log('📊 Resultado del servicio:');
        console.log('Success:', result.success);
        console.log('Error:', result.error);
        console.log('Total registros:', result.data?.length || 0);
        console.log('Paginación:', result.pagination);

        if (result.data && result.data.length > 0) {
            console.log('\n📋 Primer registro:');
            console.log(JSON.stringify(result.data[0], null, 2));
        }

    } catch (error) {
        console.error('❌ Error debuggeando registros:', error);
    }
}

// Ejecutar el debug
debugRegistros(); 