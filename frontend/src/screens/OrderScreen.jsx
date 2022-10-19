import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { useEffect } from "react"
import { Button, Card, Col, Image, ListGroup, Row } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { deliverOrder, getOrderDetails, payOrder } from "../actions/orderActions"
import Loader from "../components/Loader"
import Message from "../components/Message"
import { ORDER_DELIVER_RESET, ORDER_PAY_RESET } from "../constants/orderConstants"

const OrderScreen = () => {

    const orderDetails = useSelector((state) => state.orderDetails)
    const { order, loading, error } = orderDetails

    const orderPay = useSelector((state) => state.orderPay)
    const { loading: loadingPay, success: successPay } = orderPay

    const orderDeliver = useSelector((state) => state.orderDeliver)
    const { loading: loadingDeliver, success: successDeliver } = orderDeliver

    const userLogin = useSelector((state) => state.userLogin)
    const { userInfo } = userLogin

    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const orderId = Number(params.id)

    if (!loading && !error) {
        order.itemsPrice = order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
    }

    useEffect(() => {
        if (!userInfo) {
            navigate("/login")
        }
        if (!order || successPay || order._id !== orderId || successDeliver) {
            dispatch({ type: ORDER_PAY_RESET })
            dispatch({ type: ORDER_DELIVER_RESET })
            dispatch(getOrderDetails(orderId))
        }
    }, [order, orderId, dispatch, successPay, successDeliver])

    const successPaymentHandler = (paymentResult) => {
        dispatch(payOrder(orderId, paymentResult))
    }

    const deliverHandler = () => {
        dispatch(deliverOrder(order))
    }

    const paidHandler = () => {
        dispatch(payOrder(orderId, {}))
    }

    const initialOptionsPayPal = {
        "client-id": "AYOrux890F3P4g_PnJj09JGU8w8u7m1QUy9WeeYa9X5ZPmsYn8Cn0tFPsOywWNRV05VaAhBsAIf8jzF1",
        currency: "USD",
    };

    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: order.totalPrice,
                    },
                },
            ],
        });
    };

    const onApprove = (data, actions) => {
        return actions.order.capture().then(function (details) {
            successPaymentHandler(details)
        });
    };

    const onError = (err) => {
        alert(err);
    };


    return loading ? (
        <Loader />
    ) : error ? (
        <Message variant='danger'>{error}</Message>
    ) : (
        <>
            <Row>
                <Col md={8}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p><strong>Name: </strong> {order.user.name}</p>
                            <p><strong>Email: </strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>

                            <p>
                                <strong>Address: </strong>
                                {order.address}, {order.city},{' '}
                                {order.postalCode},{' '} {order.country}
                            </p>

                            <div className="mt-2">
                                {order.isDelivered ? (
                                    <Message variant='success'>Delivered on {order.deliveredAt.substring(0, 10)}</Message>
                                ) : (
                                    <Message variant='warning'>Not Delivered</Message>
                                )}
                            </div>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <strong>Method: </strong>
                            {order.paymentMethod}

                            <div className="mt-2">
                                {order.isPaid ? (
                                    <Message variant='success'>Paid on {order.paidAt.substring(0, 10)}</Message>
                                ) : (
                                    <Message variant='warning'>Not Paid</Message>
                                )}
                            </div>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {order.orderItems.length === 0 ? (
                                <Message>Your order is empty</Message>
                            ) : (
                                <ListGroup variant="flush">
                                    {order.orderItems.map((item, index) => (
                                        <ListGroup.Item key={index}>
                                            <Row>
                                                <Col md={1}>
                                                    <Image src={item.image} alt={item.name} fluid rounded />
                                                </Col>
                                                <Col>
                                                    <a href={`/products/${item.product}`}>{item.name}</a>
                                                </Col>
                                                <Col md={4}>
                                                    {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>

                <Col md={4}>
                    <Card>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <h2>Order Summary</h2>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>${order.itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping</Col>
                                    <Col>${order.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>${order.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Total</Col>
                                    <Col>${order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            {
                                !order.isPaid && !userInfo.isAdmin && (
                                    <ListGroup.Item>
                                        {loadingPay ? <Loader /> : (
                                            <PayPalScriptProvider options={initialOptionsPayPal}>
                                                <PayPalButtons
                                                    createOrder={createOrder}
                                                    onApprove={onApprove}
                                                    onError={onError}
                                                />
                                            </PayPalScriptProvider>
                                        )}
                                    </ListGroup.Item>
                                )
                            }

                            {userInfo && userInfo.isAdmin && (
                                <ListGroup.Item>
                                    <Button
                                        type='button'
                                        className='btn btn-block w-100'
                                        onClick={paidHandler}
                                        disabled={order.isPaid}
                                    >
                                        Mark As Paid
                                    </Button>
                                </ListGroup.Item>
                            )}

                            {loadingDeliver && <Loader />}
                            {userInfo && userInfo.isAdmin && (
                                <ListGroup.Item>
                                    <Button
                                        type='button'
                                        className='btn btn-block w-100'
                                        onClick={deliverHandler}
                                        disabled={order.isDelivered || !order.isPaid}
                                    >
                                        Mark As Delivered
                                    </Button>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default OrderScreen
