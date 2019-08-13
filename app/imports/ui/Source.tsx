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
      const value = ev.target.value
      this.props.updateHandler(value);
    }
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
        minHeight: nRows + 'em',
    }

    return (
      <div className={"content " + this.props.className}>
          {this.props.children}
        <textarea
          className="container"
          onChange={this.callUpdateHandler}
          value={this.props.md}
          style={style}
          readOnly={this.props.readOnly}
        />
      </div>
    )
  }
}

interface ISourceProps {
  md: string
  updateHandler: (value: string) => void
  readOnly: boolean
  children: Element
  className: string
};