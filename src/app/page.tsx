// src/app/page.tsx
import SearchBar from "@/components/search/SearchBar";
import { Film, TrendingUp, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="relative isolate">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-indigo-800 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl text-balance">
            Organizza la tua passione per il{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Cinema
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-400 max-w-2xl mx-auto">
            Cerca film e serie TV, gestisci la tua watchlist e traccia il progresso dei tuoi episodi. Tutto in un unico posto.
          </p>

          <div className="mt-12">
            <SearchBar />
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="glass-morphism p-6 flex flex-col items-center text-center">
              <div className="bg-blue-500/10 p-3 rounded-xl mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Trend attuali</h3>
              <p className="mt-2 text-sm text-gray-400">Resta aggiornato sui titoli più popolari al momento.</p>
            </div>

            <div className="glass-morphism p-6 flex flex-col items-center text-center">
              <div className="bg-indigo-500/10 p-3 rounded-xl mb-4">
                <Star className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Watchlist Intelligente</h3>
              <p className="mt-2 text-sm text-gray-400">Ricevi suggerimenti basati sui tuoi gusti personali.</p>
            </div>

            <div className="glass-morphism p-6 flex flex-col items-center text-center">
              <div className="bg-purple-500/10 p-3 rounded-xl mb-4">
                <Film className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">Tracking Episodi</h3>
              <p className="mt-2 text-sm text-gray-400">Non perdere mai il segno dell'ultimo episodio visto.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
