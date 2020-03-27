export const customStyles = {
    control: (provided, state) => ({
        ...provided,
        background: 'inherit',
        boxShadow: state.isFocused ? 0 : 0,
        border: 0,
        paddingLeft: 0,
        paddingRight: 0,
        cursor: 'text',
        minHeight: 'initial',
        borderRadius: 'inherit',
        padding: 0,
        '&>div:first-of-type': {
            padding: 0
        }
    }),
    container: provided => ({
        padding: 0,
        height: 'auto',
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        background: '#fff',
        '&>div:first-of-type': {
            padding: 0
        }
    }),
    menu: provided => ({
        ...provided,
        zIndex: 10,
        color: '#000'
    }),
    option: provided => ({
        ...provided,
        cursor: 'pointer',
        whiteSpace: 'normal'
    }),
    indicatorsContainer: provided => ({
        ...provided,
        '&>div:last-child': {
            padding: '0 8px'
        }
    }),
    input: provided => ({
        ...provided,
        margin: '0 4px'
    })
};
