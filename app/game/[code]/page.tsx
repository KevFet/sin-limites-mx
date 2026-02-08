'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { Lobby } from '@/components/Lobby';
import { GameBoard } from '@/components/GameBoard';
import { Results } from '@/components/Results';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameRoom() {
    const { code } = useParams();
    const router = useRouter();
    const [playerName, setPlayerName] = useState<string | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('playerName');
        if (!stored) {
            router.push('/');
        } else {
            setPlayerName(stored);
        }
    }, [router]);

    const {
        room,
        players,
        currentPlayer,
        selections,
        hand,
        blackCard,
        loading,
        startGame,
        selectCard,
        pickWinner,
        showScores,
        nextRound
    } = useGameState(code as string, playerName || undefined);

    if (loading || !room) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 font-black uppercase tracking-widest animate-pulse">Cargando desmadre...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
            <AnimatePresence mode="wait">
                <motion.div
                    key={room.state}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="container mx-auto"
                >
                    {room.state === 'LOBBY' && (
                        <Lobby
                            room={room}
                            players={players}
                            currentPlayer={currentPlayer}
                            onStart={startGame}
                        />
                    )}

                    {(room.state === 'SELECTION' || room.state === 'JUDGING') && (
                        <GameBoard
                            room={room}
                            currentPlayer={currentPlayer}
                            players={players}
                            blackCard={blackCard}
                            hand={hand}
                            selections={selections}
                            onSelect={selectCard}
                            onPickWinner={pickWinner}
                        />
                    )}

                    {(room.state === 'REVEAL' || room.state === 'RESULTS') && (
                        <Results
                            room={room}
                            players={players}
                            selections={selections}
                            blackCard={blackCard}
                            currentPlayer={currentPlayer}
                            onNextRound={nextRound}
                            onShowScores={showScores}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </main>
    );
}
