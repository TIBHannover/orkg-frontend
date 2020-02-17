import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { closeTour, openTour } from '../../../actions/addPaper';
import Tour from 'reactour';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { withTheme } from 'styled-components';
import { withCookies, Cookies } from 'react-cookie';
import PropTypes from 'prop-types';

class ContributionsHelpTour extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showVideoDialog: false
        };
    }

    componentDidMount() {
        // check if a cookie of take a tour exist
        if (this.props.cookies && this.props.cookies.get('taketour') === 'take' && !this.props.cookies.get('showedContributions')) {
            this.props.openTour();
            this.props.cookies.set('showedContributions', true, { path: process.env.PUBLIC_URL, maxAge: 604800 });
        }
    }

    componentWillUnmount() {
        clearAllBodyScrollLocks();
    }

    disableBody = target => disableBodyScroll(target);
    enableBody = target => enableBodyScroll(target);

    requestCloseTour = () => {
        this.enableBody();
        if (this.props.cookies.get('taketourClosed')) {
            this.props.closeTour();
        } else {
            this.setState({ isClosed: true });
        }
    };

    toggleVideoDialog = () => {
        this.props.closeTour();
        this.setState(prevState => ({
            showVideoDialog: !prevState.showVideoDialog
        }));
    };

    render() {
        return (
            <div>
                <Tour
                    onAfterOpen={this.disableBody}
                    onBeforeClose={this.enableBody}
                    disableInteraction={false}
                    steps={[
                        ...(!this.props.showAbstractDialog
                            ? [
                                  {
                                      selector: '#researchProblemFormControl',
                                      content: (
                                          <span>
                                              Specify the research problem that this contribution addresses. Normally, a research problem consists of{' '}
                                              <strong>very few words</strong> (around 2 or 3).
                                              <br />
                                              <br />
                                              Examples of research problems:
                                              <ul>
                                                  <li>Named entity recognition</li>
                                                  <li>HCI performance evaluations</li>
                                                  <li>Triple store benchmarking</li>
                                              </ul>
                                          </span>
                                      ),
                                      style: { borderTop: '4px solid #E86161' },
                                      action: node => (node ? node.focus() : null)
                                  },
                                  {
                                      selector: '#contributionsList',
                                      content: (
                                          <span>
                                              You can enter multiple contributions, and you can specify a name for each contribution. It's just a
                                              handy label. <br />
                                              <br />
                                              Some papers only have one research contribution, while others have multiple. If you are not sure about
                                              this, it is fine to just use one contribution.
                                          </span>
                                      ),
                                      style: { borderTop: '4px solid #E86161' },
                                      action: node => (node ? node.focus() : null)
                                  },
                                  {
                                      selector: '.listGroupEnlarge',
                                      content: (
                                          <span>
                                              Entering contribution data is the most important part of adding a paper (this part takes around 10-20
                                              minutes). In this section you enter the data relevant to your paper. The challenge here is to capture
                                              the most important aspects of your paper and to represent this here. <br />
                                              <br />
                                              The data is entered in a <strong>property and value </strong> structure. First you choose a property
                                              (e.g. method) and afterwards you add a value to this property (e.g. semi-structured interviews). <br />
                                              <br />
                                              <span className="btn btn-link p-0" onClick={this.toggleVideoDialog}>
                                                  Open example video
                                              </span>
                                          </span>
                                      ),
                                      style: { borderTop: '4px solid #E86161' },
                                      action: node => (node ? node.focus() : null)
                                  }
                              ]
                            : []),
                        ...(this.props.showAbstractDialog
                            ? [
                                  this.props.abstractDialogView === 'input'
                                      ? {
                                            selector: '#paperAbstract',
                                            content: ({ goTo }) => (
                                                <div>Enter the paper abstract to get automatically generated concepts for you paper.</div>
                                            ),
                                            style: { borderTop: '4px solid #E86161' },
                                            action: node => (node ? node.focus() : null),
                                            position: 'right'
                                        }
                                      : {
                                            selector: '#annotatedText',
                                            content: ({ goTo }) => (
                                                <div>
                                                    This an automatically annotated abstract. Feel free to edit and add new annotation by highlighting
                                                    the text.
                                                    <br />
                                                    When you hover on one of the annotations, you get this 3 options in a tooltip: <br />
                                                    <img
                                                        src={require('../../../assets/img/annotationTooltip.png')}
                                                        alt=""
                                                        className="img-responsive"
                                                    />
                                                    <br />
                                                    <ol>
                                                        <li>Change the annotation label.</li>
                                                        <li>Remove the annotation.</li>
                                                        <li>Show the list of label options.</li>
                                                    </ol>
                                                </div>
                                            ),
                                            style: { borderTop: '4px solid #E86161' },
                                            position: 'right',
                                            action: node => (node ? node.focus() : null)
                                        }
                              ]
                            : [])
                    ]}
                    showNumber={false}
                    accentColor={this.props.theme.orkgPrimaryColor}
                    rounded={10}
                    onRequestClose={this.requestCloseTour}
                    isOpen={this.props.isTourOpen}
                    startAt={this.props.tourStartAt}
                    maskClassName="reactourMask"
                    showButtons={!this.props.showAbstractDialog}
                    showNavigation={!this.props.showAbstractDialog}
                />

                <Modal isOpen={this.state.showVideoDialog} toggle={this.toggleVideoDialog} size="lg">
                    <ModalHeader toggle={this.toggleVideoDialog}>How to add contribution data</ModalHeader>
                    <ModalBody>
                        <iframe
                            width="100%"
                            height="480"
                            src="https://www.youtube.com/embed/BhI-gngCl0k?rel=0"
                            frameborder="0"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen="true"
                            title="ORKG - How to add contribution data"
                        />
                        <hr />
                        <a href="https://labs.tib.eu/orkg/paper/R1020" target="_blank" rel="noopener noreferrer">
                            View paper that has been used in this example <Icon size="sm" icon={faExternalLinkAlt} />
                        </a>
                    </ModalBody>
                </Modal>
            </div>
        );
    }
}

ContributionsHelpTour.propTypes = {
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    theme: PropTypes.object.isRequired,
    openTour: PropTypes.func.isRequired,
    closeTour: PropTypes.func.isRequired,
    isTourOpen: PropTypes.bool.isRequired,
    tourStartAt: PropTypes.number.isRequired,
    showAbstractDialog: PropTypes.bool.isRequired,
    abstractDialogView: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return {
        isTourOpen: state.addPaper.isTourOpen,
        tourStartAt: state.addPaper.tourStartAt,
        showAbstractDialog: state.addPaper.showAbstractDialog,
        abstractDialogView: state.addPaper.abstractDialogView
    };
};

const mapDispatchToProps = dispatch => ({
    openTour: data => dispatch(openTour(data)),
    closeTour: () => dispatch(closeTour())
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme,
    withCookies
)(ContributionsHelpTour);
