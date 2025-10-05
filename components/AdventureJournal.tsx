
import React from 'react';

interface AdventureJournalProps {
    journal: string;
    journalRef: React.RefObject<HTMLTextAreaElement>;
}

const AdventureJournal: React.FC<AdventureJournalProps> = ({ journal, journalRef }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg h-[400px] flex flex-col">
            <h2 className="text-lg font-bold mb-2 text-sky-300 border-b border-gray-600 pb-2">Adventure Journal</h2>
            <textarea
                ref={journalRef}
                readOnly
                value={journal}
                className="flex-grow w-full bg-gray-900 border border-gray-600 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Your adventure unfolds here..."
            />
        </div>
    );
};

export default AdventureJournal;
