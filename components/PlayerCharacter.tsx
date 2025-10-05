
import React from 'react';
import Spinner from './Spinner';

interface PlayerCharacterProps {
    pcName: string;
    setPcName: (name: string) => void;
    pcDescription: string;
    onDescribePc: () => void;
    isLoading: boolean;
}

const PlayerCharacter: React.FC<PlayerCharacterProps> = ({ pcName, setPcName, pcDescription, onDescribePc, isLoading }) => {
    return (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-2 text-amber-300 border-b border-gray-600 pb-2">Player Character</h2>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={pcName}
                    onChange={(e) => setPcName(e.target.value)}
                    placeholder="Enter PC Name..."
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                    onClick={onDescribePc}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-2 px-3 rounded-md transition-colors flex items-center justify-center w-11 h-10"
                    title="Describe PC with AI"
                >
                    {isLoading ? <Spinner size="md" /> : <span>✨</span>}
                </button>
            </div>
            <div className="mt-2 text-gray-400 text-sm italic min-h-[1.25rem]">
                {pcDescription}
            </div>
        </div>
    );
};

export default PlayerCharacter;
