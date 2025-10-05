import React, { useState } from 'react';
import Spinner from './Spinner';

interface ChatInputProps {
    onSubmit: (input: string) => void;
    isLoading: boolean;
    isWaitingForCheck: boolean;
    isVoiceSessionActive: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading, isWaitingForCheck, isVoiceSessionActive }) => {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        const trimmedInput = input.trim();
        if (trimmedInput) {
            onSubmit(trimmedInput);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex space-x-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isVoiceSessionActive ? "Voice chat is active..." :
                        isWaitingForCheck ? "Awaiting proficiency check roll..." : 
                        "What do you do? Ask a question?"
                    }
                    rows={2}
                    className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none disabled:bg-gray-800 disabled:cursor-not-allowed"
                    disabled={isWaitingForCheck || isLoading || isVoiceSessionActive}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || isWaitingForCheck || isVoiceSessionActive}
                    className="bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                    {isLoading && <Spinner size="md" />}
                    <span className="ml-2">Send</span>
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
