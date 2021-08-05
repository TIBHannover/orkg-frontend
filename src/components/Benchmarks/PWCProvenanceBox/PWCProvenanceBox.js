import styled from 'styled-components';
import PWC_LOGO from 'assets/img/poweredby/papers-with-code.png';

const PWCProvenanceBoxStyled = styled.div`
    border: 2px solid ${props => props.theme.light};
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    align-items: center;

    &:hover {
        border: 2px solid ${props => props.theme.secondary};
    }
`;

export default function PWCProvenanceBox() {
    return (
        <div>
            <a href="https://paperswithcode.com/" target="_blank" rel="noopener noreferrer" className="text-center">
                <PWCProvenanceBoxStyled>
                    <small>Data originally imported from</small>
                    <img className="p-2" src={PWC_LOGO} alt="papers with code logo" style={{ maxWidth: 200, maxHeight: 60 }} />
                </PWCProvenanceBoxStyled>
            </a>
        </div>
    );
}
