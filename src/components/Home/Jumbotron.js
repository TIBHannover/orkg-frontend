import React, { Component } from 'react';
import { Container } from 'reactstrap';
import HomeBannerBg from 'assets/img/graph-background.svg';
import styled from 'styled-components';
import Typist from 'react-typist';
import 'react-typist/dist/Typist.css';

const JumbotronStyled = styled.div`
    padding: 120px 0;
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

    .definition {
        text-align: right !important;
    }
    .motto {
        text-align: left !important;
    }

    @media (max-width: 768px) {
        .definition {
            text-align: center !important;
        }
        .motto {
            text-align: center !important;
        }
    }
`;

const HeaderStyled = styled.h1`
    text-shadow: 0px 3px #373c4aa6;
`;

export default class Jumbotron extends Component {
    constructor(props) {
        super(props);

        this.state = {
            motto: ['Structured.', 'Findable.', 'Comparable.'],
            currentMotto: 0
        };
    }

    render() {
        return (
            <div>
                <JumbotronStyled className="pt-6 pb-6">
                    <Container className="position-relative text-center">
                        <HeaderStyled className="mb-3 text-white">
                            <div className="row">
                                <div className="col-md-7 definition">Scholarly Knowledge.</div>
                                <div className="col-md-5 motto pl-0">
                                    <Typist
                                        key={this.state.currentMotto}
                                        onTypingDone={() => this.setState(state => ({ currentMotto: state.currentMotto + 1 }))}
                                    >
                                        {this.state.motto.map((word, i) => (
                                            <span key={word}>
                                                {word}
                                                <Typist.Backspace count={word.length} delay={(i + 1) * 1500} />
                                            </span>
                                        ))}
                                    </Typist>
                                </div>
                            </div>
                        </HeaderStyled>
                        <div className="col-md-8 mx-auto mb-5 marketingtext">
                            <p className="mr-n2 ml-n2">
                                The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG,
                                papers become findable and comparable.{' '}
                            </p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div className="mt-4 mb-4 text-shadow-dark text-center">
                                <div className="flex-shrink-0 justify-content-center d-flex align-items-center">
                                    <a
                                        href="https://projects.tib.eu/orkg/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-darkblue btn-block btn-default"
                                        style={{ width: 150, boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.13)' }}
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Container>
                </JumbotronStyled>
            </div>
        );
    }
}
