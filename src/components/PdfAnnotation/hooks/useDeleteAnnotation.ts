import { useDispatch } from 'react-redux';

import Confirm from '@/components/Confirmation/Confirmation';
import { deleteAnnotation as deleteAnnotationAction } from '@/slices/pdfAnnotationSlice';

const useDeleteAnnotation = () => {
    const dispatch = useDispatch();

    const deleteAnnotation = async (id: string) => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this annotation?',
        });
        if (result) {
            dispatch(deleteAnnotationAction(id));
        }
    };

    return { deleteAnnotation };
};

export default useDeleteAnnotation;
