'use client';

import * as React from 'react';
import { useState } from 'react';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/design-system/components/ui/dialog';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Switch } from '@repo/design-system/components/ui/switch';
import { updateModelDefinitionFieldsAction } from '../actions';
import type { CampoDef } from '@repo/data-services/src/services/lupapyme/modelDefinitionService';

interface ManageFieldsModalProps {
    modelDefinition: {
        id?: string;
        tipo: string;
        campos: CampoDef[];
    };
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const FIELD_TYPES = [
    { value: 'string', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Fecha' },
    { value: 'boolean', label: 'Booleano' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Área de texto' },
    { value: 'select', label: 'Selección' },
];

export function ManageFieldsModal({ modelDefinition, isOpen, onOpenChange, onSuccess }: ManageFieldsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [fields, setFields] = useState<CampoDef[]>(modelDefinition.campos || []);
    const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
    const [newField, setNewField] = useState<Partial<CampoDef>>({
        name: '',
        label: '',
        type: 'text',
        required: false,
    });

    const handleAddField = () => {
        if (!newField.name || !newField.type) return;

        const field: CampoDef = {
            name: newField.name,
            label: newField.label || newField.name,
            type: newField.type,
            required: newField.required || false,
            order: fields.length + 1,
        };

        setFields([...fields, field]);
        setNewField({
            name: '',
            label: '',
            type: 'text',
            required: false,
        });
    };

    const handleEditField = (index: number) => {
        setEditingFieldIndex(index);
        setNewField(fields[index]);
    };

    const handleSaveEdit = () => {
        if (editingFieldIndex === null || !newField.name || !newField.type) return;

        const updatedFields = [...fields];
        updatedFields[editingFieldIndex] = {
            name: newField.name,
            label: newField.label || newField.name,
            type: newField.type,
            required: newField.required || false,
            order: newField.order || editingFieldIndex + 1,
        };

        setFields(updatedFields);
        setEditingFieldIndex(null);
        setNewField({
            name: '',
            label: '',
            type: 'text',
            required: false,
        });
    };

    const handleCancelEdit = () => {
        setEditingFieldIndex(null);
        setNewField({
            name: '',
            label: '',
            type: 'text',
            required: false,
        });
    };

    const handleDeleteField = (index: number) => {
        const updatedFields = fields.filter((_, i) => i !== index);
        setFields(updatedFields);
    };

    const handleSaveChanges = async () => {
        if (!modelDefinition.id) {
            console.error('No se puede guardar: falta ID del modelo');
            return;
        }

        setIsLoading(true);
        try {
            const result = await updateModelDefinitionFieldsAction(modelDefinition.id, fields);
            if (result.success) {
                onOpenChange(false);
                onSuccess();
            } else {
                alert(result.error || 'Error al guardar los cambios');
            }
        } catch (error) {
            console.error('Error guardando campos:', error);
            alert('Error al guardar los cambios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Resetear el estado cuando se cierra el modal
            setFields(modelDefinition.campos || []);
            setEditingFieldIndex(null);
            setNewField({
                name: '',
                label: '',
                type: 'text',
                required: false,
            });
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gestionar Campos de la Tabla</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Formulario para agregar/editar campo */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold">
                            {editingFieldIndex !== null ? 'Editar Campo' : 'Agregar Nuevo Campo'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fieldName">Nombre del Campo</Label>
                                <Input
                                    id="fieldName"
                                    value={newField.name}
                                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                                    placeholder="Ej: producto, precio, etc."
                                />
                            </div>
                            <div>
                                <Label htmlFor="fieldLabel">Etiqueta del Campo</Label>
                                <Input
                                    id="fieldLabel"
                                    value={newField.label}
                                    onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                    placeholder="Ej: Nombre del Producto"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fieldType">Tipo de Campo</Label>
                                <Select
                                    value={newField.type}
                                    onValueChange={(value) => setNewField({ ...newField, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FIELD_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="required"
                                    checked={newField.required}
                                    onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                                />
                                <Label htmlFor="required">Campo requerido</Label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {editingFieldIndex !== null ? (
                                <>
                                    <Button onClick={handleSaveEdit} disabled={!newField.name || !newField.type}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar Cambios
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelEdit}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancelar
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleAddField} disabled={!newField.name || !newField.type}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Agregar Campo
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Lista de campos existentes */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Campos Actuales ({fields.length})</h3>

                        {fields.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                No hay campos definidos. Agrega el primer campo arriba.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{field.label}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    ({FIELD_TYPES.find(t => t.value === field.type)?.label || field.type})
                                                </span>
                                                {field.required && (
                                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                        Requerido
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Campo: {field.name}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditField(index)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteField(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveChanges}
                            disabled={isLoading || fields.length === 0}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 