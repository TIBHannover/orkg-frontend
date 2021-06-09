import { reloadDataTableStatements } from 'actions/smartReview';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';

const OntologyItem = ({ id, label, type, isEditable, sectionId }) => {
    const [isModelOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();

    const handleToggleModal = () => {
        if (isModelOpen && isEditable && type === 'property') {
            dispatch(
                reloadDataTableStatements({
                    id,
                    sectionId
                })
            );
        }
        setIsModalOpen(v => !v);
    };
    return (
        <>
            <Button color="link" className="p-0 text-wrap text-left" style={{ maxWidth: '100%' }} onClick={() => setIsModalOpen(true)}>
                {label}
            </Button>
            {isModelOpen && (
                <StatementBrowserDialog toggleModal={handleToggleModal} id={id} label={label} show enableEdit={isEditable} syncBackend type={type} />
            )}
        </>
    );
};

OntologyItem.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    sectionId: PropTypes.string.isRequired,
    isEditable: PropTypes.bool.isRequired
};

export default memo(OntologyItem);
