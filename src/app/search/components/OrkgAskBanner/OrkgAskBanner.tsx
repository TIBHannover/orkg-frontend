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
        <div className="rounded tw:p-3 tw:mb-4 tw:lg:flex tw:!bg-[#dcdee6] tw:text-sm">
            <div className="tw:lg:w-5/12">
                <a href="https://ask.orkg.org" target="_blank" rel="noreferrer" className="tw:!text-inherit tw:flex tw:items-center tw:text-sm">
                    <div>
                        <Image src={logo} width="150" alt="Logo of ORKG Ask" />
                    </div>
                    <div className="tw:ps-3">
                        <div className="tw:font-bold">Search in ORKG Ask</div>
                        Find research you are actually looking for
                    </div>
                </a>
            </div>

            {data && data?.questions?.length > 0 && (
                <div className="tw:lg:border-l tw:border-light tw:ps-5 tw:lg:w-7/12">
                    <div className="tw:font-bold">Related questions</div>
                    <ul className="tw:!p-0 tw:list-none tw:italic tw:!mb-0">
                        {data.questions.slice(0, 2).map((question: string) => (
                            <li key={question} className="tw:!mt-1">
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
