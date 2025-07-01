function addToWishlist(prddktId) {
    $.ajax({
        url: "/addtowishlist/" + `${prddktId}`,
        method: "get",
        success: function (res) {
            if (res.userr == false) {
                Toastify({
                    text: 'No user Found Please Login',
                    duration: 3000,
                    gravity: 'top',
                    position: 'center',
                    backgroundColor: 'red',
                    stopOnFocus: true,
                }).showToast();
            } else if (res.prdktExist == false && res.userr == true) {
       
                Toastify({
                    text: 'Product added to wishlist',
                    duration: 3000,
                    gravity: 'top',
                    position: 'center',
                    backgroundColor: 'blue',
                    stopOnFocus: true,
                }).showToast();
            } else if (res.prdktExist == true && res.userr == true) {
                
                Swal.fire({
                    icon: 'info',
                    title: 'Product Already Exist',
                    text: 'This product already exists in the wishlist',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        },
        error: function (err) {
         
            Swal.fire({
                icon: 'error',
                title: 'Something Went Wrong',
                text: 'An error occurred while adding to wishlist',
                showConfirmButton: false,
                timer: 3000
            });
            console.log(err);
        }
    });
}


//remove product form wishlist
function removeFromWishlist(prdktid, wishId) {
    Swal.fire({
        title: 'Are you sure?',
        text:null,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: "/removefromwishlist/" + `${prdktid}/${wishId}`,
                method: "delete",
                success: function (response) {
                    Toastify({
                        text: response.msg,
                        duration: 3000,
                        gravity: 'top',
                        position: 'center',
                        backgroundColor: 'green',
                        stopOnFocus: true,
                    }).showToast();

                    setTimeout(function () {
                        location.reload();
                    }, 500);
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
