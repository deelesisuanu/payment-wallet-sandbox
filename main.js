const applicationData = [];

// const applicationData = [{
//     generated_reference: '',
//     payment_response_card: {},
// }];

const supportedCurrencies = ['Kobo', 'Naira'];

let nigerianBanks = [];
const transactionHistory = [];
let walletBalance = 0;
const WALLET_BALANCE_KEY = 'pws_wallet_key';
const WALLET_TRANSACTION_KEY = 'pws_wallet_transaction_key';

$(document).ready(function () {

    // TODO:
    // alert('We don\'t store any information, you can read the source.');

    // setting copyright
    $(".pay-copyright").html(`&copy; ${getCopyrightYear()}`);
    $(".banks-div-paystack").hide();
    $(".transactions-div").hide();
    $(".converter-div").hide();

    const currentBalance = getStorage(WALLET_BALANCE_KEY);
    if (!currentBalance) {
        setStorage(WALLET_BALANCE_KEY, 0);
    }

    $(".wallet-balance-amt").html(numberWithCommas(Number.parseFloat(currentBalance ?? 0)));

    // toggle show converter
    $(".toggle-show-converter").on("click", async function () {
        $(".converter-div").toggle();
    });

    // toggle load tranactions list
    $(".toggle-load-transaction-list").on("click", async function () {
        $(".transactions-div").toggle();
        // check if div is showing
        if ($('.transactions-div').is(':visible')) {
            let transactionList = getStorage(WALLET_TRANSACTION_KEY) ?? [];
            if (transactionList) {
                transactionList = transactionList.length > 0 ? JSON.parse(transactionList) : [];
            }
            else {
                transactionList = [];
            }

            console.log(transactionList);

            let tranactionData = `<table class="table table-striped">
            <thead class="thead-dark">
              <tr>
                <th>S/No.</th>
                <th>Amount - Amount in Kobo</th>
                <th>Generate Ref</th>
                <th>Payment Means</th>
                <th>Payment Provider</th>
                <th>Transaction Status</th>
                <th>Payment Type</th>
                <th>Transaction Type</th>
              </tr>
            </thead>
            <tbody>`;
            for (var i = 0; i < transactionList.length; i++) {
                const transaction = transactionList[i];
                const singleTransaction = `<tr>
                <td>${i + 1}</td>
                <td>${numberWithCommas(Number.parseFloat(transaction.amount))} - ${numberWithCommas(Number.parseFloat(transaction.amountinkobo))}</td>
                <td>${transaction.generated_reference}</td>
                <td>${transaction.payment_means}</td>
                <td>${transaction.payment_provider}</td>
                <td>${transaction.transaction_status}</td>
                <td>${transaction.payment_type ?? 'credit'}</td>
                <td>${transaction.transaction_type ?? 'fund_wallet'}</td>
              </tr>`;
                tranactionData += singleTransaction;
            }
            tranactionData += `</tbody></table>`;
            $(".transactions-div").html(tranactionData);
        }
        else {
            $(".transactions-div").html('');
        }
    });

    // toggle load nigerian banks
    $(".toggle-load-bank-list-paystack").on("click", async function () {
        $(".banks-div-paystack").toggle();
        // check if div is showing
        if ($('.banks-div-paystack').is(':visible')) {
            let bankData = `<table class="table table-striped">
            <thead class="thead-dark">
              <tr>
                <th>S/No.</th>
                <th>Bank Name</th>
                <th>Bank Code</th>
              </tr>
            </thead>
            <tbody>`;

            if (nigerianBanks.length <= 0) {
                const bankListData = await fetchPaystackBanks();
                const bankList = bankListData.data;
                nigerianBanks = bankList;
            }

            for (var i = 0; i < nigerianBanks.length; i++) {
                const bank = nigerianBanks[i];
                const bankName = bank.name ?? 'No Bank Name';
                const singleBank = `<tr>
                <td>${i + 1}</td>
                <td>${bankName}</td>
                <td>${bank.code}</td>
              </tr>`;
                bankData += singleBank;
            }

            bankData += `</tbody></table>`;
            $(".banks-div-paystack").html(bankData);

        }
        else {
            $(".banks-div-paystack").html('');
        }
    });

    $(".process-converter-btn").on("click", function () {

        const amount = $("#converterSetAmount").val();
        const fromCurrency = $("#converterStartCurrency").val();
        const toCurrency = $("#converterEndCurrency").val();

        if (!amount || amount == "") {
            window.alert('Please enter amount to convert');
            return;
        }

        if (!fromCurrency || fromCurrency == "") {
            window.alert('Please select starting currency to convert');
            return;
        }

        if (!toCurrency || toCurrency == "") {
            window.alert('Please select end currency to convert');
            return;
        }

        if (fromCurrency == toCurrency) {
            window.alert('You cannot have the same value for from and to currency.');
            return;
        }

        if (!supportedCurrencies.includes(fromCurrency) || !supportedCurrencies.includes(toCurrency)) {
            window.alert('You have selected some unsupported currencies.');
            return;
        }

        let amountConverted = 0;

        if (fromCurrency == 'Kobo' && toCurrency == 'Naira') {
            amountConverted = convertToNaira(amount);
        }

        if (fromCurrency == 'Naira' && toCurrency == 'Kobo') {
            amountConverted = convertToKobo(amount);
        }

        if (amountConverted == 0) {
            window.alert('We were unable to convert the amount entered, please try again.');
            return;
        }

        $(".converter-message-div").html(`${numberWithCommas(amount)} ${fromCurrency} is ${numberWithCommas(amountConverted)} ${toCurrency}`);


    });

    $(".fund-with-card").on("click", function () {
        const provider = $(this).attr("data-provider");
        alert(`Funding with card on: ${provider}`);

        const promptText = provider == 'paystack' ? 'Enter the amount in kobo you wish to fund with card' : 'Enter the amount you wish to fund with card';

        popupInput(promptText, 'Unable to process Prompt', (amount) => {
            const emailAddress = popupInput('Enter Email Address', 'Unable to process Reference');
            const firstName = popupInput('Enter First Name', 'Unable to process Reference');
            const lastName = popupInput('Enter Last Name', 'Unable to process Reference');
            let reference = popupInput('Enter Reference, Leave empty for the system to generate automatically');
            throwError('Email Address', emailAddress);
            throwError('First Name', firstName);
            throwError('Last Name', lastName);
            if (reference == null || reference == "") {
                reference = generateREF();
            }
            if (provider == 'paystack') {
                const paystackPubKey = popupInput('Enter Paystack Public Key', 'Unable to process your public key');
                throwError('Paystack Public Key', paystackPubKey);
                processPaystackPayCard(paystackPubKey, emailAddress, firstName, lastName, reference, amount);
            }
        });
    });

    $(".fund-with-transfer").on("click", function () {
        const provider = $(this).attr("data-provider");
        alert(`Funding with Transfer on: ${provider}`);
        if (nigerianBanks.length <= 0) {
            alert('You need to click on the Toggle Banks Button to continue');
            return;
        }
        popupInput('Enter the amount you wish to fund with transfer', 'Unable to process Prompt', (amount) => {
            const accountNumber = popupInput('Enter Account Number', 'Unable to process Account Number');
            const accountName = popupInput('Enter Account Name', 'Unable to process Account Name');
            const bankName = popupInput('Enter Bank Name. You may get an error if you do not choose any of our designated bank list', 'Unable to process Bank Name');
            throwError('Account Number', accountNumber);
            throwError('Account Name', accountName);
            throwError('Bank Name', bankName);
            processPaystackPayTransfer(bankName, accountName, accountNumber, amount);
        });
    });

    $(".withdraw-from-wallet").on("click", function () {
        const provider = $(this).attr("data-provider");
        alert(`Withdrawing from wallet with: ${provider}`);
        popupInput('Enter the amount you wish to withdraw', 'Unable to process Prompt', async (amount) => {

            let transactionData = getStorage(WALLET_TRANSACTION_KEY) ?? [];
            transactionData = transactionData.length > 0 ? JSON.parse(transactionData) : [];

            amount = Number.parseFloat(amount);

            let currentBalance = getStorage(WALLET_BALANCE_KEY);
            currentBalance = Number.parseFloat(currentBalance) ?? 0;

            if (currentBalance < amount) {
                window.alert('We are unable to complete this transaction, Insufficient Funds.');
                return;
            }

            const accountNumber = popupInput('Enter Account Number', 'Unable to process Account Number');
            const accountName = popupInput('Enter Account Name', 'Unable to process Account Name');
            const bankName = popupInput('Enter Bank Name. You may get an error if you do not choose any of our designated bank list', 'Unable to process Bank Name');
            throwError('Account Number', accountNumber);
            throwError('Account Name', accountName);
            throwError('Bank Name', bankName);

            if (provider == 'paystack') {
                const paystackSecretKey = popupInput('Enter Paystack Secret Key', 'Unable to process your secret key');
                throwError('Paystack Secret Key', paystackSecretKey);
                const transferRecipient = await createPaystackTransferRecipient(accountName, accountNumber, bankName, paystackSecretKey);
                if (!transferRecipient) {
                    window.alert('Unable to complete this withdrawal, Could not create transfer recipient');
                    return;
                }
                const transfer = await createPaystackTransfer('PROCESS FUNDS TEST', amount, transferRecipient.data.recipient_code, paystackSecretKey);
                if (!transfer) {
                    window.alert('Unable to complete this withdrawal, Could not create transfer');
                    return;
                }
                const object = {
                    amountinkobo: convertToKobo(amount),
                    amount: amount,
                    generated_reference: transfer.data.reference,
                    payment_response_card: transfer.data,
                    payment_means: 'balance',
                    payment_provider: 'paystack',
                    transaction_status: transfer.data.status,
                    payment_type: 'debit',
                    transaction_type: 'withdraw_funds',
                };
                transactionData.push(object);
                setStorage(WALLET_TRANSACTION_KEY, JSON.stringify(transactionData));
                if (transfer.data.status == 'success') {
                    updateWalletBalanceDecrease(amount);
                }
                window.alert('Transaction initiated successfully.');
                window.alert('You may need to verify the transaction by reference (withdrawal) if your balance is yet to be updated.');
            }

        });
    });

    $(".check-transaction-by-ref-card").on("click", function () {
        const provider = $(this).attr("data-provider");
        alert(`Checking transaction by reference (Card) for: ${provider}`);
        popupInput('Enter the reference you wish to check for', null, (ref) => {
            let genRef = ref;
            if (!ref) {
                const index = applicationData.findIndex(item => item.payment_provider === provider && item.payment_means === 'card');
                genRef = applicationData[index].generated_reference;
            }
            alert(genRef);
        });
    });

    $(".check-transaction-by-ref-withdrawal").on("click", function () {
        const provider = $(this).attr("data-provider");
        alert(`Checking transaction by reference (Withdrawal) for: ${provider}`);
        popupInput('Enter the reference you wish to check for', 'Please enter a valid reference to check response', async (ref) => {
            let transactionData = getStorage(WALLET_TRANSACTION_KEY) ?? [];
            transactionData = transactionData.length > 0 ? JSON.parse(transactionData) : [];

            if (provider == 'paystack') {
                const paystackSecretKey = popupInput('Enter Paystack Secret Key', 'Unable to process your secret key');
                throwError('Paystack Secret Key', paystackSecretKey);

                const verifiedTransaction = await verifyPaystackTransfer(ref, paystackSecretKey);
                const transferIndex = transactionData.findIndex(item => item.payment_provider === provider && item.payment_means === 'balance' && item.payment_type === 'debit' && item.transaction_type === 'withdraw_funds');
                if (transferIndex !== -1) {
                    if (verifiedTransaction.data.status != transactionData[transferIndex].transaction_status) {
                        transactionData[transferIndex].transaction_status = verifiedTransaction.data.status;
                        $(".toggle-load-bank-list-paystack").toggle();
                        let currentBalance = getStorage(WALLET_BALANCE_KEY);
                        currentBalance = Number.parseFloat(currentBalance) ?? 0;
                        if (currentBalance < transactionData[transferIndex].amount) {
                            window.alert('We are unable to complete this transaction, Insufficient Funds.');
                            return;
                        }
                        updateWalletBalanceDecrease(transactionData[transferIndex].amount);
                    }
                }
            }
        });
    });

    $(".clear-my-wallet-balance").on("click", function () {
        const shouldClear = window.confirm('Clearing this also clears your transaction history as well');
        if (shouldClear) {
            removeStorage(WALLET_BALANCE_KEY);
            removeStorage(WALLET_TRANSACTION_KEY);
            const currentBal = getStorage(WALLET_BALANCE_KEY) ?? 0;
            $(".wallet-balance-amt").html(numberWithCommas(Number.parseFloat(currentBal)));
        }
        else {
            alert('You have accept to clear the wallet balance and transaction history!');
        }
    });
});
