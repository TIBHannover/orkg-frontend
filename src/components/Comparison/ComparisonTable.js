import { faArrowCircleLeft, faArrowCircleRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import PropertyValue from 'components/Comparison/PropertyValue';
import ROUTES from 'constants/routes';
import { debounce, functions, isEqual, omit } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import ReactTable from 'react-table';
import withFixedColumnsScrollEvent from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css'; // important: this line must be placed after react-table css import
import {
    Contribution,
    Delete,
    ItemHeader,
    ItemHeaderInner,
    Properties,
    PropertiesInner,
    ReactTableWrapper,
    ScrollButton,
    ClickableScroll
} from './styled';
import TableCell from './TableCell';

const ReactTableFixedColumns = withFixedColumnsScrollEvent(ReactTable);

class ComparisonTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showPropertiesDialog: false,
            showShareDialog: false,
            showNextButton: false,
            showBackButton: false
        };

        this.scrollContainerHead = React.createRef();
        this.scrollContainerBody = React.createRef();
        this.scrollAmount = 500;
    }

    componentDidMount = () => {
        this.defaultNextButtonState();
    };

    shouldComponentUpdate(nextProps, nextState) {
        // remove functions from equality check (mainly targeting "removeContribution"), otherwise it is always false
        const hasPropsChanged = !isEqual(omit(this.props, functions(this.props)), omit(nextProps, functions(nextProps)));
        const hasStateChanged = !isEqual(this.state, nextState);
        return hasPropsChanged || hasStateChanged;
    }

    getSnapshotBeforeUpdate() {
        // Maintaining scroll position with getSnapshotBeforeUpdate and componentDidUpdate
        return { scrollLeftContainerBody: this.scrollContainerBody.current.scrollLeft };
    }

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (prevState.showBackButton !== this.state.showBackButton || prevState.showNextButton !== this.state.showNextButton) {
            this.scrollContainerHead.current.scrollLeft = snapshot.scrollLeftContainerBody;
            this.scrollContainerBody.current.scrollLeft = snapshot.scrollLeftContainerBody;
        }

        if (!this.props.transpose) {
            if (
                this.props.contributions !== prevProps.contributions &&
                this.props.contributions.filter(contribution => contribution.active).length > 3
            ) {
                this.defaultNextButtonState();
            }
        } else {
            if (this.props.transpose !== prevProps.transpose && this.props.properties.filter(property => property.active).length > 3) {
                this.defaultNextButtonState();
            }
        }
    };

    defaultNextButtonState = () => {
        if (!this.props.transpose) {
            if (this.props.contributions.filter(contribution => contribution.active).length > 3) {
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
        const rtTable = this.scrollContainerBody.current;
        rtTable.scrollTo({
            top: 0,
            left: rtTable.scrollLeft + this.scrollAmount,
            behavior: 'smooth'
        });
    };

    scrollBack = () => {
        const rtTable = this.scrollContainerBody.current;
        rtTable.scrollTo({
            top: 0,
            left: rtTable.scrollLeft - this.scrollAmount,
            behavior: 'smooth'
        });
    };

    // debounce is used to prevent real time overwriting of scroll position via the getSnapshotBeforeUpdate
    handleScrollCallback = debounce(rtBody => {
        const { scrollWidth, offsetWidth, scrollLeft } = rtBody;
        const showBackButton = rtBody.scrollLeft !== 0;
        const showNextButton = offsetWidth + scrollLeft !== scrollWidth;

        if (showBackButton !== this.state.showBackButton || showNextButton !== this.state.showNextButton) {
            this.setState({
                showBackButton: showBackButton,
                showNextButton: showNextButton
            });
        }
    }, 100);

    render() {
        const customProps = { id: 'comparisonTable' };

        let cellPadding = 10;
        if (this.props.viewDensity === 'normal') {
            cellPadding = 5;
        } else if (this.props.viewDensity === 'compact') {
            cellPadding = 1;
        }

        const smallerFontSize = this.props.viewDensity === 'compact';

        return (
            <>
                <ReactTableWrapper smallerFontSize={smallerFontSize}>
                    {this.state.showNextButton && <ClickableScroll className="right" onClick={this.scrollNext} />}
                    {this.state.showBackButton && <ClickableScroll className="left" onClick={this.scrollBack} />}
                    <ScrollSync onSync={this.handleScrollCallback}>
                        <ReactTableFixedColumns
                            TheadComponent={component => {
                                return (
                                    <ScrollSyncPane group="one">
                                        <div
                                            ref={this.scrollContainerHead}
                                            className="disable-scrollbars"
                                            style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }}
                                        >
                                            <div className={`comparison-thead ${component.className}`} style={component.style}>
                                                {component.children}
                                            </div>
                                        </div>
                                    </ScrollSyncPane>
                                );
                            }}
                            TbodyComponent={component => {
                                return (
                                    <ScrollSyncPane group="one">
                                        <div ref={this.scrollContainerBody} style={{ overflow: 'auto' }}>
                                            <div className={`rt-tbody ${component.className}`} style={component.style}>
                                                {component.children}
                                            </div>
                                        </div>
                                    </ScrollSyncPane>
                                );
                            }}
                            getProps={() => customProps}
                            resizable={false}
                            sortable={false}
                            pageSize={
                                !this.props.transpose
                                    ? this.props.properties.filter(property => property.active).length
                                    : this.props.contributions.filter(contribution => contribution.active).length
                            }
                            data={[
                                ...(!this.props.transpose
                                    ? this.props.properties
                                          .filter(property => property.active && this.props.data[property.id])
                                          .map((property, index) => {
                                              return {
                                                  property: property,
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
                                            <Properties className="columnProperty">
                                                <PropertiesInner cellPadding={cellPadding}>
                                                    <PropertyValue similar={props.value.similar} label={props.value.label} id={props.value.id} />
                                                </PropertiesInner>
                                            </Properties>
                                        ) : (
                                            <Properties className="columnContribution">
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
                                                    <Contribution>
                                                        {props.value.contributionLabel} {props.value.year && `- ${props.value.year}`}
                                                    </Contribution>
                                                </PropertiesInner>

                                                {this.props.contributions.filter(contribution => contribution.active).length > 2 && (
                                                    <Delete onClick={() => this.props.removeContribution(props.value.id)}>
                                                        <Icon icon={faTimes} />
                                                    </Delete>
                                                )}
                                            </Properties>
                                        ),
                                    width: 250
                                },
                                ...(!this.props.transpose && this.props.contributions
                                    ? this.props.contributions
                                          .map((contribution, index) => {
                                              if (contribution.active) {
                                                  return {
                                                      id: contribution.id, // <-here
                                                      Header: props => (
                                                          <ItemHeader key={`contribution${contribution.id}`}>
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
                                                                  <Contribution>
                                                                      {contribution.year && `${contribution.year} - `}
                                                                      {contribution.contributionLabel}
                                                                  </Contribution>
                                                              </ItemHeaderInner>

                                                              {this.props.contributions.filter(contribution => contribution.active).length > 2 && (
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
                                                      Cell: props => <TableCell data={props.value} viewDensity={this.props.viewDensity} />, // Custom cell components!
                                                      width: 250
                                                  };
                                              } else {
                                                  return null;
                                              }
                                          })
                                          .filter(Boolean)
                                    : this.props.properties
                                          .filter(property => property.active && this.props.data[property.id])
                                          .map((property, index) => {
                                              return {
                                                  id: property.id, // <-here
                                                  Header: props => (
                                                      <ItemHeader key={`property${property.id}`}>
                                                          <ItemHeaderInner transpose={this.props.transpose}>
                                                              <PropertyValue similar={property.similar} label={property.label} id={property.id} />
                                                          </ItemHeaderInner>
                                                      </ItemHeader>
                                                  ),
                                                  accessor: d => {
                                                      //return d.values[index].length > 0 ? d.values[index][0].label : '';
                                                      return d.values[index];
                                                  },
                                                  Cell: props => <TableCell data={props.value} viewDensity={this.props.viewDensity} />, // Custom cell components!
                                                  width: 250
                                              };
                                          }))
                            ]}
                            style={{
                                height: 'max-content' // This will force the table body to overflow and scroll, since there is not enough room
                            }}
                            showPagination={false}
                        />
                    </ScrollSync>
                </ReactTableWrapper>
                <div className="clearfix">
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
                </div>
            </>
        );
    }
}

ComparisonTable.propTypes = {
    contributions: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    properties: PropTypes.array.isRequired,
    removeContribution: PropTypes.func.isRequired,
    transpose: PropTypes.bool.isRequired,
    viewDensity: PropTypes.oneOf(['spacious', 'normal', 'compact'])
};

export default ComparisonTable;
