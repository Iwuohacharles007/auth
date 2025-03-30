module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next); // pass errors to the next middleware
    };
};
