/**
 * User data returned from the database
 */
export interface UserData {
    id: string;
    name: string;
    lastName: string;
    email: string;
    role: string;
    permissions: string[]; // Array de permisos específicos
    createdAt: Date;
    updatedAt: Date;
    tenantId: string;
}

/**
 * User data for form submissions
 */
export interface UserFormData {
    name: string;
    lastName: string;
    email: string;
    password: string;
    tenantId: string;
}

/**
 * User data for display (without sensitive information)
 */
export interface UserDisplay {
    id: string;
    name: string;
    lastName: string;
    email: string;
    role: string;
} 