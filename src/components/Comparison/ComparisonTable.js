import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes';
import capitalize from 'capitalize';
import TableCell from './TableCell';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import withFixedColumnsScrollEvent from 'react-table-hoc-fixed-columns';
import 'react-table-hoc-fixed-columns/lib/styles.css'; // important: this line must be placed after react-table css import

const ReactTableFixedColumns = withFixedColumnsScrollEvent(ReactTable);

const ReactTableWrapper = styled.div`
    clear: both;
    .rthfc .-filters .rt-th.rthfc-th-fixed-left-last,
    .rthfc .rt-th.rthfc-th-fixed-left-last,
    .rthfc .rt-td.rthfc-td-fixed-left-last,
    .ReactTable .rt-tbody .rt-td,
    .ReactTable {
        border: 0;
    }
    .ReactTable .rt-th,
    .ReactTable .rt-td,
    .ReactTable .rt-thead .rt-th,
    .ReactTable .rt-thead .rt-td {
        padding: 0;
        border: 0;
        overflow: initial;
        white-space: initial;
    }
    .ReactTable .rt-th > div {
        height: 100%;
    }
    .ReactTable .rt-tbody .rt-tr-group {
        border: 0;
    }
    .ReactTable .rt-thead .rt-tr {
        text-align: left;
        position: sticky;
        top: 0;
        background: white;
    }
    .ReactTable .rt-table {
        position: relative;
    }
    .ReactTable .rt-thead.-header {
        box-shadow: none;
    }
    .ReactTable .rt-tbody .rt-tr-group:last-child .rt-td > div div:first-child {
        border-bottom: 2px solid #cfcbcb !important;
        border-radius: 0 0 11px 11px !important;
    }
`;

const Properties = styled.div`
    padding-right: 10px;
    padding: 0 10px 0 0 !important;
    margin: 0;
    display: inline-block;
    height: 100%;
    width: 250px;
    position: relative;
    background: transparent;
`;

const PropertiesInner = styled.div`
    background: ${props => (props.transpose ? '#E86161' : '#80869B')};
    height: 100%;
    color: #fff;
    padding: 10px;
    border-bottom: ${props => (props.transpose ? '2px solid #fff!important' : '2px solid #8B91A5!important')};

    a {
        color: #fff !important;
    }

    &.first {
        border-radius: 11px 11px 0 0;
    }

    &.last {
        border-radius: 0 0 11px 11px;
    }
`;

const ItemHeader = styled.div`
    padding-right: 10px;
    min-height: 50px;
    padding: 0 10px !important;
    margin: 0;
    display: inline-block;
    height: 100%;
    width: 250px;
    position: relative;
`;

const ItemHeaderInner = styled.div`
    padding: 5px 10px;
    background: ${props => (!props.transpose ? '#E86161' : '#80869B')};
    border-radius: 11px 11px 0 0;
    color: #fff;
    height: 100%;

    a {
        color: #fff !important;
    }
`;

const Contribution = styled.div`
    color: #ffa5a5;
    font-size: 85%;
`;

const Delete = styled.div`
    position: absolute;
    top: 0px;
    right: 5px;
    background: #ffa3a3;
    border-radius: 20px;
    width: 24px;
    height: 24px;
    text-align: center;
    color: #e86161;
    cursor: pointer;

    &:hover {
        background: #fff;
    }
`;

class ComparisonTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showPropertiesDialog: false,
            showShareDialog: false
        };
    }

    render() {
        return (
            <>
                <ReactTableWrapper>
                    <ReactTableFixedColumns
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
                        className={''}
                        showPagination={false}
                    />
                </ReactTableWrapper>
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
