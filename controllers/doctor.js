/*
* This controller used for filtering patient data by name and date range from static json value
* For back-end solution I use local storage to store patient data and
* also used it for adding, deleting note and patient details
*/
garvanApp.controller('DoctorController', function($scope, patientFactory) {

/*
* declare $scope value
*/
$scope.patients = [];
$scope.sort = "";
$scope.reverse = true;
$scope.isChrome = false;
/*
* initial $scope value for sorting purpose
* also load new patient data from local storage
*/
function init()
{
	$scope.sort = "lastname";
    $scope.reverse = false; 
    loadPatientData();
    browserDetection();
}
init();

/*
* function to load json file from angular services
*/
function getPatientData()
{
	//get patient data via patient factory
	patientFactory.getPatientList().then(function(patientObject)
	{
		$scope.patients = patientObject.data;
		for(var i = 0; i < $scope.patients.length; i++)
		{
			$scope.patients[i].birthdate = new Date($scope.patients[i].birthdate);
		}
		localStorage.setItem('patientData', JSON.stringify($scope.patients));
	},function(reason)
	{
		console.log(reason);
	});
}

/*
* I make this function to check if 
* i can store data to local storage or not.
*/
function loadPatientData()
{
	//if it has local storage then get patient data from local storage
	if(localStorage.getItem('patientData'))
	{
		//set patients into empty to get new value from local storage
		$scope.patients = "";
		$scope.patients = JSON.parse(localStorage.getItem('patientData'));
		if($scope.patients == "")
		{
			clearData();
			getPatientData();
		}
	}
	// it not then store patient data to local storage.
	else
	{
		getPatientData();
	}
}

/*
* simple function to clear local storage data
*/
function clearData()
{
	localStorage.clear();
}

/*
* Detect if user is using Chrome browser or not
* If not then modify date input into text
*/
function browserDetection()
{
    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    if(isChrome == true)
    {
    	$scope.isChrome = true;
    }
    else
    {
    	$scope.isChrome = false;
    }
}

/*
* function to sort patient by input lastname, firstname 
* and date
*/
$scope.orderBy = function(sort_by)
{
	$scope.reverse = !$scope.reverse;
	$scope.sort = sort_by;
};

/*
* create new patient here
* push new patient to $scope.patients
* then store it in local storage
* finally clear data
*/
$scope.addPatient = function(newPatient)
{
	var id = $scope.patients.length + 1;
	var note=[{content:newPatient.note, createddate: new Date(), noteid:id}];
	var birthdate;
	if($scope.isChrome == true)
	{
		birthdate = newPatient.birthdate;
	}
	else if($scope.isChrome == false)
	{
		birthdate = new Date(newPatient.birthdateText);
	}
	$scope.patients.push({id:id, firstname:newPatient.firstname, lastname:newPatient.lastname, birthdate:birthdate, notes:note});
	clearData();
    localStorage.setItem('patientData', JSON.stringify($scope.patients));
	$scope.newPatient = "";
};

/*
* find index of selected patient 
* then delete it from json
*/
$scope.deletePatient = function(patient)
{
	//Looking for patient in array to delete
	var index = $scope.patients.indexOf(patient);
	//delete patient from json and store it to local storage
	//we need to call function to delete in database in real system
	$scope.patients.splice(index,1);
	clearData();
	localStorage.setItem('patientData', JSON.stringify($scope.patients));
};

/*
* show details of selected patient
*/
$scope.showCurrentPatient = function(patient)
{
	$scope.currentPatient = patient;
};

/*
* function to add new note for selected patient
*/
$scope.addNote = function(content)
{
	var id = $scope.currentPatient.id;
	var note={content:content, createddate: new Date(), noteid:id};
	//loop through patient list to find selected patient
	// then add note to that patient 
	// set that note to current user object as well
	for(var i = 0; i < $scope.patients.length; i++)
	{
		if($scope.patients[i].id == $scope.currentPatient.id)
		{
			$scope.patients[i].notes.push(note);
			$scope.currentPatient.notes = $scope.patients[i].notes;
		}
	}
	clearData();
	localStorage.setItem('patientData', JSON.stringify($scope.patients));
	$scope.content = "";
};

/*
* delete note function
* just temporarily splice it from json
*/
$scope.deleteNote = function(note)
{
	//Looking for patient in array to delete
	var index = $scope.currentPatient.notes.indexOf(note);
	//delete patient from json and from local storage
	//we need to call function to delete in database in real system
	for(var i = 0; i < $scope.patients.length; i++)
	{
		if($scope.patients[i].id == $scope.currentPatient.id)
		{
			$scope.patients[i].notes.splice(index,1);
			$scope.currentPatient.notes = $scope.patients[i].notes;
		}
	}
	clearData();
	localStorage.setItem('patientData', JSON.stringify($scope.patients));
};
});

/*
* This function used for filtering patient data by name 
*/
garvanApp.filter('nameFilter', function()
{
	return function(patientList, patientName) 
	{
		// If no array is given
        //then exit
		if(!patientList) 
		{
			return;
        }
        // If no patient name exists
        //then return unfiltered list of patient.    
        else if(!patientName) 
        {
        	return patientList;
        }
        else 
        {
        	// Convert filter text to lower case.
        	var term = patientName.toLowerCase();
        	// Return list of patient and filter it by 
            //looking for each patient name. 
        	return patientList.filter(function(item)
        	{
        		var termInFirstName = item.firstname.toLowerCase().indexOf(term) > -1;
        		var termInLastName = item.lastname.toLowerCase().indexOf(term) > -1;
        		return termInFirstName || termInLastName;
        	});
        } 
    }    
});

/*
* This function used for filtering patient 
* from date range
* quite similar to name filter but date filter take two input
*/
garvanApp.filter('dateFilter', function()
{
	return function(dataArray, from, to) 
	{
		if (!dataArray) 
		{
			return;
		}
		// If no date value, return the array unfiltered.
		else if (!from || !to) 
		{
			return dataArray;
		}
		else 
		{
		    // Convert input to Date format 
			var dateFrom = Date.parse(from);
			var dateTo = Date.parse(to);
			var result = [];        
			for(var i=0; i<dataArray.length; i++)
			{
				var date = new Date(dataArray[i].birthdate);
				if (date > dateFrom && date < dateTo)  
				{
					result.push(dataArray[i]);
				}
			}            
			return result;
        }  
    }    
});