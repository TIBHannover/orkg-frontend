import React from 'react';
import { Container, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

export default function DataProtection() {
    document.title = 'Data protection - Open Research Knowledge Graph';

    return (
        <div>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">Data protection</h1>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <p className="mt-4">
                    You can read the Open Research Knowledge Graph Data protection by following the link below
                    <br />{' '}
                </p>
                <p className="mt-1">
                    <Button
                        color="secondary"
                        className="mr-3 pl-4 pr-4 flex-shrink-0"
                        tag="a"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://projects.tib.eu/orkg/data-protection/"
                    >
                        Data protection <Icon size="sm" icon={faExternalLinkAlt} />
                    </Button>
                </p>
                <h2 className="h3">Use of web analysis tools</h2>
                <p>
                    The ORKG uses the open source web analytics service Matomo (matomo.org) to analyse usage data in order to optimise this online
                    offer. Cookies are used to enable a statistical analysis of the use of this website by its visitors as well as the display of
                    usage-related content. There is no other use, merging with other data or disclosure to third parties.
                </p>
                <h3 className="h5">Matomo-Opt-Out </h3>
                <p>The information generated with Matomo about the use of this website is processed and stored exclusively with the TIB.</p>
                <iframe
                    title="Matomo opt-out"
                    style={{ border: 0, height: 150, width: '100%' }}
                    src="https://support.tib.eu/piwik/index.php?module=CoreAdminHome&amp;action=optOut&amp;language=en&amp;backgroundColor=ffffff&amp;fontColor=&amp;fontSize=14px&amp;fontFamily=%22Helvetica%20Neue%22%2CHelvetica%2CArial%2Csans-serif"
                />
                <p>
                    In this case, an opt-out cookie is placed in the browser of the data subject, which prevents Matomo from storing usage data. When
                    the cookies are deleted, the Matomo opt-out cookie is also deleted. Such objection (opt-out) must be redeclared when visiting the
                    ORKG website again
                </p>
            </Container>
        </div>
    );
}
