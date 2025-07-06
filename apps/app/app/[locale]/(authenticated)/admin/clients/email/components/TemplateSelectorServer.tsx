'use server';

import { TemplateSelectorClient } from './TemplateSelectorClient';
import { getCurrentUser } from '@repo/auth/server';
import { revalidatePath } from 'next/cache';

// Tipos temporales hasta que se implementen los nuevos servicios
interface EmailTemplateData {
    id: string;
    name: string;
    subject: string;
    content: string;
    description?: string;
    isDefault: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

interface TemplateSelectorServerProps {
    templates: EmailTemplateData[];
    onTemplateSelect: (template: {
        subject: string;
        content: string;
    }) => void;
    selectedTemplate?: {
        subject: string;
        content: string;
    } | null;
    onTemplateCreated?: () => void;
}

export async function TemplateSelectorServer(props: TemplateSelectorServerProps) {
    const handleCreateTemplate = async (name: string, subject: string, content: string, description?: string) => {
        // TODO: Implementar con el nuevo modelo de base de datos
        console.warn('createEmailTemplate no implementado - migración en progreso');
        return { success: false, error: 'Funcionalidad temporalmente no disponible durante la migración' };
    };

    const handleDeleteTemplate = async (templateId: string) => {
        // TODO: Implementar con el nuevo modelo de base de datos
        console.warn('deleteEmailTemplate no implementado - migración en progreso');
        return { success: false, error: 'Funcionalidad temporalmente no disponible durante la migración' };
    };

    return (
        <TemplateSelectorClient
            {...props}
            onCreateTemplate={handleCreateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
        />
    );
} 