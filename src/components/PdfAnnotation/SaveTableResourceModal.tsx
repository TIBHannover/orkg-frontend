import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { findTypeByIdOrName, parseCellString } from '@/app/csv-import/steps/helpers';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useMembership from '@/components/hooks/useMembership';
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { MISC } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import { createTable } from '@/services/backend/tables';
import { NewLiteral, NewResource } from '@/services/backend/types';
import { setAnnotationTableSaved, setAnnotationView } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';
import { guid } from '@/utils';

type SaveTableResourceModalProps = {
    isOpen: boolean;
    toggle: () => void;
    id: string;
};

const prepareTableData = (tableData: string[][]) => {
    const newResources: { [key: string]: NewResource } = {};
    const newLiterals: { [key: string]: NewLiteral } = {};
    const hasTitleColumn = tableData[0][0]?.trim() !== '';
    const rows = tableData.map((row) => {
        const data = row.map((cell) => {
            const { label, typeStr, hasTypeInfo, isNewResource, isExistingResource, entityId } = parseCellString(cell || '');
            if (isExistingResource) {
                return entityId;
            }
            if (isNewResource) {
                const _id = `#${guid()}`;
                newResources[_id] = { label, classes: [] };
                return _id;
            }
            if (label === '' || label === null || label === undefined) {
                return null;
            }
            if (hasTypeInfo) {
                const _id = `#${guid()}`;
                const typeObj = findTypeByIdOrName(typeStr || '');
                newLiterals[_id] = { label, data_type: typeObj?.type || MISC.DEFAULT_LITERAL_DATATYPE };
                return _id;
            }
            const _id = `#${guid()}`;
            newLiterals[_id] = { label, data_type: MISC.DEFAULT_LITERAL_DATATYPE };
            return _id;
        });
        if (hasTitleColumn) {
            return { data: data.slice(1), label: newLiterals[data[0] as string]?.label ?? null };
        }
        return { data, label: null };
    });
    return { rows, literals: newLiterals, resources: newResources, predicates: {}, lists: {}, classes: {} };
};

const SaveTableResourceModal = ({ isOpen, toggle, id }: SaveTableResourceModalProps) => {
    const { organizationId, observatoryId } = useMembership();
    const dispatch = useDispatch();
    const tableData = useSelector((state: RootStore) => state.pdfAnnotation.tableData[id]);
    const [isLoading, setIsLoading] = useState(false);
    const [resourceLabel, setResourceLabel] = useState('');

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const tableId = await createTable({
                label: resourceLabel,
                ...prepareTableData(tableData),
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                extraction_method: EXTRACTION_METHODS.MANUAL,
            });
            toast.success('Table saved successfully');
            dispatch(setAnnotationTableSaved({ id, tableId, tableLabel: resourceLabel }));
            dispatch(setAnnotationView({ id, view: 'done' }));
            toggle();
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('An unknown error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Modal isOpen={isOpen} toggle={toggle} backdrop="static">
            <ModalHeader toggle={toggle}>Save table as resource</ModalHeader>
            <ModalBody>
                <p>Please provide a label for the resource.</p>
                <FormGroup>
                    <Label for="resourceLabel">Label</Label>
                    <Input type="text" value={resourceLabel} onChange={(e) => setResourceLabel(e.target.value)} id="resourceLabel" />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle} disabled={isLoading}>
                    Cancel
                </Button>
                <ButtonWithLoading color="primary" onClick={handleSave} isLoading={isLoading} loadingMessage="Saving...">
                    Save
                </ButtonWithLoading>
            </ModalFooter>
        </Modal>
    );
};
export default SaveTableResourceModal;
