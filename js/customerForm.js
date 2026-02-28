function updateCustomerProgress() {
    const name = document.getElementById("cust-name").value.trim() ? 1 : 0;
    const address = document.getElementById("cust-address").value.trim() ? 1 : 0;
    const phone = document.getElementById("cust-phone").value.trim() ? 1 : 0;
    const email = document.getElementById("cust-email").value.trim() ? 1 : 0;
    const completed = name + address + phone + email;
    const badge = document.getElementById("cust-badge");
    badge.textContent = completed + "/4";
    badge.classList.toggle("incomplete", completed !== 4);
}
