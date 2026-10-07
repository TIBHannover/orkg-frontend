import { BACKEND_URL, FRONTEND_SERVER_URL } from '../config';
import logo from './logo.png?inline';
import styles from './paper.css?raw';
import html from './paper.html?raw';

export type WidgetParams = {
    language?: string;
};

/** Wire format of GET {BACKEND_URL}widgets?doi=… */
export type WidgetResponse = {
    id: string;
    class: 'Paper' | 'Comparison' | 'SmartReviewPublished' | (string & {});
    num_statements: number;
    doi?: string | null;
    title?: string;
};

type Language = 'en' | 'de';

const dictionary: Record<'add' | 'open' | 'numStatements', Record<Language, string>> = {
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

// The widget styles are injected at script-evaluation time, before any rendering.
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);

// A DOI may legitimately contain a stray '%', which makes decodeURIComponent throw.
const safeDecode = (value: string): string => {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

export const getItemByDoi = async (doi: string): Promise<WidgetResponse> => {
    const url = `${BACKEND_URL}widgets?doi=${encodeURIComponent(safeDecode(doi))}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error response. (${response.status}) ${response.statusText}`);
    }
    return response.json();
};

export function show(params?: WidgetParams): void {
    const language: Language = params?.language === 'de' ? 'de' : 'en';
    const locations = document.getElementsByClassName('orkg-widget');
    for (let i = 0; i < locations.length; i += 1) {
        // convert plain HTML string into DOM elements
        const temporary = document.createElement('div');
        temporary.innerHTML = html;
        // ORKG Logo
        (temporary.getElementsByClassName('orkg-widget-icon')[0] as HTMLImageElement).src = logo;
        // append elements to body
        const ORKGWidget = locations[i];

        // Paper DOI
        const doi = ORKGWidget.getAttribute('data-doi') ?? '';
        getItemByDoi(doi)
            .then((result) => {
                (temporary.getElementsByClassName('orkg-widget-txt-link')[0] as HTMLElement).textContent = dictionary.open[language];
                (temporary.getElementsByClassName('orkg-widget-text-statements')[0] as HTMLElement).textContent = dictionary.numStatements[language];
                let url = `${FRONTEND_SERVER_URL}papers/${result.id}`;
                if (result.class === 'Paper') {
                    (temporary.getElementsByClassName('orkg-widget-statements')[0] as HTMLElement).textContent = String(result.num_statements);
                } else if (result.class === 'Comparison') {
                    url = `${FRONTEND_SERVER_URL}comparisons/${result.id}`;
                    (temporary.getElementsByClassName('orkg-widget-description')[0] as HTMLElement).style.display = 'none';
                } else {
                    url = `${FRONTEND_SERVER_URL}resources/${result.id}`;
                    (temporary.getElementsByClassName('orkg-widget-description')[0] as HTMLElement).style.display = 'none';
                }
                (temporary.getElementsByClassName('orkg-widget-link')[0] as HTMLAnchorElement).href = url;
                while (temporary.children.length > 0) {
                    ORKGWidget.appendChild(temporary.children[0]);
                }
            })
            .catch(() => {
                (temporary.getElementsByClassName('orkg-widget-txt-link')[0] as HTMLElement).textContent = dictionary.add[language];

                (temporary.getElementsByClassName('orkg-widget-link')[0] as HTMLAnchorElement).href =
                    `${FRONTEND_SERVER_URL}content-type/create?type=Paper&entry=${doi}`;
                const [elem] = temporary.getElementsByClassName('orkg-widget-description');
                elem.parentNode?.removeChild(elem);
                while (temporary.children.length > 0) {
                    ORKGWidget.appendChild(temporary.children[0]);
                }
            });
    }
}
