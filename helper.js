function payWithPaystack(validatedemail, amountinkobo, firstname, lastname, ref, public_key) {
    var handler = PaystackPop.setup({
        key: public_key,
        email: validatedemail,
        firstname: firstname,
        lastname: lastname,
        amount: amountinkobo,
        ref: ref,
        callback: function (response) {
            var msg = 'Success. The transaction reference is <b>"' + response.trxref + '"</b>';
            const object = {
                generated_reference: ref,
                payment_response_card: response,
                payment_means: 'card',
                payment_provider: 'paystack',
            };
            const index = applicationData.findIndex(item => item.payment_provider === 'paystack' && item.payment_means === 'card');
            if (index !== -1) {
                applicationData[index].generated_reference = ref;
                applicationData[index].payment_response_card = response;
            }
            else {
                applicationData.push(object);
            }
            console.log(response);
            if (response.status == 'success' && response.message == 'Approved') {
                updateWalletBalance(amountinkobo / 100);
            }
        },
        onClose: function () {
            // Visitor cancelled payment
            var msg = 'Cancelled. Please click the \'Pay\' button to try again';
            alert(msg);
        }
    });
    handler.openIframe();
}

async function fetchPaystackBanks(currency) {
    const banks = await fetchData(`https://api.paystack.co/bank?currency=${currency ?? 'NGN'}`, false);
    return banks;
}

function processPaystackPayCard(pubKey, email, fname, lname, ref, amount) {
    if (!isValidPaystackPublicKey(pubKey)) {
        alert('Public Key is not Valid, please try again');
        return;
    }
    if (!isValidEmail(email)) {
        alert('Email Inputted is not Valid, please try again');
        return;
    }
    if (!simpleValidInt(amount)) {
        alert('Amount Inputted is not valid, please try again');
        return;
    }
    payWithPaystack(email, amount, fname, lname, ref, pubKey);
}

function processPaystackPayTransfer(bankName, accountName, accountNumber, amount) {
    if (!nigerianBanks.includes(bankName)) {
        alert('The Bank Name Inputted is not recognized on this system. Press OK to see list of banks on web page');
        return;
    }
    if (!isValidNigerianAccountNumber(accountNumber)) {
        alert('Your Inputted Account Number is not valid');
        return;
    }
}