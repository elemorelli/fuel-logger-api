const passwordValidator = require('owasp-password-strength-test');

// TODO: Populate with blacklisted words
const blacklistedWords = [
    'password', 'qwerty'
];

passwordValidator.config({
    minLength: 8
});

passwordValidator.tests.required.push((password) => {
    const formattedPassword = password.toLowerCase();

    const hasABlacklistedWord = blacklistedWords.some((word) => {
        return formattedPassword.includes(word);
    });

    if (hasABlacklistedWord) {
        return 'The password has a commonly used word.';
    }
});

module.exports = passwordValidator;