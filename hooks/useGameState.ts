'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { Room, Player, Selection, GameState, BlackCard } from '@/types/game';
import deckData from '@/data/deck.json';
import _ from 'lodash';

export function useGameState(roomCode: string, playerName?: string) {
    const [room, setRoom] = useState<Room | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
    const [selections, setSelections] = useState<Selection[]>([]);
    const [hand, setHand] = useState<string[]>([]);
    const [blackCard, setBlackCard] = useState<BlackCard | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize hand
    useEffect(() => {
        if (hand.length === 0) {
            setHand(_.sampleSize(deckData.whiteCards, 10));
        }
    }, [hand.length]);

    // Fetch initial state
    const fetchState = useCallback(async () => {
        const { data: roomData } = await supabase
            .from('rooms')
            .select('*')
            .eq('code', roomCode)
            .single();

        if (roomData) {
            setRoom(roomData);
            if (roomData.black_card_id) {
                setBlackCard(deckData.blackCards.find(c => c.id === roomData.black_card_id) || null);
            }

            const { data: playersData } = await supabase
                .from('players')
                .select('*')
                .eq('room_id', roomData.id);

            if (playersData) setPlayers(playersData);

            const { data: selectionsData } = await supabase
                .from('selections')
                .select('*')
                .eq('room_id', roomData.id);

            if (selectionsData) setSelections(selectionsData);

            if (playerName) {
                const existingPlayer = playersData?.find(p => p.name === playerName);
                if (existingPlayer) {
                    setCurrentPlayer(existingPlayer);
                } else {
                    // Join room logic
                    const { data: newPlayer } = await supabase
                        .from('players')
                        .insert({
                            name: playerName,
                            room_id: roomData.id,
                            is_host: playersData?.length === 0
                        })
                        .select()
                        .single();
                    if (newPlayer) setCurrentPlayer(newPlayer);
                }
            }
        }
        setLoading(false);
    }, [roomCode, playerName]);

    useEffect(() => {
        fetchState();

        const roomSubscription = supabase
            .channel('room-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${roomCode}` }, (payload) => {
                const newRoom = payload.new as Room;
                setRoom(newRoom);
                if (newRoom.black_card_id) {
                    setBlackCard(deckData.blackCards.find(c => c.id === newRoom.black_card_id) || null);
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
                // Simple refresh for now
                fetchState();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'selections' }, () => {
                fetchState();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(roomSubscription);
        };
    }, [roomCode, fetchState]);

    const startGame = async () => {
        if (!room || !currentPlayer?.is_host) return;

        const randomBlackCard = _.sample(deckData.blackCards);
        const randomCzar = _.sample(players);

        await supabase
            .from('rooms')
            .update({
                state: 'SELECTION',
                black_card_id: randomBlackCard?.id,
                czar_id: randomCzar?.id
            })
            .eq('id', room.id);
    };

    const selectCard = async (whiteCardIndex: number) => {
        if (!room || !currentPlayer || room.state !== 'SELECTION' || currentPlayer.id === room.czar_id) return;

        // Check if already selected
        const alreadySelected = selections.some(s => s.player_id === currentPlayer.id);
        if (alreadySelected) return;

        const selectedCard = hand[whiteCardIndex];
        const cardId = deckData.whiteCards.indexOf(selectedCard);

        await supabase
            .from('selections')
            .insert({
                player_id: currentPlayer.id,
                room_id: room.id,
                white_card_id: cardId
            });

        // Remove from hand and replace
        const newHand = [...hand];
        newHand.splice(whiteCardIndex, 1, _.sample(deckData.whiteCards)!);
        setHand(newHand);

        // Check if all players (except Czar) have selected
        const { data: currentPlayers } = await supabase.from('players').select('id').eq('room_id', room.id);
        const { data: currentSelections } = await supabase.from('selections').select('id').eq('room_id', room.id);

        if (currentPlayers && currentSelections && currentSelections.length === currentPlayers.length - 1) {
            await supabase.from('rooms').update({ state: 'JUDGING' }).eq('id', room.id);
        }
    };

    const pickWinner = async (selectionId: string) => {
        if (!room || currentPlayer?.id !== room.czar_id || room.state !== 'JUDGING') return;

        const winnerSelection = selections.find(s => s.id === selectionId);
        if (!winnerSelection) return;

        // Update winner score
        const { data: winnerPlayer } = await supabase
            .from('players')
            .select('score')
            .eq('id', winnerSelection.player_id)
            .single();

        if (winnerPlayer) {
            await supabase
                .from('players')
                .update({ score: winnerPlayer.score + 1 })
                .eq('id', winnerSelection.player_id);
        }

        await supabase.from('rooms').update({ state: 'RESULTS' }).eq('id', room.id);
    };

    const nextRound = async () => {
        if (!room || !currentPlayer?.is_host) return;

        // Delete selections
        await supabase.from('selections').delete().eq('room_id', room.id);

        // New black card
        const randomBlackCard = _.sample(deckData.blackCards);

        // Rotate Czar
        const currentIndex = players.findIndex(p => p.id === room.czar_id);
        const nextCzar = players[(currentIndex + 1) % players.length];

        await supabase
            .from('rooms')
            .update({
                state: 'SELECTION',
                black_card_id: randomBlackCard?.id,
                czar_id: nextCzar.id
            })
            .eq('id', room.id);
    };

    return {
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
        nextRound
    };
}
