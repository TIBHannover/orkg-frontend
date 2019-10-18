import React, { Component } from 'react';
import NewStatementsSection from '../components/statements/new/NewStatementsSection';
import StatementGroupCard from '../components/statements/existing/StatementGroupCard';
import { resourcesUrl, submitGetRequest, getStatementsBySubject } from '../network';
import { groupByObjectWithId } from '../utils';
import './ResourceDetails.css';
import EditableHeader from '../components/EditableHeader';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';

export const descriptionSection = 'description';
export const implementationSection = 'implementation';
export const evaluationSection = 'evaluation';
export const miscSection = 'misc';

// const sections = [descriptionSection, implementationSection, evaluationSection, miscSection];

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
    };
  }

  async componentDidMount() {
    await this.findResource();
    await this.findAllStatements();
  }

  findResource = async () => {
    try {
      const responseJson = await submitGetRequest(resourcesUrl + encodeURIComponent(this.props.match.params.resourceId));
      this.setState({
        title: responseJson.label,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        title: null,
        error: err.message,
      });
    }
  };

  findAllStatements = async () => {
    try {
      const responseJson = await getStatementsBySubject({ id: this.props.match.params.resourceId });

      this.setState({
        allStatements: responseJson,
        error: null,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        allStatements: null,
        error: err.message,
      });
    }
  };

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
    const resultsPresent = this.state.error || this.state.allStatements;
    const labelId = 'http://www.w3.org/2000/01/rdf-schema#label';
    const abstractId = 'http://orkg.tib.eu/ontology/abstract';

    if (this.state.error) {
      return (
        <p>
          <strong>Error:</strong> {this.state.error}{' '}
        </p>
      );
    }

    if (resultsPresent) {
      const titleText = this.state.title;
      const titleJsx = titleText && <EditableHeader {...this.props} value={titleText} onChange={this.handleHeaderChange} />;

      const abstractText = this.state.allStatements.find((statement) => statement.subject.id === id && statement.predicate.id === abstractId);
      const abstractJsx = abstractText && <div>{abstractText.object.id}</div>;

      const groupingProperty = 'predicate';
      const statements = this.state.allStatements.filter((statement) => statement.subject.id === id && statement.predicate.id !== labelId && statement.predicate.id !== abstractId);
      const groupedStatements = groupByObjectWithId(statements, groupingProperty);
      const statementGroupJsxs = groupedStatements.map((statementGroup) => {
        if (statementGroup.length > 0) {
          const propertyId = statementGroup[0][groupingProperty].id;
          const propertyLabel = statementGroup[0][groupingProperty].label;
          return <StatementGroupCard href={`${process.env.PUBLIC_URL}/predicate/${encodeURIComponent(propertyId)}`} key={propertyId} label={this.state.predicateMap[propertyId] || propertyLabel} onUpdate={this.reset} statementGroup={statementGroup} getStatementText={this.getStatementText} setStatementText={this.setStatementText} />;
        } else {
          return null;
        }
      });

      const newStatementsSectionJsx = <NewStatementsSection subjectId={id} onUpdate={this.reset} />;
      // const sectionName = this.props.sectionName;
      // const navigationButtons = <Nav tag="div">
      //     <NavLink href={descriptionSection} disabled={sectionName === descriptionSection}>
      //         Problem description
      //     </NavLink>
      //     <NavLink href={implementationSection} disabled={sectionName === implementationSection}>
      //         Implementation
      //     </NavLink>
      //     <NavLink href={evaluationSection} disabled={sectionName === evaluationSection}>
      //         Evaluation
      //     </NavLink>
      //     <NavLink href={miscSection} disabled={sectionName === miscSection}>
      //         Misc
      //     </NavLink>
      // </Nav>;

      // const sectionIndex = sections.findIndex((value) => value === sectionName);
      // const bottomNavigationButtons = <Nav className="bottomNavigator" tag="div">
      //     <NavLink className="btn btn-primary" href={sections[sectionIndex - 1]} disabled={!(sectionIndex > 0)}>
      //         Previous
      //     </NavLink>
      //     <NavLink className="btn btn-primary" href={sections[sectionIndex + 1]} disabled={!(sectionIndex < sections.length - 1)}>
      //         Next
      //     </NavLink>
      // </Nav>;

      return (
        <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">
          <div className="entityView-main">
            {titleJsx}
            {abstractJsx}
            {/*{navigationButtons}*/}
            {statementGroupJsxs}
            {newStatementsSectionJsx}
            {/*{bottomNavigationButtons}*/}
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
