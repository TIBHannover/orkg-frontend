import { Cookies } from 'react-cookie';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'reactstrap';
import Tippy from '@tippyjs/react';
import { useState } from 'react';
import env from '@beam-australia/react-env';
import { Steps } from 'intro.js-react';

const HelpButton = styled.div`
    box-sizing: border-box;
    position: fixed;
    white-space: nowrap;
    z-index: 9998;
    padding-left: 0;
    list-style: none;
    padding: 0;
    bottom: ${props => (props.woochat ? '74px' : '24px')};
    right: ${props => (props.woochat ? '4px' : '24px')};
    color: #80869b;

    .text {
        cursor: pointer;
        display: inline-block;
        margin-left: 8px;
        font-weight: bold;
        line-height: 56px;
        font-size: large;
    }

    .white {
        color: #fff;
    }
`;

const HelpIcon = styled(Icon)`
    vertical-align: middle;
    height: 28px;
    width: 28px !important;
    z-index: 9999;
    background-color: ${props => props.theme.primary};
    display: inline-flex;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: center;
    align-items: center;
    position: relative;
    border: none;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.14), 0 4px 8px rgba(0, 0, 0, 0.28);
    cursor: pointer;
    outline: none;
    padding: 12px;
    -webkit-user-drag: none;
    font-weight: bold;
    color: #f1f1f1;
    font-size: 18px;
`;

const TOUR_STEPS = [
    {
        element: '#about',
        intro: (
            <div style={{ width: 'auto' }}>
                <h6>
                    <b>About</b>
                </h6>
                <p>
                    The ORKG is a platform for semantic scholarly knowledge. We aim to save researchers from drowning in a flood of publications by
                    making research contributions machine-actionable and providing assistance in finding and comparing relevant literature.
                </p>
                <p>If you want to find out more, you can visit </p>
                <b>About/Overview</b>
            </div>
        ),
    },

    {
        element: '#tour-views',
        intro: (
            <>
                <h6>
                    <b>Papers</b>
                </h6>
                <p>
                    In the ORKG, you can create a machine-actionable description of any research paper. This can then be connected and compared to
                    other papers or it can be used as an input for your own software.
                </p>
                <p>To find a list of papers that are already described, click </p> <b>View/Papers</b>
            </>
        ),
    },

    {
        element: '#tour-views',
        intro: (
            <div>
                <h6>
                    <b>Comparisons</b>
                </h6>
                <p>
                    ORKG’s core content are Comparisons – State of the Art Overviews of different papers are shown in a tabular view. Show picture of
                    a good Comparison.
                </p>
                <p>
                    Comparisons can be used in various ways, depending on the field. Examples might be to compare numerical values, show agreement and
                    disagreement on a specific hypothesis, or highlight trends in current research.
                </p>
                <p>You can see a list of all comparisons under </p>
                <b>View/Comparisons</b>
            </div>
        ),
    },
    {
        element: '#tour-views',
        intro: (
            <div>
                <h6>
                    <b>Comparisons</b>
                </h6>
                <p>
                    In comparison matrix each column represents one research contribution. These contributions are then compared alongside relevant
                    properties.
                </p>
                <b>View/Comparisons</b>
            </div>
        ),
    },
    {
        element: '#tour-search-bar',
        intro: (
            <div>
                <h6>
                    <b>Search</b>
                </h6>
                <p>To find content related to your topic, you can use our search bar.</p>
            </div>
        ),
    },
    {
        element: '#sign-in',
        intro: (
            <div>
                <h6>
                    <b>Sign-in</b>
                </h6>
                <p>Create account and sign in to add new paper. If you are already sign-in then move next</p>
            </div>
        ),
    },
    {
        element: '#tour-add-paper',
        intro: (
            <div>
                <h6>
                    <b>Add Paper</b>
                </h6>
                <p>Click on Add new to enter a paper or create a Comparison.</p>
            </div>
        ),
    },
    {
        element: '#research-field-cards',
        intro: (
            <div>
                <h6>
                    <b>Research Fields</b>
                </h6>
                <p>To find content related to your topic, you can explore research fields.</p>
            </div>
        ),
    },
    {
        element: '#tour-research-field-bar',
        intro: (
            <div>
                <h6>
                    <b>Search</b>
                </h6>
                <p>You can also select the research field from the drop down.</p>
            </div>
        ),
    },
    {
        element: '#end',
        intro: (
            <>
                <p>You made it to the end of the tour! Once you are done with exploring the home page.</p>
                <p>
                    <em>
                        <strong>Tip:</strong> if you want to start the tour again, click the ? on bottom right of the web screen.
                    </em>
                </p>
            </>
        ),
    },
];

const HelpTour = () => {
    const cookies = new Cookies();
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(!cookies.get('isHiddenHomeTour'));

    const closeTooltip = () => {
        setIsTooltipVisible(false);
        cookies.set('isHiddenHomeTour', true, { path: env('PUBLIC_URL'), maxAge: 60 * 60 * 24 * 365 });
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

            <HelpButton id="helpIcon" woochat={env('CHATWOOT_WEBSITE_TOKEN')}>
                <Tippy
                    visible={isTooltipVisible}
                    appendTo={document.body}
                    interactive
                    content={
                        <div className="p-1">
                            Click to activate the tour guide
                            <div className="text-end">
                                <Button color="link" size="sm" className="p-0 fw-bold text-decoration-none mt-2 text-white" onClick={closeTooltip}>
                                    Got it
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <div className="px-3 py-1">
                        <HelpIcon icon={faQuestion} onClick={() => setIsHelpOpen(true)} />
                    </div>
                </Tippy>
            </HelpButton>
        </>
    );
};

export default HelpTour;
