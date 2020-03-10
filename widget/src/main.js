import { show } from './views/paper';

const supportedAPI = ['paper']; // enlist all methods supported by API (e.g. `orkgw('event', 'user-login');`)

/**
    The main entry of the application
*/
function app(window) {
    // all methods that were called till now and stored in queue
    // needs to be called now
    let globalObject = window[window['ORKG-Widget']];
    const queue = globalObject.q;
    if (queue) {
        for (let i = 0; i < queue.length; i++) {
            apiHandler(queue[i][0], queue[i][1]);
        }
    }

    // override temporary (until the app loaded) handler
    // for widget's API calls
    globalObject = apiHandler;
}

/**
    Method that handles all API calls
*/
function apiHandler(api, params) {
    if (!api) {
        throw Error('API method required');
    }
    api = api.toLowerCase();

    if (supportedAPI.indexOf(api) === -1) {
        throw Error(`Method ${api} is not supported`);
    }

    switch (api) {
        case 'paper':
            show(params);
            break;
        default:
            console.warn(`No handler defined for ${api}`);
    }
}

app(window);
