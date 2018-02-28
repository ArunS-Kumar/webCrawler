/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

  },

  login: function(opts, cb) {
		User.create(opts, function(err, userObj){
			if (err)
				return cb(err);
			return cb(null, userObj);
		});
	},

	create_user: function(opts, cb) {
		User.create(opts, function(err, userObj){
			if (err)
				return cb(err);
			return cb(null, userObj);
		});
	},

	get_users: function(opts, cb) {
		User.find({},function(err, users){
			if (err)
				return cb(err);
			return cb(null, users);
		});
	},
};

