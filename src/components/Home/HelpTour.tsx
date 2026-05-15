'use client';

import '@/components/Home/introjs-dark.css';

import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Steps } from 'intro.js-react';
import { useCookies } from 'next-client-cookies';
import { env } from 'next-runtime-env';
import { useState } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';

const TOUR_STEPS = [
    {
        element: '#about',
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">About</h6>
                <p className="text-sm">
                    The ORKG is a platform for semantic scholarly knowledge. We aim to save researchers from drowning in a flood of publications by
                    making research contributions machine-actionable and providing assistance in finding and comparing relevant literature.
                </p>
                <p className="text-sm mt-2">
                    If you want to find out more, you can visit <strong>About/Overview</strong>
                </p>
            </div>
        ),
    },
    {
        element: '#tour-views',
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">Papers</h6>
                <p className="text-sm">
                    In the ORKG, you can create a machine-actionable description of any research paper. This can then be connected and compared to
                    other papers or it can be used as an input for your own software.
                </p>
                <p className="text-sm mt-2">
                    To find a list of papers that are already described, click <strong>View/Papers</strong>
                </p>
            </div>
        ),
    },
    {
        element: '#tour-views',
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">Comparisons</h6>
                <p className="text-sm">
                    ORKG&apos;s core content are Comparisons &ndash; State of the Art Overviews of different papers are shown in a tabular view.
                </p>
                <p className="text-sm mt-2">
                    Comparisons can be used in various ways, depending on the field. Examples might be to compare numerical values, show agreement and
                    disagreement on a specific hypothesis, or highlight trends in current research.
                </p>
                <p className="text-sm mt-2">
                    You can see a list of all comparisons under <strong>View/Comparisons</strong>
                </p>
            </div>
        ),
    },
    {
        element: '#tour-search-bar',
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">Search</h6>
                <p className="text-sm">To find content related to your topic, you can use our search bar.</p>
            </div>
        ),
    },
    {
        element: '#sign-in',
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">Sign in</h6>
                <p className="text-sm">Create an account and sign in to add new papers. If you are already signed in, move to the next step.</p>
            </div>
        ),
    },
    {
        element: '#tour-add-paper',
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">Add Paper</h6>
                <p className="text-sm">Click on Add new to enter a paper or create a Comparison.</p>
            </div>
        ),
    },
    {
        element: '#research-field-cards',
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">Research Fields</h6>
                <p className="text-sm">To find content related to your topic, you can explore research fields.</p>
            </div>
        ),
    },
    {
        element: '#tour-research-field-bar',
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">Search by Field</h6>
                <p className="text-sm">You can also select the research field from the dropdown.</p>
            </div>
        ),
    },
    {
        intro: (
            <div>
                <h6 className="font-bold text-base mb-2">That&apos;s it!</h6>
                <p className="text-sm">You made it to the end of the tour! Once you are done with exploring the home page.</p>
                <p className="text-sm mt-2 italic">
                    <strong>Tip:</strong> if you want to start the tour again, click the <strong>?</strong> button on the bottom right of the screen.
                </p>
            </div>
        ),
    },
];

const HelpTour = () => {
    const cookies = useCookies();
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(!cookies.get('isHiddenHomeTour'));

    const closeTooltip = () => {
        setIsTooltipVisible(false);
        cookies.set('isHiddenHomeTour', 'true', { path: env('NEXT_PUBLIC_PUBLIC_URL'), expires: 365 });
    };

    return (
        <>
            <Steps
                onExit={() => setIsHelpOpen(false)}
                enabled={isHelpOpen}
                initialStep={0}
                steps={TOUR_STEPS}
                options={{ tooltipClass: 'introjs-ORKG-tooltip' }}
            />
            <div className="fixed bottom-6 right-6 z-[9998] p-0 text-secondary" id="helpIcon">
                <Tooltip
                    initialOpen={isTooltipVisible}
                    onTrigger={() => closeTooltip()}
                    content={<div className="p-1">Click to activate the tour guide</div>}
                >
                    <div className="px-4 py-1">
                        <button
                            type="button"
                            onClick={() => setIsHelpOpen(true)}
                            className="inline-flex size-[52px] cursor-pointer items-center justify-center rounded-full border-none bg-accent p-3 text-lg font-bold text-white shadow-[0_0_4px_rgba(0,0,0,0.14),0_4px_8px_rgba(0,0,0,0.28)] outline-none transition-transform hover:scale-110 active:scale-95"
                            aria-label="Start help tour"
                        >
                            <FontAwesomeIcon icon={faQuestion} />
                        </button>
                    </div>
                </Tooltip>
            </div>
        </>
    );
};

export default HelpTour;
