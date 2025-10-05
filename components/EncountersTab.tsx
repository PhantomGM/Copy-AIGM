
import React, { useMemo } from 'react';
import { Monster, EncounterMonster } from '../types';

interface EncountersTabProps {
    encounter: EncounterMonster[];
    onUpdateQuantity: (monsterName: string, change: number) => void;
    onRemove: (monsterName: string) => void;
    onClear: () => void;
    onStartCombat: () => void;
}

const EncountersTab: React.FC<EncountersTabProps> = ({ encounter, onUpdateQuantity, onRemove, onClear, onStartCombat }) => {
    const encounterStats = useMemo(() => {
        return encounter.reduce(
            (acc, curr) => {
                acc.totalMonsters += curr.quantity;
                acc.totalHp += curr.monster.hp * curr.quantity;
                acc.totalXp += curr.monster.xp * curr.quantity;
                return acc;
            },
            { totalMonsters: 0, totalHp: 0, totalXp: 0 }
        );
    }, [encounter]);

    return (
        <div className="tab-content active">
             <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col max-h-[80vh]">
                <h2 className="text-lg font-bold mb-3 text-sky-300 border-b border-gray-600 pb-2">Encounter Builder</h2>
                <div className="bg-gray-900 p-3 rounded-md mb-4 grid grid-cols-3 text-center">
                    <div>
                        <div className="text-xs text-gray-400 uppercase">Monsters</div>
                        <div className="text-2xl font-bold text-white">{encounterStats.totalMonsters}</div>
                    </div>
                     <div>
                        <div className="text-xs text-gray-400 uppercase">Total HP</div>
                        <div className="text-2xl font-bold text-white">{encounterStats.totalHp}</div>
                    </div>
                     <div>
                        <div className="text-xs text-gray-400 uppercase">Total XP</div>
                        <div className="text-2xl font-bold text-white">{encounterStats.totalXp}</div>
                    </div>
                </div>
                <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                    {encounter.length > 0 ? encounter.map(em => (
                        <div key={em.monster.name} className="bg-gray-700 p-2 rounded-md flex items-center justify-between">
                            <div>
                                <span className="font-bold">{em.monster.name}</span>
                                <div className="text-xs text-gray-400 font-mono">
                                    AC:{em.monster.ac} HP:{em.monster.hp} Atk:{em.monster.attack}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => onUpdateQuantity(em.monster.name, -1)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold w-6 h-6 rounded-full transition-colors flex items-center justify-center">-</button>
                                <span className="w-8 text-center font-bold">{em.quantity}</span>
                                <button onClick={() => onUpdateQuantity(em.monster.name, 1)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold w-6 h-6 rounded-full transition-colors flex items-center justify-center">+</button>
                                <button onClick={() => onRemove(em.monster.name)} className="text-red-400 hover:text-red-300 font-bold ml-2 text-xl leading-none">&times;</button>
                            </div>
                        </div>
                    )) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-center text-gray-500 italic">Add monsters from the 'Monsters' tab to build an encounter.</p>
                        </div>
                    )}
                </div>
                {encounter.length > 0 && (
                    <div className="mt-4 flex space-x-2 flex-shrink-0">
                        <button onClick={onStartCombat} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
                            Start Combat
                        </button>
                        <button onClick={onClear} className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                            Clear Encounter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EncountersTab;
