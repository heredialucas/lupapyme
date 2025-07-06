import { DailyAnalyticsTab } from './components/daily/DailyAnalyticsTab';
import { MonthlyAnalyticsTab } from './components/monthly/MonthlyAnalyticsTab';
import { ProductsAnalyticsTab } from './components/products/ProductsAnalyticsTab';
import { CategoriesAnalyticsTab } from './components/categories/CategoriesAnalyticsTab';
import { PaymentsAnalyticsTab } from './components/payments/PaymentsAnalyticsTab';
import { FrequencyAnalyticsTab } from './components/frequency/FrequencyAnalyticsTab';
import { AnalyticsTabsWrapper } from './components/AnalyticsTabsWrapper';
import { AnalyticsDateFilter } from './components/AnalyticsDateFilter';

interface AnalyticsPageProps {
    searchParams: Promise<{
        from?: string;
        to?: string;
        preset?: string;
        compare?: string;
        compareFrom?: string;
        compareTo?: string;
    }>;
}

// MOCK: Definición de modelo y registros dinámicos para analíticas
const modelDefinition = {
    tipo: 'ordenes',
    campos: [
        { nombre: 'categoria', tipo: 'string' },
        { nombre: 'cliente', tipo: 'string' },
        { nombre: 'total', tipo: 'number' },
        { nombre: 'fecha', tipo: 'date' },
        { nombre: 'estado', tipo: 'string' },
    ],
};

const registros = [
    { id: '1', data: { categoria: 'Bebidas', cliente: 'Juan Pérez', total: 1200, fecha: '2024-06-01', estado: 'pendiente' } },
    { id: '2', data: { categoria: 'Comidas', cliente: 'Ana López', total: 950, fecha: '2024-06-02', estado: 'entregado' } },
    { id: '3', data: { categoria: 'Bebidas', cliente: 'Carlos Ruiz', total: 800, fecha: '2024-06-03', estado: 'pendiente' } },
    { id: '4', data: { categoria: 'Comidas', cliente: 'Laura Gómez', total: 1100, fecha: '2024-06-04', estado: 'entregado' } },
];

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
    // Await searchParams ya que es una promesa en Next.js 15
    const params = await searchParams;

    // Convertir searchParams a fechas o usar últimos 30 días por defecto
    const dateFilter = params.from && params.to ? {
        from: new Date(params.from + 'T00:00:00.000Z'), // Forzar UTC
        to: new Date(params.to + 'T23:59:59.999Z')     // Forzar UTC
    } : {
        // Por defecto: últimos 30 días en UTC
        from: (() => {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            return new Date(Date.UTC(
                thirtyDaysAgo.getUTCFullYear(),
                thirtyDaysAgo.getUTCMonth(),
                thirtyDaysAgo.getUTCDate(),
                0, 0, 0, 0
            ));
        })(),
        to: (() => {
            const now = new Date();
            return new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                23, 59, 59, 999
            ));
        })()
    };

    // Período de comparación (opcional)
    const compareFilter = params.compare === 'true' && params.compareFrom && params.compareTo ? {
        from: new Date(params.compareFrom + 'T00:00:00.000Z'),
        to: new Date(params.compareTo + 'T23:59:59.999Z')
    } : undefined;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h1 className="text-2xl md:text-3xl font-bold">Estadísticas</h1>
                <div className="text-sm text-muted-foreground">
                    Análisis detallado del negocio
                </div>
            </div>

            {/* Filtro de fechas global */}
            <AnalyticsDateFilter />

            <AnalyticsTabsWrapper
                dailyTab={<DailyAnalyticsTab modelDefinition={modelDefinition} registros={registros} />}
                monthlyTab={<MonthlyAnalyticsTab modelDefinition={modelDefinition} registros={registros} />}
                productsTab={<ProductsAnalyticsTab modelDefinition={modelDefinition} registros={registros} />}
                categoriesTab={<CategoriesAnalyticsTab modelDefinition={modelDefinition} registros={registros} />}
                paymentsTab={<PaymentsAnalyticsTab modelDefinition={modelDefinition} registros={registros} />}
                frequencyTab={<FrequencyAnalyticsTab modelDefinition={modelDefinition} registros={registros} />}
            />
        </div>
    );
} 