import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import { Row, Col, ListGroup, Image, Form, Button, Card } from "react-bootstrap"
// import Message from "../components/Message"
import { addToCart } from "../actions/cartActions";

const CartScreen = () => {
    const params = useParams()
    const [searchParams] = useSearchParams();
    const productId = params.id
    const qty = searchParams.get('qty') ? Number(searchParams.get('qty')) : 1
    const navigate = useNavigate()

    const dispatch = useDispatch()
    const cart = useSelector(state => state.cart)
    const { cartItems } = cart
    console.log(cartItems)

    useEffect(() => {
        if (productId) {
            dispatch(addToCart(productId, qty))
        }
    }, [dispatch, productId, qty])

    return (
        <>
            <h1>Cart</h1>
        </>
    )
}

export default CartScreen
