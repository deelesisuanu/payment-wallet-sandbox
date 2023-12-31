function payWithPaystack(validatedemail, amountinkobo, firstname, lastname, ref, public_key) {
    const handler = PaystackPop.setup({
        key: public_key,
        email: validatedemail,
        firstname: firstname,
        lastname: lastname,
        amount: amountinkobo,
        ref: ref,
        callback: function (response) {
            console.log(response);
            let transactionData = getStorage(WALLET_TRANSACTION_KEY) ?? [];
            transactionData = transactionData.length > 0 ? JSON.parse(transactionData) : [];
            if (response.status == 'success' && response.message == 'Approved') {
                const amountSet = convertToNaira(amountinkobo);
                updateWalletBalance(amountSet);
            }
            const object = {
                amountinkobo: Number.parseFloat(amountinkobo),
                amount: convertToNaira(Number.parseFloat(amountinkobo)),
                generated_reference: ref,
                payment_response_card: response,
                payment_means: 'card',
                payment_provider: 'paystack',
                transaction_status: response.status,
                payment_type: 'credit',
                transaction_type: 'fund_wallet',
            };
            transactionData.push(object);
            setStorage(WALLET_TRANSACTION_KEY, JSON.stringify(transactionData));
        },
        onClose: function () {
            // Visitor cancelled payment
            alert('Cancelled. Please click the \'Pay\' button to try again');
        }
    });
    handler.openIframe();
}

async function fetchPaystackBanks(currency) {
    const banks = await fetchData(`https://api.paystack.co/bank?currency=${currency ?? 'NGN'}`, false);
    return banks;
}

async function createPaystackTransferRecipient(account_name, account_number, bank, secret_key) {
    const objectTrans = {
        type: 'nuban',
        name: account_name,
        account_number: account_number,
        bank_code: bank.code,
        currency: 'NGN',
    };
    const transferRecipient = await postData(`https://api.paystack.co/transferrecipient`, objectTrans, true, secret_key);
    return transferRecipient;
}

async function createPaystackTransfer(reason, amount, recipient, secret_key) {
    const objectTrans = {
        source: 'balance',
        reason: reason,
        amount: `${amount}00`,
        reference: generateREF(),
        recipient: recipient,
    };
    const transfer = await postData(`https://api.paystack.co/transfer`, objectTrans, true, secret_key);
    return transfer;
}

async function verifyPaystackAccountNumber(account_number, bank_code, secret_key) {
    const accountVerified = await fetchData(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, true, secret_key);
    return accountVerified;
}

async function verifyPaystackTransfer(reference, secret_key) {
    const transferData = await fetchData(`https://api.paystack.co/transfer/verify/${reference}`, true, secret_key);
    return transferData;
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