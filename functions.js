function popupInput(inputText, errorText, cb) {
    const inputResponse = prompt(inputText);
    if (inputResponse !== null && inputResponse !== "") {
        if (cb) {
            cb(inputResponse);
        }
        else {
            return inputResponse;
        }
    }
    else {
        if (errorText || errorText != null) {
            alert(errorText);
            return;
        }
    }
}

function generateREF() {
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    var ref = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return ref;
}

function getCopyrightYear() {
    var currentYear = new Date().getFullYear();
    var copyrightYear = currentYear > 2023 ? "2023 - " + currentYear : "2023";
    return copyrightYear;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function fetchData(url, authorized, authorizer) {
    try {
        const extra_headers = authorized ? { Authorization: `Bearer ${authorizer}` } : {};
        const response = await axios.get(url, { headers: extra_headers });
        // Handle the response data
        return response.data;
    } catch (error) {
        console.error(error);
        // Handle errors
    }
}

async function postData(url, data, authorized, authorizer) {
    try {
        const extra_headers = authorized ? { Authorization: `Bearer ${authorizer}` } : {};
        const response = await axios.post(url, data, { headers: extra_headers });
        // Handle the response data
        return response.data;
    } catch (error) {
        console.error(error);
        // Handle errors
    }
}

function setStorage(key, value) {
    window.localStorage.setItem(key, value);
}

function getStorage(key) {
    return window.localStorage.getItem(key);
}

function removeStorage(key) {
    window.localStorage.removeItem(key);
}

function removeAllStorage() {
    window.localStorage.clear();
}

function convertToKobo(amount) {
    return amount * 100;
}

function convertToNaira(amount) {
    return amount / 100;
}

function updateWalletBalance(amount) {
    const currentBal = getStorage(WALLET_BALANCE_KEY) ?? 0;
    const newBalance = Number.parseFloat(currentBal) + amount;
    setStorage(WALLET_BALANCE_KEY, newBalance);
    $(".wallet-balance-amt").html(numberWithCommas(Number.parseFloat(newBalance)));
}

function updateWalletBalanceDecrease(amount) {
    const currentBal = getStorage(WALLET_BALANCE_KEY) ?? 0;
    const newBalance = Number.parseFloat(currentBal) - amount;
    setStorage(WALLET_BALANCE_KEY, newBalance);
    $(".wallet-balance-amt").html(numberWithCommas(Number.parseFloat(newBalance)));
}