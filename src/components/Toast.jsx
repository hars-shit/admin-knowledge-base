import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ReactSwal = withReactContent(Swal);

export const showSuccessToast = (message) => {
  ReactSwal.fire({
    title: "Success",
    text: message,
    icon: "success",
    confirmButtonColor: "#ff6f3c",
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: false, // false for centered modal
    position: "center", // center of the screen
    backdrop: true, // dim background
    customClass: {
      popup: "rounded-lg shadow-lg p-5", // optional styling for nicer look
    },
  });
};

export const showErrorToast = (message) => {
  ReactSwal.fire({
    title: "Error",
    text: message,
    icon: "error",
    confirmButtonColor: "#ff6f3c",
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: false, // false for centered modal
    position: "center",
    backdrop: true,
    customClass: {
      popup: "rounded-lg shadow-lg p-5",
    },
  });
};
