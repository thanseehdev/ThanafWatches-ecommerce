
function createRazorpay(order) {
    const id = order.id;
    const total = order.amount;
    console.log("Order ID:", id, "Total Amount:", total);
    console.log("gkgkgasb ");
    var options = {
        key: "rzp_test_HievUQgXRbxATJ",   
        amount: total,
        currency: 'INR',
        name: 'THANAF',
        description: 'Test Transaction',
        image: '',
        order_id: id,
        handler: function (response) {
            verifyPayment(response, order);
        },
        theme: {
            color: '#3c3c3c'
        }
    };

    var rzp1 = new Razorpay(options);

    rzp1.on('payment.failed', function (response) {
        const error = response.error;
        console.log(error);
        window.location.href = `/failedpayment?error=${error}&id=${order.receipt}`;
    });

    rzp1.open();
}

function verifyPayment(payment, order) {
    console.log(payment);   
    console.log(order);
    $.ajax({

        url: '/verifypayment',
        method: "post",
        data: {
            payment,
            order
        },
        success: function (response) {
            if (response.success) {
                window.location.href = '/userorder'
            }
        },
        error: function (err) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Online payment is not fulfilled. Your payment is pending.',
                timer: 3000, // 3000 milliseconds
                showConfirmButton: false
            }).then(function () {
                // Redirect to the previous page or perform other actions after alert is closed
                window.location.href="/"
            });
        }
    })
}