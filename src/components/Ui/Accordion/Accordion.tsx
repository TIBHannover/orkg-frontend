import React, { FC } from 'react';
import { Accordion as ReactstrapAccordion, AccordionProps } from 'reactstrap';

const Accordion: FC<AccordionProps> = ({ children, ...rest }) => {
    return <ReactstrapAccordion {...rest}>{children}</ReactstrapAccordion>;
};

export default Accordion;
