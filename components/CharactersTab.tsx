import React from 'react';
import { Character } from '../types';
import ListManager from './ListManager';

type ItemManagerType = 'thread' | 'character' | 'party' | 'weapon' | 'armor' | 'spell' | 'inventory';

interface CharactersTabProps {
    characters: Character[];
    onAddItem: (type: ItemManagerType, name: string, elaborate: boolean, details: { description: string }) => void;
    onRemoveItem: (type: ItemManagerType, index: number) => void;
    isLoading: Record<string, boolean>;
}

const CharactersTab: React.FC<CharactersTabProps> = ({ characters, onAddItem, onRemoveItem, isLoading }) => {
    return (
        <div className="tab-content active">
             <ListManager
                title="Non-Player Characters (NPCs)"
                items={characters}
                onAdd={(name, description, elaborate) => onAddItem('character', name, elaborate, { description })}
                onRemove={(index) => onRemoveItem('character', index)}
                placeholder="New character name..."
                isLoading={!!isLoading['add-character']}
            />
        </div>
    );
};

export default CharactersTab;
