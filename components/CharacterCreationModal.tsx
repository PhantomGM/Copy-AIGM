
import React, { useState, useMemo } from 'react';
import { CharacterSheet, CharacterAttributes, Archetype } from '../types';
import { ARCHETYPES } from '../constants';
import { roll4d6DropLowest, applyArchetype, recalculateStats } from '../services/onePage5e';

interface CharacterCreationModalProps {
    onClose: () => void;
    onComplete: (characterSheet: CharacterSheet) => void;
    initialSheet: CharacterSheet;
}

const ATTRIBUTES: (keyof CharacterAttributes)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({ onClose, onComplete, initialSheet }) => {
    const [step, setStep] = useState(1);
    const [sheet, setSheet] = useState<CharacterSheet>(initialSheet);
    const [rolledStats, setRolledStats] = useState<number[]>([]);
    const [assignedStats, setAssignedStats] = useState<Record<keyof CharacterAttributes, number | null>>({
        strength: null, dexterity: null, constitution: null, intelligence: null, wisdom: null, charisma: null
    });

    const unassignedRolls = useMemo(() => {
        const assignedValues = Object.values(assignedStats).filter(v => v !== null);
        const available = [...rolledStats];
        assignedValues.forEach(val => {
            const index = available.indexOf(val!);
            if (index > -1) {
                available.splice(index, 1);
            }
        });
        return available;
    }, [rolledStats, assignedStats]);

    const isStep2Complete = useMemo(() => {
        return Object.values(assignedStats).every(v => v !== null);
    }, [assignedStats]);
    
    const isStep3Complete = useMemo(() => {
        if (sheet.archetype === Archetype.None) return false;
        if (sheet.archetype === Archetype.HumanWizard && sheet.spellcastingAbility === 'none') return false;
        return true;
    }, [sheet.archetype, sheet.spellcastingAbility]);

    const handleRollStats = () => {
        setRolledStats(Array(6).fill(0).map(() => roll4d6DropLowest()));
        setStep(2);
    };

    const handleAssignStat = (attr: keyof CharacterAttributes, value: number) => {
        setAssignedStats(prev => ({ ...prev, [attr]: value }));
    };
    
    const handleUnassignStat = (attr: keyof CharacterAttributes) => {
        setAssignedStats(prev => ({ ...prev, [attr]: null }));
    };
    
    const handleConfirmAssignments = () => {
        const finalAttributes: CharacterAttributes = { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 };
        for (const key of ATTRIBUTES) {
            finalAttributes[key] = assignedStats[key]!;
        }
        setSheet(prev => ({ ...prev, attributes: finalAttributes }));
        setStep(3);
    };
    
    const handleSelectArchetype = (archetype: Archetype) => {
        let tempSheet = { ...sheet };
        
        let attributes = { ...tempSheet.attributes };
        
        if (archetype === Archetype.DwarfFighter) {
            attributes.strength += 2; 
        } else if (archetype === Archetype.ElfRanger) {
            attributes.dexterity += 2;
        } else if (archetype === Archetype.HumanWizard) {
            attributes.intelligence += 2;
            attributes.wisdom += 2;
        }

        tempSheet = applyArchetype({ ...tempSheet, attributes }, archetype);
        // Reset spellcasting ability if archetype changes
        if (archetype !== Archetype.HumanWizard) {
            tempSheet.spellcastingAbility = 'none';
        } else {
            // If switching to wizard, reset choice
            tempSheet.spellcastingAbility = 'none';
        }
        setSheet(tempSheet);
    };

    const handleSetSpellcastingAbility = (ability: 'intelligence' | 'wisdom') => {
        setSheet(prev => ({ ...prev, spellcastingAbility: ability }));
    };
    
    const handleConfirmArchetype = () => {
        setStep(4);
    };

    const handleRollGold = () => {
        const gold = (Math.floor(Math.random() * 10) + 1) * 10;
        setSheet(prev => ({ ...prev, gold }));
    };
    
    const handleFinish = () => {
        const finalSheet = recalculateStats(sheet);
        onComplete(finalSheet);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-sky-500">
                <h2 className="text-2xl font-bold mb-4 text-sky-300 mate-font">Character Creation - Step {step}</h2>

                {/* Step 1: Roll Stats */}
                {step === 1 && (
                    <div className="text-center">
                        <p className="mb-4">Let's create your character! The first step is to roll for your six core attributes.</p>
                        <p className="mb-6 text-sm text-gray-400">This will roll 4 six-sided dice and drop the lowest result, for each of the six stats.</p>
                        <button onClick={handleRollStats} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-md transition-colors">Roll Stats</button>
                    </div>
                )}

                {/* Step 2: Assign Stats */}
                {step === 2 && (
                    <div>
                        <p className="mb-4">You rolled: <strong className="text-xl text-white">{rolledStats.join(', ')}</strong></p>
                        <p className="mb-6">Assign each roll to an attribute. Click an attribute's box, then click an available number.</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {ATTRIBUTES.map(attr => (
                                <div key={attr} className="bg-gray-700 p-3 rounded-md text-center">
                                    <h4 className="font-bold capitalize">{attr}</h4>
                                    <div 
                                        onClick={() => handleUnassignStat(attr)}
                                        className="mt-2 text-3xl font-bold text-sky-300 h-12 cursor-pointer flex items-center justify-center"
                                    >
                                        {assignedStats[attr] || '?'}
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className="mt-6 flex items-center justify-center space-x-2">
                             <span className="text-gray-400">Available:</span>
                             {unassignedRolls.map((roll, index) => (
                                <button key={index} onClick={() => {
                                    const nextAttr = ATTRIBUTES.find(a => assignedStats[a] === null);
                                    if(nextAttr) handleAssignStat(nextAttr, roll);
                                }} className="bg-gray-600 hover:bg-sky-500 text-white font-bold w-12 h-12 rounded-md text-xl">
                                    {roll}
                                </button>
                             ))}
                        </div>
                        <button onClick={handleConfirmAssignments} disabled={!isStep2Complete} className="mt-6 w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition-colors">Confirm Assignments</button>
                    </div>
                )}
                
                {/* Step 3: Choose Archetype */}
                {step === 3 && (
                    <div>
                        <p className="mb-4">Now, choose your character's Archetype. This will grant you proficiencies, stat boosts, and set your starting HP.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.values(Archetype).filter(a => a !== Archetype.None).map(arch => (
                                <button 
                                    key={arch}
                                    onClick={() => handleSelectArchetype(arch)}
                                    className={`p-4 rounded-md text-left border-2 transition-colors ${sheet.archetype === arch ? 'bg-sky-700 border-sky-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                                >
                                    <h4 className="font-bold text-lg">{arch}</h4>
                                    <p className="text-xs text-gray-400 mt-1">+{ARCHETYPES[arch].scoreIncrease.length * 2} to {ARCHETYPES[arch].scoreIncrease.join(' & ')}</p>
                                    <p className="text-xs text-gray-400">Hit Dice: d{ARCHETYPES[arch].hitDice}</p>
                                </button>
                            ))}
                        </div>
                        {sheet.archetype === Archetype.HumanWizard && (
                            <div className="mt-4 p-4 bg-gray-700 rounded-md">
                                <h4 className="font-bold text-center mb-2">Choose Spellcasting Ability</h4>
                                <div className="flex justify-center space-x-4">
                                    <button 
                                        onClick={() => handleSetSpellcastingAbility('intelligence')}
                                        className={`py-2 px-4 rounded-md border-2 ${sheet.spellcastingAbility === 'intelligence' ? 'bg-indigo-600 border-indigo-400' : 'bg-gray-600 border-gray-500'}`}
                                    >
                                        Intelligence
                                    </button>
                                    <button 
                                        onClick={() => handleSetSpellcastingAbility('wisdom')}
                                        className={`py-2 px-4 rounded-md border-2 ${sheet.spellcastingAbility === 'wisdom' ? 'bg-indigo-600 border-indigo-400' : 'bg-gray-600 border-gray-500'}`}
                                    >
                                        Wisdom
                                    </button>
                                </div>
                            </div>
                        )}
                        <button onClick={handleConfirmArchetype} disabled={!isStep3Complete} className="mt-6 w-full bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition-colors">Confirm Archetype</button>
                    </div>
                )}

                {/* Step 4: Final Details & Gold */}
                {step === 4 && (
                     <div>
                        <p className="mb-4">Almost done! Fill in your character's name and roll for starting gold.</p>
                        <div className="mb-4">
                             <label className="block text-sm font-medium text-gray-400 mb-1">Character Name</label>
                             <input type="text" value={sheet.name} onChange={e => setSheet(s => ({...s, name: e.target.value}))} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>
                        <div className="text-center">
                            <button onClick={handleRollGold} disabled={sheet.gold > 0} className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition-colors">Roll d100 Gold</button>
                            <p className="mt-3 text-xl">Starting Gold: <strong className="text-amber-300">{sheet.gold}G</strong></p>
                        </div>
                         <button onClick={handleFinish} disabled={!sheet.name || sheet.gold === 0} className="mt-6 w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition-colors">Finish Creation</button>
                    </div>
                )}

                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
            </div>
        </div>
    );
};

export default CharacterCreationModal;