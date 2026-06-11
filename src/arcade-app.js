import { createTerminal } from './terminal.js';
import { createGames } from './games/mock-games.js';

export async function runArcade({ isMockMode = true } = {}) {
    const terminal = createTerminal();
    const games = createGames();
    let selectedIndex = 0;
    let currentScreen = 'menu';
    let activeGame = null;
    let unsubscribeGame = null;
    let resolveDone;

    const done = new Promise((resolve) => {
        resolveDone = resolve;
    });

    terminal.start();
    renderMenu();

    terminal.onKey((key) => {
        if (key.name === 'ctrl-c') {
            quit();
            return;
        }

        if (currentScreen === 'game' && activeGame) {
            activeGame.handleKey(key);
            return;
        }

        if (key.name === 'q' || key.name === 'escape') {
            quit();
            return;
        }

        if (key.name === 'up') {
            selectedIndex = Math.max(0, selectedIndex - 1);
            renderMenu();
            return;
        }

        if (key.name === 'down') {
            selectedIndex = Math.min(games.length, selectedIndex + 1);
            renderMenu();
            return;
        }

        if (key.name === 'enter' || key.name === 'space') {
            if (selectedIndex === games.length) {
                quit();
                return;
            }

            openGame(games[selectedIndex]);
        }
    });

    terminal.onCleanup(() => {
        unsubscribeGame?.();
    });

    await done;

    function renderMenu() {
        currentScreen = 'menu';
        activeGame = null;
        unsubscribeGame?.();
        unsubscribeGame = null;

        const lines = [
            style('Agent Arcade', 'title'),
            '',
            isMockMode ? 'Agent is working. Pick something low-stakes while it cooks.' : 'Pick a game.',
            '',
            ...games.map((game, index) => formatMenuLine(index, game.title, game.description)),
            formatMenuLine(games.length, 'Quit', 'Return to the terminal'),
            '',
            dim('up/down or j/k to move, enter to select, q to quit'),
        ];

        terminal.clear();
        terminal.write(centerBlock(lines, terminal.size().columns, terminal.size().rows));
    }

    function openGame(game) {
        currentScreen = 'game';
        activeGame = game.createSession({
            terminal,
            exit: renderMenu,
        });
        unsubscribeGame = activeGame.dispose;
        activeGame.render();
    }

    function formatMenuLine(index, title, description) {
        const marker = index === selectedIndex ? cyan('>') : ' ';
        const label = index === selectedIndex ? bright(title) : title;

        return `${marker} ${label} ${dim('- ' + description)}`;
    }

    function quit() {
        unsubscribeGame?.();
        terminal.cleanup();
        resolveDone();
    }
}

export function centerBlock(lines, columns, rows) {
    const width = Math.max(...lines.map(stripAnsi).map((line) => line.length));
    const leftPadding = Math.max(0, Math.floor((columns - width) / 2));
    const topPadding = Math.max(0, Math.floor((rows - lines.length) / 3));
    const pad = ' '.repeat(leftPadding);

    return `${'\n'.repeat(topPadding)}${lines.map((line) => `${pad}${line}`).join('\n')}`;
}

export function style(value, name) {
    if (name === 'title') {
        return `\x1b[38;5;220m\x1b[1m${value}\x1b[0m`;
    }

    return value;
}

export function bright(value) {
    return `\x1b[1m${value}\x1b[0m`;
}

export function cyan(value) {
    return `\x1b[38;5;81m${value}\x1b[0m`;
}

export function dim(value) {
    return `\x1b[2m${value}\x1b[0m`;
}

function stripAnsi(value) {
    return value.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '');
}
