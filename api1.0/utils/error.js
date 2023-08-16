module.exports = {
    inputEmpty: (res) => {
        res.status(400).json({ error: 'Client error - Input feild should not be empty' });
    },
    wrongEmail: (res) => {
        res.status(400).json({ error: 'Client error - Invalid email address.' });
    },
    duplicateEmail: (res) => {
        res.status(400).json({ error: 'Client error - It should not be possible to register with a duplicate email.' })
    },
    taskNotExist: (res) => {
        res.status(400).json({ error: 'Client error - Post is not exist' });
    },
    noToken: (res) => {
        res.status(401).json({ error: 'Client error - No token provided' });
    },
    noUser: (res) => {
        res.status(403).json({ error: 'Client error - User Not Found' })
    },
    wrongPassword: (res) => {
        res.status(403).json({ error: 'Client error - Wrong Password' });
    },
    wrongToken: (res) => {
        res.status(403).json({ error: 'Client error - Invalid token' });
    },
    dbConnection: (res) => {
        res.status(500).json({ error: 'Server error - connecting to db failed' });
    },
    queryFailed: (res) => {
        res.status(500).json({ error: 'Server error - query failed' });
    },
    userNotFound: (res) =>{
        res.status(400).json({ error: 'user not found' });
    }
}