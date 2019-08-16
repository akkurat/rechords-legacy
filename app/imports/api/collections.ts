import { Mongo } from "meteor/mongo";
import { _ } from "meteor/underscore";

var DATACHORD = 'data-chord';
import * as showdown from 'showdown'
var rmd = require("showdown-rechords");
import { DOMParser } from 'xmldom';
import Parser from 'react-html-parser';
import * as slug from 'slug'
import * as xss from 'xss'
import { string } from "prop-types";
import { getIterator } from "core-js";

var options = {
  whiteList: {
    a: ["href", "title"],
    span: ["class"],
    div: ["class"],
    i: ["class", "data-chord"],
    b: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    ul: ["class"],
    li: [],
    p: ["class"],
    br: [],
    strong: [],
    em: [],
    code: [],
    s: []
  }
};

const converter = new showdown.Converter({ extensions: [rmd] });

showdown.setOption("simpleLineBreaks", true);
showdown.setOption("smoothLivePreview", true);
showdown.setOption("simplifiedAutoLink", true);
showdown.setOption("openLinksInNewWindow", true);


export interface ISongReference {
  _id?: string;

  title?: string;
  author: string;

  getTags(): any

  
  tags?: any

  /** no spaces, only asci */
  title_?: string;
  /** no spaces, only asci */
  author_: string;

}

export class Song implements ISongReference {
  _id?: string;

  text: string;

  title: string;
  author: string;

  tags?: Array<[string, string]>

  chords?: Array<string>;
  html?: string;

  /** no spaces, only asci */
  title_: string;
  /** no spaces, only asci */
  author_:string;

  constructor (doc) {
    _.extend(this, doc);



  }

  getHtml() {
    if (!("html" in this)) {
      this.parse(this.text);
    }
    return this.html;
  }

  getChords() {
    if (!("chords" in this)) {
      this.parse(this.text);
    }
    return this.chords;
  }

  getTags() {
    if (!("tags" in this)) {
      this.parse(this.text);
    }
    if(this.tags) { 
      // Backward compatibility
      return new Map<string, string>(this.tags.map(e => {
        if( typeof e === 'string') {
          return [e,e]
        }
        return e;
      })) 
    } else {
      return new Map<string, string>() 
    }
  }

  getVirtualDom() {
    return Parser(this.html);
  }

  parse(md: string) {
    this.text = md;

    // Create HTML
    // only member that exist in the mongo db are published
    // to the outside.
    this.html = xss(converter.makeHtml(this.text), options);
    this.title = "";
    this.author = "";

    this.tags = []
    this.chords = [];

    // URL-compatible strings
    this.title_ = "";
    this.author_ = "";

    // this._id may be present or not, but is, most importantly: unaffected!

    // Set Metadata
    let dom = new DOMParser().parseFromString(this.html, "text/html");

    if (dom === undefined) {
      // Delete song
      return;
    }

    let h1 = dom.getElementsByTagName("h1");
    if (h1.length > 0) {
      this.title = h1[0].textContent;
      this.title_ = slug(this.title);
    }

    let h2 = dom.getElementsByTagName("h2");
    if (h2.length > 0) {
      this.author = h2[0].textContent;
      this.author_ = slug(this.author);
    }

    let tags = RmdHelpers.collectTags(dom);
    this.tags = [...tags.entries()]
    this.chords = RmdHelpers.collectChords(dom);
  }

  getRevisions(): Mongo.Cursor<Revision> {
    return Revisions.find({
      of: this._id
    }, { 
      sort: {timestamp: -1} 
    });
  }

  getRevision(steps: number): Revision{
    return this.getRevisions().fetch()[steps]
  }
}

export class Revision {
  text: string;
  of: string;

  ip: string;
  timestamp: Date;
}


let Revisions = new Mongo.Collection<Revision>('revisions');

let Songs = new Mongo.Collection<Song>('songs', {
  transform (doc) {
    return new Song(doc);
  }
});


export class RmdHelpers {
  static collectTags(dom): Map<string, string> {
    let tags = new Map();
    let uls = dom.getElementsByTagName("ul");
    for (let ul of uls) {
      if (ul.getAttribute("class") != "tags") continue;

      let lis = ul.getElementsByTagName("li");
      // IMPROVE: this could be solved more elegant in when parsing
      for (let li of lis) {
        const ch = li.childNodes
        if(ch.length > 0) {
          const key = ch[0].textContent
          if(ch.length > 1) {
            tags.set(key, ch[1].textContent)
          } else {
            tags.set(key, key)
          }
        }
      }
    }
    return tags;
  }
  static collectChords(dom) {
    return this.collectChordsDom(dom);
  }
  static collectChordsDom(dom) {
    let chords = [];

    let uls = dom.getElementsByTagName("i");
    for (let i = 0; i < uls.length; i++) {
      let chord_dom = uls[i];
      if (chord_dom.hasAttribute(DATACHORD)) {
        var chord = chord_dom.getAttribute(DATACHORD);
        chords.push(chord);
      }
    }
    return chords;
  }
}

export { Revisions };

export default Songs;