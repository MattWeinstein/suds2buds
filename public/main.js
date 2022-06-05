document.querySelector('#deleteButton').addEventListener('click',deleteEverything)

function deleteEverything(){
    fetch('/beers',{
        method:'delete',
        headers:{'content-type':'application/json'}
    })
}