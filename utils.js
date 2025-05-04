// utils.js
function doSomeHeavyTask() {
    return new Promise((resolve) => {
        const delay = Math.floor(Math.random() * 3000) + 1000; // 1s to 4s
        setTimeout(() => {
            resolve(delay);
        }, delay);
    });
}

module.exports = { doSomeHeavyTask };
