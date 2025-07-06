'use client';

import { useState } from 'react';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/design-system/components/ui/table';
import { Search, MessageCircle, Phone } from 'lucide-react';
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

interface WhatsAppClientsTableProps {
    clients: Client[];
    selectedClients: string[];
    onSelectionChange: (selected: string[]) => void;
    dictionary: Dictionary;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export function WhatsAppClientsTable({
    clients,
    selectedClients,
    onSelectionChange,
    dictionary
}: WhatsAppClientsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            onSelectionChange(filteredClients.map(client => client.id));
        } else {
            onSelectionChange([]);
        }
    };

    const handleSelectClient = (clientId: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedClients, clientId]);
        } else {
            onSelectionChange(selectedClients.filter(id => id !== clientId));
        }
    };

    const isAllSelected = filteredClients.length > 0 &&
        filteredClients.every(client => selectedClients.includes(client.id));

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Badge variant="secondary">
                    {filteredClients.length} clientes
                </Badge>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Seleccionar todos"
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Último Pedido</TableHead>
                            <TableHead className="text-right">Total Gastado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No se encontraron clientes
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedClients.includes(client.id)}
                                            onCheckedChange={(checked) =>
                                                handleSelectClient(client.id, checked as boolean)
                                            }
                                            aria-label={`Seleccionar ${client.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4 text-green-600" />
                                            <span className="font-mono text-sm">{client.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            {client.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatDate(client.lastOrder)}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(client.totalSpent)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary */}
            {selectedClients.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-700">
                        {selectedClients.length} de {filteredClients.length} clientes seleccionados para WhatsApp
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectionChange([])}
                        className="border-green-200 text-green-700 hover:bg-green-100"
                    >
                        Limpiar selección
                    </Button>
                </div>
            )}
        </div>
    );
} 