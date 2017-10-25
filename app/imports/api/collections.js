import { Mongo } from "meteor/mongo";

var showdown = require("showdown");
var rmd = require("showdown-rechords");
var DOMParser = require("dom-parser");
var slug = require("slug");
var xss = require("xss");
var options = {
  whiteList: {
    a: ["href", "title"],
    span: ["class"],
    h1: [],
    h2: [],
    h3: [],
    ul: ["class"],
    li: [],
    p: [],
    br: []
  }
};
const converter = new showdown.Converter({ extensions: [rmd] });

showdown.setOption("simpleLineBreaks", true);
showdown.setOption("smoothLivePreview", true);
showdown.setOption("simplifiedAutoLink", true);
showdown.setOption("openLinksInNewWindow", true);

// TODO: shouldnt it be possible to just extend Mongo.Collection?
export const Songs = new Mongo.Collection("songs");

Songs.helpers({
  getHtml() {
    if (!("html" in this)) {
      this.parse(this.text);
    }
    return this.html;
  },

  // Arg, crap. Can we parse imediately?
  getChords() {
    if (!("html" in this)) {
      this.parse(this.text);
    }
    return this.chords;
  },

  getTags() {
    if (!("html" in this)) {
      this.parse(this.text);
    }
    return this.tags;
  },

  parse(md) {
    this.text = md;

    // Create HTML
    // only member that exist in the mongo db are published
    // to the outside.
    this.html = xss(converter.makeHtml(this.text), options);
    console.debug(this.html);
    this.title = "";
    this.author = "";
    // Not sure if this works
    this.tags = [];
    this.chords = [];

    // URL-compatible strings
    this.title_ = "";
    this.author_ = "";

    // this._id may be present or not, but is, most importantly: unaffected!

    // Set Metadata
    let dom = new DOMParser().parseFromString(this.html, "text/html");

    let h1 = dom.getElementsByTagName("h1");
    if (h1.length > 0) {
      this.title = h1[0].textContent;
      this.title_ = slug(this.title);
    }

    let h2 = dom.getElementsByTagName("h2");
    if (h2.length > 0) {
      this.author = h1[0].textContent;
      this.author_ = slug(this.author);
    }

    this.tags = RmdHelpers.collectTags(dom);
    this.chords = RmdHelpers.collectChords(dom);
  }
});

class RmdHelpers {
  // May be this domparser is a handier implementation
  // https://www.npmjs.com/package/dom-parser

  static collectTags(dom) {
    let tags = [];
    let uls = dom.getElementsByClassName("tags");
    for (i = 0; i < uls.length; i++) {
      let ul = uls[i];

      let lis = ul.getElementsByTagName("li");
      for (j = 0; j < lis.length; j++) {
        let li = lis[j];
        tags.push(this.collectAllTextNodes(li));
      }
    }
    return tags;
  }
  static collectChords(dom) {
    let chords = [];

    let uls = dom.getElementsByClassName("chord");
    for (i = 0; i < uls.length; i++) {
      let chord_dom = uls[i];
      chords.push(chord_dom.textContent);
    }
    console.log(chords);
    // console.log(ChrodLib.guessKey(this.chords));
    return chords;
  }

  /**
   * 
   * @param {} element 
   */
  static collectAllTextNodes(element) {
    if (!(element instanceof Object)) {
      return element;
    } else if ("data" in element) {
      return element.data;
    } else if ("childNodes" in element) {
      let text = "";
      for (child in element.childNodes) {
        // aaaarg, still confused of "of" and "in"
        text += this.collectAllTextNodes(child);
      }
      return text;
    } else {
      return "";
    }
  }
}
