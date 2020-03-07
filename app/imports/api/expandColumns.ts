


export async function expandColumns(element: Node, maxIterations = 10,
    specialClass?: (idx: number) => string) {

    const stencil = element.cloneNode();
    let lastElement = element;

    if (typeof specialClass == 'function') {
        lastElement.classList.add( specialClass(0) )
    }
    for (let i = 1; isVerticalOverflow(lastElement) && i <= maxIterations; i++) {
        // @ts-ignore
        const clone: HTMLElement = stencil.cloneNode();
        clone.id = "artificialColumn" + i;
        if (typeof specialClass == 'function') {
            clone.classList.add( specialClass(i) )
        }
        lastElement.parentElement.append(clone);

        await layout(lastElement, clone, maxIterations * 5)

        lastElement = clone;
    }




};

async function layout(c1, c2, maxIterations) {

    for (let i = 0; isVerticalOverflow(c1) && i < 30; i++) {
        c2.scrollIntoView()
        // await Sleep(500);
        c2.prepend(c1.lastChild)
    }

}

export function increaseHeaderSpan( element: HTMLElement, maxIterations=10 ): number {
  let spanHeader;
  for( let i=0; (isVerticalOverflow(element) || isHorizontalOverflow(element) ) && i<maxIterations; i++) {
    const num = getComputedStyle(element).getPropertyValue('--spanHeader');
    spanHeader = parseInt(num);
    element.parentElement.style.setProperty('--spanHeader', ""+(spanHeader+1));
  }
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
