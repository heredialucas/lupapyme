import { OrdersDataTable } from './components/OrdersDataTable';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { Registro } from './components/columns';
import { getModelDefinition } from '@repo/data-services/src/services/lupapyme/modelDefinitionService';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { getRegistrosByTenant } from '@repo/data-services/src/services/lupapyme/registroService';

export default async function TablePage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.tenantId) {
        throw new Error('Usuario no autenticado o sin tenantId');
    }

    const tenantId = currentUser.tenantId;
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    // Obtener definición de modelo
    const modelDefinitionRaw = await getModelDefinition(tenantId);
    let campos: any[] = [];

    if (Array.isArray(modelDefinitionRaw.campos)) {
        campos = modelDefinitionRaw.campos;
    } else if (typeof modelDefinitionRaw.campos === 'string') {
        try {
            campos = JSON.parse(modelDefinitionRaw.campos);
        } catch {
            campos = [];
        }
    }

    const modelDefinition = {
        id: modelDefinitionRaw.id,
        tipo: modelDefinitionRaw.tipo,
        campos
    };

    // Obtener parámetros de paginación y filtros
    const page = parseInt(resolvedSearchParams.page as string) || 1;
    const pageSize = parseInt(resolvedSearchParams.pageSize as string) || 50;
    const search = resolvedSearchParams.search as string || '';
    const from = resolvedSearchParams.from as string || '';
    const to = resolvedSearchParams.to as string || '';
    const orderType = resolvedSearchParams.orderType as string || '';

    // Obtener registros
    const registrosResult = await getRegistrosByTenant(
        tenantId,
        { page, pageSize },
        { search, from, to, orderType },
        null
    );

    if (!registrosResult.success) {
        throw new Error(registrosResult.error || 'Error al obtener registros');
    }

    const registros = registrosResult.data;
    const paginationInfo = registrosResult.pagination;

    // Debug: Log de los datos recibidos
    console.log('🔍 Frontend - Registros recibidos:', registros.length);
    if (registros.length > 0) {
        console.log('🔍 Frontend - Primer registro:', JSON.stringify(registros[0], null, 2));
    }

    const pagination: PaginationState = {
        pageIndex: paginationInfo.page - 1,
        pageSize: paginationInfo.pageSize,
    };
    const sorting: SortingState = [];

    return (
        <div className="h-full w-full">
            <div className="mb-5 p-5">
                <h1 className="text-2xl font-bold">
                    Tabla dinámica de registros
                </h1>
                <p className="text-muted-foreground">
                    Esta tabla se adapta a cualquier definición de campos.
                </p>
            </div>
            <OrdersDataTable
                modelDefinition={modelDefinition}
                registros={registros}
                pageCount={paginationInfo.pageCount}
                total={paginationInfo.total}
                pagination={pagination}
                sorting={sorting}
            />
        </div>
    );
} 