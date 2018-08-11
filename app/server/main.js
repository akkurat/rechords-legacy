import Songs, {Revisions} from '../imports/api/collections';

Meteor.publish('songs', function () {
    return Songs.find({});
});

Meteor.publish('revisions', function () {
    return Revisions.find({});
});