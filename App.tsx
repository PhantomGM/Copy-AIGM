
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    CharacterSheet,
    GameSettings,
    Thread,
    Character,
    ListItem,
    RandomEvent,
    PendingCheck,
    TranscriptionEntry,
    Monster,
    EncounterMonster,
    Combatant,
    CharacterAttributes,
} from './types';
import {
    getChatResponse,
    getElaboration,
    getSceneSuggestion,
    interpretEvent,
    describeCharacter,
    ai,
    getSystemInstruction,
    createBlob,
    decode,
    decodeAudioData,
} from './services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';
import { getInitialCharacterSheet, recalculateStats, calculateModifier, parseAndRoll } from './services/onePage5e';
import { FATE_CHART, EVENT_FOCUS_TABLE, MEANING_TABLES, SCENE_ADJUSTMENT_TABLE, GM_TONES } from './constants';

import Header from './components/Header';
import Tabs from './components/Tabs';
import PlayTab from './components/PlayTab';
import ThreadsTab from './components/ThreadsTab';
import CharactersTab from './components/CharactersTab';
import PartyTab from './components/PartyTab';
import MonstersTab from './components/MonstersTab';
import SettingsTab from './components/SettingsTab';
import EventModal from './components/EventModal';
import EndSceneModal from './components/EndSceneModal';
import CharacterInfoTab from './components/CharacterInfoTab';
import CharacterCreationModal from './components/CharacterCreationModal';
import EncountersTab from './components/EncountersTab';


type TabName = 'Play' | 'Character Info' | 'Threads' | 'Characters' | 'Party' | 'Monsters' | 'Encounters' | 'Settings';
type ItemManagerType = 'thread' | 'character' | 'party' | 'weapon' | 'armor' | 'spell' | 'inventory';


const App: React.FC = () => {
    // State
    const [activeTab, setActiveTab] = useState<TabName>('Play');
    const [characterSheet, setCharacterSheet] = useState<CharacterSheet>(getInitialCharacterSheet());
    const [threads, setThreads] = useState<Thread[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [party, setParty] = useState<Character[]>([]);
    const [journal, setJournal] = useState('');
    const [chaosFactor, setChaosFactor] = useState(5);
    const [expectedScene, setExpectedScene] = useState('');
    const [gameSettings, setGameSettings] = useState<GameSettings>({
        genres: ['Fantasy'],
        gmTone: GM_TONES[0],
        gameplayFocus: ['Role-Playing'],
        lines: '',
        veils: '',
    });
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [randomEvent, setRandomEvent] = useState<RandomEvent | null>(null);
    const [showEndSceneModal, setShowEndSceneModal] = useState(false);
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [pendingCheck, setPendingCheck] = useState<PendingCheck | null>(null);

    // Combat & Encounter State
    const [isInCombat, setIsInCombat] = useState(false);
    const [encounter, setEncounter] = useState<EncounterMonster[]>([]);
    const [combatants, setCombatants] = useState<Combatant[]>([]);
    const [turnIndex, setTurnIndex] = useState(0);
    const [round, setRound] = useState(1);

    // Voice Chat State
    const [isVoiceSessionActive, setIsVoiceSessionActive] = useState(false);
    const [isConnectingVoice, setIsConnectingVoice] = useState(false);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionEntry[]>([]);
    const [interimUserScript, setInterimUserScript] = useState('');
    const [interimAssistantScript, setInterimAssistantScript] = useState('');
    
    // Voice Chat Refs
    const sessionRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const interimUserScriptRef = useRef('');
    const interimAssistantScriptRef = useRef('');


    const journalRef = useRef<HTMLTextAreaElement>(null);

    // Effects
    useEffect(() => {
        if (journalRef.current) {
            journalRef.current.scrollTop = journalRef.current.scrollHeight;
        }
    }, [journal]);

    useEffect(() => {
        setCharacterSheet(recalculateStats(characterSheet));
    }, [characterSheet.attributes, characterSheet.level, characterSheet.armor]);


    // Helper Functions
    const logToJournal = useCallback((text: string, isGmResponse = false) => {
        const prefix = isGmResponse ? 'GM: ' : '';
        setJournal(prev => `${prev}${prefix}${text}\n\n`);
    }, []);

    const setLoading = (key: string, value: boolean) => {
        setIsLoading(prev => ({ ...prev, [key]: value }));
    };

    // Speech Synthesis
    const speakText = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            const cleanedText = (text || '').replace(/^(GM: |PC: )/,'').replace(/\*/g, '').replace(/--/g, '').trim();
            if (cleanedText) {
                window.speechSynthesis.cancel(); // Stop any previous speech
                const utterance = new SpeechSynthesisUtterance(cleanedText);
                window.speechSynthesis.speak(utterance);
            }
        }
    }, []);

    const stopSpeaking = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);


    // Voice Chat Logic
    const stopVoiceSession = useCallback(() => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        outputSourcesRef.current.forEach(source => source.stop());
        outputSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        
        stopSpeaking();
        setIsVoiceSessionActive(false);
        setIsConnectingVoice(false);
        setInterimUserScript('');
        setInterimAssistantScript('');
    }, [stopSpeaking]);

    const startVoiceSession = useCallback(async () => {
        if (isVoiceSessionActive || isConnectingVoice) return;
        
        stopSpeaking(); // Ensure browser TTS is stopped
        setIsConnectingVoice(true);
        setTranscriptionHistory([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext)({ sampleRate: 24000 });

            const systemInstruction = getSystemInstruction(gameSettings, characterSheet, threads, characters);

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnectingVoice(false);
                        setIsVoiceSessionActive(true);

                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Transcription
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setInterimUserScript(prev => prev + text);
                            interimUserScriptRef.current += text;
                        } else if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            setInterimAssistantScript(prev => prev + text);
                            interimAssistantScriptRef.current += text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const userTurn = interimUserScriptRef.current;
                            const assistantTurn = interimAssistantScriptRef.current;
                            
                            if (userTurn) {
                                setTranscriptionHistory(prev => [...prev, { speaker: 'user', text: userTurn }]);
                                logToJournal(`PC (voice): ${userTurn}`);
                            }
                            if (assistantTurn) {
                                setTranscriptionHistory(prev => [...prev, { speaker: 'assistant', text: assistantTurn }]);
                                logToJournal(`GM (voice): ${assistantTurn}`, true);
                            }
                            
                            setInterimUserScript('');
                            setInterimAssistantScript('');
                            interimUserScriptRef.current = '';
                            interimAssistantScriptRef.current = '';
                        }
                        
                        // Handle Audio Output
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            const outputCtx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => {
                                outputSourcesRef.current.delete(source);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            outputSourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            outputSourcesRef.current.forEach(source => source.stop());
                            outputSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Voice session error:", e);
                        logToJournal("-- Voice chat error. Session ended. --");
                        stopVoiceSession();
                    },
                    onclose: (e: CloseEvent) => {
                        stopVoiceSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: systemInstruction,
                },
            });
            sessionRef.current = await sessionPromise;

        } catch (error) {
            console.error("Failed to start voice session:", error);
            logToJournal("-- Could not start voice session. Check microphone permissions. --");
            stopVoiceSession();
        }

    }, [gameSettings, characterSheet, threads, characters, isVoiceSessionActive, isConnectingVoice, logToJournal, stopVoiceSession, stopSpeaking]);


    const handleToggleVoiceSession = () => {
        if (isVoiceSessionActive) {
            stopVoiceSession();
        } else {
            startVoiceSession();
        }
    };

    // Handlers
    const handleChatSubmit = async (input: string) => {
        logToJournal(`PC: ${input}`);
        setLoading('chat', true);
        const response = await getChatResponse(gameSettings, characterSheet, threads, characters, journal, input);
        
        try {
            const parsed = JSON.parse(response);
            if (parsed.requires_check) {
                 const gmMessage = `A check is required for '${parsed.requires_check.action}'. Please roll a ${parsed.requires_check.proficiency} check.`;
                setPendingCheck(parsed.requires_check);
                logToJournal(`GM: ${gmMessage}`, true);
                speakText(gmMessage);
            } else {
                 logToJournal(response, true);
                 speakText(response);
            }
        } catch (e) {
             logToJournal(response, true);
             speakText(response);
        }

        setLoading('chat', false);
    };
    
    const handleResolveCheck = async (prof: string, rollResult: number) => {
        if (!pendingCheck) return;
        const success = rollResult >= pendingCheck.dc;
        const outcome = success ? "Success!" : "Failure.";
        logToJournal(`-- ${prof} Check: ${rollResult} vs DC ${pendingCheck.dc} -> ${outcome} --`);
        const newPrompt = `The player attempted to '${pendingCheck.action}' and the result was a ${outcome} (Rolled ${rollResult} vs DC ${pendingCheck.dc}). Describe what happens.`;
        setPendingCheck(null);
        setLoading('chat', true);
        const response = await getChatResponse(gameSettings, characterSheet, threads, characters, journal, newPrompt);
        logToJournal(response, true);
        speakText(response);
        setLoading('chat', false);
    };

    const handleAddItem = async (type: ItemManagerType, name: string, elaborate: boolean, details: Partial<Omit<ListItem, 'name'>> = {}) => {
        const loadingKey = `add-${type}`;
        setLoading(loadingKey, true);
        
        let description: string;
    
        if (elaborate) {
            description = await getElaboration(gameSettings, characterSheet, type, name, details.description);
        } else {
            description = details.description || `A newly discovered ${type}.`;
        }
    
        const newItem: ListItem = { name, description, ...details };

        switch (type) {
            case 'thread': setThreads(prev => [...prev, newItem]); break;
            case 'character': setCharacters(prev => [...prev, newItem]); break;
            case 'party': setParty(prev => [...prev, newItem]); break;
            case 'weapon': setCharacterSheet(prev => ({ ...prev, weapons: [...prev.weapons, newItem] })); break;
            case 'armor': setCharacterSheet(prev => ({ ...prev, armor: [...prev.armor, newItem] })); break;
            case 'spell': setCharacterSheet(prev => ({ ...prev, spells: [...prev.spells, newItem] })); break;
            case 'inventory': setCharacterSheet(prev => ({ ...prev, inventory: [...prev.inventory, newItem] })); break;
        }
        setLoading(loadingKey, false);
    };

    const handleRemoveItem = (type: ItemManagerType, index: number) => {
        switch (type) {
            case 'thread': setThreads(prev => prev.filter((_, i) => i !== index)); break;
            case 'character': setCharacters(prev => prev.filter((_, i) => i !== index)); break;
            case 'party': setParty(prev => prev.filter((_, i) => i !== index)); break;
            case 'weapon': setCharacterSheet(prev => ({ ...prev, weapons: prev.weapons.filter((_, i) => i !== index) })); break;
            case 'armor': setCharacterSheet(prev => ({ ...prev, armor: prev.armor.filter((_, i) => i !== index) })); break;
            case 'spell': setCharacterSheet(prev => ({ ...prev, spells: prev.spells.filter((_, i) => i !== index) })); break;
            case 'inventory': setCharacterSheet(prev => ({ ...prev, inventory: prev.inventory.filter((_, i) => i !== index) })); break;
        }
    };
    
    const handleDescribePc = async () => {
        if (!characterSheet.name) return;
        setLoading('pcDescription', true);
        const description = await describeCharacter(gameSettings, characterSheet.name);
        setCharacterSheet(p => ({...p, description}));
        setLoading('pcDescription', false);
    };

    const handleSuggestScene = async () => {
        setLoading('suggestScene', true);
        const suggestion = await getSceneSuggestion(gameSettings, characterSheet, threads, journal);
        setExpectedScene(suggestion);
        setLoading('suggestScene', false);
    };

    const handleTestScene = () => {
        if (!expectedScene.trim()) {
            const message = "-- SCENE START: The scene begins as expected. --";
            logToJournal(message);
            speakText("The scene begins as expected.");
            return;
        }

        const oddsOptions = Object.keys(FATE_CHART);
        const randomOdds = oddsOptions[Math.floor(Math.random() * oddsOptions.length)];
        const chaosRoll = Math.floor(Math.random() * 10) + 1;
        const [exceptionalYes, yes, exceptionalNo] = FATE_CHART[randomOdds][chaosFactor];
        
        let resultText = '';
        let spokenResult = '';
        const d100 = Math.floor(Math.random() * 100) + 1;

        if (d100 <= exceptionalYes) { resultText = "EXCEPTIONAL YES"; spokenResult = "Exceptional yes."; } 
        else if (d100 <= yes) { resultText = "YES"; spokenResult = "Yes.";} 
        else if (d100 >= exceptionalNo) { resultText = "EXCEPTIONAL NO"; spokenResult = "Exceptional no."; } 
        else { resultText = "NO"; spokenResult = "No."; }

        if (chaosRoll <= chaosFactor && d100 % 2 !== 0) { // Odd number on chaos roll
            resultText += ", and a RANDOM EVENT occurs.";
            spokenResult += " And a random event occurs.";
            triggerRandomEvent();
        }
        
        const fullResultLog = `(Test: "${expectedScene}" at Chaos ${chaosFactor}, Odds: ${randomOdds}, d100:${d100}) -> ${resultText}`;
        logToJournal(`-- ${fullResultLog} --`);
        logToJournal(`-- SCENE START: ${expectedScene} --`);

        if (resultText.includes("NO")) {
            const adjustment = SCENE_ADJUSTMENT_TABLE[chaosRoll - 1];
            logToJournal(`-- SCENE ADJUSTMENT: ${adjustment} --`);
            spokenResult += ` Scene adjustment: ${adjustment}`;
        }
        
        speakText(spokenResult);
        setExpectedScene('');
    };
    
    const triggerRandomEvent = () => {
        const d100_focus = Math.floor(Math.random() * 100) + 1;
        const focus = EVENT_FOCUS_TABLE.find(e => d100_focus >= e.range[0] && d100_focus <= e.range[1])?.value || "Current Context";
        const d100_action1 = Math.floor(Math.random() * 100);
        const d100_action2 = Math.floor(Math.random() * 100);
        const action1 = MEANING_TABLES.actions1[d100_action1];
        const action2 = MEANING_TABLES.actions2[d100_action2];
        setRandomEvent({ focus, meaning: `${action1} ${action2}` });
    };

    const handleInterpretEvent = async () => {
        if (!randomEvent) return;
        setLoading('interpretEvent', true);
        const interpretation = await interpretEvent(gameSettings, characterSheet, journal, randomEvent.focus, randomEvent.meaning);
        setRandomEvent(prev => prev ? { ...prev, interpretation } : null);
        setLoading('interpretEvent', false);
    };
    
    const handleCloseEventModal = () => {
        if (randomEvent?.interpretation) {
            logToJournal(`-- RANDOM EVENT: ${randomEvent.focus} (${randomEvent.meaning}) --\n${randomEvent.interpretation}`);
            speakText(`A random event occurred: ${randomEvent.interpretation}`);
        }
        setRandomEvent(null);
    };
    
    const handleEndScene = () => setShowEndSceneModal(true);

    const handleConfirmEndScene = (wasInControl: boolean) => {
        let message = "";
        if (wasInControl && chaosFactor > 1) {
            setChaosFactor(cf => cf - 1);
            message = "-- END OF SCENE: The PC was in control. Chaos Factor decreases. --";
        } else if (!wasInControl && chaosFactor < 9) {
            setChaosFactor(cf => cf + 1);
            message = "-- END OF SCENE: The PC was not in control. Chaos Factor increases. --";
        } else {
            message = "-- END OF SCENE --";
        }
        logToJournal(message);
        speakText(message);
        setShowEndSceneModal(false);
        setIsInCombat(false);
        setCombatants([]);
    };

    // Encounter & Combat Handlers
    const handleAddMonsterToEncounter = (monster: Monster) => {
        setEncounter(prev => {
            const existing = prev.find(em => em.monster.name === monster.name);
            if (existing) {
                return prev.map(em => em.monster.name === monster.name ? { ...em, quantity: em.quantity + 1 } : em);
            }
            return [...prev, { monster, quantity: 1 }];
        });
    };

    const handleUpdateMonsterQuantity = (monsterName: string, change: number) => {
        setEncounter(prev => prev.map(em => em.monster.name === monsterName ? { ...em, quantity: Math.max(0, em.quantity + change) } : em).filter(em => em.quantity > 0));
    };

    const handleRemoveMonsterFromEncounter = (monsterName: string) => {
        setEncounter(prev => prev.filter(em => em.monster.name !== monsterName));
    };
    
    const handleClearEncounter = () => setEncounter([]);

    const handleStartCombat = () => {
        if (encounter.length === 0) return;
        const monsterCombatants: Combatant[] = encounter.flatMap(em => 
            Array.from({ length: em.quantity }, (_, i) => ({
                id: `${em.monster.name.toLowerCase().replace(/\s/g, '-')}-${i + 1}-${Date.now()}`,
                name: `${em.monster.name}${em.quantity > 1 ? ` ${i + 1}` : ''}`,
                currentHp: em.monster.hp, maxHp: em.monster.hp, ac: em.monster.ac,
                initiative: Math.floor(Math.random() * 20) + 1,
                attack: em.monster.attack, isPlayer: false,
            }))
        );
        const playerCombatant: Combatant = {
            id: 'player-character', name: characterSheet.name || 'Player',
            currentHp: characterSheet.hp, maxHp: characterSheet.maxHp, ac: characterSheet.ac,
            initiative: Math.floor(Math.random() * 20) + 1 + characterSheet.initiative,
            isPlayer: true,
        };
        const allCombatants = [...monsterCombatants, playerCombatant].sort((a, b) => b.initiative - a.initiative);

        setCombatants(allCombatants);
        setIsInCombat(true);
        setTurnIndex(0);
        setRound(1);
        
        let log = '-- COMBAT STARTED! INITIATIVE ORDER --';
        allCombatants.forEach((c, index) => { log += `\n${index + 1}. ${c.name} (${c.initiative})`; });
        logToJournal(log);
        
        setActiveTab('Play');
    };
    
    const handleNextTurn = () => {
        const livingCombatants = combatants.filter(c => c.currentHp > 0);
        if (livingCombatants.length <= 1) {
            setIsInCombat(false);
            logToJournal("-- Combat has ended. --");
            return;
        }
        let newIndex = turnIndex + 1;
        if (newIndex >= combatants.length) {
            newIndex = 0;
            const newRound = round + 1;
            setRound(newRound);
            logToJournal(`-- Round ${newRound} begins --`);
        }
        setTurnIndex(newIndex);
    };

    const handleApplyDamage = (targetId: string, damage: number) => {
        let targetIsDefeated = false;
        const newCombatants = combatants.map(c => {
            if (c.id === targetId) {
                const newHp = c.currentHp - damage;
                if (newHp <= 0) targetIsDefeated = true;
                return { ...c, currentHp: Math.max(0, newHp) };
            }
            return c;
        });
        const target = newCombatants.find(c => c.id === targetId);
        logToJournal(`${target?.name} takes ${damage} damage.`);

        if (targetIsDefeated) {
            logToJournal(`${target?.name} has been defeated!`);
        }
        setCombatants(newCombatants);

        const remainingMonsters = newCombatants.filter(c => !c.isPlayer && c.currentHp > 0).length;
        if (remainingMonsters === 0) {
            logToJournal("-- All monsters defeated! Combat ends. --");
            setIsInCombat(false);
        }
    };

    const handlePlayerAttack = (weapon: ListItem, targetId: string) => {
        const target = combatants.find(c => c.id === targetId);
        if (!target || !weapon.attackStat) return;

        const modifier = calculateModifier(characterSheet.attributes[weapon.attackStat as keyof CharacterAttributes]);
        const proficiency = characterSheet.proficiency;
        const attackBonus = modifier + proficiency;
        const d20 = Math.floor(Math.random() * 20) + 1;
        const attackTotal = d20 + attackBonus;

        let log = `-- ${characterSheet.name} attacks ${target.name} with ${weapon.name}! --`;
        log += `\nAttack Roll: ${attackTotal} (d20:${d20} + ${modifier}[mod] + ${proficiency}[prof]) vs AC ${target.ac}`;

        if (attackTotal >= target.ac || d20 === 20) {
            log += ` -> HIT!`;
            const damageStrMatch = weapon.description.match(/Dmg:\s*([^\s|]+)/);
            const damageStr = damageStrMatch ? damageStrMatch[1] : null;

            if (damageStr) {
                const damageResult = parseAndRoll(damageStr);
                if (damageResult) {
                    let damage = damageResult.total;
                    if(d20 === 20) { // Critical Hit
                        damage += damageResult.total; // Simple double damage
                        log += ' CRITICAL HIT!';
                    }
                    log += `\nDamage Roll (${damageStr}): ${damage} [${damageResult.rolls.join(', ')}]`;
                    handleApplyDamage(targetId, damage);
                }
            }
        } else {
            log += ` -> MISS!`;
        }
        logToJournal(log);
    };
    
    const handleUpdatePlayerHP = (newHp: number) => {
        const clampedHp = Math.max(0, Math.min(newHp, characterSheet.maxHp));
        setCharacterSheet(prev => ({ ...prev, hp: clampedHp }));
        setCombatants(prev => prev.map(c => c.isPlayer ? { ...c, currentHp: clampedHp } : c));
        if (clampedHp === 0) {
            logToJournal(`-- ${characterSheet.name} has been defeated! --`);
        }
    };

    const handleSaveGame = () => {
        const gameState = {
            characterSheet, threads, characters, party, journal, chaosFactor, gameSettings, activeTab, isInCombat,
            encounter, combatants, turnIndex, round
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `mythic-save-${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleLoadGame = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const loadedState = JSON.parse(text);
                    setCharacterSheet(loadedState.characterSheet || getInitialCharacterSheet());
                    setThreads(loadedState.threads || []);
                    setCharacters(loadedState.characters || []);
                    setParty(loadedState.party || []);
                    setJournal(loadedState.journal || '');
                    setChaosFactor(loadedState.chaosFactor || 5);
                    setGameSettings(loadedState.gameSettings || gameSettings);
                    setActiveTab(loadedState.activeTab || 'Play');
                    setIsInCombat(loadedState.isInCombat || false);
                    setEncounter(loadedState.encounter || []);
                    setCombatants(loadedState.combatants || []);
                    setTurnIndex(loadedState.turnIndex || 0);
                    setRound(loadedState.round || 1);
                    logToJournal("-- Game Loaded Successfully --");
                }
            } catch (error) {
                console.error("Failed to load game state:", error);
                alert("Failed to load game state. The file might be corrupted.");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    // Render Logic
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Play':
                return <PlayTab
                    characterSheet={characterSheet}
                    chaosFactor={chaosFactor} setChaosFactor={setChaosFactor}
                    expectedScene={expectedScene} setExpectedScene={setExpectedScene}
                    onSuggestScene={handleSuggestScene} onTestScene={handleTestScene} onEndScene={handleEndScene}
                    journal={journal} journalRef={journalRef} onChatSubmit={handleChatSubmit}
                    isLoading={isLoading} logToJournal={logToJournal}
                    pendingCheck={pendingCheck} onResolveCheck={handleResolveCheck}
                    isInCombat={isInCombat} 
                    isVoiceSessionActive={isVoiceSessionActive} isConnectingVoice={isConnectingVoice}
                    onToggleVoiceSession={handleToggleVoiceSession} transcriptionHistory={transcriptionHistory}
                    interimUserScript={interimUserScript} interimAssistantScript={interimAssistantScript}
                    combatants={combatants} turnIndex={turnIndex} round={round} onNextTurn={handleNextTurn}
                    onUpdatePlayerHP={handleUpdatePlayerHP} onPlayerAttack={handlePlayerAttack}
                />;
            case 'Character Info':
                return <CharacterInfoTab 
                    characterSheet={characterSheet} setCharacterSheet={setCharacterSheet}
                    onDescribePc={handleDescribePc} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem}
                    isLoading={isLoading} openCreationModal={() => setShowCreationModal(true)}
                 />;
            case 'Threads':
                return <ThreadsTab threads={threads} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} isLoading={isLoading} />;
            case 'Characters':
                return <CharactersTab characters={characters} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} isLoading={isLoading} />;
            case 'Party':
                return <PartyTab partyMembers={party} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} isLoading={isLoading} />;
            case 'Monsters':
                return <MonstersTab onAddMonsterToEncounter={handleAddMonsterToEncounter} />;
            case 'Encounters':
                return <EncountersTab 
                    encounter={encounter} onUpdateQuantity={handleUpdateMonsterQuantity}
                    onRemove={handleRemoveMonsterFromEncounter} onClear={handleClearEncounter}
                    onStartCombat={handleStartCombat}
                />;
            case 'Settings':
                return <SettingsTab settings={gameSettings} setSettings={setGameSettings} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <Header onSaveGame={handleSaveGame} onLoadGame={handleLoadGame} />
                <Tabs
                    tabs={['Play', 'Character Info', 'Threads', 'Characters', 'Party', 'Monsters', 'Encounters', 'Settings']}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <main className="mt-6">
                    {renderTabContent()}
                </main>
                {randomEvent && (
                    <EventModal
                        event={randomEvent} onClose={handleCloseEventModal}
                        onInterpret={handleInterpretEvent} isLoading={!!isLoading['interpretEvent']}
                    />
                )}
                 {showEndSceneModal && <EndSceneModal onConfirm={handleConfirmEndScene} />}
                 {showCreationModal && (
                    <CharacterCreationModal 
                        onClose={() => setShowCreationModal(false)}
                        onComplete={(newSheet) => {
                            setCharacterSheet(newSheet);
                            setShowCreationModal(false);
                            setActiveTab('Character Info');
                        }}
                        initialSheet={getInitialCharacterSheet()}
                    />
                 )}
            </div>
        </div>
    );
};

export default App;
