'use server';

import * as XLSX from 'xlsx';
import type { CampoDef } from '@repo/data-services/src/services/lupapyme/modelDefinitionService';

interface Registro {
    id: string;
    data: Record<string, any>;
}

interface ExportParams {
    modelDefinition: { tipo: string; campos: CampoDef[] };
    registros: Registro[];
}

export async function exportOrdersAction({
    modelDefinition,
    registros,
}: ExportParams): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        console.log('Export action called with:', {
            registrosCount: registros.length,
            camposCount: modelDefinition.campos.length,
            campos: modelDefinition.campos.map(c => c.name)
        });

        if (!registros.length) {
            console.log('No registros to export');
            return { success: false, error: 'No hay registros para exportar.' };
        }

        // Mapeo dinámico de los datos para el Excel
        const dataToExport = registros.map((reg, index) => {
            const row: Record<string, any> = {};
            modelDefinition.campos.forEach(campo => {
                const value = reg.data[campo.name];
                row[campo.label] = value ?? '';

                // Log para debug
                if (index === 0) {
                    console.log(`Field ${campo.name}:`, value);
                }
            });
            return row;
        });

        console.log('Data to export (first row):', dataToExport[0]);

        // Crear el libro de trabajo y la hoja
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Ajustar el ancho de las columnas (opcional)
        worksheet['!cols'] = modelDefinition.campos.map(() => ({ wch: 20 }));

        XLSX.utils.book_append_sheet(workbook, worksheet, modelDefinition.tipo);

        // Generar el buffer del archivo y convertirlo a base64 para serialización
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        const base64Data = buffer.toString('base64');

        console.log('Excel file generated successfully, size:', buffer.length, 'bytes');

        return { success: true, data: base64Data };
    } catch (error) {
        console.error('Error exporting registros:', error);
        return { success: false, error: 'Ocurrió un error al generar el archivo Excel.' };
    }
} 