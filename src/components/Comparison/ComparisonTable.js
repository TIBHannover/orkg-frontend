import React, { Component } from 'react';
import { ReactTableWrapper, Properties, PropertiesInner, ItemHeader, ItemHeaderInner, Contribution, Delete, ScrollButton } from './styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import capitalize from 'capitalize';
import TableCell from './TableCell';
import ReactTable from 'react-table';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import withFixedColumnsScrollEvent from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css'; // important: this line must be placed after react-table css import
import _ from 'lodash';

const ReactTableFixedColumns = withFixedColumnsScrollEvent(ReactTable);

class ComparisonTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showPropertiesDialog: false,
            showShareDialog: false,
            containerScrollLeft: 0,
            showNextButton: false,
            showBackButton: false
        };

        this.scrollContainer = React.createRef();
        this.scrollAmount = 500;
    }

    componentDidMount = () => {
        const rtTable = ReactDOM.findDOMNode(this.scrollContainer).getElementsByClassName('rt-table')[0];
        rtTable.addEventListener('scroll', this.handleScroll, 1000);
        this.defaultNextButtonState();
    };

    componentDidUpdate = (prevProps, prevState) => {
        if (!this.props.transpose) {
            if (this.props.contributions !== prevProps.contributions && this.props.contributions.length > 3) {
                this.defaultNextButtonState();
            }
        } else {
            if (this.props.transpose !== prevProps.transpose && this.props.properties.filter(property => property.active).length > 3) {
                this.defaultNextButtonState();
            }
        }
    };

    componentWillUnmount = () => {
        const rtTable = ReactDOM.findDOMNode(this.scrollContainer).getElementsByClassName('rt-table')[0];
        rtTable.removeEventListener('scroll', this.handleScroll);
    };

    defaultNextButtonState = () => {
        if (!this.props.transpose) {
            if (this.props.contributions.length > 3) {
                this.setState({
                    showNextButton: true
                });
            }
        } else {
            if (this.props.properties.filter(property => property.active).length > 3) {
                this.setState({
                    showNextButton: true
                });
            }
        }
    };

    scrollNext = () => {
        const rtTable = ReactDOM.findDOMNode(this.scrollContainer).getElementsByClassName('rt-table')[0];
        rtTable.scrollLeft += this.scrollAmount;
    };

    scrollBack = () => {
        const rtTable = ReactDOM.findDOMNode(this.scrollContainer).getElementsByClassName('rt-table')[0];
        rtTable.scrollLeft -= this.scrollAmount;
    };

    handleScroll = _.debounce(() => {
        const rtTable = ReactDOM.findDOMNode(this.scrollContainer).getElementsByClassName('rt-table')[0];
        const { scrollWidth, offsetWidth, scrollLeft } = rtTable;
        this.setState({
            showBackButton: rtTable.scrollLeft !== 0,
            showNextButton: offsetWidth + scrollLeft !== scrollWidth
        });
    }, 100);

    render() {
        const scrollContainerClasses = classNames({
            'overflowing-left': this.state.showBackButton,
            'overflowing-right': this.state.showNextButton,
            'overflowing-both': this.state.showBackButton && this.state.showNextButton
        });

        return (
            <>
                <ReactTableWrapper className={scrollContainerClasses}>
                    <ReactTableFixedColumns
                        innerRef={ref => {
                            this.scrollContainer = ref;
                        }}
                        resizable={false}
                        sortable={false}
                        pageSize={
                            !this.props.transpose ? this.props.properties.filter(property => property.active).length : this.props.contributions.length
                        }
                        data={[
                            ...(!this.props.transpose
                                ? this.props.properties
                                      .filter(property => property.active && this.props.data[property.id])
                                      .map((property, index) => {
                                          return {
                                              property: capitalize(property.label),
                                              values: this.props.contributions.map((contribution, index2) => {
                                                  const data = this.props.data[property.id][index2];
                                                  return data;
                                              })
                                          };
                                      })
                                : this.props.contributions.map((contribution, index) => {
                                      return {
                                          property: contribution,
                                          values: this.props.properties
                                              .filter(property => property.active)
                                              .map((property, index2) => {
                                                  const data = this.props.data[property.id][index];
                                                  return data;
                                              })
                                      };
                                  }))
                        ]}
                        columns={[
                            {
                                Header: (
                                    <Properties>
                                        <PropertiesInner transpose={this.props.transpose} className="first">
                                            Properties
                                        </PropertiesInner>
                                    </Properties>
                                ),
                                accessor: 'property',
                                fixed: 'left',
                                Cell: props =>
                                    !this.props.transpose ? (
                                        <Properties>
                                            <PropertiesInner>{capitalize(props.value)}</PropertiesInner>
                                        </Properties>
                                    ) : (
                                        <Properties>
                                            <PropertiesInner transpose={this.props.transpose}>
                                                <Link
                                                    to={reverse(ROUTES.VIEW_PAPER, {
                                                        resourceId: props.value.paperId,
                                                        contributionId: props.value.id
                                                    })}
                                                >
                                                    {props.value.title ? props.value.title : <em>No title</em>}
                                                </Link>
                                                <br />
                                                <Contribution>{props.value.contributionLabel}</Contribution>
                                            </PropertiesInner>

                                            {this.props.contributions.length > 2 && (
                                                <Delete onClick={() => this.props.removeContribution(props.value.id)}>
                                                    <Icon icon={faTimes} />
                                                </Delete>
                                            )}
                                        </Properties>
                                    ),
                                width: 250
                            },
                            ...(!this.props.transpose && this.props.contributions
                                ? this.props.contributions.map((contribution, index) => {
                                      return {
                                          id: contribution.id, // <-here
                                          Header: props => (
                                              <ItemHeader key={`contribution${index}`}>
                                                  <ItemHeaderInner>
                                                      <Link
                                                          to={reverse(ROUTES.VIEW_PAPER, {
                                                              resourceId: contribution.paperId,
                                                              contributionId: contribution.id
                                                          })}
                                                      >
                                                          {contribution.title ? contribution.title : <em>No title</em>}
                                                      </Link>
                                                      <br />
                                                      <Contribution>{contribution.contributionLabel}</Contribution>
                                                  </ItemHeaderInner>

                                                  {this.props.contributions.length > 2 && (
                                                      <Delete onClick={() => this.props.removeContribution(contribution.id)}>
                                                          <Icon icon={faTimes} />
                                                      </Delete>
                                                  )}
                                              </ItemHeader>
                                          ),
                                          accessor: d => {
                                              //return d.values[index].length > 0 ? d.values[index][0].label : '';
                                              return d.values[index];
                                          },
                                          Cell: props => <TableCell data={props.value} />, // Custom cell components!
                                          width: 250
                                      };
                                  })
                                : this.props.properties
                                      .filter(property => property.active && this.props.data[property.id])
                                      .map((property, index) => {
                                          return {
                                              id: property.id, // <-here
                                              Header: props => (
                                                  <ItemHeader key={`property${index}`}>
                                                      <ItemHeaderInner transpose={this.props.transpose}>
                                                          {/*For when the path is available: <Tooltip message={property.path} colorIcon={'#606679'}>*/}
                                                          {capitalize(property.label)}
                                                          {/*</Tooltip>*/}
                                                      </ItemHeaderInner>
                                                  </ItemHeader>
                                              ),
                                              accessor: d => {
                                                  //return d.values[index].length > 0 ? d.values[index][0].label : '';
                                                  return d.values[index];
                                              },
                                              Cell: props => <TableCell data={props.value} />, // Custom cell components!
                                              width: 250
                                          };
                                      }))
                        ]}
                        style={{
                            height: 'max-content' // This will force the table body to overflow and scroll, since there is not enough room
                        }}
                        showPagination={false}
                    />
                </ReactTableWrapper>
                {this.state.showBackButton && (
                    <ScrollButton onClick={this.scrollBack} className="back">
                        <Icon icon={faArrowCircleLeft} />
                    </ScrollButton>
                )}
                {this.state.showNextButton && (
                    <ScrollButton onClick={this.scrollNext} className="next">
                        <Icon icon={faArrowCircleRight} />
                    </ScrollButton>
                )}
            </>
        );
    }
}

ComparisonTable.propTypes = {
    contributions: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    properties: PropTypes.array.isRequired,
    removeContribution: PropTypes.func.isRequired,
    transpose: PropTypes.bool.isRequired
};

export default ComparisonTable;
