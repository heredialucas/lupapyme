'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
    type PaginationState,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/design-system/components/ui/table';
import { Input } from '@repo/design-system/components/ui/input';
import { Button } from '@repo/design-system/components/ui/button';
import type { Registro } from './columns';
import type { CampoDef } from '@repo/data-services/src/services/lupapyme/modelDefinitionService';

interface DynamicTableProps {
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
    onCreate?: () => void;
    onManageFields?: () => void;
    renderActions?: (row: Registro) => React.ReactNode;
    filters?: React.ReactNode;
    title?: string;
    description?: string;
}

export function DynamicTable({
    modelDefinition,
    registros,
    pageCount,
    total,
    pagination,
    sorting,
    onCreate,
    onManageFields,
    renderActions,
    filters,
    title,
    description
}: DynamicTableProps) {
    // Debug: Log de los datos recibidos
    console.log('🔍 DynamicTable - Registros recibidos:', registros.length);
    console.log('🔍 DynamicTable - ModelDefinition:', modelDefinition);
    if (registros.length > 0) {
        console.log('🔍 DynamicTable - Primer registro:', JSON.stringify(registros[0], null, 2));
    }
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [globalFilter, setGlobalFilter] = React.useState(searchParams.get('search') ?? '');
    const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

    // Generar columnas dinámicas según modelDefinition.campos
    const columns = React.useMemo<ColumnDef<Registro, any>[]>(
        () => {
            const { getColumns } = require('./columns');
            return getColumns(modelDefinition.campos) as ColumnDef<Registro, any>[];
        },
        [modelDefinition.campos]
    );

    const table = useReactTable({
        data: registros,
        columns,
        pageCount,
        state: {
            sorting,
            pagination,
            globalFilter,
            rowSelection,
        },
        getRowId: (row) => row.id,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: (updater) => {
            const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
            const params = new URLSearchParams(searchParams);
            params.set('page', (newPagination.pageIndex + 1).toString());
            params.set('pageSize', newPagination.pageSize.toString());
            router.push(`${pathname}?${params.toString()}`);
        },
        onSortingChange: (updater) => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
            const params = new URLSearchParams(searchParams);
            if (newSorting.length > 0) {
                params.set('sort', `${newSorting[0].id}.${newSorting[0].desc ? 'desc' : 'asc'}`);
            } else {
                params.delete('sort');
            }
            router.push(`${pathname}?${params.toString()}`);
        },
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
    });

    // Debounce para la búsqueda
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            params.set('page', '1');
            params.set('search', globalFilter);
            router.push(`${pathname}?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timeout);
    }, [globalFilter, pathname, router, searchParams]);



    const headerCheckboxRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
        }
    }, [table.getIsSomeRowsSelected(), table.getIsAllRowsSelected()]);

    return (
        <div>
            <div className="mb-5 p-5">
                {title && <h1 className="text-2xl font-bold">{title}</h1>}
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>

            <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <Input
                        placeholder="Buscar en todas las columnas..."
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm"
                    />
                    {filters}
                </div>


            </div>

            <div className="rounded-md border">
                <Table className="table-fixed w-full border-collapse">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                <TableHead className="px-0 py-1 text-xs border-r border-border" style={{ width: '32px' }}>
                                    <div className="flex justify-center">
                                        <input
                                            type="checkbox"
                                            ref={headerCheckboxRef}
                                            checked={table.getIsAllRowsSelected()}
                                            onChange={table.getToggleAllRowsSelectedHandler()}
                                        />
                                    </div>
                                </TableHead>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="px-0 py-1 text-xs border-r border-border"
                                    >
                                        {header.isPlaceholder ? null : (
                                            <Button
                                                variant="ghost"
                                                onClick={header.column.getToggleSortingHandler()}
                                                disabled={!header.column.getCanSort()}
                                                className="h-6 px-1 text-xs w-full justify-center"
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </Button>
                                        )}
                                    </TableHead>
                                ))}
                                {renderActions && (
                                    <TableHead className="px-0 py-1 text-xs border-r border-border text-center" style={{ width: '80px' }}>
                                        Acciones
                                    </TableHead>
                                )}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    <TableCell className="px-0 py-1 border-r border-border">
                                        <div className="flex justify-center">
                                            <input
                                                type="checkbox"
                                                checked={row.getIsSelected()}
                                                onChange={row.getToggleSelectedHandler()}
                                            />
                                        </div>
                                    </TableCell>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-0 py-1 border-r border-border text-center"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                    {renderActions && (
                                        <TableCell className="px-0 py-1 border-r border-border">
                                            <div className="flex gap-2 justify-center">
                                                {renderActions(row.original)}
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={modelDefinition.campos.length + (renderActions ? 2 : 1)}
                                    className="h-24 text-center"
                                >
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Mostrando {table.getRowModel().rows.length} de {total} registros.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
} 