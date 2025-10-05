import React from 'react';
import { Thread } from '../types';
import ListManager from './ListManager';

type ItemManagerType = 'thread' | 'character' | 'weapon' | 'armor' | 'spell' | 'inventory';

interface ThreadsTabProps {
    threads: Thread[];
    onAddItem: (type: ItemManagerType, name: string, elaborate: boolean, details: { description: string }) => void;
    onRemoveItem: (type: ItemManagerType, index: number) => void;
    isLoading: Record<string, boolean>;
}

const ThreadsTab: React.FC<ThreadsTabProps> = ({ threads, onAddItem, onRemoveItem, isLoading }) => {
    return (
        <div className="tab-content active">
             <ListManager
                title="Threads"
                items={threads}
                onAdd={(name, description, elaborate) => onAddItem('thread', name, elaborate, { description })}
                onRemove={(index) => onRemoveItem('thread', index)}
                placeholder="New thread name..."
                isLoading={!!isLoading['add-thread']}
            />
        </div>
    );
};

export default ThreadsTab;
