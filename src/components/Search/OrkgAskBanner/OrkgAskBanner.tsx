import Image from 'next/image';
import logo from 'components/Search/OrkgAskBanner/logo.png';
import useSWR from 'swr';
import { getLlmResponse, nlpServiceUrl } from 'services/orkgNlp';
import { FC } from 'react';
import { useSearchParams } from 'next/navigation';

type OrkgAskBannerProps = {
    searchQuery?: string;
};

const OrkgAskBanner: FC<OrkgAskBannerProps> = () => {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const { data } = useSWR(
        searchQuery
            ? [
                  {
                      taskName: 'generateResearchQuestions',
                      placeholders: { keywords: searchQuery },
                  },
                  nlpServiceUrl,
                  'getLlmResponse',
              ]
            : null,
        ([params]) => getLlmResponse(params),
    );

    return (
        <div className="bg-light rounded p-3 text-body" style={{ fontSize: '95%' }}>
            <a
                href="https://ask.orkg.org"
                target="_blank"
                rel="noreferrer"
                className="text-body d-flex align-items-center"
                style={{ fontSize: '95%' }}
            >
                <div>
                    <Image src={logo} width="150" alt="Logo of ORKG Ask" />
                </div>
                <div className="ps-3">
                    <div className="fw-bold">Search in ORKG Ask</div>
                    Find research you are actually looking for
                </div>
            </a>

            {data && data?.questions?.length > 0 && (
                <>
                    <hr />
                    <strong>Related questions</strong>
                    <ul className="p-0 list-unstyled fst-italic">
                        {data.questions.slice(0, 2).map((question: string) => (
                            <li key={question} className="mt-1">
                                <a
                                    href={`https://ask.orkg.org/search?query=${encodeURIComponent(question)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-body d-flex align-items-center"
                                >
                                    {question}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default OrkgAskBanner;
