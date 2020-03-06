import detectElementOverflow  from './node_modules/detect-element-overflow/dist/esm/index.js';


const containerChain = ['c1','c2','c3','c4']



document.addEventListener("DOMContentLoaded", function(){
// For migration to react:
// The property of scrollHeight can only be valid after dom tree rendering (not react rendering)
// -> this belongs to componentDidUpdate()
    for( let i=0; i<containerChain.length-1; i++ )
    {
        const c1 = document.getElementById(containerChain[i])
        const c2 = document.getElementById(containerChain[i+1])
        layout( c1, c2 )
    }

});

function layout( c1, c2) {
    let i=0;
    
    while(c1.scrollHeight>c1.clientHeight && i < 30)
    {
        c2.prepend( c1.lastChild )
        i++;
    }
    

}