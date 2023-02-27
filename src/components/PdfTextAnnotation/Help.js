import { Steps } from 'intro.js-react';
import PropTypes from 'prop-types';

const Help = props => {
    const handleCloseTour = () => {
        props.setIsOpen(false);
    };

    const tourSteps = [
        {
            intro: (
                <div style={{ width: '400px' }}>
                    <p>
                        A warm welcome at the <strong>ORKG paper annotator</strong>! In this help tour, we will explain the key features of the
                        annotator tool.
                    </p>
                    <p>
                        The goal is to select the <strong>most important sentences</strong> within your paper. Afterwards you can annotate the
                        sentence by selecting the type.
                    </p>
                    <p>Let's have a look at some of the features. Click the arrow below.</p>
                </div>
            ),
        },
        {
            element: '#completion-bar',
            intro: (
                <>
                    <p>
                        This is the completion bar, indicating your progress while annotating. This bar is there to help you understand when you have
                        sufficiently annotated your paper.
                    </p>
                    <p>
                        The completion is only a suggestion, you can annotate less or more sentences than suggested. So in the end, it is up to you!
                    </p>
                </>
            ),
        },
        /* {
            selector: '#smart-sentence-detection',
            content: (
                <>
                    <p>
                        The Smart Sentence Detection will automatically highlight sentences within your paper that could potentially be interesting.{' '}
                    </p>
                    <p>
                        Suggestions within your paper will be highlighted with a light blue color like this: <br />
                        <span style={{ background: '#d2d5df' }}>Lorum Ipsum Dolor Sit Amet</span>
                        <br />
                    </p>
                    <p>
                        You can click on a sentence to annotate it. Is case you want to disable the suggestions, you can use the switch on the right
                        side.
                    </p>
                    <p>
                        <em>
                            <strong>Please note:</strong> currently processing takes about 10 seconds per page. You can start annotating your paper
                            already while the suggestions are loading.
                        </em>
                    </p>
                </>
            ),
            style: tourStyle
        }, */
        {
            element: '#annotation-categories',
            intro: (
                <>
                    <p>Here, the five most important annotation types are listed. In total, there are 25 types you can use to annotate a sentence.</p>
                    <p>
                        We recommend that you annotate a maximum of <strong>3 sentences</strong> for each of the recommended types. But again: this is
                        a suggestion, please annotate the types that are relevant according to your judgement.
                    </p>
                    <p>If you annotate one of the other 20 types, they will automatically appear at the bottom of this list.</p>
                </>
            ),
        },
        {
            element: '#save-annotations',
            intro: (
                <>
                    <p>You made it to the end of the tour! Once you are done with annotating your paper, you can save the results here.</p>
                    <p>
                        <em>
                            <strong>Tip:</strong> if you want to start the tour again, click the arrow on right of the save button.
                        </em>
                    </p>
                </>
            ),
        },
    ];

    return (
        <>
            <Steps
                onExit={handleCloseTour}
                enabled={props.isOpen}
                initialStep={0}
                steps={tourSteps}
                options={{ tooltipClass: 'introjs-ORKG-tooltip' }}
            />
        </>
    );
};

Help.propTypes = {
    setIsOpen: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
};

export default Help;
