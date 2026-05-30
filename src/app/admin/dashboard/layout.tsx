import { Shield, LayoutDashboard, Users, Film, Activity, Settings } from 'lucide-react';
import Link from 'next/link';
import { adminLogout } from '../actions';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            <aside className="w-64 bg-black border-r border-white/10 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <Shield className="w-8 h-8 text-red-500" />
                    <span className="text-xl font-bold">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <SidebarLink href="/admin/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
                    <SidebarLink href="/admin/dashboard/users" icon={<Users className="w-5 h-5" />} label="Utenti" />
                    <SidebarLink href="/admin/dashboard/content" icon={<Film className="w-5 h-5" />} label="Contenuti" />
                    <SidebarLink href="/admin/dashboard/activity" icon={<Activity className="w-5 h-5" />} label="Attività" />
                    <SidebarLink href="#" icon={<Settings className="w-5 h-5" />} label="Impostazioni" disabled />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <form action={adminLogout}>
                        <button type="submit" className="w-full py-3 px-4 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2" aria-label="Logout amministratore">
                            Logout Admin
                        </button>
                    </form>
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <header className="md:hidden bg-black border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-red-500" />
                        <span className="font-bold">Admin Panel</span>
                    </div>
                    <form action={adminLogout}>
                        <button type="submit" className="px-3 py-1.5 bg-white/5 text-sm hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors" aria-label="Logout">
                            Logout
                        </button>
                    </form>
                </header>

                {/* Mobile nav */}
                <div className="md:hidden flex overflow-x-auto gap-1 p-2 bg-black/50 border-b border-white/5">
                    <MobileNavLink href="/admin/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
                    <MobileNavLink href="/admin/dashboard/users" icon={<Users className="w-4 h-4" />} label="Utenti" />
                    <MobileNavLink href="/admin/dashboard/content" icon={<Film className="w-4 h-4" />} label="Contenuti" />
                    <MobileNavLink href="/admin/dashboard/activity" icon={<Activity className="w-4 h-4" />} label="Attività" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SidebarLink({ href, icon, label, disabled }: { href: string; icon: React.ReactNode; label: string; disabled?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${disabled
                    ? 'text-gray-600 cursor-not-allowed opacity-50'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : undefined}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </Link>
    );
}

function MobileNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 whitespace-nowrap transition-colors"
        >
            {icon}
            {label}
        </Link>
    );
}
