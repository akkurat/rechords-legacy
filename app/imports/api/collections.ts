import { Mongo } from "meteor/mongo";
import { _ } from "meteor/underscore";

var DATACHORD = 'data-chord';
var showdown = require("showdown");
var rmd = require("showdown-rechords");
var DOMParser = require("xmldom").DOMParser;
var Parser = require("html-react-parser");
var slug = require("slug");
var xss = require("xss");

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
    section: ["class", "id"],
    ul: ["class"],
    ol: [],
    li: [],
    p: ["class", "id"],
    br: [],
    strong: [],
    em: [],
    code: [],
    s: [],
    pre: [],
    img: ["src", "alt"]
  }
};

const converter = new showdown.Converter({ extensions: [rmd] });

showdown.setOption("simpleLineBreaks", true);
showdown.setOption("smoothLivePreview", true);
showdown.setOption("simplifiedAutoLink", true);
showdown.setOption("openLinksInNewWindow", true);


export const rmd_version = 0;
export class Song {
  _id?: string;

  text: string;

  title: string;
  author: string;

  tags?: Array<string>;
  chords?: Array<string>;
  html?: string;
  parsed_rmd_version?: number;

  title_: string;
  author_:string;


  constructor (doc) {
    _.extend(this, doc);
  }

  getHtml() {
    this.validateField("html");
    return this.html;
  }

  getChords() {
    this.validateField("chords");
    return this.chords;
  }

  getTags() {
    this.validateField("tags");
    return this.tags;
  }

  validateField(field : string) {
    if (
      field in this && 
      "parsed_rmd_version" in this && 
      this.parsed_rmd_version == rmd_version
    ) return;

    // Field missing or bad parser version. Re-parse and store!
    this.parse(this.text);

    Meteor.call('saveSong', this, (error, isValid) => {
      if (error !== undefined) {
        console.log(error);
      }
    });


  }

  checkTag(needle : string) {
      for (let tag of this.getTags()) {
          if (!(tag.toLowerCase().startsWith(needle.toLowerCase()))) continue;

          let chunks = tag.split(':', 2);
          if (chunks.length == 1) {
            // legacy mode: the tag may not contain the colon yet.
            // TODO: remove as soon each song has been edited once (and the tags have been re-parsed)
            chunks = tag.split(needle);
            if (chunks[1] == '') return true;
          }
          return chunks[1];
      }
      return null; // Tag not present
  }

  getVirtualDom() {
    return Parser(this.html);
  }

  parse(md) {
    this.text = md;

    // Create HTML
    // only member that exist in the mongo db are published
    // to the outside.
    this.html = xss(converter.makeHtml(this.text), options);
    this.title = "";
    this.author = "";

    this.tags = [];
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

    this.tags = RmdHelpers.collectTags(dom);
    this.chords = RmdHelpers.collectChords(dom);
    this.parsed_rmd_version = rmd_version;
  }

  getRevisions() {
    return Revisions.find({
      of: this._id
    }, { 
      sort: {timestamp: -1} 
    });
  }

  getRevision(steps: number) {
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
  static collectTags(dom) {
    let tags = [];
    let uls = dom.getElementsByTagName("ul");
    for (let ul of uls) {
      if (ul.getAttribute("class") != "tags") continue;

      let lis : Array<HTMLElement> = ul.getElementsByTagName("li");
      for (let li of lis) {
        let contents = Array.from(li.childNodes).map(child => child.textContent);
        tags.push( contents.join(':') );
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
    for (let chord_dom of uls) {
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