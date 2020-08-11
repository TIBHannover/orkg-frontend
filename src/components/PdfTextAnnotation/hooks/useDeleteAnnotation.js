import { useDispatch } from 'react-redux';
import { deleteAnnotation as deleteAnnotationAction } from 'actions/pdfTextAnnotation';

const useDeleteAnnotation = () => {
    const dispatch = useDispatch();

    const deleteAnnotation = id => {
        if (window.confirm('Are you sure?')) {
            dispatch(deleteAnnotationAction(id));
        }
    };

    return { deleteAnnotation };
};

export default useDeleteAnnotation;
