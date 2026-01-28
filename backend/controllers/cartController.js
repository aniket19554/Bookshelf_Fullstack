import cartModel from "../models/cartModel.js";
import bookModel from '../models/bookModel.js';

//ADD TO CART
export async function addToCart(req, res) {
    const {bookId, quantity} = req.body;
    if(!bookId || !quantity || quantity < 1){
        return res.status(400).json({
            success: false,
            message: 'Book id and valid quantity are required.'
        })
    }

    try {
        const book = await bookModel.findById(bookId);
        if(!book) {
            return res.status(404).json({success: false, message: 'Book not found'});
        }
        let cart = await cartModel.findOne({ user: req.user._id})

        if(!cart) {
            cart = await cartModel.create({
                user: req.user._id,
                items: [{ book: bookId, quantity }]
            })
        }

        else {
            const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId)
            if(itemIndex > -1){
                cart.items[itemIndex].quantity += quantity;
            }
            else {
                cart.items.push({book: bookId, quantity})
            }

            await cart.save();
        }
        res.status(200).json({
            success: true,
            message: "Item added to cart.", cart
        });
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error added to cart",
            error: error.message
        });
    }
}

// GET USER CART
export async function getCart(req, res) {
    try {
        const cart = await cartModel.findOne({ user: req.user._id}).populate({ path: 'items.book', model: 'Book'})
        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                success: true,
                cart: { items: [], totalAmount: 0, tax: 0, shipping: 0, finalAmount: 0 },
            });
        }

        let totalAmount = 0;
        const taxRate = 0.1;
        const shipping = 50;

        cart.items.forEach(({ book, quantity }) => {
            totalAmount += (book?.price || 0) * quantity;
        });

        const tax = parseFloat((totalAmount * taxRate).toFixed(2));
        const finalAmount = parseFloat((totalAmount + tax + shipping).toFixed(2));

        res.status(200).json({
            succescc: true,
            cart,
            summary: {total, tax, shipping, finalAmount}
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving cart",
            error: error.message
        });
    }
}

//UPDATE ITEM QUANTITY
export async function updateCartItem(req, res) {
    const {bookId, quantity} = req.body;

    if(!bookId || quantity < 1) {
        return res.status(400).json({success: false, message: 'Valid book Id and quantity are required.'});
    }

    try {
        const cart = await cartModel.findOne({user: req.user._id});
        if(!cart) {
            return res.status(404).json({success: false, message: 'Cart not found'})
        }

        const item = cart.items.find(item => item.book.toString() === bookId)
        if(!item) {
            return res.status(404).json({ success: false, message: 'Item not fi+ound in cart.'})
        }

        item.quantity = quantity;
        await cart.save();
        res.status(200).json({
            success: true,
            message: 'Cart updated.',
            cart
        })
    }
catch (error) {
    res.status(500).json({
        success: false,
        message: "Error updating to cart items",
        error: error.message
        });
    }
}

//REMOVE ITEN FROM CART
export async function removeCartItem(req, res) {
    const { bookId } = req.params;

    try {
        const cart = await cartModel.findOne({user: req.user._id});
        if(!cart) {
            return res.status(404).json({success: false, message: 'Cart not found'})
        }
        cart.items = cart.items.filter(item => item.book.toString() !== bookId)
        await cart.save();
        res.status(200).json({
            success: true,
            message: 'Item removed',
            cart
        })
    } 
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error removing cart items",
            error: error.message
        });
    }
}

// CLEAR CART FUNCTION
export const clearUserCart = async (req, res) => {
    const userId = req.user.id;
    const cart = await cartModel.findOne({ user: userId });
    if (!cart) return res.status(404).json({
        success: false,
        message: 'Cart not found'
    });

    cart.items = [];
    await cart.save();
    res.status(200).json({
        success: true,
        message: 'Cart cleared Successfully!'
    })
}
