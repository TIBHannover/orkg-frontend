import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { FC, useState } from 'react';
import useSWR from 'swr';

import DBPEDIA_LOGO from '@/assets/img/sameas/dbpedia.png';
import { dbpediaSparqlUrl, getAbstractByURI } from '@/services/dbpedia';

type DbpediaAbstractProps = {
    externalResource: string;
};

const DbpediaAbstract: FC<DbpediaAbstractProps> = ({ externalResource }) => {
    const [collapsed, setCollapsed] = useState(true);
    const { data, error, isLoading } = useSWR([externalResource, dbpediaSparqlUrl, 'getAbstractByURI'], ([uri]) => getAbstractByURI(uri));

    const abstract = data ?? '';
    const shortAbstract = abstract.substring(0, 550);
    const showReadMore = abstract !== shortAbstract;

    return (
        <div>
            <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-xl mb-0">Abstract from DBpedia</h2>
                <a href={externalResource} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <Image alt="DBpedia logo" src={DBPEDIA_LOGO} style={{ height: 40, width: 'auto' }} />
                </a>
            </div>
            <div className="text-sm">
                {isLoading && (
                    <div className="text-center">
                        <FontAwesomeIcon icon={faSpinner} spin /> Loading abstract from DBpedia...
                    </div>
                )}
                {!isLoading && error && <div className="text-accent">Failed loading abstract from DBpedia.</div>}
                {!isLoading && !error && (
                    <>
                        {collapsed && abstract.length > 550 ? `${shortAbstract}...` : abstract || 'No abstract available'}
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

export default DbpediaAbstract;
