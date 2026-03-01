import { Shield, LayoutDashboard, Users, Film, Settings } from 'lucide-react';
import Link from 'next/link';
import { adminLogout } from '../actions';

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-black border-r border-white/10 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-white/10">
                    <Shield className="w-8 h-8 text-red-500" />
                    <span className="text-xl font-bold">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-red-600/10 text-red-500 rounded-xl transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors pointer-events-none opacity-50">
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Utenti</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors pointer-events-none opacity-50">
                        <Film className="w-5 h-5" />
                        <span className="font-medium">Contenuti</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors pointer-events-none opacity-50">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Impostazioni</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <form action={adminLogout}>
                        <button type="submit" className="w-full py-3 px-4 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-xl transition-colors flex items-center justify-center gap-2">
                            Logout Admin
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <header className="md:hidden bg-black border-b border-white/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-red-500" />
                        <span className="font-bold">Admin Panel</span>
                    </div>
                    <form action={adminLogout}>
                        <button type="submit" className="px-3 py-1.5 bg-white/5 text-sm hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors">
                            Logout
                        </button>
                    </form>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
