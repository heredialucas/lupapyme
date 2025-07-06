import { database } from '@repo/database';

interface VerificationStats {
    totalRegistros: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    totalOrderItems: number;
    issues: string[];
}

async function verifyMigration() {
    const stats: VerificationStats = {
        totalRegistros: 0,
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalOrderItems: 0,
        issues: []
    };

    console.log('🔍 Verificando integridad de la migración...\n');

    try {
        // Contar registros originales
        const registros = await database.registro.findMany();
        stats.totalRegistros = registros.length;

        // Contar entidades migradas
        const [customers, products, orders, orderItems] = await Promise.all([
            database.customer.count(),
            database.product.count(),
            database.order.count(),
            database.orderItem.count()
        ]);

        stats.totalCustomers = customers;
        stats.totalProducts = products;
        stats.totalOrders = orders;
        stats.totalOrderItems = orderItems;

        // Verificar integridad referencial
        await verifyReferentialIntegrity(stats);

        // Mostrar estadísticas
        console.log('📊 Estadísticas de verificación:');
        console.log(`📄 Registros originales: ${stats.totalRegistros}`);
        console.log(`👥 Clientes migrados: ${stats.totalCustomers}`);
        console.log(`📦 Productos migrados: ${stats.totalProducts}`);
        console.log(`📋 Órdenes migradas: ${stats.totalOrders}`);
        console.log(`🛒 Items de orden migrados: ${stats.totalOrderItems}`);

        if (stats.issues.length > 0) {
            console.log('\n⚠️ Problemas encontrados:');
            stats.issues.forEach(issue => console.log(`  - ${issue}`));
        } else {
            console.log('\n✅ No se encontraron problemas de integridad');
        }

        // Verificar rendimiento
        await verifyPerformance();

        console.log('\n🎉 Verificación completada');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        process.exit(1);
    }
}

async function verifyReferentialIntegrity(stats: VerificationStats) {
    console.log('\n🔗 Verificando integridad referencial...');

    // Verificar órdenes sin cliente
    const orphanOrders = await database.order.findMany({
        where: {
            customer: null
        }
    });

    if (orphanOrders.length > 0) {
        stats.issues.push(`${orphanOrders.length} órdenes sin cliente asociado`);
    }

    // Verificar items sin orden
    const orphanItems = await database.orderItem.findMany({
        where: {
            order: null
        }
    });

    if (orphanItems.length > 0) {
        stats.issues.push(`${orphanItems.length} items sin orden asociada`);
    }

    // Verificar productos sin categoría (esto es normal)
    const productsWithoutCategory = await database.product.count({
        where: {
            categoryId: null
        }
    });

    console.log(`📦 Productos sin categoría: ${productsWithoutCategory} (normal)`);

    // Verificar clientes sin órdenes
    const customersWithoutOrders = await database.customer.count({
        where: {
            orders: {
                none: {}
            }
        }
    });

    console.log(`👥 Clientes sin órdenes: ${customersWithoutOrders} (normal)`);
}

async function verifyPerformance() {
    console.log('\n⚡ Verificando rendimiento...');

    const startTime = Date.now();

    // Test de consulta compleja
    const complexQuery = await database.order.findMany({
        where: {
            status: 'DELIVERED',
            createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
            }
        },
        include: {
            customer: true,
            items: {
                include: {
                    product: true
                }
            }
        },
        take: 100
    });

    const queryTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo de consulta compleja: ${queryTime}ms`);

    if (queryTime > 1000) {
        console.log('⚠️ Consulta lenta detectada - considerar optimización de índices');
    } else {
        console.log('✅ Rendimiento de consultas aceptable');
    }

    // Test de agregaciones
    const aggregationStart = Date.now();

    const stats = await database.order.aggregate({
        where: {
            createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
        },
        _sum: {
            total: true
        },
        _count: {
            id: true
        }
    });

    const aggregationTime = Date.now() - aggregationStart;
    console.log(`📊 Tiempo de agregación: ${aggregationTime}ms`);
    console.log(`💰 Total ventas (30 días): $${stats._sum.total || 0}`);
    console.log(`📋 Total órdenes (30 días): ${stats._count.id}`);
}

// Ejecutar verificación
verifyMigration().catch(console.error); 