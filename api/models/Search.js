/**
 * Search.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

  },

	search_update: function(opts, cb) {
		Search.create(opts, function(err, userObj){
			if (err)
				return cb(err);
			cb(err, userObj);
		});
	},

	delete_all: function(opts, cb) {
		Search.destroy({}, function(err, deleted_data){
			if (err) {
				return cb(err);
			}
			return cb(null, deleted_data);
		});
	},

	get_search: function(opts, cb) {
		Search.find({}).sort('createdAt DESC').limit(1).exec(function(err, search){
			if (err)
				return cb(err);
			return cb(null, search);
		});
	},

};

