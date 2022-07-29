import { faPen } from '@fortawesome/free-solid-svg-icons';
import CuratorModal from 'components/CuratorModal/CuratorModal';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { StyledButton } from 'components/StatementBrowser/styled';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Input, InputGroup } from 'reactstrap';
import { updatePredicate } from 'services/backend/predicates';
import { updateResource } from 'services/backend/resources';

const EditableHeader = ({ entityType, id, onChange, curatorsOnly = false, value }) => {
    const [label, setLabel] = useState(value);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isOpenCuratorModal, setIsOpenCuratorModal] = useState(false);
    const isCurator = useSelector(state => state.auth.user?.isCurationAllowed);

    const handleSubmitClick = async () => {
        setIsLoading(true);

        try {
            if (entityType === ENTITIES.RESOURCE) {
                await updateResource(id, label);
            } else if (entityType === ENTITIES.PREDICATE) {
                await updatePredicate(id, label);
            }
            toast.success('Label updated successfully');
            onChange(label);
            setIsEditMode(false);
        } catch (error) {
            toast.error(`Error updating resource : ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelClick = () => {
        setIsEditMode(false);
        setLabel(value);
    };

    const handleEditClick = () => {
        if (curatorsOnly && !isCurator) {
            setIsOpenCuratorModal(true);
            return;
        }
        setIsEditMode(true);
    };

    return (
        <div className="pb-3">
            {!isEditMode && (
                <h3 className="mb-0">
                    {label || <small className="fst-italic">No label</small>}
                    <span className="ms-2">
                        <StatementActionButton title="Edit label" icon={faPen} action={handleEditClick} />
                    </span>
                </h3>
            )}
            {isEditMode && (
                <div className="clearfix">
                    <InputGroup>
                        <Input value={label} onChange={e => setLabel(e.target.value)} />
                        <StyledButton className="px-3" outline onClick={handleCancelClick}>
                            Cancel
                        </StyledButton>
                        <StyledButton className="px-3" outline onClick={handleSubmitClick}>
                            Done
                        </StyledButton>
                    </InputGroup>
                </div>
            )}
            {isLoading && <span className="fa fa-spinner fa-spin" />}
            {isOpenCuratorModal && <CuratorModal toggle={() => setIsOpenCuratorModal(v => !v)} />}
        </div>
    );
};

EditableHeader.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    entityType: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.PREDICATE]),
    curatorsOnly: PropTypes.bool,
};

export default EditableHeader;
