import type { createTerminal } from './terminal.js';

export type KeyName =
    | 'ctrl-c'
    | 'escape'
    | 'enter'
    | 'space'
    | 'q'
    | 'down'
    | 'up'
    | 'right'
    | 'left'
    | 'unknown';

export type Key = {
    name: KeyName;
    value?: string;
};

export type Terminal = ReturnType<typeof createTerminal>;

export type GameSession = {
    render(): void;
    handleKey(key: Key): void;
    dispose(): void;
};

export type Game = {
    title: string;
    description: string;
    createSession(input: {
        terminal: Terminal;
        exit: () => void;
    }): GameSession;
};
