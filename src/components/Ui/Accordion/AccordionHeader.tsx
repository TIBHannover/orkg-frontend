import React, { FC } from 'react';
import { AccordionHeader as ReactstrapAccordionHeader, AccordionHeaderProps } from 'reactstrap';

const AccordionHeader: FC<AccordionHeaderProps> = ({ children, ...rest }) => {
    return <ReactstrapAccordionHeader {...rest}>{children}</ReactstrapAccordionHeader>;
};

export default AccordionHeader;
