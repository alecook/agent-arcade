import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cliPath = fileURLToPath(new URL('../cli.js', import.meta.url));

type PluginOptions = {
    commandName?: unknown;
    keybind?: unknown;
    args?: unknown;
};

type TuiApi = {
    command?: {
        register(callback: () => unknown[]): void;
    };
    renderer: {
        suspend(): void;
        resume(): void;
        requestRender(): void;
        currentRenderBuffer: {
            clear(): void;
        };
    };
    state: {
        path: {
            directory: string;
        };
    };
    ui: {
        toast(input: {
            variant: 'error';
            title: string;
            message: string;
        }): void;
    };
};

const plugin = {
    id: 'agent-arcade',
    tui: async (api: TuiApi, options: PluginOptions = {}) => {
        const commandName = typeof options.commandName === 'string' ? options.commandName : 'arcade';
        const keybind = typeof options.keybind === 'string' ? options.keybind : undefined;
        const cliArgs = readCliArgs(options.args);

        api.command?.register(() => [
            {
                title: 'Agent Arcade',
                value: 'agent-arcade.open',
                description: 'Play Agent Arcade in the current terminal while the agent works',
                category: 'Agent Arcade',
                keybind,
                slash: {
                    name: commandName,
                },
                onSelect: async (dialog?: { clear(): void }) => {
                    dialog?.clear();
                    await runInCurrentTerminal(api, cliArgs);
                },
            },
        ]);
    },
};

export default plugin;

async function runInCurrentTerminal(api: TuiApi, args: string[]): Promise<void> {
    api.renderer.suspend();
    api.renderer.currentRenderBuffer.clear();

    try {
        await new Promise<void>((resolve, reject) => {
            const child = spawn(process.execPath, [cliPath, ...args], {
                cwd: api.state.path.directory,
                stdio: 'inherit',
                shell: false,
            });

            child.once('error', reject);
            child.once('exit', (code, signal) => {
                if (code === 0 || code === 130 || signal === 'SIGINT') {
                    resolve();
                    return;
                }

                reject(new Error(`Agent Arcade exited with ${signal ? `signal ${signal}` : `code ${code}`}`));
            });
        });
    } catch (error) {
        api.ui.toast({
            variant: 'error',
            title: 'Agent Arcade failed',
            message: error instanceof Error ? error.message : String(error),
        });
    } finally {
        api.renderer.currentRenderBuffer.clear();
        api.renderer.resume();
        api.renderer.requestRender();
    }
}

function readCliArgs(args: unknown): string[] {
    if (!Array.isArray(args)) {
        return ['--mock'];
    }

    return args.every((arg) => typeof arg === 'string') ? args : ['--mock'];
}
