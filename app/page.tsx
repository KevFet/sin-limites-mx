'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { motion } from 'framer-motion';
import { Play, Plus, Zap } from 'lucide-react';

export default function Home() {
    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const router = useRouter();

    const createRoom = async () => {
        if (!playerName) return alert('Ponte un nombre, valedor');
        setIsCreating(true);

        try {
            // Generate 5-letter code
            const code = Math.random().toString(36).substring(2, 7).toUpperCase();

            const { data: room, error } = await supabase
                .from('rooms')
                .insert({ code, state: 'LOBBY' })
                .select()
                .single();

            if (error) throw error;

            if (room) {
                // Store player name in session storage
                sessionStorage.setItem('playerName', playerName);
                router.push(`/game/${code}`);
            }
        } catch (err: any) {
            console.error('Error al crear sala:', err);
            alert(`No se pudo crear la sala: ${err.message || 'Error desconocido'}. Revisa tus claves de Supabase.`);
        } finally {
            setIsCreating(false);
        }
    };

    const joinRoom = async () => {
        if (!playerName || !roomCode) return alert('Llena todo, no seas flojo');

        try {
            const { data: room, error } = await supabase
                .from('rooms')
                .select('code')
                .eq('code', roomCode.toUpperCase())
                .single();

            if (error) throw error;

            if (room) {
                sessionStorage.setItem('playerName', playerName);
                router.push(`/game/${room.code}`);
            } else {
                alert('Esa sala ni existe, carnal');
            }
        } catch (err: any) {
            console.error('Error al unirse:', err);
            alert(`No se pudo unir: ${err.message || 'Error desconocido'}`);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-white overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/20 blur-[120px] rounded-full -z-10" />

            <div className="w-full max-w-sm space-y-12">
                <header className="text-center space-y-4">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-red-500 shadow-xl"
                    >
                        <Zap size={14} fill="currentColor" />
                        Edición Mexicana
                    </motion.div>

                    <motion.h1
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-black italic tracking-tighter leading-none uppercase"
                    >
                        Sin Límites <br />
                        <span className="text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.4)]">MX</span>
                    </motion.h1>
                    <p className="text-zinc-500 font-medium">El juego que tus tías prohibirían.</p>
                </header>

                <section className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Tu Apodo</label>
                            <input
                                type="text"
                                placeholder="Ej. El Bicho"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder:text-zinc-700"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-4">
                            <button
                                onClick={createRoom}
                                disabled={isCreating}
                                className="group flex items-center justify-center gap-3 bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                            >
                                <Plus size={20} strokeWidth={3} />
                                CREAR SALA
                            </button>

                            <div className="relative py-4 flex items-center gap-4">
                                <div className="h-px bg-zinc-800 flex-1" />
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">O únete a una</span>
                                <div className="h-px bg-zinc-800 flex-1" />
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="CÓDIGO"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    maxLength={5}
                                    className="w-1/2 bg-zinc-900 border-2 border-zinc-800 rounded-2xl px-4 py-4 text-center text-white font-black tracking-[0.2em] focus:border-zinc-600 focus:outline-none transition-colors placeholder:text-zinc-700"
                                />
                                <button
                                    onClick={joinRoom}
                                    className="w-1/2 flex items-center justify-center gap-2 bg-zinc-800 text-white font-black py-4 rounded-2xl hover:bg-zinc-700 transition-all active:scale-95"
                                >
                                    <Play size={18} fill="currentColor" />
                                    ENTRAR
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="text-center">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                        Hecho con pura sazón mexa 🇲🇽
                    </p>
                </footer>
            </div>
        </main>
    );
}
