module.exports = {
    input: (res) => {
        res.status(400).json({ error: 'Client error - input feild should not be empty' });
    },
    taskNotExist: (res) => {
        res.status(400).json({ error: 'Post is not exist' });
    },
    dbConnection: (res) => {
        res.status(500).json({ error: 'Server error - connecting to db failed' });
    },
    query: (res) => {
        res.status(500).json({ error: 'Server error - query failed' });
    }
}