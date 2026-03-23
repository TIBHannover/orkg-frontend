import Video from '@/components/Home/Video';
import Container from '@/components/Ui/Structure/Container';

export default function Jumbotron() {
    return (
        <div className="tw:pt-4 tw:pb-5">
            <Container className="tw:relative tw:text-center tw:pb-2 tw:pt-2">
                <div className="tw:flex tw:flex-col tw:justify-center tw:items-center tw:text-white tw:text-shadow!">
                    <h1 className="tw:text-3xl! tw:md:text-5xl! tw:tracking-tight tw:text-shadow-lg tw:text-white! tw:mb-3!">Scholarly Knowledge.</h1>
                    <span className="tw:text-xl tw:text-shadow-lg">Structured. FAIR. Comparable.</span>
                </div>
                <div className="tw:text-white/60 tw:w-full tw:md:w-3/4 tw:mx-auto tw:mb-10 tw:mt-3 tw:text-lg">
                    <p>
                        The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG, papers are
                        easier to find and compare. <Video />
                    </p>
                </div>
            </Container>
        </div>
    );
}
