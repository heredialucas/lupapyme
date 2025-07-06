import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function seedTestData() {
    console.log('🌱 Iniciando seed de datos de prueba...');

    try {
        // 1. Crear definiciones de modelo
        console.log('📋 Creando definiciones de modelo...');

        const modelDefinition1 = await database.modelDefinition.create({
            data: {
                tenantId: 'test-tenant-1',
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
                tenantId: 'test-tenant-1',
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

        console.log('✅ Definiciones de modelo creadas:');
        console.log('- Clientes:', modelDefinition1.id);
        console.log('- Productos:', modelDefinition2.id);

        // 2. Crear registros de clientes con arrays de valores
        console.log('👥 Creando registros de clientes...');

        const clientesRegistros = [
            {
                tenantId: 'test-tenant-1',
                tipo: 'clientes',
                data: [
                    'Juan Pérez',
                    'juan.perez@email.com',
                    '+54 11 1234-5678',
                    'Av. Corrientes 1234, Buenos Aires'
                ]
            },
            {
                tenantId: 'test-tenant-1',
                tipo: 'clientes',
                data: [
                    'María González',
                    'maria.gonzalez@email.com',
                    '+54 11 9876-5432',
                    'Calle Florida 567, CABA'
                ]
            },
            {
                tenantId: 'test-tenant-1',
                tipo: 'clientes',
                data: [
                    'Carlos Rodríguez',
                    'carlos.rodriguez@email.com',
                    '+54 11 5555-1234',
                    'Belgrano 890, Buenos Aires'
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
                tenantId: 'test-tenant-1',
                tipo: 'productos',
                data: [
                    'iPhone 15 Pro',
                    'Smartphone de última generación con cámara profesional',
                    1299.99,
                    'Electrónicos',
                    25
                ]
            },
            {
                tenantId: 'test-tenant-1',
                tipo: 'productos',
                data: [
                    'Nike Air Max',
                    'Zapatillas deportivas con tecnología Air Max',
                    199.99,
                    'Deportes',
                    50
                ]
            },
            {
                tenantId: 'test-tenant-1',
                tipo: 'productos',
                data: [
                    'Sofá Moderno',
                    'Sofá de 3 plazas en tela premium',
                    899.99,
                    'Hogar',
                    8
                ]
            },
            {
                tenantId: 'test-tenant-1',
                tipo: 'productos',
                data: [
                    'Camisa de Algodón',
                    'Camisa casual 100% algodón, varios colores',
                    49.99,
                    'Ropa',
                    100
                ]
            }
        ];

        for (const productoData of productosRegistros) {
            await database.registro.create({
                data: productoData
            });
        }

        console.log('✅ Datos de prueba creados exitosamente!');
        console.log('📊 Resumen:');
        console.log('- 2 definiciones de modelo (clientes, productos)');
        console.log('- 3 registros de clientes');
        console.log('- 4 registros de productos');

        // 4. Verificar los datos creados
        console.log('\n🔍 Verificando datos creados...');

        const modelDefinitions = await database.modelDefinition.findMany({
            where: { tenantId: 'test-tenant-1' }
        });

        const registros = await database.registro.findMany({
            where: { tenantId: 'test-tenant-1' }
        });

        console.log(`📋 ModelDefinitions encontrados: ${modelDefinitions.length}`);
        console.log(`📝 Registros encontrados: ${registros.length}`);

        // Mostrar algunos ejemplos
        console.log('\n📋 Ejemplo de ModelDefinition (clientes):');
        console.log(JSON.stringify(modelDefinitions[0], null, 2));

        console.log('\n📝 Ejemplo de Registro (cliente):');
        console.log(JSON.stringify(registros[0], null, 2));

        // Mostrar cómo se mapean los datos
        console.log('\n🔗 Mapeo de datos:');
        const clientesModel = modelDefinitions.find(md => md.tipo === 'clientes');
        const clientesRegistro = registros.find(r => r.tipo === 'clientes');

        if (clientesModel && clientesRegistro) {
            const campos = clientesModel.campos as any[];
            const valores = clientesRegistro.data as any[];

            console.log('Columnas definidas en ModelDefinition:');
            campos.forEach((campo, index) => {
                console.log(`  ${index + 1}. ${campo.label} (${campo.name}): ${valores[index]}`);
            });
        }

    } catch (error) {
        console.error('❌ Error durante el seed:', error);
        throw error;
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar el script
seedTestData()
    .then(() => {
        console.log('🎉 Seed completado exitosamente!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error en el seed:', error);
        process.exit(1);
    }); 