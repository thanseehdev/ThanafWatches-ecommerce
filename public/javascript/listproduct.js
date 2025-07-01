function list(id,status){
    Swal.fire({
        title: 'Are you sure?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Change Status!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/admin/blockproduct/${id}/${status}`,
                method:'get',
                success: function (response) {
                    Swal.fire({
                        text: "status changed sucessfully",
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