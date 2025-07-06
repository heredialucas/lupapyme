'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { Pencil, Save, X } from 'lucide-react';
import { updateRegistroAction } from '../actions';
import type { CampoDef } from '@repo/data-services/src/services/lupapyme/modelDefinitionService';

interface EditRegistroModalProps {
    registro: any;
    modelDefinition: {
        tipo: string;
        campos: CampoDef[];
    };
    onSuccess: () => void;
}

export function EditRegistroModal({ registro, modelDefinition, onSuccess }: EditRegistroModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (registro) {
            setFormData(registro);
        }
    }, [registro]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        console.log('EditRegistroModal - registro.id:', registro.id);
        console.log('EditRegistroModal - formData:', formData);

        try {
            const result = await updateRegistroAction(registro.id, formData);

            console.log('EditRegistroModal - result:', result);

            if (result.success) {
                setIsOpen(false);
                onSuccess();
            } else {
                alert(result.error || 'Error al actualizar el registro');
            }
        } catch (error) {
            console.error('EditRegistroModal - error:', error);
            alert('Error al actualizar el registro');
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Registro</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modelDefinition.campos.map(renderField)}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={loading}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 