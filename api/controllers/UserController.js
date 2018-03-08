/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
// var json2csv = require('json2csv');
var difflib = require('jsdifflib');

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

		User_final.get_users({}, function(err, userData) {
			
			var async = require('async');
			var all_detail = [];
			
			if(err){
				return res.negotiate(err);
			}
	        async.forEachSeries(userData, function(user, outerCallback) {
	            	
	        	var contact_person_detail = user.contact_person_detail;
	        	var company_names = user.company_names;
				var company_description = user.company_description;

				var company_name;
				var company_website;
				var company_email;
				var company_phone;
				var number_of_employees = '';

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

				var company_description_index = 0;
				if(company_description[0] != 'Canada' && company_description[0] != 'Foreign')
					company_description_index = 1;

				if(company_description.length > 7) {
					let num = parseInt(company_description[company_description.length-1]);
					if(num != 'NaN')
						number_of_employees = num;
				}
				
				var year_Established = company_description[1-company_description_index];
				
				if (year_Established != parseInt(year_Established, 10)) {
					year_Established = '';
				}

				var NAICS;
				var primary_industry;
				var primary_industry_NAICS = company_description[2-company_description_index].split("-");

				if (primary_industry_NAICS[0] == parseInt(primary_industry_NAICS[0], 10)) {
					
					NAICS = primary_industry_NAICS[0];
					primary_industry = primary_industry_NAICS[1];
				} else {
					
					primary_industry_NAICS = company_description[3-company_description_index].split("-");
					if (primary_industry_NAICS[0] == parseInt(primary_industry_NAICS[0], 10)) {
						
						NAICS = primary_industry_NAICS[0];
						primary_industry = primary_industry_NAICS[1];
					} else {
						
						primary_industry_NAICS = company_description[4-company_description_index].split("-");
						if (primary_industry_NAICS[0] == parseInt(primary_industry_NAICS[0], 10)) {
							
							NAICS = primary_industry_NAICS[0];
							primary_industry = primary_industry_NAICS[1];
						} else {
							NAICS = '';
							primary_industry = '';
						}		
					}						
				}				
				
				
	            async.forEachSeries(contact_person_detail, function(individual_person_details, innerCallback) {

	            	check_title(individual_person_details[1],individual_person_details[2],function(data){
	            		if(data) {
	            			let person_detail = {};
							for (var i = 0; i < individual_person_details.length; i++) {

								if(i != 0) {

									let str = individual_person_details[i];
									let new_text = str.split(":");

									if(new_text[0] == 'Title' || new_text[0] == 'Telephone' || new_text[0] == 'Email' ) {
										person_detail[new_text[0]] = new_text[1];
									}

								} else {
									var company_address = user.company_address_info[0].split("\n");
									var StreetAddress;
									var City;
									var Province;
									var Postcode;

									if(company_address.length == 4) {
										StreetAddress = company_address[0]+' '+company_address[1];
									} else {
										StreetAddress = company_address[0];
									}

									var CityProvince = company_address[company_address.length-2].split(",");
									if(CityProvince.length == 2) {
										City = CityProvince[0];
										Province = CityProvince[1];
									} else {
										City = '';
										Province = company_address[company_address.length-2];
									}
									Postcode = company_address[company_address.length-1];
									
									var fullname = individual_person_details[0].replace(/\s\s+/g, " ").split(" ");
									var company_name_new = company_name.replace(/\s\s+/g, " ");
									var primary_industry_new = primary_industry.replace(/\s\s+/g, " ");

									person_detail['FirstName'] = fullname[0];
									fullname.shift();
									person_detail['LastName'] = fullname.join(' ');
									person_detail['CompanyName'] = company_name_new;
									person_detail['CompanyWebsite'] = company_website;
									person_detail['CompanyEmail'] = company_email;
									person_detail['CompanyTelephone'] = company_phone;
									person_detail['TotalSalesLower'] = user.sales_currency+user.sales_start;
									person_detail['TotalSalesUpper'] = user.sales_currency+user.sales_end;
									person_detail['NumberOfEmployees'] = number_of_employees;
									person_detail['YearEstablished'] = year_Established;
									person_detail['NAICS'] = NAICS;
									person_detail['PrimaryIndustry'] = primary_industry_new;
									person_detail['StreetAddress'] = StreetAddress;
									person_detail['City'] = City;
									person_detail['Province'] = Province;
									person_detail['Postcode'] = Postcode;
								}
							}
							// User.create_user(person_detail, function(err, uData) {
							// 	if(err){
							// 		return res.negotiate(err);
							// 	}
							// });
			   				all_detail.push(person_detail);
	            		}
	            	});
	            	
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

	get_user_ordered : function(req, res) {
		var sameNumbers = [];
		var differentNumbers = [];
		var withOutNumbers = [];

		User.get_users({}, function(err, userData) {

			async.forEachSeries(userData, function(user, outerCallback) {
				
				if (typeof(user.Telephone) != 'undefined' && user.Telephone != null && typeof(user.CompanyTelephone) != 'undefined' && user.CompanyTelephone != null) {
					
					var personTelephone = user.Telephone.replace(/[^A-Z0-9]/ig, "");
					var companyTelephone = user.CompanyTelephone.replace(/[^A-Z0-9]/ig, "");
					if(personTelephone == companyTelephone) {
						sameNumbers.push(user);
					} else {
						console.log(personTelephone);
						differentNumbers.push(user);
					}
				} else {
					withOutNumbers.push(user);
				}
				
				outerCallback(); 
			}, function(err, result) {
				if (err) {
	        		return res.negotiate(err);
	        	}
	        	
	        	console.log('sameNumbers =>',Object.keys(sameNumbers).length);
	        	console.log('differentNumbers =>',Object.keys(differentNumbers).length);
	        	console.log('withOutNumbers =>',Object.keys(withOutNumbers).length);

	        	var returnData = { sameNumbers: sameNumbers, differentNumbers: differentNumbers, withOutNumbers: withOutNumbers }
	            return res.json(returnData);

	        });
		});
	},

	get_user_unchecked : function(req, res) {
		User.get_user_unchecked({}, function(err, userData) {
			if(err){
				return res.negotiate(err);
			}
			return res.json(userData);
		});
	},

	update_user : function(req, res) {
		let id = req.body.id;
		let firstName = req.body.FirstName.toLowerCase();
		let lastName = req.body.LastName.toLowerCase();
		let details = req.body.details;
		let fixedRatio = 0.8;
		let newDetails = [];

		var compareName1 =  firstName+' '+lastName;
		_.each(details, function(detail, idx){
			var baseName = detail.name.toLowerCase();

			var ratio = diffUsingJS(baseName, compareName1);
			let tempArray = {
				"name":	detail.name,
				"phone": detail.phone,
				"address": detail.address,
				"link": detail.link,
				"ratio": ratio
			};

			if(ratio >= fixedRatio) {
				newDetails.push(tempArray);
			} else {
				var compareName2 =  lastName+' '+firstName;
				let ratio = diffUsingJS(baseName, compareName2);
				if(ratio >= fixedRatio) {
					tempArray.ratio = ratio;
					newDetails.push(tempArray);
				}
			}
		});

		var updateDetail = {
			check :1, 
			userDetails: "No Match Found!",
		};

		if(newDetails.length > 0) {
			newDetails = newDetails.sort(function(a,b){
			    return b.ratio - a.ratio;
			});
			updateDetail.userDetails = newDetails;
		}

		User.update_user(id, updateDetail, function(err, data){
			if (err) {
				return res.negotiate(err);
			} else {
				return res.json(data);
			}
		});
	},

	conver_all_strings : function(req, res) {

		User.get_users({}, function(err, userData) {

			async.forEachSeries(userData, function(user, outerCallback) {
				var person_detail = {};

				person_detail.FirstName = convertSpecialToNormal(user.FirstName);
				person_detail.LastName = convertSpecialToNormal(user.LastName);
				person_detail.CompanyName = convertSpecialToNormal(user.CompanyName);
				person_detail.CompanyWebsite = user.CompanyWebsite;
				person_detail.CompanyEmail = user.CompanyEmail;
				person_detail.CompanyTelephone = user.CompanyTelephone;
				person_detail.TotalSalesLower = user.TotalSalesLower;
				person_detail.TotalSalesUpper = user.TotalSalesUpper
				person_detail.NumberOfEmployees = user.NumberOfEmployees
				person_detail.YearEstablished = user.YearEstablished
				person_detail.NAICS = user.NAICS
				person_detail.PrimaryIndustry = convertSpecialToNormal(user.PrimaryIndustry);
				person_detail.StreetAddress = user.StreetAddress;
				person_detail.City = user.City;
				person_detail.Province = user.Province;
				person_detail.Postcode = user.Postcode;
				person_detail.Title = user.Title;
				person_detail.Telephone = user.Telephone;
				person_detail.Email = user.Email;

				// console.log(person_detail);
				// console.log("============");
				User_final.create_user(person_detail, function(err, uData) {
					if(err){
						return res.negotiate(err);
					}
				});
				
				outerCallback(); 
			}, function(err, result) {
				if (err) {
	        		return res.negotiate(err);
	        	}
	        	console.log(result);
	        	console.log('result');
	            return res.json(result);
	        });
		});
	}

};

function check_title(title1, title2, cb) {
	
	var word_array = ['Owner', 'President', 'Director', 'Chairman', 'General Manager', 'Partner', 'CEO', 'CFO', 'COO'];

	for (var i = 0; i < word_array.length; i++) {
		
		if((new RegExp( '\\b' + word_array[i] + '\\b', 'i').test(title1)) === true) {
			return cb(true);
		} else if((new RegExp( '\\b' + word_array[i] + '\\b', 'i').test(title2)) === true) {
			return cb(true);
		}

	}
	return cb(false);
}

function diffUsingJS(baseTextRaw, newTextRaw) {
    var sm = new difflib.SequenceMatcher( baseTextRaw, newTextRaw, null);
    return sm.ratio();
}

function convertSpecialToNormal(phrase) {

        var returnString = phrase.toLowerCase();
        //Convert Characters
        returnString = returnString.replace(/À|Á|Â|Ã|Ä|Å|à|á|â|ã|ä|å/g, 'a');
		returnString = returnString.replace(/Æ|æ/g, 'ae');
		returnString = returnString.replace(/Ç|ç/g, 'c');
		returnString = returnString.replace(/È|É|Ê|Ë|è|é|ê|ë/g, 'e');
		returnString = returnString.replace(/Ì|Í|Î|Ï|ì|í|î|ï/g, 'i');
		returnString = returnString.replace(/Ò|Ó|Ô|Õ|Ö|Ø|ò|ó|ô|õ|ö|ø/g, 'o');
		returnString = returnString.replace(/Ñ|ñ/g, 'n');
		returnString = returnString.replace(/Ù|Ú|Û|Ü|ù|ú|û|ü/g, 'u');
		returnString = returnString.replace(/Ý|ý/g, 'y');

		return returnString;
}



