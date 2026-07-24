import Video from '@/components/Home/Video';
import Container from '@/components/Ui/Structure/Container';

export default function Jumbotron() {
    return (
        <div className="relative pt-4 pb-5">
            <Container className="relative text-center pb-2 pt-2">
                <div className="flex flex-col justify-center items-center text-white text-shadow!">
                    <h1 className="text-3xl! md:text-5xl! tracking-tight text-shadow-lg text-white! mb-3!">Scholarly Knowledge.</h1>
                    <span className="text-xl text-shadow-lg">Structured. FAIR. Comparable.</span>
                </div>
                <div className="text-white/60 w-full md:w-3/4 mx-auto mb-10 mt-3 text-lg">
                    <p>
                        The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG, papers are
                        easier to find and compare. <Video />
                    </p>
                </div>
            </Container>
        </div>
    );
}
