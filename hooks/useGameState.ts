'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { Room, Player, Selection, GameState, BlackCard } from '@/types/game';
import deckData from '@/data/deck.json';
import _ from 'lodash';

export function useGameState(roomCode: string, playerName?: string) {
    const [room, setRoom] = useState<Room | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [selections, setSelections] = useState<Selection[]>([]);
    const [hand, setHand] = useState<string[]>([]);
    const [blackCard, setBlackCard] = useState<BlackCard | null>(null);
    const [loading, setLoading] = useState(true);

    // Derive current player from players list to ensure real-time score updates
    const currentPlayer = useMemo(() => {
        return players.find(p => p.name === playerName) || null;
    }, [players, playerName]);

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

            if (playerName && !playersData?.some(p => p.name === playerName)) {
                // Join room logic only if not already in list
                await supabase
                    .from('players')
                    .insert({
                        name: playerName,
                        room_id: roomData.id,
                        is_host: playersData?.length === 0
                    });
                // The subscription will pick up the new player and update 'players' state
            }
        }
        setLoading(false);
    }, [roomCode, playerName]);

    useEffect(() => {
        fetchState();
    }, [fetchState]);

    useEffect(() => {
        if (!room?.id) return;

        const roomSubscription = supabase
            .channel(`game:${roomCode}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
                (payload) => {
                    if (payload.new) {
                        const newRoom = payload.new as Room;
                        setRoom(newRoom);
                        if (newRoom.black_card_id) {
                            setBlackCard(deckData.blackCards.find(c => c.id === newRoom.black_card_id) || null);
                        }
                        // Aggressive fetch for consistency when room itself changes
                        fetchState();
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${room.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setPlayers(prev => [...prev.filter(p => p.id !== payload.new.id), payload.new as Player]);
                    } else if (payload.eventType === 'UPDATE') {
                        setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new as Player : p));
                    } else if (payload.eventType === 'DELETE') {
                        setPlayers(prev => {
                            const newPlayers = prev.filter(p => p.id !== payload.old.id);
                            // Host migration: if previous host left, assign new one
                            if (newPlayers.length > 0 && !newPlayers.some(p => p.is_host)) {
                                const nextHostId = newPlayers[0].id;
                                supabase.from('players').update({ is_host: true }).eq('id', nextHostId).then();
                            }
                            return newPlayers;
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'selections', filter: `room_id=eq.${room.id}` },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setSelections(prev => [...prev.filter(s => s.id !== payload.new.id), payload.new as Selection]);
                    } else if (payload.eventType === 'UPDATE') {
                        setSelections(prev => prev.map(s => s.id === payload.new.id ? payload.new as Selection : s));
                    } else if (payload.eventType === 'DELETE') {
                        if (payload.old && payload.old.id) {
                            setSelections(prev => prev.filter(s => s.id !== payload.old.id));
                        } else {
                            fetchState();
                        }
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Realtime synced for room:', roomCode);
                    // Resolve loading only once we have room and players
                    if (room && (!playerName || players.some(p => p.name === playerName))) {
                        setLoading(false);
                    }
                }
            });

        return () => {
            supabase.removeChannel(roomSubscription);
        };
    }, [roomCode, room?.id, fetchState]);

    // Force local reset when state changes to SELECTION to ensure "automatic reload" feel
    useEffect(() => {
        if (room?.state === 'SELECTION') {
            setSelections([]);
        }
    }, [room?.state]);

    const startGame = async () => {
        console.log('startGame triggered. Room:', room?.id, 'IsHost:', currentPlayer?.is_host, 'Players count:', players.length);
        if (!room || !currentPlayer?.is_host) {
            console.warn('startGame aborted: Room or Host missing');
            return;
        }

        if (players.length < 2) {
            console.warn('startGame aborted: Not enough players');
            return;
        }

        try {
            const randomBlackCard = _.sample(deckData.blackCards);
            const randomCzar = _.sample(players);

            if (!randomBlackCard || !randomCzar) {
                console.error('Failed to select random black card or czar');
                return;
            }

            console.log('Starting game with BlackCard:', randomBlackCard.id, 'Czar:', randomCzar.name);

            const { error } = await supabase
                .from('rooms')
                .update({
                    state: 'SELECTION',
                    black_card_id: randomBlackCard?.id,
                    czar_id: randomCzar?.id
                })
                .eq('id', room.id);

            if (error) throw error;
            console.log('Game started successfully in database');
        } catch (err) {
            console.error('Error starting game:', err);
        }
    };

    const selectCard = async (whiteCardIndex: number) => {
        if (!room || !currentPlayer || room.state !== 'SELECTION' || currentPlayer.id === room.czar_id) {
            console.warn('selectCard aborted: Invalid state or user is Czar');
            return;
        }

        // Check if already selected
        const alreadySelected = selections.some(s => s.player_id === currentPlayer.id);
        if (alreadySelected) {
            console.warn('selectCard aborted: Already selected');
            return;
        }

        try {
            const selectedCard = hand[whiteCardIndex];
            const cardId = deckData.whiteCards.indexOf(selectedCard);

            console.log('User selecting card:', selectedCard);

            const { error } = await supabase
                .from('selections')
                .insert({
                    player_id: currentPlayer.id,
                    room_id: room.id,
                    white_card_id: cardId
                });

            if (error) throw error;

            // Remove from hand and replace
            const newHand = [...hand];
            newHand.splice(whiteCardIndex, 1, _.sample(deckData.whiteCards)!);
            setHand(newHand);

            // Check if all players (except Czar) have selected
            const { data: currentPlayers } = await supabase.from('players').select('id').eq('room_id', room.id);
            const { data: currentSelections } = await supabase.from('selections').select('id').eq('room_id', room.id);

            if (currentPlayers && currentSelections && currentSelections.length === currentPlayers.length - 1) {
                console.log('All players selected. Moving to JUDGING phase.');
                await supabase.from('rooms').update({ state: 'JUDGING' }).eq('id', room.id);
            }
        } catch (err) {
            console.error('Error in selectCard:', err);
        }
    };

    const pickWinner = async (selectionId: string) => {
        if (!room || currentPlayer?.id !== room.czar_id || room.state !== 'JUDGING') {
            console.warn('pickWinner aborted: Not Czar or not JUDGING phase');
            return;
        }

        console.log('Czar picking winner selection:', selectionId);

        try {
            const winnerSelection = selections.find(s => s.id === selectionId);
            if (!winnerSelection) {
                console.error('Winner selection not found locally');
                return;
            }

            // Update winner score and room state in a single move for fluidity
            const { data: winnerPlayer, error: fetchError } = await supabase
                .from('players')
                .select('score')
                .eq('id', winnerSelection.player_id)
                .single();

            if (fetchError) throw fetchError;

            if (winnerPlayer) {
                const { error: scoreError } = await supabase
                    .from('players')
                    .update({ score: winnerPlayer.score + 1 })
                    .eq('id', winnerSelection.player_id);
                if (scoreError) throw scoreError;
            }

            const { error: roomError } = await supabase
                .from('rooms')
                .update({
                    state: 'REVEAL',
                    winner_id: winnerSelection.player_id,
                    winning_selection_id: winnerSelection.id
                })
                .eq('id', room.id);

            if (roomError) throw roomError;
            console.log('Winner picked successfully');
        } catch (err) {
            console.error('Error in pickWinner:', err);
        }
    };

    const showScores = async () => {
        if (!room || currentPlayer?.id !== room.czar_id || room.state !== 'REVEAL') {
            console.warn('showScores aborted: Not Czar or not REVEAL phase');
            return;
        }

        try {
            console.log('Showing scores...');
            const { error } = await supabase
                .from('rooms')
                .update({ state: 'RESULTS' })
                .eq('id', room.id);
            if (error) throw error;
        } catch (err) {
            console.error('Error in showScores:', err);
        }
    };

    const nextRound = async () => {
        const isCzar = currentPlayer?.id === room?.czar_id;
        if (!room || (!currentPlayer?.is_host && !isCzar)) return;

        try {
            // 1. Delete selections for new round first
            await supabase.from('selections').delete().eq('room_id', room.id);

            // 2. Fetch latest players to ensure rotation is accurate
            const { data: latestPlayers } = await supabase
                .from('players')
                .select('*')
                .eq('room_id', room.id);

            const currentPlayersList = (latestPlayers && latestPlayers.length > 0) ? latestPlayers : players;

            if (currentPlayersList.length === 0) return;

            // 3. Rotate Czar
            const currentIndex = currentPlayersList.findIndex(p => p.id === room.czar_id);
            const nextCzarIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % currentPlayersList.length;
            const nextCzar = currentPlayersList[nextCzarIndex];

            // 4. New black card
            const randomBlackCard = _.sample(deckData.blackCards);

            // 5. Update room
            await supabase
                .from('rooms')
                .update({
                    state: 'SELECTION',
                    black_card_id: randomBlackCard?.id,
                    czar_id: nextCzar.id,
                    winner_id: null,
                    winning_selection_id: null
                })
                .eq('id', room.id);

            // The room update will trigger a state change to SELECTION,
            // which in turn triggers the clear selections useEffect for everyone.
        } catch (error) {
            console.error('Error in nextRound:', error);
        }
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
        showScores,
        nextRound
    };
}
