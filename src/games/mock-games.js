import { bright, centerBlock, cyan, dim, style } from '../arcade-app.js';

export function createGames() {
    return [
        createRaidPegDropGame(),
        createPlaceholderGame({
            title: 'Dungeon Cards',
            description: 'A future deck-builder for queue downtime',
            body: 'Draft tiny spells, survive tiny rooms. Not built yet.',
        }),
        createPlaceholderGame({
            title: 'Repair Bay',
            description: 'A future timing puzzle about fixing airships',
            body: 'Patch wires, vent steam, beat the clock. Not built yet.',
        }),
    ];
}

function createRaidPegDropGame() {
    return {
        title: 'Raid Peg Drop',
        description: 'A tiny fantasy peg-drop prototype',
        createSession({ terminal, exit }) {
            const width = 37;
            const height = 17;
            let launcher = Math.floor(width / 2);
            let score = 0;
            let drops = 5;
            let message = 'Move with left/right, drop with space.';
            let ball = null;
            let timer = null;
            let pegs = createPegMap(width, height);

            function render() {
                const board = [];

                for (let y = 0; y < height; y += 1) {
                    let row = '';

                    for (let x = 0; x < width; x += 1) {
                        const key = `${x},${y}`;

                        if (ball && Math.round(ball.x) === x && Math.round(ball.y) === y) {
                            row += bright('o');
                        } else if (pegs.has(key)) {
                            row += cyan('*');
                        } else if (y === height - 1 && x % 6 === 0) {
                            row += dim('|');
                        } else {
                            row += ' ';
                        }
                    }

                    board.push(`  ${dim('|')}${row}${dim('|')}`);
                }

                const launcherLine = `  ${' '.repeat(launcher)}${style('v', 'title')}`;
                const lines = [
                    style('Raid Peg Drop', 'title'),
                    '',
                    `Score: ${score}    Drops: ${drops}`,
                    dim(message),
                    '',
                    launcherLine,
                    `  ${dim('+')}${dim('-'.repeat(width))}${dim('+')}`,
                    ...board,
                    `  ${dim('+')}${dim('-'.repeat(width))}${dim('+')}`,
                    '',
                    dim('left/right: aim, space/enter: drop, r: reset, q/esc: arcade'),
                ];

                terminal.clear();
                terminal.write(centerBlock(lines, terminal.size().columns, terminal.size().rows));
            }

            function handleKey(key) {
                if (key.name === 'q' || key.name === 'escape') {
                    dispose();
                    exit();
                    return;
                }

                if (key.value === 'r' || key.value === 'R') {
                    dispose();
                    score = 0;
                    drops = 5;
                    ball = null;
                    pegs = createPegMap(width, height);
                    message = 'Fresh board. Drop another orb.';
                    render();
                    return;
                }

                if (ball) {
                    return;
                }

                if (key.name === 'left') {
                    launcher = Math.max(1, launcher - 1);
                    render();
                    return;
                }

                if (key.name === 'right') {
                    launcher = Math.min(width - 2, launcher + 1);
                    render();
                    return;
                }

                if (key.name === 'space' || key.name === 'enter') {
                    dropBall();
                }
            }

            function dropBall() {
                if (drops <= 0) {
                    message = 'No drops left. Press r to reset.';
                    render();
                    return;
                }

                drops -= 1;
                ball = { x: launcher, y: 0, vx: Math.random() > 0.5 ? 0.35 : -0.35 };
                message = 'Orb loose. Let gravity handle it.';
                timer = setInterval(tick, 70);
            }

            function tick() {
                if (!ball) {
                    return;
                }

                ball.y += 0.45;
                ball.x += ball.vx;

                if (ball.x <= 0 || ball.x >= width - 1) {
                    ball.vx *= -1;
                    ball.x = Math.max(0, Math.min(width - 1, ball.x));
                }

                const pegKey = `${Math.round(ball.x)},${Math.round(ball.y)}`;

                if (pegs.has(pegKey)) {
                    pegs.delete(pegKey);
                    score += 100;
                    ball.vx = (Math.random() > 0.5 ? 1 : -1) * (0.25 + Math.random() * 0.45);
                    message = randomHitMessage();
                }

                if (ball.y >= height) {
                    const bucket = Math.floor(ball.x / 6);
                    const bonus = bucket % 2 === 0 ? 250 : 50;
                    score += bonus;
                    message = bonus >= 250 ? 'Critical bucket. Loot sparks everywhere.' : 'Clean drop. Modest loot.';
                    ball = null;
                    clearInterval(timer);
                    timer = null;
                }

                render();
            }

            function dispose() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }

            return {
                render,
                handleKey,
                dispose,
            };
        },
    };
}

function createPlaceholderGame({ title, description, body }) {
    return {
        title,
        description,
        createSession({ terminal, exit }) {
            function render() {
                const lines = [
                    style(title, 'title'),
                    '',
                    body,
                    '',
                    dim('Press q or escape to return to the arcade.'),
                ];

                terminal.clear();
                terminal.write(centerBlock(lines, terminal.size().columns, terminal.size().rows));
            }

            function handleKey(key) {
                if (key.name === 'q' || key.name === 'escape') {
                    exit();
                }
            }

            return {
                render,
                handleKey,
                dispose() {},
            };
        },
    };
}

function createPegMap(width, height) {
    const pegs = new Set();

    for (let y = 2; y < height - 2; y += 2) {
        const offset = y % 4 === 0 ? 3 : 0;

        for (let x = 4 + offset; x < width - 3; x += 6) {
            pegs.add(`${x},${y}`);
        }
    }

    return pegs;
}

function randomHitMessage() {
    const messages = [
        'Peg hit. Tiny boss health bar moves.',
        'Combo ping. The raid approves.',
        'Arcane ricochet. Very scientific.',
        'Loot peg shattered.',
    ];

    return messages[Math.floor(Math.random() * messages.length)];
}
