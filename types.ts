
export enum Archetype {
    None = "None",
    DwarfFighter = "Dwarf Fighter",
    ElfRanger = "Elf Ranger",
    HumanWizard = "Human Wizard",
}

export interface ListItem {
    name: string;
    description: string;
    [key: string]: any; // For extra properties like attackStat, attack
}

export type Thread = ListItem;
export type Character = ListItem;

export interface CharacterAttributes {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

export interface CharacterSheet {
    name: string;
    description: string;
    archetype: Archetype;
    level: number;
    age: string;
    gender: string;
    pronouns: string;
    spellcastingAbility: 'intelligence' | 'wisdom' | 'none';
    attributes: CharacterAttributes;
    hp: number;
    maxHp: number;
    ac: number;
    initiative: number;
    speed: number;
    proficiency: number;
    gold: number;
    proficiencies: string[];
    weapons: ListItem[];
    armor: ListItem[];
    spells: ListItem[];
    inventory: ListItem[];
    notes: string;
}

export interface GameSettings {
    genres: string[];
    gmTone: string;
    gameplayFocus: string[];
    lines: string;
    veils: string;
}

export interface RandomEvent {
    focus: string;
    meaning: string;
    interpretation?: string;
}

export interface PendingCheck {
    action: string;
    proficiency: string;
    dc: number;
}

export interface Monster {
    name: string;
    attack: string;
    ac: number;
    hp: number;
    cr: string;
    xp: number;
}

export interface TranscriptionEntry {
    speaker: 'user' | 'assistant';
    text: string;
}

export interface EncounterMonster {
    monster: Monster;
    quantity: number;
}

export interface Combatant {
    id: string;
    name: string;
    currentHp: number;
    maxHp: number;
    ac: number;
    initiative: number;
    isPlayer?: boolean;
    attack?: string;
}
