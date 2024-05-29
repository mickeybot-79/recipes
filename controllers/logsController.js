const { format } = require('date-fns')
const Log = require('../model/Log')

const handleLogEntries = async (req, res) => {
    const { activity, recipeID, userID } = req.body
    const date = new Date()
    try {
        await Log.create({
            timestamp: date.getTime(),
            activity: activity,
            recipeID: recipeID,
            userID: userID
        })
        res.sendStatus(201)
    } catch (err) {
        res.status(500).json({'message': err.message})
    }
}

const getLogs = async (req, res) => {
    const { userID, logsSlice } = req.body
    const logs = await Log.find()
    const finalLogs = logs.sort((a, b) => b.timestamp - a.timestamp).filter(entry => entry.userID === userID)
    const logsLength = finalLogs.length
    if (logsSlice) {
        const slicedLogs = finalLogs.slice(0, logsSlice)
        //console.log(slicedLogs.length)
        res.status(200).json({'logs': slicedLogs, 'length': logsLength})
    } else {
        res.status(200).json({'logs': finalLogs, 'length': logsLength})
    }
}

const removeRecipeLogs = async (req, res) => {
    const { recipeID } = req.body
    const logs = await Log.find()
    const logsToDelete = logs.filter(log => log.recipeID === recipeID)
    for (let i = 0; i < logsToDelete.length; i++) {
        await Log.deleteOne({ _id: logsToDelete[i]._id })
    }
    res.status(200).json({'message': 'success'})
}

const deleteLogEntry = async (req, res) => {
    const { logID } = req.body
    const result = await Log.deleteOne({ _id: logID })
    res.status(200).json({'result': result})
}

const deleteUserLogs = async (userID) => {
    const logs = await Log.find()
    for (let i = 0; i < logs.length; i++) {
        if (logs[i].userID === userID) {
            Log.deleteOne({ _id: logs[i]._id })
        }
    }
}

const testTest = async (req, res) => {
    res.status(200).json('test')
    //res.send('test')
}

module.exports = { handleLogEntries, getLogs, removeRecipeLogs, deleteLogEntry, deleteUserLogs, testTest }
