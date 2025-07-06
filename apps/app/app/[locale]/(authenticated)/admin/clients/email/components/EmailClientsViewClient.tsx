'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { ArrowLeft, Mail, Send, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Dictionary } from '@repo/internationalization';
import { ClientsTable } from './ClientsTable';
import { TemplateSelectorClient } from './TemplateSelectorClient';
import { sendBulkEmailAction } from '../actions';

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

interface EmailClientsViewClientProps {
    category?: string;
    type?: string;
    dictionary: Dictionary;
    clients: Client[];
    emailTemplates: any[]; // O usa el tipo correcto si es global
}

// Función para traducir categorías de comportamiento
const translateBehaviorCategory = (category: string): string => {
    const translations: Record<string, string> = {
        'new': 'Cliente Nuevo',
        'possible-active': 'Posible Activo',
        'possible-inactive': 'Posible Inactivo',
        'active': 'Cliente Activo',
        'inactive': 'Cliente Inactivo',
        'recovered': 'Cliente Recuperado',
        'lost': 'Cliente Perdido',
        'tracking': 'En Seguimiento'
    };
    return translations[category] || category;
};

// Función para traducir categorías de gasto
const translateSpendingCategory = (category: string): string => {
    const translations: Record<string, string> = {
        'premium': 'Premium (A)',
        'standard': 'Estándar (B)',
        'basic': 'Básico (C)'
    };
    return translations[category] || category;
};

// Función para traducir tipos
const translateType = (type: string): string => {
    const translations: Record<string, string> = {
        'behavior': 'Comportamiento',
        'spending': 'Nivel de Gasto'
    };
    return translations[type] || type;
};

export function EmailClientsViewClient({
    category,
    type,
    dictionary,
    clients,
    emailTemplates
}: EmailClientsViewClientProps) {
    const router = useRouter();
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Traducir categoría y tipo
    const categoryTitle = category
        ? (type === 'behavior'
            ? translateBehaviorCategory(category)
            : translateSpendingCategory(category))
        : 'Todos';

    const typeTitle = type ? translateType(type) : '';

    const handleSendEmails = async () => {
        if (selectedClients.length === 0) {
            alert('Selecciona al menos un cliente');
            return;
        }

        if (!emailSubject.trim() || !emailMessage.trim()) {
            alert('Completa el asunto y el mensaje del email');
            return;
        }

        setIsLoading(true);

        try {
            const result = await sendBulkEmailAction(
                emailSubject.trim(),
                emailMessage.trim(),
                selectedClients
            );

            if (result.success) {
                alert(result.message || 'Emails enviados exitosamente');
                setSelectedClients([]);
                setEmailSubject('');
                setEmailMessage('');
            } else {
                alert(`Error al enviar emails: ${result.error}`);
            }
        } catch (error) {
            alert('Error al enviar emails. Intenta nuevamente.');
            console.error('Email send error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="text-muted-foreground"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Mail className="h-6 w-6 text-blue-600" />
                        Envío de Emails
                    </h1>
                    <div className="text-sm sm:text-base text-muted-foreground">
                        Categoría: <Badge variant="outline">{categoryTitle}</Badge>
                        {type && <> • Tipo: <Badge variant="outline">{typeTitle}</Badge></>}
                    </div>
                </div>
            </div>

            {/* Template Selector */}
            <TemplateSelectorClient
                templates={emailTemplates}
                onTemplateSelect={(template: { subject: string; content: string }) => {
                    setEmailSubject(template.subject);
                    setEmailMessage(template.content);
                }}
                selectedTemplate={{ subject: emailSubject, content: emailMessage }}
                onCreateTemplate={async () => ({ success: true })}
                onDeleteTemplate={async () => ({ success: true })}
            />

            {/* Action Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Enviar Emails
                    </CardTitle>
                    <CardDescription>
                        Configuración final antes del envío
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Botón de Testing */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="font-medium text-blue-800">🧪 Enviar Email de Prueba</h4>
                                    <p className="text-sm text-blue-700">
                                        Envía el contenido actual a los emails de prueba para verificar cómo se ve.
                                    </p>
                                </div>
                                <Button
                                    onClick={async () => {
                                        if (!emailSubject.trim() || !emailMessage.trim()) {
                                            alert('Por favor, selecciona un template o escribe un mensaje antes de enviar una prueba.');
                                            return;
                                        }
                                        setIsLoading(true);
                                        try {
                                            const result = await sendBulkEmailAction(
                                                `🧪 PRUEBA: ${emailSubject.trim()}`,
                                                emailMessage.trim(),
                                                ['test-email-1', 'test-email-2'] // IDs de prueba
                                            );

                                            if (result.success) {
                                                alert(`✅ Prueba enviada exitosamente. ${result.message || ''}`);
                                            } else {
                                                alert(`❌ Error en la prueba: ${result.error}`);
                                            }
                                        } catch (error) {
                                            alert('❌ Error al enviar la prueba.');
                                            console.error('Testing error:', error);
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                    disabled={isLoading || !emailSubject.trim() || !emailMessage.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isLoading ? 'Enviando...' : '📧 Enviar Prueba'}
                                </Button>
                            </div>
                        </div>

                        {/* Botón Normal */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {selectedClients.length} cliente(s) seleccionado(s)
                            </div>
                            <Button
                                onClick={handleSendEmails}
                                disabled={isLoading || selectedClients.length === 0 || !emailSubject.trim() || !emailMessage.trim()}
                                className="min-w-[120px]"
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Emails'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Clientes Disponibles</CardTitle>
                    <CardDescription>
                        Selecciona los clientes a los que deseas enviar el email
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ClientsTable
                        clients={clients}
                        selectedClients={selectedClients}
                        onSelectionChange={setSelectedClients}
                        dictionary={dictionary}
                    />
                </CardContent>
            </Card>
        </div>
    );
} 