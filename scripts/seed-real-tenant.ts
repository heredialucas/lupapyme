import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function seedRealTenantData() {
    console.log('🌱 Iniciando seed de datos para tenant real...');

    // Usar el tenantId del usuario existente
    const realTenantId = 'tenant-a'; // Usuario: nico caliari

    try {
        // 1. Crear definiciones de modelo para el tenant real
        console.log('📋 Creando definiciones de modelo para tenant real...');

        const modelDefinition1 = await database.modelDefinition.create({
            data: {
                tenantId: realTenantId,
                tipo: 'clientes',
                campos: [
                    {
                        name: 'nombre',
                        label: 'Nombre',
                        type: 'text',
                        required: true,
                        order: 1
                    },
                    {
                        name: 'email',
                        label: 'Email',
                        type: 'email',
                        required: true,
                        order: 2
                    },
                    {
                        name: 'telefono',
                        label: 'Teléfono',
                        type: 'tel',
                        required: false,
                        order: 3
                    },
                    {
                        name: 'direccion',
                        label: 'Dirección',
                        type: 'textarea',
                        required: false,
                        order: 4
                    }
                ]
            }
        });

        const modelDefinition2 = await database.modelDefinition.create({
            data: {
                tenantId: realTenantId,
                tipo: 'productos',
                campos: [
                    {
                        name: 'nombre',
                        label: 'Nombre del Producto',
                        type: 'text',
                        required: true,
                        order: 1
                    },
                    {
                        name: 'descripcion',
                        label: 'Descripción',
                        type: 'textarea',
                        required: false,
                        order: 2
                    },
                    {
                        name: 'precio',
                        label: 'Precio',
                        type: 'number',
                        required: true,
                        order: 3
                    },
                    {
                        name: 'categoria',
                        label: 'Categoría',
                        type: 'select',
                        options: ['Electrónicos', 'Ropa', 'Hogar', 'Deportes'],
                        required: false,
                        order: 4
                    },
                    {
                        name: 'stock',
                        label: 'Stock Disponible',
                        type: 'number',
                        required: false,
                        order: 5
                    }
                ]
            }
        });

        console.log('✅ Definiciones de modelo creadas para tenant real:');
        console.log('- Clientes:', modelDefinition1.id);
        console.log('- Productos:', modelDefinition2.id);

        // 2. Crear registros de clientes con arrays de valores
        console.log('👥 Creando registros de clientes...');

        const clientesRegistros = [
            {
                tenantId: realTenantId,
                tipo: 'clientes',
                data: [
                    'Ana Martínez',
                    'ana.martinez@empresa.com',
                    '+54 11 1111-2222',
                    'Av. Santa Fe 1234, Buenos Aires'
                ]
            },
            {
                tenantId: realTenantId,
                tipo: 'clientes',
                data: [
                    'Luis Fernández',
                    'luis.fernandez@empresa.com',
                    '+54 11 3333-4444',
                    'Calle San Martín 567, CABA'
                ]
            },
            {
                tenantId: realTenantId,
                tipo: 'clientes',
                data: [
                    'Carmen López',
                    'carmen.lopez@empresa.com',
                    '+54 11 5555-6666',
                    'Palermo 890, Buenos Aires'
                ]
            }
        ];

        for (const clienteData of clientesRegistros) {
            await database.registro.create({
                data: clienteData
            });
        }

        // 3. Crear registros de productos con arrays de valores
        console.log('📦 Creando registros de productos...');

        const productosRegistros = [
            {
                tenantId: realTenantId,
                tipo: 'productos',
                data: [
                    'MacBook Pro M3',
                    'Laptop profesional con chip M3, 16GB RAM, 512GB SSD',
                    2499.99,
                    'Electrónicos',
                    15
                ]
            },
            {
                tenantId: realTenantId,
                tipo: 'productos',
                data: [
                    'Adidas Ultraboost',
                    'Zapatillas running con tecnología Boost',
                    179.99,
                    'Deportes',
                    30
                ]
            },
            {
                tenantId: realTenantId,
                tipo: 'productos',
                data: [
                    'Mesa de Comedor',
                    'Mesa de comedor de 6 plazas en madera maciza',
                    599.99,
                    'Hogar',
                    5
                ]
            },
            {
                tenantId: realTenantId,
                tipo: 'productos',
                data: [
                    'Blazer Clásico',
                    'Blazer formal en lana, corte slim fit',
                    89.99,
                    'Ropa',
                    75
                ]
            }
        ];

        for (const productoData of productosRegistros) {
            await database.registro.create({
                data: productoData
            });
        }

        console.log('✅ Datos de prueba creados exitosamente para tenant real!');
        console.log('📊 Resumen:');
        console.log(`- TenantId: ${realTenantId}`);
        console.log('- 2 definiciones de modelo (clientes, productos)');
        console.log('- 3 registros de clientes');
        console.log('- 4 registros de productos');

        // 4. Verificar los datos creados
        console.log('\n🔍 Verificando datos creados...');

        const modelDefinitions = await database.modelDefinition.findMany({
            where: { tenantId: realTenantId }
        });

        const registros = await database.registro.findMany({
            where: { tenantId: realTenantId }
        });

        console.log(`📋 ModelDefinitions encontrados: ${modelDefinitions.length}`);
        console.log(`📝 Registros encontrados: ${registros.length}`);

        // Mostrar mapeo de datos
        console.log('\n🔗 Mapeo de datos:');
        const productosModel = modelDefinitions.find(md => md.tipo === 'productos');
        const productosRegistro = registros.find(r => r.tipo === 'productos');

        if (productosModel && productosRegistro) {
            const campos = productosModel.campos as any[];
            const valores = productosRegistro.data as any[];

            console.log('Columnas definidas en ModelDefinition (productos):');
            campos.forEach((campo, index) => {
                console.log(`  ${index + 1}. ${campo.label} (${campo.name}): ${valores[index]}`);
            });
        }

        console.log('\n💡 Para usar estos datos en la aplicación:');
        console.log(`1. Asegúrate de que el usuario tenga tenantId: ${realTenantId}`);
        console.log('2. Los datos aparecerán en la tabla dinámica');
        console.log('3. Puedes crear nuevos registros que se guardarán con este tenantId');
        console.log('4. El campo "data" ahora es un array que mapea con las columnas definidas');

    } catch (error) {
        console.error('❌ Error durante el seed:', error);
        throw error;
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar el script
seedRealTenantData()
    .then(() => {
        console.log('🎉 Seed para tenant real completado exitosamente!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error en el seed:', error);
        process.exit(1);
    }); 