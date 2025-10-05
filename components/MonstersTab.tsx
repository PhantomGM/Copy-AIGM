
import React from 'react';
import { EXAMPLE_MONSTERS } from '../constants';
import { Monster } from '../types';

interface MonstersTabProps {
    onAddMonsterToEncounter: (monster: Monster) => void;
}

const MonstersTab: React.FC<MonstersTabProps> = ({ onAddMonsterToEncounter }) => {
    return (
        <div className="tab-content active">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-3 text-sky-300 border-b border-gray-600 pb-2">Monster Manual</h2>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                    {EXAMPLE_MONSTERS.map((monster) => (
                        <div key={monster.name} className="bg-gray-700 p-3 rounded-md flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-amber-300">{monster.name}</h3>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-mono text-sky-200">
                                    <span><strong className="text-gray-400">AC:</strong> {monster.ac}</span>
                                    <span><strong className="text-gray-400">HP:</strong> {monster.hp}</span>
                                    <span><strong className="text-gray-400">CR:</strong> {monster.cr}</span>
                                    <span><strong className="text-gray-400">XP:</strong> {monster.xp}</span>
                                    <span className="w-full sm:w-auto"><strong className="text-gray-400">Attack:</strong> {monster.attack}</span>
                                </div>
                            </div>
                             <button 
                                onClick={() => onAddMonsterToEncounter(monster)}
                                className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-3 rounded-md transition-colors text-sm flex-shrink-0 ml-4"
                                title="Add to current encounter"
                            >
                                Add to Encounter
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MonstersTab;
