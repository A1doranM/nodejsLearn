const {Router} = require('express');
const Order = require('../models/order');
const auth = require("../middleware/auth");
const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      "user.userId": req.user._id
    }).populate("user.userId");

    res.render('orders', {
      isOrder: true,
      title: 'Orders',
      orders: orders.map(order => {
        return {
          ...order._doc,
          price: order.courses.reduce((total, c) => {
              return total += c.count * c.course.price
          }, 0)
        };
      })
    });
  } catch (e) {
    console.log("Error in orders routes", e);
  }
});


router.post('/', auth, async (req, res) => {
    try {
        const user = await req.user.populate("cart.items/courseId").execPopulate();

        const courses = user.cart.items.map(item => ({
            count: item.count,
            course: {...item.courseId._doc}
        }));

        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            courses: courses
        });

        await order.save();
        await req.user.clearCart();
    } catch (e) {
        console.log("Error in order routes", e);
    }
    res.redirect('/orders')
});

module.exports = router;