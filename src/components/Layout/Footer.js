import { Container, Row, Col, Badge } from 'reactstrap';
import ROUTES from 'constants/routes';
import ROUTES_CMS from 'constants/routesCms';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { ReactComponent as Logo } from 'assets/img/vertical_logo.svg';
import TIB_LOGO from 'assets/img/poweredby/TIB_Logo_EN.png';
import LUH_LOGO from 'assets/img/poweredby/LUH.png';
import L3S_LOGO from 'assets/img/poweredby/L3S.png';
import INFAI_LOGO from 'assets/img/poweredby/infAI.png';
import EU_LOGO from 'assets/img/poweredby/co-funded-h2020-horiz_en.png';
import EOSC_LOGO from 'assets/img/poweredby/EOSC.png';
import styled from 'styled-components';
import { reverse } from 'named-urls';

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
                        <hr className="mr-5" />
                        <Row>
                            <div className="float-left ml-3">
                                <Link to={ROUTES.HOME}>
                                    <Logo style={{ height: '80px' }} />
                                </Link>
                            </div>
                            <div className="col-md-8 description">
                                The Open Research Knowledge Graph aims to describe research papers in a structured manner
                            </div>
                        </Row>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h2 className="h5">About</h2>
                        <hr className="mr-5" />
                        <ul className="p-0" style={{ listStyle: 'none' }}>
                            <li>
                                <Link to={reverse(ROUTES.ABOUT, {})}>About us</Link>
                            </li>
                            <li>
                                <Link to={ROUTES.HELP_CENTER}>Help center</Link>
                            </li>
                            {/*<li>
                                <a href="https://projects.tib.eu/orkg/get-involved/" target="_blank" rel="noopener noreferrer">
                                    Get involved
                                </a>
                            </li>*/}
                            <li>
                                <Link to={reverse(ROUTES.PAGE, { url: ROUTES_CMS.DATA_PROTECTION })}>Data protection</Link>
                            </li>
                            <li>
                                <Link to={reverse(ROUTES.PAGE, { url: ROUTES_CMS.TERMS_OF_USE })}>Terms of use</Link>
                            </li>
                            <li>
                                <Link to={reverse(ROUTES.PAGE, { url: ROUTES_CMS.IMPRINT })}>Imprint</Link>
                            </li>
                        </ul>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h2 className="h5">Technical</h2>
                        <hr className="mr-5" />
                        <ul className="p-0" style={{ listStyle: 'none' }}>
                            <li>
                                <Link to={ROUTES.DATA}>Data Access</Link>
                            </li>
                            <li>
                                <Link to={ROUTES.CHANGELOG}>Changelog</Link>
                            </li>
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/" target="_blank" rel="noopener noreferrer">
                                    GitLab
                                </a>
                            </li>
                            <li>
                                <Link to={reverse(ROUTES.PAGE, { url: ROUTES_CMS.LICENSE })}>License</Link>
                            </li>
                        </ul>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h2 className="h5">More</h2>
                        <hr className="mr-5" />
                        <ul className="p-0" style={{ listStyle: 'none' }}>
                            <li>
                                <TwitterLink href="https://twitter.com/orkg_org" target="_blank" rel="noopener noreferrer">
                                    Follow us
                                    <Icon className="ml-2" icon={faTwitter} />
                                </TwitterLink>
                            </li>
                            <li>
                                <Link to={reverse(ROUTES.PAGE, { url: ROUTES_CMS.CONTACT })}>Contact us</Link>
                            </li>
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/issues" target="_blank" rel="noopener noreferrer">
                                    Report an issue
                                </a>
                            </li>
                            <li>
                                <i className="mr-3">Version</i> <Badge color="info">GIT_VERSION</Badge>
                            </li>
                        </ul>
                    </FooterCol>
                </Row>
                <hr style={{ width: '70%' }} />
                <Row className="mt-4">
                    <PartnerLogoCol md={4} style={{}}>
                        <a href="https://www.tib.eu/en/" target="_blank" rel="noopener noreferrer">
                            <img src={TIB_LOGO} alt="Logo Technische Informationsbibliothek (TIB)" style={{ borderWidth: 0, height: '50px' }} />
                        </a>
                    </PartnerLogoCol>
                    <Col md={8}>
                        <Row noGutters>
                            <Col md={4} style={{ textAlign: 'center' }}>
                                <a href="https://www.uni-hannover.de/en/" target="_blank" rel="noopener noreferrer">
                                    <img src={LUH_LOGO} alt="Logo Leibniz University Hannover" style={{ borderWidth: 0, height: '45px' }} />
                                </a>
                            </Col>
                            <Col md={4} style={{ textAlign: 'center' }}>
                                <a href="https://www.l3s.de/en/" target="_blank" rel="noopener noreferrer">
                                    <img src={L3S_LOGO} alt="Logo L3S Research Center" style={{ borderWidth: 0, height: '50px' }} />
                                </a>
                            </Col>
                            <Col md={4} style={{ textAlign: 'center' }}>
                                <a href="https://infai.org/en/" target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={INFAI_LOGO}
                                        alt="Logo  Institute for Applied Informatics (InfAI)"
                                        style={{ borderWidth: 0, height: '45px' }}
                                    />
                                </a>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <hr style={{ width: '50%' }} />
                <Row>
                    <PartnerLogoCol md={{ size: 3, order: 1, offset: 3 }} style={{ textAlign: 'center' }}>
                        <img
                            src={EU_LOGO}
                            alt="Co-funded by the Horizon 2020 programme of the European Union"
                            style={{ borderWidth: 0, height: '50px' }}
                        />
                    </PartnerLogoCol>
                    <PartnerLogoCol md={{ size: 3, order: 2, offset: 0 }} style={{ textAlign: 'center' }}>
                        <a
                            href="https://marketplace.eosc-portal.eu/services/open-research-knowledge-graph-orkg"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img src={EOSC_LOGO} alt="European Open Science Cloud (EOSC)" style={{ borderWidth: 0, height: '45px' }} />
                        </a>
                    </PartnerLogoCol>
                </Row>
            </footer>
        </Container>
    </FooterWrapper>
);

export default Footer;
