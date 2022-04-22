import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import AuthorHeader from 'components/Author/AuthorHeader';
import AuthorWorks from 'components/Author/AuthorWorks';
import { useParams } from 'react-router-dom-v5-compat';

const AuthorPage = () => {
    const { authorId } = useParams();

    return (
        <>
            <div>
                <AuthorHeader authorId={authorId} />
                <AuthorWorks authorId={authorId} />
                <ComparisonPopup />
            </div>
        </>
    );
};

export default AuthorPage;
