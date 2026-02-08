'use client';

import { Player, Room, BlackCard, Selection } from '@/types/game';
import deckData from '@/data/deck.json';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, User, Trophy, Plus, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    const [showNewRound, setShowNewRound] = useState(false);

    // Trigger "New Round" flash when entering SELECTION state
    useEffect(() => {
        if (room.state === 'SELECTION') {
            setShowNewRound(true);
            const timer = setTimeout(() => setShowNewRound(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [room.state, room.black_card_id]); // Also trigger on new black card

    const isCzar = currentPlayer?.id === room.czar_id;
    const hasSelected = selections.some(s => s.player_id === currentPlayer?.id);
    const czar = players.find(p => p.id === room.czar_id);
    const allPlayersSelected = selections.length >= players.length - 1 && players.length > 1;

    return (
        <div className="flex flex-col gap-4 sm:gap-8 p-4 max-w-2xl mx-auto pb-32">
            <AnimatePresence>
                {room.state === 'SELECTION' && isCzar && (
                    <motion.div
                        key={`czar-banner-${room.czar_id}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
                    >
                        <div className="bg-red-600 text-white p-8 rounded-3xl shadow-[0_0_100px_rgba(220,38,38,0.5)] flex flex-col items-center space-y-4 border-4 border-white animate-bounce-short">
                            <Trophy size={60} />
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">¡ERES EL CZAR!</h2>
                            <p className="font-bold uppercase tracking-widest text-xs opacity-80 text-center">Relájate y espera a que los demás elijan sus pendejadas</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Round Flash Overlay */}
            <AnimatePresence>
                {showNewRound && (
                    <motion.div
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none px-6"
                    >
                        <div className="bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-full border-4 border-white flex flex-col items-center space-y-2 sm:space-y-4 shadow-[0_0_100px_rgba(255,255,255,0.2)]">
                            <Zap size={40} className="text-yellow-400 fill-yellow-400 animate-pulse sm:w-16 sm:h-16" />
                            <h2 className="text-3xl sm:text-6xl font-black italic uppercase tracking-tighter text-white text-center leading-none">
                                ¡RONDA NUEVA!
                            </h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Info */}
            <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 sm:p-4 sticky top-4 z-30 backdrop-blur-md shadow-xl">
                <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-zinc-500">Czar de la ronda</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="font-bold text-sm sm:text-base text-white truncate max-w-[120px] sm:max-w-none">
                            {czar?.name} {isCzar && '(Tú)'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-zinc-500">Tu Score</span>
                    <span className="text-lg sm:text-xl font-black text-white">{currentPlayer?.score || 0}</span>
                </div>
            </div>

            {/* Black Card - Ultra Compact V4 */}
            <motion.div
                layout
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-black border-2 border-zinc-800 rounded-xl p-3 sm:p-4 min-h-[80px] sm:min-h-[120px] flex flex-col justify-between shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <h2 className="text-lg font-black italic tracking-tighter uppercase leading-none">SL MX</h2>
                </div>
                <h3 className="text-sm sm:text-lg font-bold leading-tight text-white tracking-tight pr-8">
                    {blackCard?.text.split('________').map((part, i, arr) => (
                        <span key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <span className="inline-block w-8 sm:w-12 border-b-2 border-white mx-1 mb-0.5" />
                            )}
                        </span>
                    ))}
                </h3>
                <div className="flex items-center justify-between text-zinc-500 pt-1.5 border-t border-zinc-900 mt-1.5">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 italic">Lote #01-MX</span>
                    <span className="text-[8px] font-black uppercase ring-1 ring-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 bg-zinc-900/50">Coge {blackCard?.pick}</span>
                </div>
            </motion.div>

            {/* Game State Logic */}
            <div className="space-y-6">
                {room.state === 'SELECTION' && (
                    <>
                        {isCzar ? (
                            <div className="text-center p-6 sm:p-8 border-2 border-dashed border-zinc-800 rounded-3xl space-y-3 bg-zinc-900/30">
                                <p className="text-xl font-bold text-white uppercase italic tracking-tight">Esperando a la raza...</p>
                                <div className="flex justify-center gap-1.5 mt-2">
                                    {players.filter(p => p.id !== room.czar_id).map(p => (
                                        <motion.div
                                            key={p.id}
                                            initial={false}
                                            animate={{
                                                scale: selections.some(s => s.player_id === p.id) ? 1.2 : 1,
                                                backgroundColor: selections.some(s => s.player_id === p.id) ? '#22c55e' : '#27272a'
                                            }}
                                            className="w-4 h-4 rounded-full border border-zinc-700"
                                            title={p.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <h4 className="col-span-full text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">Tu Mano</h4>
                                <AnimatePresence mode="popLayout">
                                    {hand.map((card, index) => (
                                        <motion.button
                                            key={card}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => !hasSelected && onSelect(index)}
                                            disabled={hasSelected}
                                            className={`text-left p-5 rounded-2xl border-2 transition-all active:scale-95 flex flex-col justify-between h-40 sm:h-44 ${hasSelected
                                                ? selections.find(s => s.player_id === currentPlayer?.id)?.white_card_id === deckData.whiteCards.indexOf(card)
                                                    ? 'bg-white border-red-600 ring-4 ring-red-600/30 shadow-[0_0_30px_rgba(220,38,38,0.2)] z-10 scale-[1.02]'
                                                    : 'bg-zinc-900 border-zinc-800 opacity-20 grayscale pointer-events-none'
                                                : 'bg-white border-white hover:border-red-600 hover:shadow-2xl'
                                                }`}
                                        >
                                            <p className={`font-bold leading-snug text-base sm:text-lg ${hasSelected && selections.find(s => s.player_id === currentPlayer?.id)?.white_card_id !== deckData.whiteCards.indexOf(card) ? 'text-zinc-600' : 'text-black'}`}>
                                                {card}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Blanca</span>
                                                {hasSelected && selections.find(s => s.player_id === currentPlayer?.id)?.white_card_id === deckData.whiteCards.indexOf(card) && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -20 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-0.5 rounded-full"
                                                    >
                                                        <span className="text-[8px] font-black uppercase">Tu Carta</span>
                                                        <CheckCircle2 size={12} className="text-white" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                )}

                {room.state === 'JUDGING' && (
                    <div className="space-y-4">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-center space-y-1 mb-8"
                        >
                            <h4 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                                ¡TIEMPO DE <br className="sm:hidden" /> JUZGAR!
                            </h4>
                            <p className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-widest">
                                {isCzar ? 'Elige la que se la bañó más' : 'El Czar está filosofando...'}
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {selections.map((sel, idx) => (
                                    <motion.button
                                        key={sel.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => isCzar && onPickWinner(sel.id)}
                                        disabled={!isCzar}
                                        className="bg-white p-6 rounded-2xl border-2 border-white text-left min-h-[160px] sm:h-48 flex flex-col justify-between hover:border-red-600 hover:shadow-xl transition-all active:scale-95 group"
                                    >
                                        <p className="text-black font-bold text-lg sm:text-xl leading-tight">
                                            {deckData.whiteCards[sel.white_card_id]}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 italic group-hover:text-red-600 transition-colors">Respuesta Anónima</span>
                                            {isCzar && <Plus size={16} className="text-zinc-200 group-hover:text-red-500" />}
                                        </div>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
