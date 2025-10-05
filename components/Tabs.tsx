
import React from 'react';

type TabName = 'Play' | 'Character Info' | 'Threads' | 'Characters' | 'Party' | 'Monsters' | 'Encounters' | 'Settings';

interface TabsProps {
    tabs: TabName[];
    activeTab: TabName;
    setActiveTab: (tab: TabName) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <nav className="flex flex-wrap border-b border-gray-700">
            {tabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 font-semibold text-sm transition-colors duration-200 focus:outline-none ${
                        activeTab === tab
                            ? 'border-b-2 border-sky-400 text-sky-300'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </nav>
    );
};

export default Tabs;
