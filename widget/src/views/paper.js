import html from './paper.html';
import './paper.css';
import img from './logo.png';

let ORKGWidget;

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
    const url = 'http://localhost:8000/api/widgets/?doi=' + doi;
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
    // convert plain HTML string into DOM elements
    const temporary = document.createElement('div');
    temporary.innerHTML = html;
    // ORKG Logo
    temporary.getElementsByClassName('orkg-widget-icon')[0].src = img;
    // append elements to body
    ORKGWidget = document.getElementById('orkg-widget');

    // Paper DOI
    const doi = ORKGWidget.getAttribute('data-doi');
    getPaperByDoi(doi)
        .then(result => {
            ORKGWidget.getElementsByClassName('orkg-widget-txt-link')[0].textContent = dictionary['open'][params.language];
            ORKGWidget.getElementsByClassName('orkg-widget-text-statements')[0].textContent = dictionary['numStatements'][params.language];
            ORKGWidget.getElementsByClassName('orkg-widget-statements')[0].textContent = result.num_statements;
            ORKGWidget.getElementsByClassName('orkg-widget-link')[0].href = 'http://localhost:3000/paper/' + result.id;
        })
        .catch(error => {
            ORKGWidget.getElementsByClassName('orkg-widget-txt-link')[0].textContent = dictionary['add'][params.language];
            ORKGWidget.getElementsByClassName('orkg-widget-link')[0].href = 'http://localhost:3000/add-paper';
            const elem = ORKGWidget.getElementsByClassName('orkg-widget-description')[0];
            elem.parentNode.removeChild(elem);
        });

    while (temporary.children.length > 0) {
        ORKGWidget.appendChild(temporary.children[0]);
    }
}
