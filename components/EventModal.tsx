
import React from 'react';
import { RandomEvent } from '../types';
import Spinner from './Spinner';

interface EventModalProps {
    event: RandomEvent;
    onClose: () => void;
    onInterpret: () => void;
    isLoading: boolean;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, onInterpret, isLoading }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg text-center border border-sky-500">
                <h2 className="text-2xl font-bold mb-4 text-sky-300 mate-font">Random Event!</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-400">Focus:</h3>
                        <p className="text-xl text-white">{event.focus}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-400">Meaning:</h3>
                        <p className="text-xl text-white">{event.meaning}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-600">
                        <button
                            onClick={onInterpret}
                            disabled={isLoading || !!event.interpretation}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                            {isLoading && <Spinner size="md" />}
                            <span className="ml-2">✨ Interpret with AI</span>
                        </button>
                        {event.interpretation && (
                            <div className="mt-3 text-left bg-gray-900 p-3 rounded-md text-gray-300 text-sm">
                                {event.interpretation}
                            </div>
                        )}
                    </div>
                </div>
                <button onClick={onClose} className="mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-md transition-colors">Close</button>
            </div>
        </div>
    );
};

export default EventModal;
