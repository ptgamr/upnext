/**
 * Paginator Provider: Simplifies the handling of the pagination.
 */
(function(){
    'use strict';

    angular.module("soundCloudify")
            .provider("Paginator", PaginatorProvider);

    function PaginatorProvider() {

        var appendResult = true;

        var $defaultRowsCount = 10;

        this.setRowsCountPerPage = function(perPage) {
            $defaultRowsCount = perPage;
        };

        this.$get = [function PaginatorFactory() {

            var fetch = function(appendResult, rowsCount) {

                if (this.isBusy()) return;

                var self = this;
                appendResult = (typeof appendResult === 'undefined') ? false : appendResult;

                var model = this.paginationModel;
                if(rowsCount) {
                    model = angular.copy(model);
                    model.limit = rowsCount;
                }

                var promise = this.pagingFunction.call(undefined, model, appendResult);

                if (!promise || !promise.then) {
                    throw new Error('pagingFunction should return a promise object');
                }

                promise.then(

                    function(results) {

                        if (!results) return;

                        var nextPageToken = results.nextPageToken || '';
                        var items = results.tracks;

                        if (items && items.length) {
                            self.data = appendResult ? self.data.concat(items) : items;
                            self.paginationModel.skip += items.length;
                            self.paginationModel.nextPageToken = nextPageToken;
                            self.hasMoreRow = items.length === model.limit;
                        } else {
                            self.hasMoreRow = false;
                        }

                        self.pagingSuccess.call(undefined, items, appendResult);
                    },

                    function() {

                        self.pagingFailed.call(undefined);
                    }
                );

                this.lastPromise = promise;
            };

            var Paginator = function(opts) {
                
                opts = opts || {};

                if (!opts.pagingFunction || (typeof opts.pagingFunction !== 'function')) {
                    throw 'pagingFunction has to be provided as an option when instantiate paginator';
                }

                this.data = [];

                this.paginationModel = {
                    limit: opts.limit || $defaultRowsCount,
                    skip: opts.skip || 0,
                    nextPageToken: ''
                };

                this.hasMoreRow = false;
                this.pagingFunction = opts.pagingFunction;
                this.pagingSuccess = (typeof opts.pagingSuccess === 'function') ? opts.pagingSuccess : angular.noop;
                this.pagingFailed = (typeof opts.pagingFailed === 'function') ? opts.pagingFailed : angular.noop;

                if (opts.fetchFirstPage) {
                   fetch.call(this, false);
                }
            };

            Paginator.prototype = {

                constructor: Paginator,

                moreRows: function() {
                    fetch.call(this, appendResult);
                },

                sortBy: function(columnName) {

                    if(columnName === this.paginationModel.sort){
                        this.paginationModel.direction = this.paginationModel.direction == 1 ? -1 : 1;
                    }else{
                        this.paginationModel.direction = 1;
                        this.paginationModel.sort = columnName;
                    }

                    var currentlyAvailableRows;
                    if(this.paginationModel.limit) {
                        currentlyAvailableRows = this.paginationModel.skip;
                    }

                    this.paginationModel.skip = 0;

                    fetch.call(this, !appendResult, currentlyAvailableRows);
                },

                isSortedBy: function(columnName) {
                    return columnName === this.paginationModel.sort ? true : false
                },

                getSortDirection: function() {
                    return this.paginationModel.direction;
                },

                isBusy: function () {
                    return this.lastPromise && this.lastPromise.$$state.status === 0;
                },

                reset: function() {
                    this.paginationModel.skip = 0;
                },
            };

            return {
                getInstance: function(opts) {
                    return new Paginator(opts);
                }
            };
        }];
    }
}());
