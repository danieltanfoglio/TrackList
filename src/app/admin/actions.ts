'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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
