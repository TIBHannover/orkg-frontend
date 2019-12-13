import React, { Component } from 'react';
import { Container } from 'reactstrap';
import HomeBannerBg from 'assets/img/graph-background.svg';
import styled from 'styled-components';
import Typist from 'react-typist';

const JumbotronStyled = styled.div`
    padding: 100px 0;
    color: hsla(0, 0%, 100%, 0.6);
    background: ${props => props.theme.darkblueDarker} url(${HomeBannerBg});
    background-position-x: 0%, 0%;
    background-position-y: 0%, 0%;
    background-size: auto, auto;

    background-size: cover;
    position: relative;

    background-attachment: fixed;
    background-position: center 10%;
    background-repeat: no-repeat;

    .marketingtext {
        font-size: larger;
    }
`;

export default class Jumbotron extends Component {
    render() {
        return (
            <div>
                <JumbotronStyled className="pt-6 pb-6">
                    <Container className="position-relative text-center">
                        <h1 className="mb-3 text-white">Scholarly Knowledge. Structured</h1>
                        <div className="col-md-8 mx-auto mb-5 marketingtext">
                            <p className="mr-n2 ml-n2">The Open Research Knowledge Graph aims to describe research papers in a structured manner.</p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <p className="mt-4 mb-4 text-shadow-dark text-center">
                                <div className="flex-shrink-0 justify-content-center d-flex align-items-center">
                                    <a
                                        href="https://projects.tib.eu/orkg/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-darkblue btn-lg btn-block btn-default btn-sm"
                                        style={{ width: 150 }}
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </p>
                        </div>
                    </Container>
                </JumbotronStyled>
            </div>
        );
    }
}
