function manageAddresses(element,divId) {
   
    fetch('/manageaddress', {
        method: 'GET'
    }).then(response => {
        
    }).catch(error => {
        console.error('Error:', error);
    });
    var listItems = document.querySelectorAll('.list-group-item');
    listItems.forEach(function(item) {
        item.classList.remove('active');
    });

    
    element.classList.add('active');

    var cardBody = document.querySelector('.card-body-main');
    cardBody.style.display = 'none';

    var divs = document.querySelectorAll('.hidden-div');
    divs.forEach(function(div) {
        div.style.display = 'none';
    });
    
    var divToShow = document.getElementById(divId);
    if (divToShow) {
        divToShow.style.display = 'block';
    }
    
}

function showDivAndSendGet(element,url) {
   
    var divs = document.querySelectorAll('.hidden-div');
    divs.forEach(function(div) {
        div.style.display = 'none';
    });

    var cardBody = document.querySelector('.card-body-main');
    cardBody.style.display = 'none';

   
    var profileDiv = document.getElementById('div1');
    profileDiv.style.display = 'block';
    
    var listItems = document.querySelectorAll('.list-group-item');
    listItems.forEach(function(item) {
        item.classList.remove('active');
    });

    element.classList.add('active');

   
    fetch(url, {
        method: 'GET'
    }).then(response => {
       
    }).catch(error => {
        console.error('Error:', error);
    });
}

// function confirmDelete(addressId) {
//     if (confirm("Are you sure you want to delete this address?")) {
//         deleteAddress(addressId);
//     }
// }

// function deleteAddress(addressId) {
    
//     fetch(`/deleteAddress/${addressId}`, {
//         method: 'DELETE',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//     })
//     .then(response => {
//         if (response.ok) {
            
//             Toastify({
//                 text: "Address deleted successfully!",
//                 duration: 3000, 
//                 backgroundColor: "green",
//                 position: "center",
//             }).showToast();
            
            
//             setTimeout(() => {
//                 window.location.href = "/profile";
//             }, 3000);
//         } else {
//             throw new Error('Network response was not ok.');
//         }
//     })
//     .catch(error => {
//         console.error('There was a problem with the fetch operation:', error);
//         alert("Error deleting address. Please try again later.");
//     });
// }

function confirmDelete(addressId){
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
                url: "/deleteAddress/" + `${addressId}`,
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


function selectAddress(addressId) {
    console.log("hello");
    
    fetch(`/getaddress/${addressId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
          
            console.log(data);
            window.location.reload();
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}