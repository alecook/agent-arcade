import { StringDecoder } from 'node:string_decoder';

export function createTerminal() {
    const decoder = new StringDecoder('utf8');
    const keyHandlers = new Set();
    const cleanupHandlers = new Set();
    let isStarted = false;

    function write(value) {
        process.stdout.write(value);
    }

    function onData(data) {
        const value = decoder.write(data);
        const key = parseKey(value);

        for (const handler of keyHandlers) {
            handler(key);
        }
    }

    function cleanup() {
        if (!isStarted) {
            return;
        }

        isStarted = false;
        process.stdin.off('data', onData);
        process.stdin.setRawMode(false);
        write('\x1b[?25h\x1b[?1049l');

        for (const handler of cleanupHandlers) {
            handler();
        }
    }

    function start() {
        if (isStarted) {
            return;
        }

        isStarted = true;
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', onData);
        write('\x1b[?1049h\x1b[?25l\x1b[2J\x1b[H');
    }

    process.once('exit', cleanup);
    process.once('SIGINT', () => {
        cleanup();
        process.exit(130);
    });
    process.once('SIGTERM', () => {
        cleanup();
        process.exit(143);
    });

    return {
        start,
        cleanup,
        write,
        clear() {
            write('\x1b[2J\x1b[H');
        },
        onKey(handler) {
            keyHandlers.add(handler);

            return () => keyHandlers.delete(handler);
        },
        onCleanup(handler) {
            cleanupHandlers.add(handler);

            return () => cleanupHandlers.delete(handler);
        },
        size() {
            return {
                columns: process.stdout.columns ?? 80,
                rows: process.stdout.rows ?? 24,
            };
        },
    };
}

function parseKey(value) {
    switch (value) {
        case '\u0003':
            return { name: 'ctrl-c' };
        case '\u001b':
            return { name: 'escape' };
        case '\r':
        case '\n':
            return { name: 'enter' };
        case ' ':
            return { name: 'space' };
        case 'q':
        case 'Q':
            return { name: 'q' };
        case 'j':
        case 'J':
            return { name: 'down' };
        case 'k':
        case 'K':
            return { name: 'up' };
        case '\u001b[A':
            return { name: 'up' };
        case '\u001b[B':
            return { name: 'down' };
        case '\u001b[C':
            return { name: 'right' };
        case '\u001b[D':
            return { name: 'left' };
        default:
            return { name: 'unknown', value };
    }
}
