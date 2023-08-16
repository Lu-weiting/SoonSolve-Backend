module.exports = {
    noToken: (res) => {
        res.status(401).json({ error: 'Client error - no token' })
    },
    wrongToken: (res) => {
        res.status(403).json({ error: 'Wrong token' });
    },
    inputEmpty: (res) => {
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
    },
    userNotFound: (res) =>{
        res.status(400).json({ error: 'user not found' });
    }
}