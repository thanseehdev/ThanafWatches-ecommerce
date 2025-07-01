// blocking customers
function updateOrderStatus(orderid, status) {
    if (confirm("Are you sure you want to change the Order status?")) {
        console.log('it is working');
        $.ajax({
            url: "/admin/updateorderstatus/" + `${orderid}/${status}`,
            method: 'put',
            success: function (response) {
                Toastify({
                    text: response.msg,
                    duration: 3000,
                    gravity: 'top',
                    position: 'center',
                    backgroundColor: 'green',
                    stopOnFocus: true,
                }).showToast();

                // Reload the page after 3 seconds
                setTimeout(function () {
                    location.reload();
                }, 1000);
            },
            error: function(err) {
                alert("Something error detected");
            }
        });
    } else {
        alert("canceled");
    }
}

function cancelOrder(orderid){
    Swal.fire({
        title: 'Are you sure?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancell All'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: "/cancelorder/" + `${orderid}`,
                method: "put",
                success: function (response) {
                    Swal.fire({
                        text: response.msg,
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    });
                    // Reload the page after 3 seconds
                    setTimeout(function () {
                        location.reload();
                    }, 1000);
                },
                error: function (err) {
                    Toastify({
                        text: "Something went wrong. Please try again.",
                        duration: 3000,
                        gravity: 'top',
                        position: 'center',
                        backgroundColor: 'red',
                        stopOnFocus: true,
                    }).showToast();
                }
            });
        }
    });
}


function cancelSingleProduct(prodktid, orderid, index){
    Swal.fire({
        title: 'Are you sure?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancell All'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/cancelsingleproduct/${prodktid}/${orderid}/${index}`,
                method: "put",
                success: function (response) {
                    Swal.fire({
                        text: response.msg,
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    });
                    // Reload the page after 3 seconds
                    setTimeout(function () {
                        location.reload();
                    }, 1000);
                },
                error: function (err) {
                    Toastify({
                        text: "Something went wrong. Please try again.",
                        duration: 3000,
                        gravity: 'top',
                        position: 'center',
                        backgroundColor: 'red',
                        stopOnFocus: true,
                    }).showToast();
                }
            });
        }
    });
}