'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { createRegistroAction } from '../actions';
import * as XLSX from 'xlsx';
import type { CampoDef } from '@repo/data-services/src/services/lupapyme/modelDefinitionService';

interface CreateRegistroModalProps {
    modelDefinition: {
        tipo: string;
        campos: CampoDef[];
    };
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateRegistroModal({ modelDefinition, isOpen, onOpenChange, onSuccess }: CreateRegistroModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [importing, setImporting] = useState(false);
    const [registrosToCreate, setRegistrosToCreate] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const data = await readExcelFile(file);
            if (data && data.length > 0) {
                // Procesar todas las filas del Excel
                const registrosToCreate = data.map((row, index) => {
                    const newFormData: any = {};

                    // Mapear los datos del Excel a los campos del formulario
                    modelDefinition.campos.forEach(campo => {
                        // Buscar el valor en el Excel por múltiples posibles nombres
                        let excelValue = '';

                        // Intentar por nombre del campo (ej: "nombre")
                        if (row[campo.name]) {
                            excelValue = row[campo.name];
                        }
                        // Intentar por label del campo (ej: "Nombre del Producto")
                        else if (row[campo.label]) {
                            excelValue = row[campo.label];
                        }
                        // Intentar por nombre en minúsculas
                        else if (row[campo.name.toLowerCase()]) {
                            excelValue = row[campo.name.toLowerCase()];
                        }
                        // Intentar por label en minúsculas
                        else if (row[campo.label.toLowerCase()]) {
                            excelValue = row[campo.label.toLowerCase()];
                        }
                        // Buscar por coincidencia parcial en cualquier header
                        else {
                            const headerKeys = Object.keys(row);
                            const matchingHeader = headerKeys.find(header =>
                                header.toLowerCase().includes(campo.name.toLowerCase()) ||
                                header.toLowerCase().includes(campo.label.toLowerCase())
                            );
                            if (matchingHeader) {
                                excelValue = row[matchingHeader];
                            }
                        }

                        console.log(`Mapeando campo ${campo.name}:`, {
                            label: campo.label,
                            value: excelValue,
                            availableKeys: Object.keys(row)
                        });

                        // Convertir el valor según el tipo de campo
                        switch (campo.type) {
                            case 'number':
                                newFormData[campo.name] = parseFloat(excelValue) || 0;
                                break;
                            case 'boolean':
                                newFormData[campo.name] = Boolean(excelValue);
                                break;
                            default:
                                newFormData[campo.name] = String(excelValue);
                                break;
                        }
                    });

                    return newFormData;
                });

                // Mostrar la primera fila en el formulario para revisión
                setFormData(registrosToCreate[0]);

                // Guardar todos los registros para crear después
                setRegistrosToCreate(registrosToCreate);

                alert(`Se encontraron ${registrosToCreate.length} registros en el Excel. Se mostrará el primero para revisión. Puedes crear todos los registros o modificar individualmente.`);
            } else {
                alert('El archivo Excel no contiene datos válidos.');
            }
        } catch (error) {
            console.error('Error al importar Excel:', error);
            alert('Error al importar el archivo Excel. Asegúrate de que el formato sea correcto.');
        } finally {
            setImporting(false);
            // Limpiar el input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const readExcelFile = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    console.log('Raw Excel data:', jsonData);

                    // Convertir a array de objetos usando la primera fila como headers
                    if (jsonData.length > 1) {
                        const headers = jsonData[0] as string[];
                        const rows = jsonData.slice(1);

                        // Filtrar solo filas que tengan al menos un valor no vacío
                        const validRows = rows.filter((row: any) => {
                            return row && row.some((cell: any) => cell !== null && cell !== undefined && cell !== '');
                        });

                        console.log('Headers:', headers);
                        console.log('Valid rows count:', validRows.length);

                        const result = validRows.map((row: any, index) => {
                            const obj: any = {};
                            headers.forEach((header, headerIndex) => {
                                if (header) {
                                    obj[header] = row[headerIndex] || '';
                                }
                            });
                            console.log(`Row ${index + 1}:`, obj);
                            return obj;
                        });

                        console.log('Final result:', result);
                        resolve(result);
                    } else {
                        resolve([]);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const handleCreateAllRegistros = async () => {
        if (registrosToCreate.length === 0) return;

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < registrosToCreate.length; i++) {
            try {
                const result = await createRegistroAction(registrosToCreate[i]);
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    console.error(`Error creating registro ${i + 1}:`, result.error);
                }
            } catch (error) {
                errorCount++;
                console.error(`Error creating registro ${i + 1}:`, error);
            }
        }

        setLoading(false);

        if (errorCount === 0) {
            alert(`¡Éxito! Se crearon ${successCount} registros correctamente.`);
        } else {
            alert(`Se crearon ${successCount} registros exitosamente. ${errorCount} registros fallaron.`);
        }

        // Limpiar el estado
        setRegistrosToCreate([]);
        setCurrentIndex(0);
        setFormData({});
        onSuccess();
    };

    const handleNextRegistro = () => {
        if (currentIndex < registrosToCreate.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setFormData(registrosToCreate[nextIndex]);
        }
    };

    const handlePreviousRegistro = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            setFormData(registrosToCreate[prevIndex]);
        }
    };

    const handleUpdateCurrentRegistro = () => {
        const updatedRegistros = [...registrosToCreate];
        updatedRegistros[currentIndex] = { ...formData };
        setRegistrosToCreate(updatedRegistros);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createRegistroAction(formData);

            if (result.success) {
                onOpenChange(false);
                setFormData({});
                onSuccess();
            } else {
                alert(result.error || 'Error al crear el registro');
            }
        } catch (error) {
            alert('Error al crear el registro');
        } finally {
            setLoading(false);
        }
    };

    const renderField = (campo: CampoDef) => {
        const value = formData[campo.name] || '';

        switch (campo.type) {
            case 'string':
            case 'text':
                return (
                    <div key={campo.name} className="space-y-2">
                        <Label htmlFor={campo.name}>{campo.label}</Label>
                        <Input
                            id={campo.name}
                            value={value}
                            onChange={(e) => handleChange(campo.name, e.target.value)}
                            placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                        />
                    </div>
                );

            case 'number':
                return (
                    <div key={campo.name} className="space-y-2">
                        <Label htmlFor={campo.name}>{campo.label}</Label>
                        <Input
                            id={campo.name}
                            type="number"
                            value={value}
                            onChange={(e) => handleChange(campo.name, parseFloat(e.target.value) || 0)}
                            placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <div key={campo.name} className="space-y-2">
                        <Label htmlFor={campo.name}>{campo.label}</Label>
                        <Textarea
                            id={campo.name}
                            value={value}
                            onChange={(e) => handleChange(campo.name, e.target.value)}
                            placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                        />
                    </div>
                );

            case 'select':
                return (
                    <div key={campo.name} className="space-y-2">
                        <Label htmlFor={campo.name}>{campo.label}</Label>
                        <select
                            id={campo.name}
                            value={value}
                            onChange={(e) => handleChange(campo.name, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Seleccione una opción</option>
                            {campo.options?.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            default:
                return (
                    <div key={campo.name} className="space-y-2">
                        <Label htmlFor={campo.name}>{campo.label}</Label>
                        <Input
                            id={campo.name}
                            value={value}
                            onChange={(e) => handleChange(campo.name, e.target.value)}
                            placeholder={`Ingrese ${campo.label.toLowerCase()}`}
                        />
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Registro</DialogTitle>
                </DialogHeader>

                {/* Sección de importar Excel */}
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-sm">Importar desde Excel</h3>
                    </div>
                    <p className="text-xs text-gray-600">
                        Sube un archivo Excel (.xlsx, .xls) con los datos. La primera fila debe contener los nombres de los campos.
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="excel-upload"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                            className="flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {importing ? 'Importando...' : 'Seleccionar Excel'}
                        </Button>
                        {importing && (
                            <span className="text-sm text-blue-600">Procesando archivo...</span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {modelDefinition.campos.map(renderField)}

                    {/* Controles para múltiples registros */}
                    {registrosToCreate.length > 1 && (
                        <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <strong>Registro {currentIndex + 1} de {registrosToCreate.length}</strong>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Navega entre los registros importados para revisarlos antes de crear
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousRegistro}
                                        disabled={currentIndex === 0}
                                    >
                                        ← Anterior
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextRegistro}
                                        disabled={currentIndex === registrosToCreate.length - 1}
                                    >
                                        Siguiente →
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleUpdateCurrentRegistro}
                                >
                                    Actualizar este registro
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    onClick={handleCreateAllRegistros}
                                    disabled={loading}
                                >
                                    {loading ? 'Creando todos...' : `Crear todos los ${registrosToCreate.length} registros`}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                setFormData({});
                                setRegistrosToCreate([]);
                                setCurrentIndex(0);
                            }}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        {registrosToCreate.length === 0 ? (
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear'}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Creando...' : 'Crear este registro'}
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 