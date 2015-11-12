define(function () {
  'use strict';
  var controller = ['$scope', 'companyFactory', 'company', 'countryFactory', '$q', 'fileFactory', 'appConstant', 'toaster',
    function ($scope, companyFactory, company, countryFactory, $q, fileFactory, constant, toaster) {
      console.log(company);
      $scope.company = company;

      $scope.countries = countryFactory.getCountryList();
      $scope.uploadModel = {
        file: null
      };

      $scope.$watch('uploadModel.file', function () {
        if ($scope.uploadModel.file) {
          if (constant.app.allowedImageExtension.test($scope.uploadModel.file.type)) {
            var deferred = $q.defer();
            fileFactory.upload($scope.uploadModel.file, null, 'companylogo', null, null, true)
              .success(function (data, status, headers, config) {
                $scope.company.companyLogoPath = data.url;

                deferred.resolve({
                  filePath: data.url,
                  fileName: data.name,
                  fileType: $scope.uploadModel.file.type
                });
              })
              .error(function (err) {
                deferred.reject(err);
              });

            $scope.isLoading = false;
            //return deferred.promise;
          }
          else {
            toaster.pop('error', 'Error', 'Only accept jpg, png file');
          }
        }
      });

      $scope.updateCompany = function () {
        var param = {
          "company": {
            "companyId": $scope.company.companyId,
            "companyName": $scope.company.companyName,
            "companyTypeId": $scope.company.companyTypeId,
            "logoPath": $scope.company.companyLogoPath,
            "address": {
              "address1": $scope.company.address.address1,
              "address2": $scope.company.address.address2,
              "city": $scope.company.address.city,
              "state": $scope.company.address.state,
              "zip": $scope.company.address.zip,
              "country": $scope.company.address.country
            }
          }
        };

        companyFactory.update(param)
          .success(function (response) {
            $scope.form.$setPristine();
          }).error(function (response) {
            $scope.form.$setPristine();
          });
      };

      var getCountryFileName = function (countryCode) {
        var fileName = _($scope.countries)
          .filter(function (country) {
            return country.code === countryCode;
          })
          .pluck('filename')
          .value();

        return fileName[0];
      };

      $scope.getStateList = function () {
        var fileName = getCountryFileName($scope.company.address.country);
        if (fileName !== undefined) {
          countryFactory.getStateList(fileName).then(
            function (resp) {
              $scope.states = resp;
            }, function (err) {
              $scope.states = [];
            }
          );
        } else {
          $scope.states = [];
        }
      };

      if ($scope.company.address.country) {
        $scope.getStateList();
      }
    }];
  return controller;
});