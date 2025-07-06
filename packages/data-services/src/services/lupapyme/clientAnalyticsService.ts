import { database } from '@repo/database';
import { getModelDefinition } from './modelDefinitionService';

export interface ClientAnalytics {
    totalClients: number;
    summary: {
        averageMonthlySpending: number;
        repeatCustomerRate: number;
        averageOrdersPerCustomer: number;
    };
    categories: ClientCategory[];
}

export interface ClientCategory {
    category: string;
    count: number;
    percentage: number;
    totalSpent: number;
    averageSpending: number;
    description: string;
}

/**
 * Obtiene análisis de clientes dinámicos basados en el modelo de negocio
 */
export async function getClientAnalytics(tenantId: string): Promise<ClientAnalytics> {
    try {
        // Obtener definición del modelo
        const modelDefinition = await getModelDefinition(tenantId);

        // Obtener todos los registros del tenant
        const registros = await database.registro.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        console.log('🔍 Registros encontrados:', registros.length);
        console.log('🔍 Primer registro:', registros[0]);

        if (registros.length === 0) {
            console.log('🔍 No hay registros, creando datos de prueba...');
            // Crear datos de prueba para demostrar las categorías
            const testRegistros = createTestData(tenantId);
            const clientData = processClientData(testRegistros, modelDefinition);

            const totalClients = clientData.length;
            const totalSpent = clientData.reduce((sum, client) => sum + client.totalSpent, 0);
            const averageMonthlySpending = totalClients > 0 ? totalSpent / totalClients : 0;

            const repeatCustomers = clientData.filter(client => client.orderCount > 1).length;
            const repeatCustomerRate = totalClients > 0 ? (repeatCustomers / totalClients) * 100 : 0;

            const totalOrders = clientData.reduce((sum, client) => sum + client.orderCount, 0);
            const averageOrdersPerCustomer = totalClients > 0 ? totalOrders / totalClients : 0;

            const categories = createDynamicCategories(clientData, modelDefinition);

            return {
                totalClients,
                summary: {
                    averageMonthlySpending,
                    repeatCustomerRate,
                    averageOrdersPerCustomer
                },
                categories
            };
        }

        // Procesar registros para obtener datos de clientes
        const clientData = processClientData(registros, modelDefinition);
        console.log('🔍 ClientData procesado:', clientData.length, 'clientes');
        console.log('🔍 Ejemplo de cliente:', clientData[0]);

        // Calcular métricas
        const totalClients = clientData.length;
        const totalSpent = clientData.reduce((sum, client) => sum + client.totalSpent, 0);
        const averageMonthlySpending = totalClients > 0 ? totalSpent / totalClients : 0;

        const repeatCustomers = clientData.filter(client => client.orderCount > 1).length;
        const repeatCustomerRate = totalClients > 0 ? (repeatCustomers / totalClients) * 100 : 0;

        const totalOrders = clientData.reduce((sum, client) => sum + client.orderCount, 0);
        const averageOrdersPerCustomer = totalClients > 0 ? totalOrders / totalClients : 0;

        console.log('🔍 Métricas calculadas:', {
            totalClients,
            repeatCustomers,
            repeatCustomerRate,
            averageOrdersPerCustomer
        });

        // Crear categorías dinámicas basadas en el comportamiento
        const categories = createDynamicCategories(clientData, modelDefinition);
        console.log('🔍 Categorías creadas:', categories.length);
        console.log('🔍 Categorías:', categories.map(c => ({ category: c.category, count: c.count })));

        return {
            totalClients,
            summary: {
                averageMonthlySpending,
                repeatCustomerRate,
                averageOrdersPerCustomer
            },
            categories
        };
    } catch (error) {
        console.error('Error obteniendo análisis de clientes:', error);
        throw new Error('Error al obtener análisis de clientes');
    }
}

interface ProcessedClient {
    id: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: Date;
    firstOrderDate: Date;
    averageOrderValue: number;
}

function processClientData(registros: any[], modelDefinition: any): ProcessedClient[] {
    const clientMap = new Map<string, ProcessedClient>();
    console.log('🔍 Procesando', registros.length, 'registros');

    registros.forEach((registro, index) => {
        const data = registro.data as any;
        console.log(`🔍 Registro ${index}:`, { data, createdAt: registro.createdAt });

        // Extraer información del cliente del registro
        const clientId = data.clienteId || data.customerId || data.email || registro.id;
        const orderValue = data.total || data.amount || data.valor || 0;
        const orderDate = new Date(registro.createdAt);

        console.log(`🔍 Cliente ${clientId}:`, { orderValue, orderDate });

        if (clientMap.has(clientId)) {
            const client = clientMap.get(clientId)!;
            client.totalSpent += orderValue;
            client.orderCount += 1;
            client.averageOrderValue = client.totalSpent / client.orderCount;

            if (orderDate > client.lastOrderDate) {
                client.lastOrderDate = orderDate;
            }
            if (orderDate < client.firstOrderDate) {
                client.firstOrderDate = orderDate;
            }
            console.log(`🔍 Cliente ${clientId} actualizado:`, { orderCount: client.orderCount, totalSpent: client.totalSpent });
        } else {
            clientMap.set(clientId, {
                id: clientId,
                totalSpent: orderValue,
                orderCount: 1,
                lastOrderDate: orderDate,
                firstOrderDate: orderDate,
                averageOrderValue: orderValue
            });
            console.log(`🔍 Nuevo cliente ${clientId} creado`);
        }
    });

    const result = Array.from(clientMap.values());
    console.log('🔍 Clientes procesados:', result.map(c => ({ id: c.id, orderCount: c.orderCount, totalSpent: c.totalSpent })));
    return result;
}

function createDynamicCategories(clients: ProcessedClient[], modelDefinition: any): ClientCategory[] {
    const categories: ClientCategory[] = [];
    console.log('🔍 Creando categorías para', clients.length, 'clientes');

    // Categoría por frecuencia de compra
    const frequencyCategories = [
        {
            name: 'new',
            filter: (client: ProcessedClient) => client.orderCount === 1,
            description: 'Clientes con una sola compra'
        },
        {
            name: 'regular',
            filter: (client: ProcessedClient) => client.orderCount >= 2 && client.orderCount <= 5,
            description: 'Clientes con 2-5 compras'
        },
        {
            name: 'loyal',
            filter: (client: ProcessedClient) => client.orderCount > 5,
            description: 'Clientes con más de 5 compras'
        }
    ];

    // Categoría por valor de compra
    const valueCategories = [
        {
            name: 'low',
            filter: (client: ProcessedClient) => client.averageOrderValue < 1000,
            description: 'Valor promedio bajo'
        },
        {
            name: 'medium',
            filter: (client: ProcessedClient) => client.averageOrderValue >= 1000 && client.averageOrderValue < 5000,
            description: 'Valor promedio medio'
        },
        {
            name: 'high',
            filter: (client: ProcessedClient) => client.averageOrderValue >= 5000,
            description: 'Valor promedio alto'
        }
    ];

    // Categoría por actividad reciente
    const activityCategories = [
        {
            name: 'active',
            filter: (client: ProcessedClient) => {
                const daysSinceLastOrder = (Date.now() - client.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceLastOrder <= 30;
            },
            description: 'Compró en los últimos 30 días'
        },
        {
            name: 'inactive',
            filter: (client: ProcessedClient) => {
                const daysSinceLastOrder = (Date.now() - client.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceLastOrder > 30 && daysSinceLastOrder <= 90;
            },
            description: 'Compró entre 30 y 90 días'
        },
        {
            name: 'lost',
            filter: (client: ProcessedClient) => {
                const daysSinceLastOrder = (Date.now() - client.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceLastOrder > 90;
            },
            description: 'No compra hace más de 90 días'
        }
    ];

    // Crear categorías combinando frecuencia y actividad
    const allCategories = [
        ...frequencyCategories.map(cat => ({ ...cat, type: 'frequency' })),
        ...valueCategories.map(cat => ({ ...cat, type: 'value' })),
        ...activityCategories.map(cat => ({ ...cat, type: 'activity' }))
    ];

    console.log('🔍 Categorías a evaluar:', allCategories.map(c => c.name));

    allCategories.forEach(category => {
        const filteredClients = clients.filter(category.filter);
        const count = filteredClients.length;

        console.log(`🔍 Categoría ${category.name}:`, { count, totalClients: clients.length });

        if (count > 0) {
            const totalSpent = filteredClients.reduce((sum, client) => sum + client.totalSpent, 0);
            const averageSpending = totalSpent / count;
            const percentage = (count / clients.length) * 100;

            categories.push({
                category: category.name,
                count,
                percentage: Math.round(percentage * 100) / 100,
                totalSpent,
                averageSpending,
                description: category.description
            });
        }
    });

    console.log('🔍 Categorías finales:', categories.map(c => ({ category: c.category, count: c.count })));
    return categories.sort((a, b) => b.count - a.count);
}

// Función temporal para crear datos de prueba
function createTestData(tenantId: string) {
    const now = new Date();
    const testRegistros = [
        // Cliente nuevo (1 compra)
        {
            id: 'test-1',
            tenantId,
            data: { clienteId: 'cliente-1', total: 1500 },
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 días atrás
        },
        // Cliente regular (3 compras)
        {
            id: 'test-2',
            tenantId,
            data: { clienteId: 'cliente-2', total: 2000 },
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'test-3',
            tenantId,
            data: { clienteId: 'cliente-2', total: 1800 },
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'test-4',
            tenantId,
            data: { clienteId: 'cliente-2', total: 2200 },
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        },
        // Cliente leal (6 compras)
        {
            id: 'test-5',
            tenantId,
            data: { clienteId: 'cliente-3', total: 3000 },
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'test-6',
            tenantId,
            data: { clienteId: 'cliente-3', total: 2800 },
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'test-7',
            tenantId,
            data: { clienteId: 'cliente-3', total: 3200 },
            createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'test-8',
            tenantId,
            data: { clienteId: 'cliente-3', total: 2900 },
            createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'test-9',
            tenantId,
            data: { clienteId: 'cliente-3', total: 3100 },
            createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
        },
        {
            id: 'test-10',
            tenantId,
            data: { clienteId: 'cliente-3', total: 2700 },
            createdAt: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000)
        },
        // Cliente inactivo (última compra hace 60 días)
        {
            id: 'test-11',
            tenantId,
            data: { clienteId: 'cliente-4', total: 1200 },
            createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        },
        // Cliente perdido (última compra hace 120 días)
        {
            id: 'test-12',
            tenantId,
            data: { clienteId: 'cliente-5', total: 800 },
            createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)
        }
    ];

    return testRegistros;
} 