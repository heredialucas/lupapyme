import { database } from '@repo/database';

interface OldRegistro {
    id: string;
    tenantId: string;
    tipo: string;
    data: any;
    createdAt: Date;
    updatedAt: Date;
}

interface MigrationStats {
    customers: number;
    products: number;
    orders: number;
    orderItems: number;
    errors: string[];
}

async function migrateData() {
    const stats: MigrationStats = {
        customers: 0,
        products: 0,
        orders: 0,
        orderItems: 0,
        errors: []
    };

    console.log('🔄 Iniciando migración de datos...');

    try {
        // Obtener todos los registros existentes
        const registros = await database.registro.findMany({
            orderBy: { createdAt: 'asc' }
        });

        console.log(`📊 Encontrados ${registros.length} registros para migrar`);

        // Procesar cada registro
        for (const registro of registros) {
            try {
                await processRegistro(registro, stats);
            } catch (error) {
                const errorMsg = `Error procesando registro ${registro.id}: ${error}`;
                console.error(errorMsg);
                stats.errors.push(errorMsg);
            }
        }

        // Mostrar estadísticas finales
        console.log('\n📈 Estadísticas de migración:');
        console.log(`✅ Clientes migrados: ${stats.customers}`);
        console.log(`✅ Productos migrados: ${stats.products}`);
        console.log(`✅ Órdenes migradas: ${stats.orders}`);
        console.log(`✅ Items de orden migrados: ${stats.orderItems}`);

        if (stats.errors.length > 0) {
            console.log(`❌ Errores: ${stats.errors.length}`);
            stats.errors.forEach(error => console.error(`  - ${error}`));
        }

        console.log('\n🎉 Migración completada');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        process.exit(1);
    }
}

async function processRegistro(registro: OldRegistro, stats: MigrationStats) {
    const { tipo, data, tenantId } = registro;

    switch (tipo) {
        case 'customer':
            await migrateCustomer(data, tenantId, stats);
            break;
        case 'product':
            await migrateProduct(data, tenantId, stats);
            break;
        case 'order':
            await migrateOrder(data, tenantId, stats);
            break;
        default:
            console.log(`⚠️ Tipo no reconocido: ${tipo}`);
    }
}

async function migrateCustomer(data: any, tenantId: string, stats: MigrationStats) {
    // Verificar si el cliente ya existe
    const existingCustomer = await database.customer.findFirst({
        where: {
            tenantId,
            OR: [
                { email: data.email },
                { phone: data.phone }
            ]
        }
    });

    if (existingCustomer) {
        console.log(`⏭️ Cliente ya existe: ${data.name}`);
        return;
    }

    // Crear cliente
    await database.customer.create({
        data: {
            name: data.name || 'Cliente sin nombre',
            email: data.email,
            phone: data.phone,
            address: data.address,
            tenantId
        }
    });

    stats.customers++;
    console.log(`✅ Cliente migrado: ${data.name}`);
}

async function migrateProduct(data: any, tenantId: string, stats: MigrationStats) {
    // Verificar si el producto ya existe
    const existingProduct = await database.product.findFirst({
        where: {
            tenantId,
            OR: [
                { sku: data.sku },
                { name: data.name }
            ]
        }
    });

    if (existingProduct) {
        console.log(`⏭️ Producto ya existe: ${data.name}`);
        return;
    }

    // Crear categoría si no existe
    let categoryId = null;
    if (data.category) {
        const category = await database.category.upsert({
            where: {
                name_tenantId: {
                    name: data.category,
                    tenantId
                }
            },
            update: {},
            create: {
                name: data.category,
                tenantId
            }
        });
        categoryId = category.id;
    }

    // Crear producto
    await database.product.create({
        data: {
            name: data.name || 'Producto sin nombre',
            description: data.description,
            price: parseFloat(data.price) || 0,
            cost: data.cost ? parseFloat(data.cost) : null,
            sku: data.sku,
            barcode: data.barcode,
            stock: parseInt(data.stock) || 0,
            minStock: parseInt(data.minStock) || 0,
            isActive: data.isActive !== false,
            categoryId,
            tenantId
        }
    });

    stats.products++;
    console.log(`✅ Producto migrado: ${data.name}`);
}

async function migrateOrder(data: any, tenantId: string, stats: MigrationStats) {
    // Buscar cliente
    const customer = await database.customer.findFirst({
        where: {
            tenantId,
            OR: [
                { email: data.customerEmail },
                { phone: data.customerPhone },
                { name: data.customerName }
            ]
        }
    });

    if (!customer) {
        console.log(`⚠️ Cliente no encontrado para orden: ${data.orderNumber}`);
        return;
    }

    // Verificar si la orden ya existe
    const existingOrder = await database.order.findFirst({
        where: {
            tenantId,
            orderNumber: data.orderNumber
        }
    });

    if (existingOrder) {
        console.log(`⏭️ Orden ya existe: ${data.orderNumber}`);
        return;
    }

    // Crear orden
    const order = await database.order.create({
        data: {
            orderNumber: data.orderNumber,
            customerId: customer.id,
            tenantId,
            status: mapOrderStatus(data.status),
            total: parseFloat(data.total) || 0,
            subtotal: parseFloat(data.subtotal) || 0,
            tax: parseFloat(data.tax) || 0,
            discount: parseFloat(data.discount) || 0,
            notes: data.notes
        }
    });

    // Crear items de la orden
    if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
            // Buscar producto
            const product = await database.product.findFirst({
                where: {
                    tenantId,
                    OR: [
                        { sku: item.sku },
                        { name: item.name }
                    ]
                }
            });

            if (product) {
                await database.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: product.id,
                        quantity: parseInt(item.quantity) || 1,
                        price: parseFloat(item.price) || 0,
                        total: parseFloat(item.total) || 0,
                        notes: item.notes
                    }
                });
                stats.orderItems++;
            } else {
                console.log(`⚠️ Producto no encontrado para item: ${item.name}`);
            }
        }
    }

    stats.orders++;
    console.log(`✅ Orden migrada: ${data.orderNumber}`);
}

function mapOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
        'pending': 'PENDING',
        'confirmed': 'CONFIRMED',
        'in_progress': 'IN_PROGRESS',
        'ready': 'READY',
        'delivered': 'DELIVERED',
        'cancelled': 'CANCELLED'
    };

    return statusMap[status?.toLowerCase()] || 'PENDING';
}

// Ejecutar migración
migrateData().catch(console.error); 