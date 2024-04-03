import Contributors from 'components/Contributors/Contributors';
import { useSelector } from 'react-redux';
import { Alert } from 'reactstrap';

const Acknowledgements = () => {
    const contributors = useSelector((state) => state.review.contributors);

    return (
        <>
            <Contributors contributors={contributors} />

            <Alert color="light-darker">
                This review article was created using{' '}
                <a href="https://doi.org/10.1145/3360901.3364435" target="_blank" rel="noopener noreferrer">
                    The Open Research Knowledge Graph
                </a>{' '}
                and the{' '}
                <a href="https://arxiv.org/abs/2111.15342" target="_blank" rel="noreferrer">
                    SmartReview methodology
                </a>
                .
            </Alert>
        </>
    );
};

export default Acknowledgements;
