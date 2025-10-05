
import { Archetype, Monster } from './types';

export const FATE_CHART: Record<string, Record<number, [number, number, number]>> = {
    'Certain':           { 1: [10, 50, 91], 2: [13, 65, 94], 3: [15, 75, 96], 4: [17, 85, 98], 5: [18, 90, 99], 6: [19, 95, 100], 7: [20, 99, 101], 8: [20, 99, 101], 9: [20, 99, 101] },
    'Nearly Certain':    { 1: [7, 35, 88],  2: [10, 50, 91], 3: [13, 65, 94], 4: [15, 75, 96], 5: [17, 85, 98], 6: [18, 90, 99],  7: [19, 95, 100], 8: [20, 99, 101], 9: [20, 99, 101] },
    'Very Likely':       { 1: [5, 25, 86],  2: [7, 35, 88],  3: [10, 50, 91], 4: [13, 65, 94], 5: [15, 75, 96], 6: [17, 85, 98],  7: [18, 90, 99],  8: [19, 95, 100], 9: [20, 99, 101] },
    'Likely':            { 1: [3, 15, 84],  2: [5, 25, 86],  3: [7, 35, 88],  4: [10, 50, 91], 5: [13, 65, 94], 6: [15, 75, 96],  7: [17, 85, 98],  8: [18, 90, 99],  9: [19, 95, 100] },
    '50/50':             { 1: [2, 10, 83],  2: [3, 15, 84],  3: [5, 25, 86],  4: [7, 35, 88],  5: [10, 50, 91], 6: [13, 65, 94],  7: [15, 75, 96],  8: [17, 85, 98],  9: [18, 90, 99] },
    'Unlikely':          { 1: [1, 5, 82],   2: [2, 10, 83],  3: [3, 15, 84],  4: [5, 25, 86],  5: [7, 35, 88],  6: [10, 50, 91],  7: [13, 65, 94],  8: [15, 75, 96],  9: [17, 85, 98] },
    'Very Unlikely':     { 1: [0, 1, 81],   2: [1, 5, 82],   3: [2, 10, 83],  4: [3, 15, 84],  5: [5, 25, 86],  6: [7, 35, 88],   7: [10, 50, 91],  8: [13, 65, 94],  9: [15, 75, 96] },
    'Nearly Impossible': { 1: [0, 1, 81],   2: [0, 1, 81],   3: [1, 5, 82],   4: [2, 10, 83],  5: [3, 15, 84],  6: [5, 25, 86],   7: [7, 35, 88],   8: [10, 50, 91],  9: [13, 65, 94] },
    'Impossible':        { 1: [0, 1, 81],   2: [0, 1, 81],   3: [0, 1, 81],   4: [1, 5, 82],   5: [2, 10, 83],  6: [3, 15, 84],   7: [5, 25, 86],   8: [7, 35, 88],   9: [10, 50, 91] }
};

export const EVENT_FOCUS_TABLE = [
    { range: [1, 5], value: "Remote Event" }, { range: [6, 10], value: "Ambiguous Event" }, { range: [11, 20], value: "New NPC" }, { range: [21, 40], value: "NPC Action" }, { range: [41, 45], value: "NPC Negative" }, { range: [46, 50], value: "NPC Positive" }, { range: [51, 55], value: "Move Toward a Thread" }, { range: [56, 65], value: "Move Away From a Thread" }, { range: [66, 70], value: "Close a Thread" }, { range: [71, 80], value: "PC Negative" }, { range: [81, 85], value: "PC Positive" }, { range: [86, 100], value: "Current Context" }
];

export const SCENE_ADJUSTMENT_TABLE = [
    "Remove A Character", "Add A Character", "Reduce/Remove An Activity", "Increase An Activity", "Remove An Object", "Add An Object", "Make 2 Adjustments", "Make 2 Adjustments", "Make 2 Adjustments", "Make 2 Adjustments"
];

export const MEANING_TABLES = {
    actions1: ["Abandon", "Accompany", "Activate", "Agree", "Ambush", "Arrive", "Assist", "Attack", "Attain", "Bargain", "Befriend", "Bestow", "Betray", "Block", "Break", "Carry", "Celebrate", "Change", "Close", "Combine", "Communicate", "Conceal", "Continue", "Control", "Create", "Deceive", "Decrease", "Defend", "Delay", "Deny", "Depart", "Deposit", "Destroy", "Dispute", "Disrupt", "Distrust", "Divide", "Drop", "Easy", "Energize", "Escape", "Expose", "Fail", "Fight", "Flee", "Free", "Guide", "Harm", "Heal", "Hinder", "Imitate", "Imprison", "Increase", "Indulge", "Inform", "Inquire", "Inspect", "Invade", "Leave", "Lure", "Misuse", "Move", "Neglect", "Observe", "Open", "Oppose", "Overthrow", "Praise", "Proceed", "Protect", "Punish", "Pursue", "Recruit", "Refuse", "Release", "Relinquish", "Repair", "Repulse", "Return", "Reward", "Ruin", "Separate", "Start", "Stop", "Strange", "Struggle", "Succeed", "Support", "Suppress", "Take", "Threaten", "Transform", "Trap", "Travel", "Triumph", "Truce", "Trust", "Use", "Usurp", "Waste"],
    actions2: ["Advantage", "Adversity", "Agreement", "Animal", "Attention", "Balance", "Battle", "Benefits", "Building", "Burden", "Bureaucracy", "Business", "Chaos", "Comfort", "Completion", "Conflict", "Cooperation", "Danger", "Defense", "Depletion", "Disadvantage", "Distraction", "Elements", "Emotion", "Enemy", "Energy", "Environment", "Expectation", "Exterior", "Extravagance", "Failure", "Fame", "Fear", "Freedom", "Friend", "Goal", "Group", "Health", "Hindrance", "Home", "Hope", "Idea", "Illness", "Illusion", "Individual", "Information", "Innocent", "Intellect", "Interior", "Investment", "Leadership", "Legal", "Location", "Military", "Misfortune", "Mundane", "Nature", "Needs", "News", "Normal", "Object", "Obscurity", "Official", "Opposition", "Outside", "Pain", "Path", "Peace", "People", "Personal", "Physical", "Plot", "Portal", "Possessions", "Poverty", "Power", "Prison", "Project", "Protection", "Reassurance", "Representative", "Riches", "Safety", "Strength", "Success", "Suffering", "Surprise", "Tactic", "Technology", "Tension", "Time", "Trial", "Value", "Vehicle", "Victory", "Vulnerability", "Weapon", "Weather", "Work", "Wound"],
};

export const GENRES = ["Fantasy", "Sci-Fi", "Horror", "Modern", "Cyberpunk", "Post-Apocalyptic", "Superhero", "Western", "Noir", "Mystery", "Adventure", "Historical"];
export const GAMEPLAY_FOCUSES = ["Role-Playing", "Exploration", "Combat", "Intrigue"];
export const GM_TONES = ["Default (Balanced)", "Gritty and Dangerous", "Heroic and Epic", "Mysterious and Eerie", "Humorous and Lighthearted", "Action-Packed and Fast-Paced"];


// ONE PAGE 5E DATA
export const ABILITY_MODIFIERS: { [score: number]: number } = {
    1: -5, 2: -4, 3: -4, 4: -3, 5: -3, 6: -2, 7: -2, 8: -1, 9: -1, 10: 0, 11: 0,
    12: 1, 13: 1, 14: 2, 15: 2, 16: 3, 17: 3, 18: 4, 19: 4, 20: 5
};

export const PROFICIENCY_BY_LEVEL: { [level: number]: number } = {
    1: 2, 2: 2, 3: 2, 4: 2, 5: 3, 6: 3, 7: 3, 8: 3, 9: 4, 10: 4, 11: 4, 12: 4, 13: 5, 14: 5, 15: 5, 16: 5, 17: 6, 18: 6, 19: 6, 20: 6
};

export const ARCHETYPES = {
    [Archetype.DwarfFighter]: {
        scoreIncrease: ["strength", "constitution"],
        proficiencies: ["Strength", "Dexterity"],
        hitDice: 12,
        speed: 25
    },
    [Archetype.ElfRanger]: {
        scoreIncrease: ["dexterity", "charisma"],
        proficiencies: ["Dexterity", "Wisdom"],
        hitDice: 10,
        speed: 35
    },
    [Archetype.HumanWizard]: {
        scoreIncrease: ["any", "any"],
        proficiencies: ["Intelligence", "Wisdom"],
        hitDice: 10,
        speed: 30
    }
};

export const WEAPONS = [
    { name: "Wand", damage: "1D4", cost: "3G", attackStat: 'dexterity' as 'dexterity' },
    { name: "Sling", damage: "1D4", cost: "2G", attackStat: 'dexterity' as 'dexterity' },
    { name: "Dagger", damage: "1D4", cost: "2G", attackStat: 'dexterity' as 'dexterity' },
    { name: "Staff", damage: "1D6", cost: "10G", attackStat: 'strength' as 'strength' },
    { name: "Mace", damage: "1D6", cost: "5G", attackStat: 'strength' as 'strength' },
    { name: "Axe", damage: "1D8", cost: "10G", attackStat: 'strength' as 'strength' },
    { name: "Hammer", damage: "1D8", cost: "25G", attackStat: 'strength' as 'strength' },
    { name: "Bow", damage: "1D8", cost: "50G", attackStat: 'dexterity' as 'dexterity' },
    { name: "Crossbow", damage: "1D10", cost: "75G", attackStat: 'dexterity' as 'dexterity' },
    { name: "Sword", damage: "2D6", cost: "50G", attackStat: 'strength' as 'strength' }
];

export const ARMOR = [
    { name: "Moon Cloak", ac: "11 + Wis", penalty: 0, cost: "10G" },
    { name: "Burlap Tunic", ac: "11 + Dex", penalty: 0, cost: "25G" },
    { name: "Leather Armor", ac: "12 + Dex", penalty: 0, cost: "50G" },
    { name: "Chainmail Armor", ac: 14, penalty: -1, cost: "75G" },
    { name: "Platemail Armor", ac: 15, penalty: -2, cost: "50G" } // Corrected from SOG to 50G
];

export const SPELLS = [
    { name: "Acid Orb", range: "60 Feet", use: "1D4 DMG per Lvl", attack: true },
    { name: "Necrotic Chill", range: "Touch", use: "1D6 DMG per Lvl", attack: true },
    { name: "Flame Bolt", range: "120 Feet", use: "1D8 DMG per Lvl", attack: true },
    { name: "Light as Air", range: "Touch", use: "Float 5ft in air per Lvl", attack: false },
    { name: "Create Light", range: "Touch", use: "Illuminate 10ft per Lvl", attack: false },
    { name: "Ease Pain", range: "Touch", use: "Heal 1D4 HP per Lvl", attack: false }
];

export const EXAMPLE_MONSTERS: Monster[] = [
    { name: "Goblin", attack: "Dagger +2/1D4", ac: 15, hp: 7, cr: "1/4", xp: 50 },
    { name: "Skeleton", attack: "Sword +4/1D6", ac: 13, hp: 13, cr: "1/4", xp: 50 },
    { name: "Zombie", attack: "Necro Bite +3/1D6+1", ac: 8, hp: 22, cr: "1/4", xp: 50 },
    { name: "Vampire Bat", attack: "Drain +4/2D4", ac: 12, hp: 22, cr: "1/8", xp: 25 },
    { name: "Dire Wolf", attack: "Bite +5/2D6", ac: 14, hp: 37, cr: "1", xp: 200 },
    { name: "Little Dragon", attack: "Fire Blast +4/3D6", ac: 17, hp: 38, cr: "2", xp: 450 }
];
