import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import AuthorWorks from 'components/Author/AuthorWorks';
import { useParams } from 'react-router-dom';
import { Alert, Container } from 'reactstrap';
import TitleBar from 'components/TitleBar/TitleBar';

const AuthorLiteral = () => {
    const { authorString } = useParams();

    return (
        <>
            <TitleBar titleAddition={<div className="text-muted">Author</div>}>{authorString}</TitleBar>
            <Container className="p-0">
                <Alert color="info" className="box">
                    Results include work from all authors matching this name. This means that the results may include work by other people with the
                    same name.
                </Alert>
            </Container>
            <AuthorWorks authorString={authorString} />
            <ComparisonPopup />
        </>
    );
};

export default AuthorLiteral;
