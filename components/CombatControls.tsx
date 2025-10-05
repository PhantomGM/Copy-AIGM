
import React, { useState, useEffect } from 'react';
import { CharacterSheet, ListItem, CharacterAttributes, Archetype, Combatant } from '../types';
import { parseAndRoll, calculateModifier } from '../services/onePage5e';

interface PendingCheck {
    action: string;
    proficiency: string;
    dc: number;
}

interface CombatControlsProps {
    characterSheet: CharacterSheet;
    logToJournal: (text: string) => void;
    pendingCheck: PendingCheck | null;
    onResolveCheck: (prof: string, rollResult: number) => void;
    isInCombat: boolean;
    combatants: Combatant[];
    onPlayerAttack: (weapon: ListItem, targetId: string) => void;
}

const CombatControls: React.FC<CombatControlsProps> = ({ characterSheet: cs, logToJournal, pendingCheck, onResolveCheck, isInCombat, combatants, onPlayerAttack }) => {
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [targetId, setTargetId] = useState<string>('');
    const monsterTargets = combatants.filter(c => !c.isPlayer && c.currentHp > 0);

    useEffect(() => {
        if (isInCombat && monsterTargets.length > 0 && !combatants.find(c => c.id === targetId)) {
            setTargetId(monsterTargets[0].id);
        }
        if (!isInCombat) {
            setTargetId('');
        }
    }, [isInCombat, combatants, monsterTargets, targetId]);
    

    const displayResult = (message: string) => {
        setLastAction(message);
        setTimeout(() => setLastAction(null), 4000);
    };
    
    const handleAttack = (weapon: ListItem) => {
        if (!targetId) {
            displayResult("No target selected!");
            return;
        }
        onPlayerAttack(weapon, targetId);
    };

    const handleSpell = (spell: ListItem) => {
        // This is a simplified version. A full implementation would pass target to a handler.
        let log = `-- CAST SPELL: ${spell.name} --`;
        displayResult(`Cast ${spell.name}`);
        logToJournal(log);
    };

    const handleProficiencyCheck = (prof: string) => {
        const attrKey = prof.toLowerCase() as keyof CharacterAttributes;
        const score = cs.attributes[attrKey];
        const mod = calculateModifier(score);
        const profBonus = cs.proficiency;
        const d20 = Math.floor(Math.random() * 20) + 1;
        const total = d20 + mod + profBonus;
        
        logToJournal(`-- ${prof} Check --\nTotal: ${total} (${d20}[roll] + ${mod}[mod] + ${profBonus}[prof])`);
        displayResult(`${prof} Check: ${total}`);

        if (pendingCheck && pendingCheck.proficiency === prof) {
            onResolveCheck(prof, total);
        }
    };

    if (cs.archetype === Archetype.None) {
        return null; 
    }

    const currentTurnCombatant = combatants.find(c => c.isPlayer);
    const isPlayerTurn = currentTurnCombatant ? combatants.findIndex(c => c.id === currentTurnCombatant.id) === combatants.findIndex(c => c.currentHp > 0) : false;
    const isDisabled = !isPlayerTurn && isInCombat;

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-sky-300 border-b border-gray-600 pb-2">Player Actions</h2>
            
            {isInCombat && (
                 <div>
                    <label htmlFor="target-select" className="block text-sm font-medium text-gray-400 mb-1">Target</label>
                    <select 
                        id="target-select"
                        value={targetId} 
                        onChange={e => setTargetId(e.target.value)} 
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        disabled={monsterTargets.length === 0}
                    >
                        {monsterTargets.length > 0 ? monsterTargets.map(m => 
                            <option key={m.id} value={m.id}>{m.name} ({m.currentHp}/{m.maxHp} HP)</option>
                        ) : (
                            <option>No targets available</option>
                        )}
                    </select>
                </div>
            )}
            
            {cs.weapons.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-400 mb-2 text-sm">Attacks</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {cs.weapons.map((weapon, i) => (
                            <button key={i} onClick={() => handleAttack(weapon)} disabled={isDisabled || !targetId} className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold py-2 px-2 rounded-md transition-colors text-xs">
                                {weapon.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {cs.spells.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-400 mb-2 text-sm">Spells</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {cs.spells.map((spell, i) => (
                            <button key={i} onClick={() => handleSpell(spell)} disabled={isDisabled} className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold py-2 px-2 rounded-md transition-colors text-xs">
                                {spell.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {cs.proficiencies.length > 0 && (
                 <div>
                    <h3 className="font-semibold text-gray-400 mb-2 text-sm">Proficient Checks</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {cs.proficiencies.map((prof, i) => {
                            const isPending = pendingCheck?.proficiency === prof;
                            const buttonClasses = `bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-2 rounded-md transition-colors text-xs ${isPending ? 'border-2 border-sky-400 animate-pulse' : ''}`;
                            return (
                                <button key={i} onClick={() => handleProficiencyCheck(prof)} className={buttonClasses}>
                                    {prof} Check
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="text-center text-sky-300 font-bold text-lg h-7">
                {lastAction && <span className="animate-pulse">{lastAction}</span>}
            </div>
        </div>
    );
};

export default CombatControls;
