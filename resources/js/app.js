const axios = require('axios');
const admin = require("../js/admin");
const addToCart = document.querySelectorAll('.add-to-cart');
const moment = require("moment");

let cartCounter = document.getElementById("cartCounter");

function updateCart(pizza) {
    axios.post('/update-cart', pizza).then((res) => {
        // console.log(res);
        cartCounter.innerText = res.data.totalQty;
    })
}



addToCart.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        // console.log(event);
        // let pizza=btn.dataset.pizza;//in json format
        let pizza = JSON.parse(btn.dataset.pizza);//to get the data of the pizza for which the add button was clicked
        updateCart(pizza);//to add the pizza in the cart
        // console.log(pizza);
    })
})


// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}
//Admin.js file
function initAdmin() {
    const orderTableBody = document.querySelector('#orderTableBody');
    let orders = [];
    let markup;

    axios.get('/admin/orders', {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    }).then(res => {
        orders = res.data;
        markup = generateMarkup(orders);
        orderTableBody.innerHTML = markup;
    }).catch(err => {
        console.log(err);
    })

    function renderItems(items) {
        let parsedItems = Object.values(items)
        return parsedItems.map((menuItem) => {
            return `
                <p>${menuItem.item.name} - ${menuItem.qty} pcs </p>
            `
        }).join('')
    }

    function generateMarkup(orders) {
        return orders.map(order => {
            return `
                <tr>
                <td class="border px-4 py-2 text-green-900">
                    <p>${order._id}</p>
                    <div>${renderItems(order.items)}</div>
                </td>
                <td class="border px-4 py-2">${order.customerId.name}</td>
                <td class="border px-4 py-2">${order.address}</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="POST">
                            <input type="hidden" name="orderId" value="${order._id}">
                            <select name="status" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="order_placed"
                                    ${order.status === 'order_placed' ? 'selected' : ''}>
                                    Placed</option>
                                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>
                                    Confirmed</option>
                                <option value="prepared" ${order.status === 'prepared' ? 'selected' : ''}>
                                    Prepared</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>
                                    Delivered
                                </option>
                                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>
                                    Completed
                                </option>
                            </select>
                        </form>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </td>
                <td class="border px-4 py-2">
                    ${moment(order.createdAt).format('hh:mm A')}
                </td>
                <td class="border px-4 py-2">
                    ${order.paymentStatus ? 'paid' : 'Not paid'}
                </td>
            </tr>
        `
        }).join('')
    }

    let socket=io();

    socket.on('orderPlaced',(order)=>{
        orders.unshift(order);
        orderTableBody.innerHTML='';
        orderTableBody.innerHTML=generateMarkup(order);

    })
}

initAdmin();


//Change order status
let statuses=document.querySelectorAll(".status_line");
let hiddenInput=document.querySelector("#hiddenInput") 
let order=hiddenInput ? hiddenInput.value : null;
order=JSON.parse(order);
// console.log(order);

let time = document.createElement('small');

function updateStatus(order){
    statuses.forEach((status)=>{
        status.classList.remove('step-completed');
        status.classList.remove('current');
    })
    let stepCompleted=true;
    statuses.forEach((status)=>{
        let dataProp=status.dataset.status;
        if(stepCompleted){
            status.classList.add('step-completed');
        }
        if(dataProp==order.status){
            stepCompleted=false;
            time.innerText=moment(order.updatedAt).format('hh:mm A');
            status.appendChild(time);
            if( status.nextElementSibling){
            status.nextElementSibling.classList.add('current');
            }
        }

    })

}

updateStatus(order);
//socket

let socket=io();
//Join
if(order){
socket.emit('join',`order_${order._id}`)//we are emitting the orderid to the backend socket connection ir.server.js file
}
//To update orders realitme in admin order list
let adminAreapath = window.location.pathname;
if(adminAreapath.includes('admin')){
    socket.emit('join','adminRoom');
}

socket.on('orderUpdated',(data)=>{
    const updatedOrder={...order};//to copy the order
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);
})