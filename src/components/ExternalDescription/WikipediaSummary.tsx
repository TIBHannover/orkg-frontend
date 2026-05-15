import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { FC, useState } from 'react';
import useSWR from 'swr';

import WIKIPEDIA_LOGO from '@/assets/img/sameas/wikipedia.png';

type WikipediaSummaryProps = {
    externalResource: string;
};

type WikipediaSummaryResponse = {
    extract?: string;
};

const fetchWikipediaSummary = async (resource: string): Promise<string> => {
    const wikipediaTitle = resource.substring(resource.indexOf('/wiki/')).replace('/wiki/', '');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle}?origin=*`;
    const response = await fetch(url);
    const data = (await response.json()) as WikipediaSummaryResponse;
    if (!data.extract) {
        throw new Error('No extract returned from Wikipedia');
    }
    return data.extract;
};

const WikipediaSummary: FC<WikipediaSummaryProps> = ({ externalResource }) => {
    const [collapsed, setCollapsed] = useState(true);
    const { data, error, isLoading } = useSWR([externalResource, 'wikipediaSummary'], ([resource]) => fetchWikipediaSummary(resource));

    const summary = data ?? '';
    const shortSummary = summary.substring(0, 550);
    const showReadMore = summary !== shortSummary;

    return (
        <div>
            <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-xl mb-0">Summary from Wikipedia</h2>
                <a href={externalResource} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Image alt="Wikipedia logo" src={WIKIPEDIA_LOGO} style={{ height: 40, width: 'auto' }} />
                </a>
            </div>
            <div className="text-sm">
                {isLoading && (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faSpinner} spin /> Loading summary from Wikipedia...
                    </div>
                )}
                {!isLoading && error && <div className="text-accent">Failed loading summary from Wikipedia.</div>}
                {!isLoading && !error && (
                    <>
                        {collapsed && summary.length > 550 ? `${shortSummary}...` : summary}
                        {showReadMore && (
                            <button
                                type="button"
                                className="p-0 ml-1 bg-transparent border-0 text-accent hover:underline"
                                onClick={() => setCollapsed((v) => !v)}
                            >
                                {collapsed ? 'Read more' : 'Read less'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default WikipediaSummary;
