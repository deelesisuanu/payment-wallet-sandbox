const applicationData = [];

// const applicationData = [{
//     generated_reference: '',
//     payment_response_card: {},
// }];

let nigerianBanks = [];

$(document).ready(function () {

    // alert('We don\'t store any information, you can read the source.');

    // setting copyright
    $(".pay-copyright").html(`&copy; ${getCopyrightYear()}`);
    $(".banks-div-paystack").hide();

    // toggle load nigerian banks
    $(".toggle-load-bank-list-paystack").on("click", async function () {
        $(".banks-div-paystack").toggle();
        // check if div is showing
        if ($('.banks-div-paystack').is(':visible')) {
            const bankListData = await fetchPaystackBanks();
            const bankList = bankListData.data;
            nigerianBanks = bankList;
            for (var i = 0; i < bankList.length; i++) {
                const bank = bankList[i];
                const bankName = bank.name ?? 'No Bank Name';
                const singleBank = `<span style="color: black; border: none; border-radius: 4px; margin: 5px !important;">|${bankName}|</span>`;
                $(".banks-div-paystack").append(singleBank);
            }
        }
        else {
            $(".banks-div-paystack").html('');
        }
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
        popupInput('Enter the amount you wish to withdraw', 'Unable to process Prompt', (amount) => {
            alert(amount);
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
});
