import React, { Component } from 'react';
import { Button, Alert, Card, CardBody, Label } from 'reactstrap';
import { arxivUrl } from '../../../network';
import { connect } from 'react-redux';
import { updateAbstract, nextStep, previousStep } from '../../../actions/addPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import Textarea from 'react-textarea-autosize';
import Tooltip from '../../Utils/Tooltip';

class ResearchField extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showError: false,
            changeAbstract: false,
            loading: false,
        }
    }

    componentDidMount() {
        this.fetchAbstract();
    }

    fetchAbstract = async () => {
        if (!this.props.abstract) {
            if (!this.props.title) {
                this.setState({
                    changeAbstract: true,
                });

                return;
            }
            this.setState({
                loading: true,
            });

            const titleEncoded = encodeURIComponent(this.props.title).replace(/%20/g, '+');
            const apiCall = arxivUrl + '?search_query=ti:' + titleEncoded;

            fetch(apiCall, { method: 'GET' })
                .then(response => response.text())
                .then(str => (new window.DOMParser()).parseFromString(str, 'text/xml')) // parse the text as xml
                .then(xmlDoc => { // get the abstract from the xml doc
                    if (xmlDoc.getElementsByTagName('entry') && xmlDoc.getElementsByTagName('entry')[0]) {
                        return xmlDoc.getElementsByTagName('entry')[0].getElementsByTagName('summary')[0].innerHTML
                    }
                    return '';
                })
                .then(abstract => { // remove line breaks from the abstract
                    abstract = abstract.replace(/(\r\n|\n|\r)/gm, ' ');

                    this.setState({
                        loading: false,
                    });
                    this.props.updateAbstract(abstract);
                })
                .catch();
        }
    }

    handleNextClick = () => {
        //TODO: add the annotated words as statements for the next step
        this.props.nextStep();
    }

    handleChangeAbstract = () => {
        this.setState((prevState) => ({
            changeAbstract: !prevState.changeAbstract,
        }));
    }

    handleChange = (event) => {
        this.props.updateAbstract(event.target.value);
    }

    render() {
        return (
            <div>
                <h2 className="h4 mt-4 mb-3">Abstract annotation</h2>

                {this.props.abstract && !this.state.changeAbstract &&
                    <Alert color="info">
                        <strong>Info:</strong> we automatically annotated the abstract for you. Please remove any incorrect annotations
                    </Alert>
                }

                <Card>
                    <CardBody>
                        {this.state.loading && <div className="text-center" style={{ fontSize: 30 }}><Icon icon={faSpinner} spin /></div>}

                        {!this.state.changeAbstract ?
                            <p className="pl-2 pr-2">{this.props.abstract}</p>
                            :
                            <div>
                                <Label for="paperAbstract">
                                    <Tooltip message="Enter the paper abstract to get automatically generated concepts for you paper. You can skip this step by clicking the 'Next step' button">
                                        Enter the paper abstract
                                    </Tooltip>
                                </Label>
                                <Textarea 
                                    id="paperAbstract"
                                    className="form-control pl-2 pr-2" 
                                    minRows="5" 
                                    value={this.props.abstract} 
                                    onChange={this.handleChange} 
                                />
                            </div>
                        }
                    </CardBody>
                </Card>

                <Button color="light" className="mb-2 mt-1" onClick={this.handleChangeAbstract}>{this.state.changeAbstract ? 'Annotate abstract' : 'Change abstract'}</Button>

                <hr className="mt-5 mb-3" />

                <Button color="primary" className="float-right mb-4" onClick={this.handleNextClick}>Next step</Button>
                <Button color="light" className="float-right mb-4 mr-2" onClick={this.props.previousStep}>Previous step</Button>
            </div>
        );
    }
}

ResearchField.propTypes = {
    nextStep: PropTypes.func.isRequired,
    previousStep: PropTypes.func.isRequired,
    updateAbstract: PropTypes.func.isRequired,
    abstract: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    selectedResearchField: state.addPaper.selectedResearchField,
    title: state.addPaper.title,
    abstract: state.addPaper.abstract,
});

const mapDispatchToProps = dispatch => ({
    updateAbstract: (data) => dispatch(updateAbstract(data)),
    nextStep: () => dispatch(nextStep()),
    previousStep: () => dispatch(previousStep()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ResearchField);