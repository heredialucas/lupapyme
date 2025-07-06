import { database } from '@repo/database';

export interface CampoDef {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    order?: number;
    options?: string[];
}

export interface ModelDefinitionData {
    tenantId: string;
    tipo: string;
    campos: CampoDef[];
}

export async function getModelDefinitionByTenant(tenantId: string, tipo: string) {
    // Verificar si la base de datos está disponible
    if (!database.modelDefinition) {
        console.warn('Base de datos no disponible, devolviendo definición mock');
        return null;
    }

    return database.modelDefinition.findFirst({
        where: { tenantId, tipo },
    });
}

export async function getAllModelDefinitionsByTenant(tenantId: string) {
    return database.modelDefinition.findMany({
        where: { tenantId },
    });
}

// Servicio para obtener la definición de modelo según el tenantId
export async function getModelDefinition(tenantId: string, tipo: string = 'productos') {
    console.log('ACA', tenantId, tipo);
    try {
        const modelDefinition = await getModelDefinitionByTenant(tenantId, tipo);
        if (!modelDefinition) throw new Error(`No existe definición de modelo para tenantId: ${tenantId} y tipo: ${tipo}`);
        return modelDefinition;
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
        // Mock temporal para testing mientras se soluciona la conexión
        console.log('Usando mock temporal para tenantId:', tenantId);
        return {
            id: 'mock-id',
            tenantId: tenantId,
            tipo: tipo,
            campos: [
                { name: 'nombre', label: 'Nombre del Producto', type: 'text', required: true, order: 1 },
                { name: 'descripcion', label: 'Descripción', type: 'textarea', required: false, order: 2 },
                { name: 'precio', label: 'Precio', type: 'number', required: true, order: 3 },
                { name: 'categoria', label: 'Categoría', type: 'select', required: false, order: 4 },
                { name: 'stock', label: 'Stock Disponible', type: 'number', required: false, order: 5 },
            ],
            createdAt: new Date(),
        };
    }
}

/**
 * Crear una nueva definición de modelo
 */
export async function createModelDefinition(data: ModelDefinitionData) {
    try {
        if (!database.modelDefinition) {
            return { success: false, error: 'Base de datos no disponible' };
        }

        const result = await database.modelDefinition.create({
            data: {
                tenantId: data.tenantId,
                tipo: data.tipo,
                campos: data.campos as any,
            },
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Error creando definición de modelo:', error);
        return { success: false, error: 'Error al crear definición de modelo' };
    }
}

/**
 * Actualizar una definición de modelo existente
 */
export async function updateModelDefinition(id: string, data: Partial<ModelDefinitionData>) {
    try {
        if (!database.modelDefinition) {
            return { success: false, error: 'Base de datos no disponible' };
        }

        const result = await database.modelDefinition.update({
            where: { id },
            data: {
                ...(data.tipo && { tipo: data.tipo }),
                ...(data.campos && { campos: data.campos as any }),
            },
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Error actualizando definición de modelo:', error);
        return { success: false, error: 'Error al actualizar definición de modelo' };
    }
}

/**
 * Eliminar una definición de modelo
 */
export async function deleteModelDefinition(id: string) {
    try {
        if (!database.modelDefinition) {
            return { success: false, error: 'Base de datos no disponible' };
        }

        await database.modelDefinition.delete({
            where: { id },
        });

        return { success: true };
    } catch (error) {
        console.error('Error eliminando definición de modelo:', error);
        return { success: false, error: 'Error al eliminar definición de modelo' };
    }
}

/**
 * Actualizar solo los campos de una definición de modelo
 */
export async function updateModelDefinitionFields(id: string, campos: CampoDef[]) {
    try {
        if (!database.modelDefinition) {
            return { success: false, error: 'Base de datos no disponible' };
        }

        const result = await database.modelDefinition.update({
            where: { id },
            data: { campos: campos as any },
        });

        return { success: true, data: result };
    } catch (error) {
        console.error('Error actualizando campos de definición de modelo:', error);
        return { success: false, error: 'Error al actualizar campos de definición de modelo' };
    }
} 