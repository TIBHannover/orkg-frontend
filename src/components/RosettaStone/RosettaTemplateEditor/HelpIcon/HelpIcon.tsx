import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useContext } from 'react';
import { ThemeContext } from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';

type HelpIconProps = {
    content: string;
};

const HelpIcon: FC<HelpIconProps> = ({ content }) => {
    const theme = useContext(ThemeContext);
    return (
        <Tooltip content={content}>
            <FontAwesomeIcon size="sm" icon={faQuestionCircle} color={theme?.secondary} />
        </Tooltip>
    );
};

export default HelpIcon;
