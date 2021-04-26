import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faGithub, faGitlab, faFirefox } from '@fortawesome/free-brands-svg-icons';

function getCodeIconByURL(url) {
    let faIcon = faFirefox;
    if (url.includes('gitlab')) {
        faIcon = faGitlab;
    } else if (url.includes('github')) {
        faIcon = faGithub;
    }
    return faIcon;
}

const CodeURLsTooltip = ({ urls }) => {
    if (urls?.length === 1) {
        return (
            <a href={urls[0] ?? '-'} rel="noreferrer" target="_blank">
                <Icon icon={getCodeIconByURL(urls[0])} className="icon ml-2 mr-2" />
            </a>
        );
    }
    return (
        <Tippy
            interactive={true}
            content={
                <ul className={{ listStyle: 'none' }}>
                    {urls.map(url => (
                        <li>
                            <a href={url ?? '-'} rel="noreferrer" target="_blank" className="text-white">
                                <Icon icon={getCodeIconByURL(url)} className="icon ml-2 mr-2" /> {url}
                            </a>
                        </li>
                    ))}
                </ul>
            }
        >
            <span>
                <Icon icon={faGithub} className="icon ml-2 mr-2" />
            </span>
        </Tippy>
    );
};

CodeURLsTooltip.propTypes = {
    urls: PropTypes.array.isRequired
};
export default CodeURLsTooltip;
