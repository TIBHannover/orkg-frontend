import { Button } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ExtractionModal from './ExtractionModal';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import useTableSelect from './hooks/useTableSelect';

const TableSelectContainer = styled.div`
    &.enable-table-select {
        // for pages
        cursor: crosshair; // set the cursor
        user-select: none; // disable text selection
        -webkit-touch-callout: none;

        // for images
        img {
            pointer-events: none;
        }
    }
`;

const SelectHelper = styled.div`
    position: absolute;
    background: #28afe975;
    border: 2px dashed #28afe9bd;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const RemoveTableButton = styled(Button)`
    position: absolute;
    right: -10px;
    top: -10px;
    pointer-events: all;
    border-radius: 100% !important;
    width: 25px;
    height: 25px;
`;

const TableSelect = props => {
    const tableRegions = useSelector(state => state.pdfAnnotation.tableRegions);
    const selectedTool = useSelector(state => state.pdfAnnotation.selectedTool);
    const [onMouseDown, onMouseUp, onMouseMove, pointerStyles, rect, handleExtract, deleteRegion, extractionModal, toggleModel] = useTableSelect(
        props
    );

    return (
        <>
            <TableSelectContainer
                className={selectedTool === 'tableSelect' && 'enable-table-select'}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
            >
                <div style={pointerStyles}>
                    {props.children}

                    {rect && <SelectHelper style={{ top: rect.y, left: rect.x, width: rect.w, height: rect.h }} />}

                    {Object.keys(tableRegions)
                        .filter(key => tableRegions[key].page === props.pageNumber)
                        .map(key => {
                            const { region } = tableRegions[key];
                            return (
                                <SelectHelper style={{ top: region.y, left: region.x, width: region.w, height: region.h }} key={key}>
                                    <RemoveTableButton color="darkblueDarker" size="sm" className="p-0" onMouseDown={e => deleteRegion(e, key)}>
                                        <Icon icon={faTimes} />
                                    </RemoveTableButton>
                                    <Button
                                        style={{ pointerEvents: 'all' }}
                                        color="primary"
                                        size="sm"
                                        onMouseDown={e => handleExtract(e, key, region)}
                                    >
                                        Extract table
                                    </Button>
                                </SelectHelper>
                            );
                        })}
                </div>
            </TableSelectContainer>

            {extractionModal.show && (
                <ExtractionModal
                    isOpen={true}
                    toggle={toggleModel}
                    region={extractionModal.region}
                    id={extractionModal.id}
                    pageNumber={props.pageNumber}
                />
            )}
        </>
    );
};

TableSelect.propTypes = {
    children: PropTypes.node.isRequired,
    pageNumber: PropTypes.number.isRequired
};

export default TableSelect;
