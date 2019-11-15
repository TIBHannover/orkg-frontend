import React from 'react';
import { Container, Row, Col, Badge } from 'reactstrap';
import ROUTES from '../../constants/routes';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from './../../assets/img/vertical_logo.svg';
import styled from 'styled-components';

const FooterWrapper = styled.div`
    background: #e0e2ea;
    margin-top: 75px;
    border-top: 1px #d1d3d9 solid;
`;

const FooterCol = styled(Col)`
    color: ${props => props.theme.darkblueDarker};
    margin: 10px 0;

    h5 {
        font-weight: 500;
        text-transform: uppercase;
        color: ${props => props.theme.darkblueDarker};
    }
    .description {
        font-size: smaller;
    }
    a {
        color: ${props => props.theme.darkblueDarker};
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
                            <div className={'col-md-8 description'}>We aim to describe research papers and contributions in a structured manner</div>
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
                                <a href="https://twitter.com/orkg_org" target="_blank" rel="noopener noreferrer">
                                    Follow us
                                </a>
                            </li>
                        </ul>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h5>Technical</h5>
                        <hr className={'mr-5'} />
                        <ul className={'p-0'} style={{ listStyle: 'none' }}>
                            <li>
                                <Link to={ROUTES.CHANGELOG}>Changelog</Link>
                            </li>
                            <li>Contributors</li>
                            <li>
                                <a href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/" target="_blank" rel="noopener noreferrer">
                                    Gitlab
                                </a>
                            </li>
                        </ul>
                    </FooterCol>
                    <FooterCol md={3}>
                        <h5>More</h5>
                        <hr className={'mr-5'} />
                        <ul className={'p-0'} style={{ listStyle: 'none' }}>
                            <li>
                                <Link to={ROUTES.LICENSE}>License</Link>
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
            </footer>
        </Container>
    </FooterWrapper>
);

export default Footer;
