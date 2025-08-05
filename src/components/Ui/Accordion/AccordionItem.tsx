import React, { FC } from 'react';
import { AccordionItem as ReactstrapAccordionItem, AccordionItemProps } from 'reactstrap';

const AccordionItem: FC<AccordionItemProps> = ({ children, ...rest }) => {
    return <ReactstrapAccordionItem {...rest}>{children}</ReactstrapAccordionItem>;
};

export default AccordionItem;
