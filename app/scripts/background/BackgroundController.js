(function() {

    'use strict';

    angular.module('soundcloudify.background')
        .controller('BackgroundController', BackgroundController);

    function BackgroundController (ContextMenuService, PlaylistService){
        PlaylistService.init();
        ContextMenuService.init();
    };

})();
