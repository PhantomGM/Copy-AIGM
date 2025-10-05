
import React from 'react';

interface ChaosFactorProps {
    chaosFactor: number;
    setChaosFactor: (value: number) => void;
}

const ChaosFactor: React.FC<ChaosFactorProps> = ({ chaosFactor, setChaosFactor }) => {
    const handleDecrement = () => {
        if (chaosFactor > 1) setChaosFactor(chaosFactor - 1);
    };

    const handleIncrement = () => {
        if (chaosFactor < 9) setChaosFactor(chaosFactor + 1);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-2 text-sky-300 border-b border-gray-600 pb-2">Chaos Factor</h2>
            <div className="flex items-center justify-center space-x-4">
                <button onClick={handleDecrement} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors">-</button>
                <span className="text-5xl font-bold text-white">{chaosFactor}</span>
                <button onClick={handleIncrement} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition-colors">+</button>
            </div>
        </div>
    );
};

export default ChaosFactor;
