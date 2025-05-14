import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import styled from 'styled-components';

import ActionButton from '@/components/ActionButton/ActionButton';
import useTableCellForm from '@/components/ContributionEditor/TableCellForm/hooks/useTableCellForm';
import TableCellForm from '@/components/ContributionEditor/TableCellForm/TableCellForm';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { ENTITIES } from '@/constants/graphSettings';

const CreateButtonContainer = styled.div`
    position: absolute;
    bottom: -13px;
    left: 50%;
    margin-left: -15px;
    z-index: 1;
    display: none;
`;

const TableCellValueCreate = ({ isVisible, contributionId, propertyId, isEmptyCell }) => {
    const [isCreating, setIsCreating] = useState(false);

    const {
        createBlankNode,
        isModalOpen,
        dialogResourceId,
        dialogResourceLabel,
        setIsModalOpen,
        isBlankNode,
        entityType,
        canAddValue,
        updateResourceStatements,
    } = useTableCellForm({
        value: null,
        contributionId,
        propertyId,
    });

    return (
        <>
            {!isCreating && isVisible && (
                <div
                    className={isEmptyCell ? 'h-100' : ''}
                    role="button"
                    tabIndex="0"
                    onDoubleClick={() => {
                        if (isBlankNode && entityType !== ENTITIES.LITERAL) {
                            createBlankNode(entityType);
                        } else {
                            setIsCreating(true);
                        }
                    }}
                >
                    <CreateButtonContainer className="create-button">
                        <ActionButton
                            isDisabled={!canAddValue}
                            title={canAddValue ? 'Add value' : 'This property reached the maximum number of values set by template'}
                            icon={faPlus}
                            appendTo={document.body}
                            action={() => {
                                if (isBlankNode && entityType !== ENTITIES.LITERAL) {
                                    createBlankNode(entityType);
                                } else {
                                    setIsCreating(true);
                                }
                            }}
                        />
                    </CreateButtonContainer>
                </div>
            )}
            {isModalOpen && (
                <DataBrowserDialog
                    show
                    toggleModal={(v) => setIsModalOpen(!v)}
                    onCloseModal={() => updateResourceStatements(dialogResourceId)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    canEditSharedRootLevel={false}
                    isEditMode
                />
            )}

            {isCreating && <TableCellForm closeForm={setIsCreating} contributionId={contributionId} propertyId={propertyId} />}
        </>
    );
};

TableCellValueCreate.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    contributionId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    isEmptyCell: PropTypes.bool.isRequired,
};

export default memo(TableCellValueCreate);
