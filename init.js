module.exports = function () {
    Date.AfterOneHour = () => {
        return new Date(Date.now() + 60 * 60 * 1000);
    }
}