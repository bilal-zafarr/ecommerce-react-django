import { applyMiddleware, combineReducers, legacy_createStore } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import thunk from "redux-thunk"
import { productDetailsReducer, productListReducer } from "./reducers/productReducer"

const reducer = combineReducers({
    productList: productListReducer,
    productDetails: productDetailsReducer,
})
const initialState = {}
const middleware = [thunk]
const store = legacy_createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)))

export default store
