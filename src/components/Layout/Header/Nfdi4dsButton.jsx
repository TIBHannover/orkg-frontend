import { useEffect } from 'react';

const WIDGET_STYLES = `
    .nfdi4ds-banner .nfdi4ds-drop-shadow-md {
        --tw-drop-shadow: none !important;
        filter: none !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
    }
    .nfdi4ds-banner ul,
    .nfdi4ds-banner li,
    .nfdi4ds-banner a {
        border: none !important;
        box-shadow: none !important;
        -webkit-box-shadow: none !important;
        outline: none !important;
    }
    .nfdi4ds-banner .nfdi4ds-divide-y > *,
    .nfdi4ds-banner .nfdi4ds-divide-y > * + * {
        --tw-divide-y-reverse: 0 !important;
        border-top-width: 0 !important;
        border-bottom-width: 0 !important;
        border-style: none !important;
    }
    @media (min-width: 992px) and (max-width: 1200px) {
        .nfdi4ds-banner button span {
            display: none;
        }
    }
    @media (min-width: 768px) and (max-width: 992px) {
        .nfdi4ds-banner {
            display: none;
        }
    }
    @media (max-width: 768px) {
        .nfdi4ds-banner {
            padding: 10px 0;
        }
    }
`;

const Nfdi4dsButton = () => {
    useEffect(() => {
        (function (w, d, s, o, f, js, fjs) {
            w.nfdi4dsWidget = o;
            w[o] =
                w[o] ||
                function () {
                    (w[o].q = w[o].q || []).push(arguments);
                };

            ((js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]));
            js.id = o;
            js.src = f;
            js.async = 1;
            fjs?.parentNode.insertBefore(js, fjs);
        })(window, document, 'script', 'nfdi4ds', 'https://tibhannover.gitlab.io/nfdi4ds/nfdi4ds-widget/widget.js');
        window.nfdi4ds('widget');

        return () => {
            document.getElementById('nfdi4ds')?.remove();
        };
    }, []);

    return (
        <>
            <style>{WIDGET_STYLES}</style>
            <div className="flex w-full items-center md:pl-4">
                <div className="nfdi4ds-banner" data-variant="button" data-button-color="dark" data-menu-color="light" />
            </div>
        </>
    );
};

export default Nfdi4dsButton;
