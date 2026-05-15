import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { FC } from 'react';
import useSWR from 'swr';

import logo from '@/app/search/components/OrkgAskBanner/logo.png';
import { getLlmResponse, nlpServiceUrl } from '@/services/orkgNlp';

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
        <div className="rounded p-3 mb-4 lg:flex bg-default text-foreground text-sm">
            <div className="lg:w-5/12">
                <a href="https://ask.orkg.org" target="_blank" rel="noreferrer" className="text-inherit flex items-center text-sm">
                    <div>
                        <Image src={logo} width="150" alt="Logo of ORKG Ask" />
                    </div>
                    <div className="ps-3">
                        <div className="font-bold">Search in ORKG Ask</div>
                        Find research you are actually looking for
                    </div>
                </a>
            </div>
            {data && data?.questions?.length > 0 && (
                <div className="lg:border-l border-default ps-5 lg:w-7/12">
                    <div className="font-bold">Related questions</div>
                    <ul className="p-0 list-none italic mb-0">
                        {data.questions.slice(0, 2).map((question: string) => (
                            <li key={question} className="mt-1">
                                <a href={`https://ask.orkg.org/search?query=${encodeURIComponent(question)}`} target="_blank" rel="noreferrer">
                                    {question}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default OrkgAskBanner;
