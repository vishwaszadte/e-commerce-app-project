var decrementItemBtns = document.querySelectorAll(".decrementItemBtn");
var incrementItemBtns = document.querySelectorAll(".incrementItemBtn");
var removeProductBtns = document.querySelectorAll(".removeProductBtn");

decrementItemBtns.forEach(function(decrementItemBtn) {
    decrementItemBtn.addEventListener("click", function(event) {
        var parent = event.target.parentNode;
        // var user_id = parent.children[0].innerHTML;
        var product_id = parent.children[2].innerHTML;
        var quantity = Number(parent.children[3].innerHTML);
        quantity--;
        // console.log(user_id);

        updateItemQuantity(product_id, quantity);
    })
})

function updateItemQuantity(product_id, quantity) {
    var request = new XMLHttpRequest();
    request.open("post", "/updateCart");
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({product_id: product_id, quantity: quantity}));

    request.addEventListener("load", function() {
        window.location.href = "/cart";
    })
}

incrementItemBtns.forEach(function(incrementItemBtn) {
    incrementItemBtn.addEventListener("click", function(event) {
        var parent = event.target.parentNode;
        // var user_id = parent.children[0];
        var product_id = parent.children[2].innerHTML;
        var quantity = Number(parent.children[3].innerHTML);
        quantity++;

        updateItemQuantity(product_id, quantity);
    })
})

// function incrementItem(user_id, product_id, quantity)