// blocking customers
function block(id, status) {
    if (confirm("Are you sure you want to change the status?")) {
        console.log('it is working');
        $.ajax({
            url: `/admin/customers/block/${id}/${status}`,
            method: "get",
            success: function (response) {
                Toastify({
                    text: 'User Blocked Successfully',
                    duration: 3000,
                    gravity: 'top',
                    position: 'center',
                    backgroundColor: 'green',
                    stopOnFocus: true,
                }).showToast();

                // Reload the page after 3 seconds
                setTimeout(function () {
                    location.reload();
                }, 500);
            },
            error: function(err) {
                alert("Something error detected");
            }
        });
    } else {
        alert("canceled");
    }
}

