


/**
 * zero based idx of columns (oppose to css, but this is js)
 */
export function expandColumns(element: Node, maxIterations = 10,
    specialClass?: (idx: number) => string) {

    const stencil = element.cloneNode();
    let lastElement = element;

    if (typeof specialClass == 'function') {
        lastElement.classList.add(specialClass(0))
    }
    for (let i = 1; isVerticalOverflow(lastElement) && i <= maxIterations; i++) {
        // @ts-ignore
        const clone: HTMLElement = stencil.cloneNode();
        clone.id = "artificialColumn" + i;
        if (typeof specialClass == 'function') {
            clone.classList.add(specialClass(i))
        }
        lastElement.parentElement.append(clone);

        layout(lastElement, clone, maxIterations * 5)

        lastElement = clone;
    }




};

function layout(c1, c2, maxIterations) {

    for (let i = 0; isVerticalOverflow(c1) && i < 30; i++) {
        // c2.scrollIntoView()
        // await Sleep(500);
        c2.prepend(c1.lastChild)
    }

}

export function increaseHeaderSpan(element: HTMLElement, maxSpan = 3): number {


    // TODO: fuzzy guessing 


    let i = fitHeaderSpan();

    element.parentElement.style.setProperty('--headerHight', element.firstChild.scrollHeight +'px') 

    // fit again in case multiline makes less span necessary
    i = fitHeaderSpan();


    return i;


    function fitHeaderSpan() {
        const vname = '--spanHeader';
        let i = 1;
        element.parentElement.style.setProperty(vname, "" + (i));
        while ((isVerticalOverflow(element) || isHorizontalOverflow(element)) && i < maxSpan) {
            // await Sleep(500);
            i++;
            element.parentElement.style.setProperty(vname, "" + (i));
        }
        return i;
    }
}
function readCssFloatValue(element: HTMLElement, valueName: string, defaultValu: number = 1) {
    const num = getComputedStyle(element).getPropertyValue(valueName);
    let spanHeader = parseFloat(num);
    spanHeader = Number.isInteger(spanHeader) ? spanHeader + 1 : defaultValu;
    return spanHeader;
}

export function isVerticalOverflow(c1) {
    return c1.scrollHeight > c1.clientHeight;
}
export function isHorizontalOverflow(c1) {
    return c1.scrollWidth > c1.clientWidth;
}

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
