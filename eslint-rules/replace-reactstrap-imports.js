module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Replace reactstrap imports with UI wrapper components',
            category: 'Best Practices',
            recommended: false,
        },
        fixable: 'code',
        schema: [],
        messages: {
            replaceReactstrapImport: 'Replace reactstrap import "{{componentName}}" with UI wrapper component',
        },
    },
    create(context) {
        // Skip files in the UI components directory
        const filename = context.getFilename();
        const normalizedPath = filename.replace(/\\/g, '/');
        if (normalizedPath.includes('/src/components/Ui/') || normalizedPath.includes('/components/Ui/')) {
            return {};
        }

        // Mapping of reactstrap components to their UI wrapper equivalents
        const uiComponentMapping = {
            Row: '@/components/Ui/Structure/Row',
            Col: '@/components/Ui/Structure/Col',
            Container: '@/components/Ui/Structure/Container',
            Table: '@/components/Ui/Table/Table',
            Button: '@/components/Ui/Button/Button',
            ButtonDropdown: '@/components/Ui/Button/ButtonDropdown',
            ButtonGroup: '@/components/Ui/Button/ButtonGroup',
            UncontrolledButtonDropdown: '@/components/Ui/Button/UncontrolledButtonDropdown',
            Nav: '@/components/Ui/Nav/Nav',
            NavLink: '@/components/Ui/Nav/NavLink',
            Navbar: '@/components/Ui/Nav/Navbar',
            NavbarToggler: '@/components/Ui/Nav/NavbarToggler',
            Collapse: '@/components/Ui/Nav/Collapse',
            NavItem: '@/components/Ui/Nav/NavItem',
            Breadcrumb: '@/components/Ui/Breadcrumb/Breadcrumb',
            BreadcrumbItem: '@/components/Ui/Breadcrumb/BreadcrumbItem',
            Dropdown: '@/components/Ui/Dropdown/Dropdown',
            DropdownItem: '@/components/Ui/Dropdown/DropdownItem',
            DropdownMenu: '@/components/Ui/Dropdown/DropdownMenu',
            DropdownToggle: '@/components/Ui/Dropdown/DropdownToggle',
            Modal: '@/components/Ui/Modal/Modal',
            ModalBody: '@/components/Ui/Modal/ModalBody',
            ModalHeader: '@/components/Ui/Modal/ModalHeader',
            ModalFooter: '@/components/Ui/Modal/ModalFooter',
            Form: '@/components/Ui/Form/Form',
            FormGroup: '@/components/Ui/Form/FormGroup',
            FormText: '@/components/Ui/Form/FormText',
            FormFeedback: '@/components/Ui/Form/FormFeedback',
            Input: '@/components/Ui/Input/Input',
            InputGroup: '@/components/Ui/Input/InputGroup',
            InputGroupText: '@/components/Ui/Input/InputGroupText',
            Label: '@/components/Ui/Label/Label',
            Popover: '@/components/Ui/Popover/Popover',
            PopoverHeader: '@/components/Ui/Popover/PopoverHeader',
            PopoverBody: '@/components/Ui/Popover/PopoverBody',
            UncontrolledPopover: '@/components/Ui/Popover/UncontrolledPopover',
            Card: '@/components/Ui/Card/Card',
            CardBody: '@/components/Ui/Card/CardBody',
            CardFooter: '@/components/Ui/Card/CardFooter',
            CardImg: '@/components/Ui/Card/CardImg',
            CardTitle: '@/components/Ui/Card/CardTitle',
            CardSubtitle: '@/components/Ui/Card/CardSubtitle',
            CardText: '@/components/Ui/Card/CardText',
            Badge: '@/components/Ui/Badge/Badge',
            Alert: '@/components/Ui/Alert/Alert',
            UncontrolledAlert: '@/components/Ui/Alert/UncontrolledAlert',
            ListGroup: '@/components/Ui/List/ListGroup',
            ListGroupItem: '@/components/Ui/List/ListGroupItem',
            Accordion: '@/components/Ui/Accordion/Accordion',
            AccordionItem: '@/components/Ui/Accordion/AccordionItem',
            AccordionHeader: '@/components/Ui/Accordion/AccordionHeader',
            AccordionBody: '@/components/Ui/Accordion/AccordionBody',
            Progress: '@/components/Ui/Progress/Progress',
            TabContent: '@/components/Ui/Tab/TabContent',
            TabPane: '@/components/Ui/Tab/TabPane',
            Pagination: '@/components/Ui/Pagination/Pagination',
            PaginationItem: '@/components/Ui/Pagination/PaginationItem',
            PaginationLink: '@/components/Ui/Pagination/PaginationLink',
            Offcanvas: '@/components/Ui/Canvas/Offcanvas',
            OffcanvasBody: '@/components/Ui/Canvas/OffcanvasBody',
            OffcanvasHeader: '@/components/Ui/Canvas/OffcanvasHeader',
        };

        return {
            ImportDeclaration(node) {
                // Only process reactstrap imports
                if (node.source.value !== 'reactstrap') {
                    return;
                }

                // Only process named imports
                if (node.specifiers.length === 0 || node.specifiers.some((spec) => spec.type !== 'ImportSpecifier')) {
                    return;
                }

                const uiImports = [];
                const remainingImports = [];

                // Categorize imports
                for (const specifier of node.specifiers) {
                    const importedName = specifier.imported.name;
                    const localName = specifier.local.name;

                    if (uiComponentMapping[importedName]) {
                        uiImports.push({
                            importedName: importedName,
                            localName: localName,
                            path: uiComponentMapping[importedName],
                        });
                    } else {
                        remainingImports.push(specifier);
                    }
                }

                // If we have UI imports to replace, create autofix
                if (uiImports.length > 0) {
                    const sourceCode = context.getSourceCode();

                    context.report({
                        node,
                        messageId: 'replaceReactstrapImport',
                        data: {
                            componentName: uiImports.map((ui) => ui.importedName).join(', '),
                        },
                        fix(fixer) {
                            // Generate new import statements, preserving aliases
                            const newImports = uiImports
                                .map((ui) => {
                                    if (ui.importedName === ui.localName) {
                                        return `import ${ui.localName} from '${ui.path}';`;
                                    } else {
                                        return `import ${ui.localName} from '${ui.path}';`;
                                    }
                                })
                                .join('\n');

                            if (remainingImports.length > 0) {
                                // Keep the remaining reactstrap imports with their aliases
                                const remainingImportSpecifiers = remainingImports
                                    .map((spec) => {
                                        const importedName = spec.imported.name;
                                        const localName = spec.local.name;
                                        if (importedName === localName) {
                                            return importedName;
                                        } else {
                                            return `${importedName} as ${localName}`;
                                        }
                                    })
                                    .join(', ');
                                const remainingImportStatement = `import { ${remainingImportSpecifiers} } from 'reactstrap';`;
                                return fixer.replaceText(node, `${newImports}\n${remainingImportStatement}`);
                            } else {
                                // Replace the entire import with new UI imports
                                return fixer.replaceText(node, newImports);
                            }
                        },
                    });
                }
            },
        };
    },
};
