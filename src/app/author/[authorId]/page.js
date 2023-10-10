'use client';

import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import AuthorHeader from 'components/Author/AuthorHeader';
import AuthorWorks from 'components/Author/AuthorWorks';
import useParams from 'components/NextJsMigration/useParams';

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
