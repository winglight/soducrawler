var myApp = angular.module('myApp', ['ng-admin', 'bootstrapLightbox']);

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
                  $uibModal.open({
                      backdrop: true,
                      scope: scope,
                      controller: ['$scope', '$uibModalInstance', ($scope, $uibModalInstance) => {
                          $scope.close = () => $uibModalInstance.close();
                      }],
                      template:
                          '<div >{{content}}</div>'
                  });
                }

        },
        template:
            `<div class="btn btn-default" ng-click="showContent($event)" >{{title}}</div>`
    };
}

readerModal.$inject = ['$uibModal'];

myApp.directive('readerModal', readerModal);

myApp.config(['RestangularProvider', function(RestangularProvider) {
    RestangularProvider.setDefaultHeaders({'X-Parse-Application-Id': 'sodureader',
      'X-Parse-REST-API-Key': 'SLDFKieffiweOIF840jfdsliewoFUEWOhfwief8'
  });

    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params, httpConfig) {
        if (operation == 'getList') {
            params.skip = (params._page - 1) * params._perPage;
            params.limit = params._perPage;
            if(params._sortField){
              if(params._sortDir === 'DESC'){
                params._sortField = '-' + params._sortField;
              }
                params.order = params._sortField;
                delete params._sortDir;
                delete params._sortField;
            }
            if(params._filters){
              params.where = params._filters;
              delete params._filters;
            }

            delete params._page;
            delete params._perPage;
        }
        return { params: params };
    });

    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
        if (operation == 'getList') {
          response.totalCount = 100000;
            return data.results;
        }
        return data;
    });

}]).config(['NgAdminConfigurationProvider', function (nga) {
    // create an admin application
    var admin = nga.application('Book Store')
      .baseApiUrl('https://sodureader.herokuapp.com/parse/classes/'); // main API endpoint
    // create a user entity
    // the API endpoint for this entity will be 'http://jsonplaceholder.typicode.com/users/:id
    var book = nga.entity('BookModel');
    var chapter = nga.entity('ChapterModel');

    book.identifier(nga.field('objectId'));
    // set the fields of the book entity list view
    var bookFields = [
        // nga.field('objectId'),
        nga.field('name').isDetailLink(true).detailLinkRoute('show').label('书名'),
        // nga.field('url'),
        // nga.field('cover'),
        nga.field('newest').label('最新章节'),
        nga.field('updatedate').label('更新时间'),
        nga.field('rank').label('排名'),
        nga.field('updatedAt', 'datetime').label('抓取时间'),

        // nga.field('chapters')

    ];
    book.listView()
      .title('All books') // default title is "[Entity_name] list"
            .description('List of books with infinite pagination') // description appears under the title
            .infinitePagination(false) // load pages as the user scrolls
            .listActions(['show', 'edit'])
      .fields(bookFields)
      .filters([
          nga.field('name')
        ])
      .listActions(['<ma-filtered-list-button entity-name="ChapterModel" filter="{ parent: entry.values.id }" size="xs" label="章节列表"></ma-filtered-list-button>', 'show'])
      .sortField('rank')
      .sortDir('ASC');
    bookFields.push(
      nga.field('url')
    );

    bookFields.push(
      nga.field('chapters', 'referenced_list') // display list of related comments
          .targetEntity(chapter)
          .targetReferenceField('parent')
          .targetFields([
              nga.field('objectId'),
              nga.field('name')
                .label('章节'),
              nga.field('content')
                .label('内容')
                .template('<reader-modal title="{{ entry.values.name }}" link="{{ entry.values.url }}" content="{{ entry.values.content }}"></reader-modal>'),
              // nga.field('content').label('内容'),
          ])
          .sortField('seq')
          .sortDir('DESC')
          .listActions(['show'])
    );
    bookFields.push(
      nga.field('sources', 'embedded_list') // display list of related comments
          .targetFields([
              nga.field('name').label('名称'),
              nga.field('chapter'),
              nga.field('url', 'template')
                .template('<a class="btn btn-default" ng-href="{{value}}" target="_blank">查看</a>')
              ])
    );
    book.showView().fields(bookFields);
    // add the book entity to the admin application
    admin.addEntity(book);

    chapter.identifier(nga.field('objectId'));
    // set the fields of the `user` entity list view
    var chapterFields = [
        // nga.field('objectId'),
        nga.field('name', 'template')
          .label('章节')
          .template('<reader-modal title="{{ entry.values.name }}" link="{{ entry.values.url }}" content="{{ entry.values.content }}"></reader-modal>'),
        nga.field('url'),
        // nga.field('content')
        //     .map(function truncate(value) {
        //             if (!value) return '';
        //             return value.length > 50 ? value.substr(0, 50) + '...' : value;
        //         }),

        nga.field('parent', 'reference')
        .targetEntity(book)
        .targetField(nga.field('name'))
        .label('书名')
    ];
    chapter.listView()
      .filters([
              nga.field('parent', 'reference')
                  .label('书名')
                  .targetEntity(book)
                  .targetField(nga.field('name')),
          ])
      .listActions(['show', 'edit', 'delete'])
      .fields(chapterFields);
      chapterFields.push(
        nga.field('content', 'template')
        .label('内容')
        .template('<div >{{value}}</div>')
      );
    chapter.showView().fields(chapterFields);
    // add the user entity to the admin application
    admin.addEntity(chapter)

    // attach the admin application to the DOM and execute it
    nga.configure(admin);
}]);

myApp.controller('GlobalCtrl', function ($scope, Lightbox) {
console.log('GlobalCtrl: begin');
  $scope.openLightboxModal = function (newImages) {
    console.log('Lightbox: newImages' + newImages);
    var images = newImages.split(',').map(function(url, index){
      var obj = {};
      obj.url = url;
      obj.caption = '' + index;
      obj.thumbUrl = url;

      return obj;
    });
    console.log('Lightbox: images' + images);
    Lightbox.openModal(images, 0);
  };
});
