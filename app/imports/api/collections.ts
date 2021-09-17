import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor'
import { _ } from 'meteor/underscore';

import * as showdown from 'showdown'

const DATACHORD = 'data-chord'
import {showdownRechords as rmd} from 'showdown-rechords'
import { DOMParser } from 'xmldom'
import Parser from 'html-react-parser'
import  slug from 'slug'
import { FilterXSS } from 'xss';

const options: XSS.IFilterXSSOptions = {
  whiteList: {
    a: ["href", "title"],
    span: ["class"],
    div: ["class", "id"],
    i: ["class", "data-chord"],
    b: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    section: ["class", "id"],
    ul: ["class"],
    u: [],
    ol: [],
    li: [],
    p: ["class", "id"],
    br: [],
    strong: [],
    em: [],
    code: ["class"],
    s: [],
    pre: [],
    img: ["src", "alt"],
    abbr: ["class", "title", "data-fingers"]
  }
};

const converter = new showdown.Converter({ 
  extensions: rmd,
  striketrough: true,
  ghCodeBlocks: true,
  smoothLivePreview: true
});

showdown.setOption("simpleLineBreaks", true);
showdown.setOption("smoothLivePreview", true);
showdown.setOption("simplifiedAutoLink", true);
showdown.setOption("openLinksInNewWindow", true);


function isDefined<T>(a: T | null | undefined): a is T {
	return a !== null && a !== undefined;
}

export const rmd_version = 6;
export interface ParsedSong {
  getHtml(): string 
  getChords(): string[]
  getTags(): string[]
  getTag(tag_name : string): string 
}
export class Song implements ParsedSong {
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

  last_editor?: string;

  revision_cache?: Array<Revision>;


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
    if (field in this && this?.parsed_rmd_version == rmd_version) return;

    // A field is missing or bad parser version. Re-parse and store!
    this.parse(this.text);

    Meteor.call('saveSong', this, (error, isValid) => {
      if (error !== undefined) {
        console.log(error);
      }
    });


  }

  checkTag(needle : string): string | true {
      for (const tag of this.getTags()) {
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

  getTag(tag_name : string): string {
    for (let tag of this.getTags()) {
        if (!(tag.toLowerCase().startsWith(tag_name.toLowerCase()))) continue;

        let chunks = tag.split(':', 2);
        if (chunks.length == 1) {
          return undefined  // no colon in tag
        }
        return chunks[1];
    }
    return undefined; // Tag not present

  }

  getVirtualDom() {
    return Parser(this.html);
  }

  isEmpty() {
    return this.text.match(/^\s*$/) != null;
  }

  parse(md) {
    this.text = md;

    // Create HTML
    // only member that exist in the mongo db are published
    // to the outside.
    const filter = new FilterXSS(options)
    this.html = filter.process(converter.makeHtml(this.text));
    this.title = "";
    this.author = "";

    this.tags = [];
    this.chords = [];

    // URL-compatible strings
    this.title_ = "";
    this.author_ = "";

    // this._id may be present or not, but is, most importantly: unaffected!

    // Set Metadata

    if (this.isEmpty()) return;  // delete song upon next save.

    const dom = new DOMParser().parseFromString(this.html, "text/html");

    let h1 = dom.getElementsByTagName("h1");
    if (h1.length > 0) {
      this.title = h1[0].textContent;
    } else {
      this.title = '(Ohne Titel)';
    }
    this.title_ = slug(this.title);

    let h2 = dom.getElementsByTagName("h2");
    if (h2.length > 0) {
      this.author = h2[0].textContent;
    } else {
      this.author = '-';
    }
    this.author_ = slug(this.author);

    this.tags = RmdHelpers.collectTags(dom);
    this.chords = RmdHelpers.collectChords(dom);
    this.parsed_rmd_version = rmd_version;
  }


  getRevisions() {
    if (!isDefined(this.revision_cache)) {
      this.revision_cache = Revisions.find(
        { of: this._id }, 
        { sort: {timestamp: -1} 
      }).fetch();
    }
    return this.revision_cache;
  }

  getRevision(steps: number) {
    return this.getRevisions()[steps]
  }
}

export class Revision {
  text: string;
  of: string;
  _id: string;

  ip: string;
  timestamp: Date;
  editor?: string;
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
    let uls = Array.from(dom.getElementsByTagName("ul"));
    for (let ul of uls) {
      if (ul.getAttribute("class") != "tags") continue;

      let lis : Array<HTMLElement> =Array.from(ul.getElementsByTagName("li"));
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

    let uls = Array.from(dom.getElementsByTagName("i"));
    for (let chord_dom of uls) {
      if (chord_dom.hasAttribute(DATACHORD)) {
        var chord = chord_dom.getAttribute(DATACHORD);
        chords.push(chord);
      }
    }
    return chords;
  }
}


class Room {
  constructor (doc: Room | Pick<Room, 'ownerId'> ) {
    _.extend(this, doc)
    if(!this.creationDate) {this.creationDate = new Date()}
  }
  // TODO: RoomCaption class with toString implemented
  getCaption(): string {
    const r = this.caption ? this.caption : this.creationDate
    console.log(Meteor.users.findOne)
    const userName = Meteor.users.findOne(this.ownerId)?.profile?.name
    return `${r} by ${userName}`
  }

  _id: string
  ownerId: string
  caption?: string
  echos: string[] = []
  currentSongId?: string 
  list: string[] = []
  scrollPosition = 0
  creationDate: Date
}

const Rooms = new Mongo.Collection<Room>('rooms', {transform: (r) => new Room(r)})
 
export {Rooms, Room }

export { Revisions };



export default Songs;