import { Activity, Users, Film, Star } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Benvenuto, Admin</h1>
                <p className="text-gray-400">Ecco le statistiche generali dell'applicazione TrackList.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-black border border-white/10 p-6 rounded-2xl glass-morphism">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Utenti Totali</h3>
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold">1,248</p>
                    <p className="text-sm text-emerald-400 mt-2">+12% questo mese</p>
                </div>

                <div className="bg-black border border-white/10 p-6 rounded-2xl glass-morphism">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Contenuti Aggiunti</h3>
                        <Film className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold">48,392</p>
                    <p className="text-sm text-emerald-400 mt-2">+5% questo mese</p>
                </div>

                <div className="bg-black border border-white/10 p-6 rounded-2xl glass-morphism">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Recensioni</h3>
                        <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-3xl font-bold">8,901</p>
                    <p className="text-sm text-emerald-400 mt-2">+18% questo mese</p>
                </div>

                <div className="bg-black border border-white/10 p-6 rounded-2xl glass-morphism">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-400 font-medium">Utenti Attivi</h3>
                        <Activity className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-3xl font-bold">342</p>
                    <p className="text-sm text-gray-500 mt-2">Nelle ultime 24h</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-black border border-white/10 rounded-2xl glass-morphism p-6 overflow-hidden">
                <h2 className="text-xl font-bold mb-6">Attività Recente</h2>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                    U
                                </div>
                                <div>
                                    <p className="font-medium">Nuovo utente registrato</p>
                                    <p className="text-sm text-gray-400">utente{i}@esempio.com</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">{i} ore fa</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
