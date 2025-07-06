import { getDictionary } from '@repo/internationalization';
// import { getEmailTemplates } from '@repo/data-services';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { EmailClientsViewServer } from './components/EmailClientsViewServer';

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

export default async function Page() {
    // MOCK: clientes de ejemplo
    const clients: Client[] = [
        { id: '1', name: 'Juan Pérez', email: 'juan@mail.com', phone: '123456', lastOrder: '2024-06-01', totalSpent: 1200 },
        { id: '2', name: 'Ana López', email: 'ana@mail.com', phone: '654321', lastOrder: '2024-06-02', totalSpent: 950 },
    ];

    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    // TODO: Implementar con el nuevo modelo de base de datos
    const emailTemplates: any[] = []; // await getEmailTemplates(user.id);

    // Aquí deberías obtener los templates y dictionary reales
    const dictionary = await getDictionary('es');

    return (
        <EmailClientsViewServer
            clients={clients}
            emailTemplates={emailTemplates}
            dictionary={dictionary}
            category={"premium"}
            type={"spending"}
        />
    );
} 