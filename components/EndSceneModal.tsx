
import React from 'react';

interface EndSceneModalProps {
    onConfirm: (wasInControl: boolean) => void;
}

const EndSceneModal: React.FC<EndSceneModalProps> = ({ onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md text-center border border-red-500">
                <h2 className="text-2xl font-bold mb-4 text-red-400 mate-font">End of Scene</h2>
                <p className="mb-4 text-gray-300">Were your characters mostly in control of the scene?</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => onConfirm(true)} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-md transition-colors">Yes</button>
                    <button onClick={() => onConfirm(false)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-md transition-colors">No</button>
                </div>
            </div>
        </div>
    );
};

export default EndSceneModal;
