import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getResource } from '../network';
import StatementBrowser from '../components/StatementBrowser/Statements';
import EditableHeader from '../components/EditableHeader';
import InternalServerError from '../components/StaticPages/InternalServerError';
import NotFound from '../components/StaticPages/NotFound';
import PropTypes from 'prop-types';

class ResourceDetails extends Component {

  constructor(props) {
    super(props);

    this.state = {
      error: null,
      label: '',
      isLoading: false,
    };
  }

  componentDidMount() {
    this.findResource();
  }

  findResource = () => {
    this.setState({ isLoading: true })
    getResource(this.props.match.params.resourceId).then((responseJson) => {
      document.title = `${responseJson.label} - Resource - ORKG`
      this.setState({ label: responseJson.label, isLoading: false });
    }).catch(error => {
      this.setState({ label: null, isLoading: false, error: error });
    });
  }

  handleHeaderChange = (event) => {
    this.setState({ label: event.value });
  };

  render() {
    const id = this.props.match.params.resourceId;
    return (
      <>
        {this.state.isLoading && <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
        {!this.state.isLoading && this.state.error && <>{this.state.error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
        {!this.state.isLoading && !this.state.error && this.state.label && (
          <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">
            <div className="entityView-main">
              <EditableHeader id={id} value={this.state.label} onChange={this.handleHeaderChange} />
              <StatementBrowser
                enableEdit={true}
                syncBackend={true}
                openExistingResourcesInDialog={false}
                initialResourceId={this.props.match.params.resourceId}
                initialResourceLabel={this.state.label}
              />
            </div>
          </Container>
        )}
      </>
    )
  }
}

ResourceDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      resourceId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ResourceDetails;
