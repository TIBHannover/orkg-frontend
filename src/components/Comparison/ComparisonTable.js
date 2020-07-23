import React, { Component } from 'react';
import { ReactTableWrapper, Properties, PropertiesInner, ItemHeader, ItemHeaderInner, Contribution, Delete, ScrollButton } from './styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import capitalize from 'capitalize';
import TableCell from './TableCell';
import ReactTable from 'react-table';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Tippy from '@tippy.js/react';
import { debounce } from 'lodash';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import withFixedColumnsScrollEvent from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css'; // important: this line must be placed after react-table css import

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
            if (this.props.contributions !== prevProps.contributions && this.props.contributions.length > 3) {
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
        const scrollContainerClasses = classNames({
            'overflowing-left': this.state.showBackButton,
            'overflowing-right': this.state.showNextButton,
            'overflowing-both': this.state.showBackButton && this.state.showNextButton
        });

        const customProps = { id: 'comparisonTable' };
        return (
            <>
                <ReactTableWrapper className={scrollContainerClasses}>
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
                                    : this.props.contributions.length
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
                                            <Properties>
                                                <PropertiesInner>
                                                    <ConditionalWrapper
                                                        condition={props.value.similar && props.value.similar.length > 0}
                                                        wrapper={children => (
                                                            <Tippy
                                                                content={`This property is merged with : ${props.value.similar.join(', ')}`}
                                                                arrow={true}
                                                            >
                                                                <span>{children}*</span>
                                                            </Tippy>
                                                        )}
                                                    >
                                                        {capitalize(props.value.label)}
                                                    </ConditionalWrapper>
                                                </PropertiesInner>
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
                                                    <Contribution>
                                                        {props.value.contributionLabel} {props.value.year && `- ${props.value.year}`}
                                                    </Contribution>
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
                                                          <Contribution>
                                                              {contribution.contributionLabel} {contribution.year && `- ${contribution.year}`}
                                                          </Contribution>
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
                                                              <ConditionalWrapper
                                                                  condition={property.similar && property.similar.length > 0}
                                                                  wrapper={children => (
                                                                      <Tippy
                                                                          content={`This property is merged with : ${property.similar.join(', ')}`}
                                                                          arrow={true}
                                                                      >
                                                                          <span>{children}*</span>
                                                                      </Tippy>
                                                                  )}
                                                              >
                                                                  {capitalize(property.label)}
                                                              </ConditionalWrapper>
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
                    </ScrollSync>
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
