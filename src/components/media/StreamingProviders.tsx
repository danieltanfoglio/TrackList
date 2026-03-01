// src/components/media/StreamingProviders.tsx
import Image from 'next/image';

interface Provider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

interface StreamingProvidersProps {
    providers: {
        flatrate?: Provider[];
        rent?: Provider[];
        buy?: Provider[];
    } | null;
}

export default function StreamingProviders({ providers }: StreamingProvidersProps) {
    if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) {
        return (
            <p className="text-gray-500 text-sm">Non sono stati trovati provider di streaming per la tua regione (IT).</p>
        );
    }

    const allProviders = [
        ...(providers.flatrate || []),
        ...(providers.rent || []),
        ...(providers.buy || [])
    ];

    // Remove duplicates based on provider_id
    const uniqueProviders = Array.from(
        new Map(allProviders.map(item => [item.provider_id, item])).values()
    );

    return (
        <div className="flex flex-wrap gap-4">
            {uniqueProviders.map((provider) => (
                <div
                    key={provider.provider_id}
                    className="group relative cursor-help"
                    title={provider.provider_name}
                >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 hover:border-blue-500 transition-colors">
                        <Image
                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                            alt={provider.provider_name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {provider.provider_name}
                    </span>
                </div>
            ))}
        </div>
    );
}
