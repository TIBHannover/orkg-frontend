import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../constants/routes.js';
import FlyerImage from '../../assets/img/flyer.png';
import { Cookies } from 'react-cookie';

class Tpdl extends Component {

    componentDidMount = () => {
        document.title = 'Open Research Knowledge Graph - TPDL experiment';
        const cookies = new Cookies();

        if (!cookies.get('tpdlExperiment')) {
            cookies.set('tpdlExperiment', true, { path: '/', maxAge: 604800 });
        }
    }

    render = () => {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">TPDL experiment</h1>
                </Container>

                <Container className="box pt-4 pb-4 pl-5 pr-5" style={{lineHeight:1.7}}>
                    <img
                        src={FlyerImage}
                        class="pl-3 float-right"
                        style={{ width: '35%' }}
                        alt="Advertising flyer of the experiment"
                    />

                    <p>Thank you for your interest in this Open Research Knowledge Graph (ORKG) experiment. The goal of the ORKG is to describe research papers and contributions as structured data. More specifically, in this experiment we ask you to add a paper to the ORKG. Every participant has the chance to win one of the three Amazon gift cards worth 50 euro!</p>

                    <h3 className="mt-4">What to do</h3>

                    <ol>
                        <li>Choose a paper you want to add to the ORKG (for example the paper you submitted during this conference)<br /><i>Estimated time: 1 minute</i></li>
                        <li>Follow the four-step wizard to add your paper (use the red "Add paper" button at the top, or <Link to={ROUTES.ADD_PAPER.GENERAL_DATA} target="_blank">click here to add your paper</Link>)<br /><i>Estimated time: 10 to 20 minutes</i></li>
                        <li>After adding your paper, fill out the <a href="https://forms.gle/mCQE4L6cN8DEjZpi8" target="_blank" rel="noopener noreferrer">online evaluation form</a><br /><i>Estimated time: 5 minutes</i></li>
                    </ol>

                    <h3 className="mt-4">Rules and terms</h3>
                    <p>In order to have chance to win one of the three Amazon gift cards each worth 50 euros, the following rules and terms apply:</p>
                    <ul>
                        <li>The paper must be added <strong>from the 9th of September until the 16th of September</strong> 2019</li>
                        <li>Out of all valid submissions, winners will be randomly chosen</li>
                        <li>The winners will receive an email before the 20th of September 2019</li>
                        <li>Both adding a paper and filling out the evaluation form are required to have a valid submission</li>
                        <li>Only participants who provided their email address in the evaluation form are eligible to win</li>
                        <li>Participants related to the ORKG project in any way are excluded and cannot win a gift card</li>
                        <li>For this experiment mouse tracking is enabled, you can disable this by visiting the home page</li>
                    </ul>

                    <div className="clearfix" />
                </Container>
            </div>
        );
    }
}

export default Tpdl;