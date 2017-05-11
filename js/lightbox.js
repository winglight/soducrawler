function lightboxDirective() {
    return {
        restrict: 'E',
        scope: {
            value: '&',
            field: '&'
        },
        template: '<a class="btn btn-default" ng-click="openLightboxModal('{{value()}}');">'
    };
}
export default lightboxDirective;
