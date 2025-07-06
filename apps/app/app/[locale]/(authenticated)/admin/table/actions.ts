'use server';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import {
    createRegistro,
    getRegistroById,
    updateRegistro,
    deleteRegistro
} from '@repo/data-services/src/services/lupapyme/registroService';

import { database } from '@repo/database';
import {
    createModelDefinition,
    updateModelDefinition,
    deleteModelDefinition,
    updateModelDefinitionFields,
    type CampoDef
} from '@repo/data-services/src/services/lupapyme/modelDefinitionService';

// MOCK: Simulación de servicios dinámicos para Registro
// Cuando tengas los servicios reales, importa desde @repo/data-services

export async function createRegistroAction(data: any) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.tenantId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        console.log('🚀 Creando registro...');
        console.log('📊 Datos recibidos:', data);

        // Convertir datos a formato objeto si no lo están ya
        const dataToSave = typeof data === 'object' && !Array.isArray(data) ? data : {};

        // Usar el servicio original
        const result = await createRegistro(currentUser.tenantId, 'default', dataToSave);

        if (result.success) {
            console.log('✅ Registro creado exitosamente');
            revalidatePath('/admin/table');
        } else {
            console.error('❌ Error al crear registro:', result.error);
        }

        return result;
    } catch (error) {
        console.error('Error en createRegistroAction:', error);
        return { success: false, error: 'Error al crear registro' };
    }
}

export async function updateRegistroAction(id: string, data: any) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.tenantId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        // Verificar que el registro existe y pertenece al tenant
        const existingRegistro = await getRegistroById(id, currentUser.tenantId);
        if (!existingRegistro.success) {
            return { success: false, error: 'Registro no encontrado' };
        }

        // Actualizar el registro
        const result = await updateRegistro(id, currentUser.tenantId, data);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath('/admin/table');
        return { success: true, registro: { id, ...data } };
    } catch (error) {
        console.error('Error en updateRegistroAction:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteRegistroAction(id: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.tenantId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        // Verificar que el registro existe y pertenece al tenant
        const existingRegistro = await getRegistroById(id, currentUser.tenantId);
        if (!existingRegistro.success) {
            return { success: false, error: 'Registro no encontrado' };
        }

        // Eliminar el registro
        const result = await deleteRegistro(id, currentUser.tenantId);

        if (!result.success) {
            return { success: false, error: result.error };
        }

        revalidatePath('/admin/table');
        return { success: true };
    } catch (error) {
        console.error('Error en deleteRegistroAction:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Crear una nueva definición de modelo
 */
export async function createModelDefinitionAction(data: { tipo: string; campos: CampoDef[] }) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.tenantId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await createModelDefinition({
            tenantId: currentUser.tenantId,
            tipo: data.tipo,
            campos: data.campos,
        });

        return result;
    } catch (error) {
        console.error('Error en createModelDefinitionAction:', error);
        return { success: false, error: 'Error al crear definición de modelo' };
    }
}

/**
 * Actualizar una definición de modelo existente
 */
export async function updateModelDefinitionAction(id: string, data: { tipo?: string; campos?: CampoDef[] }) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.tenantId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await updateModelDefinition(id, data);
        return result;
    } catch (error) {
        console.error('Error en updateModelDefinitionAction:', error);
        return { success: false, error: 'Error al actualizar definición de modelo' };
    }
}

/**
 * Eliminar una definición de modelo
 */
export async function deleteModelDefinitionAction(id: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.tenantId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await deleteModelDefinition(id);
        return result;
    } catch (error) {
        console.error('Error en deleteModelDefinitionAction:', error);
        return { success: false, error: 'Error al eliminar definición de modelo' };
    }
}

/**
 * Actualizar solo los campos de una definición de modelo
 */
export async function updateModelDefinitionFieldsAction(id: string, campos: CampoDef[]) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !currentUser.tenantId) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        const result = await updateModelDefinitionFields(id, campos);
        return result;
    } catch (error) {
        console.error('Error en updateModelDefinitionFieldsAction:', error);
        return { success: false, error: 'Error al actualizar campos de definición de modelo' };
    }
} 