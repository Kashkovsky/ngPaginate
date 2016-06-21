(function () {
    'use strict';

    mainApp.controller('ctrl', ctrl);

    ctrl.$inject = ['$scope', 'paginationService'];

    function eventsCtrl($scope, paginationService) {
        $scope.pages = paginationService.pages;
        $scope.info = paginationService.paging.info;
        $scope.options = paginationService.paging.options;
        $scope.navigate = navigate;
        $scope.clear = optionsChanged;
        $scope.status = {
            type: "info",
            message: "ready",
            busy: false
        };
        activate();

        function activate() {
            if (paginationService.paging.info.currentPage === 0) {
                navigate(1);
            }
        }

        function navigate(pageNumber) {
            $scope.status.busy = true;
            $scope.status.message = "Завантаження";

            paginationService.navigate(pageNumber)
                            .then(function () {
                                $scope.status.message = "Готово";
                            }, function (result) {
                                $scope.status.message = "something went wrong: " + (result.error || result.statusText);
                            })
                            ['finally'](function () {
                                $scope.status.busy = false;
                            });
        }

        function optionsChanged() {
            paginationService.clear();
            activate();
        }
    }
})();