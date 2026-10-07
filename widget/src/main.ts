import { show, WidgetParams } from './views/paper';

const supportedAPI = ['paper']; // enlist all methods supported by API (e.g. `orkgw('paper', { language: 'en' });`)

type WidgetQueueStub = {
    (api?: string, params?: WidgetParams): void;
    q?: [api?: string, params?: WidgetParams][];
};

type WidgetWindow = Window & Record<string, unknown>;

/**
    Method that handles all API calls
*/
function apiHandler(api?: string, params?: WidgetParams): void {
    if (!api) {
        throw Error('API method required');
    }
    const method = api.toLowerCase();

    if (supportedAPI.indexOf(method) === -1) {
        throw Error(`Method ${method} is not supported`);
    }

    switch (method) {
        case 'paper':
            show(params);
            break;
        default:
            console.error(`No handler defined for ${method}`);
    }
}

/**
    The main entry of the application
*/
function app(win: Window): void {
    const w = win as WidgetWindow;
    const globalName = w['ORKG-Widget'];
    if (typeof globalName !== 'string') {
        // the embed snippet is absent — nothing to bootstrap
        return;
    }

    // all methods that were called till now and stored in queue
    // needs to be called now
    const globalObject = w[globalName] as WidgetQueueStub | undefined;
    const queue = globalObject?.q;
    if (queue) {
        for (let i = 0; i < queue.length; i += 1) {
            apiHandler(queue[i][0], queue[i][1]);
        }
    }

    // override the temporary queue stub with the real handler so API calls
    // made after widget.js has loaded run immediately
    w[globalName] = apiHandler;
}

app(window);
