import React, { Component } from 'react';
import { Container } from 'reactstrap';
import HomeBannerBg from 'assets/img/graph-background.svg';
import styled from 'styled-components';
import Typed from 'typed.js';
import Video from './Video';

const JumbotronStyled = styled.div`
    padding: 120px 0;
    margin-top: -30px;
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
    componentDidMount() {
        const motto = ['Structured.', 'FAIR.', 'Comparable.'];
        const options = {
            strings: motto,
            typeSpeed: 70,
            backSpeed: 50,
            backDelay: 1500,
            loop: true,
            loopCount: Infinity
        };
        // this.el refers to the <span> in the render() method
        this.typed = new Typed(this.el, options);
    }

    componentWillUnmount() {
        // Make sure to destroy Typed instance on unmounting
        // to prevent memory leaks
        this.typed.destroy();
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
                                    <span
                                        style={{ whiteSpace: 'pre' }}
                                        ref={el => {
                                            this.el = el;
                                        }}
                                    />
                                </div>
                            </div>
                        </HeaderStyled>
                        <div className="col-md-8 mx-auto mb-5 marketingtext">
                            <p className="mr-n2 ml-n2">
                                The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG,
                                papers are easier to find and compare.{' '}
                            </p>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div className="mt-4 mb-4 text-shadow-dark text-center">
                                <div className="flex-shrink-0 justify-content-center d-flex align-items-center">
                                    <Video />
                                </div>
                            </div>
                        </div>
                    </Container>
                </JumbotronStyled>
            </div>
        );
    }
}
