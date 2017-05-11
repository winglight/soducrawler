"use strict";

var read = require('node-readability');

const readerModal = ($uibModal) => {
    return {
        restrict: 'E',
        scope: {
            link: "@",
            title: "@",
            content: "@",
        },
        link: (scope) => {
            scope.showContent = ($event) => {
                $event.preventDefault();
                read($scope.url, function(err, article, meta) {
                  $scope.content = article.content;
                  $uibModal.open({
                      backdrop: true,
                      scope: scope,
                      controller: ['$scope', '$uibModalInstance', ($scope, $uibModalInstance) => {
                          $scope.close = () => $uibModalInstance.close();
                      }],
                      template:
                          `{{content}}`
                  });
                });

            }
        },
        template:
            `<div class="btn btn-default" ng-click="showContent($event)" >{{title}}</div>`
    };
}

readerModal.$inject = ['$uibModal'];

export default readerModal;
