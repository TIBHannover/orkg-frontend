import { faPen } from '@fortawesome/free-solid-svg-icons';
import CuratorModal from 'components/CuratorModal/CuratorModal';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import { StyledButton } from 'components/StatementBrowser/styled';
import { ENTITIES } from 'constants/graphSettings';
import { useState, FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Input, InputGroup } from 'reactstrap';
import { updatePredicate } from 'services/backend/predicates';
import { updateResource } from 'services/backend/resources';
import { updateClass } from 'services/backend/classes';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import { RootStore } from 'slices/types';

type EditableHeaderProp = {
    id: string;
    value: string;
    onChange: (arg: string) => void;
    entityType: (typeof ENTITIES)[keyof typeof ENTITIES];
    curatorsOnly: boolean;
};
const EditableHeader: FC<EditableHeaderProp> = ({ entityType, id, onChange, curatorsOnly = false, value }) => {
    const [label, setLabel] = useState<string>(value);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isOpenCuratorModal, setIsOpenCuratorModal] = useState(false);

    const user = useSelector((state: RootStore) => state.auth.user);
    const isCurator = user ? user.isCurationAllowed : false;

    const handleSubmitClick = async () => {
        setIsLoading(true);

        try {
            if (entityType === ENTITIES.RESOURCE) {
                await updateResource(id, label);
            } else if (entityType === ENTITIES.PREDICATE) {
                await updatePredicate(id, label);
            } else if (entityType === ENTITIES.CLASS) {
                await updateClass(id, label);
            }
            toast.success('Label updated successfully');
            onChange(label);
            setIsEditMode(false);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Error updating resource : ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setLabel(value);
    }, [value]);

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
                    {id.split(':')[0] === 'wikidata' ? (
                        <StatementActionButton title="Wikidata cannot be edit" isDisabled icon={faPen} action={handleEditClick} />
                    ) : (
                        <span className="ms-2">
                            <StatementActionButton title="Edit label" icon={faPen} action={handleEditClick} />
                        </span>
                    )}
                </h3>
            )}
            {isEditMode && (
                <div className="clearfix">
                    <InputGroup>
                        <Input type="text" maxLength={MAX_LENGTH_INPUT} value={label} onChange={(e) => setLabel(e.target.value)} />
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
            {isOpenCuratorModal && <CuratorModal toggle={() => setIsOpenCuratorModal((v) => !v)} />}
        </div>
    );
};

export default EditableHeader;
