const button = document.querySelector('.button')

button.addEventListener('click',calculateBudLight)

function calculateBudLight(){
    fetch('/beers',{
        method:'put',
        
    })
}