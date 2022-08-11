import { Component } from 'react';
import { Container } from 'reactstrap';

import styled from 'styled-components';
import Typed from 'typed.js';
import Video from './Video';

const JumbotronStyled = styled.div`
    color: hsla(0, 0%, 100%, 0.6);

    .marketing-text {
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
            loopCount: Infinity,
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
                <JumbotronStyled className="pt-4 pb-5">
                    <Container className="position-relative text-center pb-2 pt-2">
                        <HeaderStyled className="text-white">
                            <div className="row">
                                <div className="col-md-7 definition">Scholarly Knowledge.</div>
                                <div className="col-md-5 motto ps-0">
                                    <span
                                        style={{ whiteSpace: 'pre' }}
                                        ref={el => {
                                            this.el = el;
                                        }}
                                    />
                                </div>
                            </div>
                        </HeaderStyled>
                        <div className="col-md-9 mx-auto mb-3 marketing-text">
                            <p className="me-n2 ms-n2">
                                The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG,
                                papers are easier to find and compare. <Video />{' '}
                            </p>
                        </div>
                    </Container>
                </JumbotronStyled>
            </div>
        );
    }
}
