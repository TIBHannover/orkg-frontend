import Link from 'components/NextJsMigration/Link';
import { Container, Row, Col, Badge } from 'reactstrap';
import ROUTES from 'constants/routes';
import ROUTES_CMS from 'constants/routesCms';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import Logo from 'assets/img/vertical_logo.svg';
import TIB_LOGO from 'assets/img/poweredby/TIB_Logo_EN.png';
import LUH_LOGO from 'assets/img/poweredby/LUH.png';
import L3S_LOGO from 'assets/img/poweredby/L3S.png';
import INFAI_LOGO from 'assets/img/poweredby/infAI.png';
import EU_LOGO from 'assets/img/poweredby/co-funded-h2020-horiz_en.png';
import EOSC_LOGO from 'assets/img/poweredby/EOSC.png';
import styled from 'styled-components';
import { reverse } from 'named-urls';
import Tippy from '@tippyjs/react';
import Image from 'components/NextJsMigration/Image';

const FooterWrapper = styled.div`
    background: #e0e2ea;
    margin-top: 75px;
    border-top: 1px #d1d3d9 solid;
`;

const FooterCol = styled(Col)`
    color: ${props => props.theme.secondaryDarker};
    margin: 10px 0;
    font-size: 0.95rem;

    h5 {
        font-weight: 500;
        text-transform: uppercase;
        color: ${props => props.theme.secondaryDarker};
        font-size: 1.1rem;
    }
    .description {
        font-size: 0.85rem;
    }
    a {
        color: ${props => props.theme.secondaryDarker};
    }
`;

const PartnerLogoCol = styled(Col)`
    text-align: center;
`;

const TwitterLink = styled.a`
    :hover {
        color: #00acee;
    }
`;

const Footer = () => (
    <FooterWrapper>
        <Container>
            <footer className="pt-4 pb-4">
                <h1 className="sr-only">More information about ORKG</h1>
                <Row>
                    <FooterCol md={3}>
                        <h2 className="h5">ORKG</h2>
                        <hr className="me-5" />
                        <Row>
                            <div className="float-start col-md-3">
                                <Link href={ROUTES.HOME}>
                                    <Image src={Logo} height="80" alt="Small ORKG logo" />
                                </Link>
                            </div>
                            <div className="col-md-8 description">
                                The Open Research Knowledge Graph aims to describe research papers in a structured manner
                            </div>
                        </Row>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h2 className="h5">About</h2>
                        <hr className="me-5" />
                        <ul className="p-0" style={{ listStyle: 'none' }}>
                            <li>
                                <Link href={reverse(ROUTES.ABOUT_NO_SLUG_ID, {})}>About us</Link>
                            </li>
                            <li>
                                <Link href={ROUTES.HELP_CENTER}>Help center</Link>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.DATA_PROTECTION })}>Data protection</Link> (
                                <a href="/files/infosheet-data-protection.pdf" target="_blank" rel="noreferrer">
                                    Info sheet
                                </a>
                                )
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.TERMS_OF_USE })}>Terms of use</Link>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.IMPRINT })}>Imprint</Link>
                            </li>
                        </ul>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h2 className="h5">Technical</h2>
                        <hr className="me-5" />
                        <ul className="p-0" style={{ listStyle: 'none' }}>
                            <li>
                                <Link href={ROUTES.DATA}>Data Access</Link>
                            </li>
                            <li>
                                <Link href={ROUTES.CHANGELOG}>Changelog</Link>
                            </li>
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/" target="_blank" rel="noopener noreferrer">
                                    GitLab
                                </a>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.LICENSE })}>License</Link>
                            </li>
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/issues" target="_blank" rel="noopener noreferrer">
                                    Report issue
                                </a>
                            </li>
                        </ul>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h2 className="h5">More</h2>
                        <hr className="me-5" />
                        <ul className="p-0" style={{ listStyle: 'none' }}>
                            <li>
                                <TwitterLink href="https://twitter.com/orkg_org" target="_blank" rel="noopener noreferrer">
                                    Follow us
                                    <Icon className="ms-2" icon={faTwitter} />
                                </TwitterLink>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.CONTACT })}>Contact us</Link>
                            </li>
                            <li>
                                <Link href={reverse(ROUTES.PAGE, { url: ROUTES_CMS.ACCESSIBILITY_STATEMENT })}>Accessibility</Link>
                            </li>
                            <li>
                                <a href="https://forms.gle/NK8Jzti8qGdRooDJ8" target="_blank" rel="noopener noreferrer">
                                    Report abuse
                                </a>
                            </li>
                            <li>
                                <i className="me-3">Version</i>
                                <Tippy content="GIT_VERSION_LONG">
                                    <span>
                                        <Badge color="secondary">GIT_VERSION</Badge>
                                    </span>
                                </Tippy>
                            </li>
                        </ul>
                    </FooterCol>
                </Row>
                <hr style={{ width: '70%', margin: '1rem auto' }} />
                <Row className="mt-4">
                    <PartnerLogoCol md={4} style={{}}>
                        <a href="https://www.tib.eu/en/" target="_blank" rel="noopener noreferrer">
                            <Image src={TIB_LOGO} alt="Logo Technische Informationsbibliothek (TIB)" style={{ borderWidth: 0 }} height="50" />
                        </a>
                    </PartnerLogoCol>
                    <Col md={8}>
                        <Row className="g-0">
                            <Col md={4} style={{ textAlign: 'center' }}>
                                <a href="https://www.uni-hannover.de/en/" target="_blank" rel="noopener noreferrer">
                                    <Image src={LUH_LOGO} alt="Logo Leibniz University Hannover" style={{ borderWidth: 0 }} height="45" />
                                </a>
                            </Col>
                            <Col md={4} style={{ textAlign: 'center' }}>
                                <a href="https://www.l3s.de/en/" target="_blank" rel="noopener noreferrer">
                                    <Image src={L3S_LOGO} alt="Logo L3S Research Center" style={{ borderWidth: 0 }} height="50" />
                                </a>
                            </Col>
                            <Col md={4} style={{ textAlign: 'center' }}>
                                <a href="https://infai.org/en/" target="_blank" rel="noopener noreferrer">
                                    <Image
                                        src={INFAI_LOGO}
                                        alt="Logo  Institute for Applied Informatics (InfAI)"
                                        style={{ borderWidth: 0 }}
                                        height="45"
                                    />
                                </a>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <hr style={{ width: '50%', margin: '1rem auto' }} />
                <Row>
                    <PartnerLogoCol md={{ size: 3, order: 1, offset: 3 }} style={{ textAlign: 'center' }}>
                        <Image
                            src={EU_LOGO}
                            alt="Co-funded by the Horizon 2020 programme of the European Union"
                            style={{ borderWidth: 0 }}
                            height="50"
                        />
                    </PartnerLogoCol>
                    <PartnerLogoCol md={{ size: 3, order: 2, offset: 0 }} style={{ textAlign: 'center' }}>
                        <a
                            href="https://marketplace.eosc-portal.eu/services/open-research-knowledge-graph-orkg"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Image src={EOSC_LOGO} alt="European Open Science Cloud (EOSC)" style={{ borderWidth: 0 }} height="45" />
                        </a>
                    </PartnerLogoCol>
                </Row>
            </footer>
        </Container>
    </FooterWrapper>
);

export default Footer;
