import React, { FC } from 'react';
import { AccordionBody as ReactstrapAccordionBody, AccordionBodyProps } from 'reactstrap';

const AccordionBody: FC<AccordionBodyProps> = ({ children, ...rest }) => {
    return <ReactstrapAccordionBody {...rest}>{children}</ReactstrapAccordionBody>;
};

export default AccordionBody;
