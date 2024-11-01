import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { FC, useContext } from 'react';
import { ThemeContext } from 'styled-components';

type HelpIconProps = {
    content: string;
};

const HelpIcon: FC<HelpIconProps> = ({ content }) => {
    const theme = useContext(ThemeContext);
    return (
        <Tippy content={content}>
            <FontAwesomeIcon size="sm" icon={faQuestionCircle} color={theme?.secondary} />
        </Tippy>
    );
};

export default HelpIcon;
