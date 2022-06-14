var updateBtns = document.querySelectorAll(".updateBtn");
var deleteBtns = document.querySelectorAll(".deleteBtn");

updateBtns.forEach(function(updateBtn) {
    updateBtn.addEventListener("click", function(event) {
        var uniqueID = event.target.getAttribute("id");
        // console.log(uniqueID);
        navigator.clipboard.writeText(uniqueID);
        alert("product id copied to clipboard");
        window.location.href = "/admin/product/update";
        // var request = new XMLHttpRequest();
        // request.open("get", "/admin/product/update");
        // request.setRequestHeader("Content-type", "application/json");
        // request.send(JSON.stringify({uniqueID: uniqueID}));

        // request.addEventListener("load", function() {
        //     window.location.href = "/admin/product/update_product";
        // })
        // request.addEventListener("")
    })
})

deleteBtns.forEach(function(deleteBtn) {
    deleteBtn.addEventListener("click", function(event) {
        var uniqueID = event.target.getAttribute("id");
        console.log(uniqueID);
        var request = new XMLHttpRequest();
        request.open("post", "/admin/product/delete");
        request.setRequestHeader("Content-type", "application/json");
        request.send(JSON.stringify({uniqueID: uniqueID}));

        request.addEventListener("load", function() {
            window.location.href = "/admin/product/";
        })
    })
})