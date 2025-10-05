import { GoogleGenAI, GenerateContentResponse, Blob, Modality } from "@google/genai";
import { GameSettings, CharacterSheet, Thread, Character } from '../types';

export let ai: GoogleGenAI;

try {
    // FIX: Initialize GoogleGenAI with a named apiKey parameter as per the guidelines.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
} catch (error) {
    console.error("Failed to initialize GoogleGenAI. Is the API_KEY environment variable set?", error);
}

const generateContentWithSystemInstruction = async (prompt: string, systemInstruction: string): Promise<string> => {
    if (!ai) {
        throw new Error("Gemini AI not initialized. Please check your API_KEY.");
    }
    try {
        // FIX: Use ai.models.generateContent as per the guidelines.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        // FIX: Access the 'text' property directly from the response object.
        return response.text;
    } catch (error) {
        console.error("Error generating content:", error);
        return "Sorry, I encountered an error while processing your request.";
    }
};

export const getSystemInstruction = (settings: GameSettings, pc: CharacterSheet, threads: Thread[], npcs: Character[]): string => {
    return `You are a solo RPG game master emulator. Your goal is to facilitate a compelling story.
Game Settings:
- Genres: ${settings.genres.join(', ') || 'Not specified'}
- GM Tone: ${settings.gmTone}
- Gameplay Focus: ${settings.gameplayFocus.join(', ') || 'Not specified'}
- Lines (Content to Exclude): ${settings.lines || 'None'}
- Veils (Content to Fade to Black): ${settings.veils || 'None'}

Player Character (${pc.name}):
${pc.description}
- Archetype: ${pc.archetype}
- Level: ${pc.level}

Active Story Threads:
${threads.map(t => `- ${t.name}: ${t.description}`).join('\n') || 'No active threads.'}

Key NPCs:
${npcs.map(c => `- ${c.name}: ${c.description}`).join('\n') || 'No key NPCs.'}

Respond from the perspective of the game world. Be descriptive and engaging.
When a proficiency check is needed, respond ONLY with a JSON object like this: {"requires_check": {"action": "a brief description of the action", "proficiency": "The most relevant character proficiency e.g., Strength, Dexterity", "dc": "a number from 10-20 representing the difficulty"}}. Do not add any other text.
For all other responses, just provide the narrative text. Do not break character. Do not output JSON unless it's a proficiency check.`;
};

export const getChatResponse = async (
    settings: GameSettings,
    pc: CharacterSheet,
    threads: Thread[],
    npcs: Character[],
    journal: string,
    userInput: string
): Promise<string> => {
    const systemInstruction = getSystemInstruction(settings, pc, threads, npcs);
    const prompt = `Here is the story so far:\n${journal}\n\nPlayer action: "${userInput}"\n\nWhat happens next?`;
    return generateContentWithSystemInstruction(prompt, systemInstruction);
};

export const getElaboration = async (
    settings: GameSettings,
    pc: CharacterSheet,
    itemType: string,
    itemName: string,
    itemDescription?: string
): Promise<string> => {
    const systemInstruction = `You are a creative assistant for a solo RPG. Elaborate on the user-provided description for the item below, making it more vivid and integrated into the game world. Keep it to 1-3 sentences. If no description is provided, create one from scratch.
Game Settings:
- Genres: ${settings.genres.join(', ') || 'Not specified'}
- GM Tone: ${settings.gmTone}
Just provide the final description, no extra text or conversational filler.`;
    const prompt = `Item Type: ${itemType}
Item Name: "${itemName}"
${itemDescription ? `User-provided description: "${itemDescription}"` : ''}

Elaborated Description:`;
    return generateContentWithSystemInstruction(prompt, systemInstruction);
};

export const getSceneSuggestion = async (
    settings: GameSettings,
    pc: CharacterSheet,
    threads: Thread[],
    journal: string
): Promise<string> => {
    const systemInstruction = `You are a creative assistant for a solo RPG. Suggest a compelling next scene based on the story so far.
Game Settings:
- Genres: ${settings.genres.join(', ') || 'Not specified'}
- GM Tone: ${settings.gmTone}
Player Character: ${pc.name} - ${pc.description}
Active Threads: ${threads.map(t => t.name).join(', ') || 'None'}
Just provide the scene title/goal, no extra text.`;
    const prompt = `Story so far:\n${journal}\n\nSuggest a concise, compelling next scene title or goal.`;
    return generateContentWithSystemInstruction(prompt, systemInstruction);
};

export const interpretEvent = async (
    settings: GameSettings,
    pc: CharacterSheet,
    journal: string,
    eventFocus: string,
    eventMeaning: string
): Promise<string> => {
    const systemInstruction = `You are a solo RPG game master emulator. Interpret the following random event in the context of the current story.
Game Settings:
- Genres: ${settings.genres.join(', ') || 'Not specified'}
- GM Tone: ${settings.gmTone}
Player Character: ${pc.name} - ${pc.description}
Respond with 2-3 sentences describing how this event manifests in the game world.`;
    const prompt = `Story so far:\n${journal}\n\nRandom Event Occurred:\n- Focus: ${eventFocus}\n- Meaning: ${eventMeaning}\n\nInterpretation:`;
    return generateContentWithSystemInstruction(prompt, systemInstruction);
};

export const describeCharacter = async (settings: GameSettings, pcName: string): Promise<string> => {
    if (!pcName) return "Please enter a name first.";
    const systemInstruction = `You are a creative assistant for a solo RPG. Write a brief, compelling character description (2-3 sentences) based on the name and game settings.
Game Settings:
- Genres: ${settings.genres.join(', ') || 'Not specified'}
- GM Tone: ${settings.gmTone}
Focus on appearance, demeanor, or a key detail. Just provide the description, no extra text.`;
    const prompt = `Character Name: ${pcName}`;
    return generateContentWithSystemInstruction(prompt, systemInstruction);
};

// Voice Chat Audio Helpers

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}