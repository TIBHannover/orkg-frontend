import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PathTooltipContent from 'components/Comparison/Table/Cells/PathTooltipContent';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from 'components/FloatingUI/Tooltip';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useMeasure } from 'react-use';
import { Button } from 'reactstrap';

const TableCellLiteral = ({ entity }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [ref, { height }] = useMeasure();

    let showButton = false;

    if (height >= 200) {
        showButton = true;
    }

    return (
        <>
            <div ref={ref} className="overflow-hidden" style={{ maxHeight: isExpanded ? 'initial' : 200 }}>
                <DescriptionTooltip
                    id={entity.id}
                    _class={entity._class}
                    extraContent={entity.path_labels?.length > 1 ? <PathTooltipContent data={entity} cellDataValue={entity} /> : ''}
                >
                    <span>
                        <ValuePlugins type="literal" options={{ inModal: true }}>
                            {entity.label}
                        </ValuePlugins>
                    </span>
                </DescriptionTooltip>
            </div>
            {showButton && (
                <Tooltip content={entity.label} disabled={isExpanded} contentStyle={{ maxWidth: '300px' }}>
                    <span>
                        <Button color="secondary" outline size="sm" className="mt-1 border-0" onClick={() => setIsExpanded((v) => !v)}>
                            {isExpanded ? 'Hide more' : 'Show more'} <FontAwesomeIcon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} />
                        </Button>
                    </span>
                </Tooltip>
            )}
        </>
    );
};

TableCellLiteral.propTypes = {
    entity: PropTypes.object.isRequired,
};

export default TableCellLiteral;
