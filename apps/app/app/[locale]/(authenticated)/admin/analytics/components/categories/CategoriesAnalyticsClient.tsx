'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Separator } from '@repo/design-system/components/ui/separator';
import { Tag, Filter } from 'lucide-react';
import { useInitStore } from '../../../../../../../store/initStore';
import { CategoriesChart } from '../charts/CategoriesChart';
import { CategoryProgressChart } from '../charts/CategoryProgressChart';

interface CategoryAnalyticsData {
    valor: string;
    cantidad: number;
}

interface CategoriesAnalyticsClientProps {
    data: CategoryAnalyticsData[];
    campoAnalizado: string;
}

export function CategoriesAnalyticsClient({ data, campoAnalizado }: CategoriesAnalyticsClientProps) {
    // Ordenar por cantidad descendente
    const datosOrdenados = useMemo(() => {
        return [...data].sort((a, b) => b.cantidad - a.cantidad);
    }, [data]);

    return (
        <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-bold mb-4">Analítica dinámica por "{campoAnalizado}"</h2>
            <table className="min-w-full border mt-4">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Valor</th>
                        <th className="border px-4 py-2">Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    {datosOrdenados.map(({ valor, cantidad }) => (
                        <tr key={valor}>
                            <td className="border px-4 py-2">{valor}</td>
                            <td className="border px-4 py-2">{cantidad}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* Aquí puedes agregar un gráfico dinámico usando los datos agrupados */}
        </div>
    );
} 