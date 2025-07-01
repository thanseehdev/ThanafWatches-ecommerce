function deleteBanner(bannerId){
    Swal.fire({
        title: 'Are you sure?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/deleteBanner?bannerId=${bannerId}`,
                method: "get",
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