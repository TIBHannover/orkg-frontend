import React, { Component } from 'react';
import { Container } from 'reactstrap';
import HomeBannerBg from 'assets/img/graph-background.svg';
import styled from 'styled-components';

const JumbotronStyled = styled.div`
    padding: 100px 0;
    color: hsla(0, 0%, 100%, 0.6);
    background: rgb(95, 100, 116) url(${HomeBannerBg});
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

const HeaderStyled = styled.h1`
    text-shadow: 0px 3px #373c4aa6;
`;

export default class Jumbotron extends Component {
    render() {
        return (
            <div>
                <JumbotronStyled className="pt-6 pb-6">
                    <Container className="position-relative text-center">
                        <HeaderStyled className="mb-3 text-white">Scholarly Knowledge. Structured.</HeaderStyled>
                        <div className="col-md-8 mx-auto mb-5 marketingtext">
                            <p className="mr-n2 ml-n2">
                                The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG,
                                papers because findable and comparible.{' '}
                            </p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <p className="mt-4 mb-4 text-shadow-dark text-center">
                                <div className="flex-shrink-0 justify-content-center d-flex align-items-center">
                                    <a
                                        href="https://projects.tib.eu/orkg/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-darkblue btn-block btn-default"
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
