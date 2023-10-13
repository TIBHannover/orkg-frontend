import html from 'src/views/paper.html';
import 'src/views/paper.css';
import img from 'src/views/logo.png';

const dictionary = {
    add: {
        de: 'Artikel zu ORKG hinzufügen',
        en: 'Add paper to ORKG',
    },
    open: {
        de: 'In ORKG öffnen',
        en: 'Open in ORKG',
    },
    numStatements: {
        de: 'Anzahl der Aussagen',
        en: 'Number of statements',
    },
};

export const getItemByDoi = doi => {
    // http://localhost:8000/api/widgets/?doi=10.1007/s00799-015-0158-y
    const url = `${process.env.BACKEND_URL}widgets/?doi=${encodeURIComponent(doi)}`;
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    const error = new Error(`Error response. (${response.status}) ${response.statusText}`);
                    error.statusCode = response.status;
                    error.statusText = response.statusText;
                    reject(error);
                } else {
                    const jsonPromise = response.json(); // Storing the promise
                    jsonPromise.then(resolve).catch(reject); // Resolving or rejecting based on the promise
                }
            })
            .catch(error => {
                reject(error); // Rejecting with the caught error
            });
    });
};

export function show(params) {
    const locations = document.getElementsByClassName('orkg-widget');
    let { language } = params;
    if (!['en', 'de'].includes(params.language)) {
        language = 'en';
    }
    for (let i = 0; i < locations.length; i += 1) {
        // convert plain HTML string into DOM elements
        const temporary = document.createElement('div');
        temporary.innerHTML = html;
        // ORKG Logo
        temporary.getElementsByClassName('orkg-widget-icon')[0].src = img;
        // append elements to body
        const ORKGWidget = locations[i];

        // Paper DOI
        const doi = ORKGWidget.getAttribute('data-doi');
        getItemByDoi(doi)
            .then(result => {
                temporary.getElementsByClassName('orkg-widget-txt-link')[0].textContent = dictionary.open[language];
                temporary.getElementsByClassName('orkg-widget-text-statements')[0].textContent = dictionary.numStatements[language];
                let url = `${process.env.FRONTEND_SERVER_URL}paper/${result.id}`;
                if (result.class === 'Paper') {
                    temporary.getElementsByClassName('orkg-widget-statements')[0].textContent = result.num_statements;
                } else if (result.class === 'Comparison') {
                    url = `${process.env.FRONTEND_SERVER_URL}comparison/${result.id}`;
                    temporary.getElementsByClassName('orkg-widget-description')[0].style.display = 'none';
                } else {
                    url = `${process.env.FRONTEND_SERVER_URL}resource/${result.id}`;
                    temporary.getElementsByClassName('orkg-widget-description')[0].style.display = 'none';
                }
                temporary.getElementsByClassName('orkg-widget-link')[0].href = url;
                while (temporary.children.length > 0) {
                    ORKGWidget.appendChild(temporary.children[0]);
                }
            })
            .catch(() => {
                temporary.getElementsByClassName('orkg-widget-txt-link')[0].textContent = dictionary.add[language];

                temporary.getElementsByClassName('orkg-widget-link')[0].href = `${process.env.FRONTEND_SERVER_URL}add-paper?entry=${doi}`;
                const elem = temporary.getElementsByClassName('orkg-widget-description')[0];
                elem.parentNode.removeChild(elem);
                while (temporary.children.length > 0) {
                    ORKGWidget.appendChild(temporary.children[0]);
                }
            });
    }
}
