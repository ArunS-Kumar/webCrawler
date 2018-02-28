/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var json2csv = require('json2csv');

module.exports = {
	login : function(req, res) {
		if(!req.body || !req.body.mobile || !req.body.password)
			return res.negotiate({message : "parameter(s) is missing", status: 400});
	
		User.login(req.body, function(err, userData) {
			if(err){
				return res.negotiate(err);
			}
			res.json(userData);
		});
	},

	create_user : function(req, res) {

		if(!req.body || !req.body.company_names) {
			console.log(req.body.company_names);
			return res.negotiate({message : "Company Name - parameter(s) is missing", status: 400});
		} else if(!req.body.company_contact_info) {
			console.log(req.body.company_contact_info);
			return res.negotiate({message : "Company Contact Info parameter(s) is missing", status: 400});
		}  
		// else if(!req.body.contact_person_detail) {
		// 	console.log(req.body.contact_person_detail);	
		// 	return res.negotiate({message : "Contact Person Detail parameter(s) is missing", status: 400});
		// }
		
		var currect_record_no;
		if(parseInt(req.body.page_no) != 1) {
			currect_record_no = (parseInt(req.body.page_no) * 10) - 10 + parseInt(req.body.record_no);
		} else {
			currect_record_no = parseInt(req.body.record_no);
		}

		var search_data = { page_no:req.body.page_no, record_no:req.body.record_no, search_with:req.body.search_with, overall_complete_status:req.body.overall_complete_status };
		var user_data = {   company_names:req.body.company_names, 
							company_contact_info:req.body.company_contact_info, 
							company_address_info:req.body.company_address_info, 
							contact_person_detail:req.body.contact_person_detail, 
							company_description: req.body.company_description_array, 
							sales_value:req.body.sales_value,
							sales_option:req.body.sales_option,
							sales_start:req.body.sales_start,
							sales_end:req.body.sales_end,
							sales_currency:req.body.sales_currency,
							page_no:req.body.page_no,
							record_no:currect_record_no
						};

		User.create_user(user_data, function(err, userData) {
			if(err){
				return res.negotiate(err);
			}
			Search.search_update(search_data, function(err, searchData) {
				if(err){
					return res.negotiate(err);
				}
				return res.json({"user":userData, "search": searchData});
			});
		});
	},

	get_users : function(req, res) {
		User.get_users({}, function(err, userData) {
			if(err){
				return res.negotiate(err);
			}
			return res.json(userData);
		});
	},

	get_search : function(req, res) {
		Search.get_search({}, function(err, searchData) {
			if(err){
				return res.negotiate(err);
			}
			return res.json(searchData);
		});
	},

	create_csv : function(req, res) {
		User.get_users({}, function(err, userData) {
			
			var async = require('async');
			var all_detail = [];
			
			if(err){
				return res.negotiate(err);
			}
	        async.forEachSeries(userData, function(user, outerCallback) {
	            	
	        	var contact_person_detail = user.contact_person_detail;
	        	var company_names = user.company_names;
				
				var company_name;
				var company_website;
				var company_email;
				var company_phone;

				if(company_names.length > 1) {
					company_name = company_names[1];
				} else {
					company_name = company_names[0];
				}

				if(user.company_contact_info.length != 0) {
					company_website = user.company_contact_info[0];
					company_email = user.company_contact_info[1];
					company_phone = user.company_contact_info[2];
				}
				
	            async.forEachSeries(contact_person_detail, function(individual_person_details, innerCallback) {

					if(individual_person_details[1] != 'Title:Manager' && individual_person_details[2] != 'Title:Manager') {
						let person_detail = {};
						for (var i = 0; i < individual_person_details.length; i++) {

							if(i != 0) {

								let str = individual_person_details[i];
								let new_text = str.split(":");

								if(new_text[0] == 'Title' || new_text[0] == 'Telephone' || new_text[0] == 'Email' ) {
									person_detail[new_text[0].toLowerCase()] = new_text[1];
								}

							} else {
								person_detail['name'] = individual_person_details[0].replace(/\s\s+/g, " ");
								person_detail['company_name'] = company_name;
								person_detail['company_website'] = company_website;
								person_detail['company_email'] = company_email;
								person_detail['company_telephone'] = company_phone;
							}
						}
		   				all_detail.push(person_detail);
					}
	            	
	   				innerCallback();
	            }, function(err, result) { 
	            	if (err) {
	            		outerCallback(err); 
	            	}
	            	outerCallback(); 
	            });

	        }, function(err, result) {
				if (err) {
	        		return res.negotiate(err);
	        	}
	        	console.log(Object.keys(all_detail).length);
	            return res.json(all_detail);

				// json2csv(all_detail, function(err, csv) {
				// 	if (err) console.log(err);
				// 	var filename = "report-" + moment().format("YYYY-MM-DD") + ".csv";
				// 	res.attachment(filename);
				// 	res.end(csv, 'UTF-8');
				// });

	        });
		});
	},
	
};