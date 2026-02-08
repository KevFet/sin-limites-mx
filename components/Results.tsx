'use client';

import { Player, Selection, BlackCard, Room } from '@/types/game';
import deckData from '@/data/deck.json';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowRight, User, List } from 'lucide-react';

interface ResultsProps {
    room: Room;
    players: Player[];
    selections: Selection[];
    blackCard: BlackCard | null;
    currentPlayer: Player | null;
    onNextRound: () => void;
    onShowScores: () => void;
}

export function Results({ room, players, selections, blackCard, currentPlayer, onNextRound, onShowScores }: ResultsProps) {
    const winner = players.find(p => p.id === room.winner_id);
    const winningSelection = selections.find(s => s.id === room.winning_selection_id);
    const winningCardText = winningSelection ? deckData.whiteCards[winningSelection.white_card_id] : null;
    const isCzar = currentPlayer?.id === room.czar_id;

    if (room.state === 'REVEAL') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center space-y-8 sm:space-y-12 pb-32">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-4 shadow-[0_0_80px_rgba(234,179,8,0.4)]">
                        <Trophy size={44} className="text-black" />
                    </div>
                    <h2 className="text-5xl sm:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                        ¡GAAANÓ!
                    </h2>
                </motion.div>

                <AnimatePresence>
                    {winningCardText && (
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] border-8 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.2)] text-left space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Trophy size={80} className="text-black" />
                            </div>

                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-yellow-600">La del triunfo</span>
                                <div className="flex items-center gap-2 text-black font-black text-xs uppercase bg-zinc-100 px-3 py-1 rounded-full">
                                    <User size={14} />
                                    {winner?.name}
                                </div>
                            </div>
                            <p className="text-black font-bold text-2xl sm:text-3xl leading-tight italic">
                                "{winningCardText}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isCzar ? (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        onClick={onShowScores}
                        className="group flex items-center gap-3 bg-zinc-100 hover:bg-white text-black px-10 py-5 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-2xl"
                    >
                        VER LA TABLA
                        <List className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                ) : (
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                        El Czar está por mostrar los puntajes...
                    </p>
                )}
            </div>
        );
    }

    // RESULTS (LEADERBOARD) VIEW
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center space-y-8 sm:space-y-10 pb-32">
            <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase">
                    TABLA DE POSICIONES
                </h2>
                <div className="h-1 w-20 bg-red-600 mx-auto rounded-full" />
            </div>

            <div className="w-full max-w-md space-y-2">
                {players.sort((a, b) => b.score - a.score).map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center justify-between p-5 rounded-2xl border ${i === 0 ? 'bg-zinc-100 border-white text-black ring-4 ring-yellow-500/20' : 'bg-zinc-900/50 border-zinc-800 text-white'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-black opacity-30">#{i + 1}</span>
                            <span className="font-bold text-lg">{p.name} {p.id === currentPlayer?.id && '(Tú)'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black">{p.score}</span>
                            <span className="text-[10px] font-bold uppercase opacity-50 tracking-tighter">pts</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {(isCzar || currentPlayer?.is_host) && (
                <button
                    onClick={onNextRound}
                    className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-xl shadow-red-900/20"
                >
                    OTRA RONDA
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            )}
        </div>
    );
}
