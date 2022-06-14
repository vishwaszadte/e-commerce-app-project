var productList = document.getElementById("productList");
var loadMoreBtn = document.getElementById("loadMoreBtn");
var viewDescriptionBtn = document.getElementById("viewDescriptionBtn");
var viewCartBtn = document.getElementById("viewCartBtn");
var addToCartBtns = document.querySelectorAll(".addToCartBtn");

var indexCount = 5;

function showDesc(event) {
    var parent = event.target.parentNode;
    // console.log(parent)
    var descriptionText = parent.children[2];

    if (event.target.classList.contains("clicked")) {
        descriptionText.style.display = "none";
        event.target.classList.remove("clicked");
        event.target.innerHTML = "View Description"
    } else {
        descriptionText.style.display = "block";
        event.target.classList.add("clicked");
        event.target.innerHTML = "Hide Description"
    }
}

loadMoreBtn.addEventListener("click", function() {
    var request = new XMLHttpRequest();
    request.open("GET", "/loadMore");
    request.send();

    request.addEventListener("load", function() {
        // console.log(JSON.parse(request.responseText));
        var moreProducts = JSON.parse(request.responseText);
        // console.log(moreProducts);

        var start = indexCount;

        for (var i = start; i < moreProducts.length && i < (start+5); i++) {
            var li = document.createElement("li");
            var prodName = document.createElement("h4");
            var prodPrice = document.createElement("h4");
            var prodDesc = document.createElement("span");
            var viewDescBtn = document.createElement("button");
            var cartBtn = document.createElement("button");
            var productBtns = document.createElement("div");

            li.setAttribute("class", "product");

            prodName.innerHTML = moreProducts[i].name;
            prodPrice.innerHTML = moreProducts[i].price;
            
            prodDesc.innerHTML = moreProducts[i].description;
            prodDesc.setAttribute("style", "display: none");

            viewDescBtn.innerHTML = "View Description";
            viewDescBtn.setAttribute("onclick", "showDesc(event)");

            cartBtn.setAttribute("class", "addToCartBtn");
            cartBtn.setAttribute("id", `${moreProducts[i]._id}`);
            cartBtn.innerHTML = "Add to cart";

            cartBtn.addEventListener("click", function(event) {
                addToCart(event.target.getAttribute("id"));
            })

            productBtns.appendChild(viewDescBtn);
            productBtns.appendChild(cartBtn);
            productBtns.setAttribute("class", "product-buttons");

            li.appendChild(prodName);
            li.appendChild(prodPrice);
            li.appendChild(prodDesc);
            li.appendChild(productBtns);

            productList.appendChild(li);
            indexCount++;
        }

        // moreProducts.forEach(function(product, index) {
        //     indexCount++;
        //     if (index >=5 && index > indexCount) {
                
        //     }
        // })
        
    })
})

addToCartBtns.forEach(function(addToCartBtn) {
    addToCartBtn.addEventListener("click", function(event) {
        var productParent = event.target.parentNode.parentNode;
        var productId = event.target.getAttribute("id");
        var productImage = "random";
        var productName = productParent.children[0].innerHTML;
        var productDes = productParent.children[2].innerHTML;
        
        // console.log(productParent);
        addToCart(productId, productImage, productName, productDes);
        event.target.style.background = "yellow";
        event.target.innerHTML = "Added to cart";
    })
})

function addToCart(productId, productImage, productName, productDes) {
    var request = new XMLHttpRequest();
    
    request.open("post", "/addToCart");
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({product_id: productId, product_image: productImage, product_name: productName, product_description: productDes}));

    request.addEventListener("load", function() {
        // console.log(request);
        if (request.status === 401) {
            alert("please login to use this function");
            window.location.href = "/auth";
        } 
        // else if (request.status === 200) {
        //     console.log("chal gaya bhai");
        // }
    })
}

function viewCart() {
    var request = new XMLHttpRequest();
    request.open("post", "/viewCart");
    request.setRequestHeader("Content-type", "application/json");
    request.send();

    request.addEventListener("load", function() {
        if (request.status === 401) {
            alert("please login to use this function");
            window.location.href = "/auth";
        } 
        else if (request.status === 200) {
            window.location.href = "/cart";
        }
    })
}

//! the below code will not work because there are multiple add to cart buttons
// addToCartBtn.addEventListener("click", function(event) {
//     event.target.style.background = "blue";
// })