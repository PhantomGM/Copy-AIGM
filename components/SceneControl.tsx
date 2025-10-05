
import React from 'react';
import Spinner from './Spinner';

interface SceneControlProps {
    expectedScene: string;
    setExpectedScene: (value: string) => void;
    onSuggestScene: () => void;
    onTestScene: () => void;
    onEndScene: () => void;
    isLoading: boolean;
}

const SceneControl: React.FC<SceneControlProps> = ({ expectedScene, setExpectedScene, onSuggestScene, onTestScene, onEndScene, isLoading }) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onTestScene();
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-3 text-sky-300 border-b border-gray-600 pb-2">Scene Control</h2>
            <div className="space-y-3">
                <div className="relative">
                    <input
                        type="text"
                        value={expectedScene}
                        onChange={(e) => setExpectedScene(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter Expected Scene..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    {isLoading && (
                         <div className="absolute right-2 top-1/2 -translate-y-1/2">
                             <div className="w-5 h-5 border-2 border-sky-300 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                    )}
                </div>
                <button
                    onClick={onSuggestScene}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                    ✨ Suggest Scene Idea
                </button>
                <button
                    onClick={onTestScene}
                    disabled={isLoading}
                    className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                    {isLoading && <Spinner size="md" />}
                    <span className="ml-2">Start Scene</span>
                </button>
                <button
                    onClick={onEndScene}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    End Scene
                </button>
            </div>
        </div>
    );
};

export default SceneControl;
