import * as React from 'react'

import './AsciiConverter.less'
import { Chord } from '../api/libchrod';

const matchchord = /^\(?([a-h](#|b)?)(-|\+|m?(?!aj))([^a-z](.*))?$/i;
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

        const lines: string[] = text.split(/\r?\n/) 

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
                out += '\n'
            }
        }
        return out;

        function isChordLine(str: string) {

            const parts = str.trim().split(/\s+/)

            let numChords=0, numNonChords=0

            for( let part of parts) {
                console.log(matchchord.exec(part))
                if( matchchord.test(part) ) {
                    numChords++;
                } else {
                    numNonChords++;
                }
            }
            return numChords > numNonChords;

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
                return Array.from(map.values())
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