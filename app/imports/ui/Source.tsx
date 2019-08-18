// mixing default aliasing and normal import does not make sense
import * as React from 'react';
// tslint:disable-next-line:no-duplicate-imports
import { ChangeEvent, ChangeEventHandler } from 'react'

export default class Source extends React.Component<ISourceProps, {}> {

  constructor(props) {
    super(props);
  }

  callUpdateHandler: ChangeEventHandler<HTMLTextAreaElement> = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    if ('updateHandler' in this.props) {
      const pos = ev.target.selectionStart
      const value = ev.target.value
      this.props.updateHandler(value, pos);
    }
  }
  handleText = ev => {
    console.log(ev)
  }

  render() {
    // Height estimation
    const rows = this.props.md.match(/\n/g)

    let nRows: number
    if (rows != null) {
        nRows = rows.length * 1.4 + 10;
    }

    nRows = Math.max(50, nRows);

    const style = {
      // TODO: if still necessary, add media query
        minHeight: nRows + 'em',
    }

    return (
      <div className={"content " + this.props.className}>
          {this.props.children}
        <textarea
          className="container"
          onInputCapture={this.handleText}
          onChange={this.callUpdateHandler}
          value={this.props.md}
          // style={style}
          readOnly={this.props.readOnly}
        />
      </div>
    )
  }
}

interface ISourceProps {
  md: string
  updateHandler: (value: string, pos?: number) => void
  readOnly: boolean
  children: Element
  className: string
};