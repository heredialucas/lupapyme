'use server';

import { cookies } from 'next/headers';
import { createUser, getUserById, verifyUserCredentials } from './userService';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
// Cookie expiration (30 days in seconds)
const COOKIE_EXPIRATION = 60 * 60 * 24 * 30;

/**
 * Establecer cookie de manera compatible con Next.js 15
 */
async function setCookie(name: string, value: string, options?: Partial<ResponseCookie>) {
    try {
        const cookieStore = await cookies();

        cookieStore.set(name, value, {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: COOKIE_EXPIRATION,
            sameSite: 'lax',
            ...options,
        });
    } catch (error) {
        console.error('Error al establecer cookie:', error);
    }
}

/**
 * Sign in a user with email and password
 */
export async function signIn({ email, password }: { email: string; password: string }) {
    try {
        // Verify credentials
        const authResult = await verifyUserCredentials(email, password);

        if (!authResult.success) {
            return { success: false, message: 'Credenciales inválidas' };
        }

        // Get user details
        const user = await getUserById(authResult.user?.id || '');
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        // Create session token (simple JSON string, no encryption)
        const token = JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role.toLowerCase(), // Asegurar que el rol está en minúsculas
            permissions: Array.isArray(user.permissions) ? user.permissions : [],
            tenantId: user.tenantId,
        });

        // Establecer cookie
        await setCookie('auth-token', token);

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            }
        };
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return { success: false, message: 'Error al iniciar sesión' };
    }
}

/**
 * Sign up a new user
 */
export async function signUp(data: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    tenantId: string;
}) {
    try {
        console.log('[signUp] Payload recibido:', data);
        // Create new user
        const result = await createUser({
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            tenantId: data.tenantId,
            role: 'admin', // Primeros usuarios como admin para setup inicial
        });
        console.log('[signUp] Resultado de createUser:', result);

        // Check if user creation failed
        if (!result.success || !result.user) {
            return {
                success: false,
                message: result.message || 'Error al crear usuario',
                error: result.error || 'USER_CREATION_FAILED'
            };
        }

        const user = result.user;

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            }
        };
    } catch (error) {
        console.error('[signUp] Error al crear cuenta:', error);
        return {
            success: false,
            message: 'Error inesperado al crear la cuenta',
            error: 'UNEXPECTED_ERROR'
        };
    }
}

/**
 * Sign out the current user
 */
export async function signOut() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('auth-token');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar cookie:', error);
        return { success: false, error: 'Error al cerrar sesión' };
    }
}

/**
 * Get the current authenticated user
 * NOTA: Esta función NO modifica cookies cuando se llama desde un Server Component
 */
export async function getCurrentUser() {
    try {
        // Obtener la cookie directamente
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');

        if (!tokenCookie || !tokenCookie.value || tokenCookie.value.trim() === '') {
            console.log('No hay cookie de auth-token');
            return null;
        }

        try {
            const token = JSON.parse(tokenCookie.value);
            console.log('Token parseado:', token);

            if (!token || !token.id) {
                console.log('Token no tiene id válido');
                return null;
            }

            // Usar directamente la información del token (evita consulta a BD)
            console.log('Usando información del token directamente');
            return {
                id: token.id,
                name: token.name || 'Usuario',
                lastName: token.lastName || '',
                email: token.email,
                role: token.role,
                permissions: Array.isArray(token.permissions) ? token.permissions : [],
                tenantId: token.tenantId,
            };
        } catch (parseError) {
            console.error('Error al analizar el token:', parseError);
            return null;
        }
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
    }
}

/**
 * Get only the current user ID from cookies
 * Useful for CRUD operations that need the creator ID
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('auth-token');

        if (!tokenCookie || !tokenCookie.value || tokenCookie.value.trim() === '') {
            return null;
        }

        try {
            const token = JSON.parse(tokenCookie.value);
            return token.id || null;
        } catch (parseError) {
            console.error('Error al analizar el token:', parseError);
            return null;
        }
    } catch (error) {
        console.error('Error al obtener ID de usuario actual:', error);
        return null;
    }
} 