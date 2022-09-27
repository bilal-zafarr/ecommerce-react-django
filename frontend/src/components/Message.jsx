import { Alert } from "react-bootstrap"

const Message = ({ children, variant }) => {
    return (
        <Alert variant={variant}>
            {children}
        </Alert>
    )
}

export default Message
