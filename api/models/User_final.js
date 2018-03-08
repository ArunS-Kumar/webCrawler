/**
 * User_final.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

  },

  get_users: function(opts, cb) {
		User_final.find({},function(err, users){
			if (err)
				return cb(err);
			return cb(null, users);
		});
	},

	create_user: function(opts, cb) {
		User_final.create(opts, function(err, userObj){
			if (err)
				return cb(err);
			return cb(null, userObj);
		});
	},

	get_user_unchecked : function(opts, cb) {
		var condition = {
			"$or": [
				{check: {$exists: false}},
				{check: 0}
			]
		};
		User_final.findOne(condition,function(err, users){
			if (err)
				return cb(err);
			return cb(null, users);
		});
	},

	update_user: function(id, opts, cb) {
		User_final.findOne({id: id}).exec(function(err, user_data){
			if (err) {
				return cb(err);
			} else if (!user_data) {
				return cb({status: 401, message: 'User not found'});
			} else {
				User_final.update({id: id}, opts, function(err, updated_data){
					if (err) {
						return cb(err);
					} else {
						return cb(null, updated_data[0]);
					}
				});
			}
		});
	},

	update_user_field: function(id, opts, cb) {
		// sails.log("opts-->", opts);
		User_final.update({id: id}, opts, function(err, updated_data){
			if (err) {
				return cb(err);
			} else {
				// console.log("updated_data-->", updated_data);
				return cb(null, updated_data[0]);
			}
		});
	},

	get_user_checked : function(opts, cb) {
		User_final.find({check: {$exists: true}},function(err, users){
			if (err)
				return cb(err);
			return cb(null, users);
		});
	},
};

