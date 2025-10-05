
import React, { useRef } from 'react';

interface HeaderProps {
    onSaveGame: () => void;
    onLoadGame: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ onSaveGame, onLoadGame }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <header className="text-center mb-6 border-b border-gray-700 pb-4 relative">
            <h1 className="text-4xl font-bold mate-font text-sky-400">Mythic</h1>
            <p className="text-xl text-gray-400 mate-font">Game Master Emulator</p>
            <div className="absolute top-0 right-0 flex space-x-2">
                <button
                    onClick={onSaveGame}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                    title="Save Game State"
                >
                    Save Game
                </button>
                <button
                    onClick={handleLoadClick}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                    title="Load Game State from File"
                >
                    Load Game
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onLoadGame}
                    accept=".json"
                    className="hidden"
                />
            </div>
        </header>
    );
};

export default Header;
