import Link from 'next/link';
import styled from 'styled-components';

import useReview from '@/components/Review/hooks/useReview';
import useScroll from '@/components/Review/hooks/useScroll';

const Wrapper = styled.aside`
    position: absolute;
    left: -200px;
    height: 100%;

    // when the screen is too small, hide the outline, the responsiveness can be improved in the future
    @media only screen and (max-width: 1750px) {
        display: none;
    }
`;

const Box = styled.div<{ $editMode: boolean }>`
    position: sticky;
    top: 150px;
    bottom: 250px;
    width: 200px;
    background: #d7dae3;
    margin-bottom: 50px;
    border-radius: ${(props) => (props.$editMode ? '6px' : '6px 0 0 6px')};
    margin-top: ${(props) => (props.$editMode ? '0px' : '150px')};
    padding: 10px;
    max-height: calc(100vh - 190px);
    overflow-y: auto;

    a:focus {
        color: ${(props) => props.theme.secondary} !important;
    }
`;

const ListItem = styled.li`
    border-top: 1px solid #c7ccda;
    padding: 5px 0;
    font-size: 95%;
    a {
        color: #5c5c75;
    }
    &:first-child {
        border-top: none;
    }
`;

const Outline = ({ editMode = false }: { editMode?: boolean }) => {
    useScroll();
    const { review } = useReview();

    if (!review) {
        return null;
    }

    return (
        <Wrapper>
            <Box $editMode={editMode}>
                <ol style={{ listStyle: 'none' }} className="p-0 m-0">
                    {review.sections
                        .filter((section) => section.heading)
                        .map((section) => (
                            <ListItem key={section.id}>
                                <Link href={`#section-${section.id}`} scroll={false}>
                                    {section.heading}
                                </Link>
                            </ListItem>
                        ))}
                    <ListItem>
                        <Link href="#section-acknowledgements">Acknowledgements</Link>
                    </ListItem>
                    <ListItem>
                        <Link href="#section-references">References</Link>
                    </ListItem>
                </ol>
            </Box>
        </Wrapper>
    );
};

export default Outline;
