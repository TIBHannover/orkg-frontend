import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import env from '@beam-australia/react-env';
import { Button } from 'reactstrap';

const TableCellValueResource = ({ value }) => {
    const [isModelOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button color="link" className="p-0 text-wrap" style={{ maxWidth: '100%' }} onClick={() => setIsModalOpen(true)}>
                {value.label || <i>No label</i>}
            </Button>
            {isModelOpen && (
                <StatementBrowserDialog
                    toggleModal={v => setIsModalOpen(!v)}
                    id={value.id}
                    label={value.label}
                    show
                    enableEdit={env('PWC_USER_ID') !== value.created_by ? true : undefined}
                    syncBackend
                />
            )}
        </>
    );
};

TableCellValueResource.propTypes = {
    value: PropTypes.object.isRequired
};

export default memo(TableCellValueResource);
