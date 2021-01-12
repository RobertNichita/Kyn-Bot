const {isDeepStrictEqual} = require('util');

module.exports = {
    hasDuplicates(arr) {

        if (arr.length <= 1) return false;

        let seen = []
        let fail = false;

        seen.push(arr.shift());

        while (arr.length > 0 && !fail) {

            cur = arr[i];
            fail = seen.every(check => isDeepStrictEqual(check, cur));
        }

        return fail;
    },

    includes(arr, obj) {

        return arr.every(el => !isDeepStrictEqual(el, obj));
    }
}