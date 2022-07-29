import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EditAnnotationTextModal from 'components/PdfTextAnnotation/EditAnnotationTextModal';
import { updateAnnotationText } from 'slices/pdfTextAnnotationSlice';

const useEditAnnotation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [annotationId, setAnnotationId] = useState(null);
    const [value, setValue] = useState(null);
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
    const dispatch = useDispatch();

    const toggleIsOpen = () => {
        setIsOpen(prevState => !prevState);
    };

    const editAnnotation = id => {
        toggleIsOpen();
        setAnnotationId(id);

        const annotation = annotations.find(annotation => annotation.id === id);

        if (annotation?.content?.text) {
            setValue(annotation.content.text);
        }
    };

    const handleDone = id => {
        dispatch(
            updateAnnotationText({
                id: annotationId,
                text: value,
            }),
        );

        toggleIsOpen();
    };

    const editModal = <EditAnnotationTextModal isOpen={isOpen} toggle={toggleIsOpen} value={value} setValue={setValue} handleDone={handleDone} />;

    return { editModal, editAnnotation };
};

export default useEditAnnotation;
