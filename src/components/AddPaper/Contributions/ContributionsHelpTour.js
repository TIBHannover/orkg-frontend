import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { closeTour, openTour } from 'slices/addPaperSlice';
import { Steps } from 'intro.js-react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faVideo } from '@fortawesome/free-solid-svg-icons';
import env from '@beam-australia/react-env';
import { useSelector, useDispatch } from 'react-redux';
import ANNOTATION_TOOLTIP from 'assets/img/annotationTooltip.png';

function ContributionsHelpTour() {
    const { isTourOpen, tourStartAt, showAbstractDialog, abstractDialogView } = useSelector(state => state.addPaper);
    const dispatch = useDispatch();
    const [cookies, setCookie] = useCookies(['showedContributions', 'takeTour']);
    const requestCloseTour = () => {
        dispatch(closeTour());
    };
    useEffect(() => {
        // check if a cookie of take a tour exist
        if (cookies && cookies.takeTour === 'take' && !cookies.showedContributions) {
            dispatch(openTour());
            setCookie('showedContributions', true, { path: env('PUBLIC_URL'), maxAge: 604800 });
        }
    }, [cookies, dispatch, setCookie]);

    return (
        <Steps
            steps={[
                ...(!showAbstractDialog
                    ? [
                          {
                              element: '#contributionsList',
                              intro: (
                                  <span>
                                      You can enter multiple contributions, and you can specify a name for each contribution. It's just a handy label.{' '}
                                      <br />
                                      <br />
                                      Some papers only have one research contribution, while others have multiple. If you are not sure about this, it
                                      is fine to just use one contribution.
                                  </span>
                              ),
                          },
                          {
                              element: '.contributionData',
                              intro: (
                                  <div style={{ width: '400px' }}>
                                      Entering contribution data is the most important part of adding a paper (this part takes around 10-20 minutes).
                                      In this section you enter the data relevant to your paper. The challenge here is to capture the most important
                                      aspects of your paper and to represent this here. <br />
                                      <br />
                                      The data is entered in a <strong>property and value </strong> structure. First you choose a property (e.g.
                                      method) and afterwards you add a value to this property (e.g. semi-structured interviews). <br />
                                      <hr />
                                      <a href="https://www.youtube.com/watch?v=dPBz9uAbHqo" target="_blank" rel="noopener noreferrer">
                                          Video - How to add contribution data <Icon size="sm" icon={faVideo} />{' '}
                                          <Icon size="sm" icon={faExternalLinkAlt} />
                                      </a>
                                      <br />
                                      <a href="https://www.orkg.org/paper/R8186" target="_blank" rel="noopener noreferrer">
                                          View paper that has been used in this example <Icon size="sm" icon={faExternalLinkAlt} />
                                      </a>
                                  </div>
                              ),
                              position: 'top',
                          },
                      ]
                    : []),
                ...(showAbstractDialog
                    ? [
                          abstractDialogView === 'input'
                              ? {
                                    element: '#paperAbstract',
                                    intro: <div>Enter the paper abstract to get automatically generated concepts for you paper.</div>,
                                    position: 'right',
                                }
                              : {
                                    element: '#annotatedText',
                                    intro: (
                                        <div>
                                            This an automatically annotated abstract. Feel free to edit and add new annotation by highlighting the
                                            text.
                                            <br />
                                            When you hover on one of the annotations, you get this 3 options in a tooltip: <br />
                                            <img src={ANNOTATION_TOOLTIP} alt="" className="img-responsive" />
                                            <br />
                                            <ol>
                                                <li>Change the annotation label.</li>
                                                <li>Remove the annotation.</li>
                                                <li>Show the list of label options.</li>
                                            </ol>
                                        </div>
                                    ),
                                    position: 'right',
                                },
                      ]
                    : []),
            ]}
            onExit={requestCloseTour}
            enabled={isTourOpen}
            initialStep={tourStartAt}
            options={{ tooltipClass: 'introjs-ORKG-tooltip' }}
        />
    );
}

export default ContributionsHelpTour;
