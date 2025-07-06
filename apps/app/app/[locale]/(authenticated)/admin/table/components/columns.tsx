'use client';

import { type ColumnDef, type CellContext } from '@tanstack/react-table';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Input } from '@repo/design-system/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipo genérico para los registros dinámicos
export interface Registro {
    id: string;
    [key: string]: any;
}

export interface CampoDef {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    order?: number;
    options?: string[];
}

// Renderizadores dinámicos basados en el tipo de campo
export const getFieldRenderer = (campo: CampoDef, fieldIndex: number) => {
    const { type, name } = campo;

    return ({ row }: CellContext<Registro, unknown>) => {
        const value = getNestedValue(row.original, name);

        switch (type) {
            case 'date':
                return renderDateField(value);
            case 'number':
                return renderNumberField(value);
            case 'boolean':
                return renderBooleanField(value);
            case 'email':
                return renderEmailField(value);
            case 'phone':
                return renderPhoneField(value);
            case 'url':
                return renderUrlField(value);
            case 'textarea':
                return renderTextareaField(value);
            case 'select':
                return renderSelectField(value);
            case 'string':
            case 'text':
            default:
                return renderStringField(value);
        }
    };
};

// Utilidad para acceder a valores del array de datos según el campo
function getNestedValue(obj: any, fieldName: string) {
    // Si los datos están en formato array, mapear por índice
    if (Array.isArray(obj.data)) {
        // Buscar el índice del campo en la definición del modelo
        // Por ahora, asumimos que el orden de los campos coincide con el orden del array
        const fieldIndex = parseInt(fieldName) || 0;
        return obj.data[fieldIndex];
    }

    // Si los datos están en formato objeto, acceder normalmente
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
        return obj.data[fieldName];
    }

    // Si el objeto ya está aplanado (sin .data), acceder directamente
    if (obj[fieldName] !== undefined) {
        return obj[fieldName];
    }

    // Fallback: intentar acceder al campo en .data
    return obj.data?.[fieldName];
}

// Renderizadores específicos por tipo
function renderStringField(value: any) {
    return (
        <div className="min-w-[80px] text-sm whitespace-normal break-words">
            {value || '--'}
        </div>
    );
}

function renderNumberField(value: any) {
    if (value === null || value === undefined) {
        return <div className="min-w-[80px] text-sm text-center">--</div>;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return <div className="min-w-[80px] text-sm text-center">--</div>;
    }

    const formatted = new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numValue);

    return (
        <div className="min-w-[80px] text-sm text-center font-medium">
            {formatted}
        </div>
    );
}

function renderDateField(value: any) {
    if (!value) {
        return <div className="min-w-[80px] text-sm text-center">--</div>;
    }

    try {
        const date = new Date(value);
        const formatted = format(date, 'dd/MM/yyyy', { locale: es });

        // Colores por día de la semana
        const day = date.getDay();
        let bgColor = '';
        switch (day) {
            case 1: // Lunes
                bgColor = 'bg-green-100';
                break;
            case 2: // Martes
                bgColor = 'bg-yellow-100';
                break;
            case 3: // Miércoles
                bgColor = 'bg-red-100';
                break;
            case 4: // Jueves
                bgColor = 'bg-yellow-600';
                break;
            case 6: // Sábado
                bgColor = 'bg-blue-100';
                break;
            default:
                bgColor = '';
        }

        return (
            <div className={`min-w-[80px] text-sm text-center ${bgColor} rounded-sm p-1`}>
                {formatted}
            </div>
        );
    } catch {
        return <div className="min-w-[80px] text-sm text-center">--</div>;
    }
}

function renderBooleanField(value: any) {
    const boolValue = Boolean(value);
    return (
        <div className="min-w-[60px] text-center">
            <Badge variant={boolValue ? 'default' : 'secondary'} className="text-xs">
                {boolValue ? 'Sí' : 'No'}
            </Badge>
        </div>
    );
}

function renderEmailField(value: any) {
    if (!value) {
        return <div className="min-w-[120px] text-sm">--</div>;
    }

    return (
        <div className="min-w-[120px] text-sm whitespace-normal break-words">
            <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800">
                {value}
            </a>
        </div>
    );
}

function renderPhoneField(value: any) {
    if (!value) {
        return <div className="min-w-[100px] text-sm">--</div>;
    }

    return (
        <div className="min-w-[100px] text-sm">
            <a href={`tel:${value}`} className="text-blue-600 hover:text-blue-800">
                {value}
            </a>
        </div>
    );
}

function renderUrlField(value: any) {
    if (!value) {
        return <div className="min-w-[120px] text-sm">--</div>;
    }

    return (
        <div className="min-w-[120px] text-sm whitespace-normal break-words">
            <a
                href={value.startsWith('http') ? value : `https://${value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
            >
                {value.length > 30 ? value.substring(0, 30) + '...' : value}
            </a>
        </div>
    );
}

function renderTextareaField(value: any) {
    if (!value) {
        return <div className="min-w-[120px] text-sm">--</div>;
    }

    return (
        <div className="min-w-[120px] text-sm whitespace-normal break-words max-h-20 overflow-y-auto">
            {value}
        </div>
    );
}

function renderSelectField(value: any) {
    if (!value) {
        return <div className="min-w-[80px] text-sm">--</div>;
    }

    return (
        <div className="min-w-[80px] text-sm">
            <Badge variant="outline" className="text-xs">
                {value}
            </Badge>
        </div>
    );
}

// Generador de columnas completamente dinámico
export function getColumns(campos: CampoDef[]): ColumnDef<Registro>[] {
    return campos.map((campo, index) => ({
        accessorKey: campo.name,
        header: campo.label,
        cell: getFieldRenderer(campo, index),
        size: getColumnSize(campo.type),
        minSize: getMinColumnSize(campo.type),
        maxSize: getMaxColumnSize(campo.type),
    }));
}

// Funciones para determinar tamaños de columnas según el tipo
function getColumnSize(tipo: string): number {
    switch (tipo) {
        case 'date':
            return 100;
        case 'number':
            return 80;
        case 'boolean':
            return 60;
        case 'email':
            return 150;
        case 'phone':
            return 120;
        case 'url':
            return 150;
        case 'textarea':
            return 200;
        case 'select':
            return 100;
        case 'string':
        default:
            return 120;
    }
}

function getMinColumnSize(tipo: string): number {
    switch (tipo) {
        case 'date':
            return 80;
        case 'number':
            return 60;
        case 'boolean':
            return 50;
        case 'email':
            return 120;
        case 'phone':
            return 100;
        case 'url':
            return 120;
        case 'textarea':
            return 150;
        case 'select':
            return 80;
        case 'string':
        default:
            return 100;
    }
}

function getMaxColumnSize(tipo: string): number {
    switch (tipo) {
        case 'date':
            return 120;
        case 'number':
            return 100;
        case 'boolean':
            return 80;
        case 'email':
            return 200;
        case 'phone':
            return 150;
        case 'url':
            return 250;
        case 'textarea':
            return 400;
        case 'select':
            return 150;
        case 'string':
        default:
            return 200;
    }
} 