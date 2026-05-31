'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { banUser as banUserDb, unbanUser as unbanUserDb, updateUserRole as updateUserRoleDb, resetUserPassword as resetUserPasswordDb, impersonateUser as impersonateUserDb } from '@/lib/supabase-admin';

export async function adminLogin(formData: FormData) {
    const email = formData.get('email');
    const password = formData.get('password');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
        const cookieStore = await cookies();
        cookieStore.set('admin_token', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        redirect('/admin/dashboard');
    }

    return { error: 'Credenziali non valide' };
}

export async function adminLogout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');
    redirect('/admin');
}

export async function banUserAction(formData: FormData) {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_token')?.value !== 'authenticated') {
        return { error: 'Non autorizzato' };
    }

    const userId = formData.get('userId') as string;
    const reason = formData.get('reason') as string;

    if (!userId) return { error: 'ID utente mancante' };

    const success = await banUserDb(userId, reason || 'Nessun motivo specificato', 'admin');
    return { success };
}

export async function unbanUserAction(formData: FormData) {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_token')?.value !== 'authenticated') {
        return { error: 'Non autorizzato' };
    }

    const userId = formData.get('userId') as string;
    if (!userId) return { error: 'ID utente mancante' };

    const success = await unbanUserDb(userId);
    return { success };
}

export async function updateUserRoleAction(formData: FormData) {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_token')?.value !== 'authenticated') {
        return { error: 'Non autorizzato' };
    }

    const userId = formData.get('userId') as string;
    const role = formData.get('role') as 'user' | 'moderator' | 'admin';

    if (!userId || !role) return { error: 'Parametri mancanti' };

    const success = await updateUserRoleDb(userId, role);
    return { success };
}

export async function resetUserPasswordAction(formData: FormData) {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_token')?.value !== 'authenticated') {
        return { error: 'Non autorizzato' };
    }

    const userId = formData.get('userId') as string;
    if (!userId) return { error: 'ID utente mancante' };

    const newPassword = await resetUserPasswordDb(userId);
    if (!newPassword) return { error: 'Errore nel reset della password' };

    return { success: true, password: newPassword };
}

export async function impersonateUserAction(userId: string) {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_token')?.value !== 'authenticated') {
        return { error: 'Non autorizzato' };
    }

    if (!userId) return { error: 'ID utente mancante' };

    const result = await impersonateUserDb(userId);
    if (!result) return { error: 'Impossibile generare il link di impersonificazione' };

    return { success: true, email: result.email, otp: result.otp };
}
