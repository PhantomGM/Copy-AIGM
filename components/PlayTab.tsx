
import React from 'react';
import { CharacterSheet, TranscriptionEntry, Combatant, ListItem } from '../types';
import ChaosFactor from './ChaosFactor';
import SceneControl from './SceneControl';
import AdventureJournal from './AdventureJournal';
import ChatInput from './ChatInput';
import DiceRoller from './DiceRoller';
import CombatControls from './CombatControls';
import CombatTracker from './CombatTracker';

interface PendingCheck {
    action: string;
    proficiency: string;
    dc: number;
}

interface VoiceChatProps {
    isVoiceSessionActive: boolean;
    isConnectingVoice: boolean;
    onToggleVoiceSession: () => void;
    transcriptionHistory: TranscriptionEntry[];
    interimUserScript: string;
    interimAssistantScript: string;
}

const VoiceChatControls: React.FC<VoiceChatProps> = (props) => {
    let buttonText = 'Start Voice Chat';
    if (props.isConnectingVoice) {
        buttonText = 'Connecting...';
    } else if (props.isVoiceSessionActive) {
        buttonText = 'Stop Voice Chat';
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-3 text-sky-300 border-b border-gray-600 pb-2">Voice Chat</h2>
            <button
                onClick={props.onToggleVoiceSession}
                disabled={props.isConnectingVoice}
                className={`w-full font-bold py-2 px-4 rounded-md transition-colors ${
                    props.isVoiceSessionActive
                        ? 'bg-red-600 hover:bg-red-500'
                        : 'bg-green-600 hover:bg-green-500'
                } disabled:bg-gray-600`}
            >
                {buttonText}
            </button>
            <div className="mt-3 bg-gray-900 p-2 rounded-md h-32 overflow-y-auto text-sm">
                {props.transcriptionHistory.map((entry, index) => (
                    <p key={index} className={entry.speaker === 'user' ? 'text-gray-300' : 'text-sky-300'}>
                        <strong>{entry.speaker === 'user' ? 'You: ' : 'GM: '}</strong>{entry.text}
                    </p>
                ))}
                 {props.interimUserScript && (
                    <p className="text-gray-400 italic">
                        <strong>You: </strong>{props.interimUserScript}
                    </p>
                )}
                {props.interimAssistantScript && (
                    <p className="text-sky-400 italic">
                        <strong>GM: </strong>{props.interimAssistantScript}
                    </p>
                )}
            </div>
        </div>
    );
};

interface PlayTabProps {
    characterSheet: CharacterSheet;
    chaosFactor: number;
    setChaosFactor: (value: number) => void;
    expectedScene: string;
    setExpectedScene: (value: string) => void;
    onSuggestScene: () => void;
    onTestScene: () => void;
    onEndScene: () => void;
    journal: string;
    journalRef: React.RefObject<HTMLTextAreaElement>;
    onChatSubmit: (input: string) => void;
    isLoading: Record<string, boolean>;
    logToJournal: (text: string) => void;
    pendingCheck: PendingCheck | null;
    onResolveCheck: (prof: string, rollResult: number) => void;
    isInCombat: boolean;
    // Voice Chat Props
    isVoiceSessionActive: boolean;
    isConnectingVoice: boolean;
    onToggleVoiceSession: () => void;
    transcriptionHistory: TranscriptionEntry[];
    interimUserScript: string;
    interimAssistantScript: string;
    // Combat Props
    combatants: Combatant[];
    turnIndex: number;
    round: number;
    onNextTurn: () => void;
    onUpdatePlayerHP: (newHp: number) => void;
    onPlayerAttack: (weapon: ListItem, targetId: string) => void;
}

const PlayTab: React.FC<PlayTabProps> = (props) => {
    return (
        <div className="tab-content active">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ChaosFactor
                        chaosFactor={props.chaosFactor}
                        setChaosFactor={props.setChaosFactor}
                    />
                    <SceneControl
                        expectedScene={props.expectedScene}
                        setExpectedScene={props.setExpectedScene}
                        onSuggestScene={props.onSuggestScene}
                        onTestScene={props.onTestScene}
                        onEndScene={props.onEndScene}
                        isLoading={!!props.isLoading['suggestScene'] || !!props.isLoading['testScene']}
                    />
                    <DiceRoller logToJournal={props.logToJournal} />
                    <VoiceChatControls
                        isVoiceSessionActive={props.isVoiceSessionActive}
                        isConnectingVoice={props.isConnectingVoice}
                        onToggleVoiceSession={props.onToggleVoiceSession}
                        transcriptionHistory={props.transcriptionHistory}
                        interimUserScript={props.interimUserScript}
                        interimAssistantScript={props.interimAssistantScript}
                    />
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {props.isInCombat && (
                        <CombatTracker
                            combatants={props.combatants}
                            turnIndex={props.turnIndex}
                            round={props.round}
                            onNextTurn={props.onNextTurn}
                            onUpdatePlayerHP={props.onUpdatePlayerHP}
                            playerCurrentHP={props.characterSheet.hp}
                        />
                    )}
                    <AdventureJournal journal={props.journal} journalRef={props.journalRef} />
                    <ChatInput
                        onSubmit={props.onChatSubmit}
                        isLoading={!!props.isLoading['chat']}
                        isWaitingForCheck={!!props.pendingCheck}
                        isVoiceSessionActive={props.isVoiceSessionActive}
                    />
                    <CombatControls 
                        characterSheet={props.characterSheet}
                        logToJournal={props.logToJournal}
                        pendingCheck={props.pendingCheck}
                        onResolveCheck={props.onResolveCheck}
                        isInCombat={props.isInCombat}
                        combatants={props.combatants}
                        onPlayerAttack={props.onPlayerAttack}
                    />
                </div>
            </div>
        </div>
    );
};

export default PlayTab;
