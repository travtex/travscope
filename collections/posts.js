Posts = new Meteor.Collection('posts');

Posts.allow({
	update: ownsDocument,
	remove: ownsDocument
});

Posts.deny({
	update: function(userId, post, fieldNames) {
		//may only edit these fields:
		return(_.without(fieldNames, 'url', 'title').length > 0);
	}
});

Meteor.methods({
	post: function(postAttributes) {
		var user = Meteor.user(),
			postWithSameLink = Posts.findOne({url: postAttributes.url});

		// ensure user logged in
		if(!user)
			throw new Meteor.Error(401, "You need to login to post new stories");

		// ensure post has a title
		if(!postAttributes.title)
			throw new Meteor.Error(422, 'Please fill in a headline');

		// check that there are no previous posts with same link

		if(postAttributes.url && postWithSameLink) {
			throw new Meteor.Error(302,
				'This link has already been posted',
				postWithSameLink._id);
		}

		// pick out whitelisted keys
		var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
			userId: user._id,
			author: user.username,
			submitted: new Date().getTime(),
			commentsCount: 0
		});

		var postId = Posts.insert(post);

		return postId;
	}
});