'use strict';
/*
*declare app name here
*/
var garvanApp = angular.module('garvanApp',[]);

/*
* Service function to get patient data
*/
garvanApp.factory('patientFactory', function($http) {
    var factory = {};
    factory.getPatientList = function() {
        return $http.get('assets/patientData/patients.htm');
    };
    return factory;
});