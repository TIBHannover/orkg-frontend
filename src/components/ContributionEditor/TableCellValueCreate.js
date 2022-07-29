import { faPlus } from '@fortawesome/free-solid-svg-icons';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { ENTITIES } from 'constants/graphSettings';
import TableCellForm from 'components/ContributionEditor/TableCellForm/TableCellForm';
import useTableCellForm from 'components/ContributionEditor/TableCellForm/hooks/useTableCellForm';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import styled from 'styled-components';

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
        isModelOpen,
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
                        <StatementActionButton
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
            {isModelOpen && (
                <StatementBrowserDialog
                    toggleModal={v => setIsModalOpen(!v)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
                    show
                    enableEdit={true}
                    syncBackend
                    onCloseModal={() => updateResourceStatements(dialogResourceId)}
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
