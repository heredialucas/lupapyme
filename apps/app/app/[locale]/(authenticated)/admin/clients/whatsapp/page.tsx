import { getDictionary } from '@repo/internationalization';
// import { getWhatsAppTemplates } from '@repo/data-services';
import { getCurrentUser } from '@repo/data-services/src/services/authService';
import { WhatsAppClientsView } from './components/WhatsAppClientsView';

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

export default async function WhatsAppPage() {
    // MOCK: clientes de ejemplo
    const clients: Client[] = [
        { id: '1', name: 'Juan Pérez', email: 'juan@mail.com', phone: '123456', lastOrder: '2024-06-01', totalSpent: 1200 },
        { id: '2', name: 'Ana López', email: 'ana@mail.com', phone: '654321', lastOrder: '2024-06-02', totalSpent: 950 },
    ];

    const user = await getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    // TODO: Implementar con el nuevo modelo de base de datos
    const whatsappTemplates: any[] = []; // await getWhatsAppTemplates(user.id);
    const dictionary = await getDictionary('es');

    return (
        <WhatsAppClientsView
            category={"premium"}
            type={"spending"}
            dictionary={dictionary}
            clients={clients}
            whatsappTemplates={whatsappTemplates}
        />
    );
} 