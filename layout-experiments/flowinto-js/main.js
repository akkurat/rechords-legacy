import detectElementOverflow  from './node_modules/detect-element-overflow/dist/esm/index.js';


const containerChain = ['c1','c2','c3','c4']



document.addEventListener("DOMContentLoaded", async function(){
// For migration to react:
// The property of scrollHeight can only be valid after dom tree rendering (not react rendering)
// -> this belongs to componentDidUpdate()
    let lastElement;
    for( let i=0; i<containerChain.length-1; i++ )
    {
        const c1 = document.getElementById(containerChain[i])
        const c2 = document.getElementById(containerChain[i+1])
        await layout( c1, c2 )

        lastElement = c2;
    }


    for( let i=0; isVerticalOverflow( lastElement ) && i < 10; i++ )
    {
        const clone = lastElement.cloneNode();
        clone.id = "artificialColumn" + i;
        lastElement.parentElement.append( clone );

        await layout( lastElement, clone )

        lastElement = clone;
    }


});

async function layout( c1, c2) {
    
    for(let i=0; isVerticalOverflow(c1) && i < 30; i++)
    {
        c2.scrollIntoView()
        await Sleep(50);
        c2.prepend( c1.lastChild )
    }
    

}

function isVerticalOverflow(c1) {
    return c1.scrollHeight > c1.clientHeight;
}

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
 }
