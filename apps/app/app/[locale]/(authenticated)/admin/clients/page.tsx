import { getDictionary } from '@repo/internationalization';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getClientAnalytics } from '@repo/data-services/src/services/lupapyme/clientAnalyticsService';
import { ClientsManagement } from './components/ClientsManagement';

interface CategoriaCliente {
    category: string;
    count: number;
    percentage: number;
    totalSpent: number;
    averageSpending: number;
}

interface ClientStats {
    totalClients: number;
    summary: {
        averageMonthlySpending: number;
        repeatCustomerRate: number;
        averageOrdersPerCustomer: number;
    };
}

interface AnalyticsData {
    spendingCategories: CategoriaCliente[];
    behaviorCategories: CategoriaCliente[];
}

export default async function Page() {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.tenantId) {
        throw new Error('Usuario no autenticado o sin tenantId');
    }

    const tenantId = currentUser.tenantId;
    const dictionary = await getDictionary('es');

    try {
        // Obtener datos reales de análisis de clientes
        const analytics = await getClientAnalytics(tenantId);

        return (
            <ClientsManagement
                analytics={analytics}
                dictionary={dictionary}
            />
        );
    } catch (error) {
        console.error('Error cargando análisis de clientes:', error);

        // Fallback con datos vacíos
        const emptyAnalytics = {
            totalClients: 0,
            summary: {
                averageMonthlySpending: 0,
                repeatCustomerRate: 0,
                averageOrdersPerCustomer: 0
            },
            categories: []
        };

        return (
            <ClientsManagement
                analytics={emptyAnalytics}
                dictionary={dictionary}
            />
        );
    }
} 