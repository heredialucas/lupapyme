'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/design-system/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/design-system/components/ui/alert-dialog';
import { useToast } from '@repo/design-system/hooks/use-toast';
import { User, Mail, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import type { UserData } from '@repo/data-services/src/types/user';
import type { Dictionary } from '@repo/internationalization';
import { createUser, updateUser, deleteUser } from '../actions';

interface UsersSectionProps {
    users: UserData[];
    currentUser: any;
    dictionary: Dictionary;
}

export function UsersSection({ users, currentUser, dictionary }: UsersSectionProps) {
    const { toast } = useToast();
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deleteUserDialog, setDeleteUserDialog] = useState<{ open: boolean; user: UserData | null }>({ open: false, user: null });
    const [isPending, startTransition] = useTransition();

    const [userForm, setUserForm] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user' as string,
        permissions: [] as string[],
    });

    const handleCreateUser = () => {
        setEditingUser(null);
        setUserForm({
            name: '',
            lastName: '',
            email: '',
            password: '',
            role: 'user',
            permissions: ['account:view_own'], // Permiso básico por defecto
        });
        setIsUserDialogOpen(true);
    };

    const handleEditUser = (user: UserData) => {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            password: '',
            role: user.role as string,
            permissions: user.permissions || [],
        });
        setIsUserDialogOpen(true);
    };

    const handleUserSubmit = async () => {
        // Validaciones básicas del lado del cliente para UX
        if (!userForm.name || !userForm.lastName || !userForm.email) {
            toast({ title: "Error", description: "Nombre, apellido y email son requeridos", variant: "destructive" });
            return;
        }
        if (!editingUser && !userForm.password) {
            toast({ title: "Error", description: "La contraseña es requerida para nuevos usuarios", variant: "destructive" });
            return;
        }
        if (userForm.password && userForm.password.length < 6) {
            toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append('name', userForm.name);
            formData.append('lastName', userForm.lastName);
            formData.append('email', userForm.email);
            formData.append('password', userForm.password);
            formData.append('role', userForm.role);
            formData.append('permissions', JSON.stringify(userForm.permissions));

            const result = editingUser
                ? await updateUser(editingUser.id, formData)
                : await createUser(formData);

            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message,
                });
                setIsUserDialogOpen(false);
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    const handleDeleteUser = async (user: UserData) => {
        startTransition(async () => {
            const result = await deleteUser(user.id);
            if (result.success) {
                toast({
                    title: "Éxito",
                    description: result.message,
                });
                setDeleteUserDialog({ open: false, user: null });
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Usuarios del Sistema
                            </CardTitle>
                            <CardDescription>
                                Gestiona los usuarios y sus permisos
                            </CardDescription>
                        </div>
                        <Button className="w-full sm:w-auto" onClick={handleCreateUser}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Usuario
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {users.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    No hay usuarios registrados
                                </p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <div key={user.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-medium">
                                                {user.name[0]}{user.lastName[0]}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {user.name} {user.lastName}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="flex-1 sm:text-right space-y-1">
                                            <div className="flex flex-col gap-1">
                                                <Badge
                                                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                                                    className="w-fit"
                                                >
                                                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                                </Badge>
                                                <Badge
                                                    variant={user.permissions.length > 0 ? 'default' : 'destructive'}
                                                    className="w-fit text-xs"
                                                >
                                                    {user.permissions.length > 0 ? `✓ ${user.permissions.length} permisos` : '✗ Sin permisos'}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditUser(user)}
                                                disabled={isPending}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeleteUserDialog({ open: true, user })}
                                                disabled={user.id === currentUser?.id || isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser ?
                                'Actualiza la información del usuario' :
                                'Completa los campos para crear un nuevo usuario'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="user-name">Nombre</Label>
                                <Input
                                    id="user-name"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-lastName">Apellido</Label>
                                <Input
                                    id="user-lastName"
                                    value={userForm.lastName}
                                    onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-email">Email</Label>
                            <Input
                                id="user-email"
                                type="email"
                                value={userForm.email}
                                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-password">
                                Contraseña
                                {editingUser && ' (dejar vacío para no cambiar)'}
                            </Label>
                            <Input
                                id="user-password"
                                type="password"
                                value={userForm.password}
                                onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                                disabled={isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="user-role">Rol</Label>
                            <Select
                                value={userForm.role}
                                onValueChange={(value: string) => setUserForm(prev => ({ ...prev, role: value }))}
                                disabled={isPending}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="user">Usuario</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Permisos del Usuario</Label>
                            <div className="max-h-60 overflow-y-auto space-y-4 p-4 border rounded-lg">
                                {/* Permisos de Vista */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        <Label className="text-sm font-medium text-blue-700 dark:text-blue-400">Permisos de Vista</Label>
                                    </div>
                                    <div className="ml-4 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={userForm.permissions.includes('analytics:view')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setUserForm(prev => ({ ...prev, permissions: [...prev.permissions, 'analytics:view'] }));
                                                    else setUserForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== 'analytics:view') }));
                                                }}
                                                disabled={isPending}
                                            />
                                            <Label className="text-sm">Ver estadísticas</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={userForm.permissions.includes('clients:view')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setUserForm(prev => ({ ...prev, permissions: [...prev.permissions, 'clients:view'] }));
                                                    else setUserForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== 'clients:view') }));
                                                }}
                                                disabled={isPending}
                                            />
                                            <Label className="text-sm">Ver clientes</Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Permisos de Edición */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                        <Label className="text-sm font-medium text-orange-700 dark:text-orange-400">Permisos de Edición</Label>
                                    </div>
                                    <div className="ml-4 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={userForm.permissions.includes('account:edit_own')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setUserForm(prev => ({ ...prev, permissions: [...prev.permissions, 'account:edit_own'] }));
                                                    else setUserForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== 'account:edit_own') }));
                                                }}
                                                disabled={isPending}
                                            />
                                            <Label className="text-sm">Editar su propio perfil</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={userForm.permissions.includes('account:change_password')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setUserForm(prev => ({ ...prev, permissions: [...prev.permissions, 'account:change_password'] }));
                                                    else setUserForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== 'account:change_password') }));
                                                }}
                                                disabled={isPending}
                                            />
                                            <Label className="text-sm">Cambiar su contraseña</Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Permisos de Órdenes */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <Label className="text-sm font-medium text-green-700 dark:text-green-400">Permisos de Órdenes</Label>
                                    </div>
                                    <div className="ml-4 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={userForm.permissions.includes('table:view')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setUserForm(prev => ({ ...prev, permissions: [...prev.permissions, 'table:view'] }));
                                                    else setUserForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== 'table:view') }));
                                                }}
                                                disabled={isPending}
                                            />
                                            <Label className="text-sm">Ver órdenes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={userForm.permissions.includes('table:edit')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setUserForm(prev => ({ ...prev, permissions: [...prev.permissions, 'table:edit'] }));
                                                    else setUserForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== 'table:edit') }));
                                                }}
                                                disabled={isPending}
                                            />
                                            <Label className="text-sm">Editar órdenes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={userForm.permissions.includes('table:notify')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setUserForm(prev => ({ ...prev, permissions: [...prev.permissions, 'table:notify'] }));
                                                    else setUserForm(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== 'table:notify') }));
                                                }}
                                                disabled={isPending}
                                            />
                                            <Label className="text-sm">Notificar clientes (órdenes)</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground pt-2">
                                Asigna los permisos específicos para el usuario.
                                <br />
                                <span className="text-xs">Nota: Todos los usuarios pueden ver su propia cuenta por defecto.</span>
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUserDialogOpen(false)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUserSubmit} disabled={isPending}>
                            {isPending ? (
                                editingUser ? 'Actualizando...' : 'Creando...'
                            ) : (
                                editingUser ? 'Actualizar Usuario' : 'Crear Usuario'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={deleteUserDialog.open}
                onOpenChange={(open) => setDeleteUserDialog(prev => ({ ...prev, open }))}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Confirmar eliminación
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar este usuario?
                            <br />
                            <strong>
                                {deleteUserDialog.user?.name} {deleteUserDialog.user?.lastName}
                            </strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUserDialog.user && handleDeleteUser(deleteUserDialog.user)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            {isPending ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 