function isValidNigerianAccountNumber(accountNumber) {
    var nigerianAccountNumberRegex = /^[0-9]{10}$/;
    return nigerianAccountNumberRegex.test(accountNumber);
}

function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function simpleValidInt(data) {
    if (+data === parseInt(data)) {
        return true;
    } else {
        return false;
    }
}

function isValidPaystackPublicKey(public_key) {
    var publicKeyPattern = new RegExp('^pk_(?:test|live)_', 'i');
    return publicKeyPattern.test(public_key);
}

function throwError(key, value) {
    if (value == null || value == "") {
        alert(`${key} is not valid`);
        return null;
    }
}