(function () {
    'use strict';

    mainApp.factory('paginationService', paginationService);

    paginationService.$inject = ['$q', 'clientService', '$http'];

    function paginationService($q, clientService, $http) {
        var initialOptions = {
            size: 20,
            //other opts
        },
        service = {
            initialize: initialize,
            navigate: navigate,
            clear: clear,
            pages: [],
            paging: {
                options: angular.copy(initialOptions),
                info: {
                    totalItems: 0,
                    totalPages: 1,
                    currentPage: 0,
                }
            }
        };

        return service;

        function initialize() {
            var queryArgs = {
                pageSize: service.paging.options.size,
                pageNumber: service.paging.info.currentPage,
                catId: service.paging.options.catId,
                regId: service.paging.options.regId,
                tagId: service.paging.options.tagId,
                searchString: service.paging.options.searchString
            };

            service.paging.info.currentPage = 1;

            return clientService.query(queryArgs).$promise.then(
                function (result) {
                    var newPage = {
                        number: pageNumber,
                        events: []
                    };
                    result.EventPosts.forEach(function (event) {
                        newPage.events.push(event);
                    });

                    service.pages.push(newPage);
                    service.paging.info.currentPage = 1;
                    service.paging.info.totalPages = result.TotalPages;

                    return result.$promise;
                }, function (result) {
                    return $q.reject(result);
                });
        }

        function navigate(pageNumber) {
            var dfd = $q.defer();

            if (pageNumber > service.paging.info.totalPages) {
                return dfd.reject({ error: "page number out of range" });
            }

            if (service.pages[pageNumber]) {
                service.paging.info.currentPage = pageNumber;
                dfd.resolve();
            } else {
                return load(pageNumber);
            }

            return dfd.promise;
        }

        function load(pageNumber) {
            
            var queryArgs = {
                pageSize: service.paging.options.size,
                pageNumber: pageNumber
            };
            return clientService.query(queryArgs).$promise.then(
                function (result) {
                    var newPage = {
                        number: service.paging.info.pageNumber,
                        events: []
                    };
                    result.EventPosts.forEach(function (event) {
                        event.StartDate = moment(event.StartDate).locale('uk').format('LL');
                        event.PostedOn = moment(event.PostedOn).locale('uk').fromNow();
                        var path = "../content/data/eventphotos/";
                        if (event.Modified === null) {
                            path += event.PostedOn.slice(0, 4) + "/" + event.PostedOn.slice(6, 7) + "/" + event.EventPhoto;
                        } else {
                            path += event.Modified.slice(0, 4) + "/" + event.Modified.slice(6, 7)+ "/" + event.EventPhoto;
                        }
                        event.photoPath = path;
                        if (service.paging.options.featured) {
                            if (event.Featured) {
                                newPage.events.push(event);
                            }
                        } else {
                            newPage.events.push(event);
                        }
                    });

                    service.pages[pageNumber] = newPage;
                    service.paging.info.currentPage = pageNumber;
                    service.paging.info.totalPages = result.TotalPages;
                    service.paging.info.totalItems = result.TotalCount;

                    return result.$promise;
                }, function (result) {
                    return $q.reject(result);
                });
        }

        function clear() {
            service.pages.length = 0;
            service.paging.info.totalItems = 0;
            service.paging.info.currentPage = 0;
            service.paging.info.totalPages = 1;
        }

        function deleteEvent(id) {
            $http.delete("api/events/DeleteEventPostAsync/" + id).success(function () {
                for (var i = 0; i < service.pages[service.paging.info.currentPage].events.length; i++) {
                    if (service.pages[service.paging.info.currentPage].events[i].UrlSlug === id) {
                        service.pages[service.paging.info.currentPage].events.splice(i, 1);
                    }
                }
            });
        }

        function getComments(id) {
            $http.get("../api/events/GetCommentsAsync/" + id).success(function (response) {
                
                if (response.length > 0) {
                    response.forEach(function(comment) {
                        if (comment.DateTime !== '0001-01-01T00:00:00') {
                            comment.DateTime = moment(comment.DateTime).locale('uk').fromNow();
                        }
                    });
                    for (var i = 0; i < service.pages[service.paging.info.currentPage].events.length; i++) {
                        if (service.pages[service.paging.info.currentPage].events[i].Id === id) {
                            service.pages[service.paging.info.currentPage].events[i].comments = response;
                        }
                    }
                }
            });
        }

        function newComment(model) {
            $http.post("../api/events/NewCommentAsync", model).success(function() {
                getComments(model.PostId);
            });
        }

        function deleteComment(id, postId) {
            $http.delete("../api/events/DeleteCommentAsync/" + id).success(function () {
                for (var i = 0; i < service.pages[service.paging.info.currentPage].events.length; i++) {
                    if (service.pages[service.paging.info.currentPage].events[i].Id === postId) {
                        for (var j = 0; j < service.pages[service.paging.info.currentPage].events[i].comments.length; j++) {
                            if (service.pages[service.paging.info.currentPage].events[i].comments[j].Id === id) {
                                service.pages[service.paging.info.currentPage].events[i].comments.splice(j, 1);
                            }
                        }
                    }
                }
            });
        }
    }
})();