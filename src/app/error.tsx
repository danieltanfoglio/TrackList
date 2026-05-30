'use client';

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="glass-morphism p-8 max-w-md w-full text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-3xl">!</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Qualcosa è andato storto</h1>
        <p className="text-gray-400 text-sm">{error.message || "Si è verificato un errore imprevisto."}</p>
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
        >
          Riprova
        </button>
      </div>
    </div>
  );
}
