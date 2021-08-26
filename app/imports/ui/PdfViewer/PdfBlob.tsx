import * as React from 'react'
import { FunctionComponent, memo } from 'react'

const PdfObject: FunctionComponent<{url: string}> = memo( ({url}) => {
  return <object data={url} width="100%" height="100%" type="application/pdf">
  </object>
})
PdfObject.displayName = 'PdfObject'


export const PdfBlob: FunctionComponent<React.PropsWithChildren<{ url: string }>> = ({url}) => {

  const pdfs = <PdfObject url={url} />

  return <div className="pdfgrid">{pdfs}</div>
}
