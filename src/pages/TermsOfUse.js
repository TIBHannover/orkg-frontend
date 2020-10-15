import React from 'react';
import { Container } from 'reactstrap';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';

export default function DataProtection() {
    document.title = 'Terms of use - Open Research Knowledge Graph';

    return (
        <div>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">Terms of use </h1>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <h2>Terms of Use Open Research Knowledge Graph</h2>
                <p>
                    <strong>Status: September 2020</strong>
                </p>
                <p>
                    <a href="https://www.tib.eu/en/service/terms-of-use" target="_blank" rel="noopener noreferrer">
                        Terms of Use of the TIB
                    </a>{' '}
                    apply, supplemented by the following Special Conditions Open Research Knowledge Graph (ORKG).
                </p>
                <h2>Special Conditions ORKG</h2>
                <p>The ORKG services is provided by:</p>
                <p>
                    <strong>Technische Informationsbibliothek (TIB)</strong> <br />
                    <strong>German National Library of Science and Technology</strong>
                    <br />
                    Welfengarten 1 B, 30167 Hannover, Germany
                    <br />
                    Postfach 6080, 30060 Hannover, Germany
                    <br />
                </p>
                <p>
                    Authorised Representative:
                    <br />
                    Prof. Dr. Sören Auer (Director of TIB)
                </p>
                <p>
                    Responsible Supervisory Authority:
                    <br />
                    Ministry for Science and Culture of Lower Saxony
                </p>
                <p>
                    Tel.no Customer Service: +49 511 762 - 8989
                    <br />
                    Fax: +49 511 762 - 8998
                    <br />
                    E-mail: <a href="mailto:customerservice@tib.eu">customerservice@tib.eu</a>
                    <br />
                </p>
                <p>
                    VAT (sales tax) registration numbers: <br />
                    DE 214931803
                </p>
                <h3>1. Scope of Application</h3>
                <p>
                    1.1 These Special Conditions ORKG regulate the use of the ORKG as well as the rights and obligations of Registered Users and the
                    TIB in addition to the Terms of Use of TIB.
                </p>
                <p>
                    1.2 ORKG is primarily aimed at scholars who want to share, explore and reuse scholarly knowledge in a novel manner. ORKG data and
                    software are freely accessible to everyone.
                </p>
                <h3> 2. Registration</h3>
                <p>2.1 ORKG can be searched and its content can be explored and reused without registration.</p>
                <p>
                    2.2 Some services, such as user profiles, linking profiles to ORCID, DOI-based publication of content require a registration
                    (Registered Users).
                </p>
                <p>
                    2.3 There is no entitlement to registration, account or profile. The TIB is entitled to reject registrations or terminate accounts
                    if a violation of these Special Conditions ORKG exists or is expected.
                </p>
                <p>
                    2.4 When registering, users must agree to the Special Conditions ORKG and the Data Protection Declaration. If these Special
                    Conditions ORKG are updated, Registered Users will be notified of the changes two weeks in advance by email. By subsequently
                    continuing to use ORKG, Registered Users agree to the changes.
                </p>
                <p>2.5 A usage relationship is established between the TIB and the Registered User through registration.</p>
                <p>
                    2.6 When registering, users are obliged to fill in mandatory fields truthfully and completely, to keep their data up-to-date and
                    secret and to protect data from access by third parties.
                </p>
                <p>
                    2.7 Accounts may be terminated for cause by TIB. A cause can be a breach of the Terms of Use or these Special Conditions or a
                    legal obligation or official order for TIB to block the access or any other conduct, which raises the suspicion that the user
                    violates or will violate the Terms of Use, these Special Conditions or other legal obligations also in the future.
                </p>
                <p>
                    2.8 TIB will terminate accounts at the request of the user in textform at any time and without undue delay. All personal data in
                    the user profile will be deleted without undue delay. Content created by users remains published as long as the TIB does not
                    delete this content or the user does not request its deletion, whereupon the TIB complies with the request.
                </p>
                <h3>3. ORKG</h3>
                <p>3.1 Anyone can view and use ORKG content. Registered Users can create and modify content.</p>
                <p>
                    3.2 The source code is made available under the <Link to={ROUTES.LICENSE}>MIT License</Link>.
                </p>
                <p>
                    3.3 Registered Users confirm that published content does not infringe any third party rights (e.g. copyright, rights of
                    performers, personality and publicity rights, data protection). If others are involved in the production, Registered Users confirm
                    that all participants are aware of the content of this agreement and have given their consent.
                </p>
                <p>
                    3.4 Registered Users ensure that the published content does not violate applicable law or offend common decency, in particular
                    does not constitute a criminal offense and does not constitute an administrative offense (e.g. infringement of copyright,
                    trademark law, competition law) or none have offensive, discriminatory, racist, pornographic or extremist content. In the event of
                    a violation, Section 5 applies.
                </p>
                <p>
                    3.5 If a user becomes aware of a violation of the law within the meaning of 3.3 or 3.4 he / she is obliged to inform the TIB
                    immediately.
                </p>
                <p>
                    3.6 Registered Users will indemnify the TIB from all claims of other users or third parties that they assert against the TIB due
                    to infringement of their rights through content published by the respective Registered User, if the respective user can be held
                    responsible. The respective Registered User assumes the costs of an appropriate legal defense of the TIB. This does not apply if
                    the Registered User is not responsible for the infringement. Users are obliged to provide all information necessary for the
                    examination of the claims and a defense in the event of a claim against the TIB truthfully and completely without further delay.
                </p>
                <h3> 4. Functionality of the ORKG</h3>
                <p>
                    4.1 Anyone can use the ORKG service to view and use content without registration. ORKG content can be reused freely for any
                    purpose users see fit, in accordance with the CC BY-SA License (5.2 of these Special Conditions ORKG).
                </p>
                <p>
                    4.2 ORKG provides functionality that requires registration. Creating and editing, including deleting, existing content is reserved
                    to Registered Users. Content is created and edited in accordance with the CC0 License (5.1 of these Special Conditions ORKG).
                    Registered Users obtain ORKG user profiles, can link their profile to ORCID, are included in provenance information, can be
                    members of ORKG Observatories and can publish ORKG Comparisons with a DOI.
                </p>
                <p>
                    4.3 ORKG provides programmatic access to the content (API). Anyone can use the ORKG API to access existing content. Creating and
                    editing, including deleting, existing content via the ORKG API is reserved to Registered Users.
                </p>
                <p>
                    4.4 ORKG enables DOI-based publication of ORKG content, in particular ORKG Comparisons. In doing so, metadata including creator
                    names and, if known, ORCID IDs are shared with DataCite. If a Registered User publishes ORKG content in this form, she or he
                    agrees to the sharing of metadata with DataCite. The sharing of such data is based on user consent given as part of the service of
                    DataCite e. V. and ORCID. Registered Users need to connect their ORKG profile with ORCID and need to explicitly activate DOI-based
                    publication of ORKG comparisons.
                </p>
                <p>
                    4.5 TIB manually curates ORKG content, including metadata. In such activities, TIB also resolves personal identifiers of creators
                    in order to reduce the ambiguity of personal names.
                </p>
                <p>5. Rights and obligations of the TIB</p>
                <p>
                    5.1 ORKG content created by Registered Users is licensed to TIB under the licence CC0 1.0 Universal (
                    <a href="https://creativecommons.org/publicdomain/zero/1.0/deed.en" target="_blank" rel="noopener noreferrer">
                        CC0 1.0 Public Domain Dedication
                    </a>
                    ) .
                </p>
                <p>
                    5.2 ORKG content is published by TIB under{' '}
                    <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
                        Creative Commons Attribution-ShareAlike 4.0 International License
                    </a>
                    .
                </p>
                <p>
                    5.3 The TIBassumes no liability that the service and its content are always uninterrupted, unchanged and available in full, as
                    well as being up-to-date and free from errors of an editorial or technical nature. No liability is accepted for damage caused by
                    trusting the content of the platform or its use.
                </p>
                <p>
                    5.3 The TIB reserves the right to change the functionality, the appearance and these Special Conditions ORKG at any time.
                    Registered Users will be informed of the changes two weeks in advance by email. By continuing to use the platform after the
                    deadline, users agree to the changes.
                </p>
                <p>
                    5.4 The TIB is entitled to terminate its service at any time. In this case, the TIB reserves the right to delete the content.
                    However, this does not result in an obligation to delete the content.
                </p>
                <p>
                    5.5 In principle, the TIB is only liable for damage caused by intent or gross negligence. In case of injuries to life, body or
                    health statutory provisions apply.
                </p>
                <p>5.6 Liability for damage from unauthorized use of password-protected logins by third parties is not accepted.</p>
                <p>
                    5.7 Insofar as liability is limited or excluded, this also applies in favor of executive employees (m / f), representatives (m /
                    f) and vicarious agents (m / f) of the TIB.
                </p>
                <p>
                    5.8 If there are concrete indications of a violation of these Special Conditions ORKG, the TIB is entitled to delete content,
                    restrict the use of the services or block the Registered User concerned. When choosing a measure, the legitimate interests of the
                    Registered User are taken into account, in particular whether there are indications that the Registered User was not responsible
                    for the violation.
                </p>
                <p>5.9 Content that contains a legal violation according to 3.3 or 3.4 may be blocked or deleted by the TIB.</p>
                <h3>6. Miscellaneous</h3>
                <p>6.1 The usage relationship and these Special Conditions ORKG are subject to German law.</p>
                <p>6.2 The place of jurisdiction is Hannover.</p>
                <p>6.3 In the event of a dispute, the TIB endeavors to reach an amicable settlement.</p>
            </Container>
        </div>
    );
}
