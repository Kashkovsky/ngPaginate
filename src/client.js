(function () {
    'use strict';

    mainApp.factory('clientService', function ($resource) {
            return $resource("api/.../:id",
                { id: "@id" },
                {
                    'query': {
                        method: 'GET',
                        url: '/api/.../:pageSize/:pageNumber',
                        params: {
                            pageSize: '@pageSize',
                            pageNumber: '@pageNumber'
                        }
                    }
                });
        });
})();
