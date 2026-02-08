'use client';

import { Player, Room, BlackCard, Selection } from '@/types/game';
import deckData from '@/data/deck.json';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, User, Trophy } from 'lucide-react';

interface GameBoardProps {
    room: Room;
    currentPlayer: Player | null;
    players: Player[];
    blackCard: BlackCard | null;
    hand: string[];
    selections: Selection[];
    onSelect: (index: number) => void;
    onPickWinner: (selectionId: string) => void;
}

export function GameBoard({
    room,
    currentPlayer,
    players,
    blackCard,
    hand,
    selections,
    onSelect,
    onPickWinner
}: GameBoardProps) {
    const isCzar = currentPlayer?.id === room.czar_id;
    const hasSelected = selections.some(s => s.player_id === currentPlayer?.id);
    const czar = players.find(p => p.id === room.czar_id);

    return (
        <div className="flex flex-col gap-8 p-4 max-w-2xl mx-auto pb-32">
            {/* Header Info */}
            <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sticky top-4 z-20 backdrop-blur-md">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Czar de la ronda</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="font-bold text-white">{czar?.name} {isCzar && '(Teres tú)'}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Tu Score</span>
                    <span className="text-xl font-black text-white">{currentPlayer?.score || 0}</span>
                </div>
            </div>

            {/* Black Card */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-black border-2 border-zinc-800 rounded-3xl p-8 aspect-[3/4] flex flex-col justify-between shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <h2 className="text-4xl font-black italic">SL MX</h2>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-white tracking-tight">
                    {blackCard?.text.split('________').map((part, i, arr) => (
                        <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <span className="inline-block w-24 border-b-4 border-white mx-2 mb-1" />
                            )}
                        </span>
                    ))}
                </h3>
                <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Sin Límites MX</span>
                    <span className="text-xs font-bold uppercase">Selecciona {blackCard?.pick}</span>
                </div>
            </motion.div>

            {/* Game State Logic */}
            <div className="space-y-6">
                {room.state === 'SELECTION' && (
                    <>
                        {isCzar ? (
                            <div className="text-center p-8 border-2 border-dashed border-zinc-800 rounded-3xl space-y-2">
                                <p className="text-xl font-bold text-white">Eres el Czar</p>
                                <p className="text-zinc-500 text-sm">Espera a que los demás elijan sus pendejadas...</p>
                                <div className="flex justify-center gap-1 mt-4">
                                    {players.filter(p => p.id !== room.czar_id).map(p => (
                                        <div
                                            key={p.id}
                                            className={`w-3 h-3 rounded-full ${selections.some(s => s.player_id === p.id) ? 'bg-green-500' : 'bg-zinc-800'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <h4 className="col-span-full text-xs font-black uppercase tracking-widest text-zinc-500 px-2">Tu Mano</h4>
                                {hand.map((card, index) => (
                                    <button
                                        key={index}
                                        onClick={() => !hasSelected && onSelect(index)}
                                        disabled={hasSelected}
                                        className={`text-left p-6 rounded-2xl border-2 transition-all active:scale-95 flex flex-col justify-between h-48 ${hasSelected
                                                ? 'bg-zinc-900 border-zinc-800 opacity-50'
                                                : 'bg-white border-white hover:-translate-y-1 hover:shadow-xl'
                                            }`}
                                    >
                                        <p className={`font-bold leading-snug ${hasSelected ? 'text-zinc-400' : 'text-black'}`}>
                                            {card}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Blanca</span>
                                            {hasSelected && selections.find(s => s.player_id === currentPlayer?.id)?.white_card_id === deckData.whiteCards.indexOf(card) && (
                                                <CheckCircle2 className="text-green-500" size={20} />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {room.state === 'JUDGING' && (
                    <div className="space-y-4">
                        <div className="text-center space-y-1 mb-8">
                            <h4 className="text-2xl font-black text-white italic">TIEMPO DE JUZGAR</h4>
                            <p className="text-zinc-500 text-sm">{isCzar ? 'Pícale a la que más te de risa' : 'El Czar está decidiendo...'}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {selections.map((sel) => (
                                <button
                                    key={sel.id}
                                    onClick={() => isCzar && onPickWinner(sel.id)}
                                    disabled={!isCzar}
                                    className="bg-white p-6 rounded-2xl border-2 border-white text-left h-48 flex flex-col justify-between hover:shadow-xl transition-all active:scale-95"
                                >
                                    <p className="text-black font-bold text-lg leading-tight">
                                        {deckData.whiteCards[sel.white_card_id]}
                                    </p>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 italic">Respuesta Anónima</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
