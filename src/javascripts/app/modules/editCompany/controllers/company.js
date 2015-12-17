define(function() {
  'use strict';
  var controller = ['$scope', 'companyFactory', 'company', 'countryFactory', '$q', 'fileFactory', 'appConstant', 'toaster', '$filter',
    function($scope, companyFactory, company, countryFactory, $q, fileFactory, constant, toaster, $filter) {
      $scope.company = company;
      $scope.isCompanyLogoChanged = false;
      $scope.countries = countryFactory.getCountryList();
      $scope.uploadModel = {
        file: null
      };

      $scope.$watch('uploadModel.file', function() {
        if($scope.uploadModel.file) {
          if(constant.app.allowedImageExtension.test($scope.uploadModel.file.type)) {
            fileFactory.upload($scope.uploadModel.file, null, 'temp', null, null, true)
              //fileFactory.upload($scope.uploadModel.file, null, 'companylogo', null, null, true)
              .success(function(data, status, headers, config) {
                $scope.company.companyLogoPath = $filter('filePath')(data.url, 'node');
                $scope.isCompanyLogoChanged = true;
              })
              .error(function(err) {
              });

            $scope.isLoading = false;
          }
          else {
            toaster.pop('error', 'Error', 'Only accept jpg, png file');
          }
        }
      });

      $scope.updateCompany = function(_form) {
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

        function update(param) {
          console.log(_form);
          companyFactory.update(param)
            .success(function(response) {
              _form.$setPristine();
              $scope.isCompanyLogoChanged = false;
            })
            .error(function(response) {
              _form.$setPristine();
              $scope.isCompanyLogoChanged = false;
            });
        }

        if($scope.isCompanyLogoChanged) {
          fileFactory.move($filter('filePath')($scope.company.companyLogoPath, 'relative'), null, 'companylogo')
            .success(function(resp) {
              param.company.logoPath = resp.url;
              $scope.company.companyLogoPath = resp.url;
              update(param);
            });
        }
        else {
          update(param);
        }
      };

      var getCountryFileName = function(countryCode) {
        var fileName = _($scope.countries)
          .filter(function(country) {
            return country.code === countryCode;
          })
          .pluck('filename')
          .value();

        return fileName[0];
      };

      $scope.getStateList = function() {
        var fileName = getCountryFileName($scope.company.address.country);
        if(fileName !== undefined) {
          countryFactory.getStateList(fileName).then(
            function(resp) {
              $scope.states = resp;
            }, function(err) {
              $scope.states = [];
            }
          );
        } else {
          $scope.states = [];
        }
      };

      if($scope.company.address.country) {
        $scope.getStateList();
      }
    }];
  return controller;
});