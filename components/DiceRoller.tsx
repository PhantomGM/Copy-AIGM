
import React, { useState } from 'react';
import { parseAndRoll } from '../services/onePage5e';

interface DiceRollerProps {
    logToJournal: (text: string) => void;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ logToJournal }) => {
    const [lastRoll, setLastRoll] = useState<string | null>(null);
    const [customRoll, setCustomRoll] = useState<string>('');

    const displayResult = (message: string) => {
        setLastRoll(message);
        setTimeout(() => setLastRoll(null), 4000);
    };

    const handleRoll = (sides: number) => {
        const result = Math.floor(Math.random() * sides) + 1;
        const rollString = `D${sides} Roll: ${result}`;
        displayResult(rollString);
        logToJournal(`-- ${rollString} --`);
    };

    const handleCustomRoll = () => {
        if (!customRoll.trim()) return;

        const result = parseAndRoll(customRoll);

        if (!result) {
            displayResult("Invalid format");
            return;
        }

        const { total, rolls, modifier, expression } = result;

        const journalModifierString = modifier !== 0 ? ` | Modifier: ${modifier > 0 ? '+' : ''}${modifier}` : '';
        const rollsString = rolls.length > 1 ? `Rolls: [${rolls.join(', ')}]` : `Roll: ${rolls[0]}`;

        const displayString = `${expression.toUpperCase()} = ${total}`;
        const journalString = `-- Custom Roll: ${expression.toUpperCase()} -> ${rollsString}${journalModifierString} | Total: ${total} --`;
        
        displayResult(displayString);
        logToJournal(journalString);
        setCustomRoll('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCustomRoll();
        }
    };

    const dice = [4, 6, 8, 10, 12, 20, 100];

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-3 text-sky-300 border-b border-gray-600 pb-2">Dice Roller</h2>
            
            {/* Quick Roll Buttons */}
            <div className="grid grid-cols-4 gap-2 text-center">
                {dice.slice(0, 4).map(sides => (
                    <button
                        key={sides}
                        onClick={() => handleRoll(sides)}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-2 rounded-md transition-colors"
                    >
                        D{sides}
                    </button>
                ))}
                {dice.slice(4).map(sides => (
                     <button
                        key={sides}
                        onClick={() => handleRoll(sides)}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-2 rounded-md transition-colors col-span-1"
                    >
                        D{sides}
                    </button>
                ))}
            </div>

            {/* Custom Roll Input */}
            <div className="mt-4 flex space-x-2">
                <input
                    type="text"
                    value={customRoll}
                    onChange={(e) => setCustomRoll(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., 2d6+3"
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
                <button
                    onClick={handleCustomRoll}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-1 px-3 rounded-md transition-colors text-sm"
                >
                    Roll
                </button>
            </div>

            {/* Result Display */}
            <div className="mt-3 text-center text-sky-300 font-bold text-lg h-7">
                {lastRoll && (
                    <span className="animate-pulse">{lastRoll}</span>
                )}
            </div>
        </div>
    );
};

export default DiceRoller;
