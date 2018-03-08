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

	get_user_unchecked : function(opts, cb) {
		User.findOne({check: {$exists: false}},function(err, users){
			if (err)
				return cb(err);
			return cb(null, users);
		});
	},

	update_user: function(id, opts, cb) {
		console.log('model');
		User.findOne({id: id}).exec(function(err, user_data){
			if (err) {
				return cb(err);
			} else if (!user_data) {
				return cb({status: 401, message: 'User not found'});
			} else {
				User.update({id: id}, opts, function(err, updated_data){
					if (err) {
						return cb(err);
					} else {
						return cb(null, updated_data[0]);
					}
				});
			}
		});
	}
};

