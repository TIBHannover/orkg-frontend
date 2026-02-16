import { ResourceRepresentation } from '@orkg/orkg-client';
import Link from 'next/link';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utils';

type ResearchFieldsBoxProps = {
    isLoading: boolean;
    researchFields: ResourceRepresentation[];
};

const ResearchFieldsBox: FC<ResearchFieldsBoxProps> = ({ isLoading, researchFields }) => (
    <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
        <h5>Research fields</h5>
        <div>
            <small className="text-muted">
                Research fields of <i>papers</i> that are addressing this problem
            </small>
        </div>
        {!isLoading ? (
            <div className="mb-4 mt-4 ps-3 pe-3">
                {researchFields.length > 0 ? (
                    <ul className="ps-1">
                        {researchFields.map((researchField) => (
                            <li key={`rf${researchField.id}`}>
                                <Link
                                    href={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                        researchFieldId: researchField.id,
                                        slug: researchField.label,
                                    })}
                                >
                                    {researchField.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center mt-4 mb-4">No research fields</div>
                )}
            </div>
        ) : (
            <div className="text-center mt-4 mb-4">Loading research fields ...</div>
        )}
    </div>
);

export default ResearchFieldsBox;
