import React from 'react';
import { Container, Row, Col, Badge } from 'reactstrap';
import ROUTES from '../../constants/routes';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { ReactComponent as Logo } from './../../assets/img/vertical_logo.svg';
import TIB_LOGO from './../../assets/img/poweredby/TIB_Logo_EN.png';
import LUH_LOGO from './../../assets/img/poweredby/LUH.png';
import L3S_LOGO from './../../assets/img/poweredby/L3S.png';
import INFAI_LOGO from './../../assets/img/poweredby/infAI.png';
import styled from 'styled-components';

const FooterWrapper = styled.div`
    background: #e0e2ea;
    margin-top: 75px;
    border-top: 1px #d1d3d9 solid;
`;

const FooterCol = styled(Col)`
    color: ${props => props.theme.darkblueDarker};
    margin: 10px 0;
    font-size: 0.95rem;

    h5 {
        font-weight: 500;
        text-transform: uppercase;
        color: ${props => props.theme.darkblueDarker};
        font-size: 1.1rem;
    }
    .description {
        font-size: 0.85rem;
    }
    a {
        color: ${props => props.theme.darkblueDarker};
    }
`;

const PartnerLogoCol = styled(Col)`
    margin: 10px 0;
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
                <Row>
                    <FooterCol md={3}>
                        <h5>ORKG</h5>
                        <hr className={'mr-5'} />
                        <Row>
                            <div className={'float-left ml-3'}>
                                <Link to={ROUTES.HOME}>
                                    <Logo style={{ height: '80px' }} />
                                </Link>
                            </div>
                            <div className={'col-md-8 description'}>
                                The Open Research Knowledge Graph aims to describe research papers in a structured manner
                            </div>
                        </Row>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h5>About</h5>
                        <hr className={'mr-5'} />
                        <ul className={'p-0'} style={{ listStyle: 'none' }}>
                            <li>
                                <a href="https://projects.tib.eu/orkg/" target="_blank" rel="noopener noreferrer">
                                    About us
                                </a>
                            </li>
                            <li>
                                <a href="https://projects.tib.eu/orkg/get-involved/" target="_blank" rel="noopener noreferrer">
                                    Get involved
                                </a>
                            </li>
                            <li>
                                <a href="https://projects.tib.eu/orkg/data-protection/" target="_blank" rel="noopener noreferrer">
                                    Data protection
                                </a>
                            </li>
                            <li>
                                <a href="https://projects.tib.eu/orkg/imprint/" target="_blank" rel="noopener noreferrer">
                                    Imprint
                                </a>
                            </li>
                        </ul>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h5>Technical</h5>
                        <hr className={'mr-5'} />
                        <ul className={'p-0'} style={{ listStyle: 'none' }}>
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/issues" target="_blank" rel="noopener noreferrer">
                                    Report an issue
                                </a>
                            </li>
                            <li>
                                <Link to={ROUTES.CHANGELOG}>Changelog</Link>
                            </li>
                            {/*<li>Contributors</li>*/}
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/" target="_blank" rel="noopener noreferrer">
                                    Gitlab
                                </a>
                            </li>
                            <li>
                                <Link to={ROUTES.LICENSE}>License</Link>
                            </li>
                        </ul>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h5>More</h5>
                        <hr className={'mr-5'} />
                        <ul className={'p-0'} style={{ listStyle: 'none' }}>
                            <li>
                                <TwitterLink href="https://twitter.com/orkg_org" target="_blank" rel="noopener noreferrer">
                                    Follow us
                                    <Icon className={'ml-2'} icon={faTwitter} />
                                </TwitterLink>
                            </li>
                            <li>
                                <a href="https://projects.tib.eu/orkg/contact/" target="_blank" rel="noopener noreferrer">
                                    Contact us
                                </a>
                            </li>
                            <li>
                                <i className={'mr-3'}>Version</i> <Badge color="info">GIT_VERSION</Badge>
                            </li>
                        </ul>
                    </FooterCol>
                </Row>
                <hr style={{ width: '70%' }} />
                <Row className="mt-4">
                    <PartnerLogoCol md={3} style={{}}>
                        <a href="https://www.tib.eu/en/" target="_blank" rel="noopener noreferrer">
                            <img src={TIB_LOGO} alt="Logo Technische Informationsbibliothek (TIB)" style={{ borderWidth: 0, height: '50px' }} />
                        </a>
                    </PartnerLogoCol>
                    <PartnerLogoCol md={3} style={{ textAlign: 'center' }}>
                        <a href="https://www.uni-hannover.de/en/" target="_blank" rel="noopener noreferrer">
                            <img src={LUH_LOGO} alt="Logo Leibniz University Hannover" style={{ borderWidth: 0, height: '50px' }} />
                        </a>
                    </PartnerLogoCol>
                    <PartnerLogoCol md={3} style={{ textAlign: 'center' }}>
                        <a href="https://www.l3s.de/en/" target="_blank" rel="noopener noreferrer">
                            <img src={L3S_LOGO} alt="Logo L3S Research Center" style={{ borderWidth: 0, height: '55px' }} />
                        </a>
                    </PartnerLogoCol>
                    <PartnerLogoCol md={3} style={{ textAlign: 'center' }}>
                        <a href="https://infai.org/en/" target="_blank" rel="noopener noreferrer">
                            <img src={INFAI_LOGO} alt="Logo  Institute for Applied Informatics (InfAI)" style={{ borderWidth: 0, height: '50px' }} />
                        </a>
                    </PartnerLogoCol>
                </Row>
            </footer>
        </Container>
    </FooterWrapper>
);

export default Footer;
