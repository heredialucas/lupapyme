'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import type { Dictionary } from '@repo/internationalization';
import { ClientCategoryCard } from './ClientCategoryCard';
import { ClientStatsGrid } from './ClientStatsGrid';
import type { ClientAnalytics, ClientCategory } from '@repo/data-services/src/services/lupapyme/clientAnalyticsService';

interface ClientsManagementProps {
    analytics: ClientAnalytics;
    dictionary: Dictionary;
}

export function ClientsManagement({
    analytics,
    dictionary
}: ClientsManagementProps) {
    const [activeTab, setActiveTab] = useState('frequency');

    // Separar categorías por tipo
    const frequencyCategories = analytics.categories.filter(cat =>
        ['new', 'regular', 'loyal'].includes(cat.category)
    );

    const valueCategories = analytics.categories.filter(cat =>
        ['low', 'medium', 'high'].includes(cat.category)
    );

    const activityCategories = analytics.categories.filter(cat =>
        ['active', 'inactive', 'lost'].includes(cat.category)
    );

    // Ordenar categorías
    const orderMap = {
        new: 1, regular: 2, loyal: 3,
        low: 1, medium: 2, high: 3,
        active: 1, inactive: 2, lost: 3
    };

    const sortCategories = (categories: ClientCategory[]) =>
        categories.sort((a, b) => (orderMap[a.category as keyof typeof orderMap] || 0) - (orderMap[b.category as keyof typeof orderMap] || 0));

    const sortedFrequencyCategories = sortCategories(frequencyCategories);
    const sortedValueCategories = sortCategories(valueCategories);
    const sortedActivityCategories = sortCategories(activityCategories);

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {dictionary.app.admin.clients.title}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    {dictionary.app.admin.clients.description}
                </p>
            </div>

            {/* Stats Overview */}
            <ClientStatsGrid
                analytics={analytics}
                dictionary={dictionary}
            />

            {/* Categories Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto min-h-[40px] sm:h-11">
                    <TabsTrigger
                        value="frequency"
                        className="text-[10px] xs:text-xs sm:text-sm px-1 sm:px-3 py-2 leading-tight"
                    >
                        <span className="hidden xs:inline">
                            Por Frecuencia de Compra
                        </span>
                        <span className="xs:hidden">
                            Frecuencia
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="value"
                        className="text-[10px] xs:text-xs sm:text-sm px-1 sm:px-3 py-2 leading-tight"
                    >
                        <span className="hidden xs:inline">
                            Por Valor de Compra
                        </span>
                        <span className="xs:hidden">
                            Valor
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="activity"
                        className="text-[10px] xs:text-xs sm:text-sm px-1 sm:px-3 py-2 leading-tight"
                    >
                        <span className="hidden xs:inline">
                            Por Actividad Reciente
                        </span>
                        <span className="xs:hidden">
                            Actividad
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="frequency" className="mt-6">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {sortedFrequencyCategories.map((category) => (
                            <ClientCategoryCard
                                key={category.category}
                                category={category}
                                type="frequency"
                                dictionary={dictionary}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="value" className="mt-6">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
                        {sortedValueCategories.map((category) => (
                            <ClientCategoryCard
                                key={category.category}
                                category={category}
                                type="value"
                                dictionary={dictionary}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {sortedActivityCategories.map((category) => (
                            <ClientCategoryCard
                                key={category.category}
                                category={category}
                                type="activity"
                                dictionary={dictionary}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 