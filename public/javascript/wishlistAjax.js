function addTowishlist(id){
    $.ajax({
        url:`/addToWishlist/${id}`,
        method:'get',
        success: function (response) {
            Swal.fire({
                text: response.msg,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
        error: function (err) {
            Swal.fire({
                text: 'Something went wrong',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false
            });
            console.log(err);
        }
      })
}

function RemoveFromWishlist(productId){
        Swal.fire({
            title: 'Are you sure?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/removeWish/" + `${productId}`,
                    method: "delete",
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
