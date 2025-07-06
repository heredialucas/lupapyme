'use client';

import { Card, CardContent, CardDescription, CardHeader } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Users, TrendingUp, Clock, Mail, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Dictionary } from '@repo/internationalization';
import type { ClientCategory } from '@repo/data-services/src/services/lupapyme/clientAnalyticsService';

interface ClientCategoryCardProps {
    category: ClientCategory;
    type: 'frequency' | 'value' | 'activity';
    dictionary: Dictionary;
}

const getCategoryColor = (category: string, type: 'frequency' | 'value' | 'activity'): string => {
    if (type === 'frequency') {
        const frequencyColors: Record<string, string> = {
            'new': 'bg-blue-100 text-blue-800 border-blue-200',
            'regular': 'bg-green-100 text-green-800 border-green-200',
            'loyal': 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return frequencyColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    } else if (type === 'value') {
        const valueColors: Record<string, string> = {
            'low': 'bg-gray-100 text-gray-800 border-gray-200',
            'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'high': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 border-yellow-300'
        };
        return valueColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    } else {
        const activityColors: Record<string, string> = {
            'active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'inactive': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'lost': 'bg-red-100 text-red-800 border-red-200'
        };
        return activityColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getCategoryIcon = (category: string, type: 'frequency' | 'value' | 'activity') => {
    if (type === 'frequency') {
        const icons: Record<string, React.ReactNode> = {
            'new': <Users className="h-4 w-4" />,
            'regular': <TrendingUp className="h-4 w-4" />,
            'loyal': <TrendingUp className="h-4 w-4" />
        };
        return icons[category] || <Users className="h-4 w-4" />;
    } else if (type === 'value') {
        return <TrendingUp className="h-4 w-4" />;
    } else {
        const icons: Record<string, React.ReactNode> = {
            'active': <TrendingUp className="h-4 w-4" />,
            'inactive': <Clock className="h-4 w-4" />,
            'lost': <Users className="h-4 w-4" />
        };
        return icons[category] || <Users className="h-4 w-4" />;
    }
};

const getCategoryTitle = (category: string, type: 'frequency' | 'value' | 'activity', dictionary: Dictionary): string => {
    const titles: Record<string, string> = {
        // Frecuencia
        'new': 'Cliente Nuevo',
        'regular': 'Cliente Regular',
        'loyal': 'Cliente Leal',
        // Valor
        'low': 'Valor Bajo',
        'medium': 'Valor Medio',
        'high': 'Valor Alto',
        // Actividad
        'active': 'Cliente Activo',
        'inactive': 'Cliente Inactivo',
        'lost': 'Cliente Perdido'
    };
    return titles[category] || category;
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(amount);
};

export function ClientCategoryCard({
    category,
    type,
    dictionary
}: ClientCategoryCardProps) {
    const router = useRouter();
    const colorClasses = getCategoryColor(category.category, type);
    const icon = getCategoryIcon(category.category, type);
    const title = getCategoryTitle(category.category, type, dictionary);

    const handleEmailClick = () => {
        router.push(`/admin/clients/email?category=${category.category}&type=${type}`);
    };

    const handleWhatsAppClick = () => {
        router.push(`/admin/clients/whatsapp?category=${category.category}&type=${type}`);
    };

    return (
        <Card className="h-full min-h-[280px] hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="pb-3 space-y-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className={`${colorClasses} px-1 sm:px-2 py-1 text-[10px] xs:text-xs font-medium flex-shrink-0 max-w-[120px] xs:max-w-none`}>
                        <div className="flex items-center gap-1 min-w-0">
                            {icon}
                            <span className="hidden sm:inline truncate">{title}</span>
                            <span className="sm:hidden truncate text-[9px] xs:text-[10px]">
                                {title.includes('(') ? title.split('(')[0].trim() : title.split(' ')[0]}
                            </span>
                        </div>
                    </Badge>
                    <div className="text-right flex-shrink-0 min-w-[40px]">
                        <div className="text-lg xs:text-xl sm:text-2xl font-bold">{category.count}</div>
                        <div className="text-[10px] xs:text-xs text-muted-foreground">{category.percentage}%</div>
                    </div>
                </div>
                <CardDescription className="text-[11px] xs:text-xs sm:text-sm leading-relaxed">
                    {category.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                <div className="space-y-2 flex-1">
                    <div className="flex justify-between text-[10px] xs:text-xs sm:text-sm gap-2">
                        <span className="text-muted-foreground flex-shrink-0">Total:</span>
                        <span className="font-medium text-right truncate min-w-0">{formatCurrency(category.totalSpent)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] xs:text-xs sm:text-sm gap-2">
                        <span className="text-muted-foreground flex-shrink-0">Promedio:</span>
                        <span className="font-medium text-right truncate min-w-0">{formatCurrency(category.averageSpending)}</span>
                    </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border mt-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEmailClick}
                        className="flex-1 h-8 text-xs"
                    >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleWhatsAppClick}
                        className="flex-1 h-8 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 