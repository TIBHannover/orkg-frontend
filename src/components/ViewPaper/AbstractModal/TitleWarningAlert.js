import { useSelector } from 'react-redux';
import { Alert } from 'reactstrap';

const TitleWarningAlert = () => {
    const fetchAbstractTitle = useSelector((state) => state.viewPaper.fetchAbstractTitle);

    return (
        fetchAbstractTitle && (
            <Alert color="warning">
                The displayed abstract below is automatically fetched based on the paper's title, and it may not come from the paper you are currently
                viewing. The abstract is extracted from the paper <strong>{fetchAbstractTitle}</strong>. Please ensure that the title matches the
                title of the paper you are viewing.
            </Alert>
        )
    );
};

export default TitleWarningAlert;
