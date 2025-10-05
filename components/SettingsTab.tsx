
import React from 'react';
import { GameSettings } from '../types';
import { GENRES, GM_TONES, GAMEPLAY_FOCUSES } from '../constants';

interface SettingsTabProps {
    settings: GameSettings;
    setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings }) => {
    const handleCheckboxChange = (category: 'genres' | 'gameplayFocus', value: string) => {
        setSettings(prev => {
            const currentValues = prev[category];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [category]: newValues };
        });
    };

    return (
        <div className="tab-content active">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-amber-300 mb-2">Genre</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                        {GENRES.map(genre => (
                            <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.genres.includes(genre)}
                                    onChange={() => handleCheckboxChange('genres', genre)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"
                                />
                                <span>{genre}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-amber-300 mb-2">GM Tone / Narrative Style</h3>
                    <select
                        id="gm-tone"
                        value={settings.gmTone}
                        onChange={e => setSettings(prev => ({ ...prev, gmTone: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-no-repeat bg-right pr-8"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                    >
                        {GM_TONES.map(tone => <option key={tone}>{tone}</option>)}
                    </select>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-amber-300 mb-2">Gameplay Focus</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        {GAMEPLAY_FOCUSES.map(focus => (
                            <label key={focus} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.gameplayFocus.includes(focus)}
                                    onChange={() => handleCheckboxChange('gameplayFocus', focus)}
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-600"
                                />
                                <span>{focus}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-amber-300 mb-2">Lines (Content to Exclude)</h3>
                        <textarea
                            id="lines-input"
                            rows={3}
                            value={settings.lines}
                            onChange={e => setSettings(prev => ({ ...prev, lines: e.target.value }))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 resize-y focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g., harm to children, graphic torture"
                        ></textarea>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-amber-300 mb-2">Veils (Content to 'Fade to Black')</h3>
                        <textarea
                            id="veils-input"
                            rows={3}
                            value={settings.veils}
                            onChange={e => setSettings(prev => ({ ...prev, veils: e.target.value }))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 resize-y focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g., romance scenes, extreme gore"
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
