
import React from 'react';
import { Combatant } from '../types';

interface CombatTrackerProps {
    combatants: Combatant[];
    turnIndex: number;
    round: number;
    onNextTurn: () => void;
    onUpdatePlayerHP: (newHp: number) => void;
    playerCurrentHP: number;
}

const CombatTracker: React.FC<CombatTrackerProps> = ({ combatants, turnIndex, round, onNextTurn, onUpdatePlayerHP, playerCurrentHP }) => {
    // Filter out defeated combatants for display, but keep original index for turn tracking
    const livingCombatants = combatants.map((c, index) => ({...c, originalIndex: index})).filter(c => c.currentHp > 0);
    const currentCombatant = combatants[turnIndex];

    const handlePlayerHpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
            onUpdatePlayerHP(val);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-600 pb-2 mb-3">
                <h2 className="text-lg font-bold text-red-400">Combat Tracker</h2>
                <div className="text-right">
                    <div className="font-bold text-xl">Round: {round}</div>
                    <div className="text-sm text-gray-400">Turn: {currentCombatant?.name}</div>
                </div>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {combatants.map((c, index) => {
                    const hpPercentage = c.maxHp > 0 ? (c.currentHp / c.maxHp) * 100 : 0;
                    const isCurrentTurn = index === turnIndex;
                    const isDefeated = c.currentHp <= 0;
                    return (
                        <div key={c.id} className={`p-2 rounded-md transition-all duration-300 ${isCurrentTurn ? 'bg-sky-900 border border-sky-500' : 'bg-gray-700'} ${isDefeated ? 'opacity-50' : ''}`}>
                            <div className="flex justify-between items-center text-sm">
                                <span className={`font-bold ${c.isPlayer ? 'text-green-300' : 'text-red-300'}`}>{c.name} {isDefeated && '(Defeated)'}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400">AC: {c.ac}</span>
                                    {c.isPlayer ? (
                                        <div className="flex items-center">
                                            <input 
                                                type="number" 
                                                value={playerCurrentHP}
                                                onChange={handlePlayerHpChange}
                                                className="w-12 text-center bg-gray-800 rounded-md border border-gray-600"
                                            />
                                            <span className="ml-1"> / {c.maxHp} HP</span>
                                        </div>
                                    ) : (
                                       <span>{c.currentHp} / {c.maxHp} HP</span>
                                    )}
                                </div>
                            </div>
                            <div className="w-full bg-gray-900 rounded-full h-2.5 mt-1">
                                <div 
                                    className={`${c.isPlayer ? 'bg-green-500' : 'bg-red-600'} h-2.5 rounded-full transition-all duration-500`} 
                                    style={{ width: `${hpPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <button
                onClick={onNextTurn}
                className="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                Next Turn
            </button>
        </div>
    );
};

export default CombatTracker;
