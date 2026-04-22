import React from 'react';
import Swal from "sweetalert2";

function CustomToast (icon,title){
    console.log(icon,title);
    return(
        Swal.fire({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            icon: icon,
            title: title,
        }));
};

export default CustomToast;