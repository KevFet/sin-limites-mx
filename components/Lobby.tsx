'use client';

import { Player, Room } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Users } from 'lucide-react';

interface LobbyProps {
    room: Room;
    players: Player[];
    currentPlayer: Player | null;
    onStart: () => void;
}

export function Lobby({ room, players, currentPlayer, onStart }: LobbyProps) {
    const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/?code=${room.code}` : '';

    const copyInvite = () => {
        navigator.clipboard.writeText(inviteUrl);
        alert('Link copiado al portapapeles');
    };

    const shareWhatsApp = () => {
        const text = `¡Únete a Sin Límites MX! El juego más pasado de lanza. Entra aquí: ${inviteUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 p-4 text-center">
            <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                    Sin Límites <span className="text-red-600">MX</span>
                </h1>
                <p className="text-zinc-400 font-medium">Esperando a la banda...</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Código de Sala</span>
                    <span className="text-2xl font-mono font-bold text-white tracking-[0.2em]">{room.code}</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={copyInvite}
                        className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition-all active:scale-95"
                    >
                        <Copy size={18} />
                        <span className="text-sm font-semibold">Copiar</span>
                    </button>
                    <button
                        onClick={shareWhatsApp}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl transition-all active:scale-95"
                    >
                        <Share2 size={18} />
                        <span className="text-sm font-semibold">WhatsApp</span>
                    </button>
                </div>
            </div>

            <div className="w-full max-w-md space-y-4">
                <div className="flex items-center gap-2 text-zinc-500 px-2">
                    <Users size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">{players.length} Jugadores</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {players.map((p) => (
                        <div
                            key={p.id}
                            className={`flex items-center justify-between p-4 rounded-xl border ${p.id === currentPlayer?.id
                                ? 'bg-zinc-800/80 border-zinc-600 ring-1 ring-zinc-500'
                                : 'bg-zinc-900/40 border-zinc-800'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-xs font-bold uppercase">
                                    {p.name.charAt(0)}
                                </div>
                                <span className="font-bold text-zinc-100">{p.name} {p.is_host && '👑'}</span>
                            </div>
                            {p.id === currentPlayer?.id && (
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">Tú</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {currentPlayer?.is_host && (
                <button
                    onClick={onStart}
                    disabled={players.length < 2}
                    className="w-full max-w-sm bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                    {players.length < 2 ? 'FALTAN JUGADORES (MÍN. 2)' : '¡DALE PLAY!'}
                </button>
            )}
        </div>
    );
}
