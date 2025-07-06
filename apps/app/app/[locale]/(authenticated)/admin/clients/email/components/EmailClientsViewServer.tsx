'use client';

import { EmailClientsViewClient } from './EmailClientsViewClient';
import type { Dictionary } from '@repo/internationalization';

// Definir tipo local dinámico para los clientes
interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    lastOrder: string;
    totalSpent: number;
    // ...otros campos que uses
}

// Test emails for development
const TEST_EMAILS = ['heredialucasfac22@gmail.com', 'nicolascaliari28@gmail.com'];

interface EmailClientsViewServerProps {
    category?: string;
    type?: string;
    dictionary: Dictionary;
    clients: Client[];
    emailTemplates: any[]; // O usa el tipo correcto si es global
}

export function EmailClientsViewServer(props: EmailClientsViewServerProps) {
    return (
        <EmailClientsViewClient
            {...props}
        />
    );
} 