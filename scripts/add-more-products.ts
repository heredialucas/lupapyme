import { PrismaClient } from '../packages/database/generated/client/index.js';

const database = new PrismaClient();

async function addMoreProducts() {
    try {
        console.log('🛍️ Agregando más productos...');

        const tenantId = 'tenant-a';
        const tipo = 'productos';

        const productos = [
            {
                nombre: 'MacBook Pro M3',
                descripcion: 'Laptop profesional con chip M3, 16GB RAM, 512GB SSD',
                precio: 2499.99,
                categoria: 'Electrónicos',
                stock: 15
            },
            {
                nombre: 'Adidas Ultraboost',
                descripcion: 'Zapatillas running con tecnología Boost',
                precio: 179.99,
                categoria: 'Deportes',
                stock: 30
            },
            {
                nombre: 'Mesa de Comedor',
                descripcion: 'Mesa de comedor de 6 plazas en madera maciza',
                precio: 599.99,
                categoria: 'Hogar',
                stock: 5
            },
            {
                nombre: 'iPhone 15 Pro',
                descripcion: 'Smartphone con cámara profesional y chip A17 Pro',
                precio: 1199.99,
                categoria: 'Electrónicos',
                stock: 25
            },
            {
                nombre: 'Nike Air Max',
                descripcion: 'Zapatillas deportivas con tecnología Air Max',
                precio: 129.99,
                categoria: 'Deportes',
                stock: 40
            },
            {
                nombre: 'Sofá Chesterfield',
                descripcion: 'Sofá elegante en cuero con diseño clásico',
                precio: 899.99,
                categoria: 'Hogar',
                stock: 8
            },
            {
                nombre: 'Samsung Galaxy S24',
                descripcion: 'Smartphone Android con IA integrada',
                precio: 999.99,
                categoria: 'Electrónicos',
                stock: 20
            },
            {
                nombre: 'Pantalón Chino',
                descripcion: 'Pantalón casual en algodón, corte slim',
                precio: 49.99,
                categoria: 'Ropa',
                stock: 60
            },
            {
                nombre: 'Lámpara de Mesa',
                descripcion: 'Lámpara LED moderna con control táctil',
                precio: 79.99,
                categoria: 'Hogar',
                stock: 35
            },
            {
                nombre: 'Camiseta Básica',
                descripcion: 'Camiseta 100% algodón, varios colores',
                precio: 19.99,
                categoria: 'Ropa',
                stock: 100
            }
        ];

        let addedCount = 0;

        for (const producto of productos) {
            try {
                await database.registro.create({
                    data: {
                        tenantId,
                        tipo,
                        data: producto
                    }
                });
                console.log(`✅ Agregado: ${producto.nombre}`);
                addedCount++;
            } catch (error) {
                console.error(`❌ Error agregando ${producto.nombre}:`, error);
            }
        }

        console.log(`\n🎉 Proceso completado:`);
        console.log(`   - Productos agregados: ${addedCount}`);
        console.log(`   - Total de productos: ${addedCount + 1}`); // +1 por el Blazer existente

    } catch (error) {
        console.error('❌ Error general:', error);
    } finally {
        await database.$disconnect();
    }
}

// Ejecutar el script
addMoreProducts(); 