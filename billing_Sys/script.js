let subTotal = 0;

// Auto Date
document.getElementById("date").innerText = new Date().toLocaleDateString();

function addItem() {
    let item = document.getElementById("item").value;
    let qty = Number(document.getElementById("qty").value);
    let price = Number(document.getElementById("price").value);

    if (item === "" || qty === 0 || price === 0) {
        alert("Fill all item details");
        return;
    }

    let total = qty * price;
    subTotal += total;

    let row = `
        <tr>
            <td>${item}</td>
            <td>${qty}</td>
            <td>${price}</td>
            <td>${total.toFixed(2)}</td>
        </tr>
    `;

    document.getElementById("billBody").innerHTML += row;
    calculateGST();

    document.getElementById("item").value = "";
    document.getElementById("qty").value = "";
    document.getElementById("price").value = "";
}

function calculateGST() {
    let cgst = subTotal * 0.09;
    let sgst = subTotal * 0.09;
    let grandTotal = subTotal + cgst + sgst;

    document.getElementById("subTotal").innerText = subTotal.toFixed(2);
    document.getElementById("cgst").innerText = cgst.toFixed(2);
    document.getElementById("sgst").innerText = sgst.toFixed(2);
    document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);
}

function downloadPDF() {
    let invoice = document.getElementById("invoice");
    html2pdf().from(invoice).save("Invoice.pdf");
}

function printInvoice() {
    window.print();
}

function showPage(page) {
    document.querySelector('.container').style.display = page === 'billing' ? 'block' : 'none';
    document.getElementById('calculatorPage').style.display = page === 'calculator' ? 'block' : 'none';
}

let expression = "";

function showPage(page) {
    document.querySelectorAll(".container").forEach(c => c.style.display = "none");

    if (page === "calculator") {
        document.getElementById("calculatorPage").style.display = "block";
    } else {
        document.getElementById("billingPage").style.display = "block";
    }
}

/* Calculator logic */
function press(value) {
    expression += value;
    document.getElementById("calcDisplay").value = expression;
}

function calculateResult() {
    try {
        expression = eval(expression).toString();
        document.getElementById("calcDisplay").value = expression;
    } catch {
        document.getElementById("calcDisplay").value = "Error";
        expression = "";
    }
}

function clearCalc() {
    expression = "";
    document.getElementById("calcDisplay").value = "";
}

