import * as React from 'react'

import './AsciiConverter.less'
export class AsciiConverter extends React.Component<{},{text: string}> {
    constructor(props) {
        super(props);
        this.state = {
            text: ""
        }
    }

    render() {
        const convertedText = this.convert( this.state.text )
        return <div id="asciiconverter" className="content">
            <textarea id="ascii-input" onChange={ev => this.setState({text: ev.currentTarget.value})}></textarea>
            <textarea id="ascii-output" value={convertedText} />
        </div>
    }

    convert = text => {

        let out = "";

        const lines = text.split(/\r?\n/) 

        let lastChordMap: Map<number, string> = null;
        for( const line of lines )
        {
            if( isChordLine(line) ) {
                lastChordMap = parseChords(line)
            } else {
                if( lastChordMap ) {
                    out += pair( lastChordMap, line )
                    lastChordMap = null;
                } else {
                    out += line
                }
            }
            out += '\n'
        }
        return out;

        function isChordLine(str) {
            const regex = /^(\s*[a-h]m?(aj)?\d{0,2}(\s*))+$/i
            const match = regex.test(str)
            return match
        }

        function parseChords(str: string) {
            const re= /\S+/g
            const returnValue = new Map()
            let match: RegExpExecArray
            while( (match = re.exec(str)) ) {
                returnValue.set(match.index,match[0])
            }
            return returnValue
        }

        function pair(map: Map<number,string>, str: string) {
            let output = ""
            if(map.size > str.length)
            {
                return Array.of(map.values())
                .map(c => `[${c}]`)
                .join('')
            }
            for ( let i=0; i< str.length; i++) {
                if(map.has(i)) {
                    output += `[${map.get(i)}]`
                }
                output += str.charAt(i)
            }
            return output;
            
        }
    }

}