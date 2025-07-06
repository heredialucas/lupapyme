import { database } from '@repo/database';

export interface RegistroFilters {
    search?: string;
    from?: string;
    to?: string;
    orderType?: string;
}

export interface RegistroPagination {
    page: number;
    pageSize: number;
}

export interface RegistroSorting {
    field: string;
    direction: 'asc' | 'desc';
}

/**
 * Obtiene registros paginados para un tenant específico
 */
export async function getRegistrosByTenant(
    tenantId: string,
    pagination: RegistroPagination = { page: 1, pageSize: 50 },
    filters: RegistroFilters = {},
    sorting: RegistroSorting | null = null
) {
    console.log('Registro', tenantId, pagination, filters, sorting);
    try {
        const skip = (pagination.page - 1) * pagination.pageSize;
        const where: any = {
            tenantId: tenantId,
        };
        if (filters.from && filters.to) {
            where.createdAt = {
                gte: new Date(filters.from),
                lte: new Date(filters.to),
            };
        }
        if (filters.orderType && filters.orderType !== 'all') {
            where.orderType = filters.orderType;
        }
        // Comentamos la búsqueda en BD por ahora para debuggear
        // if (filters.search && filters.search.trim() !== '') {
        //     console.log('🔍 Aplicando filtro de búsqueda:', filters.search);
        //     where.data = {
        //         string_contains: filters.search
        //     };
        // }
        let orderBy: any = { createdAt: 'desc' };
        if (sorting) {
            orderBy = { [sorting.field]: sorting.direction };
        }

        const registros = await database.registro.findMany({
            where,
            skip,
            take: pagination.pageSize,
            orderBy,
        });

        const total = await database.registro.count({ where });

        // Calcular el total real después del aplanamiento
        const totalAplanado = registros.reduce((total, registro) => {
            const data = registro.data as any;
            if (Array.isArray(data)) {
                return total + data.length;
            }
            return total + 1;
        }, 0);

        console.log("registros", registros)
        console.log("Primer registro data:", JSON.stringify(registros[0]?.data, null, 2))

        // Aplanar los datos (convertir data en propiedades de nivel superior)
        const registrosAplanados = registros.flatMap(registro => {
            const data = registro.data as any;

            // Si data es un array, creamos un registro por cada item
            if (Array.isArray(data)) {
                return data.map((item, index) => ({
                    id: `${registro.id}-${index}`, // ID único para cada item
                    ...item, // Propiedades del item
                    createdAt: registro.createdAt,
                    tenantId: registro.tenantId,
                    originalId: registro.id, // ID del registro original
                    itemIndex: index, // Índice del item en el array
                }));
            } else {
                // Si data es un objeto simple, lo aplanamos normalmente
                return [{
                    id: registro.id,
                    ...data,
                    createdAt: registro.createdAt,
                    tenantId: registro.tenantId,
                }];
            }
        });

        console.log('Registros aplanados:', registrosAplanados.length);
        console.log('Primer registro aplanado:', JSON.stringify(registrosAplanados[0], null, 2));

        // Aplicar filtro de búsqueda en los datos aplanados
        let registrosFiltrados = registrosAplanados;
        if (filters.search && filters.search.trim() !== '') {
            const searchTerm = filters.search.toLowerCase();
            console.log('🔍 Filtrando registros aplanados con término:', searchTerm);
            console.log('🔍 Total registros antes del filtro:', registrosAplanados.length);

            // Mostrar algunos ejemplos de registros para debug
            if (registrosAplanados.length > 0) {
                console.log('🔍 Ejemplo de primer registro:', JSON.stringify(registrosAplanados[0], null, 2));
            }

            registrosFiltrados = registrosAplanados.filter(registro => {
                // Buscar en todas las propiedades del registro aplanado
                const match = Object.entries(registro).some(([key, value]) => {
                    // Ignorar campos internos como id, createdAt, tenantId, etc.
                    if (['id', 'createdAt', 'tenantId', 'originalId', 'itemIndex'].includes(key)) {
                        return false;
                    }
                    if (value === null || value === undefined) return false;
                    const stringValue = String(value).toLowerCase();
                    const found = stringValue.includes(searchTerm);
                    if (found) {
                        console.log('🔍 Match encontrado en campo:', key, 'valor:', value);
                    }
                    return found;
                });
                return match;
            });

            console.log('🔍 Total registros después del filtro:', registrosFiltrados.length);
        }

        // Recalcular paginación basada en los registros filtrados
        const totalFiltrado = registrosFiltrados.length;
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const registrosPaginados = registrosFiltrados.slice(startIndex, endIndex);

        return {
            success: true,
            data: registrosPaginados,
            pagination: {
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: totalFiltrado,
                pageCount: Math.ceil(totalFiltrado / pagination.pageSize),
            },
        };
    } catch (error) {
        console.error('Error obteniendo registros:', error);
        return {
            success: false,
            error: 'Error al obtener registros',
            data: [],
            pagination: {
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: 0,
                pageCount: 0,
            },
        };
    }
}

/**
 * Obtiene un registro específico por ID
 */
export async function getRegistroById(id: string, tenantId: string) {
    try {
        console.log('getRegistroById - ID recibido:', id);
        console.log('getRegistroById - tenantId:', tenantId);

        // Verificar si la base de datos está disponible
        if (!database.registro) {
            console.warn('getRegistroById - Base de datos no disponible');
            return { success: false, error: 'Base de datos no disponible' };
        }

        // Si el ID contiene un guión, es un item aplanado
        // El formato es: {originalId}-{itemIndex}
        let originalId = id;
        let itemIndex = 0;

        if (id.includes('-')) {
            const lastDashIndex = id.lastIndexOf('-');
            const itemIndexStr = id.substring(lastDashIndex + 1);
            const parsedIndex = parseInt(itemIndexStr);

            if (!isNaN(parsedIndex)) {
                originalId = id.substring(0, lastDashIndex);
                itemIndex = parsedIndex;
            }
        }

        console.log('getRegistroById - originalId:', originalId);
        console.log('getRegistroById - itemIndex:', itemIndex);

        const registro = await database.registro.findFirst({
            where: { id: originalId, tenantId },
        });

        console.log('getRegistroById - registro encontrado:', registro ? 'SÍ' : 'NO');

        if (!registro) {
            return { success: false, error: 'Registro no encontrado' };
        }

        // Aplanar los datos
        const data = registro.data as any;

        if (Array.isArray(data)) {
            // Si es un array, encontrar el item específico
            const item = data[itemIndex];

            if (!item) {
                return { success: false, error: 'Item no encontrado' };
            }

            const registroAplanado = {
                id: id,
                ...item,
                createdAt: registro.createdAt,
                tenantId: registro.tenantId,
                originalId: originalId,
                itemIndex: itemIndex,
            };

            return { success: true, data: registroAplanado };
        } else {
            // Si es un objeto simple
            const registroAplanado = {
                id: registro.id,
                ...data,
                createdAt: registro.createdAt,
                tenantId: registro.tenantId,
            };

            return { success: true, data: registroAplanado };
        }
    } catch (error) {
        console.error('Error obteniendo registro:', error);
        return { success: false, error: 'Error al obtener registro' };
    }
}

export async function createRegistro(tenantId: string, tipo: string, data: any) {
    try {
        const result = await database.registro.create({
            data: { tenantId, tipo, data },
        });
        return { success: true, id: result.id };
    } catch (error) {
        console.error('Error creando registro:', error);
        return { success: false, error: 'Error al crear registro' };
    }
}

export async function updateRegistro(id: string, tenantId: string, data: any) {
    try {
        console.log('updateRegistro - ID recibido:', id);
        console.log('updateRegistro - tenantId:', tenantId);
        console.log('updateRegistro - data:', data);

        // Verificar si la base de datos está disponible
        if (!database.registro) {
            console.warn('updateRegistro - Base de datos no disponible');
            return { success: false, error: 'Base de datos no disponible' };
        }

        // Si el ID contiene un guión, es un item aplanado
        // El formato es: {originalId}-{itemIndex}
        let originalId = id;
        let itemIndex = null;

        if (id.includes('-')) {
            const lastDashIndex = id.lastIndexOf('-');
            const itemIndexStr = id.substring(lastDashIndex + 1);
            const parsedIndex = parseInt(itemIndexStr);

            if (!isNaN(parsedIndex)) {
                originalId = id.substring(0, lastDashIndex);
                itemIndex = parsedIndex;
            }
        }

        console.log('updateRegistro - originalId:', originalId);
        console.log('updateRegistro - itemIndex:', itemIndex);

        // Obtener el registro original
        const registro = await database.registro.findFirst({
            where: { id: originalId, tenantId },
        });

        console.log('updateRegistro - registro encontrado:', registro ? 'SÍ' : 'NO');

        if (!registro) {
            return { success: false, error: 'Registro no encontrado' };
        }

        const originalData = registro.data as any;

        if (Array.isArray(originalData) && itemIndex !== null) {
            // Actualizar un item específico en el array
            const updatedData = [...originalData];
            updatedData[itemIndex] = { ...updatedData[itemIndex], ...data };

            const result = await database.registro.update({
                where: { id: originalId },
                data: { data: updatedData },
            });

            return { success: true, id: result.id };
        } else {
            // Actualizar el registro completo
            const result = await database.registro.update({
                where: { id: originalId },
                data: { data },
            });

            return { success: true, id: result.id };
        }
    } catch (error) {
        console.error('Error actualizando registro:', error);
        return { success: false, error: 'Error al actualizar registro' };
    }
}

export async function deleteRegistro(id: string, tenantId: string) {
    try {
        // Si el ID contiene un guión, es un item aplanado
        // El formato es: {originalId}-{itemIndex}
        let originalId = id;
        let itemIndex = null;

        if (id.includes('-')) {
            const lastDashIndex = id.lastIndexOf('-');
            const itemIndexStr = id.substring(lastDashIndex + 1);
            const parsedIndex = parseInt(itemIndexStr);

            if (!isNaN(parsedIndex)) {
                originalId = id.substring(0, lastDashIndex);
                itemIndex = parsedIndex;
            }
        }

        // Obtener el registro original
        const registro = await database.registro.findFirst({
            where: { id: originalId, tenantId },
        });

        if (!registro) {
            return { success: false, error: 'Registro no encontrado' };
        }

        const originalData = registro.data as any;

        if (Array.isArray(originalData) && itemIndex !== null) {
            // Eliminar un item específico del array
            const updatedData = originalData.filter((_: any, index: number) => index !== itemIndex);

            if (updatedData.length === 0) {
                // Si no quedan items, eliminar el registro completo
                await database.registro.delete({
                    where: { id: originalId },
                });
            } else {
                // Actualizar el registro con el array sin el item eliminado
                await database.registro.update({
                    where: { id: originalId },
                    data: { data: updatedData },
                });
            }

            return { success: true };
        } else {
            // Eliminar el registro completo
            await database.registro.delete({
                where: { id: originalId },
            });

            return { success: true };
        }
    } catch (error) {
        console.error('Error eliminando registro:', error);
        return { success: false, error: 'Error al eliminar registro' };
    }
} 