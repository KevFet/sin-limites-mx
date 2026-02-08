'use client';

import { Player, Selection, BlackCard } from '@/types/game';
import deckData from '@/data/deck.json';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight } from 'lucide-react';

interface ResultsProps {
    players: Player[];
    selections: Selection[];
    blackCard: BlackCard | null;
    currentPlayer: Player | null;
    onNextRound: () => void;
}

export function Results({ players, selections, blackCard, currentPlayer, onNextRound }: ResultsProps) {
    // In a real app we'd store the round winner in the DB, 
    // for now let's assume the last selection added was the winner or just show all
    // To keep it simple for this MVP, we show the scores and a "Next Round" button

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center space-y-12">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-4 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                    <Trophy size={40} className="text-black" />
                </div>
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">
                    ¡Tenemos Ganador!
                </h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest">Resultados de la ronda</p>
            </motion.div>

            <div className="w-full max-w-md space-y-3">
                {players.sort((a, b) => b.score - a.score).map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center justify-between p-5 rounded-2xl border ${i === 0 ? 'bg-zinc-100 border-white text-black' : 'bg-zinc-900/50 border-zinc-800 text-white'
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

            {currentPlayer?.is_host && (
                <button
                    onClick={onNextRound}
                    className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-5 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-xl shadow-red-900/20"
                >
                    SIGUIENTE RONDA
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            )}
        </div>
    );
}
