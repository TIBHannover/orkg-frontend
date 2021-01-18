import { Container } from 'reactstrap';
import InfoSheet from 'assets/pdf/infosheet-data-protection.pdf';

export default function DataProtection() {
    document.title = 'Data protection - Open Research Knowledge Graph';

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">Data protection</h1>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <h2>Privacy statement</h2>
                <p>
                    Data protection is of high priority for the Technische Informationsbibliothek (TIB). Using the Open Research Knowledge Graph does
                    not require the provision of any personal data. However, the processing of personal data may be required where a data subject
                    wants to use special service features, e.g. ORKG user profiles. Where the processing of personal data is required and where there
                    is no legal basis for such processing, we shall obtain the data subject’s consent.
                </p>
                <p>
                    The processing of personal data, such as for example the data subject’s name, email address, or ORCID shall always be carried out
                    in accordance with the General Data Protection Regulation (GDPR) and the state and institution-specific data protection rules and
                    regulations applicable to the TIB. This privacy statement serves to inform the public about the nature, scope and purpose of the
                    personal data the Open Research Knowledge Graph collects, uses and processes, as well as of the rights data subjects are entitled
                    to.
                </p>
                <p>
                    The terms used in this privacy statement are to be understood within the meaning of the European General Data{' '}
                    <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32016R0679" target="_blank" rel="noopener noreferrer">
                        Protection Regulation (GDPR)
                    </a>
                    .
                </p>
                <h3>Name and address of the controller</h3>
                <p>The controller under data protection law shall be:</p>
                <p>
                    Technische Informationsbibliothek (TIB)
                    <br />
                    Welfengarten 1 B<br />
                    30167 Hannover
                    <br />
                    Germany
                </p>
                <p>
                    Phone: +49 511 762-8989
                    <br />
                    Email: <a href="mailto:information@tib.eu">information@tib.eu</a>
                    <br />
                    Website:{' '}
                    <a href="https://www.tib.eu" target="_blank" rel="noopener noreferrer">
                        www.tib.eu
                    </a>
                </p>
                <h3>Name and address of the data protection officer</h3>
                <p>The data protection officer of the controller shall be:</p>
                <p>
                    Elke Brehm
                    <br />
                    Phone: +49 511 762-8138
                    <br />
                    Email: <a href="mailto:information@tib.eu">datenschutz@tib.eu</a>
                    <br />
                </p>
                <p>
                    <strong>Postal address:</strong>
                </p>
                <p>
                    Technische Informationsbibliothek (TIB)
                    <br />
                    data protection officer
                    <br />
                    Welfengarten 1 B<br />
                    30167 Hannover
                    <br />
                    Germany
                </p>
                <p>
                    <strong>Visiting Address:</strong>
                </p>
                <p>
                    TIB Conti-Campus
                    <br />
                    Königsworther Platz 1 B<br />
                    30167 Hannover
                </p>
                <p>
                    Any data subject may contact our data protection officer directly regarding any and all questions and suggestions regarding data
                    protection at any time.
                </p>
                <h3>Registration</h3>
                <p>
                    Users may register on ORKG. When registering, ORKG collects personal data in order to be able to provide personalized and
                    generally improved services to users. Services that require user authentication cannot be used without providing the required
                    data.
                </p>
                <p>
                    The legal basis for the collection of such data shall be the{' '}
                    <a href="https://www.tib.eu/en/service/terms-of-use" target="_blank" rel="noopener noreferrer">
                        Terms of use of the TIB
                    </a>
                    , the{' '}
                    <a href={InfoSheet} target="_blank" rel="noopener noreferrer">
                        Special Conditions
                    </a>{' '}
                    applicable to the ORKG service, or the consent given by the user. For further information, please refer to the information sheet
                    on data protection provided for the ORKG offered by the TIB.
                </p>
                <h3>Cookies</h3>
                <p>
                    The ORKG service uses cookies. Cookies are text files that are placed and stored on a computer system via an Internet browser and
                    serve to render the offer of the ORKG more user-friendly, effective and secure.
                </p>
                <p>
                    Most of the cookies used are so-called “session cookies”, which are automatically deleted at the end of the visit. Other cookies
                    remain stored on the user’s terminal device until he or she deletes them. These cookies enable the ORKG to recognise the user’s
                    browser on his or her next visit.
                </p>
                <p>
                    Users can prevent and permanently object to the setting of cookies by the ORKG service at any time by choosing the corresponding
                    settings of the Internet browser used. Furthermore, cookies already set can be deleted at any time with the Internet browser or by
                    other software programs. This is possible in all common Internet browsers. If the data subject deactivates the setting of cookies
                    in the Internet browser used, the ORKG service may not function properly.
                </p>
                <h3>Use of web analysis tools</h3>
                <p>
                    ORKG uses the open source web analytics software Matomo (matomo.org) to analyse usage data in order to optimise its online offer.
                    TIB self-hosts Matomo and no data is shared with third parties. Cookies are used to enable a statistical analysis of the use of
                    this website by its visitors as well as the display of usage-related content. There is no other use, merging with other data or
                    disclosure to third parties.
                </p>
                <strong>Matomo-Opt-Out</strong>
                <p>The information generated with Matomo about the use of this website is processed and stored exclusively with the ORKG.</p>

                <iframe
                    title="Matomo opt-out"
                    style={{ border: 0, height: 130, width: '100%' }}
                    src="https://support.tib.eu/piwik/index.php?module=CoreAdminHome&amp;action=optOut&amp;language=en&amp;backgroundColor=ffffff&amp;fontColor=&amp;fontSize=14px&amp;fontFamily=%22Helvetica%20Neue%22%2CHelvetica%2CArial%2Csans-serif"
                />
                <p>
                    In this case, an opt-out cookie is placed in the browser of the data subject, which prevents Matomo from storing usage data. When
                    the cookies are deleted, the Matomo opt-out cookie is also deleted. Such objection (opt-out) must be redeclared when visiting the
                    ORKG again.
                </p>
                <h3>Collection of general data and information (logfiles)</h3>
                <p>
                    Whenever a data subject calls the ORKG service, the service automatically collects information in so-called server log files,
                    which your browser automatically transmits to the service. This is:
                </p>
                <ul>
                    <li>Browser type and browser version</li>
                    <li>Operating system used</li>
                    <li>Referrer URL</li>
                    <li>Hostname of the accessing computer</li>
                    <li>IP address</li>
                    <li>Internet service provider of the accessing system</li>
                    <li>Time of the server request</li>
                </ul>
                <p>
                    As a general rule, this data is not attributable to a particular person. This data will not be merged with other data sources and
                    will be deleted after they have fulfilled the purpose of securing technical functioning of the service.
                </p>
                <h3>Chatwoot</h3>
                <p>
                    To enable easy and direct communication with the service support team, ORKG integrates Chatwoot (chatwoot.com). To use Chatwoot
                    data subjects are not required to provide personal data. Chatwoot uses cookies to identify users, which is required to provide the
                    chat functionality. They do not sell or transfer your Personally Identifiable Information to third-parties or use it for other
                    purposes. For more information, see the{' '}
                    <a href="https://www.chatwoot.com/privacy-policy/" target="_blank" rel="noopener noreferrer">
                        Chatwoot Privacy Policy
                    </a>
                    .
                </p>
                <h3>Data sharing</h3>
                <p>
                    Some ORKG services share (personal) data with third parties. Currently, this is the case with DataCite e.V. upon DOI-based
                    publishing of ORKG comparisons. In order to mint a DataCite DOI, ORKG shares metadata about the comparison with DataCite. Such
                    metadata include comparison creator names and ORCID, if applicable. The sharing of such data is based on user consent given as
                    part of the service of DataCite e. V. and ORCID. Users need to connect their ORKG profile with ORCID and need to explicitly
                    activate DOI-based publication of ORKG comparisons.
                </p>
                <h3>Routine deletion and blocking of personal data</h3>
                <p>
                    The TIB processes and stores the data subject’s personal data only for the period necessary to achieve the purpose of such storage
                    and in accordance with the General Data Protection Regulation and the country and institution-specific data protection regulations
                    applicable to the TIB. Thereafter, the personal data will routinely be blocked or deleted in accordance with the statutory
                    provisions. If the user no longer wishes to use the services of the TIB and in the absence of any claims of the TIB against the
                    user and of any other legal basis for storage, we shall delete the personal data upon request.{' '}
                </p>
                <h3>Rights of the data subject</h3>
                <p>
                    You shall at any time be entitled to obtain information about the data stored in this library, its origin and recipient and about
                    the purpose of such data processing, as well as to rectification or erasure or restriction of processing or – to the extent that
                    such processing is based on your consent – a right of withdrawal, possibly a right of objection and the right to data portability.
                    Complaints may be lodged with the above-mentioned supervisory authority. You can contact us at any time for further questions on
                    the subject of personal data.
                </p>
            </Container>
        </div>
    );
}
