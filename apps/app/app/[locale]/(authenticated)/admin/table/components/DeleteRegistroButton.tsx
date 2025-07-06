'use client';

import React, { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteRegistroAction } from '../actions';

interface DeleteRegistroButtonProps {
    registroId: string;
    registroName?: string;
    onSuccess: () => void;
}

export function DeleteRegistroButton({ registroId, registroName, onSuccess }: DeleteRegistroButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        const confirmMessage = registroName
            ? `¿Estás seguro de que quieres eliminar "${registroName}"? Esta acción no se puede deshacer.`
            : '¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.';

        if (!confirm(confirmMessage)) {
            return;
        }

        setLoading(true);

        try {
            const result = await deleteRegistroAction(registroId);

            if (result.success) {
                onSuccess();
            } else {
                alert(result.error || 'Error al eliminar el registro');
            }
        } catch (error) {
            alert('Error al eliminar el registro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            size="icon"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    );
} 