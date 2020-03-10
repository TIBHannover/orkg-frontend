import html from './paper.html';
import './paper.css';
import img from './logo.png';

const dictionary = {
    add: {
        de: 'Artikel zu ORKG hinzufügen',
        en: 'Add paper to ORKG'
    },
    open: {
        de: 'In ORKG öffnen',
        en: 'Open in ORKG'
    },
    numStatements: {
        de: 'Anzahl der Aussagen',
        en: 'Number of statements'
    }
};

export const getPaperByDoi = doi => {
    // http://localhost:8000/api/widgets/?doi=10.1007/s00799-015-0158-y
    const url = process.env.SERVER_URL + 'widgets/?doi=' + doi;
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    reject({
                        error: new Error(`Error response. (${response.status}) ${response.statusText}`),
                        statusCode: response.status,
                        statusText: response.statusText
                    });
                } else {
                    const json = response.json();
                    if (json.then) {
                        json.then(resolve).catch(reject);
                    } else {
                        return resolve(json);
                    }
                }
            })
            .catch(reject);
    });
};

export function show(params) {
    const locations = document.getElementsByClassName('orkg-widget');
    for (let i = 0; i < locations.length; i++) {
        // convert plain HTML string into DOM elements
        const temporary = document.createElement('div');
        temporary.innerHTML = html;
        // ORKG Logo
        temporary.getElementsByClassName('orkg-widget-icon')[0].src = img;
        // append elements to body
        const ORKGWidget = locations[i];

        // Paper DOI
        const doi = ORKGWidget.getAttribute('data-doi');
        getPaperByDoi(doi)
            .then(result => {
                temporary.getElementsByClassName('orkg-widget-txt-link')[0].textContent = dictionary['open'][params.language];
                temporary.getElementsByClassName('orkg-widget-text-statements')[0].textContent = dictionary['numStatements'][params.language];
                temporary.getElementsByClassName('orkg-widget-statements')[0].textContent = result.num_statements;
                temporary.getElementsByClassName('orkg-widget-link')[0].href = process.env.FRONTEND_SERVER_URL + 'paper/' + result.id;
                while (temporary.children.length > 0) {
                    ORKGWidget.appendChild(temporary.children[0]);
                }
            })
            .catch(error => {
                temporary.getElementsByClassName('orkg-widget-txt-link')[0].textContent = dictionary['add'][params.language];
                temporary.getElementsByClassName('orkg-widget-link')[0].href = process.env.FRONTEND_SERVER_URL + 'add-paper?entry=' + doi;
                const elem = temporary.getElementsByClassName('orkg-widget-description')[0];
                elem.parentNode.removeChild(elem);
                while (temporary.children.length > 0) {
                    ORKGWidget.appendChild(temporary.children[0]);
                }
            });
    }
}
