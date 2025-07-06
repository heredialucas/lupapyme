"use client";
import { useState } from 'react';

interface CampoDef {
    nombre: string;
    tipo: string;
}

interface Registro {
    id: string;
    data: Record<string, any>;
}

interface FrequencyAnalyticsTabProps {
    modelDefinition: {
        tipo: string;
        campos: CampoDef[];
    };
    registros: Registro[];
}

export function FrequencyAnalyticsTab({ modelDefinition, registros }: FrequencyAnalyticsTabProps) {
    const [campoSeleccionado, setCampoSeleccionado] = useState<string>(modelDefinition.campos[0]?.nombre || '');

    // Agrupar registros por el campo seleccionado
    const agrupados = registros.reduce((acc: Record<string, number>, reg) => {
        const valor = reg.data[campoSeleccionado] ?? 'Sin valor';
        acc[valor] = acc[valor] ? acc[valor] + 1 : 1;
        return acc;
    }, {});

    return (
        <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-bold mb-4">Analítica dinámica de frecuencia</h2>
            <label className="block mb-2">Selecciona campo para analizar:</label>
            <select
                className="mb-4 p-2 border rounded"
                value={campoSeleccionado}
                onChange={e => setCampoSeleccionado(e.target.value)}
            >
                {modelDefinition.campos.map(campo => (
                    <option key={campo.nombre} value={campo.nombre}>
                        {campo.nombre}
                    </option>
                ))}
            </select>
            <table className="min-w-full border mt-4">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Valor</th>
                        <th className="border px-4 py-2">Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(agrupados).map(([valor, cantidad]) => (
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