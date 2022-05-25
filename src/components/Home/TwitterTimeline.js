import env from '@beam-australia/react-env';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Timeline } from 'react-twitter-widgets';
import { Button } from 'reactstrap';

const COOKIE_NAME = 'loadTwitterTimeline';

const TwitterTimeline = () => {
    const [cookies, setCookie] = useCookies([COOKIE_NAME]);
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadTimeline = () => setCookie(COOKIE_NAME, true, { path: env('PUBLIC_URL'), maxAge: 604800 });

    return !cookies[COOKIE_NAME] ? (
        <div className="mt-3 box rounded overflow-hidden p-3 d-flex align-items-center" style={{ background: '#1D9BF0' }}>
            <Button className="flex-shrink-0 px-2 border-0" style={{ background: '#67bded' }} onClick={handleLoadTimeline}>
                <Icon icon={faTwitter} className="text-white" /> Load timeline
            </Button>
            <small className="text-white ps-3" style={{ opacity: 0.7 }}>
                By loading the Twitter widget, you agree with their{' '}
                <a
                    href="https://help.twitter.com/en/rules-and-policies/twitter-cookies"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'inherit' }}
                    className="text-decoration-underline"
                >
                    cookie guidelines
                </a>
            </small>
        </div>
    ) : (
        <div className="mt-3 box rounded">
            {isLoading && <div className="text-center py-4">Loading...</div>}

            <Timeline
                dataSource={{
                    sourceType: 'profile',
                    screenName: 'orkg_org',
                }}
                options={{
                    height: '400',
                }}
                onLoad={() => setIsLoading(false)}
            />
        </div>
    );
};

export default TwitterTimeline;
