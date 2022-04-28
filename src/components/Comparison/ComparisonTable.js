import { memo, useRef, useMemo } from 'react';
import { Alert } from 'reactstrap';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropertyValue from 'components/Comparison/PropertyValue';
import ROUTES from 'constants/routes';
import { functions, isEqual, omit } from 'lodash';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { ScrollSyncPane } from 'react-scroll-sync';
import { ReactTableWrapper, Contribution, Delete, ItemHeader, ItemHeaderInner, Properties, PropertiesInner } from './styled';
import TableCell from './TableCell';
import { useTable, useFlexLayout } from 'react-table';
import { useSticky } from 'react-table-sticky';
import { getPropertyObjectFromData, groupArrayByDirectoryPrefix } from 'utils';
import PropTypes from 'prop-types';
import { useMedia } from 'react-use';

const compareProps = (prevProps, nextProps) => {
    // remove functions from equality check (mainly targeting "removeContribution"), otherwise it is always false
    return isEqual(omit(prevProps, functions(prevProps)), omit(nextProps, functions(nextProps)));
};

const ComparisonTable = props => {
    const scrollContainerHead = useRef(null);
    const smallerFontSize = props.viewDensity === 'compact';
    const isSmallScreen = useMedia('(max-width: 576px)');

    let cellPadding = 10;
    if (props.viewDensity === 'normal') {
        cellPadding = 5;
    } else if (props.viewDensity === 'compact') {
        cellPadding = 1;
    }

    const data = useMemo(() => {
        let dataFrame = [
            ...(!props.transpose
                ? props.properties
                      .filter(property => property.active && props.data[property.id])
                      .map((property, index) => {
                          return {
                              property: property,
                              values: props.contributions.map((contribution, index2) => {
                                  const data = props.data[property.id] ? props.data[property.id][index2] : null;
                                  return data.sort((a, b) => a?.label?.localeCompare(b?.label));
                              })
                          };
                      })
                : props.contributions.map((contribution, index) => {
                      return {
                          property: contribution,
                          values: props.properties
                              .filter(property => property.active)
                              .map((property, index2) => {
                                  const data = props.data[property.id] ? props.data[property.id][index] : null;
                                  return data.sort((a, b) => a?.label?.localeCompare(b?.label));
                              })
                      };
                  }))
        ];
        if (!props.transpose && props.comparisonType === 'path') {
            let groups = omit(groupArrayByDirectoryPrefix(dataFrame.map((dO, index) => dO.property.id)), '');
            groups = Object.keys(groups);
            const shownGroups = [];
            groups.map(key => {
                const labels = dataFrame.map((dO, index) => dO.property.label);
                let index = 0;
                let found = false;
                labels.map((l, i) => {
                    if (!found && l.startsWith(key) && !labels.includes(key)) {
                        index = i;
                        found = true;
                        shownGroups.push(key);
                    }
                    return null;
                });
                // find where to place the header
                if (found) {
                    dataFrame.splice(index, 0, { property: { id: null, label: key, similar: [], group: true, groupId: key }, values: [] });
                }
                return null;
            });
            shownGroups
                .sort((a, b) => b.length - a.length)
                .map(key => {
                    dataFrame = dataFrame.map(row => {
                        if (row.property.label.startsWith(key)) {
                            return {
                                values: row.values,
                                property: { ...row.property, label: row.property.label.replace(key + '/', ''), grouped: true, inGroupId: key }
                            };
                        }
                        return row;
                    });
                    return null;
                });
            dataFrame = dataFrame.filter(row => !props.hiddenGroups.includes(row.property.inGroupId) || row.property.group);
        }
        return dataFrame;
    }, [props.transpose, props.properties, props.contributions, props.comparisonType, props.data, props.hiddenGroups]);

    const defaultColumn = useMemo(
        () => ({
            minWidth: 250,
            width: 1,
            maxWidth: 2
        }),
        []
    );

    const columns = useMemo(() => {
        if (props.filterControlData.length === 0) {
            return [];
        }
        return [
            {
                Header: (
                    <Properties>
                        <PropertiesInner transpose={props.transpose} className="first">
                            Properties
                        </PropertiesInner>
                    </Properties>
                ),
                accessor: 'property',
                sticky: !isSmallScreen ? 'left' : undefined,
                Cell: info => {
                    return !props.transpose ? (
                        <Properties className={`columnProperty ${info.value.group ? 'columnPropertyGroup' : ''}`}>
                            <PropertiesInner className="d-flex flex-row align-items-start justify-content-between" cellPadding={cellPadding}>
                                <PropertyValue
                                    embeddedMode={props.embeddedMode}
                                    filterControlData={props.filterControlData}
                                    updateRulesOfProperty={props.updateRulesOfProperty}
                                    similar={info.value.similar}
                                    label={info.value.label}
                                    id={info.value.id}
                                    group={info.value.group ?? false}
                                    grouped={info.value.grouped ?? false}
                                    groupId={info.value.groupId ?? null}
                                    handleToggleShow={props.handleToggleGroupVisibility}
                                    property={props.comparisonType === 'merge' ? info.value : getPropertyObjectFromData(props.data, info.value)}
                                    hiddenGroups={props.hiddenGroups}
                                />
                            </PropertiesInner>
                        </Properties>
                    ) : (
                        <Properties className="columnContribution">
                            <PropertiesInner transpose={props.transpose}>
                                <Link
                                    to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                        resourceId: info.value.paperId,
                                        contributionId: info.value.id
                                    })}
                                >
                                    {info.value.title ? info.value.title : <em>No title</em>}
                                </Link>
                                <br />
                                <Contribution>
                                    {info.value.contributionLabel} {info.value.year && `- ${info.value.year}`}
                                </Contribution>
                            </PropertiesInner>

                            {!props.embeddedMode && props.contributions.filter(contribution => contribution.active).length > 2 && (
                                <Delete onClick={() => props.removeContribution(info.value.id)}>
                                    <Icon icon={faTimes} />
                                </Delete>
                            )}
                        </Properties>
                    );
                }
            },
            ...(!props.transpose && props.contributions
                ? props.contributions
                      .map((contribution, index) => {
                          if (contribution.active) {
                              return {
                                  id: contribution.id, // <-here
                                  Header: () => {
                                      return (
                                          <ItemHeader key={`contribution${contribution.id}`}>
                                              <ItemHeaderInner>
                                                  <Link
                                                      to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
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

                                              {!props.embeddedMode && props.contributions.filter(contribution => contribution.active).length > 2 && (
                                                  <Delete onClick={() => props.removeContribution(contribution.id)}>
                                                      <Icon icon={faTimes} />
                                                  </Delete>
                                              )}
                                          </ItemHeader>
                                      );
                                  },
                                  accessor: d => {
                                      //return d.values[index].length > 0 ? d.values[index][0].label : '';
                                      return d.values[index];
                                  },
                                  Cell: cell => <TableCell data={cell.value} viewDensity={props.viewDensity} /> // Custom cell components!
                              };
                          } else {
                              return null;
                          }
                      })
                      .filter(Boolean)
                : props.properties
                      .filter(property => property.active && props.data[property.id])
                      .map((property, index) => {
                          return {
                              id: property.id, // <-here
                              Header: () => (
                                  <ItemHeader key={`property${property.id}`}>
                                      <ItemHeaderInner
                                          className="d-flex flex-row align-items-center justify-content-between"
                                          transpose={props.transpose}
                                      >
                                          <PropertyValue
                                              embeddedMode={props.embeddedMode}
                                              filterControlData={props.filterControlData}
                                              updateRulesOfProperty={props.updateRulesOfProperty}
                                              similar={property.similar}
                                              label={property.label}
                                              id={property.id}
                                              group={property.group ?? false}
                                              grouped={property.grouped ?? false}
                                              property={props.comparisonType === 'merge' ? property : getPropertyObjectFromData(props.data, property)}
                                          />
                                      </ItemHeaderInner>
                                  </ItemHeader>
                              ),
                              accessor: d => {
                                  //return d.values[index].length > 0 ? d.values[index][0].label : '';
                                  return d.values[index];
                              },
                              Cell: cell => <TableCell data={cell.value} viewDensity={props.viewDensity} /> // Custom cell components!
                          };
                      }))
        ];
        // TODO: remove disable lint rule: useCallback for removeContribution and add used dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.transpose, props.properties, props.contributions, props.filterControlData, props.viewDensity, isSmallScreen, props.hiddenGroups]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data,
            defaultColumn
        },
        useFlexLayout,
        useSticky
    );

    return (
        <ReactTableWrapper>
            <div
                id="comparisonTable"
                {...getTableProps()}
                className="table sticky mb-0 p-0"
                style={{ height: 'max-content', fontSize: smallerFontSize ? '0.95rem' : '1rem' }}
            >
                <ScrollSyncPane group="one">
                    <div
                        ref={scrollContainerHead}
                        style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }}
                        className="disable-scrollbars"
                    >
                        {headerGroups.map(headerGroup => (
                            <div className="header" {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <div {...column.getHeaderProps()} className="th p-0">
                                        {column.render('Header')}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </ScrollSyncPane>
                <ScrollSyncPane group="one">
                    <div ref={props.scrollContainerBody} style={{ overflow: 'auto' }}>
                        <div {...getTableBodyProps()} className="comparisonBody" style={{ ...getTableProps().style }}>
                            {rows.map((row, i) => {
                                prepareRow(row);
                                return (
                                    <div {...row.getRowProps()} className="tr p-0">
                                        {row.cells.map(cell => {
                                            return (
                                                <div {...cell.getCellProps()} className="td p-0">
                                                    {cell.render('Cell')}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollSyncPane>
            </div>
            {rows.length === 0 && (
                <Alert className="mt-3" color="info">
                    These contributions have no data to compare on!
                </Alert>
            )}
        </ReactTableWrapper>
    );
};

ComparisonTable.propTypes = {
    contributions: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    properties: PropTypes.array.isRequired,
    removeContribution: PropTypes.func.isRequired,
    transpose: PropTypes.bool.isRequired,
    comparisonType: PropTypes.string.isRequired,
    viewDensity: PropTypes.oneOf(['spacious', 'normal', 'compact']),
    scrollContainerBody: PropTypes.object.isRequired,
    filterControlData: PropTypes.array.isRequired,
    updateRulesOfProperty: PropTypes.func.isRequired,
    embeddedMode: PropTypes.bool.isRequired,
    hiddenGroups: PropTypes.array,
    handleToggleGroupVisibility: PropTypes.func
};

ComparisonTable.defaultProps = {
    embeddedMode: false,
    hiddenGroups: [],
    handleToggleGroupVisibility: null
};

export default memo(ComparisonTable, compareProps);
