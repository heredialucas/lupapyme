'use server';

import { WhatsAppTemplateSelectorClient } from './WhatsAppTemplateSelectorClient';
import { getCurrentUser } from '@repo/auth/server';
import { revalidatePath } from 'next/cache';

// Tipos temporales hasta que se implementen los nuevos servicios
interface WhatsAppTemplateData {
    id: string;
    name: string;
    content: string;
    description?: string;
    isDefault: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

interface WhatsAppTemplateSelectorServerProps {
    templates: WhatsAppTemplateData[];
    onTemplateSelect: (content: string) => void;
    onTemplateCreated?: () => void;
}

export async function WhatsAppTemplateSelectorServer(props: WhatsAppTemplateSelectorServerProps) {
    const handleCreateTemplate = async (name: string, content: string, description?: string) => {
        // TODO: Implementar con el nuevo modelo de base de datos
        console.warn('createWhatsAppTemplate no implementado - migración en progreso');
        return { success: false, error: 'Funcionalidad temporalmente no disponible durante la migración' };
    };

    const handleDeleteTemplate = async (templateId: string) => {
        // TODO: Implementar con el nuevo modelo de base de datos
        console.warn('deleteWhatsAppTemplate no implementado - migración en progreso');
        return { success: false, error: 'Funcionalidad temporalmente no disponible durante la migración' };
    };

    return (
        <WhatsAppTemplateSelectorClient
            {...props}
        />
    );
} 