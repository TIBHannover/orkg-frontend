import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { resourcesUrl, submitGetRequest, getStatementsBySubject } from '../network';
import NewStatementsSection from '../components/statements/new/NewStatementsSection';
import StatementGroupCard from '../components/statements/existing/StatementGroupCard';
import EditableHeader from '../components/EditableHeader';
import InternalServerError from '../components/StaticPages/InternalServerError';
import NotFound from '../components/StaticPages/NotFound';
import { groupByObjectWithId } from '../utils';
import PropTypes from 'prop-types';
import './ResourceDetails.css';

class ResourceDetails extends Component {

  constructor(props) {
    super(props);

    this.state = {
      allStatements: null,
      results: null,
      error: null,
      title: null,
      predicateMap: {},
      objectMap: {},
      isLoading: false,
    };
  }

  componentDidMount() {
    this.findResource();
  }

  findResource = () => {
    this.setState({ isLoading: true })
    submitGetRequest(resourcesUrl + encodeURIComponent(this.props.match.params.resourceId)).then((responseJson) => {
      getStatementsBySubject({ id: this.props.match.params.resourceId }).then(resourceStatements => {
        this.setState({ title: responseJson.label, allStatements: resourceStatements, isLoading: false });
      }).catch(error => {
        this.setState({ title: responseJson.label, allStatements: null, isLoading: false, error: error });
      })
    }).catch(error => {
      this.setState({ title: null, allStatements: null, isLoading: false, error: error });
    });
  }

  reset = async () => {
    this.setState(this.initialState);
    await this.findAllStatements();
  };

  getStatementText = (statement) => {
    const that = this;
    return () => {
      return that.state.objectMap[statement.id] || statement.object.label;
    };
  };

  setStatementText = (statement) => {
    const that = this;
    return (text) => {
      that.state.objectMap[statement.id] = text;
    };
  };

  handleHeaderChange = (event) => {
    this.setState({ title: event.value });
  };

  render() {
    const id = this.props.match.params.resourceId;

    if (this.state.isLoading) {
      return <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>;
    }

    if (!this.state.isLoading && this.state.error) {
      if (this.state.error.statusCode === 404) {
        return <NotFound />;
      } else {
        return <InternalServerError />;
      }
    }

    if (!this.state.isLoading && !this.state.error && this.state.allStatements) {
      const titleText = this.state.title;
      const titleJsx = titleText && <EditableHeader {...this.props} id={id} value={titleText} onChange={this.handleHeaderChange} />;

      const groupingProperty = 'predicate';
      const groupedStatements = groupByObjectWithId(this.state.allStatements, groupingProperty);
      const statementGroupJsxs = groupedStatements.map((statementGroup) => {
        if (statementGroup.length > 0) {
          const propertyId = statementGroup[0][groupingProperty].id;
          const propertyLabel = statementGroup[0][groupingProperty].label;
          return (
            <StatementGroupCard
              href={`${process.env.PUBLIC_URL}/predicate/${encodeURIComponent(propertyId)}`}
              key={propertyId}
              label={this.state.predicateMap[propertyId] || propertyLabel}
              onUpdate={this.reset}
              statementGroup={statementGroup}
              getStatementText={this.getStatementText}
              setStatementText={this.setStatementText}
            />);
        } else {
          return null;
        }
      });

      const newStatementsSectionJsx = <NewStatementsSection subjectId={id} onUpdate={this.reset} />;

      return (
        <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">
          <div className="entityView-main">
            {titleJsx}
            {statementGroupJsxs}
            {newStatementsSectionJsx}
          </div>
        </Container>
      );
    } else {
      return null;
    }
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
