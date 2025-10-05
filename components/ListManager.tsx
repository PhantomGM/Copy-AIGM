import React, { useState } from 'react';
import { ListItem } from '../types';
import Spinner from './Spinner';

interface ListManagerProps {
    title: string;
    items: ListItem[];
    onAdd: (name: string, description: string, elaborate: boolean) => void;
    onRemove: (index: number) => void;
    placeholder: string;
    isLoading: boolean;
}

const ListManager: React.FC<ListManagerProps> = ({ title, items, onAdd, onRemove, placeholder, isLoading }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemDescription, setNewItemDescription] = useState('');
    const [elaborate, setElaborate] = useState(false);

    const handleConfirmAdd = () => {
        if (newItemName.trim()) {
            onAdd(newItemName.trim(), newItemDescription.trim(), elaborate);
            setNewItemName('');
            setNewItemDescription('');
            setElaborate(false);
            setIsAdding(false);
        }
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setNewItemName('');
        setNewItemDescription('');
        setElaborate(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter') {
            handleConfirmAdd();
        }
    }

    // A simple singularization for the button text
    const singularTitle = title.endsWith('s') ? title.slice(0, -1) : title;

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-2 text-sky-300 border-b border-gray-600 pb-2">{title}</h2>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start bg-gray-700 p-2 rounded-md text-sm">
                        <div className="flex-grow pr-2 break-words">
                            <strong className="text-white">{item.name}</strong>
                            {item.description && <p className="text-gray-400 text-xs italic mt-1 whitespace-pre-wrap">{item.description}</p>}
                        </div>
                        <button onClick={() => onRemove(index)} className="remove-btn text-red-400 hover:text-red-300 font-bold flex-shrink-0 text-xl leading-none ml-2">&times;</button>
                    </div>
                ))}
            </div>
            
            {isAdding ? (
                <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        autoFocus
                    />
                    <textarea
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        placeholder="Description (optional, for AI context)"
                        rows={2}
                        className="w-full bg-gray-600 border border-gray-500 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-y"
                    />
                    <label className="flex items-center text-sm text-gray-400 mb-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={elaborate}
                            onChange={(e) => setElaborate(e.target.checked)}
                            className="h-4 w-4 rounded bg-gray-900 border-gray-500 text-indigo-500 focus:ring-indigo-600"
                        />
                        <span className="ml-2">✨ Elaborate with AI</span>
                    </label>
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleConfirmAdd}
                            disabled={isLoading}
                            className="flex-grow bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-bold py-2 px-3 rounded-md transition-colors flex items-center justify-center"
                        >
                            {isLoading ? <Spinner size="sm" /> : "Confirm"}
                        </button>
                        <button 
                            onClick={handleCancelAdd}
                            className="flex-grow bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-3 rounded-md transition-colors"
                >
                    + Add {singularTitle}
                </button>
            )}
        </div>
    );
};

export default ListManager;
