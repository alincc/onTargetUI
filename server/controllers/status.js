function status(req, res) {
    res.send('Ontarget UI node server is running fine');
}

module.exports = {
    status:status
};