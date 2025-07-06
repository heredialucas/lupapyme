'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/design-system/components/ui/button';
import { EditRegistroModal } from './EditRegistroModal';
import { DeleteRegistroButton } from './DeleteRegistroButton';
import { CreateRegistroModal } from './CreateRegistroModal';
import { ManageFieldsModal } from './ManageFieldsModal';
import { DateRangeFilter } from './DateRangeFilter';
import { OrderTypeFilter } from './ClientTypeFilter';
import { exportOrdersAction } from '../exportOrdersAction';
import { DynamicTable } from './DynamicTable';
import type { Registro } from './columns';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import type { CampoDef } from '@repo/data-services/src/services/lupapyme/modelDefinitionService';

interface OrdersDataTableProps {
    modelDefinition: {
        id?: string;
        tipo: string;
        campos: CampoDef[];
    };
    registros: Registro[];
    pageCount: number;
    total: number;
    pagination: PaginationState;
    sorting: SortingState;
}

export function OrdersDataTable({
    modelDefinition,
    registros,
    pageCount,
    total,
    pagination,
    sorting,
}: OrdersDataTableProps) {
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [showManageFieldsModal, setShowManageFieldsModal] = React.useState(false);

    const handleExport = async () => {
        console.log('Export function called with:', {
            registrosCount: registros.length,
            modelDefinition
        });

        try {
            const result = await exportOrdersAction({
                modelDefinition,
                registros: registros.map(r => ({
                    id: r.id,
                    data: r
                })),
            });

            console.log('Export result:', { success: result.success, hasData: !!result.data, error: result.error });

            if (result.success && result.data) {
                // Construir el nombre del archivo dinámicamente
                let fileName = 'registros';
                const searchParams = new URLSearchParams(window.location.search);
                const from = searchParams.get('from');
                const to = searchParams.get('to');
                if (from && to) {
                    if (from === to) {
                        fileName = `registros-${from}`;
                    } else {
                        fileName = `registros-del-${from}-al-${to}`;
                    }
                }
                fileName += '.xlsx';

                console.log('Downloading file:', fileName);

                // Decodificar la cadena base64 a un array de bytes
                const byteCharacters = atob(result.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);

                const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                console.log('File downloaded successfully');
            } else {
                console.error('Export failed:', result.error);
                alert(result.error || 'No se pudo exportar el archivo.');
            }
        } catch (error) {
            console.error('Unexpected error during export:', error);
            alert('Ocurrió un error inesperado al exportar el archivo.');
        }
    };

    const renderActions = (row: Registro) => (
        <>
            <EditRegistroModal
                registro={row}
                modelDefinition={modelDefinition}
                onSuccess={() => router.refresh()}
            />
            <DeleteRegistroButton
                registroId={row.id}
                registroName={row.nombreProducto || row.categoria}
                onSuccess={() => router.refresh()}
            />
        </>
    );

    const filters = (
        <>
            <DateRangeFilter />
            <OrderTypeFilter />
        </>
    );

    return (
        <>
            <div className="flex items-center gap-2 mb-4">
                <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white hover:bg-blue-700">
                    Crear Registro
                </Button>
                <Button onClick={() => setShowManageFieldsModal(true)} className="bg-purple-600 text-white hover:bg-purple-700">
                    Gestionar Campos
                </Button>
                <Button onClick={handleExport} className="bg-green-600 text-white hover:bg-green-700">
                    Exportar a Excel
                </Button>
            </div>

            <DynamicTable
                modelDefinition={modelDefinition}
                registros={registros}
                pageCount={pageCount}
                total={total}
                pagination={pagination}
                sorting={sorting}
                renderActions={renderActions}
                filters={filters}
            />

            {/* Modales */}
            {showCreateModal && (
                <CreateRegistroModal
                    modelDefinition={modelDefinition}
                    isOpen={showCreateModal}
                    onOpenChange={setShowCreateModal}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        router.refresh();
                    }}
                />
            )}

            {showManageFieldsModal && (
                <ManageFieldsModal
                    modelDefinition={modelDefinition}
                    isOpen={showManageFieldsModal}
                    onOpenChange={setShowManageFieldsModal}
                    onSuccess={() => {
                        setShowManageFieldsModal(false);
                        router.refresh();
                    }}
                />
            )}
        </>
    );
} 