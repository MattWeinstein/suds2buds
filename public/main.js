if (window.location.pathname === '/') {
    document.querySelector('#deleteButton').addEventListener('click', deleteEverything)
}

async function deleteEverything() {
    try {
        const response = await fetch('/beers/', {
            method: 'delete',
            headers: { 'content-type': 'application/json' }
        })
        const data = await response.json()
        location.reload()
    } catch (err) {
        console.log(err)
    }
}
