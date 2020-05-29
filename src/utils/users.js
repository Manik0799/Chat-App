const users=[]

// Adding a user to a room
const addUser= ({id, username, room}) => {
    // Clean data
    username= username.trim().toLowerCase()
    room= room.trim().toLowerCase()

    // Validate data
    if(!username || !room){
        return{
            error : "Username and Room required for joining the chat room"
        }
    }
    // Checking for uniqueness of username in a room
    const existingUser= users.find((user) => {
        return user.room===room && user.username===username
    })

    if(existingUser){
        return{
            error : "Username already in use"
        }
    }

    // Store user
    const user= {id, username, room}
    users.push(user)
    return { user }
}

// To remove a user by their Id
const removeUser= (id) => {
    const index= users.findIndex((user) => {
        return user.id===id
    })

    if(index!==-1){
        return users.splice(index, 1)[0]
    }
}

// Get a user by their Id
const getUser= (id) => {

    const user= users.find((user) => {
        return user.id===id
    })
    if(!user){
        return undefined
    }

    return user
}

// Get users in a room
const getUsersInRoom= (room) => {
    room= room.trim().toLowerCase()
    const memberUsers= users.filter((user) => {
        return user.room===room
    }) 
    if(memberUsers.length===0){
        return{
            error : "No members found !"
        }
    }
    return memberUsers
}

module.exports= {
    addUser, removeUser, getUser, getUsersInRoom
}