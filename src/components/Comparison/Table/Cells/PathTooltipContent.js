import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

const PathTooltipContent = ({ data, cellDataValue, openStatementBrowser }) => {
    const isEqualPaths = data?.length > 0 ? data[0].pathLabels?.length === data[0].path?.length : true;

    return (
        <tr>
            <td>Path</td>
            <td>
                {data.pathLabels?.map((path, index) => {
                    const resourceType = isEqualPaths
                        ? index % 2 === 0
                            ? ENTITIES.RESOURCE
                            : ENTITIES.PREDICATE
                        : index % 2 !== 0
                        ? ENTITIES.RESOURCE
                        : ENTITIES.PREDICATE;
                    return (
                        <span key={index}>
                            <span
                                className={resourceType !== ENTITIES.PREDICATE ? 'btn-link' : ''}
                                onClick={() =>
                                    resourceType !== ENTITIES.PREDICATE
                                        ? openStatementBrowser(
                                              data.path[isEqualPaths ? index : index + 1],
                                              path,
                                              resourceType,
                                              resourceType === ENTITIES.RESOURCE
                                                  ? data.pathLabels.slice(0, isEqualPaths ? index : index + 1).map((l, i) => ({
                                                        id: cellDataValue.path[i],
                                                        label: l,
                                                        _class: i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE,
                                                    }))
                                                  : [],
                                          )
                                        : null
                                }
                                style={{ cursor: resourceType !== ENTITIES.PREDICATE ? 'pointer' : 'default' }}
                                onKeyDown={e =>
                                    e.keyCode === 13
                                        ? () =>
                                              resourceType !== ENTITIES.PREDICATE
                                                  ? openStatementBrowser(
                                                        data.path[isEqualPaths ? index : index + 1],
                                                        path,
                                                        resourceType,
                                                        resourceType === ENTITIES.RESOURCE
                                                            ? data.pathLabels.slice(0, isEqualPaths ? index : index + 1).map((l, i) => ({
                                                                  id: cellDataValue.path[i],
                                                                  label: l,
                                                                  _class: i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE,
                                                              }))
                                                            : [],
                                                    )
                                                  : null
                                        : undefined
                                }
                                role="button"
                                tabIndex={0}
                            >
                                {path}
                            </span>
                            {index !== data.pathLabels?.length - 1 && ' / '}
                        </span>
                    );
                })}
            </td>
        </tr>
    );
};

PathTooltipContent.propTypes = {
    data: PropTypes.object,
    cellDataValue: PropTypes.object,
    openStatementBrowser: PropTypes.func,
};
export default PathTooltipContent;
