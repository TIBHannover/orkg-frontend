import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';

export default function WebinarMay11() {
    document.title = 'Webinar: Open Research Knowledge Graph';

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">Webinar</h1>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <h2>Webinar: Open Research Knowledge Graph</h2>
                <strong>Online 11th May 2021, 14:00 - 15:00 (CEST)</strong>
                <p className="mt-4">
                    Scholarly work is mainly communicated through publications, in the form of unstructured texts. Considering the continuously
                    increasing number of publications, researchers are finding it increasingly difficult to stay current with the literature that is
                    relevant to them. The <Link to={ROUTES.HOME}>Open Research Knowledge Graph</Link> (ORKG, see also{' '}
                    <a href="https://projects.tib.eu/orkg/" target="_blank" rel="noreferrer">
                        project page
                    </a>
                    ) aims to address this problem by describing scholarly work in a structured manner, making the actual contents and not only the
                    bibliographic metadata of the papers human-readable as well as machine-actionable and FAIR (i.e., findable, accessible,
                    interoperable, and reusable).{' '}
                </p>
                <p>
                    In this Webinar, we introduce the Open Research Knowledge Graph and explain how you can add content. Besides a brief introduction
                    to the main ideas and goals, we show how to use the interface to enter your data.{' '}
                </p>
                <p>
                    <strong>Join from meeting link</strong>
                    <br />
                    You can join the webinar from the meeting link: <br />
                    <a href="https://tib-eu.webex.com/tib-eu-en/j.php?MTID=mccdeb0f1dcedef694953c018367f4ea0" target="_blank" rel="noreferrer">
                        https://tib-eu.webex.com/tib-eu-en/j.php?MTID=mccdeb0f1dcedef694953c018367f4ea0
                    </a>
                </p>
                <p>
                    <strong>Or join by meeting number</strong>
                    <br />
                    Meeting number: 137 009 4886
                    <br />
                    Password: 9J728JcaC6i
                </p>
                <h2 className="mt-5">Agenda</h2>
                <table className="table">
                    <tbody>
                        <tr>
                            <th scope="row">14:00</th>
                            <td>
                                Welcome and general introduction to the Open Research Knowledge Graph by <em>Sören Auer</em>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">14:15</th>
                            <td>
                                How-to lessons: <br />
                                <ul>
                                    <li>
                                        How to create paper entries and surveys (i.e., comparisons) in the Open Research Knowledge Graph by{' '}
                                        <em>Allard Oelen</em>
                                    </li>
                                    <li>
                                        How to create visualizations by <em>Vitalis Wiens</em>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">14:40</th>
                            <td>Questions and Discussion</td>
                        </tr>
                    </tbody>
                </table>
            </Container>
        </div>
    );
}
