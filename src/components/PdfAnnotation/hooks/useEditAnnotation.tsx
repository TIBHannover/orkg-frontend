import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import EditAnnotationTextModal from '@/components/PdfAnnotation/EditAnnotationTextModal';
import { updateAnnotationText } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

const useEditAnnotation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [annotationId, setAnnotationId] = useState<string | null>(null);
    const [value, setValue] = useState<string | null>(null);
    const annotations = useSelector((state: RootStore) => state.pdfAnnotation.annotations);
    const dispatch = useDispatch();

    const toggleIsOpen = () => {
        setIsOpen((prevState) => !prevState);
    };

    const editAnnotation = (id: string) => {
        toggleIsOpen();
        setAnnotationId(id);

        const annotation = annotations.find((annotation) => annotation.id === id);

        if (annotation?.content?.text) {
            setValue(annotation.content.text);
        }
    };

    const handleDone = (id: string) => {
        dispatch(
            updateAnnotationText({
                id: annotationId,
                text: value,
            }),
        );

        toggleIsOpen();
    };

    const editModal = (
        <EditAnnotationTextModal
            isOpen={isOpen}
            toggle={toggleIsOpen}
            value={value}
            setValue={setValue}
            handleDone={() => handleDone(annotationId ?? '')}
        />
    );

    return { editModal, editAnnotation };
};

export default useEditAnnotation;
