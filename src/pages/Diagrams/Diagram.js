import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container } from 'reactstrap';
import styled from 'styled-components';

function Diagram(props) {
    const location = useLocation();
    const { id } = useParams();

    return (
        <Container className="p-2 box rounded" style={{ width: '100%', height: '500px' }}>
            Digram
        </Container>
    );
}

export default Diagram;
