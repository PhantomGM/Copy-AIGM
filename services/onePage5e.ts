
import { CharacterSheet, CharacterAttributes, Archetype, ListItem } from '../types';
import { ABILITY_MODIFIERS, PROFICIENCY_BY_LEVEL, ARCHETYPES, ARMOR } from '../constants';

export const calculateModifier = (score: number | string): number => {
    const numericScore = Number(score);
    if (isNaN(numericScore)) return 0;
    if (numericScore <= 1) return -5;
    if (numericScore >= 20) return 5;
    return ABILITY_MODIFIERS[numericScore] || 0;
};

export const calculateProficiencyBonus = (level: number): number => {
    const effectiveLevel = Math.min(Math.max(level, 1), 20);
    return PROFICIENCY_BY_LEVEL[effectiveLevel] || 2;
};

// This function now takes pre-calculated modifiers to handle penalties
export const calculateAC = (sheet: CharacterSheet, dexMod: number, wisMod: number): number => {
    let baseAC = 10 + dexMod; // Default AC without armor

    const equippedArmor = sheet.armor
        .map(item => ARMOR.find(a => a.name === item.name))
        .filter(Boolean) as (typeof ARMOR)[0][];

    if (equippedArmor.length > 0) {
        const bestArmorAC = equippedArmor.map(armorData => {
            if (typeof armorData.ac === 'number') {
                return armorData.ac; // Heavy armor has a fixed AC, Dex mod is not added.
            }
            if (typeof armorData.ac === 'string') {
                if (armorData.ac.includes('Dex')) return parseInt(armorData.ac.split(' ')[0]) + dexMod;
                if (armorData.ac.includes('Wis')) return parseInt(armorData.ac.split(' ')[0]) + wisMod;
            }
            return 0;
        }).reduce((max, current) => Math.max(max, current), 0);
        
        if (bestArmorAC > 0) {
            baseAC = bestArmorAC;
        }
    }
    
    return baseAC;
};

export const roll4d6DropLowest = (): number => {
    const rolls = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
    ];
    rolls.sort((a, b) => a - b);
    rolls.shift(); // remove the lowest
    return rolls.reduce((sum, roll) => sum + roll, 0);
};

export const getInitialCharacterSheet = (): CharacterSheet => ({
    name: '',
    description: '',
    archetype: Archetype.None,
    level: 1,
    age: '',
    gender: '',
    pronouns: '',
    spellcastingAbility: 'none',
    attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    hp: 10,
    maxHp: 10,
    ac: 10,
    initiative: 0,
    speed: 30,
    proficiency: 2,
    gold: 0,
    proficiencies: [],
    weapons: [],
    armor: [],
    spells: [],
    inventory: [],
    notes: '',
});

export const applyArchetype = (sheet: CharacterSheet, archetype: Archetype): CharacterSheet => {
    const updatedSheet = { ...sheet, archetype };
    if (archetype === Archetype.None) return updatedSheet;

    const archetypeData = ARCHETYPES[archetype];
    updatedSheet.proficiencies = archetypeData.proficiencies;
    updatedSheet.speed = archetypeData.speed;

    const conMod = calculateModifier(updatedSheet.attributes.constitution);
    const maxHp = archetypeData.hitDice + conMod;
    updatedSheet.maxHp = maxHp;
    updatedSheet.hp = maxHp;
    
    if (archetype !== Archetype.HumanWizard) {
        updatedSheet.spellcastingAbility = 'none';
    }

    return updatedSheet;
}

export const recalculateStats = (sheet: CharacterSheet): CharacterSheet => {
    const newSheet = { ...sheet };
    
    const dexMod = calculateModifier(newSheet.attributes.dexterity);
    const wisMod = calculateModifier(newSheet.attributes.wisdom);
    const conMod = calculateModifier(newSheet.attributes.constitution);

    // Find best armor and apply penalty
    const equippedArmor = newSheet.armor
        .map(item => ARMOR.find(a => a.name === item.name))
        .filter(Boolean) as (typeof ARMOR)[0][];
    
    const penalty = equippedArmor.reduce((min, current) => Math.min(min, current.penalty), 0);
    const effectiveDexMod = dexMod + penalty;

    newSheet.proficiency = calculateProficiencyBonus(newSheet.level);
    newSheet.initiative = effectiveDexMod;
    newSheet.ac = calculateAC(newSheet, effectiveDexMod, wisMod);

    // HP calculation for level 1
    if (newSheet.level === 1 && newSheet.archetype !== Archetype.None) {
        const archetypeData = ARCHETYPES[newSheet.archetype];
        newSheet.maxHp = archetypeData.hitDice + conMod;
        newSheet.hp = Math.min(newSheet.hp, newSheet.maxHp);
    } else if (newSheet.archetype === Archetype.None) {
        newSheet.maxHp = 10 + conMod;
        newSheet.hp = Math.min(newSheet.hp, newSheet.maxHp);
    }
    // Note: Level-up HP gain logic would go here if implemented.

    return newSheet;
};

export interface RollResult {
    total: number;
    rolls: number[];
    modifier: number;
    expression: string;
}

export const parseAndRoll = (expression: string): RollResult | null => {
    const input = expression.trim().toLowerCase();
    // Regex to parse expressions like '2d6+3', 'd20-1', '3d8', '1d4'
    const regex = /^(\d*)d(\d+)([\+\-]\d+)?$/;
    const match = input.match(regex);

    if (!match) {
        return null;
    }

    const numDice = match[1] ? parseInt(match[1], 10) : 1;
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    
    if (sides === 0 || numDice === 0) {
        return null;
    }

    let rolls: number[] = [];
    let total = 0;
    for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        total += roll;
    }
    total += modifier;

    return { total, rolls, modifier, expression: input };
};