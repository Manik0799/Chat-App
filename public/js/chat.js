const socket= io()

// Rendering messages
const $messages= document.getElementById("messages")
// message template
const messageTemplate= document.getElementById("message-template").innerHTML
// Location template
const locationTemplate= document.getElementById("location-template").innerHTML
// Sidebar Template
const sidebarTemplate= document.getElementById("sidebar-template").innerHTML

// Options
const { username, room }= Qs.parse(location.search, {ignoreQueryPrefix : true})

const $messageForm= document.getElementById("message-form")
const $messageFormInput= document.querySelector("input")
const $messageFormButton= document.querySelector("button")
const $shareLocationButton= document.getElementById("send-location")

// Autoscroll feature
const autoscroll= () => {
    // New message element
    const $newMessage= $messages.lastElementChild

    // New message height
    const newMessageStyles= getComputedStyle($newMessage)
    const newMessageMargin= parseInt(newMessageStyles.marginBottom)
    const newMessageHeight= $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight= $messages.offsetHeight

    // Height of messages container
    const containerHeight= $messages.scrollHeight

    // How far have we scrolled ?
    const scrollOffset= ($messages.scrollTop + visibleHeight) * 2

    if(containerHeight - newMessageHeight < scrollOffset){
        $messages.scrollTop= $messages.scrollHeight
    }

}

socket.on("message", (message) => {

    const html= Mustache.render(messageTemplate, {
        // Data for the template
        username : message.user,
        message : message.text,
        createdAt : moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})


$messageForm.addEventListener("submit", (e) => {

    e.preventDefault()
    // Disabling the send button
    $messageFormButton.setAttribute("disabled", "disabled")

    const message= e.target.elements.message.value

    socket.emit("sendMessage", message, (error) => {

        // Enabling the send button
        $messageFormButton.removeAttribute("disabled")
        // Clearing the input and bringing the focus to the input
        $messageFormInput.value=""
        $messageFormInput.focus()

        if(error){
            return alert(error)
        }
        console.log("Message Delivered !")
    })
})


// sending location 
$shareLocationButton.addEventListener("click", () => {

    if(!navigator.geolocation){
        return alert("Geolocation not supported by the browser!")
    }
    
    // Disabling the button
    $shareLocationButton.setAttribute("disabled", "disabled")

    navigator.geolocation.getCurrentPosition((position) => {
        const location= {
            lat : position.coords.latitude,
            long : position.coords.longitude
        }
        socket.emit("sendLocation", location, () => {
            console.log("Location Shared !")
            // Enabling the button
            $shareLocationButton.removeAttribute("disabled")
        })
    })
})

socket.on("locationmessage", (url) => {
    const html= Mustache.render(locationTemplate, {
        username : url.user,
        url : url.text,
        createdAt : moment(url.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("roomData", ({room, users}) => {
    const html= Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById("sidebar").innerHTML= html
})

socket.emit("join" , { username, room }, (error) => {
    if(error){
        alert(error)
        location.href= "/"
    }
})