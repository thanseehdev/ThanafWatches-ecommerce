function addTocart(prdctid){
    $.ajax({
        url:`/addtocart/${prdctid}/0`,
        method:'get',
        success: function (response) {
          Swal.fire({
            text: response.msg,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
        });
          setTimeout(function () {
              window.location.reload();
          }, 1000);
      },
      error: function (err) {
          Toastify({
              text: "Something Error",
              duration: 3000,
              gravity: "top",
              position: "center",
              backgroundColor: "red",
              stopOnFocus: true,
          }).showToast();
          console.log(err);
      }
      })
}

function removeFromCart(productId){
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
                url: `/removecart/${productId}`,
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