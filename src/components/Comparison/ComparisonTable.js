import { memo, useRef, useMemo } from 'react';
import { Alert } from 'reactstrap';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropertyValue from 'components/Comparison/PropertyValue';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { ScrollSyncPane } from 'react-scroll-sync';
import { useTable, useFlexLayout } from 'react-table';
import { useSticky } from 'react-table-sticky';
import { groupArrayByDirectoryPrefix, getPropertyObjectFromData } from 'components/Comparison/hooks/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { removeContribution } from 'slices/comparisonSlice';
import { cloneDeep, omit } from 'lodash';
import PropTypes from 'prop-types';
import { useMedia } from 'react-use';
import TableCell from './TableCell';
import { ReactTableWrapper, Contribution, Delete, ItemHeader, ItemHeaderInner, Properties, PropertiesInner } from './styled';

const ComparisonTable = props => {
    const dispatch = useDispatch();
    const filterControlData = useSelector(state => state.comparison.filterControlData);
    const data = useSelector(state => state.comparison.data);
    const properties = useSelector(state => state.comparison.properties);
    const contributions = useSelector(state => state.comparison.contributions);
    const viewDensity = useSelector(state => state.comparison.configuration.viewDensity);
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);
    const transpose = useSelector(state => state.comparison.configuration.transpose);
    const hiddenGroups = useSelector(state => state.comparison.hiddenGroups ?? []);

    const scrollContainerHead = useRef(null);
    const smallerFontSize = viewDensity === 'compact';
    const isSmallScreen = useMedia('(max-width: 576px)');

    let cellPadding = 10;
    if (viewDensity === 'normal') {
        cellPadding = 5;
    } else if (viewDensity === 'compact') {
        cellPadding = 1;
    }

    const tableData = useMemo(() => {
        let dataFrame = [
            ...(!transpose
                ? properties
                      .filter(property => property.active && data[property.id])
                      .map((property, index) => ({
                          property,
                          values: contributions.map((contribution, index2) => {
                              const _data = cloneDeep(data?.[property.id] ? data[property.id]?.[index2] : null);
                              return _data?.sort((a, b) => a?.label?.localeCompare(b?.label));
                          }),
                      }))
                : contributions.map((contribution, index) => ({
                      property: contribution,
                      values: properties
                          .filter(property => property.active)
                          .map((property, index2) => {
                              const _data = cloneDeep(data[property.id] ? data[property.id]?.[index] : null);
                              return _data?.sort((a, b) => a?.label?.localeCompare(b?.label));
                          }),
                  }))),
        ];
        if (!transpose && comparisonType === 'path') {
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
                                property: { ...row.property, label: row.property.label.replace(`${key}/`, ''), grouped: true, inGroupId: key },
                            };
                        }
                        return row;
                    });
                    return null;
                });
            dataFrame = dataFrame.filter(row => !hiddenGroups.includes(row.property.inGroupId) || row.property.group);
        }
        return dataFrame;
    }, [comparisonType, contributions, data, properties, hiddenGroups, transpose]);

    const defaultColumn = useMemo(
        () => ({
            minWidth: 250,
            width: 1,
            maxWidth: 2,
        }),
        [],
    );

    const columns = useMemo(() => {
        if (filterControlData.length === 0) {
            return [];
        }
        return [
            {
                Header: (
                    <Properties>
                        <PropertiesInner transpose={transpose} className="first">
                            Properties
                        </PropertiesInner>
                    </Properties>
                ),
                accessor: 'property',
                sticky: !isSmallScreen ? 'left' : undefined,
                Cell: info => {
                    if (!transpose) {
                        return (
                            <Properties className={`columnProperty ${info.value.group ? 'columnPropertyGroup' : ''}`}>
                                <PropertiesInner className="d-flex flex-row align-items-start justify-content-between" cellPadding={cellPadding}>
                                    <PropertyValue
                                        embeddedMode={props.embeddedMode}
                                        similar={info.value.similar}
                                        label={info.value.label}
                                        id={info.value.id}
                                        group={info.value.group ?? false}
                                        grouped={info.value.grouped ?? false}
                                        groupId={info.value.groupId ?? null}
                                        property={comparisonType === 'merge' ? info.value : getPropertyObjectFromData(data, info.value)}
                                    />
                                </PropertiesInner>
                            </Properties>
                        );
                    }
                    return (
                        <Properties className="columnContribution">
                            <PropertiesInner transpose={transpose}>
                                <Link
                                    to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                        resourceId: info.value.paperId,
                                        contributionId: info.value.id,
                                    })}
                                >
                                    {info.value.title ? info.value.title : <em>No title</em>}
                                </Link>
                                <br />
                                <Contribution>
                                    {info.value.contributionLabel} {info.value.year && `- ${info.value.year}`}
                                </Contribution>
                            </PropertiesInner>

                            {!props.embeddedMode && contributions.filter(contribution => contribution.active).length > 2 && (
                                <Delete onClick={() => dispatch(removeContribution(info.value.id))}>
                                    <Icon icon={faTimes} />
                                </Delete>
                            )}
                        </Properties>
                    );
                },
            },
            ...(!transpose && contributions
                ? contributions
                      .map((contribution, index) => {
                          if (contribution.active) {
                              return {
                                  id: contribution.id, // <-here
                                  Header: () => (
                                      <ItemHeader key={`contribution${contribution.id}`}>
                                          <ItemHeaderInner>
                                              <Link
                                                  to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                                      resourceId: contribution.paperId,
                                                      contributionId: contribution.id,
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

                                          {!props.embeddedMode && contributions.filter(c => c.active).length > 2 && (
                                              <Delete onClick={() => dispatch(removeContribution(contribution.id))}>
                                                  <Icon icon={faTimes} />
                                              </Delete>
                                          )}
                                      </ItemHeader>
                                  ),
                                  accessor: d =>
                                      // return d.values[index].length > 0 ? d.values[index][0].label : '';
                                      d.values[index],
                                  Cell: cell => <TableCell data={cell.value} viewDensity={viewDensity} />, // Custom cell components!
                              };
                          }
                          return null;
                      })
                      .filter(Boolean)
                : properties
                      .filter(property => property.active && data[property.id])
                      .map((property, index) => ({
                          id: property.id, // <-here
                          Header: () => (
                              <ItemHeader key={`property${property.id}`}>
                                  <ItemHeaderInner className="d-flex flex-row align-items-center justify-content-between" transpose={transpose}>
                                      <PropertyValue
                                          embeddedMode={props.embeddedMode}
                                          similar={property.similar}
                                          label={property.label}
                                          id={property.id}
                                          group={property.group ?? false}
                                          grouped={property.grouped ?? false}
                                          property={comparisonType === 'merge' ? property : getPropertyObjectFromData(data, property)}
                                      />
                                  </ItemHeaderInner>
                              </ItemHeader>
                          ),
                          accessor: d =>
                              // return d.values[index].length > 0 ? d.values[index][0].label : '';
                              d.values[index],
                          Cell: cell => <TableCell data={cell.value} viewDensity={viewDensity} />, // Custom cell components!
                      }))),
        ];
    }, [
        cellPadding,
        comparisonType,
        contributions,
        data,
        dispatch,
        filterControlData.length,
        isSmallScreen,
        properties,
        props.embeddedMode,
        transpose,
        viewDensity,
    ]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data: tableData,
            defaultColumn,
        },
        useFlexLayout,
        useSticky,
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
                            // eslint-disable-next-line react/jsx-key
                            <div className="header" {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    // eslint-disable-next-line react/jsx-key
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
                                    // eslint-disable-next-line react/jsx-key
                                    <div {...row.getRowProps()} className="tr p-0">
                                        {row.cells.map(cell => (
                                            // eslint-disable-next-line react/jsx-key
                                            <div {...cell.getCellProps()} className="td p-0">
                                                {cell.render('Cell')}
                                            </div>
                                        ))}
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
    scrollContainerBody: PropTypes.object.isRequired,
    embeddedMode: PropTypes.bool.isRequired,
};

ComparisonTable.defaultProps = {
    embeddedMode: false,
};

export default memo(ComparisonTable);
