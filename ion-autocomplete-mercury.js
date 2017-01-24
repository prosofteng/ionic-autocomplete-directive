'use strict'

angular.module('ion-autocomplete-mercury', [])
    .directive('ionAutocompleteMercury', [
        '$ionicTemplateLoader',
        '$ionicBackdrop',
        '$q',
        '$timeout',
        '$rootScope',
        '$document',
        '$http',
        function($ionicTemplateLoader, $ionicBackdrop, $q, $timeout, $rootScope, $document, $http) {
            return {
                require: '?ngModel',
                restrict: 'E',
                template: '<input type="text" class="ion-autocomplete-mercury" readonly autocomplete="off">',
                replace: true,
                scope: {
                    autocompleteInput: "=autocompleteInput"
                },
                link: function(scope, element, attrs, ngModel) {
                    scope.results = [];
                    // var geocoder = new google.maps.Geocoder();
                    var searchEventTimeout = undefined;

                    var POPUP_TPL = [
                        '<div class="ion-autocomplete-mercury-container">',
                            '<div class="bar bar-header item-input-inset custom-auto-comp">',
                                '<label class="item-input-wrapper">',
                                    '<i class="icon ion-ios7-search placeholder-icon"></i>',
                                    '<input class="ion-autocomplete-mercury-search" type="search" ng-model="searchQueryauto" placeholder="">',
                                '</label>',
                                '<button class="button button-clear">',
                                    'Cancel',
                                '</button>',
                            '</div>',
                            '<ion-content class="has-header has-header">',
                                '<ion-list>',
                                    '<ion-item ng-repeat="result in results" type="item-text-wrap" ng-click="selectItem(result)">',
                                        '{{result.str}}',
                                    '</ion-item>',
                                '</ion-list>',
                            '</ion-content>',
                        '</div>'
                    ].join('');

                    var popupPromise = $ionicTemplateLoader.compile({
                        template: POPUP_TPL,
                        scope: scope,
                        appendTo: $document[0].body
                    });

                    popupPromise.then(function(el){
                        var searchInputElement = angular.element(el.element.find('input'));

                        scope.selectItem = function(item){
                            ngModel.$setViewValue(item);
                            ngModel.$render();
                            el.element.css('display', 'none');
                            $ionicBackdrop.release();
                        };

                        scope.$watch('searchQueryauto', function(itemTxt){
                            if (searchEventTimeout) $timeout.cancel(searchEventTimeout);
                            searchEventTimeout = $timeout(function() {
                                
                                var res = [];
                                if( itemTxt ) {
                                    _.filter(scope.autocompleteInput, function(item){
                                        if (item.str.toLowerCase().indexOf(itemTxt.toLowerCase()) !== -1) res.push(item);
                                    });
                                }

                                scope.results = res;
                            }, 350); 
                        });

                        var onClick = function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            $ionicBackdrop.retain();
                            el.element.css('display', 'block');
                            searchInputElement[0].focus();
                            setTimeout(function(){
                                searchInputElement[0].focus();
                            },0);
                            e.preventDefault();
                            e.stopPropagation();
                        };

                        var onCancel = function(e){
                            scope.searchQueryauto = '';
                            $ionicBackdrop.release();
                            el.element.css('display', 'none');
                            $(".ion-autocomplete-mercury-search").val("");
                            var empVal = {};
                            empVal.str = "";
                            empVal.id = "";
                            ngModel.$setViewValue(empVal);
                            ngModel.$render();
                        };

                        element.bind('click', onClick);
                        element.bind('touchend', onClick);

                        el.element.find('button').bind('click', onCancel);
                    });

                    if(attrs.placeholder){
                        element.attr('placeholder', attrs.placeholder);
                    }


                    ngModel.$formatters.unshift(function (modelValue) {
                        if (!modelValue) return '';
                        return modelValue;
                    });

                    ngModel.$parsers.unshift(function (viewValue) {
                        return viewValue;
                    });

                    ngModel.$render = function(){
                        if(!ngModel.$viewValue){
                            element.val('');
                        } else {
                            element.val(ngModel.$viewValue.str || '');
                        }
                    };
                }
            };
        }
    ]);