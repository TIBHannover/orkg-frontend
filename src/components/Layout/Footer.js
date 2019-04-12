import React from 'react';
import { Container } from 'reactstrap';
import ROUTES from '../../constants/routes';
import { Link } from "react-router-dom";

const Footer = () => (
    <Container>
        <footer className="text-center mt-5 mb-4">
            Open Research Knowledge Graph 
            {' '}-{' '} 
            <Link to={ROUTES.LICENSE} className="text-dark"><u>License</u></Link>
            {' '}-{' '} 
            <a href="https://projects.tib.eu/orkg/" target="_blank" rel="noopener noreferrer" className="text-dark"><u>About</u></a>
        </footer>
    </Container>
);

export default Footer;