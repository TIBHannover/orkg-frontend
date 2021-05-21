import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ListReferences = () => {
    const usedReferences = useSelector(state => state.smartReview.usedReferences);
    const [referencesSorted, setReferencesSorted] = useState([]);

    useEffect(() => {
        let references = {};

        usedReferences &&
            Object.keys(usedReferences).map(sectionId => {
                references = { ...references, ...usedReferences[sectionId] };
                return null;
            });

        references = Object.keys(references).map(key => references[key]);

        setReferencesSorted(
            references.sort((a, b) => a?.parsedReference?.author?.[0]?.family.localeCompare(b?.parsedReference?.author?.[0]?.family))
        );
    }, [usedReferences]);

    return (
        <>
            <ul>
                {referencesSorted.map(reference => (
                    <li key={reference.statementId}>
                        {reference?.parsedReference?.author.map(author => (
                            <span key={author.family + author.given}>
                                {author.family}, {author.given?.charAt(0)}.,
                            </span>
                        ))}{' '}
                        ({reference?.parsedReference?.issued?.['date-parts'][0]}) {reference?.parsedReference?.title}
                    </li>
                ))}
            </ul>
        </>
    );
};

export default ListReferences;
