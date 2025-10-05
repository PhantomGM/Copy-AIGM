import React from 'react';
import { Character } from '../types';
import ListManager from './ListManager';

type ItemManagerType = 'thread' | 'character' | 'party' | 'weapon' | 'armor' | 'spell' | 'inventory';

interface PartyTabProps {
    partyMembers: Character[];
    onAddItem: (type: ItemManagerType, name: string, elaborate: boolean, details: { description: string }) => void;
    onRemoveItem: (type: ItemManagerType, index: number) => void;
    isLoading: Record<string, boolean>;
}

const PartyTab: React.FC<PartyTabProps> = ({ partyMembers, onAddItem, onRemoveItem, isLoading }) => {
    return (
        <div className="tab-content active">
             <ListManager
                title="Party Members"
                items={partyMembers}
                onAdd={(name, description, elaborate) => onAddItem('party', name, elaborate, { description })}
                onRemove={(index) => onRemoveItem('party', index)}
                placeholder="New party member name..."
                isLoading={!!isLoading['add-party']}
            />
        </div>
    );
};

export default PartyTab;
