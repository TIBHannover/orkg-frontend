import { ResourceRepresentation } from '@orkg/orkg-client';
import Link from 'next/link';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utilsTyped';

type ResearchFieldsBoxProps = {
    isLoading: boolean;
    researchFields: ResourceRepresentation[];
};

const ResearchFieldsBox: FC<ResearchFieldsBoxProps> = ({ isLoading, researchFields }) => (
    <div className="box rounded-lg p-4 grow flex flex-col">
        <h5>Research fields</h5>
        <div>
            <small className="text-gray-500">
                Research fields of <i>papers</i> that are addressing this problem
            </small>
        </div>
        {!isLoading ? (
            <div className="mb-6 mt-6 pl-4 pr-4">
                {researchFields.length > 0 ? (
                    <ul className="pl-1">
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
                    <div className="text-center mt-6 mb-6">No research fields</div>
                )}
            </div>
        ) : (
            <div className="text-center mt-6 mb-6">Loading research fields ...</div>
        )}
    </div>
);

export default ResearchFieldsBox;
