import { Col, Container, Row } from 'reactstrap';

export default function CurationCall() {
    document.title = 'ORKG Curation Grant Competition - Open Research Knowledge Graph';

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">ORKG Curation Grant Competition</h1>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <h2>Open Call for Proposals launched</h2>
                <p>
                    The{' '}
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSeDub-EKGS62mVk6cge24ZBGtcEQuHhQA1O2XwOBS6l_azPJQ/viewform?usp=sf_link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        application form
                    </a>{' '}
                    can be submitted until 31st of May 2021.
                </p>

                <p>
                    The{' '}
                    <a href="https://www.tib.eu/en/" target="_blank" rel="noopener noreferrer">
                        TIB Leibniz Information Centre for Science and Technology
                    </a>{' '}
                    invites applications for Open Research Knowledge Graph (ORKG) Curation Grants, to which researchers (advanced PhD students
                    welcome) from various fields can apply. Successful applicants will make regular contributions to the ORKG in their research field,
                    for which they will be personally compensated with 400 EUR per month. Grants initially run for six months, with the possibility of
                    extension, and require you to invest approximately one day per week contributing to the ORKG. We expect you to add key research
                    questions and corresponding research contributions in your research field to the ORKG. You will be part of a joint effort to
                    contribute to one of the biggest challenges in research―better organizing the contents of scholarly publications, and you will
                    gain visibility and reputation in your research field.
                </p>

                <h3 className="mt-4 mb-3">What is the Open Research Knowledge Graph? </h3>
                <p>
                    Scholarly contents are mainly communicated through publications, in the form of unstructured texts. Considering the continuously
                    increasing numbers of publications being issued each year, researchers are finding it increasingly difficult to follow the
                    literature that is relevant to them. The Open Research Knowledge Graph (ORKG) aims to address this problem by describing research
                    papers in a structured manner within a knowledge graph, making the contents of the papers human-readable as well as
                    machine-actionable and FAIR (i.e., findable, accessible, interoperable, and reusable). ORKG covers not only bibliographic data but
                    the actual contents of the publications themselves (for more information see{' '}
                    <a href="https://projects.tib.eu/orkg/" target="_blank" rel="noopener noreferrer">
                        ORKG project page
                    </a>
                    ).
                </p>

                <Row className="my-3">
                    <Col md={6} className="mx-auto">
                        <div className="embed-responsive embed-responsive-16by9">
                            <iframe
                                title="Overview on the Open Research Knowledge Graph"
                                scrolling="no"
                                frameBorder="0"
                                src="//av.tib.eu/player/52261"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen={true}
                                className="embed-responsive-item"
                            />
                        </div>
                    </Col>
                </Row>

                <h3 className="mt-4 mb-3">Requirements and Duties</h3>
                <ul>
                    <li>
                        You have an academic qualification in a concrete field of science, documented by a master degree and experience in publishing
                        research.
                    </li>
                    <li>Ideally you are an advanced PhD student or Post doctoral researcher (more senior researchers are also welcome).</li>
                    <li>You are able to regularly spare time (approx. one day per week) for your ORKG curation work.</li>
                    <li>You are adding key research questions and corresponding research contributions in your field of research to the ORKG.</li>
                    <li>
                        You create ORKG state-of-the-art comparisons and suitable visualizations for contributions added to a particular research
                        problem.
                    </li>
                    <li>
                        You are interested in organizing research contributions in your field in a structured, semantic way, so other researchers can
                        get a quick overview on the state-of-the-art in the field.
                    </li>
                    <li>
                        You outreach and disseminate your ORKG curation work to your scientific community, e.g. through mailing lists, social
                        networks, at conferences etc.
                    </li>
                    <li>
                        You will have to report on a monthly basis about your curation work. We are expecting you to create 2-4 state-of-the-art ORKG
                        comparisons each month for relevant research problems in your particular research field. Each ORKG comparison should comprise
                        a sizable number of research papers and be sufficiently described using relevant properties, accompanied by suitable
                        visualizations.
                    </li>
                </ul>

                <h3 className="mt-4 mb-3">Benefits</h3>
                <ul>
                    <li>
                        You contribute to one of the biggest challenges in research―better organizing the contents of scholarly publications, and you
                        will gain experience in semantically structuring and describing research in your field.
                    </li>
                    <li>
                        With the organization of research contributions, you provide a key-service to your research community and gain international
                        visibility.
                    </li>
                    <li>You will gain scientific reputation because ORKG contributions such as comparisons and visualizations are citable.</li>
                    <li>
                        Comprehensive comparisons of the state-of-the-art related to a particular research question can be published as survey or
                        review articles in a journal (e.g. on TIB’s open access publishing platform).
                    </li>
                    <li>You will receive a monthly compensation of 400 EUR for your contribution to building the Open Research Knowledge Graph.</li>
                    <li>
                        Upon successful completion of at least six months of ORKG curation work, you will receive a certificate for serving as an ORKG
                        research field editor.
                    </li>
                </ul>

                <h3 className="mt-4 mb-3">Application process and deadlines</h3>
                <p>To apply for the grant, you have to complete and submit this application form. </p>
                <p>
                    <strong>Application deadline:</strong> 31st of May 2021
                    <br />
                    <strong>Notification of acceptance:</strong> 14th of June 2021
                    <br />
                    <strong>Beginning of curation project:</strong> 1st of July 2021
                </p>

                <h3 className="mt-4 mb-3">How to apply</h3>
                <p>
                    Please complete the{' '}
                    <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSeDub-EKGS62mVk6cge24ZBGtcEQuHhQA1O2XwOBS6l_azPJQ/viewform?usp=sf_link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        application form
                    </a>{' '}
                    and submit it until May 31st, 2021. If you have any questions, please contact Lars Vogt at{' '}
                    <a href="mailto:lars.vogt@tib.eu">lars.vogt@tib.eu</a>.
                </p>

                <h3 className="mt-4 mb-3">ORKG how-to videos</h3>
                <Row className="my-3">
                    <Col md={6}>
                        <div className="embed-responsive embed-responsive-16by9">
                            <iframe
                                title="How to make an ORKG comparison"
                                scrolling="no"
                                frameBorder="0"
                                src="//av.tib.eu/player/51996"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen={true}
                                className="embed-responsive-item"
                            />
                        </div>
                    </Col>
                    <Col md={6} className="mt-3 mt-md-0">
                        <div className="embed-responsive embed-responsive-16by9">
                            <iframe
                                title="Video explaining how to make a comparison visualization"
                                scrolling="no"
                                frameBorder="0"
                                src="//av.tib.eu/player/52057"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen={true}
                                className="embed-responsive-item"
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
