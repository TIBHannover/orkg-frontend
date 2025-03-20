import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

const PathTooltipContent = ({ data, cellDataValue, openStatementBrowser }) => {
    const isEqualPaths = data?.length > 0 ? data[0].path_labels?.length === data[0].path?.length : true;
    if (!isEqualPaths) {
        return null;
    }

    return (
        <tr>
            <td>Path</td>
            <td>
                {data.path_labels?.map((path, index) => {
                    const resourceType = index % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE;
                    return (
                        <span key={index}>
                            <span
                                className={resourceType !== ENTITIES.PREDICATE ? 'btn-link' : ''}
                                onClick={() =>
                                    resourceType !== ENTITIES.PREDICATE
                                        ? openStatementBrowser(
                                              data.path[index],
                                              path,
                                              resourceType,
                                              resourceType === ENTITIES.RESOURCE
                                                  ? data.path_labels.slice(0, index).map((l, i) => ({
                                                        id: cellDataValue.path[i],
                                                        label: l,
                                                        _class: i % 2 === 0 ? ENTITIES.RESOURCE : ENTITIES.PREDICATE,
                                                    }))
                                                  : [],
                                          )
                                        : null
                                }
                                style={{ cursor: resourceType !== ENTITIES.PREDICATE ? 'pointer' : 'default' }}
                                onKeyDown={(e) =>
                                    e.keyCode === 13
                                        ? () =>
                                              resourceType !== ENTITIES.PREDICATE
                                                  ? openStatementBrowser(
                                                        data.path[index],
                                                        path,
                                                        resourceType,
                                                        resourceType === ENTITIES.RESOURCE
                                                            ? data.path_labels.slice(0, index).map((l, i) => ({
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
                            {index !== data.path_labels?.length - 1 && ' / '}
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
