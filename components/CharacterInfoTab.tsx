import React from 'react';
// FIX: Import CharacterAttributes for strong typing of attribute keys.
import { CharacterSheet, Archetype, ListItem, CharacterAttributes } from '../types';
import { WEAPONS, ARMOR, SPELLS } from '../constants';
import ListManager from './ListManager';
import Spinner from './Spinner';

type ItemManagerType = 'thread' | 'character' | 'weapon' | 'armor' | 'spell' | 'inventory';

interface CharacterInfoTabProps {
    characterSheet: CharacterSheet;
    setCharacterSheet: React.Dispatch<React.SetStateAction<CharacterSheet>>;
    onDescribePc: () => void;
    onAddItem: (type: ItemManagerType, name: string, elaborate: boolean, details?: Partial<Omit<ListItem, 'name'>>) => void;
    onRemoveItem: (type: ItemManagerType, index: number) => void;
    isLoading: Record<string, boolean>;
    openCreationModal: () => void;
}

const InfoInput: React.FC<{ label: string; value: string | number; onChange: (value: string) => void; type?: string; className?: string; }> = ({ label, value, onChange, type = "text", className = "" }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 ${className}`}
        />
    </div>
);

const StatBox: React.FC<{ label: string; value: string | number; className?: string; }> = ({ label, value, className }) => (
    <div className={`bg-gray-700 p-2 rounded-lg text-center ${className}`}>
        <div className="text-xs text-gray-400 uppercase">{label}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
    </div>
);

// FIX: Define a strongly-typed array of attribute keys to avoid type errors with Object.keys().
const ATTRIBUTES: (keyof CharacterAttributes)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

const CharacterInfoTab: React.FC<CharacterInfoTabProps> = (props) => {
    const { characterSheet: cs, setCharacterSheet, isLoading } = props;

    const handleSheetChange = (field: keyof CharacterSheet, value: any) => {
        setCharacterSheet(prev => ({ ...prev, [field]: value }));
    };

    const handleAttributeChange = (attr: keyof CharacterSheet['attributes'], value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setCharacterSheet(prev => ({
                ...prev,
                attributes: { ...prev.attributes, [attr]: numValue }
            }));
        }
    };

    const handleAddItemFromDropdown = (type: 'weapon' | 'armor' | 'spell', name: string) => {
        if (!name) return;

        let itemToAdd: ListItem | null = null;
        
        if (type === 'weapon') {
            const weapon = WEAPONS.find(w => w.name === name);
            if (weapon) {
                const modString = weapon.attackStat === 'strength' ? 'STR' : 'DEX';
                itemToAdd = { 
                    name: weapon.name, 
                    description: `Atk: d20+${modString}+Prof | Dmg: ${weapon.damage}`,
                    attackStat: weapon.attackStat
                };
            }
        } else if (type === 'armor') {
            const armor = ARMOR.find(a => a.name === name);
            if (armor) itemToAdd = { name: armor.name, description: `AC: ${armor.ac}, Penalty: ${armor.penalty}` };
        } else if (type === 'spell') {
            const spell = SPELLS.find(s => s.name === name);
            if (spell) {
                const spellcastingAbbr = cs.spellcastingAbility === 'intelligence' ? 'INT' : 'WIS';
                const attackString = spell.attack ? `Atk: d20+${spellcastingAbbr}+Prof | ` : '';
                itemToAdd = { 
                    name: spell.name, 
                    description: `${attackString}Use: ${spell.use}`,
                    attack: spell.attack
                };
            }
        }

        if (itemToAdd) {
            switch(type) {
                case 'weapon': 
                    if (!cs.weapons.some(i => i.name === itemToAdd!.name)) {
                        setCharacterSheet(prev => ({ ...prev, weapons: [...prev.weapons, itemToAdd!] }));
                    }
                    break;
                case 'armor': 
                    if (!cs.armor.some(i => i.name === itemToAdd!.name)) {
                        setCharacterSheet(prev => ({ ...prev, armor: [...prev.armor, itemToAdd!] }));
                    }
                    break;
                case 'spell': 
                     if (!cs.spells.some(i => i.name === itemToAdd!.name)) {
                        setCharacterSheet(prev => ({ ...prev, spells: [...prev.spells, itemToAdd!] }));
                    }
                    break;
            }
        }
    };

    const getSpellSlots = () => {
        if (cs.archetype !== Archetype.HumanWizard) return 0;
        if (cs.level >= 15) return 5;
        if (cs.level >= 10) return 4;
        if (cs.level >= 5) return 3;
        return 2;
    };
    const spellSlots = getSpellSlots();

    if (cs.archetype === Archetype.None) {
        return (
            <div className="text-center p-10 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-amber-300 mb-4">No Character Found</h2>
                <p className="text-gray-400 mb-6">You need to create a character to see your character sheet.</p>
                <button
                    onClick={props.openCreationModal}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-md transition-colors"
                >
                    Create Character
                </button>
            </div>
        );
    }

    return (
        <div className="tab-content active space-y-6">
            {/* Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg shadow-lg space-y-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={cs.name}
                            onChange={(e) => handleSheetChange('name', e.target.value)}
                            placeholder="Enter PC Name..."
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                            onClick={props.onDescribePc}
                            disabled={isLoading['pcDescription']}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-2 px-3 rounded-md transition-colors flex items-center justify-center w-11 h-10"
                            title="Describe PC with AI"
                        >
                            {isLoading['pcDescription'] ? <Spinner size="md" /> : <span>✨</span>}
                        </button>
                    </div>
                     <div className="text-gray-400 text-sm italic min-h-[1.25rem]">{cs.description}</div>
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <InfoInput label="Archetype" value={cs.archetype} onChange={v => handleSheetChange('archetype', v)} className="bg-gray-800 pointer-events-none"/>
                        <InfoInput label="Level" value={cs.level} onChange={v => handleSheetChange('level', parseInt(v) || 1)} type="number" />
                        <InfoInput label="Age" value={cs.age} onChange={v => handleSheetChange('age', v)} />
                        <InfoInput label="Gender" value={cs.gender} onChange={v => handleSheetChange('gender', v)} />
                     </div>
                </div>

                {/* Combat Stats */}
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg grid grid-cols-2 grid-rows-2 gap-3">
                   <StatBox label="Armor Class" value={cs.ac} className="row-span-2 text-6xl flex flex-col justify-center"/>
                   <StatBox label="Initiative" value={cs.initiative > 0 ? `+${cs.initiative}`: cs.initiative} />
                   <StatBox label="Speed" value={`${cs.speed}ft`} />
                </div>
            </div>
            
            {/* Attributes & HP/Gold */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="md:col-span-3 bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h2 className="text-lg font-bold mb-3 text-amber-300 border-b border-gray-600 pb-2">Attributes</h2>
                    <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* FIX: Iterate over the strongly-typed ATTRIBUTES array instead of Object.keys(). */}
                        {ATTRIBUTES.map(attr => (
                            <div key={attr} className="text-center">
                                <label className="block text-sm font-medium text-gray-400 mb-1 capitalize">{attr}</label>
                                <input
                                    type="number"
                                    value={cs.attributes[attr]}
                                    onChange={e => handleAttributeChange(attr, e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-1 py-2 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <div className="text-lg font-bold text-sky-300">{cs.attributes[attr] >= 10 ? `+${Math.floor((cs.attributes[attr]-10)/2)}` : `${Math.floor((cs.attributes[attr]-10)/2)}`}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <StatBox label="Hit Points" value={`${cs.hp} / ${cs.maxHp}`} />
                    <StatBox label="Proficiency" value={`+${cs.proficiency}`} />
                    <StatBox label="Gold" value={cs.gold} />
                </div>
            </div>

            {/* Equipment & Spell selection */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-3 text-amber-300 border-b border-gray-600 pb-2">Add Equipment & Spells</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Add Weapon</label>
                        <select onChange={(e) => handleAddItemFromDropdown('weapon', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                            <option value="">-- Select a Weapon --</option>
                            {WEAPONS.map(w => <option key={w.name} value={w.name}>{w.name} ({w.damage})</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Add Armor</label>
                        <select onChange={(e) => handleAddItemFromDropdown('armor', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500">
                             <option value="">-- Select Armor --</option>
                            {ARMOR.map(a => <option key={a.name} value={a.name}>{a.name} (AC: {a.ac})</option>)}
                        </select>
                    </div>
                </div>
                {cs.archetype === Archetype.HumanWizard && (
                    <div className="mt-4">
                         <h3 className="text-md font-bold text-amber-300 mb-2">Add Spells ({spellSlots} known)</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i}>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Spell Slot {i + 1}</label>
                                    <select 
                                        onChange={(e) => handleAddItemFromDropdown('spell', e.target.value)}
                                        disabled={i >= spellSlots}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-800 disabled:text-gray-500"
                                    >
                                        <option value="">-- Select a Spell --</option>
                                        {SPELLS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            ))}
                         </div>
                    </div>
                )}
            </div>


            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ListManager title="Weapons" items={cs.weapons} onAdd={(n, d, e) => props.onAddItem('weapon', n, e, { description: d })} onRemove={i => props.onRemoveItem('weapon', i)} placeholder="New weapon..." isLoading={!!isLoading['add-weapon']} />
                <ListManager title="Armor" items={cs.armor} onAdd={(n, d, e) => props.onAddItem('armor', n, e, { description: d })} onRemove={i => props.onRemoveItem('armor', i)} placeholder="New armor..." isLoading={!!isLoading['add-armor']} />
                <ListManager title="Spells" items={cs.spells} onAdd={(n, d, e) => props.onAddItem('spell', n, e, { description: d })} onRemove={i => props.onRemoveItem('spell', i)} placeholder="New spell..." isLoading={!!isLoading['add-spell']} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h2 className="text-lg font-bold mb-2 text-amber-300 border-b border-gray-600 pb-2">Proficiencies</h2>
                    <p className="text-gray-300">{cs.proficiencies.join(', ')}</p>
                </div>
                <ListManager title="Inventory" items={cs.inventory} onAdd={(n, d, e) => props.onAddItem('inventory', n, e, { description: d })} onRemove={i => props.onRemoveItem('inventory', i)} placeholder="New item..." isLoading={!!isLoading['add-inventory']} />
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-2 text-amber-300 border-b border-gray-600 pb-2">Notes & Backstory</h2>
                <textarea value={cs.notes} onChange={(e) => handleSheetChange('notes', e.target.value)} rows={8} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 resize-y focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Enter character notes, backstory, goals, etc." />
            </div>
        </div>
    );
};

export default CharacterInfoTab;
